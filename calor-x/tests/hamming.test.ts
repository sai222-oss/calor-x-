import { describe, it, expect } from 'vitest';
import { calculateHammingDistance } from '../supabase/functions/analyze-food/utils';

describe('calculateHammingDistance', () => {
  // --- Basic correctness ---
  it('returns 0 for identical hashes', () => {
    expect(calculateHammingDistance('abcdef0123456789', 'abcdef0123456789')).toBe(0);
  });

  it('returns 0 for all-zero identical hashes', () => {
    expect(calculateHammingDistance('0000000000000000', '0000000000000000')).toBe(0);
  });

  it('counts 1 bit difference between 0x9 and 0x8', () => {
    // 0x9 = 1001, 0x8 = 1000 → 1 bit diff
    expect(calculateHammingDistance('abcdef0123456789', 'abcdef0123456788')).toBe(1);
  });

  it('counts 4 bit differences between 0x0 and 0xf', () => {
    // 0x0 = 0000, 0xf = 1111 → 4 bits
    expect(calculateHammingDistance('0000000000000000', 'f000000000000000')).toBe(4);
  });

  it('counts bits across multiple differing nibbles', () => {
    // 0 vs f = 4 bits, 0 vs f = 4 bits → 8 bits total
    expect(calculateHammingDistance('0f00000000000000', 'f000000000000000')).toBe(8);
  });

  // --- Edge cases ---
  it('returns 1000 for different lengths', () => {
    expect(calculateHammingDistance('abc', 'abcd')).toBe(1000);
  });

  it('returns 1000 for empty strings', () => {
    // Both empty: length === length (0 === 0) → loop never runs → returns 0
    // This tests the actual current behaviour
    expect(calculateHammingDistance('', '')).toBe(0);
  });

  it('returns 1000 when one string is empty and the other is not', () => {
    expect(calculateHammingDistance('', 'abc')).toBe(1000);
    expect(calculateHammingDistance('abc', '')).toBe(1000);
  });

  it('returns 1000 when hash1 is null/undefined-like (empty)', () => {
    // The guard checks !hash1 || !hash2
    // @ts-expect-error – intentional runtime test for null guard
    expect(calculateHammingDistance(null, 'abcdef0123456789')).toBe(1000);
    // @ts-expect-error
    expect(calculateHammingDistance('abcdef0123456789', null)).toBe(1000);
  });

  // --- Normalisation contract ---
  it('is case-sensitive: caller must normalise to lowercase', () => {
    // Hashes from the function are always normalised to lowercase before calling
    expect(calculateHammingDistance('ABCDEF'.toLowerCase(), 'abcdef')).toBe(0);
  });

  it('whitespace-padded strings differ in length and return 1000', () => {
    expect(calculateHammingDistance(' abcdef', 'abcdef')).toBe(1000);
    expect(calculateHammingDistance('abcdef ', 'abcdef')).toBe(1000);
  });
});
