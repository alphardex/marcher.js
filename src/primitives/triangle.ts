import { toFixed2 } from "../utils";
import { PrimitiveSDF } from "./primitive";

export interface TriangleSDFConfig {
  value1: number;
  value2: number;
  pointVarName: string;
  sdfVarName: string;
  materialId: string;
}

class TriangleSDF extends PrimitiveSDF {
  value1: number;
  value2: number;
  constructor(config: Partial<TriangleSDFConfig> = {}) {
    super(config);
    const { value1 = 0.5, value2 = 0.5 } = config;
    this.value1 = value1;
    this.value2 = value2;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdTriPrism(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},vec2(${toFixed2(this.value1)},${toFixed2(this.value2)}))*${toFixed2(
      this.scaleValue
    )};`;
  }
}

export { TriangleSDF };
