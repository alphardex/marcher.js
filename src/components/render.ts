class SDFRender {
  skybox: string;
  constructor() {
    this.skybox = "vec3(10.,10.,10.)/255.";
  }
  setSkyBox(str: string) {
    this.skybox = str;
  }
  get shader() {
    return `
      vec3 render(in vec3 ro,in vec3 rd){
        vec3 col=${this.skybox};
        
        vec2 res=raycast(ro,rd);
        float t=res.x;
        float m=res.y;
        
        if(m>-.5){
            vec3 pos=ro+t*rd;
            
            vec3 nor=(m<1.5)?vec3(0.,1.,0.):calcNormal(pos);
            
            
            col=material(col,pos,m,nor);
            
            
            col=lighting(col,pos,rd,nor);
        }
        
        return col;
    }
      `;
  }
}

export { SDFRender };
