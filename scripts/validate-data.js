/**
 * Standalone data integrity script.
 *
 * Loads all 7 JSON data files and runs:
 *   - Zod schema validation on every record
 *   - Minimum expected record counts (catches catastrophic scrape failures)
 *   - Percentage sum checks (1% tolerance for ICC, 5% for Matsui)
 *   - Duplicate PMS+series check for swatches
 *
 * Exit code 1 on schema errors; sum/count issues are warnings only.
 *
 * Usage: node scripts/validate-data.js
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  IccFormulaSchema,
  MatsuiFormulaSchema,
  PantoneSwatchSchema,
  validateRecords,
} from "../shared/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "../data");

// --- File manifest ---
const FILES = {
  icc: [{ label: "ICC 7500 Coated", file: "icc_7500_coated.json", minRecords: 2000 }],
  matsui: [
    { label: "Matsui 301 RC Neo",       file: "matsui_301_rc_neo.json",       minRecords: 100 },
    { label: "Matsui Alpha Discharge",  file: "matsui_alpha_discharge.json",  minRecords: 100 },
    { label: "Matsui Brite Discharge",  file: "matsui_brite_discharge.json",  minRecords: 100 },
    { label: "Matsui HM Discharge",     file: "matsui_hm_discharge.json",     minRecords: 100 },
    { label: "Matsui OW Stretch",       file: "matsui_ow_stretch.json",       minRecords: 100 },
  ],
  pantone: [{ label: "Pantone Swatches", file: "pantone_swatches.json", minRecords: 800 }],
};

let hasSchemaErrors = false;
let warnings = 0;

function loadJson(filename) {
  const path = resolve(dataDir, filename);
  if (!existsSync(path)) {
    console.warn(`  SKIP: ${filename} not found`);
    return null;
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

function printResult(result) {
  const status = result.invalid === 0 ? "PASS" : "FAIL";
  console.log(`  [${status}] ${result.label}: ${result.valid}/${result.total} valid`);
  if (result.invalid > 0) {
    hasSchemaErrors = true;
    for (const err of result.errors) {
      console.log(`    record ${err.id}: ${err.issues.join("; ")}`);
    }
    if (result.invalid > result.errors.length) {
      console.log(`    ... and ${result.invalid - result.errors.length} more errors`);
    }
  }
}

function checkMinRecords(data, label, minRecords) {
  if (data.length < minRecords) {
    console.warn(`  WARN: ${label} has only ${data.length} records (expected >= ${minRecords})`);
    warnings++;
  }
}

function checkPercentageSums(data, label, idKey, linesKey, pctKey, tolerance) {
  let outOfRange = 0;
  const examples = [];
  for (const record of data) {
    const items = record[linesKey];
    if (!items || items.length === 0) continue;
    const sum = items.reduce((s, item) => s + (item[pctKey] || 0), 0);
    if (Math.abs(sum - 100) > tolerance) {
      outOfRange++;
      if (examples.length < 5) {
        examples.push({ id: record[idKey], sum: Math.round(sum * 100) / 100 });
      }
    }
  }
  if (outOfRange > 0) {
    console.warn(`  WARN: ${label} — ${outOfRange} records with percentage sum outside 100 ± ${tolerance}%`);
    for (const ex of examples) {
      console.warn(`    ${ex.id}: sum = ${ex.sum}%`);
    }
    warnings++;
  }
}

function checkDuplicateSwatches(data) {
  const seen = new Map();
  let dupes = 0;
  for (const s of data) {
    const key = `${s.pms}-${s.series}`;
    if (seen.has(key)) {
      dupes++;
      if (dupes <= 5) console.warn(`  WARN: duplicate swatch ${key}`);
    } else {
      seen.set(key, true);
    }
  }
  if (dupes > 0) {
    console.warn(`  WARN: ${dupes} total duplicate PMS+series entries`);
    warnings++;
  }
}

// ── Main ──
console.log("\n=== Data Validation Report ===\n");

// 1. ICC
console.log("ICC Formulas:");
for (const { label, file, minRecords } of FILES.icc) {
  const data = loadJson(file);
  if (!data) continue;
  const result = validateRecords(data, IccFormulaSchema, label);
  printResult(result);
  checkMinRecords(data, label, minRecords);
  checkPercentageSums(data, label, "code", "lines", "percent", 1);
}

// 2. Matsui
console.log("\nMatsui Formulas:");
for (const { label, file, minRecords } of FILES.matsui) {
  const data = loadJson(file);
  if (!data) continue;
  const result = validateRecords(data, MatsuiFormulaSchema, label);
  printResult(result);
  checkMinRecords(data, label, minRecords);
  checkPercentageSums(data, label, "formulaCode", "components", "percentage", 5);
  // Report junk records that would be filtered at runtime
  let junkCount = 0;
  for (const record of data) {
    const code = record.formulaCode || "";
    if (code.startsWith("COPY:") || code === "TEST") { junkCount++; continue; }
    const pctSum = (record.components || []).reduce((s, c) => s + (c.percentage || 0), 0);
    if (pctSum > 110) junkCount++;
  }
  if (junkCount > 0) {
    console.log(`  INFO: ${junkCount} junk records filtered at runtime (COPY/TEST/bad sums)`);
  }
}

// 3. Pantone
console.log("\nPantone Swatches:");
for (const { label, file, minRecords } of FILES.pantone) {
  const data = loadJson(file);
  if (!data) continue;
  const result = validateRecords(data, PantoneSwatchSchema, label);
  printResult(result);
  checkMinRecords(data, label, minRecords);
  checkDuplicateSwatches(data);
}

// --- Summary ---
console.log("\n--- Summary ---");
if (hasSchemaErrors) {
  console.error("Schema validation FAILED — see errors above.");
} else {
  console.log("All schema checks passed.");
}
if (warnings > 0) {
  console.warn(`${warnings} warning(s) — review above.`);
}
console.log("");

process.exit(hasSchemaErrors ? 1 : 0);
