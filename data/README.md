# Pantone Swatch Data

This directory is where the real Pantone swatch database goes.

## How to upgrade from stub data

1. Add a file called `pantone_swatches.json` to this directory.
2. The file should be a JSON array of objects with this schema:

```json
[
  {
    "pms": "186",
    "series": "C",
    "hex": "#C8102E",
    "name": "186 C",
    "notes": ""
  }
]
```

### Field reference

| Field    | Type   | Required | Description                                  |
|----------|--------|----------|----------------------------------------------|
| `pms`    | string | yes      | PMS number or name (e.g. "186", "Process Blue") |
| `series` | string | yes      | "C" (Coated) or "U" (Uncoated)              |
| `hex`    | string | yes      | Hex color value, "#RRGGBB"                   |
| `name`   | string | no       | Human-readable name                          |
| `notes`  | string | no       | Any extra notes                              |

3. Restart the server. The matcher will automatically detect the file and switch from stub mode to live mode.

## Future improvements

- Upgrade `server/color.js` to use CIE Lab color space and CIEDE2000 (ΔE00) for perceptually accurate matching.
- Support CSV import as an alternative to JSON.
