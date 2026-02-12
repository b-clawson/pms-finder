import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Map of series name → file path for locally available data
const LOCAL_FILES = {
  "301 RC Neo": resolve(__dirname, "../data/matsui_301_rc_neo.json"),
  "Alpha Discharge": resolve(__dirname, "../data/matsui_alpha_discharge.json"),
  "Brite Discharge": resolve(__dirname, "../data/matsui_brite_discharge.json"),
  "HM Discharge": resolve(__dirname, "../data/matsui_hm_discharge.json"),
  "OW Stretch": resolve(__dirname, "../data/matsui_ow_stretch.json"),
};

// In-memory cache: series name → formula array
const cache = new Map();

async function loadSeries(seriesName) {
  if (cache.has(seriesName)) return cache.get(seriesName);

  const filePath = LOCAL_FILES[seriesName];
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const raw = await readFile(filePath, "utf-8");
    const formulas = JSON.parse(raw);
    cache.set(seriesName, formulas);
    console.log(`Loaded ${formulas.length} local Matsui formulas for ${seriesName}`);
    return formulas;
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Returns local formulas for a series, filtered by search query.
 * Returns null if no local data exists for the series (caller should fall back to API).
 */
export async function getLocalFormulas(seriesName, query) {
  const formulas = await loadSeries(seriesName);
  if (!formulas) return null;

  if (!query || !query.trim()) return formulas;

  const q = query.toLowerCase().trim();
  return formulas.filter(
    (f) =>
      (f.formulaCode || "").toLowerCase().includes(q) ||
      (f.formulaDescription || "").toLowerCase().includes(q)
  );
}

/**
 * Returns the list of series that have local data.
 */
export function getLocalSeriesNames() {
  return Object.keys(LOCAL_FILES);
}

/**
 * Check if a series has local data available.
 */
export function hasLocalData(seriesName) {
  return seriesName in LOCAL_FILES && existsSync(LOCAL_FILES[seriesName]);
}
