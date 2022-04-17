import { joinLine } from "../utils";
import { toFixed1 } from "../utils/math";
import { DEFAULT_MATERIAL_ID } from "./consts";

class SDFMaterial {
  materials: string[];
  constructor() {
    this.materials = [];
  }
  addMaterial(id = DEFAULT_MATERIAL_ID, str = "") {
    this.materials.push(`
    if(m==${id}){
        ${str}
    }
      `);
    return this;
  }
  addColorMaterial(id = DEFAULT_MATERIAL_ID, r = 255, g = 255, b = 255) {
    const str = `col=vec3(${toFixed1(r)},${toFixed1(g)},${toFixed1(b)})/255.;`;
    this.addMaterial(id, str);
    return this;
  }
  get shader() {
    return `
      vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){
        col=vec3(153.,204.,255.)/255.;
        
        ${joinLine(this.materials)}
        
        return col;
    }
      `;
  }
}

export { SDFMaterial };
