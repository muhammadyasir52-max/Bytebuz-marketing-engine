import { ContentType, SocialPlatform } from '@/types';

export interface ContentTypeConfig {
  id: ContentType;
  label: string;
  description: string;
  icon: string; // Ionicons name
  supportedPlatforms: SocialPlatform[];
  requiresMedia: boolean;
  averageWordCount: { min: number; max: number };
  estimatedProductionTime: string;
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: 'text_post',
    label: 'Text Post',
    description: 'Engaging copy-only post for maximum reach without media',
    icon: 'document-text-outline',
    supportedPlatforms: ['facebook', 'linkedin', 'twitter'],
    requiresMedia: false,
    averageWordCount: { min: 50, max: 300 },
    estimatedProductionTime: '5 min',
  },
  {
    id: 'carousel',
    label: 'Carousel',
    description: 'Multi-slide educational or storytelling content',
    icon: 'albums-outline',
    supportedPlatforms: ['instagram', 'facebook', 'linkedin'],
    requiresMedia: true,
    averageWordCount: { min: 100, max: 500 },
    estimatedProductionTime: '20 min',
  },
  {
    id: 'image_post',
    label: 'Image Post',
    description: 'Single image with compelling caption',
    icon: 'image-outline',
    supportedPlatforms: ['instagram', 'facebook', 'linkedin', 'twitter'],
    requiresMedia: true,
    averageWordCount: { min: 50, max: 200 },
    estimatedProductionTime: '10 min',
  },
  {
    id: 'video_script',
    label: 'Video Script',
    description: 'Full scripted video for long-form content',
    icon: 'film-outline',
    supportedPlatforms: ['youtube', 'facebook', 'instagram', 'linkedin', 'tiktok'],
    requiresMedia: true,
    averageWordCount: { min: 300, max: 2000 },
    estimatedProductionTime: '45 min',
  },
  {
    id: 'story',
    label: 'Story',
    description: 'Ephemeral vertical content for 24-hour engagement',
    icon: 'phone-portrait-outline',
    supportedPlatforms: ['instagram', 'facebook'],
    requiresMedia: false,
    averageWordCount: { min: 20, max: 100 },
    estimatedProductionTime: '5 min',
  },
  {
    id: 'thread',
    label: 'Thread',
    description: 'Multi-tweet thread for in-depth storytelling on X',
    icon: 'list-outline',
    supportedPlatforms: ['twitter'],
    requiresMedia: false,
    averageWordCount: { min: 200, max: 1400 },
    estimatedProductionTime: '15 min',
  },
  {
    id: 'seo_article',
    label: 'SEO Article',
    description: 'Long-form LinkedIn article optimised for search and authority',
    icon: 'newspaper-outline',
    supportedPlatforms: ['linkedin'],
    requiresMedia: false,
    averageWordCount: { min: 800, max: 3000 },
    estimatedProductionTime: '60 min',
  },
  {
    id: 'reel_script',
    label: 'Reel / Short Script',
    description: 'Fast-paced short-form video script for Reels and TikTok',
    icon: 'play-circle-outline',
    supportedPlatforms: ['instagram', 'tiktok', 'youtube'],
    requiresMedia: true,
    averageWordCount: { min: 80, max: 300 },
    estimatedProductionTime: '15 min',
  },
];

export function getContentTypeConfig(type: ContentType): ContentTypeConfig | undefined {
  return CONTENT_TYPES.find((ct) => ct.id === type);
}

export function getContentTypesForPlatform(platform: SocialPlatform): ContentTypeConfig[] {
  return CONTENT_TYPES.filter((ct) => ct.supportedPlatforms.includes(platform));
}

export function getContentTypeLabel(type: ContentType): string {
  return getContentTypeConfig(type)?.label ?? type;
}

export function getContentTypeIcon(type: ContentType): string {
  return getContentTypeConfig(type)?.icon ?? 'document-outline';
}
