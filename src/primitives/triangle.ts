import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface TriangleSDFConfig extends SDFConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  xMax: number;
  yMax: number;
  zMax: number;
}

class TriangleSDF extends PrimitiveSDF {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  xMax: number;
  yMax: number;
  zMax: number;
  constructor(config: Partial<TriangleSDFConfig> = {}) {
    super(config);
    const {
      x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0.8,
      x3 = 0.6,
      y3 = 0.0,
      xMax = 1.3,
      yMax = 0.9,
      zMax = 0.1,
    } = config;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.xMax = xMax;
    this.yMax = yMax;
    this.zMax = zMax;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdTriangle3D(${
      this.pointVarName
    }/${toFixed2(this.scaleValue)},vec2(${toFixed2(this.x1)},${toFixed2(
      this.y1
    )}),vec2(${toFixed2(this.x2)},${toFixed2(this.y2)}),vec2(${toFixed2(
      this.x3
    )},${toFixed2(this.y3)}),${toFixed2(this.xMax)},${toFixed2(
      this.yMax
    )},${toFixed2(this.zMax)})*${toFixed2(this.scaleValue)};`;
  }
}

export { TriangleSDF };
