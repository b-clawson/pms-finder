/**
 * Seed script: Downloads ICC UltraMix 7500 Coated formulas to local JSON.
 *
 * Usage: node scripts/seed-icc.js
 *
 * 1. Fetches a formula page to discover all formula IDs from the <select> dropdown
 * 2. For each formula ID, fetches /families/7/formulas/{id} and extracts embedded JSON
 * 3. Cross-references formula names against data/pantone_swatches.json for hex values
 * 4. Writes to data/icc_7500_coated.json
 * 5. Rate-limited (100ms between requests), resumable (skips already-fetched), progress logging
 */

import https from "node:https";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { IccFormulaSchema, validateRecords } from "../shared/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../data/icc_7500_coated.json");
const SWATCHES_PATH = resolve(__dirname, "../data/pantone_swatches.json");

const ICC_BASE = "https://www.iccultramix.com";
const FAMILY_ID = 7; // 7500 Coated
const DELAY_MS = 100;

const agent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production",
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function loadSwatchMap() {
  if (!existsSync(SWATCHES_PATH)) {
    console.warn("pantone_swatches.json not found — hex values will be empty");
    return new Map();
  }
  const swatches = JSON.parse(readFileSync(SWATCHES_PATH, "utf-8"));
  const map = new Map();
  for (const s of swatches) {
    // Keys: "PMS 100 C", etc.
    const key = (s.name || s.pms || "").toUpperCase().trim();
    if (key && s.hex) map.set(key, s.hex);
    // Also store just the code like "100 C"
    const short = key.replace(/^PMS\s*/, "").replace(/^PANTONE\s*/, "");
    if (short) map.set(short, s.hex);
  }
  return map;
}

// Standard Pantone reference hex values for specialty colors
const SPECIALTY_HEX = {
  "BLACK C": "#2D2926",
  "BLACK 2 C": "#332F21",
  "BLACK 3 C": "#212721",
  "BLACK 4 C": "#31261D",
  "BLACK 5 C": "#3E3D2D",
  "BLACK 6 C": "#101820",
  "BLACK 7 C": "#3D3935",
  "BLUE 072 C": "#0018A8",
  "BRIGHT RED C": "#F93822",
  "COOL GRAY 1 C": "#D9D9D6",
  "COOL GRAY 2 C": "#D0D0CE",
  "COOL GRAY 3 C": "#C8C9C7",
  "COOL GRAY 4 C": "#BBBCBC",
  "COOL GRAY 5 C": "#B1B3B3",
  "COOL GRAY 6 C": "#A7A8AA",
  "COOL GRAY 7 C": "#97999B",
  "COOL GRAY 8 C": "#888B8D",
  "COOL GRAY 9 C": "#75787B",
  "COOL GRAY 10 C": "#63666A",
  "COOL GRAY 11 C": "#53565A",
  "DARK BLUE C": "#00239C",
  "GREEN C": "#00AB84",
  "MEDIUM PURPLE C": "#4E008E",
  "ORANGE 021 C": "#FE5000",
  "PINK C": "#D62598",
  "PROCESS BLACK C": "#2D2926",
  "PROCESS BLUE C": "#0085CA",
  "PROCESS CYAN C": "#009FE3",
  "PROCESS MAGENTA C": "#D6006E",
  "PROCESS YELLOW C": "#FFD500",
  "PURPLE C": "#BB29BB",
  "RED 032 C": "#EF3340",
  "REFLEX BLUE C": "#001489",
  "RHODAMINE RED C": "#E10098",
  "RUBINE RED C": "#CE0058",
  "VIOLET C": "#440099",
  "VIOLET V2 C": "#440099",
  "WARM GRAY 1 C": "#D7D2CB",
  "WARM GRAY 2 C": "#CBC4BC",
  "WARM GRAY 3 C": "#BFB8AF",
  "WARM GRAY 4 C": "#B6ADA5",
  "WARM GRAY 5 C": "#ACA39A",
  "WARM GRAY 6 C": "#A59C94",
  "WARM GRAY 7 C": "#968C83",
  "WARM GRAY 8 C": "#8C8279",
  "WARM GRAY 9 C": "#83786F",
  "WARM GRAY 10 C": "#796E65",
  "WARM GRAY 10C": "#796E65",
  "WARM GRAY 11 C": "#6D6662",
  "WARM RED C": "#F9423A",
  "YELLOW C": "#FEDD00",
  "YELLOW 012 C": "#FFD700",
  "YELLOW PY12 C": "#FFD700",
};

function resolveHex(formulaName, swatchMap) {
  if (!formulaName) return null;
  let upper = formulaName.toUpperCase().trim();

  // Check specialty map first
  if (SPECIALTY_HEX[upper]) return SPECIALTY_HEX[upper];

  // Strip date suffixes: "113C - 6-2023", "282C - 8-2-24", "152C 10-29-24"
  upper = upper.replace(/\s*-?\s*\d{1,2}-\d{1,2}-?\d{2,4}$/, "");

  // Normalize "100C" → "100 C", "100U" → "100 U"
  upper = upper.replace(/(\d)([CU])$/, "$1 $2");

  // Try direct match
  if (swatchMap.has(upper)) return swatchMap.get(upper);

  // Try "PMS <name>"
  const withPms = `PMS ${upper}`;
  if (swatchMap.has(withPms)) return swatchMap.get(withPms);

  // Try "PANTONE <name>"
  const withPantone = `PANTONE ${upper}`;
  if (swatchMap.has(withPantone)) return swatchMap.get(withPantone);

  // Try appending " C" for coated
  if (!upper.endsWith(" C")) {
    const withC = `${upper} C`;
    if (swatchMap.has(withC)) return swatchMap.get(withC);
    const pmsC = `PMS ${withC}`;
    if (swatchMap.has(pmsC)) return swatchMap.get(pmsC);
  }

  return null;
}

async function discoverFormulaIds() {
  console.log("Discovering formula IDs from dropdown...");
  const html = await httpsGet(`${ICC_BASE}/families/${FAMILY_ID}/formulas/1`);

  const ids = [];
  // Match <option value="123">...</option> inside the formula select
  const optionRegex = /<option\s+value="(\d+)"/g;
  let match;
  while ((match = optionRegex.exec(html)) !== null) {
    const id = parseInt(match[1], 10);
    if (id > 0 && !ids.includes(id)) ids.push(id);
  }

  console.log(`Found ${ids.length} formula IDs`);
  return ids.sort((a, b) => a - b);
}

function extractFormulaData(html, formulaId) {
  // Look for embedded JSON in ultramix.formulas.current({...})
  const patterns = [
    /ultramix\.formulas\.current\((\{[\s\S]*?\})\)/,
    /formulaData\s*=\s*(\{[\s\S]*?\});/,
    /var\s+formula\s*=\s*(\{[\s\S]*?\});/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // Try with relaxed parsing — single quotes, trailing commas
        try {
          const cleaned = match[1]
            .replace(/'/g, '"')
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]");
          return JSON.parse(cleaned);
        } catch {
          continue;
        }
      }
    }
  }

  // Fallback: extract from HTML table
  return extractFromHtml(html, formulaId);
}

function extractFromHtml(html, formulaId) {
  // Try to extract formula name from heading
  const nameMatch = html.match(/<h[1-4][^>]*>\s*(.*?)\s*<\/h[1-4]>/i);
  const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, "").trim() : `Formula ${formulaId}`;

  // Extract table rows for formula lines
  const lines = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }
    if (cells.length >= 3) {
      const pctVal = parseFloat(cells[2]) || parseFloat(cells[1]) || 0;
      if (pctVal > 0) {
        lines.push({
          part_number: cells[0] || "",
          name: cells[1] || cells[0] || "",
          percent: pctVal,
          weight: parseFloat(cells[3]) || 0,
          category: cells[4] || "",
          density: parseFloat(cells[5]) || 0,
        });
      }
    }
  }

  return { name, lines };
}

async function main() {
  const swatchMap = loadSwatchMap();
  console.log(`Loaded ${swatchMap.size} swatch entries for hex lookup`);

  // Load existing data for resume support
  let existing = [];
  const existingIds = new Set();
  if (existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    for (const f of existing) existingIds.add(f.id || f.code);
    console.log(`Resuming: ${existing.length} formulas already downloaded`);
  }

  const formulaIds = await discoverFormulaIds();
  if (formulaIds.length === 0) {
    console.error("No formula IDs found. The page format may have changed.");
    process.exit(1);
  }

  const results = [...existing];
  let fetched = 0;
  let skipped = 0;
  let errors = 0;

  for (const id of formulaIds) {
    if (existingIds.has(String(id)) || existingIds.has(id)) {
      skipped++;
      continue;
    }

    try {
      const html = await httpsGet(`${ICC_BASE}/families/${FAMILY_ID}/formulas/${id}`);
      const data = extractFormulaData(html, id);

      if (data) {
        const name = data.name || data.formula_name || `Formula ${id}`;
        const lines = data.lines || data.formula_lines || [];
        const hex = resolveHex(name, swatchMap);

        const formula = {
          id: String(id),
          code: name,
          name: name,
          hex: hex || null,
          family: "7500 Coated",
          lines: lines.map((l) => ({
            part_number: l.part_number || l.partNumber || "",
            name: l.name || l.component_name || "",
            percent: parseFloat(l.percent || l.percentage || 0),
            weight: parseFloat(l.weight || l.grams || 0),
            category: l.category || l.type || "",
            density: parseFloat(l.density || 0),
          })),
        };
        const check = IccFormulaSchema.safeParse(formula);
        if (!check.success) {
          console.warn(`  Schema warning for formula ${id}: ${check.error.issues.map(i => i.message).join("; ")}`);
        }
        results.push(formula);
        existingIds.add(String(id));
        fetched++;
      }

      // Progress logging every 50 formulas
      if ((fetched + skipped) % 50 === 0) {
        console.log(
          `Progress: ${fetched} fetched, ${skipped} skipped, ${errors} errors / ${formulaIds.length} total`
        );
        // Save periodically
        writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
      }
    } catch (err) {
      errors++;
      console.error(`Error fetching formula ${id}: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  const { valid, invalid } = validateRecords(results, IccFormulaSchema, "ICC 7500 Coated");
  console.log(`\nValidation: ${valid} valid, ${invalid} invalid out of ${results.length}`);
  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Done! ${results.length} total formulas saved to ${OUTPUT_PATH}`);
  console.log(`Fetched: ${fetched}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
