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
  addIsolineMaterial(x = 1, y = 0, z = 1) {
    const str = `
    if(SHOW_ISOLINE==1){
      col=drawIsoline(col,vec3(pos.x*${toFixed1(x)},pos.y*${toFixed1(
      y
    )},pos.z*${toFixed1(z)}));
    }
    `;
    this.materials.push(str);
    return this;
  }
  get shader() {
    return `
    vec3 drawIsoline(vec3 col,vec3 pos){
      float d=map(pos).x;
      col*=1.-exp(-6.*abs(d));
      col*=.8+.2*cos(150.*d);
      col=mix(col,vec3(1.),1.-smoothstep(0.,.01,abs(d)));
      return col;
    }

    vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){
        col=vec3(153.,204.,255.)/255.;
        
        ${joinLine(this.materials)}
        
        return col;
    }
      `;
  }
}

export { SDFMaterial };
