import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimSphereSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0.5,
      height: 0.5,
      depth: 0.5,
      thickness: 0.5,
      xCornerRadius: 0.5,
      yCornerRadius: 0.5,
      zCornerRadius: 0,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();
  }
}

export { UberprimSphereSDF };
