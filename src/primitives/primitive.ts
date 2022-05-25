import { DEFAULT_MATERIAL_ID } from "../components";
import { compact, deg2rad, joinLine, toFixed2 } from "../utils";

export interface SDFConfig {
  sdfVarName: string;
  materialId: string;
  isVisible: boolean;
  scale: number;
}

class PrimitiveSDF {
  sdfVarName: string;
  materialId: string;
  isVisible: boolean;
  operationsBefore: string[];
  operationsAfter: string[];
  operationsHalf: string[];
  transforms: string[];
  scaleXValue: number;
  scaleYValue: number;
  scaleZValue: number;
  pointVector: string;
  constructor(config: Partial<SDFConfig> = {}) {
    const {
      sdfVarName = "dt",
      materialId = DEFAULT_MATERIAL_ID,
      isVisible = true,
      scale = 1,
    } = config;
    this.sdfVarName = sdfVarName;
    this.materialId = materialId;
    this.isVisible = isVisible;
    this.operationsBefore = [];
    this.operationsAfter = [];
    this.operationsHalf = [];
    this.transforms = [];
    this.scaleXValue = scale;
    this.scaleYValue = scale;
    this.scaleZValue = scale;
    this.pointVector = "xyz";
  }
  get scaleVector() {
    return `vec3(${toFixed2(this.scaleXValue)},${toFixed2(
      this.scaleYValue
    )},${toFixed2(this.scaleZValue)})`;
  }
  get scaleValue() {
    return Math.min(
      this.scaleXValue,
      Math.min(this.scaleYValue, this.scaleZValue)
    );
  }
  get pointVarName() {
    return `${this.sdfVarName}p`;
  }
  get shader() {
    return ``;
  }
  get pointShader() {
    return `vec3 ${this.pointVarName}=pos.${this.pointVector};`;
  }
  get addExisting() {
    return `res=opUnion(res,vec2(${this.sdfVarName},${this.materialId}));`;
  }
  get transformsShader() {
    return joinLine(this.transforms);
  }
  get operationsBeforeShader() {
    return joinLine(this.operationsBefore);
  }
  get operationsAfterShader() {
    return joinLine(this.operationsAfter);
  }
  get operationsHalfShader() {
    return joinLine(this.operationsHalf);
  }
  get totalShader() {
    return joinLine(
      compact([
        this.pointShader,
        this.transformsShader,
        this.operationsBeforeShader,
        this.shader,
        this.operationsAfterShader,
        this.operationsHalfShader,
        this.isVisible ? this.addExisting : "",
      ])
    );
  }
  removeOperation(name: string) {
    this.operationsBefore = this.operationsBefore.filter(
      (e) => !e.includes(name)
    );
    this.operationsAfter = this.operationsAfter.filter(
      (e) => !e.includes(name)
    );
    this.operationsHalf = this.operationsHalf.filter((e) => !e.includes(name));
  }
  show() {
    this.isVisible = true;
    return this;
  }
  hide() {
    this.isVisible = false;
    return this;
  }
  translate(x = 0, y = 0, z = 0) {
    this.transforms.push(
      `${this.pointVarName}+=vec3(${toFixed2(x)},${toFixed2(y)},${toFixed2(
        z
      )});`
    );
    return this;
  }
  translateX(value = 0) {
    this.translate(value, 0, 0);
    return this;
  }
  translateY(value = 0) {
    this.translate(0, value, 0);
    return this;
  }
  translateZ(value = 0) {
    this.translate(0, 0, value);
    return this;
  }
  rotate(deg = 0, axis = "x") {
    this.transforms.push(
      `${this.pointVarName}=rotate${axis.toUpperCase()}(${
        this.pointVarName
      },${toFixed2(deg2rad(deg))});`
    );
    return this;
  }
  rotateX(deg = 0) {
    this.rotate(deg, "x");
    return this;
  }
  rotateY(deg = 0) {
    this.rotate(deg, "y");
    return this;
  }
  rotateZ(deg = 0) {
    this.rotate(deg, "z");
    return this;
  }
  scale(x = 1, y = 1, z = 1) {
    this.scaleXValue = x;
    this.scaleYValue = y;
    this.scaleZValue = z;
    return this;
  }
  scaleX(value = 1) {
    this.scale(value, 0, 0);
    return this;
  }
  scaleY(value = 1) {
    this.scale(0, value, 0);
    return this;
  }
  scaleZ(value = 1) {
    this.scale(0, 0, value);
    return this;
  }
  round(value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opRound(${this.sdfVarName},${toFixed2(value)});`
    );
    return this;
  }
  union(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opUnion(${sdf.sdfVarName},${this.sdfVarName});`
    );
    sdf.hide();
    return this;
  }
  intersect(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opIntersection(${sdf.sdfVarName},${this.sdfVarName});`
    );
    sdf.hide();
    return this;
  }
  subtract(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSubtraction(${sdf.sdfVarName},${this.sdfVarName});`
    );
    sdf.hide();
    return this;
  }
  smoothUnion(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothUnion(${sdf.sdfVarName},${
        this.sdfVarName
      },${toFixed2(value)});`
    );
    sdf.hide();
    return this;
  }
  smoothIntersect(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothIntersection(${sdf.sdfVarName},${
        this.sdfVarName
      },${toFixed2(value)});`
    );
    sdf.hide();
    return this;
  }
  smoothSubtract(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothSubtraction(${sdf.sdfVarName},${
        this.sdfVarName
      },${toFixed2(value)});`
    );
    sdf.hide();
    return this;
  }
  rep(x = 3, y = 3, z = 3) {
    this.operationsBefore.push(
      `${this.pointVarName}=opRep(${this.pointVarName},vec3(${toFixed2(
        x
      )},${toFixed2(y)},${toFixed2(z)}));`
    );
    return this;
  }
  repLim(s = 2, x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1) {
    this.operationsBefore.push(
      `${this.pointVarName}=opRepLim(${this.pointVarName},${toFixed2(
        s
      )},vec3(${toFixed2(x1)},${toFixed2(y1)},${toFixed2(z1)}),vec3(${toFixed2(
        x2
      )},${toFixed2(y2)},${toFixed2(z2)}));`
    );
    return this;
  }
  twist(value = 3) {
    this.operationsBefore.push(
      `${this.pointVarName}=opTwist(${this.pointVarName},${toFixed2(value)});`
    );
    return this;
  }
  cheapBend(value = 1) {
    this.operationsBefore.push(
      `${this.pointVarName}=opCheapBend(${this.pointVarName},${toFixed2(
        value
      )});`
    );
    return this;
  }
  sym(axis = "x") {
    this.operationsBefore.push(
      `${this.pointVarName}=opSym${axis.toUpperCase()}(${this.pointVarName});`
    );
    return this;
  }
  symX() {
    this.sym("x");
    return this;
  }
  symY() {
    this.sym("y");
    return this;
  }
  symZ() {
    this.sym("z");
    return this;
  }
  elongate(x = 0.1, y = 0.1, z = 0.1) {
    this.operationsBefore.push(
      `${this.pointVarName}=opElongate(${this.pointVarName},vec3(${toFixed2(
        x
      )},${toFixed2(y)},${toFixed2(z)})).xyz;`
    );
    return this;
  }
  elongateX(value = 0.1) {
    this.elongate(value, 0, 0);
    return this;
  }
  elongateY(value = 0.1) {
    this.elongate(0, value, 0);
    return this;
  }
  elongateZ(value = 0.1) {
    this.elongate(0, 0, value);
    return this;
  }
  onion(value = 0.03) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opOnion(${this.sdfVarName},${toFixed2(value)});`
    );
    return this;
  }
  half(axis = "x") {
    this.operationsHalf.push(
      `${this.sdfVarName}=opHalf${axis.toUpperCase()}(${this.sdfVarName},${
        this.pointVarName
      });`
    );
    return this;
  }
  halfX() {
    this.half("x");
    return this;
  }
  halfY() {
    this.half("y");
    return this;
  }
  halfZ() {
    this.half("z");
    return this;
  }
}

export { PrimitiveSDF };
