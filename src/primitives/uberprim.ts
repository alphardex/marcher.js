import { toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface UberprimSDFConfig extends SDFConfig {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  xCornerRadius: number;
  yCornerRadius: number;
  zCornerRadius: number;
}

class UberprimSDF extends PrimitiveSDF {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  xCornerRadius: number;
  yCornerRadius: number;
  zCornerRadius: number;
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);
    const {
      width = 0.5,
      height = 0.5,
      depth = 0.5,
      thickness = 0.25,
      xCornerRadius = 0,
      yCornerRadius = 0,
      zCornerRadius = 0,
    } = config;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.thickness = thickness;
    this.xCornerRadius = xCornerRadius;
    this.yCornerRadius = yCornerRadius;
    this.zCornerRadius = zCornerRadius;

    this.pointVector = "zxy";
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
