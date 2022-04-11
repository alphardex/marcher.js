import type { PrimitiveSDF } from "../primitives/primitive";
import { joinLine } from "../utils";

class SDFLayer {
  primitives: PrimitiveSDF[];
  constructor() {
    this.primitives = [];
  }
  addPrimitive(primitive: PrimitiveSDF) {
    this.primitives.push(primitive);
  }
  get shader() {
    return `
      {
        vec3 q=pos;
        
        ${joinLine(this.primitives.map((item) => item.totalShader))}
      }
      `;
  }
}

export { SDFLayer };
