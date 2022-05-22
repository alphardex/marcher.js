import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface PolygonSDFConfig extends SDFConfig {
  radius: number;
  edgeCount: number;
  angleDivisor: number;
  depth: number;
}

class PolygonSDF extends PrimitiveSDF {
  radius: number;
  edgeCount: number;
  angleDivisor: number;
  depth: number;
  constructor(config: Partial<PolygonSDFConfig> = {}) {
    super(config);
    const {
      radius = 0.5,
      edgeCount = 6,
      angleDivisor = 2,
      depth = 0.5,
    } = config;
    this.radius = radius;
    this.edgeCount = edgeCount;
    this.angleDivisor = angleDivisor;
    this.depth = depth;

    this.pointVector = "zxy";
  }
  get shader() {
    return `float ${this.sdfVarName}=sdStar3D(${this.pointVarName}/${toFixed2(
      this.scaleValue
    )},${toFixed2(this.radius)},${this.edgeCount},${toFixed2(
      this.angleDivisor
    )},${toFixed2(this.depth)})*${toFixed2(this.scaleValue)};`;
  }
}

export { PolygonSDF };
