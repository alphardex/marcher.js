import { lerp } from "../../utils";
import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimCapsuleSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 1,
      thickness: 0.5,
      xCornerRadius: 0.5,
      yCornerRadius: 0.5,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();

    this.setCone(this.cone);
  }
  setCone(value: number) {
    super.setCone(value);

    this.setParameterByCone();
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth / 2, 0, this.cone);
    this.height = lerp(this.intrinsicParams.depth / 2, 0, this.cone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth / 2, this.cone);

    this.thickness = lerp(
      this.intrinsicParams.thickness,
      this.intrinsicParams.thickness / 2,
      this.cone
    );
    this.xCornerRadius = lerp(this.intrinsicParams.xCornerRadius, 0, this.cone);
    this.yCornerRadius = lerp(this.intrinsicParams.yCornerRadius, 0, this.cone);
  }
}

export { UberprimCapsuleSDF };
