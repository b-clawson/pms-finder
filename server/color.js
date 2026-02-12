/**
 * Color utilities — intentionally simple (RGB Euclidean distance).
 * Upgrade path: add Lab conversion + CIEDE2000 here when real swatches land.
 */

const HEX_RE = /^#?([0-9A-Fa-f]{6})$/;

/** Normalize to "#RRGGBB" */
export function normalizeHex(input) {
  const match = String(input).trim().match(HEX_RE);
  if (!match) return null;
  return `#${match[1].toUpperCase()}`;
}

/** "#RRGGBB" → { r, g, b } (0-255 ints) */
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Euclidean RGB distance (0 – ~441.67) */
export function rgbDistance(a, b) {
  return Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2
  );
}
