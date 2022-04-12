import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface JointSDFConfig extends SDFConfig {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
}

class JointSDF extends PrimitiveSDF {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  constructor(config: Partial<JointSDFConfig> = {}) {
    super(config);
    const { x1 = 0, y1 = -0.5, z1 = 0, x2 = 0, y2 = 0.5, z2 = 0 } = config;
    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
    this.x2 = x2;
    this.y2 = y2;
    this.z2 = z2;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdCapsule(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},vec3(${toFixed2(this.x1)},${toFixed2(this.y1)},${toFixed2(
      this.z1
    )}),vec3(${toFixed2(this.x2)},${toFixed2(this.y2)},${toFixed2(
      this.z2
    )}))*${toFixed2(this.scaleValue)};`;
  }
}

export { JointSDF };
