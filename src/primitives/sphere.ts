import { toFixed2 } from "../utils";
import { PrimitiveSDF } from "./primitive";

export interface SphereSDFConfig {
  radius: number;
  pointVarName: string;
  sdfVarName: string;
  materialId: string;
}

class SphereSDF extends PrimitiveSDF {
  radius: number;
  constructor(config: Partial<SphereSDFConfig> = {}) {
    super(config);
    const { radius = 0.5 } = config;
    this.radius = radius;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdSphere(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},${toFixed2(this.radius)})*${toFixed2(this.scaleValue)};`;
  }
}

export { SphereSDF };
