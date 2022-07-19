import type { SDFMapFunction } from "../components/mapFunction";
import type { SDFMaterial } from "../components/material";
import { SDFRender } from "../components";
import { SDFMainImage } from "../components";
import { GroupSDF } from "../primitives/group";
import { joinLine, reverse } from "../utils";
import defaultShaderSDFUtils from "../shaders/util.glsl";
import defaultShaderMapFunction from "../shaders/map.glsl";
import defaultShaderRaycast from "../shaders/raycast.glsl";
import defaultShaderNormal from "../shaders/normal.glsl";
import defaultShaderMaterial from "../shaders/material.glsl";
import defaultShaderLighting from "../shaders/lighting.glsl";
import shaderBeautifulLighting from "../shaders/lightingB.glsl";
import defaultShaderRender from "../shaders/render.glsl";
import defaultShaderGetSceneColor from "../shaders/getSceneColor.glsl";
import shaderGetSceneColorWithOrbitControls from "../shaders/getSceneColorO.glsl";
import defaultShaderMainImage from "../shaders/main.glsl";

export interface MarcherConfig {
  antialias: boolean;
  skybox: string;
  showIsoline: boolean;
}

class Marcher {
  utilFunction: string;
  mapFunction: SDFMapFunction | null;
  material: SDFMaterial | null;
  lighting: string | null;
  raycast: string | null;
  calcNormal: string | null;
  render: SDFRender;
  getSceneColor: string | null;
  mainImage: SDFMainImage | null;
  groups: GroupSDF[];
  showIsoline: boolean;
  constructor(config: Partial<MarcherConfig> = {}) {
    this.utilFunction = "";
    this.mapFunction = null;
    this.material = null;
    this.lighting = null;
    this.raycast = null;
    this.calcNormal = null;
    this.render = new SDFRender();
    this.getSceneColor = null;
    this.mainImage = new SDFMainImage();
    this.groups = [];

    const {
      antialias = false,
      skybox = "vec3(10.,10.,10.)/255.",
      showIsoline = false,
    } = config;

    if (antialias) {
      this.mainImage.setAntialias(true);
    }
    if (skybox) {
      this.render.setSkyBox(skybox);
    }
    this.showIsoline = showIsoline;
  }
  setUtilFunction(str: string) {
    this.utilFunction = str;
    return this;
  }
  setMapFunction(mapFunction: SDFMapFunction) {
    this.mapFunction = mapFunction;
    return this;
  }
  setMaterial(material: SDFMaterial) {
    this.material = material;
    return this;
  }
  setLighting(lighting: string) {
    this.lighting = lighting;
    return this;
  }
  setRaycast(raycast: string) {
    this.raycast = raycast;
    return this;
  }
  setCalcNormal(calcNormal: string) {
    this.calcNormal = calcNormal;
    return this;
  }
  setGetSceneColor(getSceneColor: string) {
    this.getSceneColor = getSceneColor;
    return this;
  }
  addGroup(group: GroupSDF) {
    this.groups.push(group);
    return this;
  }
  enableOrbitControls() {
    this.setGetSceneColor(shaderGetSceneColorWithOrbitControls);
    return this;
  }
  enableBeautifulLighting() {
    this.setLighting(shaderBeautifulLighting);
    return this;
  }
  get shaderSDFUtils() {
    return defaultShaderSDFUtils;
  }
  get shaderMapFunction() {
    return this.mapFunction?.shader || defaultShaderMapFunction;
  }
  get shaderRaycast() {
    return this.raycast || defaultShaderRaycast;
  }
  get shaderNormal() {
    return this.calcNormal || defaultShaderNormal;
  }
  get shaderMaterial() {
    return this.material?.shader || defaultShaderMaterial;
  }
  get shaderLighting() {
    return this.lighting || defaultShaderLighting;
  }
  get shaderRender() {
    return this.render?.shader || defaultShaderRender;
  }
  get shaderGetSceneColor() {
    return this.getSceneColor || defaultShaderGetSceneColor;
  }
  get shaderMainImage() {
    return this.mainImage?.shader || defaultShaderMainImage;
  }
  get shaderGroupFunctionsArray() {
    return this.groups.map((item) => item.mapFuncShader);
  }
  get shaderGroupFunctions() {
    return joinLine(this.shaderGroupFunctionsArray);
  }
  get shaderGroupFunctionsReverse() {
    return joinLine(reverse(this.shaderGroupFunctionsArray));
  }
  get shaderIsolineDefine() {
    return `#define SHOW_ISOLINE ${this.showIsoline ? 1 : 0}`;
  }
  get totalShaderArray() {
    return [
      this.shaderIsolineDefine,
      this.shaderSDFUtils,
      this.utilFunction,
      this.shaderGroupFunctionsReverse,
      this.shaderMapFunction,
      this.shaderRaycast,
      this.shaderNormal,
      this.shaderMaterial,
      this.shaderLighting,
      this.shaderRender,
      this.shaderGetSceneColor,
      this.shaderMainImage,
    ];
  }
  get fragmentShader() {
    return joinLine(this.totalShaderArray);
  }
}

export { Marcher };
