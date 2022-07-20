'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const DEFAULT_MATERIAL_ID = "114514.";

const compact = (arr) => arr.filter((item) => item);
const reverse = (arr) => [...arr].reverse();

const rad2Deg = (rad) => (rad * 180.0) / Math.PI;
const deg2rad = (deg) => (deg * Math.PI) / 180.0;
const toFixed1 = (num) => Number(num).toFixed(1);
const toFixed2 = (num) => Number(num).toFixed(2);
const lerp = (x, y, t) => {
    return (1 - t) * x + t * y;
};

const joinLine = (arr) => arr.join("\n");

class SDFLayer {
    primitives;
    customCodesBefore;
    customCodesAfter;
    constructor() {
        this.primitives = [];
        this.customCodesBefore = [];
        this.customCodesAfter = [];
    }
    addPrimitive(primitive) {
        this.primitives.push(primitive);
        return this;
    }
    prependCustomCode(customCode) {
        this.customCodesBefore.push(customCode);
        return this;
    }
    appendCustomCode(customCode) {
        this.customCodesAfter.push(customCode);
        return this;
    }
    get primitivesShaderArray() {
        return this.primitives.map((item) => item.totalShader);
    }
    get primitivesShader() {
        return joinLine(this.primitivesShaderArray);
    }
    get primitivesShaderReverse() {
        return joinLine(reverse(this.primitivesShaderArray));
    }
    get customCodesBeforeShader() {
        return joinLine(this.customCodesBefore);
    }
    get customCodesAfterShader() {
        return joinLine(this.customCodesAfter);
    }
    get totalShaderArray() {
        return [
            this.customCodesBeforeShader,
            this.primitivesShaderReverse,
            this.customCodesAfterShader,
        ];
    }
    get shader() {
        return `
      {
        ${joinLine(this.totalShaderArray)}
      }
      `;
    }
}

class SDFMainImage {
    antialias;
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

class SDFMapFunction {
    layers;
    constructor() {
        this.layers = [];
    }
    addLayer(layer) {
        this.layers.push(layer);
        return this;
    }
    get layerShader() {
        return joinLine(this.layers.map((item) => item.shader));
    }
    get shader() {
        return `
      vec2 map(in vec3 pos)
      {
          vec2 res=vec2(1e10,0.);
          
          ${this.layerShader}
          
          return res;
      }
      `;
    }
}

class SDFMaterial {
    materials;
    constructor() {
        this.materials = [];
    }
    addMaterial(id = DEFAULT_MATERIAL_ID, str = "") {
        this.materials.push(`
    if(m==${id}){
        ${str}
    }
      `);
        return this;
    }
    addColorMaterial(id = DEFAULT_MATERIAL_ID, r = 255, g = 255, b = 255) {
        const str = `col=vec3(${toFixed1(r)},${toFixed1(g)},${toFixed1(b)})/255.;`;
        this.addMaterial(id, str);
        return this;
    }
    addIsolineMaterial(id = DEFAULT_MATERIAL_ID, x = 1, y = 0, z = 1) {
        const str = `
    if(SHOW_ISOLINE==1){
      col=drawIsoline(col,vec3(pos.x*${toFixed1(x)},pos.y*${toFixed1(y)},pos.z*${toFixed1(z)}));
    }
    `;
        this.addMaterial(id, str);
        return this;
    }
    get shader() {
        return `
    vec3 drawIsoline(vec3 col,vec3 pos){
      float d=map(pos).x;
      col*=1.-exp(-6.*abs(d));
      col*=.8+.2*cos(150.*d);
      col=mix(col,vec3(1.),1.-smoothstep(0.,.01,abs(d)));
      return col;
    }

    vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){
        col=vec3(153.,204.,255.)/255.;
        
        ${joinLine(this.materials)}
        
        return col;
    }
      `;
    }
}

class SDFRender {
    skybox;
    constructor() {
        this.skybox = "vec3(10.,10.,10.)/255.";
    }
    setSkyBox(str) {
        this.skybox = str;
        return this;
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

var defaultShaderSDFUtils = "#define GLSLIFY 1\nconst float PI=3.14159265359;const float TWO_PI=6.28318530718;float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}float sdSphere(vec3 p,float s){return length(p)-s;}float sdCylinder(vec3 p,vec3 c){return length(p.xz-c.xy)-c.z;}float sdCylinder(vec3 p,vec2 h){vec2 d=abs(vec2(length(p.xz),p.y))-h;return min(max(d.x,d.y),0.)+length(max(d,0.));}float sdCylinder(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a;vec3 ba=b-a;float baba=dot(ba,ba);float paba=dot(pa,ba);float x=length(pa*baba-ba*paba)-r*baba;float y=abs(paba-baba*.5)-baba*.5;float x2=x*x;float y2=y*y*baba;float d=(max(x,y)<0.)?-min(x2,y2):(((x>0.)?x2:0.)+((y>0.)?y2:0.));return sign(d)*sqrt(abs(d))/baba;}float sdCapsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}float dot2(in vec2 v){return dot(v,v);}float dot2(in vec3 v){return dot(v,v);}float sdBezier(in vec2 pos,in vec2 A,in vec2 B,in vec2 C){vec2 a=B-A;vec2 b=A-2.*B+C;vec2 c=a*2.;vec2 d=A-pos;float kk=1./dot(b,b);float kx=kk*dot(a,b);float ky=kk*(2.*dot(a,a)+dot(d,b))/3.;float kz=kk*dot(d,a);float res=0.;float p=ky-kx*kx;float p3=p*p*p;float q=kx*(2.*kx*kx-3.*ky)+kz;float h=q*q+4.*p3;if(h>=0.){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.;vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));float t=clamp(uv.x+uv.y-kx,0.,1.);res=dot2(d+(c+b*t)*t);}else{float z=sqrt(-p);float v=acos(q/(p*z*2.))/3.;float m=cos(v);float n=sin(v)*1.732050808;vec3 t=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);res=min(dot2(d+(c+b*t.x)*t.x),dot2(d+(c+b*t.y)*t.y));}return sqrt(res);}float opExtrusion_0(in vec3 p,in float sdf,in float h){vec2 w=vec2(sdf,abs(p.z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float h){return opExtrusion_0(pos,sdBezier(pos.xy,A,B,C),h);}const float PI_0=3.14159265359;float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax){vec2 xyMax=vec2(xMax,yMax);vec2 v0=xyMax*cos(A*PI_0);vec2 v1=xyMax*cos(B*PI_0);vec2 v2=xyMax*cos(C*PI_0);return sdBezier3D(pos,v0,v1,v2,zMax);}float sdUnterprim(vec3 p,vec4 s,vec3 r,vec2 ba,float sz2){vec3 d=abs(p)-s.xyz;float q=length(max(d.xy,0.))+min(0.,max(d.x,d.y))-r.x;q=abs(q)-s.w;vec2 pa=vec2(q,p.z-s.z);vec2 diag=pa-vec2(r.z,sz2)*clamp(dot(pa,ba),0.,1.);vec2 h0=vec2(max(q-r.z,0.),p.z+s.z);vec2 h1=vec2(max(q,0.),p.z-s.z);return sqrt(min(dot(diag,diag),min(dot(h0,h0),dot(h1,h1))))*sign(max(dot(pa,vec2(-ba.y,ba.x)),d.z))-r.y;}float sdUberprim(vec3 p,vec4 s,vec3 r){s.xy-=r.x;r.x-=s.w;s.w-=r.y;s.z-=r.y;vec2 ba=vec2(r.z,-2.*s.z);return sdUnterprim(p,s,r,ba/dot(ba,ba),ba.y);}float sdStar(in vec2 p,in float r,in int n,in float m){float an=3.141593/float(n);float en=3.141593/m;vec2 acs=vec2(cos(an),sin(an));vec2 ecs=vec2(cos(en),sin(en));float bn=mod(atan(p.x,p.y),2.*an)-an;p=length(p)*vec2(cos(bn),abs(sin(bn)));p-=r*acs;p+=ecs*clamp(-dot(p,ecs),0.,r*acs.y/ecs.y);return length(p)*sign(p.x);}float opExtrusion_3(in vec3 p,in float sdf,in float h){vec2 w=vec2(sdf,abs(p.z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}float sdStar3D(in vec3 pos,in float r,in int n,in float m,in float h){return opExtrusion_3(pos,sdStar(pos.xy,r,n,m),h);}float sdTriangle(in vec2 p,in vec2 p0,in vec2 p1,in vec2 p2){vec2 e0=p1-p0;vec2 e1=p2-p1;vec2 e2=p0-p2;vec2 v0=p-p0;vec2 v1=p-p1;vec2 v2=p-p2;vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.);vec2 pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.);vec2 pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);float s=e0.x*e2.y-e0.y*e2.x;vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));return-sqrt(d.x)*sign(d.y);}float opExtrusion_1(in vec3 p,in float sdf,in float h){vec2 w=vec2(sdf,abs(p.z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}float sdTriangle3D(in vec3 pos,in vec2 p0,in vec2 p1,in vec2 p2,in float h){return opExtrusion_1(pos,sdTriangle(pos.xy,p0,p1,p2),h);}const float PI_1=3.14159265359;float sdTriangle3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax){vec2 xyMax=vec2(xMax,yMax);vec2 v0=xyMax*cos(A*PI_1);vec2 v1=xyMax*cos(B*PI_1);vec2 v2=xyMax*cos(C*PI_1);return sdTriangle3D(pos,v0,v1,v2,zMax);}float sdGyroid(vec3 p,float scale,float thickness,float bias){p*=scale;float d=dot(sin(p),cos(p.zxy));float g=abs(d-bias);return g/scale-thickness;}float ndot(in vec2 a,in vec2 b){return a.x*b.x-a.y*b.y;}float sdRhombus(vec3 p,float la,float lb,float h,float ra){p=abs(p);vec2 b=vec2(la,lb);float f=clamp((ndot(b,b-2.*p.xz))/dot(b,b),-1.,1.);vec2 q=vec2(length(p.xz-.5*b*vec2(1.-f,1.+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra,p.y-h);return min(max(q.x,q.y),0.)+length(max(q,0.));}vec4 opElongate(in vec3 p,in vec3 h){vec3 q=abs(p)-h;return vec4(max(q,0.),min(max(q.x,max(q.y,q.z)),0.));}float opRound(in float d,in float h){return d-h;}float opOnion(in float d,in float h){return abs(d)-h;}float opInverse(float d){float result=-d;return result;}float opOffset(float d,float v){return d-v;}float opCrossing(float d1,float d2){return max(d1,d2);}float opDifference(float d1,float d2){return opCrossing(d1,opInverse(d2));}float opClearance(float d1,float d2,float v){return opDifference(d1,opOffset(d2,v));}float opShell(float d1,float v){return opClearance(d1,d1,-abs(v));}float opExtrusion_2(in vec3 p,in float sdf,in float h){vec2 w=vec2(sdf,abs(p.z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}vec2 opRevolution(in vec3 p,float w){return vec2(length(p.xz)-w,p.y);}float length2(vec2 p){return sqrt(p.x*p.x+p.y*p.y);}float length4(vec2 p){p=p*p;p=p*p;return pow(p.x+p.y,1./4.);}float length6(vec2 p){p=p*p*p;p=p*p;return pow(p.x+p.y,1./6.);}float length8(vec2 p){p=p*p;p=p*p;p=p*p;return pow(p.x+p.y,1./8.);}float length8(vec3 p){p=p*p;p=p*p;p=p*p;return pow(p.x+p.y+p.z,1./8.);}float opUnion(float d1,float d2){return min(d1,d2);}vec2 opUnion(vec2 d1,vec2 d2){return(d1.x<d2.x)?d1:d2;}float opIntersection(float d1,float d2){return max(d1,d2);}float opSubtraction(float d1,float d2){return max(-d1,d2);}float opSmoothUnion(float d1,float d2,float k){float h=max(k-abs(d1-d2),0.);return min(d1,d2)-h*h*.25/k;}float opSmoothIntersection(float d1,float d2,float k){float h=max(k-abs(d1-d2),0.);return max(d1,d2)+h*h*.25/k;}float opSmoothSubtraction(float d1,float d2,float k){float h=max(k-abs(-d1-d2),0.);return max(-d1,d2)+h*h*.25/k;}float opRep(in float p,in float c){return mod(p,c)-.5*c;}vec2 opRep(in vec2 p,in vec2 c){return mod(p,c)-.5*c;}vec3 opRep(in vec3 p,in vec3 c){return mod(p,c)-.5*c;}float opRepLim(in float p,in float s,in float lima,in float limb){return p-s*clamp(round(p/s),lima,limb);}vec2 opRepLim(in vec2 p,in float s,in vec2 lima,in vec2 limb){return p-s*clamp(round(p/s),lima,limb);}vec3 opRepLim(in vec3 p,in float s,in vec3 lima,in vec3 limb){return p-s*clamp(round(p/s),lima,limb);}vec2 opSymX(in vec2 p){p.x=abs(p.x);return p;}vec3 opSymX(in vec3 p){p.x=abs(p.x);return p;}vec2 opSymY(in vec2 p){p.y=abs(p.y);return p;}vec3 opSymY(in vec3 p){p.y=abs(p.y);return p;}vec3 opSymZ(in vec3 p){p.z=abs(p.z);return p;}vec3 opTx(vec3 p,mat4 m){return vec3(inverse(m)*vec4(p,1.));}vec3 opTwist(vec3 p,float k){float c=cos(k*p.y);float s=sin(k*p.y);mat2 m=mat2(c,-s,s,c);vec3 q=vec3(m*p.xz,p.y);return q;}vec3 opCheapBend(vec3 p,float k){float c=cos(k*p.y);float s=sin(k*p.y);mat2 m=mat2(c,-s,s,c);vec3 q=vec3(m*p.xy,p.z);return q;}float opHalfX(float sdf,vec3 pos){return max(sdf,pos.x);}float opHalfY(float sdf,vec3 pos){return max(sdf,pos.y);}float opHalfZ(float sdf,vec3 pos){return max(sdf,pos.z);}vec3 opPosition(in vec3 p,in vec3 pos){return p-pos;}vec3 opRotation(const in vec3 p,const in vec4 q){return p+2.*cross(-q.xyz,cross(-q.xyz,p)+q.w*p);}vec3 opSymXYZ(in vec3 p,in vec3 pos,in vec3 mir,in vec3 axis){p=p*(vec3(1.)-mir)+(abs(p+pos-axis)-abs(pos-axis))*mir;return p;}vec2 normalizeScreenCoords(vec2 screenCoord,vec2 resolution){vec2 result=2.*(screenCoord/resolution.xy-.5);result.x*=resolution.x/resolution.y;return result;}mat3 setCamera(in vec3 ro,in vec3 ta,float cr){vec3 cw=normalize(ta-ro);vec3 cp=vec3(sin(cr),cos(cr),0.);vec3 cu=normalize(cross(cw,cp));vec3 cv=(cross(cu,cw));return mat3(cu,cv,cw);}vec3 getRayDirection(vec2 p,vec3 ro,vec3 ta,float fl){mat3 ca=setCamera(ro,ta,0.);vec3 rd=ca*normalize(vec3(p,fl));return rd;}float saturate_1(float a){return clamp(a,0.,1.);}float saturate_2(float a){return clamp(a,0.,1.);}float diffuse(vec3 n,vec3 l){float diff=saturate_2(dot(n,l));return diff;}float saturate_0(float a){return clamp(a,0.,1.);}float specular(vec3 n,vec3 l,float shininess){float spec=pow(saturate_0(dot(n,l)),shininess);return spec;}float fresnel(float bias,float scale,float power,vec3 I,vec3 N){return bias+scale*pow(1.+dot(I,N),power);}mat2 rotation2d(float angle){float s=sin(angle);float c=cos(angle);return mat2(c,-s,s,c);}mat4 rotation3d(vec3 axis,float angle){axis=normalize(axis);float s=sin(angle);float c=cos(angle);float oc=1.-c;return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,0.,0.,0.,1.);}vec2 rotate(vec2 v,float angle){return rotation2d(angle)*v;}vec3 rotate(vec3 v,vec3 axis,float angle){return(rotation3d(axis,angle)*vec4(v,1.)).xyz;}mat3 rotation3dX(float angle){float s=sin(angle);float c=cos(angle);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}vec3 rotateX(vec3 v,float angle){return rotation3dX(angle)*v;}mat3 rotation3dY(float angle){float s=sin(angle);float c=cos(angle);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}vec3 rotateY(vec3 v,float angle){return rotation3dY(angle)*v;}mat3 rotation3dZ(float angle){float s=sin(angle);float c=cos(angle);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}vec3 rotateZ(vec3 v,float angle){return rotation3dZ(angle)*v;}const float gamma=2.2;float toGamma(float v){return pow(v,1./gamma);}vec2 toGamma(vec2 v){return pow(v,vec2(1./gamma));}vec3 toGamma(vec3 v){return pow(v,vec3(1./gamma));}vec4 toGamma(vec4 v){return vec4(toGamma(v.rgb),v.a);}"; // eslint-disable-line

var defaultShaderMapFunction = "#define GLSLIFY 1\nvec2 map(in vec3 pos){vec2 res=vec2(1e10,0.);return res;}"; // eslint-disable-line

var defaultShaderRaycast = "#define GLSLIFY 1\nvec2 raycast(in vec3 ro,in vec3 rd){vec2 res=vec2(-1.,-1.);float t=0.;for(int i=0;i<64;i++){vec3 p=ro+t*rd;vec2 h=map(p);if(abs(h.x)<(.001*t)){res=vec2(t,h.y);break;};t+=h.x;}return res;}"; // eslint-disable-line

var defaultShaderNormal = "#define GLSLIFY 1\nvec3 calcNormal(vec3 pos,float eps){const vec3 v1=vec3(1.,-1.,-1.);const vec3 v2=vec3(-1.,-1.,1.);const vec3 v3=vec3(-1.,1.,-1.);const vec3 v4=vec3(1.,1.,1.);return normalize(v1*map(pos+v1*eps).x+v2*map(pos+v2*eps).x+v3*map(pos+v3*eps).x+v4*map(pos+v4*eps).x);}vec3 calcNormal(vec3 pos){return calcNormal(pos,.002);}float softshadow(in vec3 ro,in vec3 rd,in float mint,in float tmax){float res=1.;float t=mint;for(int i=0;i<16;i++){float h=map(ro+rd*t).x;res=min(res,8.*h/t);t+=clamp(h,.02,.10);if(h<.001||t>tmax)break;}return clamp(res,0.,1.);}float ao(in vec3 pos,in vec3 nor){float occ=0.;float sca=1.;for(int i=0;i<5;i++){float hr=.01+.12*float(i)/4.;vec3 aopos=nor*hr+pos;float dd=map(aopos).x;occ+=-(dd-hr)*sca;sca*=.95;}return clamp(1.-3.*occ,0.,1.);}"; // eslint-disable-line

var defaultShaderMaterial = "#define GLSLIFY 1\nvec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){col=vec3(153.,204.,255.)/255.;return col;}"; // eslint-disable-line

var defaultShaderLighting = "#define GLSLIFY 1\nvec3 lighting(in vec3 col,in vec3 pos,in vec3 rd,in vec3 nor){vec3 lin=col;{vec3 lig=normalize(vec3(1.,1.,1.));float dif=diffuse(nor,lig);float spe=specular(nor,lig,3.);lin+=col*dif*spe;}{lin*=col*.7;}return lin;}"; // eslint-disable-line

var shaderBeautifulLighting = "#define GLSLIFY 1\nvec3 lighting(in vec3 col,in vec3 pos,in vec3 rd,in vec3 nor){vec3 lin=vec3(0.);vec3 ref=reflect(rd,nor);float occ=1.;{vec3 lig=normalize(vec3(-.5,.4,-.6));vec3 hal=normalize(lig-rd);float dif=diffuse(nor,lig);dif*=softshadow(pos,lig,.02,2.5);float spe=specular(nor,hal,16.);spe*=dif;spe*=fresnel(.04,.96,5.,-lig,hal);lin+=col*2.20*dif*vec3(1.30,1.,.70);lin+=5.*spe;}{float dif=sqrt(saturate_0(.5+.5*nor.y));dif*=occ;float spe=smoothstep(-.2,.2,ref.y);spe*=dif;spe*=fresnel(.04,.96,5.,rd,nor);spe*=softshadow(pos,ref,.02,2.5);lin+=col*.60*dif;lin+=2.*spe;}{float dif=diffuse(nor,normalize(vec3(.5,0.,.6)))*saturate_0(1.-pos.y);dif*=occ;lin+=col*.55*dif;}{float dif=fresnel(0.,1.,2.,rd,nor);dif*=occ;lin+=col*.25*dif;}return lin;}"; // eslint-disable-line

var defaultShaderRender = "#define GLSLIFY 1\nvec3 render(in vec3 ro,in vec3 rd){vec3 col=vec3(10.,10.,10.)/255.;vec2 res=raycast(ro,rd);float t=res.x;float m=res.y;if(m>-.5){vec3 pos=ro+t*rd;vec3 nor=(m<1.5)?vec3(0.,1.,0.):calcNormal(pos);col=material(col,pos,m,nor);col=lighting(col,pos,rd,nor);}return col;}"; // eslint-disable-line

var defaultShaderGetSceneColor = "#define GLSLIFY 1\nvec3 getSceneColor(vec2 fragCoord){vec2 p=normalizeScreenCoords(fragCoord,iResolution.xy);vec3 ro=vec3(0.,4.,8.);vec3 ta=vec3(0.,0.,0.);const float fl=2.5;vec3 rd=getRayDirection(p,ro,ta,fl);vec3 col=render(ro,rd);col=toGamma(col);return col;}"; // eslint-disable-line

var shaderGetSceneColorWithOrbitControls = "#define GLSLIFY 1\nvec3 getSceneColor(vec2 fragCoord){vec2 p=normalizeScreenCoords(fragCoord,iResolution.xy);vec3 ro=vec3(0.,4.,8.);vec3 ta=vec3(0.,0.,0.);const float fl=2.5;vec2 m=iMouse.xy/iResolution.xy;ro.yz=rotate(ro.yz,-m.y*PI+1.);ro.xz=rotate(ro.xz,-m.x*TWO_PI);vec3 rd=getRayDirection(p,ro,ta,fl);vec3 col=render(ro,rd);col=toGamma(col);return col;}"; // eslint-disable-line

var defaultShaderMainImage = "#define GLSLIFY 1\nvoid mainImage(out vec4 fragColor,in vec2 fragCoord){vec3 tot=vec3(0.);float AA_size=1.;float count=0.;for(float aaY=0.;aaY<AA_size;aaY++){for(float aaX=0.;aaX<AA_size;aaX++){tot+=getSceneColor(fragCoord+vec2(aaX,aaY)/AA_size);count+=1.;}}tot/=count;fragColor=vec4(tot,1.);}"; // eslint-disable-line

class Marcher {
    utilFunction;
    mapFunction;
    material;
    lighting;
    raycast;
    calcNormal;
    render;
    getSceneColor;
    mainImage;
    groups;
    showIsoline;
    constructor(config = {}) {
        this.utilFunction = "";
        this.mapFunction = null;
        this.material = null;
        this.lighting = null;
        this.raycast = null;
        this.calcNormal = null;
        this.render = new SDFRender();
        this.getSceneColor = null;
        this.mainImage = new SDFMainImage();
        this.groups = [];
        const { antialias = false, skybox = "vec3(10.,10.,10.)/255.", showIsoline = false, } = config;
        if (antialias) {
            this.mainImage.setAntialias(true);
        }
        if (skybox) {
            this.render.setSkyBox(skybox);
        }
        this.showIsoline = showIsoline;
    }
    setUtilFunction(str) {
        this.utilFunction = str;
        return this;
    }
    setMapFunction(mapFunction) {
        this.mapFunction = mapFunction;
        return this;
    }
    setMaterial(material) {
        this.material = material;
        return this;
    }
    setLighting(lighting) {
        this.lighting = lighting;
        return this;
    }
    setRaycast(raycast) {
        this.raycast = raycast;
        return this;
    }
    setCalcNormal(calcNormal) {
        this.calcNormal = calcNormal;
        return this;
    }
    setGetSceneColor(getSceneColor) {
        this.getSceneColor = getSceneColor;
        return this;
    }
    addGroup(group) {
        this.groups.push(group);
        return this;
    }
    enableOrbitControls() {
        this.setGetSceneColor(shaderGetSceneColorWithOrbitControls);
        return this;
    }
    enableBeautifulLighting() {
        this.setLighting(shaderBeautifulLighting);
        return this;
    }
    get shaderSDFUtils() {
        return defaultShaderSDFUtils;
    }
    get shaderMapFunction() {
        return this.mapFunction?.shader || defaultShaderMapFunction;
    }
    get shaderRaycast() {
        return this.raycast || defaultShaderRaycast;
    }
    get shaderNormal() {
        return this.calcNormal || defaultShaderNormal;
    }
    get shaderMaterial() {
        return this.material?.shader || defaultShaderMaterial;
    }
    get shaderLighting() {
        return this.lighting || defaultShaderLighting;
    }
    get shaderRender() {
        return this.render?.shader || defaultShaderRender;
    }
    get shaderGetSceneColor() {
        return this.getSceneColor || defaultShaderGetSceneColor;
    }
    get shaderMainImage() {
        return this.mainImage?.shader || defaultShaderMainImage;
    }
    get shaderGroupFunctionsArray() {
        return this.groups.map((item) => item.mapFuncShader);
    }
    get shaderGroupFunctions() {
        return joinLine(this.shaderGroupFunctionsArray);
    }
    get shaderGroupFunctionsReverse() {
        return joinLine(reverse(this.shaderGroupFunctionsArray));
    }
    get shaderIsolineDefine() {
        return `#define SHOW_ISOLINE ${this.showIsoline ? 1 : 0}`;
    }
    get totalShaderArray() {
        return [
            this.shaderIsolineDefine,
            this.shaderSDFUtils,
            this.utilFunction,
            this.shaderGroupFunctionsReverse,
            this.shaderMapFunction,
            this.shaderRaycast,
            this.shaderNormal,
            this.shaderMaterial,
            this.shaderLighting,
            this.shaderRender,
            this.shaderGetSceneColor,
            this.shaderMainImage,
        ];
    }
    get fragmentShader() {
        return joinLine(this.totalShaderArray);
    }
}

class PrimitiveSDF {
    sdfVarName;
    materialId;
    isVisible;
    translateXValue;
    translateYValue;
    translateZValue;
    rotateXValue;
    rotateYValue;
    rotateZValue;
    scaleXValue;
    scaleYValue;
    scaleZValue;
    operationsBefore;
    operationsAfter;
    operationsHalf;
    operationsSym;
    constructor(config = {}) {
        const { sdfVarName = "dt", materialId = DEFAULT_MATERIAL_ID } = config;
        this.sdfVarName = sdfVarName;
        this.materialId = materialId;
        this.isVisible = true;
        this.translateXValue = 0;
        this.translateYValue = 0;
        this.translateZValue = 0;
        this.rotateXValue = 0;
        this.rotateYValue = 0;
        this.rotateZValue = 0;
        this.scaleXValue = 1;
        this.scaleYValue = 1;
        this.scaleZValue = 1;
        this.operationsBefore = [];
        this.operationsAfter = [];
        this.operationsHalf = [];
        this.operationsSym = [];
    }
    // -- add start --
    get pointVarName() {
        return `${this.sdfVarName}p`;
    }
    get pointShader() {
        return `vec3 ${this.pointVarName}=pos;`;
    }
    get shader() {
        return ``;
    }
    get addExisting() {
        return `res=opUnion(res,vec2(${this.sdfVarName},${this.materialId}));`;
    }
    get totalShader() {
        return joinLine(compact([
            this.pointShader,
            this.positionShader,
            this.operationsSymShader,
            this.rotationShader,
            this.operationsBeforeShader,
            this.shader,
            this.operationsAfterShader,
            this.operationsHalfShader,
            this.isVisible ? this.addExisting : "",
        ]));
    }
    get scaleVector() {
        return `vec3(${toFixed2(this.scaleXValue)},${toFixed2(this.scaleYValue)},${toFixed2(this.scaleZValue)})`;
    }
    get scaleValue() {
        return Math.min(this.scaleXValue, Math.min(this.scaleYValue, this.scaleZValue));
    }
    show() {
        this.isVisible = true;
        return this;
    }
    hide() {
        this.isVisible = false;
        return this;
    }
    // -- add end --
    // -- positioning start --
    get positionVector() {
        return `vec3(${toFixed2(this.translateXValue)},${toFixed2(this.translateYValue)},${toFixed2(this.translateZValue)})`;
    }
    get positionShader() {
        return `${this.pointVarName}=opPosition(${this.pointVarName},-${this.positionVector});`;
    }
    translate(x = 0, y = 0, z = 0) {
        this.translateXValue = x;
        this.translateYValue = y;
        this.translateZValue = z;
        return this;
    }
    translateX(value = 0) {
        this.translate(value, this.translateYValue, this.translateZValue);
        return this;
    }
    translateY(value = 0) {
        this.translate(this.translateXValue, value, this.translateZValue);
        return this;
    }
    translateZ(value = 0) {
        this.translate(this.translateXValue, this.translateYValue, value);
        return this;
    }
    get rotationVector() {
        return `vec3(${toFixed2(this.rotateXValue)},${toFixed2(this.rotateYValue)},${toFixed2(this.rotateZValue)})`;
    }
    get rotationShader() {
        return joinLine([
            `${this.pointVarName}=rotateX(${this.pointVarName},${toFixed2(this.rotateXValue)});`,
            `${this.pointVarName}=rotateY(${this.pointVarName},${toFixed2(this.rotateYValue)});`,
            `${this.pointVarName}=rotateZ(${this.pointVarName},${toFixed2(this.rotateZValue)});`,
        ]);
    }
    rotate(x = 0, y = 0, z = 0, useDeg2rad = true) {
        if (useDeg2rad) {
            this.rotateXValue = deg2rad(x);
            this.rotateYValue = deg2rad(y);
            this.rotateZValue = deg2rad(z);
        }
        else {
            this.rotateXValue = x;
            this.rotateYValue = y;
            this.rotateZValue = z;
        }
        return this;
    }
    rotateX(value = 0) {
        this.rotate(value, this.rotateYValue, this.rotateZValue);
        return this;
    }
    rotateY(value = 0) {
        this.rotate(this.rotateXValue, value, this.rotateZValue);
        return this;
    }
    rotateZ(value = 0) {
        this.rotate(this.rotateXValue, this.rotateYValue, value);
        return this;
    }
    scale(x = 1, y = 1, z = 1) {
        this.scaleXValue = x;
        this.scaleYValue = y;
        this.scaleZValue = z;
        return this;
    }
    scaleX(value = 1) {
        this.scale(value, this.scaleYValue, this.scaleZValue);
        return this;
    }
    scaleY(value = 1) {
        this.scale(this.scaleXValue, value, this.scaleZValue);
        return this;
    }
    scaleZ(value = 1) {
        this.scale(this.scaleXValue, this.scaleYValue, value);
        return this;
    }
    // -- positioning end --
    // -- operations start --
    get operationsBeforeShader() {
        return joinLine(this.operationsBefore);
    }
    get operationsAfterShader() {
        return joinLine(this.operationsAfter);
    }
    get operationsHalfShader() {
        return joinLine(this.operationsHalf);
    }
    get operationsSymShader() {
        return joinLine(this.operationsSym);
    }
    removeOperation(name) {
        this.operationsBefore = this.operationsBefore.filter((e) => !e.includes(name));
        this.operationsAfter = this.operationsAfter.filter((e) => !e.includes(name));
        this.operationsHalf = this.operationsHalf.filter((e) => !e.includes(name));
        this.operationsSym = this.operationsSym.filter((e) => !e.includes(name));
    }
    elongate(x = 0.1, y = 0.1, z = 0.1) {
        this.operationsBefore.push(`${this.pointVarName}=opElongate(${this.pointVarName},vec3(${toFixed2(x)},${toFixed2(y)},${toFixed2(z)})).xyz;`);
        return this;
    }
    elongateX(value = 0.1) {
        this.elongate(value, 0, 0);
        return this;
    }
    elongateY(value = 0.1) {
        this.elongate(0, value, 0);
        return this;
    }
    elongateZ(value = 0.1) {
        this.elongate(0, 0, value);
        return this;
    }
    round(value = 0.1) {
        this.operationsAfter.push(`${this.sdfVarName}=opRound(${this.sdfVarName},${toFixed2(value)});`);
        return this;
    }
    onion(value = 0.03) {
        this.operationsAfter.push(`${this.sdfVarName}=opOnion(${this.sdfVarName},${toFixed2(value)});`);
        return this;
    }
    shell(value = 0.03) {
        this.operationsAfter.push(`${this.sdfVarName}=opShell(${this.sdfVarName},${toFixed2(value)});`);
        return this;
    }
    union(sdf) {
        this.operationsAfter.push(`${this.sdfVarName}=opUnion(${sdf.sdfVarName},${this.sdfVarName});`);
        sdf.hide();
        return this;
    }
    intersect(sdf) {
        this.operationsAfter.push(`${this.sdfVarName}=opIntersection(${sdf.sdfVarName},${this.sdfVarName});`);
        sdf.hide();
        return this;
    }
    subtract(sdf) {
        this.operationsAfter.push(`${this.sdfVarName}=opSubtraction(${sdf.sdfVarName},${this.sdfVarName});`);
        sdf.hide();
        return this;
    }
    smoothUnion(sdf, value = 0.1) {
        this.operationsAfter.push(`${this.sdfVarName}=opSmoothUnion(${sdf.sdfVarName},${this.sdfVarName},${toFixed2(value)});`);
        sdf.hide();
        return this;
    }
    smoothIntersect(sdf, value = 0.1) {
        this.operationsAfter.push(`${this.sdfVarName}=opSmoothIntersection(${sdf.sdfVarName},${this.sdfVarName},${toFixed2(value)});`);
        sdf.hide();
        return this;
    }
    smoothSubtract(sdf, value = 0.1) {
        this.operationsAfter.push(`${this.sdfVarName}=opSmoothSubtraction(${sdf.sdfVarName},${this.sdfVarName},${toFixed2(value)});`);
        sdf.hide();
        return this;
    }
    sym(axis = "x") {
        this.operationsSym.push(`${this.pointVarName}=opSym${axis.toUpperCase()}(${this.pointVarName});`);
        return this;
    }
    symX() {
        this.sym("x");
        return this;
    }
    symY() {
        this.sym("y");
        return this;
    }
    symZ() {
        this.sym("z");
        return this;
    }
    rep(x = 3, y = 3, z = 3) {
        this.operationsBefore.push(`${this.pointVarName}=opRep(${this.pointVarName},vec3(${toFixed2(x)},${toFixed2(y)},${toFixed2(z)}));`);
        return this;
    }
    repLim(s = 2, x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1) {
        this.operationsBefore.push(`${this.pointVarName}=opRepLim(${this.pointVarName},${toFixed2(s)},vec3(${toFixed2(x1)},${toFixed2(y1)},${toFixed2(z1)}),vec3(${toFixed2(x2)},${toFixed2(y2)},${toFixed2(z2)}));`);
        return this;
    }
    twist(value = 3) {
        this.operationsBefore.push(`${this.pointVarName}=opTwist(${this.pointVarName},${toFixed2(value)});`);
        return this;
    }
    cheapBend(value = 1) {
        this.operationsBefore.push(`${this.pointVarName}=opCheapBend(${this.pointVarName},${toFixed2(value)});`);
        return this;
    }
    half(axis = "x") {
        this.operationsHalf.push(`${this.sdfVarName}=opHalf${axis.toUpperCase()}(${this.sdfVarName},${this.pointVarName});`);
        return this;
    }
    halfX() {
        this.half("x");
        return this;
    }
    halfY() {
        this.half("y");
        return this;
    }
    halfZ() {
        this.half("z");
        return this;
    }
}

class BezierSDF extends PrimitiveSDF {
    x1;
    y1;
    x2;
    y2;
    x3;
    y3;
    xMax;
    yMax;
    zMax;
    constructor(config = {}) {
        super(config);
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0.8, x3 = 0.6, y3 = 0.0, xMax = 1.3, yMax = 0.9, zMax = 0.1, } = config;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.xMax = xMax;
        this.yMax = yMax;
        this.zMax = zMax;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdBezier3D(${this.pointVarName}/${this.scaleVector},vec2(${toFixed2(this.x1)},${toFixed2(this.y1)}),vec2(${toFixed2(this.x2)},${toFixed2(this.y2)}),vec2(${toFixed2(this.x3)},${toFixed2(this.y3)}),${toFixed2(this.xMax)},${toFixed2(this.yMax)},${toFixed2(this.zMax)})*${toFixed2(this.scaleValue)};`;
    }
}

class BoxSDF extends PrimitiveSDF {
    width;
    height;
    depth;
    constructor(config = {}) {
        super(config);
        const { width = 0.5, height = 0.5, depth = 0.5 } = config;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdBox(${this.pointVarName}/${this.scaleVector},vec3(${toFixed2(this.width)},${toFixed2(this.height)},${toFixed2(this.depth)}))*${toFixed2(this.scaleValue)};`;
    }
}

class CylinderSDF extends PrimitiveSDF {
    radius;
    height;
    constructor(config = {}) {
        super(config);
        const { radius = 0.5, height = 0.5 } = config;
        this.radius = radius;
        this.height = height;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdCylinder(${this.pointVarName}/${this.scaleVector},vec2(${toFixed2(this.radius)},${toFixed2(this.height)}))*${toFixed2(this.scaleValue)};`;
    }
}

class GroupSDF extends PrimitiveSDF {
    mapFuncName;
    primitives;
    constructor(config = {}) {
        super(config);
        const { mapFuncName = "g1" } = config;
        this.mapFuncName = mapFuncName;
        this.primitives = [];
    }
    addPrimitive(sdf) {
        this.primitives.push(sdf);
    }
    get primitivesShaderArray() {
        return this.primitives.map((item) => item.totalShader);
    }
    get primitivesShader() {
        return joinLine(this.primitivesShaderArray);
    }
    get primitivesShaderReverse() {
        return joinLine(reverse(this.primitivesShaderArray));
    }
    get mapFuncShader() {
        return `
    vec2 ${this.mapFuncName}(in vec3 pos)
    {
        vec2 res=vec2(1e10,0.);
        
        {
            ${this.primitivesShaderReverse}
        }
        
        return res;
    }
    `;
    }
    get shader() {
        return `vec2 ${this.sdfVarName}=${this.mapFuncName}(${this.pointVarName}/${this.scaleVector})*${toFixed2(this.scaleValue)};`;
    }
    get addExisting() {
        return `res=opUnion(res,${this.sdfVarName});`;
    }
}

class GyroidSDF extends PrimitiveSDF {
    gyroidScale;
    thickness;
    bias;
    constructor(config = {}) {
        super(config);
        const { gyroidScale = 1, thickness = 0.03, bias = 0 } = config;
        this.gyroidScale = gyroidScale;
        this.thickness = thickness;
        this.bias = bias;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdGyroid(${this.pointVarName}/${this.scaleVector},${toFixed2(this.gyroidScale)},${toFixed2(this.thickness)},${toFixed2(this.bias)})*${toFixed2(this.scaleValue)};`;
    }
}

class JointSDF extends PrimitiveSDF {
    x1;
    y1;
    z1;
    x2;
    y2;
    z2;
    r;
    constructor(config = {}) {
        super(config);
        const { x1 = 0, y1 = -0.5, z1 = 0, x2 = 0, y2 = 0.5, z2 = 0, r = 0.25, } = config;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.r = r;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdCapsule(${this.pointVarName}/${this.scaleVector},vec3(${toFixed2(this.x1)},${toFixed2(this.y1)},${toFixed2(this.z1)}),vec3(${toFixed2(this.x2)},${toFixed2(this.y2)},${toFixed2(this.z2)}),${toFixed2(this.r)})*${toFixed2(this.scaleValue)};`;
    }
}

class PolygonSDF extends PrimitiveSDF {
    radius;
    edgeCount;
    angleDivisor;
    depth;
    constructor(config = {}) {
        super(config);
        const { radius = 0.5, edgeCount = 6, angleDivisor = 2, depth = 0.5, } = config;
        this.radius = radius;
        this.edgeCount = edgeCount;
        this.angleDivisor = angleDivisor;
        this.depth = depth;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdStar3D(${this.pointVarName}/${this.scaleVector},${toFixed2(this.radius)},${this.edgeCount},${toFixed2(this.angleDivisor)},${toFixed2(this.depth)})*${toFixed2(this.scaleValue)};`;
    }
}

class RhombusSDF extends PrimitiveSDF {
    diagA;
    diagB;
    height;
    radius;
    constructor(config = {}) {
        super(config);
        const { diagA = 0.5, diagB = 0.25, height = 0.1, radius = 0 } = config;
        this.diagA = diagA;
        this.diagB = diagB;
        this.height = height;
        this.radius = radius;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdRhombus(${this.pointVarName}/${this.scaleVector},${toFixed2(this.diagA)},${toFixed2(this.diagB)},${toFixed2(this.height)},${toFixed2(this.radius)})*${toFixed2(this.scaleValue)};`;
    }
}

class SphereSDF extends PrimitiveSDF {
    radius;
    constructor(config = {}) {
        super(config);
        const { radius = 0.5 } = config;
        this.radius = radius;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdSphere(${this.pointVarName}/${this.scaleVector},${toFixed2(this.radius)})*${toFixed2(this.scaleValue)};`;
    }
}

class TriangleSDF extends PrimitiveSDF {
    x1;
    y1;
    x2;
    y2;
    x3;
    y3;
    xMax;
    yMax;
    zMax;
    constructor(config = {}) {
        super(config);
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0.8, x3 = 0.6, y3 = 0.0, xMax = 1.3, yMax = 0.9, zMax = 0.1, } = config;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.xMax = xMax;
        this.yMax = yMax;
        this.zMax = zMax;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdTriangle3D(${this.pointVarName}/${this.scaleVector},vec2(${toFixed2(this.x1)},${toFixed2(this.y1)}),vec2(${toFixed2(this.x2)},${toFixed2(this.y2)}),vec2(${toFixed2(this.x3)},${toFixed2(this.y3)}),${toFixed2(this.xMax)},${toFixed2(this.yMax)},${toFixed2(this.zMax)})*${toFixed2(this.scaleValue)};`;
    }
}

class UberprimSDF extends PrimitiveSDF {
    intrinsicParams;
    width;
    height;
    depth;
    thickness;
    xCornerRadius;
    yCornerRadius;
    zCornerRadius;
    uberHole;
    uberBevel;
    uberCone;
    constructor(config = {}) {
        super(config);
        this.width = 0;
        this.height = 0;
        this.depth = 0;
        this.thickness = 0;
        this.xCornerRadius = 0;
        this.yCornerRadius = 0;
        this.zCornerRadius = 0;
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
        const { uberHole = 0, uberBevel = 0, uberCone = 0 } = config;
        this.uberHole = uberHole;
        this.uberBevel = uberBevel;
        this.uberCone = uberCone;
    }
    initActualParams() {
        const { width, height, depth, thickness, xCornerRadius, yCornerRadius, zCornerRadius, } = this.intrinsicParams;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.thickness = thickness;
        this.xCornerRadius = xCornerRadius;
        this.yCornerRadius = yCornerRadius;
        this.zCornerRadius = zCornerRadius;
    }
    setUberHole(value) {
        this.uberHole = value;
    }
    setUberBevel(value) {
        this.uberBevel = value;
    }
    setUberCone(value) {
        this.uberCone = value;
    }
    get shader() {
        return `float ${this.sdfVarName}=sdUberprim(${this.pointVarName}/${this.scaleVector},vec4(${toFixed2(this.width)},${toFixed2(this.height)},${toFixed2(this.depth)},${toFixed2(this.thickness)}),vec3(${toFixed2(this.xCornerRadius)},${toFixed2(this.yCornerRadius)},${toFixed2(this.zCornerRadius)}))*${toFixed2(this.scaleValue)};`;
    }
}

class UberprimBoxSDF extends UberprimSDF {
    constructor(config = {}) {
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
    setUberHole(value) {
        super.setUberHole(value);
        this.setParameterByHole();
    }
    setUberBevel(value) {
        super.setUberBevel(value);
        this.setParameterByBevel();
    }
    setUberCone(value) {
        super.setUberCone(value);
        this.setParameterByCone();
    }
}

class UberprimCapsuleSDF extends UberprimSDF {
    constructor(config = {}) {
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
        this.thickness = lerp(this.intrinsicParams.thickness, this.intrinsicParams.thickness / 2, this.uberCone);
        this.xCornerRadius = lerp(this.intrinsicParams.xCornerRadius, 0, this.uberCone);
        this.yCornerRadius = lerp(this.intrinsicParams.yCornerRadius, 0, this.uberCone);
    }
    setUberCone(value) {
        super.setUberCone(value);
        this.setParameterByCone();
    }
}

class UberprimConeSDF extends UberprimSDF {
    constructor(config = {}) {
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

class UberprimCylinderSDF extends UberprimSDF {
    constructor(config = {}) {
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
        this.xCornerRadius = lerp(this.intrinsicParams.xCornerRadius, 0, this.uberCone);
    }
    setUberHole(value) {
        super.setUberHole(value);
        this.setParameterByHole();
    }
    setUberCone(value) {
        super.setUberCone(value);
        this.setParameterByCone();
    }
}

class UberprimSphereSDF extends UberprimSDF {
    constructor(config = {}) {
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

class UberprimTorusSDF extends UberprimSDF {
    constructor(config = {}) {
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

exports.BezierSDF = BezierSDF;
exports.BoxSDF = BoxSDF;
exports.CylinderSDF = CylinderSDF;
exports.DEFAULT_MATERIAL_ID = DEFAULT_MATERIAL_ID;
exports.GroupSDF = GroupSDF;
exports.GyroidSDF = GyroidSDF;
exports.JointSDF = JointSDF;
exports.Marcher = Marcher;
exports.PolygonSDF = PolygonSDF;
exports.PrimitiveSDF = PrimitiveSDF;
exports.RhombusSDF = RhombusSDF;
exports.SDFLayer = SDFLayer;
exports.SDFMainImage = SDFMainImage;
exports.SDFMapFunction = SDFMapFunction;
exports.SDFMaterial = SDFMaterial;
exports.SDFRender = SDFRender;
exports.SphereSDF = SphereSDF;
exports.TriangleSDF = TriangleSDF;
exports.UberprimBoxSDF = UberprimBoxSDF;
exports.UberprimCapsuleSDF = UberprimCapsuleSDF;
exports.UberprimConeSDF = UberprimConeSDF;
exports.UberprimCylinderSDF = UberprimCylinderSDF;
exports.UberprimSDF = UberprimSDF;
exports.UberprimSphereSDF = UberprimSphereSDF;
exports.UberprimTorusSDF = UberprimTorusSDF;
exports.compact = compact;
exports.deg2rad = deg2rad;
exports.joinLine = joinLine;
exports.lerp = lerp;
exports.rad2Deg = rad2Deg;
exports.reverse = reverse;
exports.toFixed1 = toFixed1;
exports.toFixed2 = toFixed2;
