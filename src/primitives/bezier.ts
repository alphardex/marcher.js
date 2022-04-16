import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface BezierSDFConfig extends SDFConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  h: number;
}

class BezierSDF extends PrimitiveSDF {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  h: number;
  constructor(config: Partial<BezierSDFConfig> = {}) {
    super(config);
    const {
      x1 = 1.3 * Math.cos(0),
      y1 = 0.9 * Math.cos(5),
      x2 = 1.3 * Math.cos(3),
      y2 = 0.9 * Math.cos(4),
      x3 = 1.3 * Math.cos(2),
      y3 = 0.9 * Math.cos(0),
      h = 0.1,
    } = config;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.h = h;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdBezier3D(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},vec2(${toFixed2(this.x1)},${toFixed2(this.y1)}),vec2(${toFixed2(
      this.x2
    )},${toFixed2(this.y2)}),vec2(${toFixed2(this.x3)},${toFixed2(
      this.y3
    )}),${toFixed2(this.h)})*${toFixed2(this.scaleValue)};`;
  }
}

export { BezierSDF };
