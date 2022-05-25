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

    this.setHole(this.hole);
    this.setBevel(this.bevel);
    this.setCone(this.cone);
  }
  setHole(value: number) {
    super.setHole(value);

    this.setParameterByHole();
  }
  setBevel(value: number) {
    super.setBevel(value);

    this.setParameterByBevel();
  }
  setCone(value: number) {
    super.setCone(value);

    this.setParameterByCone();
  }
}

export { UberprimBoxSDF };
