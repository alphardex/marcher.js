import { SDFLayer } from "../components/layer";
import { joinLine } from "../utils";

class SDFMapFunction {
  layers: SDFLayer[];
  constructor() {
    this.layers = [];
  }
  addLayer(layer: SDFLayer) {
    this.layers.push(layer);
  }
  get shader() {
    return `
      vec2 map(in vec3 pos)
      {
          vec2 res=vec2(1e10,0.);
          
          ${joinLine(this.layers.map((item) => item.shader))}
          
          return res;
      }
      `;
  }
}

export { SDFMapFunction };
