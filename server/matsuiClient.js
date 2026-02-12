import https from "node:https";

const MATSUI_BASE = "https://api2.matsui-color.com";
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

export async function matsuiGet(path, { useCache = false } = {}) {
  if (useCache) {
    const cached = getCached(`GET:${path}`);
    if (cached) return cached;
  }

  const url = `${MATSUI_BASE}/${path}`;
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
          reject(new Error("Invalid JSON from Matsui API"));
        }
      });
    }).on("error", reject);
  });
}

export async function matsuiPost(path, body) {
  const url = `${MATSUI_BASE}/${path}`;
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      agent,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON from Matsui API"));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
