import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { normalizeHex, hexToRgb, rgbDistance } from "./color.js";
import { matchPms, getAllSwatches } from "./matcher.js";
import { matsuiGet, matsuiPost } from "./matsuiClient.js";
import { getLocalFormulas } from "./matsuiData.js";
import { getGGColors, getGGFormula } from "./ggClient.js";
import { getAllFnInkColors, getFnInkMaterials } from "./fninkClient.js";
import { getIccFormulas, getIccFamilyNames } from "./iccData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve Vite build output (production) or old web/ dir as fallback
const distDir = resolve(__dirname, "../dist");
const webDir = resolve(__dirname, "../web");
const staticDir = existsSync(distDir) ? distDir : webDir;
app.use(express.static(staticDir));
app.use(express.json());

// API endpoint
app.get("/api/pms", async (req, res) => {
  const { hex, series: rawSeries, limit: rawLimit } = req.query;

  // --- Validate hex ---
  if (!hex) {
    return res.status(400).json({ error: "Missing required query param: hex" });
  }
  const normHex = normalizeHex(hex);
  if (!normHex) {
    return res.status(400).json({ error: "Invalid hex format. Expected #RRGGBB or RRGGBB." });
  }

  // --- Validate series ---
  const VALID_SERIES = ["C", "U", "BOTH"];
  const series = rawSeries ? rawSeries.toUpperCase() : "BOTH";
  if (!VALID_SERIES.includes(series)) {
    return res.status(400).json({ error: `Invalid series. Expected one of: ${VALID_SERIES.join(", ")}` });
  }

  // --- Validate limit ---
  let limit = parseInt(rawLimit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  try {
    const { results, mode } = await matchPms(normHex, series, limit);

    res.json({
      input: { hex: normHex, series, limit },
      results,
      meta: {
        mode,
        note: mode === "stub"
          ? "Pantone database not installed yet. Using stub data."
          : `Matched against live swatch database.`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All swatches endpoint
app.get("/api/swatches", async (req, res) => {
  try {
    const { swatches, mode } = await getAllSwatches();
    res.json({ swatches, mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Matsui API proxy ---
app.get("/api/matsui/series", async (req, res) => {
  try {
    const data = await matsuiGet("components/GetSeries", { useCache: true });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch Matsui series", detail: err.message });
  }
});

app.get("/api/matsui/pigments", async (req, res) => {
  try {
    const data = await matsuiGet("components/GetPigments", { useCache: true });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch Matsui pigments", detail: err.message });
  }
});

app.post("/api/matsui/formulas", async (req, res) => {
  try {
    const { formulaSeries, formulaSearchQuery } = req.body || {};

    // Try local data first (full catalog from Excel exports)
    const local = await getLocalFormulas(formulaSeries, formulaSearchQuery);
    if (local) {
      return res.json(local);
    }

    // Fall back to Matsui API for series without local data
    const data = await matsuiPost("components/GetFormulas", req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch Matsui formulas", detail: err.message });
  }
});

app.post("/api/matsui/closest", async (req, res) => {
  try {
    const data = await matsuiPost("components/GetClosestColors", req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch closest Matsui colors", detail: err.message });
  }
});

// Server-side Matsui color matching
app.get("/api/matsui/match", async (req, res) => {
  const { hex, series, limit: rawLimit } = req.query;

  if (!hex) {
    return res.status(400).json({ error: "Missing required query param: hex" });
  }
  const normHex = normalizeHex(hex);
  if (!normHex) {
    return res.status(400).json({ error: "Invalid hex format. Expected #RRGGBB or RRGGBB." });
  }
  if (!series) {
    return res.status(400).json({ error: "Missing required query param: series" });
  }

  let limit = parseInt(rawLimit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  try {
    // Try local data first, then fall back to API
    let formulas = await getLocalFormulas(series, "");
    if (!formulas) {
      const apiRes = await matsuiPost("components/GetFormulas", {
        formulaSeries: series,
        formulaSearchQuery: "",
        userCompany: "",
        selectedCompany: "",
        userEmail: "",
      });
      formulas = Array.isArray(apiRes) ? apiRes : [];
    }

    const targetRgb = hexToRgb(normHex);

    const scored = formulas
      .map((f) => {
        const fHex = f.formulaSwatchColor?.formulaColor
          ? `#${f.formulaSwatchColor.formulaColor}`
          : f.formulaColor
            ? `#${f.formulaColor}`
            : null;
        if (!fHex || fHex === "#888888") return null;
        const fRgb = hexToRgb(fHex);
        const distance = Math.round(rgbDistance(targetRgb, fRgb) * 100) / 100;
        return { ...f, resolvedHex: fHex, distance };
      })
      .filter(Boolean);

    scored.sort((a, b) => a.distance - b.distance);

    res.json(scored.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: "Failed to match Matsui formulas", detail: err.message });
  }
});

// --- Green Galaxy API proxy ---
app.get("/api/gg/match", async (req, res) => {
  const { hex, category, limit: rawLimit } = req.query;

  if (!hex) {
    return res.status(400).json({ error: "Missing required query param: hex" });
  }
  const normHex = normalizeHex(hex);
  if (!normHex) {
    return res.status(400).json({ error: "Invalid hex format. Expected #RRGGBB or RRGGBB." });
  }

  const cat = (category || "UD").toUpperCase();
  if (cat !== "UD" && cat !== "CD") {
    return res.status(400).json({ error: "Invalid category. Expected UD or CD." });
  }

  let limit = parseInt(rawLimit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  try {
    const colors = await getGGColors(cat);
    const targetRgb = hexToRgb(normHex);

    const scored = colors.map((c) => {
      const distance = Math.round(rgbDistance(targetRgb, { r: c.r, g: c.g, b: c.b }) * 100) / 100;
      return { _id: c._id, code: c.code, name: c.name, hex: c.hex, distance };
    });

    scored.sort((a, b) => a.distance - b.distance);
    res.json(scored.slice(0, limit));
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch GG colors", detail: err.message });
  }
});

app.get("/api/gg/formula", async (req, res) => {
  const { code, category } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing required query param: code" });
  }

  const cat = (category || "UD").toUpperCase();
  if (cat !== "UD" && cat !== "CD") {
    return res.status(400).json({ error: "Invalid category. Expected UD or CD." });
  }

  try {
    const formula = await getGGFormula(code, cat);
    res.json(formula);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch GG formula", detail: err.message });
  }
});

// --- FN-INK API proxy ---
app.get("/api/fnink/match", async (req, res) => {
  const { hex, limit: rawLimit } = req.query;

  if (!hex) {
    return res.status(400).json({ error: "Missing required query param: hex" });
  }
  const normHex = normalizeHex(hex);
  if (!normHex) {
    return res.status(400).json({ error: "Invalid hex format. Expected #RRGGBB or RRGGBB." });
  }

  let limit = parseInt(rawLimit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  try {
    const colors = await getAllFnInkColors();
    const targetRgb = hexToRgb(normHex);

    const scored = colors
      .map((c) => {
        if (!c.hex) return null;
        const cHex = c.hex.startsWith("#") ? c.hex : `#${c.hex}`;
        const cRgb = hexToRgb(cHex);
        if (!cRgb) return null;
        const distance = Math.round(rgbDistance(targetRgb, cRgb) * 100) / 100;
        return {
          id: c.id,
          code: c.code,
          name: c.name,
          hex: cHex,
          distance,
          formula: c.formula,
        };
      })
      .filter(Boolean);

    scored.sort((a, b) => a.distance - b.distance);
    res.json(scored.slice(0, limit));
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch FN-INK colors", detail: err.message });
  }
});

app.get("/api/fnink/materials", async (req, res) => {
  try {
    const materials = await getFnInkMaterials();
    res.json(materials);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch FN-INK materials", detail: err.message });
  }
});

// --- ICC UltraMix routes ---
app.get("/api/icc/match", async (req, res) => {
  const { hex, family, limit: rawLimit } = req.query;

  if (!hex) {
    return res.status(400).json({ error: "Missing required query param: hex" });
  }
  const normHex = normalizeHex(hex);
  if (!normHex) {
    return res.status(400).json({ error: "Invalid hex format. Expected #RRGGBB or RRGGBB." });
  }

  const familyName = family || "7500 Coated";

  let limit = parseInt(rawLimit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  try {
    const formulas = await getIccFormulas(familyName);
    if (!formulas) {
      return res.status(404).json({ error: `No ICC data for family: ${familyName}` });
    }

    const targetRgb = hexToRgb(normHex);

    const scored = formulas
      .map((f) => {
        if (!f.hex) return null;
        const fHex = f.hex.startsWith("#") ? f.hex : `#${f.hex}`;
        const fRgb = hexToRgb(fHex);
        if (!fRgb) return null;
        const distance = Math.round(rgbDistance(targetRgb, fRgb) * 100) / 100;
        return {
          id: f.id || f.code,
          code: f.code,
          name: f.name,
          hex: fHex,
          distance,
          family: familyName,
          lines: f.lines || [],
        };
      })
      .filter(Boolean);

    scored.sort((a, b) => a.distance - b.distance);
    res.json(scored.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: "Failed to match ICC formulas", detail: err.message });
  }
});

app.get("/api/icc/families", async (req, res) => {
  res.json(getIccFamilyNames());
});

// SPA fallback — serve index.html for non-API routes (production build)
app.get("*", (req, res) => {
  res.sendFile(resolve(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`PMS Finder API → http://localhost:${PORT}`);
  console.log(`Serving static from: ${staticDir}`);
});
