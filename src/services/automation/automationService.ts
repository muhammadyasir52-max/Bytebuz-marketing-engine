import { Post, SocialPlatform, QueueItem, BulkScheduleConfig, AutomationRule, DayOfWeek } from '@/types';
import { AyrshareService } from '@/services/ayrshare/ayrshareService';
import { getNextOptimalDates, getNextManualDates } from './optimalTimingService';

// ─── Bulk Scheduler ───────────────────────────────────────────────────────────

/**
 * Assigns scheduled timestamps to an ordered list of drafts.
 * Returns updated Post objects (not persisted — caller must update the store).
 */
export function bulkAssignSchedules(
  posts: Post[],
  config: BulkScheduleConfig
): Post[] {
  const { platforms, daysOfWeek, postTimes, useOptimalTimes, startDate } = config;
  const from = new Date(startDate);
  const count = posts.length;

  // Derive the primary platform for optimal time lookup
  const primaryPlatform: SocialPlatform = platforms[0] ?? 'instagram';

  const slots = useOptimalTimes
    ? getNextOptimalDates(primaryPlatform, count, from)
    : getNextManualDates(daysOfWeek, postTimes, count, from);

  return posts.map((post, i) => {
    const scheduledAt = slots[i] ?? new Date(Date.now() + (i + 1) * 3_600_000).toISOString();
    return {
      ...post,
      platforms: platforms.length > 0 ? platforms : post.platforms,
      status: 'scheduled' as const,
      schedule: {
        scheduledAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      updatedAt: new Date().toISOString(),
    };
  });
}

// ─── Queue Item Builder ───────────────────────────────────────────────────────

export function buildQueueItem(post: Post): QueueItem {
  return {
    id: `q-${post.id}-${Date.now()}`,
    postId: post.id,
    scheduledAt: post.schedule?.scheduledAt ?? new Date().toISOString(),
    platforms: post.platforms,
    status: 'pending',
    retryCount: 0,
    addedAt: new Date().toISOString(),
  };
}

// ─── Queue Processor ──────────────────────────────────────────────────────────

export interface ProcessResult {
  queueItemId: string;
  success: boolean;
  ayrsharePostId?: string;
  error?: string;
}

/**
 * Attempts to publish a single queue item immediately via Ayrshare.
 * Returns a ProcessResult — does NOT mutate any store.
 */
export async function processQueueItem(
  queueItem: QueueItem,
  post: Post,
  service: AyrshareService
): Promise<ProcessResult> {
  try {
    const result = await service.postNow(post);
    const platformErrors = result.errors ?? [];
    if (platformErrors.length > 0 && result.status !== 'success') {
      return {
        queueItemId: queueItem.id,
        success: false,
        error: platformErrors.map((e) => `${e.platform}: ${e.message}`).join('; '),
      };
    }
    return {
      queueItemId: queueItem.id,
      success: true,
      ayrsharePostId: result.id,
    };
  } catch (err) {
    return {
      queueItemId: queueItem.id,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ─── Automation Rule Helpers ──────────────────────────────────────────────────

const DAYS: Record<string, DayOfWeek> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export function ruleNextDates(rule: AutomationRule, count: number): string[] {
  if (!rule.isEnabled) return [];
  const from = new Date();
  if (rule.useOptimalTimes) {
    const primary = rule.platforms[0] ?? 'instagram';
    return getNextOptimalDates(primary, count, from);
  }
  return getNextManualDates(rule.daysOfWeek, rule.postTimes, count, from);
}

export function makeDefaultRule(
  name: string,
  platforms: SocialPlatform[]
): AutomationRule {
  const now = new Date().toISOString();
  return {
    id: `rule-${Date.now()}`,
    name,
    isEnabled: true,
    platforms,
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    postTimes: ['09:00', '18:00'],
    contentType: 'text_post',
    useOptimalTimes: true,
    createdAt: now,
    updatedAt: now,
  };
}
