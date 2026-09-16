// ─── Tag Code Generation ──────────────────────────────────────────────────────

/**
 * Generates a short, uppercase, barcode-friendly tag code.
 * Example: generateTagCode('CS') → "CS-7F3K9Q"
 */
export function generateTagCode(prefix: 'CS' | 'DV'): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `${prefix}-${random}`;
}
