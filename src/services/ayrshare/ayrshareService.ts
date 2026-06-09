import {
  Post,
  SocialPlatform,
  PostAnalytics,
  PlatformAnalytics,
  ConnectedPlatform,
  AnalyticsPeriod,
} from '@/types';
import { formatPostForPlatform, formatHashtags, splitIntoThread } from './platformFormatters';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AyrsharePostResult {
  id: string;
  status: string;
  errors?: { platform: string; message: string }[];
  postIds?: Record<string, string>;
}

interface AyrsharePostPayload {
  post: string;
  platforms: string[];
  scheduleDate?: string;
  mediaUrls?: string[];
  twitterOptions?: {
    tweetIds?: string[];
    thread?: boolean;
  };
  instagramOptions?: {
    type?: 'feed' | 'story' | 'reel';
    mediaUrls?: string[];
  };
  youTubeOptions?: {
    title?: string;
    visibility?: 'public' | 'private' | 'unlisted';
  };
  linkedInOptions?: {
    visibility?: 'PUBLIC' | 'CONNECTIONS';
  };
}

interface AyrshareAPIResponse {
  id?: string;
  status?: string;
  postIds?: Record<string, string>;
  errors?: { platform: string; message: string }[];
  message?: string;
  // Analytics response shapes
  analytics?: Record<string, unknown>;
  // Connected platforms response
  profiles?: AyrshareProfileResponse[];
}

interface AyrshareProfileResponse {
  platform: string;
  handle?: string;
  userName?: string;
  profileURL?: string;
  profilePictureURL?: string;
  connectedAt?: string;
  active?: boolean;
  followerCount?: number;
  followers?: number;
}

interface AyrshareAnalyticsResponse {
  analytics?: {
    [platform: string]: {
      followers?: number;
      followersGrowth?: number;
      impressions?: number;
      reach?: number;
      engagements?: number;
      engagementRate?: number;
      topPosts?: Array<{
        id?: string;
        postId?: string;
        content?: string;
        text?: string;
        engagementRate?: number;
        impressions?: number;
        likes?: number;
      }>;
      bestTimes?: string[];
    };
  };
  // Post-level analytics
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  engagementRate?: number;
}

// ─── Ayrshare Service ─────────────────────────────────────────────────────────

export class AyrshareService {
  private apiKey: string;
  private readonly baseUrl = 'https://app.ayrshare.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ─── Core Fetch Wrapper ─────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (networkError) {
      throw new Error(
        `Ayrshare network error: ${networkError instanceof Error ? networkError.message : 'Connection failed'}`
      );
    }

    let data: T;
    try {
      data = (await response.json()) as T;
    } catch {
      throw new Error(`Ayrshare API returned non-JSON response (status: ${response.status})`);
    }

    if (!response.ok) {
      const errData = data as AyrshareAPIResponse;
      const message = errData?.message ?? `Request failed with status ${response.status}`;
      throw new Error(`Ayrshare API error ${response.status}: ${message}`);
    }

    return data;
  }

  // ─── Build Post Payload ─────────────────────────────────────────────────

  private buildPostPayload(post: Post, isScheduled: boolean): AyrsharePostPayload {
    const platforms = post.platforms.map((p) => this.mapPlatformName(p));

    // Use the first platform for the primary formatted content
    // Ayrshare accepts one `post` string and applies it to all platforms,
    // with per-platform overrides via options objects
    const primaryPlatform = post.platforms[0];
    const formattedContent = formatPostForPlatform(post, primaryPlatform);

    const payload: AyrsharePostPayload = {
      post: formattedContent,
      platforms,
    };

    // Add schedule date for scheduled posts
    if (isScheduled && post.schedule) {
      payload.scheduleDate = new Date(post.schedule.scheduledAt).toISOString();
    }

    // Add media URLs if present
    const mediaUrls = post.media?.map((m) => m.uri) ?? [];
    if (mediaUrls.length > 0) {
      payload.mediaUrls = mediaUrls;
    }

    // Twitter thread support
    if (post.platforms.includes('twitter')) {
      const twitterContent = formatPostForPlatform(post, 'twitter');
      const fullContent = `${post.content.hook}\n\n${post.content.body}\n\n${post.content.callToAction}`;
      if (fullContent.length > 280) {
        // Full content needs threading — split it
        const threadTweets = splitIntoThread(fullContent, 280);
        if (threadTweets.length > 1) {
          payload.twitterOptions = {
            thread: true,
          };
          // Override post with the first tweet of the thread
          payload.post = threadTweets[0];
        }
      }
      // Use twitter-formatted version for single tweet
      if (!payload.twitterOptions?.thread) {
        payload.post = twitterContent;
      }
    }

    // Instagram options
    if (post.platforms.includes('instagram')) {
      const hasVideo =
        mediaUrls.some((url) =>
          /\.(mp4|mov|avi|webm)(\?|$)/i.test(url)
        );

      payload.instagramOptions = {
        type: hasVideo ? 'reel' : 'feed',
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      };
    }

    // YouTube options
    if (post.platforms.includes('youtube')) {
      payload.youTubeOptions = {
        title: post.content.hook.slice(0, 100), // Use hook as video title (truncated)
        visibility: 'public',
      };
    }

    // LinkedIn options
    if (post.platforms.includes('linkedin')) {
      payload.linkedInOptions = {
        visibility: 'PUBLIC',
      };
    }

    return payload;
  }

  // ─── Map Platform Name ──────────────────────────────────────────────────

  private mapPlatformName(platform: SocialPlatform): string {
    const mapping: Record<SocialPlatform, string> = {
      instagram: 'instagram',
      facebook: 'facebook',
      linkedin: 'linkedin',
      twitter: 'twitter',
      tiktok: 'tiktok',
      youtube: 'youtube',
    };
    return mapping[platform] ?? platform;
  }

  // ─── Parse Post Result ──────────────────────────────────────────────────

  private parsePostResult(data: AyrshareAPIResponse): AyrsharePostResult {
    return {
      id: data.id ?? `ayrshare-${Date.now()}`,
      status: data.status ?? 'unknown',
      errors: data.errors,
      postIds: data.postIds,
    };
  }

  // ─── Post Now ───────────────────────────────────────────────────────────

  async postNow(post: Post): Promise<AyrsharePostResult> {
    const payload = this.buildPostPayload(post, false);
    const data = await this.request<AyrshareAPIResponse>('/post', 'POST', payload);
    return this.parsePostResult(data);
  }

  // ─── Schedule Post ──────────────────────────────────────────────────────

  async schedulePost(post: Post): Promise<AyrsharePostResult> {
    if (!post.schedule) {
      throw new Error('Cannot schedule post: no schedule provided');
    }

    const scheduledDate = new Date(post.schedule.scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new Error('Cannot schedule post: scheduled time must be in the future');
    }

    const payload = this.buildPostPayload(post, true);
    const data = await this.request<AyrshareAPIResponse>('/post', 'POST', payload);
    return this.parsePostResult(data);
  }

  // ─── Delete Post ────────────────────────────────────────────────────────

  async deletePost(ayrsharePostId: string): Promise<void> {
    await this.request<AyrshareAPIResponse>(`/post/${ayrsharePostId}`, 'DELETE');
  }

  // ─── Get Connected Platforms ────────────────────────────────────────────

  async getConnectedPlatforms(): Promise<ConnectedPlatform[]> {
    const data = await this.request<{ profiles?: AyrshareProfileResponse[] }>(
      '/user',
      'GET'
    );

    if (!data.profiles || !Array.isArray(data.profiles)) {
      return [];
    }

    return data.profiles
      .filter((profile) => profile.platform)
      .map((profile) => ({
        platform: profile.platform.toLowerCase() as SocialPlatform,
        handle: profile.handle ?? profile.userName ?? '',
        profileUrl: profile.profileURL ?? '',
        profileImageUrl: profile.profilePictureURL,
        connectedAt: profile.connectedAt ?? new Date().toISOString(),
        status: 'active' as const,
        followerCount: profile.followerCount ?? profile.followers,
      }));
  }

  // ─── Get Social Auth URL ────────────────────────────────────────────────

  async getSocialAuthUrl(platform: SocialPlatform): Promise<string> {
    const platformName = this.mapPlatformName(platform);
    const data = await this.request<{ url?: string; authUrl?: string }>(
      `/social/auth?platform=${platformName}`,
      'GET'
    );

    const url = data.url ?? data.authUrl;
    if (!url) {
      throw new Error(`No auth URL returned for platform: ${platform}`);
    }
    return url;
  }

  // ─── Disconnect Platform ────────────────────────────────────────────────

  async disconnectPlatform(platform: SocialPlatform): Promise<void> {
    const platformName = this.mapPlatformName(platform);
    await this.request<AyrshareAPIResponse>(`/social/disconnect`, 'POST', {
      platform: platformName,
    });
  }

  // ─── Get Post Analytics ─────────────────────────────────────────────────

  async getPostAnalytics(ayrsharePostId: string): Promise<PostAnalytics> {
    const data = await this.request<AyrshareAnalyticsResponse>(
      `/analytics/post/${ayrsharePostId}`,
      'GET'
    );

    return {
      postId: ayrsharePostId,
      platform: 'instagram' as SocialPlatform, // Will be determined from post data in real integration
      impressions: data.impressions ?? 0,
      reach: data.reach ?? 0,
      likes: data.likes ?? 0,
      comments: data.comments ?? 0,
      shares: data.shares ?? 0,
      saves: data.saves ?? 0,
      clicks: data.clicks ?? 0,
      engagementRate: data.engagementRate ?? 0,
      postedAt: new Date().toISOString(),
    };
  }

  // ─── Get Profile Analytics ──────────────────────────────────────────────

  async getProfileAnalytics(
    platform: SocialPlatform,
    period: AnalyticsPeriod
  ): Promise<PlatformAnalytics> {
    const platformName = this.mapPlatformName(platform);
    const periodDays = parseInt(period.replace('d', ''), 10);

    const data = await this.request<AyrshareAnalyticsResponse>(
      `/analytics/social?platforms=${platformName}&days=${periodDays}`,
      'GET'
    );

    const platformData = (data.analytics?.[platformName] as {
      followers?: number;
      followersGrowth?: number;
      impressions?: number;
      reach?: number;
      engagements?: number;
      engagementRate?: number;
      topPosts?: Array<{
        id?: string;
        postId?: string;
        content?: string;
        text?: string;
        engagementRate?: number;
        impressions?: number;
        likes?: number;
      }>;
      bestTimes?: string[];
    }) ?? {};

    const topPosts = (platformData.topPosts ?? []).map((p) => ({
      postId: p.id ?? p.postId ?? '',
      platform: platform as SocialPlatform,
      impressions: p.impressions ?? 0,
      reach: 0,
      likes: p.likes ?? 0,
      comments: 0,
      shares: 0,
      engagementRate: p.engagementRate ?? 0,
      postedAt: new Date().toISOString(),
    }));

    return {
      platform,
      period,
      metrics: {
        followers: platformData.followers ?? 0,
        followerGrowth: platformData.followersGrowth ?? 0,
        reach: platformData.reach ?? 0,
        impressions: platformData.impressions ?? 0,
        engagementRate: platformData.engagementRate ?? 0,
        totalEngagements: platformData.engagements ?? 0,
        profileVisits: 0,
        linkClicks: undefined,
      },
      topPosts,
      trends: [],
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // ─── Upload Media ───────────────────────────────────────────────────────

  async uploadMedia(uri: string, type: 'image' | 'video'): Promise<string> {
    // Ayrshare media upload: send the URI and get back a CDN URL
    const data = await this.request<{ url?: string; mediaUrl?: string; id?: string }>(
      '/media/upload',
      'POST',
      { url: uri, type }
    );

    const uploadedUrl = data.url ?? data.mediaUrl;
    if (!uploadedUrl) {
      throw new Error(`Media upload failed: no URL returned for ${type}`);
    }
    return uploadedUrl;
  }

  // ─── Validate API Key ───────────────────────────────────────────────────

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// ─── Factory Function ─────────────────────────────────────────────────────────

export function createAyrshareService(apiKey: string): AyrshareService {
  return new AyrshareService(apiKey);
}
