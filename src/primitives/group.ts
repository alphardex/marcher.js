import { joinLine } from "../utils";
import { PrimitiveSDF, SDFConfig } from "./primitive";

export interface GroupSDFConfig extends SDFConfig {
  name: string;
  primitives: PrimitiveSDF[];
}

class GroupSDF extends PrimitiveSDF {
  name: string;
  primitives: PrimitiveSDF[];
  constructor(config: Partial<GroupSDFConfig> = {}) {
    super(config);
    const { name = "g1" } = config;
    this.name = name;
    this.primitives = [];
  }
  addPrimitive(sdf: PrimitiveSDF) {
    this.primitives.push(sdf);
  }
  get primitivesShader() {
    return joinLine(this.primitives.map((item) => item.totalShader));
  }
  get functionShader() {
    return `
    vec2 ${this.name}(in vec3 pos)
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
    return `vec2 ${this.sdfVarName}=${this.name}(${this.pointVarName});`;
  }
  get addExisting() {
    return `res=opUnion(res,${this.sdfVarName});`;
  }
}

export { GroupSDF };
