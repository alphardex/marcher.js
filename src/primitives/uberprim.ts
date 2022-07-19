import { lerp, toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface UberprimIntrinsicParams {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  xCornerRadius: number;
  yCornerRadius: number;
  zCornerRadius: number;
}

export interface UberprimSDFConfig extends SDFConfig {
  uberHole: number;
  uberBevel: number;
  uberCone: number;
}

class UberprimSDF extends PrimitiveSDF {
  intrinsicParams: UberprimIntrinsicParams;
  width: number;
  height: number;
  depth: number;
  thickness: number;
  xCornerRadius: number;
  yCornerRadius: number;
  zCornerRadius: number;
  uberHole: number;
  uberBevel: number;
  uberCone: number;
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.thickness = 0;
    this.xCornerRadius = 0;
    this.yCornerRadius = 0;
    this.zCornerRadius = 0;

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 0.5,
      thickness: 0.25,
      xCornerRadius: 0,
      yCornerRadius: 0,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();

    const { uberHole = 0, uberBevel = 0, uberCone = 0 } = config;

    this.uberHole = uberHole;
    this.uberBevel = uberBevel;
    this.uberCone = uberCone;

    this.defaultTransforms.push(this.getRotateShader(90, "x"));
  }
  initActualParams() {
    const {
      width,
      height,
      depth,
      thickness,
      xCornerRadius,
      yCornerRadius,
      zCornerRadius,
    } = this.intrinsicParams;

    this.width = width;
    this.height = height;
    this.depth = depth;
    this.thickness = thickness;
    this.xCornerRadius = xCornerRadius;
    this.yCornerRadius = yCornerRadius;
    this.zCornerRadius = zCornerRadius;
  }
  setUberHole(value: number) {
    this.uberHole = value;
  }
  setUberBevel(value: number) {
    this.uberBevel = value;
  }
  setUberCone(value: number) {
    this.uberCone = value;
  }
  get shader() {
    return `float ${this.sdfVarName}=sdUberprim(${this.pointVarName}/${
      this.scaleVector
    },vec4(${toFixed2(this.width)},${toFixed2(this.height)},${toFixed2(
      this.depth
    )},${toFixed2(this.thickness)}),vec3(${toFixed2(
      this.xCornerRadius
    )},${toFixed2(this.yCornerRadius)},${toFixed2(
      this.zCornerRadius
    )}))*${toFixed2(this.scaleValue)};`;
  }
}

export { UberprimSDF };
