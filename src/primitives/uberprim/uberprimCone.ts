import { UberprimSDF, UberprimSDFConfig } from "../uberprim";

class UberprimConeSDF extends UberprimSDF {
  constructor(config: Partial<UberprimSDFConfig> = {}) {
    super(config);

    const intrinsicParams = {
      width: 0,
      height: 0,
      depth: 0.5,
      thickness: 0.25,
      xCornerRadius: 0,
      yCornerRadius: 0,
      zCornerRadius: 0.5,
    };

    this.intrinsicParams = intrinsicParams;

    this.initActualParams();
  }
}

export { UberprimConeSDF };
