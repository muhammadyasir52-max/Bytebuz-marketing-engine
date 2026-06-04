// ─── Rate Limiter ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Simple sliding-window rate limiter (client-side guard).
 * Returns false if the caller should be blocked.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function getRateLimitStatus(
  key: string,
  maxRequests: number,
  windowMs: number
): { remaining: number; resetsInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    return { remaining: maxRequests, resetsInMs: 0 };
  }
  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetsInMs: Math.max(0, windowMs - (now - entry.windowStart)),
  };
}

// ─── Input Sanitisation ───────────────────────────────────────────────────────

/** Strip any characters that don't belong in an ad account / page ID (digits only). */
export function sanitiseNumericId(input: string): string {
  return input.replace(/\D/g, '').slice(0, 20);
}

/** Strip leading/trailing whitespace and limit length. */
export function sanitiseTextInput(input: string, maxLen = 500): string {
  return input.trim().slice(0, maxLen);
}

/** Basic URL validation — must start with https://. */
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Validate numeric ad account ID format. */
export function isValidAdAccountId(id: string): boolean {
  return /^\d{8,20}$/.test(id.trim());
}

/** Validate Meta access token has a plausible format (non-empty, no whitespace, reasonable length). */
export function isValidAccessToken(token: string): boolean {
  const t = token.trim();
  return t.length >= 20 && t.length <= 600 && !/\s/.test(t);
}

// ─── Error Sanitisation ───────────────────────────────────────────────────────

const INTERNAL_PATTERNS = [
  /Bearer\s+\S+/gi,
  /access_token=\S+/gi,
  /api[_-]?key[=:\s]+\S+/gi,
  /EAA[A-Za-z0-9]+/g,           // Facebook token pattern
  /sk-ant-[A-Za-z0-9-]+/g,      // Claude key pattern
  /\b[A-Za-z0-9]{40,}\b/g,      // Generic long tokens
];

/**
 * Redact any sensitive data that might appear in an error message
 * before showing it to the user or logging externally.
 */
export function sanitiseErrorMessage(message: string): string {
  let sanitised = message;
  for (const pattern of INTERNAL_PATTERNS) {
    sanitised = sanitised.replace(pattern, '[REDACTED]');
  }
  // Truncate very long error messages
  return sanitised.slice(0, 300);
}

/** Returns a safe user-facing message for API errors, hiding internal codes. */
export function userFacingApiError(service: string, statusCode?: number): string {
  if (statusCode === 401 || statusCode === 403) {
    return `${service}: authentication failed. Check your API credentials in Settings.`;
  }
  if (statusCode === 429) {
    return `${service}: too many requests. Please wait a moment and try again.`;
  }
  if (statusCode && statusCode >= 500) {
    return `${service}: service is temporarily unavailable. Please try again later.`;
  }
  return `${service}: an error occurred. Please try again.`;
}

// ─── JSON Parse with Size Guard ───────────────────────────────────────────────

const MAX_JSON_BYTES = 200_000; // 200 KB

/**
 * Parse JSON with a size limit to prevent memory exhaustion from
 * unexpectedly large LLM responses.
 */
export function safeParseJSON<T>(text: string): T {
  if (text.length > MAX_JSON_BYTES) {
    throw new Error('Response payload exceeded maximum allowed size.');
  }

  // Strip markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch && jsonMatch[0].length <= MAX_JSON_BYTES) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error('Failed to parse response. Please try again.');
  }
}

// ─── Stream Size Guard ────────────────────────────────────────────────────────

export const MAX_STREAM_CHARS = 50_000; // 50 KB of text

// ─── Budget Validation ────────────────────────────────────────────────────────

export const MIN_DAILY_BUDGET_USD = 1;
export const MAX_DAILY_BUDGET_USD = 10_000;

export function validateDailyBudget(valueStr: string): {
  valid: boolean;
  cents: number;
  error?: string;
} {
  const value = parseFloat(valueStr);
  if (Number.isNaN(value)) {
    return { valid: false, cents: 0, error: 'Budget must be a valid number.' };
  }
  if (value < MIN_DAILY_BUDGET_USD) {
    return { valid: false, cents: 0, error: `Minimum daily budget is $${MIN_DAILY_BUDGET_USD}.` };
  }
  if (value > MAX_DAILY_BUDGET_USD) {
    return {
      valid: false, cents: 0,
      error: `Maximum daily budget is $${MAX_DAILY_BUDGET_USD.toLocaleString()} for safety. Contact support for higher limits.`,
    };
  }
  return { valid: true, cents: Math.round(value * 100) };
}

// ─── Schedule Time Validation ─────────────────────────────────────────────────

const MAX_SCHEDULE_DAYS = 365;

export function validateScheduleTime(isoString: string): {
  valid: boolean;
  error?: string;
} {
  const date = new Date(isoString);
  const now = new Date();
  if (date <= now) {
    return { valid: false, error: 'Scheduled time must be in the future.' };
  }
  const maxDate = new Date(now.getTime() + MAX_SCHEDULE_DAYS * 24 * 3600 * 1000);
  if (date > maxDate) {
    return { valid: false, error: `Cannot schedule more than ${MAX_SCHEDULE_DAYS} days in advance.` };
  }
  return { valid: true };
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'auth' | 'api_call' | 'error' | 'token_validation' | 'rate_limit' | 'disconnect';
  service: 'claude' | 'ayrshare' | 'meta' | 'app';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

const MAX_AUDIT_LOG_ENTRIES = 100;
let auditLog: AuditEvent[] = [];

export function logAuditEvent(
  type: AuditEvent['type'],
  service: AuditEvent['service'],
  message: string,
  severity: AuditEvent['severity'] = 'info'
): void {
  const event: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    service,
    message: sanitiseErrorMessage(message),
    severity,
  };
  auditLog = [event, ...auditLog].slice(0, MAX_AUDIT_LOG_ENTRIES);
}

export function getAuditLog(): AuditEvent[] {
  return [...auditLog];
}

export function clearAuditLog(): void {
  auditLog = [];
}
