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
  operationsBefore: string[];
  operationsAfter: string[];
  transforms: string[];
  scaleValue: number;
  constructor(config: Partial<SDFConfig> = {}) {
    const { sdfVarName = "dt", materialId = DEFAULT_MATERIAL_ID } = config;
    this.sdfVarName = sdfVarName;
    this.materialId = materialId;
    this.isVisible = true;
    this.operationsBefore = [];
    this.operationsAfter = [];
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
  get transformsShader() {
    return joinLine(this.transforms);
  }
  get operationsBeforeShader() {
    return joinLine(this.operationsBefore);
  }
  get operationsAfterShader() {
    return joinLine(this.operationsAfter);
  }
  get totalShader() {
    return joinLine(
      compact([
        this.pointShader,
        this.transformsShader,
        this.operationsBeforeShader,
        this.shader,
        this.operationsAfterShader,
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
    this.operationsAfter.push(
      `${this.sdfVarName}=opRound(${this.sdfVarName},${toFixed2(value)});`
    );
  }
  union(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opUnion(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  intersect(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opIntersection(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  subtract(sdf: PrimitiveSDF) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSubtraction(${this.sdfVarName},${sdf.sdfVarName});`
    );
  }
  smoothUnion(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothUnion(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
  smoothIntersect(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothIntersection(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
  smoothSubtract(sdf: PrimitiveSDF, value = 0.1) {
    this.operationsAfter.push(
      `${this.sdfVarName}=opSmoothSubtraction(${this.sdfVarName},${
        sdf.sdfVarName
      },${toFixed2(value)});`
    );
  }
  rep(x = 3, y = 3, z = 3) {
    this.operationsBefore.push(
      `${this.pointVarName}=opRep(${this.pointVarName},vec3(${toFixed2(
        x
      )},${toFixed2(y)},${toFixed2(z)}));`
    );
  }
  repLim(s = 2, x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1) {
    this.operationsBefore.push(
      `${this.pointVarName}=opRepLim(${this.pointVarName},${toFixed2(
        s
      )},vec3(${toFixed2(x1)},${toFixed2(y1)},${toFixed2(z1)}),vec3(${toFixed2(
        x2
      )},${toFixed2(y2)},${toFixed2(z2)}));`
    );
  }
  twist(value = 3) {
    this.operationsBefore.push(
      `${this.pointVarName}=opTwist(${this.pointVarName},${toFixed2(value)});`
    );
  }
  cheapBend(value = 1) {
    this.operationsBefore.push(
      `${this.pointVarName}=opCheapBend(${this.pointVarName},${toFixed2(
        value
      )});`
    );
  }
  // Methods TODO
  // sym(axis = "x") {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=opSym${axis.toUpperCase()}(${this.pointVarName});`
  //   );
  // }
  // elongate(x = 0, y = 0, z = 0) {
  //   this.operationsAfter.push(
  //     `${this.sdfVarName}=opElongate(${this.sdfVarName},vec3(${toFixed2(
  //       x
  //     )},${toFixed2(y)},${toFixed2(z)}));`
  //   );
  // }
  // onion(value = 0.1) {
  //   this.operationsAfter.push(
  //     `${this.sdfVarName}=opOnion(${this.sdfVarName},${toFixed2(value)});`
  //   );
  // }
  // extrude(value = 0.1) {
  //   this.operationsAfter.push(
  //     `${this.sdfVarName}=opExtrusion(${this.pointVarName},${
  //       this.sdfVarName
  //     },${toFixed2(value)});`
  //   );
  // }
  // revolve(value = 0.1) {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=opRevolution(${this.pointVarName},${toFixed2(
  //       value
  //     )});`
  //   );
  // }
  // length2() {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=length2(${this.pointVarName});`
  //   );
  // }
  // length4() {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=length4(${this.pointVarName});`
  //   );
  // }
  // length6() {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=length6(${this.pointVarName});`
  //   );
  // }
  // length8() {
  //   this.operationsBefore.push(
  //     `${this.pointVarName}=length8(${this.pointVarName});`
  //   );
  // }
}

export { PrimitiveSDF };
