import { joinLine, toFixed2 } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface GroupSDFConfig extends SDFConfig {
  mapFuncName: string;
  primitives: PrimitiveSDF[];
}

class GroupSDF extends PrimitiveSDF {
  mapFuncName: string;
  primitives: PrimitiveSDF[];
  constructor(config: Partial<GroupSDFConfig> = {}) {
    super(config);
    const { mapFuncName = "g1" } = config;
    this.mapFuncName = mapFuncName;
    this.primitives = [];
  }
  addPrimitive(sdf: PrimitiveSDF) {
    this.primitives.push(sdf);
  }
  get primitivesShader() {
    return joinLine(this.primitives.map((item) => item.totalShader));
  }
  get mapFuncShader() {
    return `
    vec2 ${this.mapFuncName}(in vec3 pos)
    {
        vec2 res=vec2(1e10,0.);
        
        {
            ${this.primitivesShader}
        }
        
        return res;
    }
    `;
  }
  get shader() {
    return `vec2 ${this.sdfVarName}=${this.mapFuncName}(${
      this.pointVarName
    }/${toFixed2(this.scaleValue)})*${toFixed2(this.scaleValue)};`;
  }
  get addExisting() {
    return `res=opUnion(res,${this.sdfVarName});`;
  }
}

export { GroupSDF };
