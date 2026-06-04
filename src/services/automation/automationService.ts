import {
  AutomationRule,
  AutomationRun,
  AutomationScheduleConfig,
  BusinessProfile,
  Post,
} from '@/types';
import { ClaudeService } from '@/services/claude/claudeService';
import { AyrshareService } from '@/services/ayrshare/ayrshareService';

// ─── Automation Service ───────────────────────────────────────────────────────

export class AutomationService {
  constructor(
    private claude: ClaudeService,
    private ayrshare: AyrshareService,
  ) {}

  async executeRule(
    rule: AutomationRule,
    businessProfile: BusinessProfile,
    onProgress?: (phase: string) => void,
  ): Promise<AutomationRun> {
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startedAt = new Date().toISOString();

    try {
      onProgress?.('Generating content...');

      const variants = await this.claude.generatePost({
        businessProfile,
        platform: rule.platforms,
        contentType: rule.contentType,
        hookType: rule.hookType,
        framework: rule.framework,
        topic: rule.topic,
      });

      if (!variants.length) throw new Error('No content variants returned from Claude');

      const best = variants.reduce((a, b) =>
        a.estimatedEngagementScore >= b.estimatedEngagementScore ? a : b,
      );

      const postId = `post-auto-${Date.now()}`;
      const post: Post = {
        id: postId,
        businessId: businessProfile.id,
        status: 'draft',
        platforms: rule.platforms,
        contentType: rule.contentType,
        content: {
          hook: best.hook,
          body: best.body,
          callToAction: best.callToAction,
          hashtags: best.hashtags,
          seoKeywords: [],
          platformVariants: best.platformVariants,
        },
        media: [],
        metadata: {
          generatedByAI: true,
          hookType: rule.hookType,
          framework: rule.framework,
          wordCount: best.body.split(' ').length,
          estimatedReadTime: Math.ceil(best.body.split(' ').length / 200),
          claudeModel: 'claude-sonnet-4-6',
        },
        createdAt: startedAt,
        updatedAt: startedAt,
      };

      const generatedContent = {
        hook: best.hook,
        body: best.body,
        callToAction: best.callToAction,
        hashtags: best.hashtags,
        engagementScore: best.estimatedEngagementScore,
      };

      if (!rule.autoPublish) {
        return {
          id: runId,
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'completed',
          platforms: rule.platforms,
          generatedContent,
          results: rule.platforms.map((p) => ({ platform: p, postId, success: true })),
          postId,
          startedAt,
          completedAt: new Date().toISOString(),
        };
      }

      onProgress?.('Publishing to platforms...');

      const result = await this.ayrshare.postNow(post);

      const results = rule.platforms.map((platform) => {
        const err = result.errors?.find((e) => e.platform === platform);
        return {
          platform,
          postId,
          ayrsharePostId: result.postIds?.[platform] ?? result.id,
          success: !err,
          error: err?.message,
        };
      });

      return {
        id: runId,
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'completed',
        platforms: rule.platforms,
        generatedContent,
        results,
        postId,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: runId,
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'failed',
        platforms: rule.platforms,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }
  }

  computeNextRunAt(schedule: AutomationScheduleConfig): string | undefined {
    if (schedule.type === 'immediate') return undefined;
    if (schedule.type === 'once') return schedule.scheduledAt;

    const now = new Date();
    const [h, m] = (schedule.timeOfDay ?? '09:00').split(':').map(Number);
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    switch (schedule.frequency) {
      case 'weekdays':
        while ([0, 6].includes(next.getDay())) next.setDate(next.getDate() + 1);
        break;
      case '3x_week': {
        const mwf = [1, 3, 5];
        while (!mwf.includes(next.getDay())) next.setDate(next.getDate() + 1);
        break;
      }
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay() + 1) % 7 || 7);
        break;
      // daily: already handled above
    }

    return next.toISOString();
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAutomationService(
  claudeService: ClaudeService,
  ayrshareService: AyrshareService,
): AutomationService {
  return new AutomationService(claudeService, ayrshareService);
}
