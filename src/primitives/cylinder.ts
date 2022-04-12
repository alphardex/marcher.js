import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface CylinderSDFConfig extends SDFConfig {
  radius: number;
  height: number;
}

class CylinderSDF extends PrimitiveSDF {
  radius: number;
  height: number;
  constructor(config: Partial<CylinderSDFConfig> = {}) {
    super(config);
    const { radius = 0.5, height = 0.5 } = config;
    this.radius = radius;
    this.height = height;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdCylinder(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},vec2(${toFixed2(this.radius)},${toFixed2(this.height)}))*${toFixed2(
      this.scaleValue
    )};`;
  }
}

export { CylinderSDF };
