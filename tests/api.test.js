import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, '../server/index.js');
const PORT = 3456;
const BASE = `http://localhost:${PORT}`;

let serverProcess;

async function waitForServer(url, retries = 30, delay = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error(`Server did not start at ${url} after ${retries} retries`);
}

beforeAll(async () => {
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  // Log server errors for debugging
  serverProcess.stderr.on('data', (data) => {
    // Suppress in normal runs, uncomment to debug:
    // console.error(`server stderr: ${data}`);
  });

  await waitForServer(`${BASE}/api/icc/families`);
}, 15000);

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

// --- /api/pms ---
describe('/api/pms', () => {
  it('returns 400 without hex param', async () => {
    const res = await fetch(`${BASE}/api/pms`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('hex');
  });

  it('returns 400 for invalid hex', async () => {
    const res = await fetch(`${BASE}/api/pms?hex=ZZZZZZ`);
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid hex and correct shape', async () => {
    const res = await fetch(`${BASE}/api/pms?hex=%23FF0000&limit=3`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('input');
    expect(body).toHaveProperty('results');
    expect(body).toHaveProperty('meta');
    expect(body.input.hex).toBe('#FF0000');
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('returns 400 for invalid series', async () => {
    const res = await fetch(`${BASE}/api/pms?hex=%23FF0000&series=X`);
    expect(res.status).toBe(400);
  });
});

// --- /api/swatches ---
describe('/api/swatches', () => {
  it('returns 200 with swatches array', async () => {
    const res = await fetch(`${BASE}/api/swatches`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('swatches');
    expect(Array.isArray(body.swatches)).toBe(true);
  });
});

// --- /api/icc/families ---
describe('/api/icc/families', () => {
  it('returns 200 with array of family names', async () => {
    const res = await fetch(`${BASE}/api/icc/families`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

// --- /api/icc/match ---
describe('/api/icc/match', () => {
  it('returns 400 without hex', async () => {
    const res = await fetch(`${BASE}/api/icc/match`);
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid hex', async () => {
    const res = await fetch(`${BASE}/api/icc/match?hex=%23FF0000&limit=3`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('code');
      expect(body[0]).toHaveProperty('hex');
      expect(body[0]).toHaveProperty('distance');
    }
  });
});
