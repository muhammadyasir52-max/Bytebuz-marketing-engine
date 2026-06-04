import { useCallback, useState } from 'react';
import { useAutomationStore } from '@/store/useAutomationStore';
import { usePostStore } from '@/store/usePostStore';
import { useBusinessStore } from '@/store/useBusinessStore';
import { AutomationService } from '@/services/automation/automationService';
import { ClaudeService } from '@/services/claude/claudeService';
import { AyrshareService } from '@/services/ayrshare/ayrshareService';
import { getClaudeApiKey, getAyrshareApiKey } from '@/services/storage/secureStorage';
import {
  AutomationRule,
  AutomationRun,
  AutomationScheduleConfig,
  ContentFramework,
  ContentType,
  HookType,
  SocialPlatform,
} from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRuleParams {
  name: string;
  platforms: SocialPlatform[];
  contentType: ContentType;
  hookType: HookType;
  framework: ContentFramework;
  topic?: string;
  autoPublish: boolean;
  schedule: AutomationScheduleConfig;
}

export interface UseAutomationReturn {
  rules: AutomationRule[];
  runs: AutomationRun[];
  isRunning: boolean;
  runningRuleId: string | null;
  progressPhase: string;
  error: string | null;
  createRule: (params: CreateRuleParams) => AutomationRule;
  updateRule: (id: string, partial: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  runNow: (ruleId: string) => Promise<AutomationRun | null>;
  clearError: () => void;
}

// ─── Helper: build services ───────────────────────────────────────────────────

async function buildAutomationService(): Promise<AutomationService | null> {
  const [claudeKey, ayrshareKey] = await Promise.all([
    getClaudeApiKey(),
    getAyrshareApiKey(),
  ]);

  if (!claudeKey || !ayrshareKey) return null;

  return new AutomationService(
    new ClaudeService(claudeKey),
    new AyrshareService(ayrshareKey),
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAutomation(): UseAutomationReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
  const [progressPhase, setProgressPhase] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { profile } = useBusinessStore();
  const { addPost } = usePostStore();
  const store = useAutomationStore();

  const clearError = useCallback(() => setError(null), []);

  // ─── Create Rule ──────────────────────────────────────────────────────────

  const createRule = useCallback(
    (params: CreateRuleParams): AutomationRule => {
      const now = new Date().toISOString();
      const service = { computeNextRunAt: (s: AutomationScheduleConfig) => {
        if (s.type === 'immediate') return undefined;
        if (s.type === 'once') return s.scheduledAt;
        const d = new Date();
        const [h, m] = (s.timeOfDay ?? '09:00').split(':').map(Number);
        d.setHours(h, m, 0, 0);
        if (d <= new Date()) d.setDate(d.getDate() + 1);
        return d.toISOString();
      }};

      const rule: AutomationRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...params,
        status: 'active',
        totalRuns: 0,
        successfulRuns: 0,
        nextRunAt: service.computeNextRunAt(params.schedule),
        createdAt: now,
        updatedAt: now,
      };

      store.addRule(rule);
      return rule;
    },
    [store],
  );

  // ─── Run Now ──────────────────────────────────────────────────────────────

  const runNow = useCallback(
    async (ruleId: string): Promise<AutomationRun | null> => {
      const rule = store.rules.find((r) => r.id === ruleId);
      if (!rule) {
        setError('Automation rule not found.');
        return null;
      }

      if (!profile) {
        setError('Business profile not set up. Complete onboarding first.');
        return null;
      }

      setIsRunning(true);
      setRunningRuleId(ruleId);
      setProgressPhase('Starting...');
      setError(null);

      // Create a pending run entry
      const pendingRun: AutomationRun = {
        id: `run-${Date.now()}`,
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'generating',
        platforms: rule.platforms,
        results: [],
        startedAt: new Date().toISOString(),
      };
      store.addRun(pendingRun);

      let service: AutomationService | null;
      try {
        service = await buildAutomationService();
      } catch {
        const errMsg = 'Failed to load API keys. Check Settings.';
        setError(errMsg);
        store.updateRun(pendingRun.id, { status: 'failed', error: errMsg, completedAt: new Date().toISOString() });
        setIsRunning(false);
        setRunningRuleId(null);
        return null;
      }

      if (!service) {
        const errMsg = 'Claude and Ayrshare API keys are required. Add them in Settings.';
        setError(errMsg);
        store.updateRun(pendingRun.id, { status: 'failed', error: errMsg, completedAt: new Date().toISOString() });
        setIsRunning(false);
        setRunningRuleId(null);
        return null;
      }

      try {
        const run = await service.executeRule(rule, profile, (phase) => {
          setProgressPhase(phase);
          if (phase.includes('Publishing')) {
            store.updateRun(pendingRun.id, { status: 'publishing' });
          }
        });

        // Merge the completed run into the store (replacing the pending entry)
        store.updateRun(pendingRun.id, run);

        // If content was generated, add to post store as draft
        if (run.generatedContent && run.postId) {
          addPost({
            id: run.postId,
            businessId: profile.id,
            status: rule.autoPublish ? 'posted' : 'draft',
            platforms: rule.platforms,
            contentType: rule.contentType,
            content: {
              hook: run.generatedContent.hook,
              body: run.generatedContent.body,
              callToAction: run.generatedContent.callToAction,
              hashtags: run.generatedContent.hashtags,
              seoKeywords: [],
            },
            media: [],
            metadata: {
              generatedByAI: true,
              hookType: rule.hookType,
              framework: rule.framework,
              wordCount: run.generatedContent.body.split(' ').length,
              estimatedReadTime: Math.ceil(run.generatedContent.body.split(' ').length / 200),
              claudeModel: 'claude-sonnet-4-6',
            },
            createdAt: run.startedAt,
            updatedAt: run.completedAt ?? run.startedAt,
          });
        }

        // Update rule stats
        const successCount = run.results.filter((r) => r.success).length;
        store.updateRule(ruleId, {
          lastRunAt: run.startedAt,
          nextRunAt: service.computeNextRunAt(rule.schedule),
          totalRuns: rule.totalRuns + 1,
          successfulRuns: rule.successfulRuns + (successCount > 0 ? 1 : 0),
        });

        if (run.status === 'failed') {
          setError(run.error ?? 'Automation run failed.');
        }

        return run;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected error during automation.';
        setError(msg);
        store.updateRun(pendingRun.id, { status: 'failed', error: msg, completedAt: new Date().toISOString() });
        return null;
      } finally {
        setIsRunning(false);
        setRunningRuleId(null);
        setProgressPhase('');
      }
    },
    [store, profile, addPost],
  );

  return {
    rules: store.rules,
    runs: store.runs,
    isRunning,
    runningRuleId,
    progressPhase,
    error,
    createRule,
    updateRule: store.updateRule,
    deleteRule: store.deleteRule,
    toggleRule: store.toggleRule,
    runNow,
    clearError,
  };
}
