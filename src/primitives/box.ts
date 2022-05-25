import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface BoxSDFConfig extends SDFConfig {
  width: number;
  height: number;
  depth: number;
}

class BoxSDF extends PrimitiveSDF {
  width: number;
  height: number;
  depth: number;
  constructor(config: Partial<BoxSDFConfig> = {}) {
    super(config);
    const { width = 0.5, height = 0.5, depth = 0.5 } = config;
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdBox(${this.pointVarName}/${
      this.scaleVector
    },vec3(${toFixed2(this.width)},${toFixed2(this.height)},${toFixed2(
      this.depth
    )}))*${toFixed2(this.scaleValue)};`;
  }
}

export { BoxSDF };
