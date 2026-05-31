import { SocialPlatform, ContentType } from '@/types';

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  icon: string; // Ionicons name
  color: string;
  gradientColors: string[];
  maxChars: number;
  maxHashtags: number;
  hashtagPlacement: 'inline' | 'end' | 'comment' | 'none';
  requiresMedia: boolean;
  supportedContentTypes: ContentType[];
  bestPostTimes: string[];
  audienceStrengths: string[];
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'logo-instagram',
    color: '#E1306C',
    gradientColors: ['#833AB4', '#C13584', '#E1306C', '#F77737'],
    maxChars: 2200,
    maxHashtags: 30,
    hashtagPlacement: 'end',
    requiresMedia: true,
    supportedContentTypes: ['image_post', 'carousel', 'story', 'reel_script', 'video_script'],
    bestPostTimes: ['08:00', '12:00', '17:00', '19:00'],
    audienceStrengths: ['visual', 'lifestyle', 'fashion', 'food', 'travel'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    gradientColors: ['#1877F2', '#0A5DC2'],
    maxChars: 63206,
    maxHashtags: 10,
    hashtagPlacement: 'inline',
    requiresMedia: false,
    supportedContentTypes: ['text_post', 'image_post', 'carousel', 'video_script', 'story'],
    bestPostTimes: ['09:00', '13:00', '15:00'],
    audienceStrengths: ['community', 'local business', 'events', 'groups'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#0A66C2',
    gradientColors: ['#0A66C2', '#004182'],
    maxChars: 3000,
    maxHashtags: 5,
    hashtagPlacement: 'end',
    requiresMedia: false,
    supportedContentTypes: ['text_post', 'image_post', 'carousel', 'seo_article', 'video_script'],
    bestPostTimes: ['08:00', '10:00', '12:00', '17:00'],
    audienceStrengths: ['B2B', 'professional', 'recruitment', 'thought leadership'],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'logo-twitter',
    color: '#000000',
    gradientColors: ['#000000', '#1A1A1A'],
    maxChars: 280,
    maxHashtags: 2,
    hashtagPlacement: 'inline',
    requiresMedia: false,
    supportedContentTypes: ['text_post', 'thread', 'image_post'],
    bestPostTimes: ['08:00', '12:00', '17:00', '20:00'],
    audienceStrengths: ['news', 'tech', 'real-time', 'trending topics'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'musical-notes',
    color: '#FF0050',
    gradientColors: ['#FF0050', '#010101', '#00F2EA'],
    maxChars: 2200,
    maxHashtags: 20,
    hashtagPlacement: 'end',
    requiresMedia: true,
    supportedContentTypes: ['reel_script', 'video_script'],
    bestPostTimes: ['07:00', '12:00', '17:00', '19:00', '21:00'],
    audienceStrengths: ['entertainment', 'Gen Z', 'trends', 'viral content'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'logo-youtube',
    color: '#FF0000',
    gradientColors: ['#FF0000', '#CC0000'],
    maxChars: 5000,
    maxHashtags: 15,
    hashtagPlacement: 'end',
    requiresMedia: true,
    supportedContentTypes: ['video_script', 'reel_script'],
    bestPostTimes: ['12:00', '15:00', '17:00', '20:00'],
    audienceStrengths: ['long-form', 'tutorials', 'reviews', 'entertainment', 'education'],
  },
];

export const PLATFORM_LIMITS: Record<SocialPlatform, { maxChars: number; maxHashtags: number }> = {
  instagram: { maxChars: 2200, maxHashtags: 30 },
  facebook: { maxChars: 63206, maxHashtags: 10 },
  linkedin: { maxChars: 3000, maxHashtags: 5 },
  twitter: { maxChars: 280, maxHashtags: 2 },
  tiktok: { maxChars: 2200, maxHashtags: 20 },
  youtube: { maxChars: 5000, maxHashtags: 15 },
};

export function getSupportedContentTypes(platform: SocialPlatform): ContentType[] {
  const config = PLATFORMS.find((p) => p.id === platform);
  return config?.supportedContentTypes ?? [];
}

export function getPlatformConfig(platform: SocialPlatform): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === platform);
}

export function getPlatformColor(platform: SocialPlatform): string {
  return getPlatformConfig(platform)?.color ?? '#7C3AED';
}

export function getPlatformIcon(platform: SocialPlatform): string {
  return getPlatformConfig(platform)?.icon ?? 'globe-outline';
}
