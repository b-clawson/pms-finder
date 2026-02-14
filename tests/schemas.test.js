import { describe, it, expect } from 'vitest';
import {
  IccFormulaSchema,
  MatsuiFormulaSchema,
  PantoneSwatchSchema,
  validateRecords,
} from '../shared/schemas.js';

// --- IccFormulaSchema ---
describe('IccFormulaSchema', () => {
  const validIcc = {
    id: 'icc-001',
    code: 'PMS 100',
    name: 'Yellow',
    hex: '#FFFF00',
    family: '7500 Coated',
    lines: [
      { part_number: 'P001', name: 'Base Yellow', percent: 50, weight: 100, category: 'INK', density: 1.2 },
      { part_number: 'P002', name: 'White', percent: 50, weight: 100, category: 'INK', density: 1.0 },
    ],
  };

  it('accepts valid ICC formula', () => {
    expect(IccFormulaSchema.safeParse(validIcc).success).toBe(true);
  });

  it('accepts null hex', () => {
    expect(IccFormulaSchema.safeParse({ ...validIcc, hex: null }).success).toBe(true);
  });

  it('rejects missing id', () => {
    const { id, ...rest } = validIcc;
    expect(IccFormulaSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty lines array', () => {
    expect(IccFormulaSchema.safeParse({ ...validIcc, lines: [] }).success).toBe(false);
  });

  it('rejects negative percent', () => {
    const bad = {
      ...validIcc,
      lines: [{ ...validIcc.lines[0], percent: -1 }],
    };
    expect(IccFormulaSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects bad hex format', () => {
    expect(IccFormulaSchema.safeParse({ ...validIcc, hex: 'FFFF00' }).success).toBe(false);
  });
});

// --- MatsuiFormulaSchema ---
describe('MatsuiFormulaSchema', () => {
  const validMatsui = {
    _id: 'mat-001',
    formulaCode: 'FC100',
    formulaDescription: '301 RC NEO RED C',
    formulaSeries: '301 RC NEO',
    formulaColor: 'FF0000',
    formulaSwatchColor: {
      _id: 'sw-001',
      formulaCode: 'FC100',
      formulaColor: 'FF0000',
    },
    components: [
      {
        componentCode: 'CC001',
        componentDescription: 'Red Base',
        percentage: 80,
        hex: 'FF0000',
        isBase: true,
      },
      {
        componentCode: 'CC002',
        componentDescription: 'White',
        percentage: 20,
        hex: 'FFFFFF',
        isBase: false,
      },
    ],
  };

  it('accepts valid Matsui formula', () => {
    expect(MatsuiFormulaSchema.safeParse(validMatsui).success).toBe(true);
  });

  it('rejects missing _id', () => {
    const { _id, ...rest } = validMatsui;
    expect(MatsuiFormulaSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty components array', () => {
    expect(MatsuiFormulaSchema.safeParse({ ...validMatsui, components: [] }).success).toBe(false);
  });

  it('rejects negative percentage', () => {
    const bad = {
      ...validMatsui,
      components: [{ ...validMatsui.components[0], percentage: -5 }],
    };
    expect(MatsuiFormulaSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts null component hex', () => {
    const withNull = {
      ...validMatsui,
      components: [{ ...validMatsui.components[0], hex: null }],
    };
    expect(MatsuiFormulaSchema.safeParse(withNull).success).toBe(true);
  });
});

// --- PantoneSwatchSchema ---
describe('PantoneSwatchSchema', () => {
  const validSwatch = {
    pms: '100',
    series: 'C',
    hex: '#FFFF00',
    name: 'Yellow',
    notes: '',
  };

  it('accepts valid swatch', () => {
    expect(PantoneSwatchSchema.safeParse(validSwatch).success).toBe(true);
  });

  it('accepts U series', () => {
    expect(PantoneSwatchSchema.safeParse({ ...validSwatch, series: 'U' }).success).toBe(true);
  });

  it('rejects invalid series', () => {
    expect(PantoneSwatchSchema.safeParse({ ...validSwatch, series: 'X' }).success).toBe(false);
  });

  it('rejects bad hex format (missing #)', () => {
    expect(PantoneSwatchSchema.safeParse({ ...validSwatch, hex: 'FFFF00' }).success).toBe(false);
  });

  it('rejects missing pms', () => {
    const { pms, ...rest } = validSwatch;
    expect(PantoneSwatchSchema.safeParse(rest).success).toBe(false);
  });
});

// --- validateRecords ---
describe('validateRecords', () => {
  it('returns all valid for correct data', () => {
    const data = [
      { pms: '100', series: 'C', hex: '#FFFF00', name: 'Yellow', notes: '' },
      { pms: '200', series: 'U', hex: '#CC0000', name: 'Red', notes: '' },
    ];
    const result = validateRecords(data, PantoneSwatchSchema, 'Test');
    expect(result.valid).toBe(2);
    expect(result.invalid).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('counts invalid records', () => {
    const data = [
      { pms: '100', series: 'X', hex: '#FFFF00', name: 'Yellow', notes: '' },
    ];
    const result = validateRecords(data, PantoneSwatchSchema, 'Test');
    expect(result.invalid).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('caps errors at 20', () => {
    const data = Array.from({ length: 30 }, () => ({ bad: true }));
    const result = validateRecords(data, PantoneSwatchSchema, 'Test');
    expect(result.invalid).toBe(30);
    expect(result.errors).toHaveLength(20);
  });
});
