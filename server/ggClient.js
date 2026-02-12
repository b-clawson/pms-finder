import https from "node:https";

const GG_BASE = "https://gg-fusion-dba9a0f2a2e0.herokuapp.com/api/v2";
const agent = new https.Agent({ rejectUnauthorized: false });

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

function ggGet(path, { useCache = false } = {}) {
  if (useCache) {
    const cached = getCached(`GET:${path}`);
    if (cached) return Promise.resolve(cached);
  }

  const url = `${GG_BASE}/${path}`;
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (useCache) setCache(`GET:${path}`, parsed);
          resolve(parsed);
        } catch (e) {
          reject(new Error("Invalid JSON from GG Fusion API"));
        }
      });
    }).on("error", reject);
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
