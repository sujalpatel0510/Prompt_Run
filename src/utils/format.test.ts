import { describe, it, expect } from 'vitest';
import { formatINR, formatSignedINR } from './format';

describe('formatINR', () => {
  it('formats whole rupees with grouping and no decimals', () => {
    expect(formatINR(10000)).toBe('₹10,000');
    expect(formatINR(1500)).toBe('₹1,500');
  });

  it('rounds fractional amounts', () => {
    expect(formatINR(999.6)).toBe('₹1,000');
  });

  it('handles zero and negatives', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-250)).toBe('-₹250');
  });

  it('degrades safely for non-finite input', () => {
    expect(formatINR(Number.NaN)).toBe('₹0');
    expect(formatINR(Number.POSITIVE_INFINITY)).toBe('₹0');
  });
});

describe('formatSignedINR', () => {
  it('prefixes + for positive and − for negative', () => {
    expect(formatSignedINR(500)).toBe('+₹500');
    expect(formatSignedINR(-500)).toBe('−₹500');
    expect(formatSignedINR(0)).toBe('₹0');
  });
});
