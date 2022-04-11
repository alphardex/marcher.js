import { joinLine } from "../utils";
import { toFixed1 } from "../utils/math";

class SDFMaterial {
  materials: string[];
  constructor() {
    this.materials = [];
  }
  addMaterial(id: string, str = "") {
    this.materials.push(`
    if(m==${id}){
        ${str}
    }
      `);
  }
  addColorMaterial(id: string, r = 255, g = 255, b = 255) {
    const str = `col=vec3(${toFixed1(r)},${toFixed1(g)},${toFixed1(b)})/255.;`;
    this.addMaterial(id, str);
  }
  get shader() {
    return `
      vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){
        col=.2+.2*sin(m*2.+vec3(0.,1.,2.));
        
        ${joinLine(this.materials)}
        
        return col;
    }
      `;
  }
}

export { SDFMaterial };
