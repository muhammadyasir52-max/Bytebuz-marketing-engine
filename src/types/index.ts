// ─── Platform Types ────────────────────────────────────────────────────────────

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'tiktok'
  | 'youtube';

export type ContentType =
  | 'text_post'
  | 'carousel'
  | 'image_post'
  | 'video_script'
  | 'story'
  | 'thread'
  | 'seo_article'
  | 'reel_script';

export type HookType =
  | 'controversial_opinion'
  | 'surprising_stat'
  | 'relatable_story'
  | 'how_to'
  | 'listicle'
  | 'question'
  | 'bold_claim'
  | 'pattern_interrupt';

export type ContentFramework = 'AIDA' | 'PAS' | 'BAB' | 'PPPP';

export type PostStatus =
  | 'draft'
  | 'pending_review'
  | 'scheduled'
  | 'posted'
  | 'failed';

export type PostFrequency = 'daily' | '3x_week' | '2x_week' | 'weekly';

export type BrandTone =
  | 'professional'
  | 'casual'
  | 'witty'
  | 'bold'
  | 'empathetic'
  | 'authoritative'
  | 'inspirational';

export type EmojiUsage = 'heavy' | 'moderate' | 'minimal' | 'none';

export type MarketingGoalType =
  | 'brand_awareness'
  | 'lead_generation'
  | 'sales'
  | 'community'
  | 'traffic';

export type AnalyticsPeriod = '7d' | '30d' | '90d';

// ─── Business Profile Types ───────────────────────────────────────────────────

export interface AudienceProfile {
  primaryDemographic: string;
  painPoints: string[];
  desires: string[];
  jobToBeDone: string;
}

export interface BrandVoice {
  tone: BrandTone[];
  writingStyle: string;
  wordsToAvoid: string[];
  exampleContent: string[];
  emojiUsage: EmojiUsage;
}

export interface Competitor {
  handle: string;
  platform: SocialPlatform;
  notes: string;
}

export interface MarketingGoal {
  type: MarketingGoalType;
  description: string;
  kpiTarget?: string;
}

export interface ContentPreferences {
  preferredPostTimes: Record<SocialPlatform, string[]>;
  postFrequency: PostFrequency;
  contentMix: Partial<Record<ContentType, number>>;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  niche: string;
  description: string;
  targetAudience: AudienceProfile;
  brandVoice: BrandVoice;
  competitors: Competitor[];
  goals: MarketingGoal[];
  activePlatforms: SocialPlatform[];
  contentPreferences: ContentPreferences;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
  isOnboarded: boolean;
}

// ─── Post Types ───────────────────────────────────────────────────────────────

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video';
  uri: string;
  width?: number;
  height?: number;
  prompt?: string;
}

export interface PostContent {
  body: string;
  hashtags: string[];
  hook: string;
  callToAction: string;
  altText?: string;
  videoScript?: string;
  seoKeywords: string[];
  platformVariants?: Partial<Record<SocialPlatform, Omit<PostContent, 'platformVariants'>>>;
}

export interface PostSchedule {
  scheduledAt: string;
  timezone: string;
  notificationId?: string;
}

export interface PostMetadata {
  generatedByAI: boolean;
  hookType: HookType;
  framework: ContentFramework;
  wordCount: number;
  estimatedReadTime: number;
  claudeModel: string;
}

export interface ScriptScene {
  duration: number;
  visualDescription: string;
  voiceover: string;
  onScreenText?: string;
}

export interface VideoScript {
  hook: string;
  scenes: ScriptScene[];
  cta: string;
  totalDurationSeconds: number;
}

export interface Post {
  id: string;
  businessId: string;
  status: PostStatus;
  platforms: SocialPlatform[];
  contentType: ContentType;
  content: PostContent;
  media: MediaAttachment[];
  schedule?: PostSchedule;
  metadata: PostMetadata;
  ayrsharePostId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Generated Content Types ──────────────────────────────────────────────────

export interface GeneratedVariant {
  hook: string;
  body: string;
  hashtags: string[];
  callToAction: string;
  estimatedEngagementScore: number;
  whyItWorks: string;
  platformVariants?: Partial<Record<SocialPlatform, { body: string; hashtags: string[] }>>;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface PostAnalytics {
  postId: string;
  ayrsharePostId?: string;
  platform: SocialPlatform;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  clicks?: number;
  videoViews?: number;
  postedAt: string;
}

export interface PlatformMetrics {
  followers: number;
  followerGrowth: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  totalEngagements: number;
  profileVisits: number;
  linkClicks?: number;
}

export interface MetricTrend {
  metric: string;
  dataPoints: { date: string; value: number }[];
}

export interface PlatformAnalytics {
  platform: SocialPlatform;
  period: AnalyticsPeriod;
  metrics: PlatformMetrics;
  topPosts: PostAnalytics[];
  trends: MetricTrend[];
  lastSyncedAt: string;
}

// ─── Connected Platform Types ─────────────────────────────────────────────────

export interface ConnectedPlatform {
  platform: SocialPlatform;
  handle: string;
  profileUrl: string;
  connectedAt: string;
  status: 'active' | 'expired' | 'error';
}

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface AppSettings {
  /** API keys stored in SecureStore — these are references/flags only */
  claudeApiKey: string;
  ayrshareApiKey: string;
  notificationsEnabled: boolean;
  reminderLeadTimeMinutes: number;
  dailyDigestEnabled: boolean;
  defaultFramework: ContentFramework;
  defaultHookType: HookType;
  autoHashtags: boolean;
  language: string;
}

// ─── Weekly Strategy Types ────────────────────────────────────────────────────

export interface StrategyAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface StrategyInsight {
  id: string;
  insight: string;
  recommendation: string;
}

export interface ContentCalendarItem {
  day: string;
  platform: SocialPlatform;
  contentType: ContentType;
  topic: string;
  suggestedTime: string;
}

export interface WeeklyStrategy {
  focusTheme: string;
  calendarItems: ContentCalendarItem[];
  insights: StrategyInsight[];
  actionItems: StrategyAction[];
  boldMove: string;
  generatedAt: string;
}

// ─── Automation Types ─────────────────────────────────────────────────────────

export type AutomationRuleType =
  | 'optimal_timing'
  | 'recurring'
  | 'content_recycling';

export interface AutomationRule {
  id: string;
  name: string;
  type: AutomationRuleType;
  description: string;
  platforms: SocialPlatform[];
  frequency: PostFrequency;
  postTimes: string[];
  isActive: boolean;
  lastTriggeredAt?: string;
  nextTriggerAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkScheduleOptions {
  platforms: SocialPlatform[];
  startDate: string;
  endDate: string;
  frequency: PostFrequency;
  useOptimalTimes: boolean;
  customTimes?: Partial<Record<SocialPlatform, string[]>>;
}

export interface ScheduledSlot {
  date: string;
  time: string;
  platform: SocialPlatform;
  scheduledAt: string;
}
