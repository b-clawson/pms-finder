import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MatsuiFormulaSchema, validateRecords } from "../shared/schemas.js";

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

/** Returns true if a formula is junk data (test/duplicate/bad sums). */
function isJunkFormula(formula) {
  const code = formula.formulaCode || "";
  if (code.startsWith("COPY:")) return true;
  if (code === "TEST") return true;
  const pctSum = (formula.components || []).reduce(
    (sum, c) => sum + (c.percentage || 0),
    0
  );
  return pctSum > 110;
}

async function loadSeries(seriesName) {
  if (cache.has(seriesName)) return cache.get(seriesName);

  const filePath = LOCAL_FILES[seriesName];
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const raw = await readFile(filePath, "utf-8");
    const allFormulas = JSON.parse(raw);
    const { valid, invalid, errors } = validateRecords(allFormulas, MatsuiFormulaSchema, seriesName);
    if (invalid > 0) {
      console.warn(`[Matsui] ${seriesName}: ${invalid}/${valid + invalid} records failed validation`);
      for (const e of errors.slice(0, 5)) console.warn(`  ${e.id}: ${e.issues.join("; ")}`);
    }
    const formulas = allFormulas.filter((f) => !isJunkFormula(f));
    const filtered = allFormulas.length - formulas.length;
    if (filtered > 0) {
      console.log(`[Matsui] ${seriesName}: filtered ${filtered} junk records (COPY/TEST/bad sums)`);
    }
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
