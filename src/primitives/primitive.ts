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
  translateXValue: number;
  translateYValue: number;
  translateZValue: number;
  rotateXValue: number;
  rotateYValue: number;
  rotateZValue: number;
  scaleXValue: number;
  scaleYValue: number;
  scaleZValue: number;
  operationsBefore: string[];
  operationsAfter: string[];
  operationsHalf: string[];
  operationsSym: string[];
  constructor(config: Partial<SDFConfig> = {}) {
    const { sdfVarName = "dt", materialId = DEFAULT_MATERIAL_ID } = config;
    this.sdfVarName = sdfVarName;
    this.materialId = materialId;
    this.isVisible = true;
    this.translateXValue = 0;
    this.translateYValue = 0;
    this.translateZValue = 0;
    this.rotateXValue = 0;
    this.rotateYValue = 0;
    this.rotateZValue = 0;
    this.scaleXValue = 1;
    this.scaleYValue = 1;
    this.scaleZValue = 1;
    this.operationsBefore = [];
    this.operationsAfter = [];
    this.operationsHalf = [];
    this.operationsSym = [];
  }
  // -- add start --
  get pointVarName() {
    return `${this.sdfVarName}p`;
  }
  get pointShader() {
    return `vec3 ${this.pointVarName}=pos;`;
  }
  get shader() {
    return ``;
  }
  get addExisting() {
    return `res=opUnion(res,vec2(${this.sdfVarName},${this.materialId}));`;
  }
  get totalShader() {
    return joinLine(
      compact([
        this.pointShader,
        this.positionShader,
        this.operationsSymShader,
        this.rotationShader,
        this.operationsBeforeShader,
        this.shader,
        this.operationsAfterShader,
        this.operationsHalfShader,
        this.isVisible ? this.addExisting : "",
      ])
    );
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
  show() {
    this.isVisible = true;
    return this;
  }
  hide() {
    this.isVisible = false;
    return this;
  }
  // -- add end --
  // -- positioning start --
  get positionVector() {
    return `vec3(${toFixed2(this.translateXValue)},${toFixed2(
      this.translateYValue
    )},${toFixed2(this.translateZValue)})`;
  }
  get positionShader() {
    return `${this.pointVarName}=opPosition(${this.pointVarName},-${this.positionVector});`;
  }
  translate(x = 0, y = 0, z = 0) {
    this.translateXValue = x;
    this.translateYValue = y;
    this.translateZValue = z;
    return this;
  }
  translateX(value = 0) {
    this.translate(value, this.translateYValue, this.translateZValue);
    return this;
  }
  translateY(value = 0) {
    this.translate(this.translateXValue, value, this.translateZValue);
    return this;
  }
  translateZ(value = 0) {
    this.translate(this.translateXValue, this.translateYValue, value);
    return this;
  }
  get rotationVector() {
    return `vec3(${toFixed2(this.rotateXValue)},${toFixed2(
      this.rotateYValue
    )},${toFixed2(this.rotateZValue)})`;
  }
  get rotationShader() {
    return joinLine([
      `${this.pointVarName}=rotateX(${this.pointVarName},${toFixed2(
        this.rotateXValue
      )});`,
      `${this.pointVarName}=rotateY(${this.pointVarName},${toFixed2(
        this.rotateYValue
      )});`,
      `${this.pointVarName}=rotateZ(${this.pointVarName},${toFixed2(
        this.rotateZValue
      )});`,
    ]);
  }
  rotate(x = 0, y = 0, z = 0, useDeg2rad = true) {
    if (useDeg2rad) {
      this.rotateXValue = deg2rad(x);
      this.rotateYValue = deg2rad(y);
      this.rotateZValue = deg2rad(z);
    } else {
      this.rotateXValue = x;
      this.rotateYValue = y;
      this.rotateZValue = z;
    }
    return this;
  }
  rotateX(value = 0) {
    this.rotate(value, this.rotateYValue, this.rotateZValue);
    return this;
  }
  rotateY(value = 0) {
    this.rotate(this.rotateXValue, value, this.rotateZValue);
    return this;
  }
  rotateZ(value = 0) {
    this.rotate(this.rotateXValue, this.rotateYValue, value);
    return this;
  }
  scale(x = 1, y = 1, z = 1) {
    this.scaleXValue = x;
    this.scaleYValue = y;
    this.scaleZValue = z;
    return this;
  }
  scaleX(value = 1) {
    this.scale(value, this.scaleYValue, this.scaleZValue);
    return this;
  }
  scaleY(value = 1) {
    this.scale(this.scaleXValue, value, this.scaleZValue);
    return this;
  }
  scaleZ(value = 1) {
    this.scale(this.scaleXValue, this.scaleYValue, value);
    return this;
  }
  // -- positioning end --
  // -- operations start --
  get operationsBeforeShader() {
    return joinLine(this.operationsBefore);
  }
  get operationsAfterShader() {
    return joinLine(this.operationsAfter);
  }
  get operationsHalfShader() {
    return joinLine(this.operationsHalf);
  }
  get operationsSymShader() {
    return joinLine(this.operationsSym);
  }
  removeOperation(name: string) {
    this.operationsBefore = this.operationsBefore.filter(
      (e) => !e.includes(name)
    );
    this.operationsAfter = this.operationsAfter.filter(
      (e) => !e.includes(name)
    );
    this.operationsHalf = this.operationsHalf.filter((e) => !e.includes(name));
    this.operationsSym = this.operationsSym.filter((e) => !e.includes(name));
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
  round(value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opRound(${this.sdfVarName},${toFixed2(value)});`
    );
    return this;
  }
  onion(value = 0.03) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opOnion(${this.sdfVarName},${toFixed2(value)});`
    );
    return this;
  }
  shell(value = 0.03) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opShell(${this.sdfVarName},${toFixed2(value)});`
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
  sym(axis = "x") {
    this.operationsSym.push(
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
  // -- operations end --
}

export { PrimitiveSDF };
