import type { SDFMapFunction } from "../components/mapFunction";
import type { SDFMaterial } from "../components/material";
import { SDFRender } from "../components";
import { SDFMainImage } from "../components";
import { GroupSDF } from "../primitives/group";
import { joinLine, reverse } from "../utils";

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

float opExtrusion_2(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float h)
{
    return opExtrusion_2(pos,sdBezier(pos.xy,A,B,C),h);
}

const float PI_1=3.14159265359;

float sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax)
{
    vec2 xyMax=vec2(xMax,yMax);
    vec2 v0=xyMax*cos(A*PI_1);
    vec2 v1=xyMax*cos(B*PI_1);
    vec2 v2=xyMax*cos(C*PI_1);
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

float opExtrusion_1(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

float sdStar3D(in vec3 pos,in float r,in int n,in float m,in float h)
{
    return opExtrusion_1(pos,sdStar(pos.xy,r,n,m),h);
}

float sdTriangle(in vec2 p,in vec2 p0,in vec2 p1,in vec2 p2)
{
    vec2 e0=p1-p0;
    vec2 e1=p2-p1;
    vec2 e2=p0-p2;
    
    vec2 v0=p-p0;
    vec2 v1=p-p1;
    vec2 v2=p-p2;
    
    vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.);
    vec2 pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.);
    vec2 pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
    
    float s=e0.x*e2.y-e0.y*e2.x;
    vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),
    vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),
    vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
    
    return-sqrt(d.x)*sign(d.y);
}

float opExtrusion_0(in vec3 p,in float sdf,in float h)
{
    vec2 w=vec2(sdf,abs(p.z)-h);
    return min(max(w.x,w.y),0.)+length(max(w,0.));
}

float sdTriangle3D(in vec3 pos,in vec2 p0,in vec2 p1,in vec2 p2,in float h)
{
    return opExtrusion_0(pos,sdTriangle(pos.xy,p0,p1,p2),h);
}

const float PI_0=3.14159265359;

float sdTriangle3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax)
{
    vec2 xyMax=vec2(xMax,yMax);
    vec2 v0=xyMax*cos(A*PI_0);
    vec2 v1=xyMax*cos(B*PI_0);
    vec2 v2=xyMax*cos(C*PI_0);
    return sdTriangle3D(pos,v0,v1,v2,zMax);
}

float sdGyroid(vec3 p,float scale,float thickness,float bias){
    p*=scale;
    float d=dot(sin(p),cos(p.zxy));
    float g=abs(d-bias);
    return g/scale-thickness;
}

float ndot(in vec2 a,in vec2 b){return a.x*b.x-a.y*b.y;}

float sdRhombus(vec3 p,float la,float lb,float h,float ra)
{
    p=abs(p);
    vec2 b=vec2(la,lb);
    float f=clamp((ndot(b,b-2.*p.xz))/dot(b,b),-1.,1.);
    vec2 q=vec2(length(p.xz-.5*b*vec2(1.-f,1.+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra,p.y-h);
    return min(max(q.x,q.y),0.)+length(max(q,0.));
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

float opExtrusion_3(in vec3 p,in float sdf,in float h)
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

float saturate_2(float a){
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

float saturate_1(float a){
    return clamp(a,0.,1.);
}

float specular(vec3 n,vec3 l,float shininess){
    float spec=pow(saturate_1(dot(n,l)),shininess);
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

// consts
const float PI_2=3.14159265359;

const float TWO_PI_2666156403=6.28318530718;
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

const shaderBeautifulLighting = `
vec3 lighting(in vec3 col,in vec3 pos,in vec3 rd,in vec3 nor){
    vec3 lin=vec3(0.);
    
    // reflection
    vec3 ref=reflect(rd,nor);
    
    // ao
    float occ=1.;
    
    // sun
    {
        // pos
        vec3 lig=normalize(vec3(-.5,.4,-.6));
        // dir
        vec3 hal=normalize(lig-rd);
        // diffuse
        float dif=diffuse(nor,lig);
        // softshadow
        dif*=softshadow(pos,lig,.02,2.5);
        // specular
        float spe=specular(nor,hal,16.);
        spe*=dif;
        // fresnel
        spe*=fresnel(.04,.96,5.,-lig,hal);
        // apply
        lin+=col*2.20*dif*vec3(1.30,1.,.70);
        lin+=5.*spe;
    }
    // sky
    {
        // diffuse
        float dif=sqrt(saturate_0(.5+.5*nor.y));
        // ao
        dif*=occ;
        // specular
        float spe=smoothstep(-.2,.2,ref.y);
        spe*=dif;
        // fresnel
        spe*=fresnel(.04,.96,5.,rd,nor);
        // softshadow
        spe*=softshadow(pos,ref,.02,2.5);
        // apply
        lin+=col*.60*dif;
        lin+=2.*spe;
    }
    // back
    {
        // diff
        float dif=diffuse(nor,normalize(vec3(.5,0.,.6)))*saturate_0(1.-pos.y);
        // ao
        dif*=occ;
        // apply
        lin+=col*.55*dif;
    }
    // sss
    {
        // fresnel
        float dif=fresnel(0.,1.,2.,rd,nor);
        // ao
        dif*=occ;
        // apply
        lin+=col*.25*dif;
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

const shaderGetSceneColorWithOrbitControls = `
vec3 getSceneColor(vec2 fragCoord){
    vec2 p=normalizeScreenCoords(fragCoord,iResolution.xy);
    
    vec3 ro=vec3(0.,4.,8.);
    vec3 ta=vec3(0.,0.,0.);
    const float fl=2.5;
    
    vec2 m=iMouse.xy/iResolution.xy;
    ro.yz=rotate(ro.yz,-m.y*PI_1+1.);
    ro.xz=rotate(ro.xz,-m.x*TWO_PI_2666156403);
    
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
  showIsoline: boolean;
}

class Marcher {
  utilFunction: string;
  mapFunction: SDFMapFunction | null;
  material: SDFMaterial | null;
  lighting: string | null;
  raycast: string | null;
  calcNormal: string | null;
  render: SDFRender;
  getSceneColor: string | null;
  mainImage: SDFMainImage | null;
  groups: GroupSDF[];
  showIsoline: boolean;
  constructor(config: Partial<MarcherConfig> = {}) {
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

    const {
      antialias = false,
      skybox = "vec3(10.,10.,10.)/255.",
      showIsoline = false,
    } = config;

    if (antialias) {
      this.mainImage.setAntialias(true);
    }
    if (skybox) {
      this.render.setSkyBox(skybox);
    }
    this.showIsoline = showIsoline;
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
  setRaycast(raycast: string) {
    this.raycast = raycast;
    return this;
  }
  setCalcNormal(calcNormal: string) {
    this.calcNormal = calcNormal;
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
  get fragmentShader() {
    return `
    ${this.shaderIsolineDefine}

    ${this.shaderSDFUtils}

    ${this.utilFunction}

    ${this.shaderGroupFunctionsReverse}

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
