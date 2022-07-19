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

    this.setUberCone(this.uberCone);
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth / 2, 0, this.uberCone);
    this.height = lerp(this.intrinsicParams.depth / 2, 0, this.uberCone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth / 2, this.uberCone);

    this.thickness = lerp(
      this.intrinsicParams.thickness,
      this.intrinsicParams.thickness / 2,
      this.uberCone
    );
    this.xCornerRadius = lerp(
      this.intrinsicParams.xCornerRadius,
      0,
      this.uberCone
    );
    this.yCornerRadius = lerp(
      this.intrinsicParams.yCornerRadius,
      0,
      this.uberCone
    );
  }
  setUberCone(value: number) {
    super.setUberCone(value);

    this.setParameterByCone();
  }
}

export { UberprimCapsuleSDF };
