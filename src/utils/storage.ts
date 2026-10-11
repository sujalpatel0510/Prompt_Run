/**
 * Safe localStorage helpers. Every read validates shape so a corrupted or
 * outdated entry degrades to the provided fallback instead of crashing the UI.
 */

export function readStored<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T
): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed: unknown = JSON.parse(saved);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable (private mode / iframe) — non-fatal.
  }
}

export function removeStored(...keys: string[]): void {
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore — best effort cleanup only.
  }
}

export const isArray = Array.isArray;

/** Trims, strips control characters, and caps free-text input length. */
export function sanitizeText(input: string, maxLength = 80): string {
  // eslint-disable-next-line no-control-regex -- stripping control chars is the point
  return input.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

/** Clamps a numeric amount into a sane, finite, positive range. */
export function sanitizeAmount(value: unknown, max = 10_000_000): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.round(n), max);
}

/** Clamps a day index into the 1-30 planning horizon. */
export function clampDay(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(30, Math.max(1, Math.round(n)));
}
