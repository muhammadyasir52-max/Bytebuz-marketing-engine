import { Post, SocialPlatform } from '@/types';

// ─── Platform Character Limits ────────────────────────────────────────────────

const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  twitter: 280,
  tiktok: 2200,
  youtube: 5000,
};

// Platforms where hashtags go at the end (separate from body)
const HASHTAGS_BELOW: SocialPlatform[] = ['instagram', 'linkedin', 'youtube', 'tiktok'];
// Platforms where hashtags are inline or not used much
const HASHTAGS_INLINE_OR_NONE: SocialPlatform[] = ['twitter', 'facebook'];

// ─── Format Post Content ──────────────────────────────────────────────────────

/**
 * Formats post content for a specific platform, combining hook + body + CTA
 * with proper platform-specific formatting.
 */
export function formatPostForPlatform(post: Post, platform: SocialPlatform): string {
  const { hook, body, cta, hashtags } = post.content;

  let content: string;

  switch (platform) {
    case 'twitter': {
      // Twitter: concise, hashtags inline or at end, may need thread splitting
      const parts = [hook, body, cta].filter(Boolean);
      const combined = parts.join('\n\n');
      const formattedHashtags = formatHashtags(hashtags, platform);
      const withHashtags = formattedHashtags
        ? `${combined}\n\n${formattedHashtags}`
        : combined;

      if (withHashtags.length <= PLATFORM_LIMITS.twitter) {
        content = withHashtags;
      } else {
        // Will need thread splitting — return just the hook tweet
        content = truncateForPlatform(`${hook}${formattedHashtags ? ` ${formattedHashtags}` : ''}`, platform);
      }
      break;
    }

    case 'linkedin': {
      // LinkedIn: professional formatting with line breaks between paragraphs
      const parts = [hook, body, cta].filter(Boolean);
      const combined = parts.join('\n\n');
      const formattedHashtags = formatHashtags(hashtags, platform);
      content = formattedHashtags ? `${combined}\n\n${formattedHashtags}` : combined;
      content = truncateForPlatform(content, platform);
      break;
    }

    case 'instagram': {
      // Instagram: hook first, body, CTA, then hashtags separated by dots/dashes
      const parts = [hook, body, cta].filter(Boolean);
      const bodyText = parts.join('\n\n');
      const formattedHashtags = formatHashtags(hashtags, platform);
      // Instagram convention: add line break before hashtags
      content = formattedHashtags ? `${bodyText}\n\n.\n.\n.\n${formattedHashtags}` : bodyText;
      content = truncateForPlatform(content, platform);
      break;
    }

    case 'facebook': {
      // Facebook: storytelling format, minimal hashtags
      const parts = [hook, body, cta].filter(Boolean);
      const combined = parts.join('\n\n');
      const formattedHashtags = formatHashtags(hashtags, platform);
      content = formattedHashtags ? `${combined}\n\n${formattedHashtags}` : combined;
      content = truncateForPlatform(content, platform);
      break;
    }

    case 'tiktok': {
      // TikTok: short caption, hook is key, hashtags at end
      // TikTok captions should be short — use just hook + hashtags
      const caption = hook || body.split('\n')[0] || body;
      const formattedHashtags = formatHashtags(hashtags, platform);
      content = formattedHashtags ? `${caption}\n\n${formattedHashtags}` : caption;
      content = truncateForPlatform(content, platform);
      break;
    }

    case 'youtube': {
      // YouTube: full description with all content, keyword-optimized
      const parts = [hook, body, cta].filter(Boolean);
      const combined = parts.join('\n\n');
      const formattedHashtags = formatHashtags(hashtags, platform);
      // YouTube: hashtags appear above title when placed at END of description
      content = formattedHashtags ? `${combined}\n\n${formattedHashtags}` : combined;
      content = truncateForPlatform(content, platform);
      break;
    }

    default: {
      const parts = [hook, body, cta].filter(Boolean);
      content = parts.join('\n\n');
      break;
    }
  }

  return content;
}

// ─── Thread Splitter ──────────────────────────────────────────────────────────

/**
 * Splits long text into Twitter/X thread format.
 * Each tweet respects the character limit and preserves word boundaries.
 */
export function splitIntoThread(text: string, maxChars = 280): string[] {
  if (text.length <= maxChars) return [text];

  const tweets: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentTweet = '';
  let tweetIndex = 1;

  const getNumberingPrefix = (index: number, isFirst: boolean) => {
    // First tweet doesn't need a number if it's short enough standalone
    return isFirst ? '' : `${index}/ `;
  };

  for (const paragraph of paragraphs) {
    const prefix = getNumberingPrefix(tweetIndex, tweetIndex === 1);
    const withPrefix = `${prefix}${paragraph.trim()}`;

    if (withPrefix.length <= maxChars) {
      if (currentTweet) {
        // Check if adding this paragraph keeps us under limit
        const combined = `${currentTweet}\n\n${withPrefix}`;
        if (combined.length <= maxChars) {
          currentTweet = combined;
        } else {
          tweets.push(currentTweet);
          tweetIndex++;
          const newPrefix = getNumberingPrefix(tweetIndex, false);
          currentTweet = `${newPrefix}${paragraph.trim()}`;
        }
      } else {
        currentTweet = withPrefix;
      }
    } else {
      // Paragraph itself is too long — split by sentences
      if (currentTweet) {
        tweets.push(currentTweet);
        tweetIndex++;
        currentTweet = '';
      }

      const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [paragraph];
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        const prefix = getNumberingPrefix(tweetIndex, tweets.length === 0 && !currentTweet);
        const candidate = currentTweet ? `${currentTweet} ${trimmed}` : `${prefix}${trimmed}`;

        if (candidate.length <= maxChars) {
          currentTweet = candidate;
        } else {
          if (currentTweet) {
            tweets.push(currentTweet);
            tweetIndex++;
          }
          const newPrefix = getNumberingPrefix(tweetIndex, false);
          // If even a single sentence is too long, hard-truncate
          currentTweet = truncateText(`${newPrefix}${trimmed}`, maxChars);
        }
      }
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet);
  }

  return tweets.filter((t) => t.trim().length > 0);
}

// ─── Hashtag Formatter ────────────────────────────────────────────────────────

/**
 * Formats hashtags for a specific platform.
 * Returns the formatted hashtag string (empty string if no hashtags or not used for platform).
 */
export function formatHashtags(hashtags: string[], platform: SocialPlatform): string {
  if (!hashtags || hashtags.length === 0) return '';

  // Normalize: remove # prefix if present, then add it back
  const normalized = hashtags.map((h) => `#${h.replace(/^#/, '')}`);

  switch (platform) {
    case 'twitter':
      // Twitter: use max 2, inline with spaces
      return normalized.slice(0, 2).join(' ');

    case 'facebook':
      // Facebook: use max 3, at the end
      return normalized.slice(0, 3).join(' ');

    case 'linkedin':
      // LinkedIn: 3–5 at the very end, each on same line separated by spaces
      return normalized.slice(0, 5).join(' ');

    case 'instagram':
      // Instagram: all hashtags, each space-separated
      return normalized.join(' ');

    case 'tiktok':
      // TikTok: 3–5 hashtags, space-separated
      return normalized.slice(0, 5).join(' ');

    case 'youtube':
      // YouTube: 3 hashtags at end of description (appear above title)
      return normalized.slice(0, 3).join(' ');

    default:
      return normalized.join(' ');
  }
}

// ─── Platform Validator ───────────────────────────────────────────────────────

/**
 * Validates a post against platform requirements.
 * Returns an array of validation error messages (empty array = valid).
 */
export function validateForPlatform(post: Post, platform: SocialPlatform): string[] {
  const errors: string[] = [];
  const { hook, body, cta, hashtags, mediaUrls } = post.content;
  const fullContent = formatPostForPlatform(post, platform);
  const limit = PLATFORM_LIMITS[platform];

  // Character limit check
  if (fullContent.length > limit) {
    errors.push(
      `Content exceeds ${platform} character limit (${fullContent.length}/${limit} characters)`
    );
  }

  // Hook required for all platforms
  if (!hook || hook.trim().length === 0) {
    errors.push('Hook is required');
  }

  // Platform-specific validations
  switch (platform) {
    case 'twitter':
      if (fullContent.length > 280) {
        errors.push(
          `Tweet exceeds 280 character limit. Consider creating a thread (${fullContent.length} chars).`
        );
      }
      if (hashtags && hashtags.length > 2) {
        errors.push('Twitter best practice: use no more than 2 hashtags');
      }
      break;

    case 'linkedin':
      if (!body || body.trim().length < 50) {
        errors.push('LinkedIn posts perform better with at least 50 characters of body content');
      }
      if (hashtags && hashtags.length > 5) {
        errors.push('LinkedIn best practice: use 3–5 hashtags maximum');
      }
      break;

    case 'instagram':
      if (fullContent.length > 2200) {
        errors.push(
          `Instagram caption exceeds 2200 character limit (${fullContent.length} chars)`
        );
      }
      if (hashtags && hashtags.length > 30) {
        errors.push('Instagram allows a maximum of 30 hashtags per post');
      }
      break;

    case 'tiktok':
      if (mediaUrls && mediaUrls.length === 0) {
        errors.push('TikTok requires a video to be attached');
      }
      break;

    case 'youtube':
      if (mediaUrls && mediaUrls.length === 0) {
        errors.push('YouTube requires a video to be uploaded');
      }
      if (!body || body.trim().length < 100) {
        errors.push('YouTube descriptions should be at least 100 characters for SEO');
      }
      break;

    case 'facebook':
      if (hashtags && hashtags.length > 10) {
        errors.push('Facebook best practice: use 3 or fewer hashtags');
      }
      break;
  }

  // Schedule validation
  if (post.schedule) {
    const scheduledDate = new Date(post.schedule.scheduledAt);
    if (scheduledDate <= new Date()) {
      errors.push('Scheduled time must be in the future');
    }
    if (!post.schedule.timezone) {
      errors.push('Timezone is required for scheduled posts');
    }
  }

  return errors;
}

// ─── Content Truncator ────────────────────────────────────────────────────────

/**
 * Truncates content to a platform's character limit with smart ellipsis.
 * Attempts to break at a sentence boundary or word boundary.
 */
export function truncateForPlatform(content: string, platform: SocialPlatform): string {
  const limit = PLATFORM_LIMITS[platform];
  if (content.length <= limit) return content;

  const ellipsis = '...';
  const maxLength = limit - ellipsis.length;

  // Try to cut at sentence boundary
  const truncated = content.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? ')
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    // Cut cleanly at sentence boundary (keep the punctuation)
    return `${truncated.slice(0, lastSentenceEnd + 1)}${ellipsis}`;
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return `${truncated.slice(0, lastSpace)}${ellipsis}`;
  }

  // Hard cut
  return `${truncated}${ellipsis}`;
}

// ─── Helper: Truncate text ────────────────────────────────────────────────────

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const lastSpace = text.slice(0, maxLength - 3).lastIndexOf(' ');
  if (lastSpace > 0) {
    return `${text.slice(0, lastSpace)}...`;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}
