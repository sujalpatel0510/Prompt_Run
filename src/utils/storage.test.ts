import { describe, it, expect, beforeEach } from 'vitest';
import {
  readStored,
  writeStored,
  removeStored,
  sanitizeText,
  sanitizeAmount,
  clampDay,
  isArray,
} from './storage';

// Minimal in-memory localStorage double for the node test environment.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
};

describe('storage helpers', () => {
  beforeEach(() => store.clear());

  it('round-trips values through write/read', () => {
    writeStored('k', [1, 2, 3]);
    expect(readStored('k', [], isArray)).toEqual([1, 2, 3]);
  });

  it('falls back on missing keys', () => {
    expect(readStored('missing', 42, (v): v is number => typeof v === 'number')).toBe(42);
  });

  it('falls back on malformed JSON', () => {
    store.set('bad', '{not json');
    expect(readStored('bad', [], isArray)).toEqual([]);
  });

  it('falls back when the shape check fails', () => {
    store.set('shape', '"a string"');
    expect(readStored('shape', [], isArray)).toEqual([]);
  });

  it('removeStored deletes multiple keys', () => {
    writeStored('a', 1);
    writeStored('b', 2);
    removeStored('a', 'b');
    expect(store.has('a')).toBe(false);
    expect(store.has('b')).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('trims whitespace and caps length', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
    expect(sanitizeText('x'.repeat(200)).length).toBe(80);
  });

  it('strips control characters', () => {
    expect(sanitizeText('ab\u0000c\u001Fd')).toBe('abcd');
  });

  it('returns empty string for blank input', () => {
    expect(sanitizeText('   ')).toBe('');
  });
});

describe('sanitizeAmount', () => {
  it('accepts and rounds positive finite numbers', () => {
    expect(sanitizeAmount(199.6)).toBe(200);
  });

  it('rejects zero, negatives, NaN and Infinity', () => {
    expect(sanitizeAmount(0)).toBeNull();
    expect(sanitizeAmount(-5)).toBeNull();
    expect(sanitizeAmount(Number.NaN)).toBeNull();
    expect(sanitizeAmount(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('caps absurd values', () => {
    expect(sanitizeAmount(99_000_000)).toBe(10_000_000);
  });
});

describe('clampDay', () => {
  it('clamps into the 1-30 horizon', () => {
    expect(clampDay(0)).toBe(1);
    expect(clampDay(31)).toBe(30);
    expect(clampDay(15)).toBe(15);
    expect(clampDay(Number.NaN)).toBe(1);
  });
});
