class SDFMainImage {
  antialias: boolean;
  constructor() {
    this.antialias = false;
  }
  setAntialias(value = true) {
    this.antialias = value;
    return this;
  }
  get shader() {
    return `
      void mainImage(out vec4 fragColor,in vec2 fragCoord){
        vec3 tot=vec3(0.);
        
        float AA_size=${this.antialias ? `2.` : `1.`};
        float count=0.;
        for(float aaY=0.;aaY<AA_size;aaY++)
        {
            for(float aaX=0.;aaX<AA_size;aaX++)
            {
                tot+=getSceneColor(fragCoord+vec2(aaX,aaY)/AA_size);
                count+=1.;
            }
        }
        tot/=count;
        
        fragColor=vec4(tot,1.);
    }
      `;
  }
}

export { SDFMainImage };
