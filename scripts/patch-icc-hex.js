/**
 * Patch script: Resolves missing hex values in ICC UltraMix data.
 *
 * Addresses two categories of null-hex records:
 *   1. Specialty Pantone names (PROCESS CYAN C, REFLEX BLUE C, COOL GRAY 1 C, etc.)
 *      that aren't in the standard PMS swatch database
 *   2. Date-suffixed names (e.g., "113C - 6-2023") where the suffix prevents matching
 *
 * Usage: node scripts/patch-icc-hex.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICC_PATH = resolve(__dirname, "../data/icc_7500_coated.json");
const SWATCHES_PATH = resolve(__dirname, "../data/pantone_swatches.json");

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

function loadSwatchMap() {
  if (!existsSync(SWATCHES_PATH)) return new Map();
  const swatches = JSON.parse(readFileSync(SWATCHES_PATH, "utf-8"));
  const map = new Map();
  for (const s of swatches) {
    const key = (s.name || s.pms || "").toUpperCase().trim();
    if (key && s.hex) map.set(key, s.hex);
    const short = key.replace(/^PMS\s*/, "").replace(/^PANTONE\s*/, "");
    if (short) map.set(short, s.hex);
  }
  return map;
}

function resolveHex(formulaName, swatchMap) {
  if (!formulaName) return null;
  let upper = formulaName.toUpperCase().trim();

  // Check specialty map first
  if (SPECIALTY_HEX[upper]) return SPECIALTY_HEX[upper];

  // Strip date suffixes: "113C - 6-2023", "282C - 8-2-24", "152C 10-29-24"
  upper = upper.replace(/\s*-?\s*\d{1,2}-\d{1,2}-?\d{2,4}$/, "");

  // Normalize "126C" → "126 C"
  upper = upper.replace(/(\d)([CU])$/, "$1 $2");

  if (swatchMap.has(upper)) return swatchMap.get(upper);
  if (swatchMap.has(`PMS ${upper}`)) return swatchMap.get(`PMS ${upper}`);
  if (swatchMap.has(`PANTONE ${upper}`)) return swatchMap.get(`PANTONE ${upper}`);

  if (!upper.endsWith(" C")) {
    const withC = `${upper} C`;
    if (swatchMap.has(withC)) return swatchMap.get(withC);
    if (swatchMap.has(`PMS ${withC}`)) return swatchMap.get(`PMS ${withC}`);
  }

  return null;
}

// --- Main ---
const formulas = JSON.parse(readFileSync(ICC_PATH, "utf-8"));
const swatchMap = loadSwatchMap();
const nullBefore = formulas.filter((f) => f.hex === null).length;
console.log(`Loaded ${formulas.length} ICC formulas (${nullBefore} with null hex)`);

let resolved = 0;
let bySpecialty = 0;
let byDateStrip = 0;

for (const f of formulas) {
  if (f.hex !== null) continue;
  const hex = resolveHex(f.name, swatchMap);
  if (hex) {
    f.hex = hex;
    resolved++;
    const upper = f.name.toUpperCase().trim();
    if (SPECIALTY_HEX[upper]) bySpecialty++;
    else byDateStrip++;
  }
}

const nullAfter = formulas.filter((f) => f.hex === null).length;

console.log(`\nResults:`);
console.log(`  Resolved: ${resolved} (${bySpecialty} specialty, ${byDateStrip} date-suffix)`);
console.log(`  Before: ${nullBefore} null hex → After: ${nullAfter} null hex`);

writeFileSync(ICC_PATH, JSON.stringify(formulas, null, 2));
console.log(`\nUpdated ${ICC_PATH}`);
