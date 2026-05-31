import { useCallback, useState } from 'react';
import { usePostStore } from '@/store/usePostStore';
import { AyrshareService, AyrsharePostResult } from '@/services/ayrshare/ayrshareService';
import { getAyrshareApiKey } from '@/services/storage/secureStorage';
import { Post, SocialPlatform, PostAnalytics, PlatformAnalytics, AnalyticsPeriod } from '@/types';

// ─── Return Type ──────────────────────────────────────────────────────────────

export interface UseAyrshareReturn {
  /** Immediately publish a post to its platforms */
  postNow: (post: Post) => Promise<AyrsharePostResult | null>;
  /** Schedule a post for future publishing */
  schedulePost: (post: Post) => Promise<AyrsharePostResult | null>;
  /** Delete a post by its Ayrshare post ID */
  deletePost: (post: Post) => Promise<boolean>;
  /** Fetch analytics for a specific post */
  getPostAnalytics: (post: Post) => Promise<PostAnalytics | null>;
  /** Fetch profile-level analytics for a platform */
  getProfileAnalytics: (
    platform: SocialPlatform,
    period: AnalyticsPeriod
  ) => Promise<PlatformAnalytics | null>;
  /** Whether an operation is in progress */
  isPosting: boolean;
  /** Error message from the last failed operation */
  error: string | null;
  /** Clear the current error */
  clearError: () => void;
}

// ─── Helper: get service ──────────────────────────────────────────────────────

async function getService(): Promise<AyrshareService | null> {
  const apiKey = await getAyrshareApiKey();
  if (!apiKey) return null;
  return new AyrshareService(apiKey);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAyrshare(): UseAyrshareReturn {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { markPosted, markFailed, updatePost } = usePostStore();

  // ─── Clear Error ─────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  // ─── Post Now ────────────────────────────────────────────────────────────

  const postNow = useCallback(async (post: Post): Promise<AyrsharePostResult | null> => {
    setIsPosting(true);
    setError(null);

    let service: AyrshareService | null;
    try {
      service = await getService();
    } catch {
      setError('Failed to retrieve Ayrshare API key. Check your settings.');
      setIsPosting(false);
      return null;
    }

    if (!service) {
      setError('Ayrshare API key is not configured. Please add it in Settings.');
      setIsPosting(false);
      return null;
    }

    try {
      const result = await service.postNow(post);

      // Check for platform-level errors in the result
      const platformErrors = result.errors ?? [];
      const successfulPlatforms = post.platforms.filter(
        (p) => !platformErrors.some((e) => e.platform === p)
      );

      if (successfulPlatforms.length > 0) {
        // Mark as published in the store
        markPosted(post.id, result.id);
      } else if (platformErrors.length > 0) {
        // All platforms failed
        markFailed(post.id);
        setError(
          `Failed to publish: ${platformErrors.map((e) => `${e.platform}: ${e.message}`).join('; ')}`
        );
      }

      return result;
    } catch (postError) {
      const message =
        postError instanceof Error ? postError.message : 'Failed to publish post. Please try again.';
      setError(message);
      markFailed(post.id);
      return null;
    } finally {
      setIsPosting(false);
    }
  }, [markPosted, markFailed]);

  // ─── Schedule Post ───────────────────────────────────────────────────────

  const schedulePost = useCallback(async (post: Post): Promise<AyrsharePostResult | null> => {
    setIsPosting(true);
    setError(null);

    if (!post.schedule) {
      setError('Cannot schedule post: no schedule provided.');
      setIsPosting(false);
      return null;
    }

    let service: AyrshareService | null;
    try {
      service = await getService();
    } catch {
      setError('Failed to retrieve Ayrshare API key. Check your settings.');
      setIsPosting(false);
      return null;
    }

    if (!service) {
      setError('Ayrshare API key is not configured. Please add it in Settings.');
      setIsPosting(false);
      return null;
    }

    try {
      const result = await service.schedulePost(post);

      // Update the post in the store with the Ayrshare post ID
      updatePost(post.id, {
        ayrsharePostId: result.id,
        status: 'scheduled',
      });

      return result;
    } catch (scheduleError) {
      const message =
        scheduleError instanceof Error
          ? scheduleError.message
          : 'Failed to schedule post. Please try again.';
      setError(message);
      return null;
    } finally {
      setIsPosting(false);
    }
  }, [updatePost]);

  // ─── Delete Post ─────────────────────────────────────────────────────────

  const deletePost = useCallback(async (post: Post): Promise<boolean> => {
    if (!post.ayrsharePostId) {
      // No remote post to delete — just remove from store
      usePostStore.getState().deletePost(post.id);
      return true;
    }

    setIsPosting(true);
    setError(null);

    let service: AyrshareService | null;
    try {
      service = await getService();
    } catch {
      setError('Failed to retrieve Ayrshare API key. Check your settings.');
      setIsPosting(false);
      return false;
    }

    if (!service) {
      setError('Ayrshare API key is not configured. Please add it in Settings.');
      setIsPosting(false);
      return false;
    }

    try {
      await service.deletePost(post.ayrsharePostId);
      // Remove from local store after successful remote delete
      usePostStore.getState().deletePost(post.id);
      return true;
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Failed to delete post.';
      setError(message);
      return false;
    } finally {
      setIsPosting(false);
    }
  }, []);

  // ─── Get Post Analytics ──────────────────────────────────────────────────

  const getPostAnalytics = useCallback(async (post: Post): Promise<PostAnalytics | null> => {
    if (!post.ayrsharePostId) {
      setError('Cannot fetch analytics: post has not been published via Ayrshare.');
      return null;
    }

    let service: AyrshareService | null;
    try {
      service = await getService();
    } catch {
      setError('Failed to retrieve Ayrshare API key. Check your settings.');
      return null;
    }

    if (!service) {
      setError('Ayrshare API key is not configured. Please add it in Settings.');
      return null;
    }

    try {
      const analytics = await service.getPostAnalytics(post.ayrsharePostId);
      // Update post in store with analytics
      updatePost(post.id, { analytics });
      return analytics;
    } catch (analyticsError) {
      const message =
        analyticsError instanceof Error ? analyticsError.message : 'Failed to fetch analytics.';
      setError(message);
      return null;
    }
  }, [updatePost]);

  // ─── Get Profile Analytics ────────────────────────────────────────────────

  const getProfileAnalytics = useCallback(
    async (
      platform: SocialPlatform,
      period: AnalyticsPeriod
    ): Promise<PlatformAnalytics | null> => {
      let service: AyrshareService | null;
      try {
        service = await getService();
      } catch {
        setError('Failed to retrieve Ayrshare API key. Check your settings.');
        return null;
      }

      if (!service) {
        setError('Ayrshare API key is not configured. Please add it in Settings.');
        return null;
      }

      try {
        return await service.getProfileAnalytics(platform, period);
      } catch (analyticsError) {
        const message =
          analyticsError instanceof Error
            ? analyticsError.message
            : 'Failed to fetch profile analytics.';
        setError(message);
        return null;
      }
    },
    []
  );

  return {
    postNow,
    schedulePost,
    deletePost,
    getPostAnalytics,
    getProfileAnalytics,
    isPosting,
    error,
    clearError,
  };
}
