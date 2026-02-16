import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbDistance,
  getContrastColor,
  blendComponentColors,
  extractPmsFromDescription,
  cmykToHex,
} from '../src/app/utils/colorMath';

// --- hexToRgb ---
describe('hexToRgb', () => {
  it('parses 6-digit hex with #', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses 6-digit hex without #', () => {
    expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses white', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns NaN for empty string', () => {
    const result = hexToRgb('');
    expect(Number.isNaN(result.r)).toBe(true);
  });

  it('returns NaN for short hex (3 chars)', () => {
    const result = hexToRgb('#FFF');
    // substring(0,2) = 'FF', substring(2,4) = 'F', substring(4,6) = ''
    expect(result.r).toBe(255);
    expect(result.g).toBe(15); // 'F' parsed as hex
    expect(Number.isNaN(result.b)).toBe(true);
  });
});

// --- rgbDistance ---
describe('rgbDistance', () => {
  it('returns 0 for identical colors', () => {
    const c = { r: 128, g: 64, b: 32 };
    expect(rgbDistance(c, c)).toBe(0);
  });

  it('computes distance between black and white', () => {
    const d = rgbDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(d).toBeCloseTo(441.67, 1);
  });

  it('computes distance between red and green', () => {
    const d = rgbDistance({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 });
    expect(d).toBeCloseTo(360.62, 1);
  });
});

// --- getContrastColor ---
describe('getContrastColor', () => {
  it('returns white for dark colors', () => {
    expect(getContrastColor('#000000')).toBe('#FFFFFF');
  });

  it('returns dark for light colors', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#222222');
  });

  it('returns white for mid-dark colors', () => {
    expect(getContrastColor('#333333')).toBe('#FFFFFF');
  });
});

// --- blendComponentColors ---
describe('blendComponentColors', () => {
  it('blends a single color at 100%', () => {
    expect(blendComponentColors([{ hex: '#FF0000', percentage: 100 }])).toBe('#ff0000');
  });

  it('blends two equal colors', () => {
    const result = blendComponentColors([
      { hex: '#FF0000', percentage: 50 },
      { hex: '#0000FF', percentage: 50 },
    ]);
    // Average of red and blue
    expect(result).toBe('#800080');
  });

  it('returns fallback for empty array', () => {
    expect(blendComponentColors([])).toBe('#888888');
  });

  it('returns fallback when all percentages are 0', () => {
    expect(blendComponentColors([{ hex: '#FF0000', percentage: 0 }])).toBe('#888888');
  });

  it('skips components with missing hex', () => {
    expect(blendComponentColors([
      { hex: undefined, percentage: 50 },
      { hex: '#00FF00', percentage: 50 },
    ])).toBe('#00ff00');
  });

  it('skips components with short hex', () => {
    expect(blendComponentColors([
      { hex: '#FFF', percentage: 50 },
      { hex: '#0000FF', percentage: 50 },
    ])).toBe('#0000ff');
  });
});

// --- extractPmsFromDescription ---
describe('extractPmsFromDescription', () => {
  it('extracts PMS number from RC NEO description', () => {
    expect(extractPmsFromDescription('301 RC NEO 459 C')).toBe('459');
  });

  it('extracts color name from RC NEO description', () => {
    expect(extractPmsFromDescription('301 RC NEO VIOLET C')).toBe('VIOLET');
  });

  it('returns null for empty string', () => {
    expect(extractPmsFromDescription('')).toBeNull();
  });

  it('returns null for null-like input', () => {
    expect(extractPmsFromDescription(null as unknown as string)).toBeNull();
  });

  it('strips ALPHA DISCHARGE prefix', () => {
    expect(extractPmsFromDescription('ALPHA DISCHARGE RED C')).toBe('RED');
  });

  it('strips BRITE DISCHARGE prefix', () => {
    expect(extractPmsFromDescription('BRITE DISCHARGE BLUE U')).toBe('BLUE');
  });
});

// --- cmykToHex ---
describe('cmykToHex', () => {
  it('converts 0,0,0,0 to white', () => {
    expect(cmykToHex([0, 0, 0, 0])).toBe('#FFFFFF');
  });

  it('converts 0,0,0,100 to black', () => {
    expect(cmykToHex([0, 0, 0, 100])).toBe('#000000');
  });

  it('converts 100,0,0,0 to cyan', () => {
    expect(cmykToHex([100, 0, 0, 0])).toBe('#00FFFF');
  });

  it('handles 0-1 range values', () => {
    expect(cmykToHex([0, 0, 0, 1])).toBe('#000000');
  });

  it('handles mixed ranges (all > 1 treated as 0-100)', () => {
    expect(cmykToHex([50, 50, 50, 0])).toBe('#808080');
  });
});
