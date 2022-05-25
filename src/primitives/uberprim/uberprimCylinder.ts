import { lerp } from "../../utils";
import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimCylinderSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 0.5,
      thickness: 0.25,
      xCornerRadius: 0.5,
      yCornerRadius: 0,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();

    this.setHole(this.hole);
    this.setCone(this.cone);
  }
  setHole(value: number) {
    super.setHole(value);

    this.setParameterByHole();
  }
  setCone(value: number) {
    super.setCone(value);

    this.setParameterByCone();
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth, 0, this.cone);
    this.height = lerp(this.intrinsicParams.depth, 0, this.cone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth, this.cone);

    this.xCornerRadius = lerp(this.intrinsicParams.xCornerRadius, 0, this.cone);
  }
}

export { UberprimCylinderSDF };
