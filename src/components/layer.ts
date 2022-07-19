import type { PrimitiveSDF } from "../primitives/primitive";
import { joinLine, reverse } from "../utils";

class SDFLayer {
  primitives: PrimitiveSDF[];
  customCodesBefore: string[];
  customCodesAfter: string[];
  constructor() {
    this.primitives = [];
    this.customCodesBefore = [];
    this.customCodesAfter = [];
  }
  addPrimitive(primitive: PrimitiveSDF) {
    this.primitives.push(primitive);
    return this;
  }
  prependCustomCode(customCode: string) {
    this.customCodesBefore.push(customCode);
    return this;
  }
  appendCustomCode(customCode: string) {
    this.customCodesAfter.push(customCode);
    return this;
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
  get customCodesBeforeShader() {
    return joinLine(this.customCodesBefore);
  }
  get customCodesAfterShader() {
    return joinLine(this.customCodesAfter);
  }
  get totalShaderArray() {
    return [
      this.customCodesBeforeShader,
      this.primitivesShaderReverse,
      this.customCodesAfterShader,
    ];
  }
  get shader() {
    return `
      {
        ${joinLine(this.totalShaderArray)}
      }
      `;
  }
}

export { SDFLayer };
