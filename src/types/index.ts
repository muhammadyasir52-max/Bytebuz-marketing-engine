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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday … 6=Saturday

export interface AutomationRule {
  id: string;
  name: string;
  isEnabled: boolean;
  platforms: SocialPlatform[];
  daysOfWeek: DayOfWeek[];
  postTimes: string[]; // 'HH:MM' 24-hour
  contentType: ContentType;
  useOptimalTimes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  postId: string;
  scheduledAt: string;
  platforms: SocialPlatform[];
  status: 'pending' | 'processing' | 'done' | 'failed';
  retryCount: number;
  error?: string;
  addedAt: string;
}

export interface BulkScheduleConfig {
  platforms: SocialPlatform[];
  startDate: string; // ISO date string
  daysOfWeek: DayOfWeek[];
  postTimes: string[]; // 'HH:MM' 24-hour
  useOptimalTimes: boolean;
}

export interface OptimalTimeSlot {
  platform: SocialPlatform;
  dayOfWeek: DayOfWeek;
  time: string; // 'HH:MM'
  label: string;
  engagementScore: number; // 0–100
}

export interface AutomationStats {
  scheduledCount: number;
  postedThisWeek: number;
  activeRules: number;
  queueLength: number;
}

// ─── Meta Ads Types ───────────────────────────────────────────────────────────

export type MetaCampaignObjective =
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_APP_PROMOTION';

export type MetaAdStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';

export type MetaAdCTAType =
  | 'LEARN_MORE'
  | 'SHOP_NOW'
  | 'SIGN_UP'
  | 'BOOK_NOW'
  | 'CONTACT_US'
  | 'DOWNLOAD'
  | 'GET_OFFER'
  | 'WATCH_MORE'
  | 'APPLY_NOW';

export interface MetaAdInsights {
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  cpm?: number;
  conversions?: number;
  roas?: number;
  dateStart?: string;
  dateStop?: string;
}

export interface MetaAdTargeting {
  ageMin: number;
  ageMax: number;
  geoLocations: { countries: string[] };
  interests?: { id: string; name: string }[];
  genders?: number[];
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: MetaCampaignObjective;
  status: MetaAdStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  insights?: MetaAdInsights;
  createdAt: string;
  updatedAt: string;
}

export interface MetaAdSet {
  id: string;
  campaignId: string;
  name: string;
  status: MetaAdStatus;
  dailyBudget: number;
  billingEvent: string;
  optimizationGoal: string;
  targeting: MetaAdTargeting;
  startTime?: string;
  endTime?: string;
  insights?: MetaAdInsights;
}

export interface MetaAdCreative {
  id: string;
  name: string;
  pageId: string;
  primaryText: string;
  headline: string;
  description?: string;
  callToAction: MetaAdCTAType;
  linkUrl: string;
  imageUrl?: string;
  videoId?: string;
}

export interface MetaAd {
  id: string;
  adSetId: string;
  name: string;
  status: MetaAdStatus;
  creative: MetaAdCreative;
  insights?: MetaAdInsights;
  createdAt: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  accountStatus: number;
  businessName?: string;
}

export interface MetaAdCopyVariant {
  headline: string;
  primaryText: string;
  description: string;
  callToAction: MetaAdCTAType;
  whyItWorks: string;
  estimatedCTR: number;
}
