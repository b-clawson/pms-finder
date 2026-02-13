export interface IccFormulaLine {
  part_number: string;
  name: string;
  percent: number;
  weight: number;
  category: string;
  density: number;
}

export interface IccMatch {
  id: string;
  code: string;
  name: string;
  hex: string;
  distance: number;
  family: string;
  lines: IccFormulaLine[];
}
