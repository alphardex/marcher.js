import type { PrimitiveSDF } from "../primitives/primitive";
import { joinLine } from "../utils";

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
  get primitivesShader() {
    return joinLine(this.primitives.map((item) => item.totalShader));
  }
  get customCodesBeforeShader() {
    return joinLine(this.customCodesBefore);
  }
  get customCodesAfterShader() {
    return joinLine(this.customCodesAfter);
  }
  get shader() {
    return `
      {
        ${this.customCodesBeforeShader}
        ${this.primitivesShader}
        ${this.customCodesAfterShader}
      }
      `;
  }
}

export { SDFLayer };
