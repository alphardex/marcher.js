import { joinLine, reverse, toFixed2 } from "../utils";
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
  get primitivesShaderArray() {
    return this.primitives.map((item) => item.totalShader);
  }
  get primitivesShader() {
    return joinLine(this.primitivesShaderArray);
  }
  get primitivesShaderReverse() {
    return joinLine(reverse(this.primitivesShaderArray));
  }
  get mapFuncShader() {
    return `
    vec2 ${this.mapFuncName}(in vec3 pos)
    {
        vec2 res=vec2(1e10,0.);
        
        {
            ${this.primitivesShaderReverse}
        }
        
        return res;
    }
    `;
  }
  get shader() {
    return `vec2 ${this.sdfVarName}=${this.mapFuncName}(${this.pointVarName}/${
      this.scaleVector
    })*${toFixed2(this.scaleValue)};`;
  }
  get addExisting() {
    return `res=opUnion(res,${this.sdfVarName});`;
  }
}

export { GroupSDF };
