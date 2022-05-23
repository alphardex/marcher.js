import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface GyroidSDFConfig extends SDFConfig {
  gyroidScale: number;
  thickness: number;
  bias: number;
}

class GyroidSDF extends PrimitiveSDF {
  gyroidScale: number;
  thickness: number;
  bias: number;
  constructor(config: Partial<GyroidSDFConfig> = {}) {
    super(config);
    const { gyroidScale = 1, thickness = 0.03, bias = 0 } = config;
    this.gyroidScale = gyroidScale;
    this.thickness = thickness;
    this.bias = bias;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdGyroid(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},${toFixed2(this.gyroidScale)},${toFixed2(this.thickness)},${toFixed2(
      this.bias
    )})*${toFixed2(this.scaleValue)};`;
  }
}

export { GyroidSDF };
