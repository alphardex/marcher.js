import { DEFAULT_MATERIAL_ID } from "../components";
import { compact, deg2rad, joinLine, toFixed2 } from "../utils";

export interface SDFConfig {
  sdfVarName: string;
  materialId: string;
}

class PrimitiveSDF {
  sdfVarName: string;
  materialId: string;
  isVisible: boolean;
  operations: string[];
  transforms: string[];
  scaleValue: number;
  constructor(config: Partial<SDFConfig> = {}) {
    const { sdfVarName = "dt", materialId = DEFAULT_MATERIAL_ID } = config;
    this.sdfVarName = sdfVarName;
    this.materialId = materialId;
    this.isVisible = true;
    this.operations = [];
    this.transforms = [];
    this.scaleValue = 1;
  }
  get pointVarName() {
    return `${this.sdfVarName}p`;
  }
  get shader() {
    return ``;
  }
  get pointShader() {
    return `vec3 ${this.pointVarName}=pos;`;
  }
  get addExisting() {
    return `res=opUnion(res,vec2(${this.sdfVarName},${this.materialId}));`;
  }
  get operationsShader() {
    return joinLine(this.operations);
  }
  get totalShader() {
    return joinLine(
      compact([
        this.pointShader,
        this.transforms,
        this.shader,
        this.operationsShader,
        this.isVisible ? this.addExisting : "",
      ])
    );
  }
  show() {
    this.isVisible = true;
  }
  hide() {
    this.isVisible = false;
  }
  translate(x = 0, y = 0, z = 0) {
    this.transforms.push(
      `${this.pointVarName}+=vec3(${toFixed2(x)},${toFixed2(y)},${toFixed2(
        z
      )});`
    );
  }
  rotate(deg = 0, axis = "x") {
    this.transforms.push(
      `${this.pointVarName}=rotate${axis.toUpperCase()}(${
        this.pointVarName
      },${toFixed2(deg2rad(deg))});`
    );
  }
  scale(value = 1) {
    this.scaleValue = value;
  }
  round(value = 0.1) {
    this.operations.push(
      `${this.sdfVarName}=opRound(${this.sdfVarName},${toFixed2(value)});`
    );
  }
  union(sdf: PrimitiveSDF) {
    this.operations.push(
      `${this.sdfVarName}=opUnion(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  intersect(sdf: PrimitiveSDF) {
    this.operations.push(
      `${this.sdfVarName}=opIntersection(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  subtract(sdf: PrimitiveSDF) {
    this.operations.push(
      `${this.sdfVarName}=opSubtraction(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  smoothUnion(sdf: PrimitiveSDF, value = 0.1) {
    this.operations.push(
      `${this.sdfVarName}=opSmoothUnion(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
  smoothIntersect(sdf: PrimitiveSDF, value = 0.1) {
    this.operations.push(
      `${this.sdfVarName}=opSmoothIntersection(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
  smoothSubtract(sdf: PrimitiveSDF, value = 0.1) {
    this.operations.push(
      `${this.sdfVarName}=opSmoothSubtraction(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
}

export { PrimitiveSDF };
