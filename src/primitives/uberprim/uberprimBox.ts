import { lerp } from "../../utils";
import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimBoxSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 0.5,
      thickness: 0.25,
      xCornerRadius: 0,
      yCornerRadius: 0,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();

    this.setUberHole(this.uberHole);
    this.setUberBevel(this.uberBevel);
    this.setUberCone(this.uberCone);
  }
  setParameterByHole() {
    this.thickness = this.intrinsicParams.width / 2 - this.uberHole;
  }
  setParameterByBevel() {
    this.xCornerRadius = this.uberBevel;
  }
  setParameterByCone() {
    this.width = lerp(this.intrinsicParams.depth, 0, this.uberCone);
    this.height = lerp(this.intrinsicParams.depth, 0, this.uberCone);
    this.zCornerRadius = lerp(0, this.intrinsicParams.depth, this.uberCone);
  }
  setUberHole(value: number) {
    super.setUberHole(value);

    this.setParameterByHole();
  }
  setUberBevel(value: number) {
    super.setUberBevel(value);

    this.setParameterByBevel();
  }
  setUberCone(value: number) {
    super.setUberCone(value);

    this.setParameterByCone();
  }
}

export { UberprimBoxSDF };
