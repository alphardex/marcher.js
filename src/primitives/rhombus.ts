import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface RhombusSDFConfig extends SDFConfig {
  diagA: number;
  diagB: number;
  height: number;
  radius: number;
}

class RhombusSDF extends PrimitiveSDF {
  diagA: number;
  diagB: number;
  height: number;
  radius: number;
  constructor(config: Partial<RhombusSDFConfig> = {}) {
    super(config);
    const { diagA = 0.5, diagB = 0.25, height = 0.1, radius = 0 } = config;
    this.diagA = diagA;
    this.diagB = diagB;
    this.height = height;
    this.radius = radius;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdRhombus(${this.pointVarName}/${
      this.scaleVector
    },${toFixed2(this.diagA)},${toFixed2(this.diagB)},${toFixed2(
      this.height
    )},${toFixed2(this.radius)})*${toFixed2(this.scaleValue)};`;
  }
}

export { RhombusSDF };
