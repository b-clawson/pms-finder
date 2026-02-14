import https from "node:https";

const GG_BASE = "https://gg-fusion-dba9a0f2a2e0.herokuapp.com/api/v2";
const agent = new https.Agent({ rejectUnauthorized: false });
const REQUEST_TIMEOUT = 15_000;

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

/** Lightweight shape check for GG responses. */
function looksValid(path, data) {
  if (data == null || typeof data !== "object") {
    console.warn(`[GG] Invalid response for ${path}: not an object/array`);
    return false;
  }
  if (path.startsWith("colors/")) {
    if (!Array.isArray(data)) {
      console.warn(`[GG] Expected array for ${path}, got ${typeof data}`);
      return false;
    }
    if (data.length > 0 && (typeof data[0].code !== "string" || typeof data[0].r !== "number")) {
      console.warn(`[GG] First element of ${path} missing expected fields (code, r)`);
      return false;
    }
  }
  return true;
}

function ggGet(path, { useCache = false } = {}) {
  if (useCache) {
    const cached = getCached(`GET:${path}`);
    if (cached) return Promise.resolve(cached);
  }

  const url = `${GG_BASE}/${path}`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (useCache) {
            if (looksValid(path, parsed)) {
              setCache(`GET:${path}`, parsed);
            } else {
              console.warn(`[GG] Skipping cache for ${path} due to invalid response`);
            }
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error("Invalid JSON from GG Fusion API"));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(REQUEST_TIMEOUT, () => {
      req.destroy(new Error(`GG API timeout after ${REQUEST_TIMEOUT}ms: ${path}`));
    });
  });
}

/** Get all colors for a category (UD or CD). Cached. */
export async function getGGColors(category) {
  return ggGet(`colors/${category}`, { useCache: true });
}

/** Get formula for a specific color code + category. Not cached (individual lookups). */
export async function getGGFormula(code, category) {
  return ggGet(`formulas/${encodeURIComponent(code)}/${category}`);
}
