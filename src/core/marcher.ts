import type { SDFMapFunction } from "../components/mapFunction";
import type { SDFMaterial } from "../components/material";
import { SDFRender } from "../components";
import { SDFMainImage } from "../components";
import { GroupSDF } from "../primitives/group";
import { joinLine } from "../utils";

const defaultShaderSDFUtils = `
// all sdfs
float sdBox(vec3 p,vec3 b)
{
    vec3 q=abs(p)-b;
    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);
}

float sdSphere(vec3 p,float s)
{
    return length(p)-s;
}

// infinite
float sdCylinder(vec3 p,vec3 c)
{
    return length(p.xz-c.xy)-c.z;
}

// vertical
float sdCylinder(vec3 p,vec2 h)
{
    vec2 d=abs(vec2(length(p.xz),p.y))-h;
    return min(max(d.x,d.y),0.)+length(max(d,0.));
}

// arbitrary orientation
float sdCylinder(vec3 p,vec3 a,vec3 b,float r)
{
    vec3 pa=p-a;
    vec3 ba=b-a;
    float baba=dot(ba,ba);
    float paba=dot(pa,ba);
    
    float x=length(pa*baba-ba*paba)-r*baba;
    float y=abs(paba-baba*.5)-baba*.5;
    float x2=x*x;
    float y2=y*y*baba;
    float d=(max(x,y)<0.)?-min(x2,y2):(((x>0.)?x2:0.)+((y>0.)?y2:0.));
    return sign(d)*sqrt(abs(d))/baba;
}

float sdHexPrism(vec3 p,vec2 h)
{
    const vec3 k=vec3(-.8660254,.5,.57735);
    p=abs(p);
    p.xy-=2.*min(dot(k.xy,p.xy),0.)*k.xy;
    vec2 d=vec2(
        length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x),h.x))*sign(p.y-h.x),
    p.z-h.y);
    return min(max(d.x,d.y),0.)+length(max(d,0.));
}

float sdOctogonPrism(in vec3 p,in float r,float h)
{
    const vec3 k=vec3(-.9238795325,// sqrt(2+sqrt(2))/2
    .3826834323,// sqrt(2-sqrt(2))/2
.4142135623);// sqrt(2)-1
// reflections
p=abs(p);
p.xy-=2.*min(dot(vec2(k.x,k.y),p.xy),0.)*vec2(k.x,k.y);
p.xy-=2.*min(dot(vec2(-k.x,k.y),p.xy),0.)*vec2(-k.x,k.y);
// polygon side
p.xy-=vec2(clamp(p.x,-k.z*r,k.z*r),r);
vec2 d=vec2(length(p.xy)*sign(p.y),p.z-h);
return min(max(d.x,d.y),0.)+length(max(d,0.));
}

float sdTriPrism(vec3 p,vec2 h)
{
    vec3 q=abs(p);
    return max(q.z-h.y,max(q.x*.866025+p.y*.5,-p.y)-h.x*.5);
}

float sdCapsule(vec3 p,vec3 a,vec3 b,float r)
{
    vec3 pa=p-a,ba=b-a;
    float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    return length(pa-ba*h)-r;
}

float dot2(in vec2 v){return dot(v,v);}
float dot2(in vec3 v){return dot(v,v);}

float sdBezier(in vec2 pos,in vec2 A,in vec2 B,in vec2 C)
{
    vec2 a=B-A;
    vec2 b=A-2.*B+C;
    vec2 c=a*2.;
    vec2 d=A-pos;
    float kk=1./dot(b,b);
    float kx=kk*dot(a,b);
    float ky=kk*(2.*dot(a,a)+dot(d,b))/3.;
    float kz=kk*dot(d,a);
    float res=0.;
    float p=ky-kx*kx;
    float p3=p*p*p;
    float q=kx*(2.*kx*kx-3.*ky)+kz;
    float h=q*q+4.*p3;
    if(h>=0.)
    {
        h=sqrt(h);
        vec2 x=(vec2(h,-h)-q)/2.;
        vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));
        float t=clamp(uv.x+uv.y-kx,0.,1.);
        res=dot2(d+(c+b*t)*t);
    }
    else
    {
        float z=sqrt(-p);
        float v=acos(q/(p*z*2.))/3.;
        float m=cos(v);
        float n=sin(v)*1.732050808;
        vec3 t=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);
        res=min(dot2(d+(c+b*t.x)*t.x),
        dot2(d+(c+b*t.y)*t.y));
        // the third root cannot be the closest
        // res = min(res,dot2(d+(c+b*t.z)*t.z));
    }
    return sqrt(res);
}

float opExtrusion_1(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float h)
{
    return opExtrusion_1(pos,sdBezier(pos.xy,A,B,C),h);
}

const float PI=3.14159265359;

float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax)
{
    vec2 xyMax=vec2(xMax,yMax);
    vec2 v0=xyMax*cos(A*PI);
    vec2 v1=xyMax*cos(B*PI);
    vec2 v2=xyMax*cos(C*PI);
    return sdBezier3D(pos,v0,v1,v2,zMax);
}

// Credit: https://www.shadertoy.com/view/MsVGWG
float sdUnterprim(vec3 p,vec4 s,vec3 r,vec2 ba,float sz2){
    vec3 d=abs(p)-s.xyz;
    float q=length(max(d.xy,0.))+min(0.,max(d.x,d.y))-r.x;
    // hole support
    q=abs(q)-s.w;
    
    vec2 pa=vec2(q,p.z-s.z);
    vec2 diag=pa-vec2(r.z,sz2)*clamp(dot(pa,ba),0.,1.);
    vec2 h0=vec2(max(q-r.z,0.),p.z+s.z);
    vec2 h1=vec2(max(q,0.),p.z-s.z);
    
    return sqrt(min(dot(diag,diag),min(dot(h0,h0),dot(h1,h1))))
    *sign(max(dot(pa,vec2(-ba.y,ba.x)),d.z))-r.y;
}

float sdUberprim(vec3 p,vec4 s,vec3 r){
    // these operations can be precomputed
    s.xy-=r.x;
    r.x-=s.w;
    s.w-=r.y;
    s.z-=r.y;
    vec2 ba=vec2(r.z,-2.*s.z);
    return sdUnterprim(p,s,r,ba/dot(ba,ba),ba.y);
}

float sdStar(in vec2 p,in float r,in int n,in float m)
{
    // next 4 lines can be precomputed for a given shape
    float an=3.141593/float(n);
    float en=3.141593/m;// m is between 2 and n
    vec2 acs=vec2(cos(an),sin(an));
    vec2 ecs=vec2(cos(en),sin(en));// ecs=vec2(0,1) for regular polygon
    
    float bn=mod(atan(p.x,p.y),2.*an)-an;
    p=length(p)*vec2(cos(bn),abs(sin(bn)));
    p-=r*acs;
    p+=ecs*clamp(-dot(p,ecs),0.,r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}

float opExtrusion_0(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

float sdStar3D(in vec3 pos,in float r,in int n,in float m,in float h)
{
    return opExtrusion_0(pos,sdStar(pos.xy,r,n,m),h);
}

// sdf ops
vec4 opElongate(in vec3 p,in vec3 h)
{
    vec3 q=abs(p)-h;
    return vec4(max(q,0.),min(max(q.x,max(q.y,q.z)),0.));
}

float opRound(in float d,in float h)
{
    return d-h;
}

float opOnion(in float d,in float h)
{
    return abs(d)-h;
}

float opExtrusion_2(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

vec2 opRevolution(in vec3 p,float w)
{
    return vec2(length(p.xz)-w,p.y);
}

float length2(vec2 p)
{
    return sqrt(p.x*p.x+p.y*p.y);
}

float length4(vec2 p)
{
    p=p*p;p=p*p;
    return pow(p.x+p.y,1./4.);
}

float length6(vec2 p)
{
    p=p*p*p;p=p*p;
    return pow(p.x+p.y,1./6.);
}

float length8(vec2 p)
{
    p=p*p;p=p*p;p=p*p;
    return pow(p.x+p.y,1./8.);
}

float length8(vec3 p)
{
    p=p*p;p=p*p;p=p*p;
    return pow(p.x+p.y+p.z,1./8.);
}

float opUnion(float d1,float d2)
{
    return min(d1,d2);
}

vec2 opUnion(vec2 d1,vec2 d2)
{
    return(d1.x<d2.x)?d1:d2;
}

float opIntersection(float d1,float d2)
{
    return max(d1,d2);
}

float opSubtraction(float d1,float d2)
{
    return max(-d1,d2);
}

float opSmoothUnion(float d1,float d2,float k)
{
    float h=max(k-abs(d1-d2),0.);
    return min(d1,d2)-h*h*.25/k;
}

float opSmoothIntersection(float d1,float d2,float k)
{
    float h=max(k-abs(d1-d2),0.);
    return max(d1,d2)+h*h*.25/k;
}

float opSmoothSubtraction(float d1,float d2,float k)
{
    float h=max(k-abs(-d1-d2),0.);
    return max(-d1,d2)+h*h*.25/k;
}

float opRep(in float p,in float c)
{
    return mod(p,c)-.5*c;
}

vec2 opRep(in vec2 p,in vec2 c)
{
    return mod(p,c)-.5*c;
}

vec3 opRep(in vec3 p,in vec3 c)
{
    return mod(p,c)-.5*c;
}

float opRepLim(in float p,in float s,in float lima,in float limb)
{
    return p-s*clamp(round(p/s),lima,limb);
}

vec2 opRepLim(in vec2 p,in float s,in vec2 lima,in vec2 limb)
{
    return p-s*clamp(round(p/s),lima,limb);
}

vec3 opRepLim(in vec3 p,in float s,in vec3 lima,in vec3 limb)
{
    return p-s*clamp(round(p/s),lima,limb);
}

vec2 opSymX(in vec2 p)
{
    p.x=abs(p.x);
    return p;
}

vec3 opSymX(in vec3 p)
{
    p.x=abs(p.x);
    return p;
}

vec2 opSymY(in vec2 p)
{
    p.y=abs(p.y);
    return p;
}

vec3 opSymY(in vec3 p)
{
    p.y=abs(p.y);
    return p;
}

vec3 opSymZ(in vec3 p)
{
    p.z=abs(p.z);
    return p;
}

vec3 opTx(vec3 p,mat4 m)
{
    return vec3(inverse(m)*vec4(p,1.));
}

vec3 opTwist(vec3 p,float k)
{
    float c=cos(k*p.y);
    float s=sin(k*p.y);
    mat2 m=mat2(c,-s,s,c);
    vec3 q=vec3(m*p.xz,p.y);
    return q;
}

vec3 opCheapBend(vec3 p,float k)
{
    float c=cos(k*p.y);
    float s=sin(k*p.y);
    mat2 m=mat2(c,-s,s,c);
    vec3 q=vec3(m*p.xy,p.z);
    return q;
}

float opHalfX(float sdf,vec3 pos){
    return max(sdf,pos.x);
}

float opHalfY(float sdf,vec3 pos){
    return max(sdf,pos.y);
}

float opHalfZ(float sdf,vec3 pos){
    return max(sdf,pos.z);
}

// ray
vec2 normalizeScreenCoords(vec2 screenCoord,vec2 resolution)
{
    vec2 result=2.*(screenCoord/resolution.xy-.5);
    result.x*=resolution.x/resolution.y;// Correct for aspect ratio
    return result;
}

mat3 setCamera(in vec3 ro,in vec3 ta,float cr)
{
    vec3 cw=normalize(ta-ro);
    vec3 cp=vec3(sin(cr),cos(cr),0.);
    vec3 cu=normalize(cross(cw,cp));
    vec3 cv=(cross(cu,cw));
    return mat3(cu,cv,cw);
}

vec3 getRayDirection(vec2 p,vec3 ro,vec3 ta,float fl){
    mat3 ca=setCamera(ro,ta,0.);
    vec3 rd=ca*normalize(vec3(p,fl));
    return rd;
}

// lighting
// https://learnopengl.com/Lighting/Basic-Lighting

float saturate_1(float a){
    return clamp(a,0.,1.);
}

// https://learnopengl.com/Lighting/Basic-Lighting

float saturate_0(float a){
    return clamp(a,0.,1.);
}

float diffuse(vec3 n,vec3 l){
    float diff=saturate_0(dot(n,l));
    return diff;
}

// https://learnopengl.com/Lighting/Basic-Lighting

float saturate_2(float a){
    return clamp(a,0.,1.);
}

float specular(vec3 n,vec3 l,float shininess){
    float spec=pow(saturate_2(dot(n,l)),shininess);
    return spec;
}

// https://www.shadertoy.com/view/4scSW4
float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.+dot(I,N),power);
}

// rotate
mat2 rotation2d(float angle){
    float s=sin(angle);
    float c=cos(angle);
    
    return mat2(
        c,-s,
        s,c
    );
}

mat4 rotation3d(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    
    return mat4(
        oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
        0.,0.,0.,1.
    );
}

vec2 rotate(vec2 v,float angle){
    return rotation2d(angle)*v;
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    return(rotation3d(axis,angle)*vec4(v,1.)).xyz;
}

mat3 rotation3dX(float angle){
    float s=sin(angle);
    float c=cos(angle);
    
    return mat3(
        1.,0.,0.,
        0.,c,s,
        0.,-s,c
    );
}

vec3 rotateX(vec3 v,float angle){
    return rotation3dX(angle)*v;
}

mat3 rotation3dY(float angle){
    float s=sin(angle);
    float c=cos(angle);
    
    return mat3(
        c,0.,-s,
        0.,1.,0.,
        s,0.,c
    );
}

vec3 rotateY(vec3 v,float angle){
    return rotation3dY(angle)*v;
}

mat3 rotation3dZ(float angle){
    float s=sin(angle);
    float c=cos(angle);
    
    return mat3(
        c,s,0.,
        -s,c,0.,
        0.,0.,1.
    );
}

vec3 rotateZ(vec3 v,float angle){
    return rotation3dZ(angle)*v;
}

// gamma
const float gamma=2.2;

float toGamma(float v){
    return pow(v,1./gamma);
}

vec2 toGamma(vec2 v){
    return pow(v,vec2(1./gamma));
}

vec3 toGamma(vec3 v){
    return pow(v,vec3(1./gamma));
}

vec4 toGamma(vec4 v){
    return vec4(toGamma(v.rgb),v.a);
}
`;

const defaultShaderMapFunction = `
vec2 map(in vec3 pos)
{
    vec2 res=vec2(1e10,0.);
    
    return res;
}
`;

const defaultShaderRaycast = `
vec2 raycast(in vec3 ro,in vec3 rd){
    vec2 res=vec2(-1.,-1.);
    float t=0.;
    for(int i=0;i<64;i++)
    {
        vec3 p=ro+t*rd;
        vec2 h=map(p);
        if(abs(h.x)<(.001*t))
        {
            res=vec2(t,h.y);
            break;
        };
        t+=h.x;
    }
    return res;
}
`;

const defaultShaderNormal = `
vec3 calcNormal(vec3 pos,float eps){
    const vec3 v1=vec3(1.,-1.,-1.);
    const vec3 v2=vec3(-1.,-1.,1.);
    const vec3 v3=vec3(-1.,1.,-1.);
    const vec3 v4=vec3(1.,1.,1.);
    
    return normalize(v1*map(pos+v1*eps).x+
    v2*map(pos+v2*eps).x+
    v3*map(pos+v3*eps).x+
    v4*map(pos+v4*eps).x);
}

vec3 calcNormal(vec3 pos){
    return calcNormal(pos,.002);
}

float softshadow(in vec3 ro,in vec3 rd,in float mint,in float tmax)
{
    float res=1.;
    float t=mint;
    for(int i=0;i<16;i++)
    {
        float h=map(ro+rd*t).x;
        res=min(res,8.*h/t);
        t+=clamp(h,.02,.10);
        if(h<.001||t>tmax)break;
    }
    return clamp(res,0.,1.);
}

float ao(in vec3 pos,in vec3 nor)
{
    float occ=0.;
    float sca=1.;
    for(int i=0;i<5;i++)
    {
        float hr=.01+.12*float(i)/4.;
        vec3 aopos=nor*hr+pos;
        float dd=map(aopos).x;
        occ+=-(dd-hr)*sca;
        sca*=.95;
    }
    return clamp(1.-3.*occ,0.,1.);
}
`;

const defaultShaderMaterial = `
vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){
    // common material
    col=vec3(153.,204.,255.)/255.;
    
    return col;
}
`;

const defaultShaderLighting = `
vec3 lighting(in vec3 col,in vec3 pos,in vec3 rd,in vec3 nor){
    vec3 lin=col;
    
    // sun
    {
        vec3 lig=normalize(vec3(1.,1.,1.));
        float dif=diffuse(nor,lig);
        float spe=specular(nor,lig,3.);
        lin+=col*dif*spe;
    }
    
    // sky
    {
        lin*=col*.7;
    }
    
    return lin;
}
`;

const defaultShaderRender = `
vec3 render(in vec3 ro,in vec3 rd){
    // skybox
    vec3 col=vec3(10.,10.,10.)/255.;
    
    // raymarching
    vec2 res=raycast(ro,rd);
    float t=res.x;
    float m=res.y;
    
    if(m>-.5){
        // position
        vec3 pos=ro+t*rd;
        // normal
        vec3 nor=(m<1.5)?vec3(0.,1.,0.):calcNormal(pos);
        
        // material
        col=material(col,pos,m,nor);
        
        // lighting
        col=lighting(col,pos,rd,nor);
    }
    
    return col;
}
`;

const defaultShaderGetSceneColor = `
vec3 getSceneColor(vec2 fragCoord){
    vec2 p=normalizeScreenCoords(fragCoord,iResolution.xy);
    
    vec3 ro=vec3(0.,4.,8.);
    vec3 ta=vec3(0.,0.,0.);
    const float fl=2.5;
    vec3 rd=getRayDirection(p,ro,ta,fl);
    
    // render
    vec3 col=render(ro,rd);
    
    // gamma
    col=toGamma(col);
    
    return col;
}
`;

const defaultShaderMainImage = `
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec3 tot=vec3(0.);
    
    float AA_size=1.;
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

export interface MarcherConfig {
  antialias: boolean;
  skybox: string;
}

class Marcher {
  utilFunction: string;
  mapFunction: SDFMapFunction | null;
  material: SDFMaterial | null;
  lighting: string | null;
  render: SDFRender;
  getSceneColor: string | null;
  mainImage: SDFMainImage | null;
  groups: GroupSDF[];
  constructor(config: Partial<MarcherConfig> = {}) {
    this.utilFunction = "";
    this.mapFunction = null;
    this.material = null;
    this.lighting = null;
    this.render = new SDFRender();
    this.getSceneColor = null;
    this.mainImage = new SDFMainImage();
    this.groups = [];

    const { antialias = false, skybox = "vec3(10.,10.,10.)/255." } = config;
    if (antialias) {
      this.mainImage.setAntialias(true);
    }
    if (skybox) {
      this.render.setSkyBox(skybox);
    }
  }
  setUtilFunction(str: string) {
    this.utilFunction = str;
    return this;
  }
  setMapFunction(mapFunction: SDFMapFunction) {
    this.mapFunction = mapFunction;
    return this;
  }
  setMaterial(material: SDFMaterial) {
    this.material = material;
    return this;
  }
  setLighting(lighting: string) {
    this.lighting = lighting;
    return this;
  }
  setGetSceneColor(getSceneColor: string) {
    this.getSceneColor = getSceneColor;
    return this;
  }
  addGroup(group: GroupSDF) {
    this.groups.push(group);
    return this;
  }
  get shaderSDFUtils() {
    return defaultShaderSDFUtils;
  }
  get shaderMapFunction() {
    return this.mapFunction?.shader || defaultShaderMapFunction;
  }
  get shaderRaycast() {
    return defaultShaderRaycast;
  }
  get shaderNormal() {
    return defaultShaderNormal;
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
  get shaderGroupFunctions() {
    return joinLine(this.groups.map((item) => item.mapFuncShader));
  }
  get fragmentShader() {
    return `
    ${this.shaderSDFUtils}

    ${this.utilFunction}

    ${this.shaderGroupFunctions}

    ${this.shaderMapFunction}

    ${this.shaderRaycast}

    ${this.shaderNormal}

    ${this.shaderMaterial}

    ${this.shaderLighting}

    ${this.shaderRender}

    ${this.shaderGetSceneColor}

    ${this.shaderMainImage}
      `;
  }
}

export { Marcher };
