export interface MatsuiSeries {
  _id: string;
  seriesName: string;
}

export interface MatsuiPigment {
  _id: string;
  code: string;
  description: string;
  serie: string;
  hex: string;
  rgb: [number, number, number];
  cmyk: [number, number, number, number];
  lab: [number, number, number];
  isBase?: boolean;
  pricePerKg: number;
}

export interface FormulaComponent {
  componentCode: string;
  componentDescription: string;
  percentage: number;
  hex: string;
  cmyk: [number, number, number, number];
  isBase: boolean;
  pricePerKg: number;
}

export interface MatsuiFormula {
  _id: string;
  formulaCode: string;
  formulaDescription: string;
  formulaSeries: string;
  formulaColor: string; // hex without #
  components: FormulaComponent[];
}
