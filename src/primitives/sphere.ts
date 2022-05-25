import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface SphereSDFConfig extends SDFConfig {
  radius: number;
}

class SphereSDF extends PrimitiveSDF {
  radius: number;
  constructor(config: Partial<SphereSDFConfig> = {}) {
    super(config);
    const { radius = 0.5 } = config;
    this.radius = radius;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdSphere(${this.pointVarName}/${
      this.scaleVector
    },${toFixed2(this.radius)})*${toFixed2(this.scaleValue)};`;
  }
}

export { SphereSDF };
