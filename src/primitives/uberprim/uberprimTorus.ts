import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimTorusSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 0.125,
      thickness: 0.125,
      xCornerRadius: 0.5,
      yCornerRadius: 0.125,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();
  }
}

export { UberprimTorusSDF };
