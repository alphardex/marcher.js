import { toFixed2 } from "../utils";
import { PrimitiveSDF } from "./primitive";

export interface PolygonSDFConfig {
  edgeCount: number;
  value1: number;
  value2: number;
  value3: number;
  pointVarName: string;
  sdfVarName: string;
  materialId: string;
}

class PolygonSDF extends PrimitiveSDF {
  edgeCount: number;
  value1: number;
  value2: number;
  value3: number;
  constructor(config: Partial<PolygonSDFConfig> = {}) {
    super(config);
    const { edgeCount = 6, value1 = 0.5, value2 = 0.5, value3 = 0.5 } = config;
    this.edgeCount = edgeCount;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }
  get sdFunctionName() {
    return (
      {
        3: "sdTriPrism",
        4: "sdBox",
        6: "sdHexPrism",
        8: "sdOctogonPrism",
      }[this.edgeCount] || ""
    );
  }
  get shader() {
    return (
      {
        3: `float ${this.sdfVarName}=sdTriPrism(${this.pointVarName}/${toFixed2(
          this.scaleValue
        )},vec2(${toFixed2(this.value1)},${toFixed2(this.value2)}))*${toFixed2(
          this.scaleValue
        )};`,
        4: `float ${this.sdfVarName}=sdBox(${this.pointVarName}/${toFixed2(
          this.scaleValue
        )},vec2(${toFixed2(this.value1)},${toFixed2(this.value2)},${toFixed2(
          this.value3
        )}))*${toFixed2(this.scaleValue)};`,
        6: `float ${this.sdfVarName}=sdHexPrism(${this.pointVarName}/${toFixed2(
          this.scaleValue
        )},vec2(${toFixed2(this.value1)},${toFixed2(this.value2)}))*${toFixed2(
          this.scaleValue
        )};`,
        8: `float ${this.sdfVarName}=sdOctogonPrism(${
          this.pointVarName
        }/${toFixed2(this.scaleValue)},${toFixed2(this.value1)},${toFixed2(
          this.value2
        )})*${toFixed2(this.scaleValue)};`,
      }[this.edgeCount] || ""
    );
  }
}

export { PolygonSDF };
