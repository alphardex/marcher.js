import { SDFLayer } from "../components/layer";
import { joinLine } from "../utils";

class SDFMapFunction {
  layers: SDFLayer[];
  constructor() {
    this.layers = [];
  }
  addLayer(layer: SDFLayer) {
    this.layers.push(layer);
    return this;
  }
  get layerShader() {
    return joinLine(this.layers.map((item) => item.shader));
  }
  get shader() {
    return `
      vec2 map(in vec3 pos)
      {
          vec2 res=vec2(1e10,0.);
          
          ${this.layerShader}
          
          return res;
      }
      `;
  }
}

export { SDFMapFunction };
