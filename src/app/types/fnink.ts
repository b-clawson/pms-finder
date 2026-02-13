export interface FnInkMaterial {
  id: string;
  name: string;
  hex: string;
}

export interface FnInkFormulaMaterial {
  amount: number;
  material: FnInkMaterial;
}

export interface FnInkFormula {
  multiplier: number;
  materials: FnInkFormulaMaterial[];
}

export interface FnInkMatch {
  id: string;
  code: string;
  name: string;
  hex: string;
  distance: number;
  formula: FnInkFormula;
}
