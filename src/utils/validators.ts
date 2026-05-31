import { z } from 'zod';
import {
  SocialPlatform,
  ContentType,
  HookType,
  ContentFramework,
  PostStatus,
  AnalyticsPeriod,
} from '@/types';

// ─── Reusable Field Validators ────────────────────────────────────────────────

const socialPlatformEnum = z.enum([
  'instagram',
  'facebook',
  'linkedin',
  'twitter',
  'tiktok',
  'youtube',
] as const);

const contentTypeEnum = z.enum([
  'educational',
  'promotional',
  'storytelling',
  'engagement',
  'behind_the_scenes',
  'user_generated',
  'case_study',
  'thought_leadership',
] as const);

const hookTypeEnum = z.enum([
  'question',
  'bold_statement',
  'statistic',
  'story_open',
  'contrarian',
  'how_to',
  'list',
  'secret',
] as const);

const contentFrameworkEnum = z.enum(['AIDA', 'PAS', 'BAB', 'PPPP'] as const);

const postStatusEnum = z.enum([
  'draft',
  'scheduled',
  'published',
  'failed',
  'deleted',
] as const);

const analyticsPeriodEnum = z.enum(['7d', '14d', '30d', '90d'] as const);

// ─── Business Profile Schema ──────────────────────────────────────────────────

export const targetAudienceSchema = z.object({
  demographic: z.string().min(1, 'Demographic description is required').max(500),
  painPoints: z
    .array(z.string().min(1).max(200))
    .min(1, 'At least one pain point is required')
    .max(10),
  desires: z.array(z.string().min(1).max(200)).min(1, 'At least one desire is required').max(10),
  jobToBeDone: z.string().min(1, 'Job to be done is required').max(500),
  ageRange: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  interests: z.array(z.string().max(100)).max(20).optional(),
});

export const brandVoiceSchema = z.object({
  tone: z.array(z.string().min(1).max(50)).min(1, 'At least one tone descriptor is required').max(10),
  writingStyle: z.string().min(1, 'Writing style is required').max(500),
  wordsToAvoid: z.array(z.string().max(50)).max(50),
  emojiUsage: z.enum(['none', 'minimal', 'moderate', 'heavy']),
  exampleContent: z.array(z.string().max(2000)).max(5).optional(),
  personalityTraits: z.array(z.string().max(50)).max(10).optional(),
});

export const competitorSchema = z.object({
  name: z.string().min(1, 'Competitor name is required').max(100),
  handle: z.string().max(100).optional(),
  differentiationNotes: z.string().min(1, 'Differentiation notes are required').max(500),
  weaknesses: z.array(z.string().max(200)).max(10).optional(),
});

export const businessGoalSchema = z.object({
  type: z.enum([
    'brand_awareness',
    'lead_generation',
    'sales',
    'community',
    'traffic',
    'engagement',
  ]),
  kpi: z.string().min(1, 'KPI description is required').max(300),
  target: z.union([z.string().max(100), z.number()]).optional(),
  timeframe: z.string().max(100).optional(),
});

export const businessProfileSchema = z.object({
  id: z.string().min(1),
  businessName: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be under 100 characters'),
  niche: z
    .string()
    .min(1, 'Niche/industry is required')
    .max(100, 'Niche must be under 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be under 1000 characters'),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
  targetAudience: targetAudienceSchema,
  brandVoice: brandVoiceSchema,
  competitors: z.array(competitorSchema).max(10),
  goals: z.array(businessGoalSchema).min(1, 'At least one business goal is required').max(6),
  activePlatforms: z
    .array(socialPlatformEnum)
    .min(1, 'At least one active platform is required')
    .max(6),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ─── Post Content Schema ──────────────────────────────────────────────────────

export const postContentSchema = z.object({
  hook: z.string().min(1, 'Hook is required').max(500, 'Hook must be under 500 characters'),
  body: z.string().min(1, 'Body content is required').max(10000, 'Body is too long'),
  cta: z.string().min(1, 'Call to action is required').max(500),
  hashtags: z.array(z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid hashtag format')).max(30),
  imagePrompt: z.string().max(2000).optional(),
  mediaUrls: z.array(z.string().url('Media URL must be valid')).max(10).optional(),
});

export const postScheduleSchema = z.object({
  scheduledAt: z.string().datetime('Schedule time must be a valid ISO datetime'),
  timezone: z.string().min(1, 'Timezone is required'),
  autoPublish: z.boolean(),
});

export const postSchema = z.object({
  id: z.string().min(1),
  businessProfileId: z.string().min(1),
  platforms: z
    .array(socialPlatformEnum)
    .min(1, 'At least one platform is required')
    .max(6),
  content: postContentSchema,
  schedule: postScheduleSchema.optional(),
  status: postStatusEnum,
  ayrsharePostId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
});

// ─── API Key Schema ───────────────────────────────────────────────────────────

export const apiKeySchema = z.object({
  key: z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key is too long'),
});

export const claudeApiKeySchema = z.object({
  key: z
    .string()
    .min(10, 'Claude API key must be at least 10 characters')
    .regex(/^sk-ant-/, 'Claude API key must start with "sk-ant-"'),
});

export const ayrshareApiKeySchema = z.object({
  key: z
    .string()
    .min(10, 'Ayrshare API key must be at least 10 characters')
    .max(500),
});

// ─── Generation Params Schema ─────────────────────────────────────────────────

export const generatePostParamsSchema = z.object({
  platform: z.union([socialPlatformEnum, z.array(socialPlatformEnum).min(1)]),
  contentType: contentTypeEnum,
  hookType: hookTypeEnum,
  framework: contentFrameworkEnum,
  topic: z.string().max(500).optional(),
  wordCount: z.number().int().min(50).max(5000).optional(),
  seoKeywords: z.array(z.string().max(100)).max(20).optional(),
});

// ─── Standalone Validator Functions ──────────────────────────────────────────

/**
 * Validates a URL string.
 * Returns true if the URL is valid (http or https).
 */
export function validateUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates a social media handle.
 * Accepts handles with or without the @ prefix.
 * Rules: 1–50 chars, alphanumeric + underscores + dots (no spaces, no special chars).
 */
export function validateHandle(handle: string): boolean {
  if (!handle || handle.trim().length === 0) return false;

  // Strip @ prefix if present
  const stripped = handle.startsWith('@') ? handle.slice(1) : handle;

  if (stripped.length === 0 || stripped.length > 50) return false;

  // Allow alphanumeric, underscores, dots, hyphens (most platforms)
  return /^[a-zA-Z0-9._-]+$/.test(stripped);
}

/**
 * Validates a Claude API key format.
 * Returns true if the key matches the expected pattern.
 */
export function validateClaudeApiKey(key: string): boolean {
  if (!key || key.trim().length < 10) return false;
  return key.startsWith('sk-ant-');
}

/**
 * Validates a hashtag string (without the # symbol).
 * Returns true if valid.
 */
export function validateHashtag(tag: string): boolean {
  if (!tag || tag.trim().length === 0) return false;
  const stripped = tag.startsWith('#') ? tag.slice(1) : tag;
  return /^[a-zA-Z0-9_]+$/.test(stripped) && stripped.length > 0 && stripped.length <= 100;
}

/**
 * Validates that a scheduled datetime is in the future.
 * Returns true if the date is at least `minMinutesAhead` from now.
 */
export function validateFutureDate(date: string | Date, minMinutesAhead = 5): boolean {
  const target = new Date(date);
  const threshold = new Date(Date.now() + minMinutesAhead * 60 * 1000);
  return target > threshold;
}

// ─── Type Helpers ─────────────────────────────────────────────────────────────

export type BusinessProfileInput = z.input<typeof businessProfileSchema>;
export type PostContentInput = z.input<typeof postContentSchema>;
export type GeneratePostParamsInput = z.input<typeof generatePostParamsSchema>;
