import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stubSwatches } from "./stubSwatches.js";
import { normalizeHex, hexToRgb, rgbDistance } from "./color.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../data/pantone_swatches.json");

let swatches = null;
let mode = "stub";

/** Load swatches — real file if present, otherwise stub data. */
async function loadSwatches() {
  if (swatches) return;

  if (existsSync(DATA_PATH)) {
    try {
      const raw = await readFile(DATA_PATH, "utf-8");
      swatches = JSON.parse(raw);
      mode = "live";
      console.log(`Loaded ${swatches.length} swatches from ${DATA_PATH}`);
      return;
    } catch (err) {
      console.error("Failed to load pantone_swatches.json, falling back to stubs:", err.message);
    }
  }

  swatches = stubSwatches;
  mode = "stub";
  console.log(`Using ${swatches.length} stub swatches (no data/pantone_swatches.json found)`);
}

/**
 * Find closest PMS matches for a hex color.
 * @param {string} hex  — "#RRGGBB" or "RRGGBB"
 * @param {string} series — "C", "U", or "BOTH"
 * @param {number} limit
 * @returns {Promise<{ results: object[], mode: string }>}
 */
/**
 * Return all loaded swatches.
 */
export async function getAllSwatches() {
  await loadSwatches();
  return { swatches, mode };
}

/**
 * Find closest PMS matches for a hex color.
 * @param {string} hex  — "#RRGGBB" or "RRGGBB"
 * @param {string} series — "C", "U", or "BOTH"
 * @param {number} limit
 * @returns {Promise<{ results: object[], mode: string }>}
 */
export async function matchPms(hex, series = "BOTH", limit = 10) {
  await loadSwatches();

  const normHex = normalizeHex(hex);
  if (!normHex) throw new Error("Invalid hex");

  const inputRgb = hexToRgb(normHex);

  let pool = swatches;
  if (series !== "BOTH") {
    pool = swatches.filter((s) => s.series === series);
  }

  const scored = pool.map((s) => {
    const swatchRgb = hexToRgb(normalizeHex(s.hex));
    const distance = rgbDistance(inputRgb, swatchRgb);
    return {
      pms: s.pms,
      series: s.series,
      hex: normalizeHex(s.hex),
      name: s.name || "",
      distance: Math.round(distance * 100) / 100,
      notes: s.notes || "",
    };
  });

  scored.sort((a, b) => a.distance - b.distance);

  return { results: scored.slice(0, limit), mode };
}
