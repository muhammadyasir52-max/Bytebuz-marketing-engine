import { useCallback, useState } from 'react';
import { Post, BulkScheduleConfig, AutomationRule, QueueItem } from '@/types';
import { usePostStore } from '@/store/usePostStore';
import { useAutomationStore } from '@/store/useAutomationStore';
import { AyrshareService } from '@/services/ayrshare/ayrshareService';
import { getAyrshareApiKey } from '@/services/storage/secureStorage';
import {
  bulkAssignSchedules,
  buildQueueItem,
  processQueueItem,
  makeDefaultRule,
  ruleNextDates,
} from '@/services/automation/automationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getService(): Promise<AyrshareService | null> {
  const key = await getAyrshareApiKey();
  return key ? new AyrshareService(key) : null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAutomationReturn {
  isWorking: boolean;
  error: string | null;
  clearError: () => void;

  // Bulk scheduling
  bulkSchedule: (drafts: Post[], config: BulkScheduleConfig) => Promise<void>;

  // Queue operations
  addToQueue: (post: Post) => void;
  removeFromQueue: (queueItemId: string) => void;
  publishNow: (queueItemId: string) => Promise<boolean>;
  processAll: () => Promise<{ succeeded: number; failed: number }>;

  // Rule management
  createRule: (name: string, partial?: Partial<AutomationRule>) => AutomationRule;
  toggleRule: (ruleId: string) => void;
  deleteRule: (ruleId: string) => void;
  previewRuleDates: (rule: AutomationRule, count?: number) => string[];
}

export function useAutomation(): UseAutomationReturn {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { drafts, addPost, updatePost, markPosted, markFailed } = usePostStore();
  const {
    enqueue,
    enqueueBatch,
    removeQueueItem,
    updateQueueItem,
    queue,
    addRule,
    toggleRule: storeToggleRule,
    deleteRule: storeDeleteRule,
    refreshStats,
  } = useAutomationStore();

  const clearError = useCallback(() => setError(null), []);

  // ─── Bulk Schedule ─────────────────────────────────────────────────────

  const bulkSchedule = useCallback(
    async (posts: Post[], config: BulkScheduleConfig) => {
      if (posts.length === 0) return;
      setIsWorking(true);
      setError(null);
      try {
        const updated = bulkAssignSchedules(posts, config);
        const queueItems: QueueItem[] = [];

        for (const p of updated) {
          updatePost(p.id, {
            status: 'scheduled',
            platforms: p.platforms,
            schedule: p.schedule,
          });
          queueItems.push(buildQueueItem(p));
        }

        enqueueBatch(queueItems);
        refreshStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bulk schedule failed');
      } finally {
        setIsWorking(false);
      }
    },
    [updatePost, enqueueBatch, refreshStats]
  );

  // ─── Add to Queue ──────────────────────────────────────────────────────

  const addToQueue = useCallback(
    (post: Post) => {
      const item = buildQueueItem(post);
      enqueue(item);
      updatePost(post.id, { status: 'scheduled' });
    },
    [enqueue, updatePost]
  );

  // ─── Remove from Queue ─────────────────────────────────────────────────

  const removeFromQueue = useCallback(
    (queueItemId: string) => {
      removeQueueItem(queueItemId);
    },
    [removeQueueItem]
  );

  // ─── Publish Now ───────────────────────────────────────────────────────

  const publishNow = useCallback(
    async (queueItemId: string): Promise<boolean> => {
      const item = queue.find((q) => q.id === queueItemId);
      if (!item) {
        setError('Queue item not found');
        return false;
      }

      const allPosts = usePostStore.getState();
      const post = allPosts.getPostById(item.postId);
      if (!post) {
        setError('Post not found for this queue item');
        return false;
      }

      setIsWorking(true);
      setError(null);
      updateQueueItem(queueItemId, { status: 'processing' });

      try {
        const service = await getService();
        if (!service) {
          const msg = 'Ayrshare API key not configured. Check Settings.';
          setError(msg);
          updateQueueItem(queueItemId, { status: 'failed', error: msg });
          return false;
        }

        const result = await processQueueItem(item, post, service);

        if (result.success) {
          updateQueueItem(queueItemId, { status: 'done' });
          markPosted(post.id, result.ayrsharePostId);
          return true;
        } else {
          const retries = item.retryCount + 1;
          updateQueueItem(queueItemId, {
            status: 'failed',
            error: result.error,
            retryCount: retries,
          });
          markFailed(post.id);
          setError(result.error ?? 'Publish failed');
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected error';
        updateQueueItem(queueItemId, { status: 'failed', error: msg });
        setError(msg);
        return false;
      } finally {
        setIsWorking(false);
      }
    },
    [queue, updateQueueItem, markPosted, markFailed]
  );

  // ─── Process All Pending ───────────────────────────────────────────────

  const processAll = useCallback(async (): Promise<{ succeeded: number; failed: number }> => {
    const pending = queue.filter((q) => q.status === 'pending');
    if (pending.length === 0) return { succeeded: 0, failed: 0 };

    setIsWorking(true);
    setError(null);
    let succeeded = 0;
    let failed = 0;

    const service = await getService();
    if (!service) {
      setError('Ayrshare API key not configured. Check Settings.');
      setIsWorking(false);
      return { succeeded: 0, failed: pending.length };
    }

    for (const item of pending) {
      const post = usePostStore.getState().getPostById(item.postId);
      if (!post) {
        failed++;
        updateQueueItem(item.id, { status: 'failed', error: 'Post not found' });
        continue;
      }

      updateQueueItem(item.id, { status: 'processing' });
      const result = await processQueueItem(item, post, service);

      if (result.success) {
        succeeded++;
        updateQueueItem(item.id, { status: 'done' });
        markPosted(post.id, result.ayrsharePostId);
      } else {
        failed++;
        updateQueueItem(item.id, {
          status: 'failed',
          error: result.error,
          retryCount: item.retryCount + 1,
        });
        markFailed(post.id);
      }
    }

    refreshStats();
    setIsWorking(false);
    return { succeeded, failed };
  }, [queue, updateQueueItem, markPosted, markFailed, refreshStats]);

  // ─── Create Rule ───────────────────────────────────────────────────────

  const createRule = useCallback(
    (name: string, partial?: Partial<AutomationRule>): AutomationRule => {
      const allPlatforms = usePostStore.getState().drafts.flatMap((p) => p.platforms);
      const platforms =
        partial?.platforms ??
        (allPlatforms.length > 0 ? [...new Set(allPlatforms)].slice(0, 3) : ['instagram' as const]);
      const rule = { ...makeDefaultRule(name, platforms), ...partial };
      addRule(rule);
      return rule;
    },
    [addRule]
  );

  // ─── Toggle / Delete Rule ──────────────────────────────────────────────

  const toggleRule = useCallback((ruleId: string) => storeToggleRule(ruleId), [storeToggleRule]);
  const deleteRule = useCallback((ruleId: string) => storeDeleteRule(ruleId), [storeDeleteRule]);

  // ─── Preview Rule Dates ────────────────────────────────────────────────

  const previewRuleDates = useCallback(
    (rule: AutomationRule, count = 5): string[] => ruleNextDates(rule, count),
    []
  );

  return {
    isWorking,
    error,
    clearError,
    bulkSchedule,
    addToQueue,
    removeFromQueue,
    publishNow,
    processAll,
    createRule,
    toggleRule,
    deleteRule,
    previewRuleDates,
  };
}
