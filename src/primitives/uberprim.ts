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
  hole: number;
  bevel: number;
  cone: number;
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
  hole: number;
  bevel: number;
  cone: number;
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

    const { hole = 0, bevel = 0, cone = 0 } = config;

    this.hole = hole;
    this.bevel = bevel;
    this.cone = cone;

    this.pointVector = "zxy";
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
  setHole(value: number) {
    this.hole = value;
  }
  setParameterByHole() {
    this.thickness = this.intrinsicParams.width / 2 - this.hole;
  }
  setBevel(value: number) {
    this.bevel = value;
  }
  setParameterByBevel() {
    this.xCornerRadius = this.bevel;
  }
  setCone(value: number) {
    this.cone = value;
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth, 0, this.cone);
    this.height = lerp(this.intrinsicParams.depth, 0, this.cone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth, this.cone);
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
