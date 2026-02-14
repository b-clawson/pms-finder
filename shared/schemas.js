import { z } from "zod";

// --- ICC UltraMix formula schema ---
const IccLineSchema = z.object({
  part_number: z.string(),
  name: z.string(),
  percent: z.number(),
  weight: z.number(),
  category: z.string(),
  density: z.number(),
});

export const IccFormulaSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  family: z.string(),
  lines: z.array(IccLineSchema).min(1),
});

// --- Matsui formula schema ---
const MatsuiComponentSchema = z.object({
  componentCode: z.string(),
  componentDescription: z.string(),
  percentage: z.number(),
  hex: z.string().regex(/^[0-9A-Fa-f]{6}$/).or(z.literal("")),
  isBase: z.boolean(),
});

const MatsuiSwatchColorSchema = z.object({
  _id: z.string(),
  formulaCode: z.string(),
  formulaColor: z.string(),
});

export const MatsuiFormulaSchema = z.object({
  _id: z.string(),
  formulaCode: z.string(),
  formulaDescription: z.string(),
  formulaSeries: z.string(),
  formulaColor: z.string(),
  formulaSwatchColor: MatsuiSwatchColorSchema,
  components: z.array(MatsuiComponentSchema).min(1),
});

// --- Pantone swatch schema ---
export const PantoneSwatchSchema = z.object({
  pms: z.string(),
  series: z.enum(["C", "U"]),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  name: z.string(),
  notes: z.string(),
});

/**
 * Validate an array of records against a Zod schema.
 * Returns { total, valid, invalid, errors[] }.
 */
export function validateRecords(data, schema, label) {
  const errors = [];
  let valid = 0;
  let invalid = 0;

  for (let i = 0; i < data.length; i++) {
    const result = schema.safeParse(data[i]);
    if (result.success) {
      valid++;
    } else {
      invalid++;
      if (errors.length < 20) {
        const id = data[i]?.id || data[i]?._id || data[i]?.pms || `index ${i}`;
        errors.push({
          index: i,
          id,
          issues: result.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`),
        });
      }
    }
  }

  return { label, total: data.length, valid, invalid, errors };
}
