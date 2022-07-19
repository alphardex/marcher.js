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

    this.setUberHole(this.uberHole);
    this.setUberCone(this.uberCone);
  }
  setParameterByHole() {
    this.thickness = this.intrinsicParams.width / 2 - this.uberHole;
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth, 0, this.uberCone);
    this.height = lerp(this.intrinsicParams.depth, 0, this.uberCone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth, this.uberCone);

    this.xCornerRadius = lerp(
      this.intrinsicParams.xCornerRadius,
      0,
      this.uberCone
    );
  }
  setUberHole(value: number) {
    super.setUberHole(value);

    this.setParameterByHole();
  }
  setUberCone(value: number) {
    super.setUberCone(value);

    this.setParameterByCone();
  }
}

export { UberprimCylinderSDF };
