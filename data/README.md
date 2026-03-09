# Swatch & Formula Data

This directory contains all color swatch and ink formula databases used by PMS Finder. Every JSON file is validated at load time against Zod schemas defined in `shared/schemas.js`.

## Data files

| File | Source | Records | Description |
|------|--------|---------|-------------|
| `pantone_swatches.json` | PeakTech PMS Color Chart | ~900 | Pantone PMS color swatches (C and U series) |
| `icc_7500_coated.json` | ICC UltraMix website | ~4,500 | ICC UltraMix 7500 Coated ink formulas |
| `matsui_301_rc_neo.json` | Matsui XLSX export | varies | Matsui 301 RC Neo ink formulas |
| `matsui_alpha_discharge.json` | Matsui XLSX export | varies | Matsui Alpha Discharge ink formulas |
| `matsui_brite_discharge.json` | Matsui XLSX export | varies | Matsui Brite Discharge ink formulas |
| `matsui_hm_discharge.json` | Matsui XLSX export | varies | Matsui HM Discharge ink formulas |
| `matsui_ow_stretch.json` | Matsui XLSX export | varies | Matsui OW Stretch ink formulas |

## Schemas

All schemas are defined in `shared/schemas.js` and enforced via Zod validation.

### Pantone swatches (`pantone_swatches.json`)

```json
{
  "pms": "186",
  "series": "C",
  "hex": "#C8102E",
  "name": "186 C",
  "notes": "Source: PeakTech PMS Color Chart"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pms` | string | yes | PMS number or name (e.g. "186", "Process Blue") |
| `series` | string | yes | "C" (Coated) or "U" (Uncoated) |
| `hex` | string | yes | Hex color value, `#RRGGBB` |
| `name` | string | yes | Human-readable name |
| `notes` | string | yes | Any extra notes (can be empty string) |

If `pantone_swatches.json` is missing, the server falls back to a small set of stub swatches (`server/stubSwatches.js`).

### ICC UltraMix formulas (`icc_7500_coated.json`)

```json
{
  "id": "4592",
  "code": "100C",
  "name": "100C",
  "hex": "#F4ED7C",
  "family": "7500 Coated",
  "lines": [
    {
      "part_number": "7538",
      "name": "Mixing White",
      "percent": 62.8,
      "weight": 62.8,
      "category": "primary",
      "density": 13.27
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique formula ID |
| `code` | string | yes | Formula code (often matches a PMS name) |
| `name` | string | yes | Formula name |
| `hex` | string\|null | yes | Hex color value `#RRGGBB`, or null if unresolved |
| `family` | string | yes | Ink family name (e.g. "7500 Coated") |
| `lines` | array | yes | Formula components (min 1) |

Each line: `part_number`, `name`, `percent`, `weight`, `category`, `density`.

### Matsui formulas (`matsui_*.json`)

```json
{
  "_id": "000",
  "formulaCode": "000",
  "formulaDescription": "000",
  "formulaSeries": "301 RC Neo",
  "formulaColor": "",
  "formulaSwatchColor": {
    "_id": "000",
    "formulaCode": "000",
    "formulaColor": "1a2355"
  },
  "components": [
    {
      "componentCode": "Navy B",
      "componentDescription": "",
      "percentage": 100,
      "hex": "1A2355",
      "isBase": false
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | string | yes | Unique formula ID |
| `formulaCode` | string | yes | Formula code |
| `formulaDescription` | string | yes | Human-readable description |
| `formulaSeries` | string | yes | Ink series name |
| `formulaColor` | string | yes | Color description (can be empty) |
| `formulaSwatchColor` | object | yes | Swatch color reference with `_id`, `formulaCode`, `formulaColor` |
| `components` | array | yes | Formula components (min 1) |

Each component: `componentCode`, `componentDescription`, `percentage`, `hex` (6-char hex or null), `isBase`.

Junk Matsui records (codes starting with `COPY:`, code `TEST`, or percentage sums > 110%) are filtered at runtime by `server/matsuiData.js`.

## Scripts

| Command | Script | Description |
|---------|--------|-------------|
| `npm run seed:icc` | `scripts/seed-icc.js` | Scrape ICC UltraMix 7500 Coated formulas to `icc_7500_coated.json` (resumable, rate-limited) |
| `npm run patch:icc` | `scripts/patch-icc-hex.js` | Resolve null hex values in ICC data using specialty Pantone lookups and date-suffix stripping |
| `node scripts/convert-matsui-xlsx.js` | `scripts/convert-matsui-xlsx.js` | Convert Matsui XLSX exports to JSON (expects `*_raw.xlsx` files in this directory) |
| `npm run validate:data` | `scripts/validate-data.js` | Run Zod schema validation, record count checks, percentage sum checks, and duplicate detection across all data files |

## Future improvements

- Upgrade `server/color.js` to use CIE Lab color space and CIEDE2000 (ΔE00) for perceptually accurate matching (currently uses RGB Euclidean distance).
- Support CSV import as an alternative to JSON.