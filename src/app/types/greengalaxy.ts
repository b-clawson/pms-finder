export interface GGMatch {
  _id: string;
  code: string;
  name: string;
  hex: string;
  distance: number;
}

export interface GGMaterial {
  material: {
    code: string;
    name: string;
    hex: string;
    url?: string;
    materialType?: string;
  };
  amount: number;
}

export interface GGFormulaDetail {
  color: {
    _id: string;
    code: string;
    name: string;
    hex: string;
    category: string;
  };
  materials: GGMaterial[];
  comments?: string;
}
