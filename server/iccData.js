import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { IccFormulaSchema, validateRecords } from "../shared/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const LOCAL_FILES = {
  "7500 Coated": resolve(__dirname, "../data/icc_7500_coated.json"),
};

// In-memory cache: family name → formula array
const cache = new Map();

async function loadFamily(familyName) {
  if (cache.has(familyName)) return cache.get(familyName);

  const filePath = LOCAL_FILES[familyName];
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const raw = await readFile(filePath, "utf-8");
    const formulas = JSON.parse(raw);
    const { valid, invalid, errors } = validateRecords(formulas, IccFormulaSchema, familyName);
    if (invalid > 0) {
      console.warn(`[ICC] ${familyName}: ${invalid}/${valid + invalid} records failed validation`);
      for (const e of errors.slice(0, 5)) console.warn(`  ${e.id}: ${e.issues.join("; ")}`);
    }
    cache.set(familyName, formulas);
    console.log(`Loaded ${formulas.length} ICC formulas for ${familyName}`);
    return formulas;
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Returns ICC formulas for a family.
 * Returns null if no local data exists for the family.
 */
export async function getIccFormulas(familyName) {
  return loadFamily(familyName);
}

/**
 * Returns available ICC family names.
 */
export function getIccFamilyNames() {
  return Object.keys(LOCAL_FILES);
}
