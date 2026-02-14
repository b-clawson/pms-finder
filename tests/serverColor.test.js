import { describe, it, expect } from 'vitest';
import { normalizeHex, hexToRgb, rgbDistance } from '../server/color.js';

// --- normalizeHex ---
describe('normalizeHex', () => {
  it('normalizes 6-digit hex without #', () => {
    expect(normalizeHex('ff0000')).toBe('#FF0000');
  });

  it('normalizes 6-digit hex with #', () => {
    expect(normalizeHex('#00ff00')).toBe('#00FF00');
  });

  it('returns null for null input', () => {
    expect(normalizeHex(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(normalizeHex(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeHex('')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(normalizeHex('  #AABBCC  ')).toBe('#AABBCC');
  });

  it('returns null for 3-digit hex', () => {
    expect(normalizeHex('#FFF')).toBeNull();
  });

  it('returns null for 7-digit hex', () => {
    expect(normalizeHex('#1234567')).toBeNull();
  });

  it('returns null for non-hex characters', () => {
    expect(normalizeHex('#GGHHII')).toBeNull();
  });
});

// --- hexToRgb ---
describe('hexToRgb', () => {
  it('converts red', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

// --- rgbDistance ---
describe('rgbDistance', () => {
  it('returns 0 for identical colors', () => {
    expect(rgbDistance({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('computes max distance (black to white)', () => {
    const d = rgbDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(d).toBeCloseTo(441.67, 1);
  });
});
