export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function rgbDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1B1B2F' : '#FFFFFF';
}

export function blendComponentColors(
  components: { hex?: string; percentage: number }[]
): string {
  let r = 0, g = 0, b = 0, totalPct = 0;

  for (const c of components) {
    if (!c.hex || c.hex.length < 6) continue;
    const rgb = hexToRgb(c.hex);
    r += rgb.r * c.percentage;
    g += rgb.g * c.percentage;
    b += rgb.b * c.percentage;
    totalPct += c.percentage;
  }

  if (totalPct === 0) return '#888888';

  const rr = Math.round(r / totalPct);
  const gg = Math.round(g / totalPct);
  const bb = Math.round(b / totalPct);
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

/**
 * Extract a PMS identifier from a Matsui formula description.
 * e.g. "301 RC NEO VIOLET C" → "violet", "301 RC NEO 459 C" → "459"
 */
export function extractPmsFromDescription(desc: string): string | null {
  if (!desc) return null;
  // Strip known series prefixes (may or may not start with a number)
  const stripped = desc
    .replace(/^(\d+\s*)?(RC\s*NEO|ALPHA\s*(DISCHARGE)?|BRITE\s*(DISCHARGE)?|HM\s*(DISCHARGE)?|OW\s*(STRETCH)?)\s*/i, '')
    .trim();
  if (!stripped) return null;
  // Remove trailing C or U (coated/uncoated marker)
  const pmsKey = stripped.replace(/\s+[CU]$/i, '').trim();
  return pmsKey || null;
}

export function cmykToHex(cmyk: number[]): string {
  // CMYK values can be 0-100 or 0-1 — normalize
  const c = cmyk[0] > 1 ? cmyk[0] / 100 : cmyk[0];
  const m = cmyk[1] > 1 ? cmyk[1] / 100 : cmyk[1];
  const y = cmyk[2] > 1 ? cmyk[2] / 100 : cmyk[2];
  const k = cmyk[3] > 1 ? cmyk[3] / 100 : cmyk[3];

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}
