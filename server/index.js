import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { normalizeHex } from "./color.js";
import { matchPms, getAllSwatches } from "./matcher.js";
import { matsuiGet, matsuiPost } from "./matsuiClient.js";
import { getLocalFormulas } from "./matsuiData.js";

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

// SPA fallback — serve index.html for non-API routes (production build)
app.get("*", (req, res) => {
  res.sendFile(resolve(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`PMS Finder API → http://localhost:${PORT}`);
  console.log(`Serving static from: ${staticDir}`);
});
