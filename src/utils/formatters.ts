import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// ─── Date Formatters ──────────────────────────────────────────────────────────

/**
 * Formats a date to a human-readable string.
 * @param date - Date string or Date object
 * @param format - dayjs format string (defaults to 'MMM D, YYYY')
 */
export function formatDate(date: string | Date, format = 'MMM D, YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Returns a relative time string (e.g. "3 hours ago", "in 2 days").
 * @param date - Date string or Date object
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Formats a scheduled post time in a user-friendly way.
 * Examples: "Today at 3:30 PM", "Tomorrow at 9:00 AM", "Mon, Jun 3 at 2:15 PM"
 * @param date - Date string or Date object
 */
export function formatScheduleTime(date: string | Date): string {
  const target = dayjs(date);
  const now = dayjs();

  if (target.isSame(now, 'day')) {
    return `Today at ${target.format('h:mm A')}`;
  }

  if (target.isSame(now.add(1, 'day'), 'day')) {
    return `Tomorrow at ${target.format('h:mm A')}`;
  }

  // Within the same week
  if (target.diff(now, 'day') < 7 && target.isAfter(now)) {
    return target.format('ddd [at] h:mm A');
  }

  // More than a week away or in the past
  return target.format('MMM D [at] h:mm A');
}

// ─── Number Formatters ────────────────────────────────────────────────────────

/**
 * Formats a large number to a compact representation.
 * Examples: 1234 → "1.2K", 1234567 → "1.2M", 999 → "999"
 */
export function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0';

  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${sign}${abs.toString()}`;
}

/**
 * Formats a decimal as a percentage string.
 * @param n - The number (0.75 = 75%, or pass 75 for 75%)
 * @param decimals - Number of decimal places (default: 1)
 */
export function formatPercentage(n: number, decimals = 1): string {
  if (!isFinite(n) || isNaN(n)) return '0%';

  // Accept both 0.75 (fraction) and 75 (already a percentage)
  // If value is clearly a fraction (<= 1 and >= -1), multiply by 100
  const value = Math.abs(n) <= 1 ? n * 100 : n;
  return `${value.toFixed(decimals)}%`;
}

// ─── Text Formatters ──────────────────────────────────────────────────────────

/**
 * Truncates text to a maximum length with ellipsis.
 * Attempts to break at word boundary.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return `${truncated.slice(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

/**
 * Extracts and returns the first line of a multi-line string.
 * Strips leading/trailing whitespace.
 */
export function extractFirstLine(text: string): string {
  if (!text) return '';
  return text.split('\n')[0]?.trim() ?? '';
}

/**
 * Counts the number of words in a string.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Counts the number of characters in a string (including spaces).
 */
export function countChars(text: string): number {
  return text?.length ?? 0;
}

/**
 * Masks an API key for display, showing first 7 and last 4 characters.
 * Example: "sk-ant-api03-very-long-key-xyz" → "sk-ant-...l-xyz"
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) {
    return '•'.repeat(Math.max(key?.length ?? 0, 8));
  }

  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}

// ─── Engagement / Analytics Formatters ───────────────────────────────────────

/**
 * Formats an engagement rate for display.
 * Example: 0.0342 → "3.42%"
 */
export function formatEngagementRate(rate: number): string {
  return formatPercentage(rate);
}

/**
 * Formats a duration in seconds to a readable time string.
 * Example: 90 → "1:30", 3661 → "1:01:01"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

/**
 * Formats a word count as a readable estimated read time.
 * Example: 300 words → "~1 min read"
 */
export function formatReadTime(wordCount: number): string {
  if (wordCount <= 0) return '< 1 min read';
  const minutes = Math.ceil(wordCount / 200); // ~200 WPM average
  return minutes === 1 ? '~1 min read' : `~${minutes} min read`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a snake_case or kebab-case string to Title Case.
 * Example: "brand_awareness" → "Brand Awareness"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}
