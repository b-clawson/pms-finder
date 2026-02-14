import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(__dirname, '../scripts/validate-data.js');

describe('validate-data script', () => {
  it('exits 0 and prints "All schema checks passed"', () => {
    const output = execFileSync('node', [scriptPath], {
      encoding: 'utf-8',
      timeout: 15000,
    });
    expect(output).toContain('All schema checks passed');
  });
});
