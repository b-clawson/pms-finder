import https from "node:https";

const FNINK_API = "https://fnink-mixing-server.herokuapp.com/api";
const agent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production",
});
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

/** Lightweight shape check for GraphQL response data. */
function looksValidGraphQL(cacheKey, data) {
  if (data == null || typeof data !== "object") {
    console.warn(`[FN-INK] Invalid GraphQL data for ${cacheKey}: not an object`);
    return false;
  }
  if (cacheKey === "fnink:colors" && data.colors) {
    if (!Array.isArray(data.colors)) {
      console.warn(`[FN-INK] Expected colors array for ${cacheKey}`);
      return false;
    }
    if (data.colors.length > 0 && typeof data.colors[0].code !== "string") {
      console.warn(`[FN-INK] First color missing 'code' field`);
      return false;
    }
  }
  if (cacheKey === "fnink:materials" && data.materials) {
    if (!Array.isArray(data.materials)) {
      console.warn(`[FN-INK] Expected materials array for ${cacheKey}`);
      return false;
    }
  }
  return true;
}

function graphqlPost(query, { useCache = false, cacheKey = "" } = {}) {
  if (useCache && cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return Promise.resolve(cached);
  }

  const body = JSON.stringify({ query });
  const url = new URL(FNINK_API);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: "POST",
    agent,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            reject(new Error(parsed.errors[0]?.message || "GraphQL error"));
            return;
          }
          if (useCache && cacheKey) {
            if (looksValidGraphQL(cacheKey, parsed.data)) {
              setCache(cacheKey, parsed.data);
            } else {
              console.warn(`[FN-INK] Skipping cache for ${cacheKey} due to invalid response`);
            }
          }
          resolve(parsed.data);
        } catch (e) {
          reject(new Error("Invalid JSON from FN-INK API"));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(REQUEST_TIMEOUT, () => {
      req.destroy(new Error(`FN-INK API timeout after ${REQUEST_TIMEOUT}ms`));
    });
    req.write(body);
    req.end();
  });
}

/** Get all FN-INK colors with inline formulas. Cached. */
export async function getAllFnInkColors() {
  const query = `{
    colors {
      id
      code
      name
      hex
      formula {
        multiplier
        materials {
          amount
          material {
            id
            name
            hex
          }
        }
      }
    }
  }`;

  const data = await graphqlPost(query, {
    useCache: true,
    cacheKey: "fnink:colors",
  });
  return data.colors;
}

/** Get FN-INK base materials. Cached. */
export async function getFnInkMaterials() {
  const query = `{
    materials {
      id
      name
      hex
    }
  }`;

  const data = await graphqlPost(query, {
    useCache: true,
    cacheKey: "fnink:materials",
  });
  return data.materials;
}
