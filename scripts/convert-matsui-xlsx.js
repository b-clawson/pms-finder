import XLSX from "xlsx";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Component code → hex color mapping (from Matsui API + manual fills)
const COMP_HEX = {
  // From API
  "CLR 301C": "FFFFFF",
  "MAT 301M": "FFFFFF",
  "PNK MB": "CB6597",
  "BLU MB": "0066B0",
  "VLT MFB": "654285",
  "BLU MG": "008EB9",
  "GRN MB": "00A073",
  "YEL M3G": "FADC00",
  "SLVRSM 620": "9F9B92",
  "RED MFB": "C92A4F",
  "ORNG MGD": "F8622C",
  "GLDYEL MFR": "FFBD0D",
  "RED MGD": "E84446",
  "GOLDSM 620": "FADC00",
  "VLT ECGR": "654285",
  "ROSE EC5B": "CB487E",
  "PNK EC5B": "EA1679",
  "ORNG ECR": "F95D4C",
  "YEL ECB": "F8FA00",
  "GRN EC5G": "A8EA16",
  "BLU ECBR": "008EB9",
  "BLK MK": "3E3D39",
  "BRITE DSCHRG BASE": "FFFFFF",
  // Manual fills
  "BR DSCHRG BASE": "FFFFFF",
  "EP WHT 301": "FFFFFF",
  "WH301W-B": "FFFFFF",
  "ST CLR 301-5": "FFFFFF",
  "ST WHT 301-5": "FFFFFF",
  "NEO BLACK BK": "000000",
  "Navy B": "1A2355",
  "NEO VIOLET MSGR": "654285",
  "SLVRSM 602": "C0C0C0",
};

// Known base/clear/matte/white component codes
const BASE_CODES = new Set([
  "CLR 301C", "MAT 301M", "EP WHT 301", "WH301W-B",
  "ST CLR 301-5", "ST WHT 301-5", "BR DSCHRG BASE",
  "BRITE DSCHRG BASE",
]);

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function blendComponents(components) {
  let r = 0, g = 0, b = 0, total = 0;
  for (const c of components) {
    if (!c.hex || c.hex.length < 6) continue;
    const rgb = hexToRgb(c.hex);
    r += rgb.r * c.percentage;
    g += rgb.g * c.percentage;
    b += rgb.b * c.percentage;
    total += c.percentage;
  }
  if (total === 0) return "888888";
  const rr = Math.round(r / total).toString(16).padStart(2, "0");
  const gg = Math.round(g / total).toString(16).padStart(2, "0");
  const bb = Math.round(b / total).toString(16).padStart(2, "0");
  return `${rr}${gg}${bb}`;
}

// --- Main ---
const inputPath = process.argv[2] || resolve(__dirname, "../data/matsui_301_rc_neo_raw.xlsx");
const outputPath = resolve(__dirname, "../data/matsui_301_rc_neo.json");

console.log(`Reading: ${inputPath}`);
const workbook = XLSX.readFile(inputPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`Rows: ${rows.length}`);

// Group by FormulaCode
const grouped = new Map();
for (const row of rows) {
  const code = String(row.FormulaCode || "").trim();
  if (!code) continue;
  if (!grouped.has(code)) {
    grouped.set(code, {
      desc: String(row.FormulaDescription || "").trim(),
      components: [],
    });
  }
  const compCode = String(row.ComponentCode || "").trim();
  const hex = COMP_HEX[compCode] || "";
  grouped.get(code).components.push({
    componentCode: compCode,
    componentDescription: String(row.ComponentDescription || "").trim(),
    percentage: Number(row.Percentage) || 0,
    hex,
    isBase: BASE_CODES.has(compCode),
  });
}

console.log(`Unique formulas: ${grouped.size}`);

// Build output array
const formulas = [];
let missingHex = 0;
for (const [code, data] of grouped) {
  const swatchColor = blendComponents(data.components);
  for (const c of data.components) {
    if (!c.hex) missingHex++;
  }
  formulas.push({
    _id: code,
    formulaCode: code,
    formulaDescription: data.desc,
    formulaSeries: "301 RC Neo",
    formulaColor: "",
    formulaSwatchColor: {
      _id: code,
      formulaCode: code,
      formulaColor: swatchColor,
    },
    components: data.components,
  });
}

// Sort by formula code (numeric first, then alpha)
formulas.sort((a, b) => {
  const aNum = parseInt(a.formulaCode);
  const bNum = parseInt(b.formulaCode);
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
  if (!isNaN(aNum)) return -1;
  if (!isNaN(bNum)) return 1;
  return a.formulaCode.localeCompare(b.formulaCode);
});

writeFileSync(outputPath, JSON.stringify(formulas, null, 2));
console.log(`Wrote ${formulas.length} formulas to ${outputPath}`);
if (missingHex > 0) {
  console.log(`Warning: ${missingHex} components had no hex mapping`);
}
