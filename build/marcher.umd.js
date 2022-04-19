!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((n="undefined"!=typeof globalThis?globalThis:n||self).marcher={})}(this,(function(n){"use strict";const t="114514.",e=n=>n.filter((n=>n)),a=n=>n*Math.PI/180,s=n=>Number(n).toFixed(1),r=n=>Number(n).toFixed(2),i=n=>n.join("\n");class o{antialias;constructor(){this.antialias=!1}setAntialias(n=!0){return this.antialias=n,this}get shader(){return`\n      void mainImage(out vec4 fragColor,in vec2 fragCoord){\n        vec3 tot=vec3(0.);\n        \n        float AA_size=${this.antialias?"2.":"1."};\n        float count=0.;\n        for(float aaY=0.;aaY<AA_size;aaY++)\n        {\n            for(float aaX=0.;aaX<AA_size;aaX++)\n            {\n                tot+=getSceneColor(fragCoord+vec2(aaX,aaY)/AA_size);\n                count+=1.;\n            }\n        }\n        tot/=count;\n        \n        fragColor=vec4(tot,1.);\n    }\n      `}}class c{skybox;constructor(){this.skybox="vec3(10.,10.,10.)/255."}setSkyBox(n){return this.skybox=n,this}get shader(){return`\n      vec3 render(in vec3 ro,in vec3 rd){\n        vec3 col=${this.skybox};\n        \n        vec2 res=raycast(ro,rd);\n        float t=res.x;\n        float m=res.y;\n        \n        if(m>-.5){\n            vec3 pos=ro+t*rd;\n            \n            vec3 nor=(m<1.5)?vec3(0.,1.,0.):calcNormal(pos);\n            \n            col=material(col,pos,m,nor);\n            \n            col=lighting(col,pos,rd,nor);\n        }\n        \n        return col;\n    }\n      `}}class h{sdfVarName;materialId;isVisible;operationsBefore;operationsAfter;transforms;scaleValue;constructor(n={}){const{sdfVarName:e="dt",materialId:a=t,isVisible:s=!0,scale:r=1}=n;this.sdfVarName=e,this.materialId=a,this.isVisible=s,this.operationsBefore=[],this.operationsAfter=[],this.transforms=[],this.scaleValue=r}get pointVarName(){return`${this.sdfVarName}p`}get shader(){return""}get pointShader(){return`vec3 ${this.pointVarName}=pos;`}get addExisting(){return`res=opUnion(res,vec2(${this.sdfVarName},${this.materialId}));`}get transformsShader(){return i(this.transforms)}get operationsBeforeShader(){return i(this.operationsBefore)}get operationsAfterShader(){return i(this.operationsAfter)}get totalShader(){return i(e([this.pointShader,this.transformsShader,this.operationsBeforeShader,this.shader,this.operationsAfterShader,this.isVisible?this.addExisting:""]))}show(){return this.isVisible=!0,this}hide(){return this.isVisible=!1,this}translate(n=0,t=0,e=0){return this.transforms.push(`${this.pointVarName}+=vec3(${r(n)},${r(t)},${r(e)});`),this}translateX(n=0){return this.translate(n,0,0),this}translateY(n=0){return this.translate(0,n,0),this}translateZ(n=0){return this.translate(0,0,n),this}rotate(n=0,t="x"){return this.transforms.push(`${this.pointVarName}=rotate${t.toUpperCase()}(${this.pointVarName},${r(a(n))});`),this}rotateX(n=0){return this.rotate(n,"x"),this}rotateY(n=0){return this.rotate(n,"y"),this}rotateZ(n=0){return this.rotate(n,"z"),this}scale(n=1){return this.scaleValue=n,this}round(n=.1){return this.operationsAfter.push(`${this.sdfVarName}=opRound(${this.sdfVarName},${r(n)});`),this}union(n){return this.operationsAfter.push(`${this.sdfVarName}=opUnion(${n.sdfVarName},${this.sdfVarName});`),n.hide(),this}intersect(n){return this.operationsAfter.push(`${this.sdfVarName}=opIntersection(${n.sdfVarName},${this.sdfVarName});`),n.hide(),this}subtract(n){return this.operationsAfter.push(`${this.sdfVarName}=opSubtraction(${n.sdfVarName},${this.sdfVarName});`),n.hide(),this}smoothUnion(n,t=.1){return this.operationsAfter.push(`${this.sdfVarName}=opSmoothUnion(${n.sdfVarName},${this.sdfVarName},${r(t)});`),n.hide(),this}smoothIntersect(n,t=.1){return this.operationsAfter.push(`${this.sdfVarName}=opSmoothIntersection(${n.sdfVarName},${this.sdfVarName},${r(t)});`),n.hide(),this}smoothSubtract(n,t=.1){return this.operationsAfter.push(`${this.sdfVarName}=opSmoothSubtraction(${n.sdfVarName},${this.sdfVarName},${r(t)});`),n.hide(),this}rep(n=3,t=3,e=3){return this.operationsBefore.push(`${this.pointVarName}=opRep(${this.pointVarName},vec3(${r(n)},${r(t)},${r(e)}));`),this}repLim(n=2,t=0,e=0,a=0,s=1,i=1,o=1){return this.operationsBefore.push(`${this.pointVarName}=opRepLim(${this.pointVarName},${r(n)},vec3(${r(t)},${r(e)},${r(a)}),vec3(${r(s)},${r(i)},${r(o)}));`),this}twist(n=3){return this.operationsBefore.push(`${this.pointVarName}=opTwist(${this.pointVarName},${r(n)});`),this}cheapBend(n=1){return this.operationsBefore.push(`${this.pointVarName}=opCheapBend(${this.pointVarName},${r(n)});`),this}sym(n="x"){return this.operationsBefore.push(`${this.pointVarName}=opSym${n.toUpperCase()}(${this.pointVarName});`),this}symX(){return this.sym("x"),this}symY(){return this.sym("y"),this}symZ(){return this.sym("z"),this}elongate(n=.1,t=.1,e=.1){return this.operationsBefore.push(`${this.pointVarName}=opElongate(${this.pointVarName},vec3(${r(n)},${r(t)},${r(e)})).xyz;`),this}elongateX(n=.1){return this.elongate(n,0,0),this}elongateY(n=.1){return this.elongate(0,n,0),this}elongateZ(n=.1){return this.elongate(0,0,n),this}onion(n=.03){return this.operationsAfter.push(`${this.sdfVarName}=opOnion(${this.sdfVarName},${r(n)});`),this}half(n="x"){return this.operationsAfter.push(`${this.sdfVarName}=opHalf${n.toUpperCase()}(${this.sdfVarName},${this.pointVarName});`),this}halfX(){return this.half("x"),this}halfY(){return this.half("y"),this}halfZ(){return this.half("z"),this}}n.BezierSDF=class extends h{x1;y1;x2;y2;x3;y3;xMax;yMax;zMax;constructor(n={}){super(n);const{x1:t=0,y1:e=0,x2:a=0,y2:s=.8,x3:r=.6,y3:i=0,xMax:o=1.3,yMax:c=.9,zMax:h=.1}=n;this.x1=t,this.y1=e,this.x2=a,this.y2=s,this.x3=r,this.y3=i,this.xMax=o,this.yMax=c,this.zMax=h}get shader(){return`float ${this.sdfVarName}=sdBezier3D(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.x1)},${r(this.y1)}),vec2(${r(this.x2)},${r(this.y2)}),vec2(${r(this.x3)},${r(this.y3)}),${r(this.xMax)},${r(this.yMax)},${r(this.zMax)})*${r(this.scaleValue)};`}},n.BoxSDF=class extends h{width;height;depth;constructor(n={}){super(n);const{width:t=.5,height:e=.5,depth:a=.5}=n;this.width=t,this.height=e,this.depth=a}get shader(){return`float ${this.sdfVarName}=sdBox(${this.pointVarName}/${r(this.scaleValue)},vec3(${r(this.width)},${r(this.height)},${r(this.depth)}))*${r(this.scaleValue)};`}},n.CylinderSDF=class extends h{radius;height;constructor(n={}){super(n);const{radius:t=.5,height:e=.5}=n;this.radius=t,this.height=e}get shader(){return`float ${this.sdfVarName}=sdCylinder(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.radius)},${r(this.height)}))*${r(this.scaleValue)};`}},n.DEFAULT_MATERIAL_ID=t,n.GroupSDF=class extends h{mapFuncName;primitives;constructor(n={}){super(n);const{mapFuncName:t="g1"}=n;this.mapFuncName=t,this.primitives=[]}addPrimitive(n){this.primitives.push(n)}get primitivesShader(){return i(this.primitives.map((n=>n.totalShader)))}get mapFuncShader(){return`\n    vec2 ${this.mapFuncName}(in vec3 pos)\n    {\n        vec2 res=vec2(1e10,0.);\n        \n        {\n            ${this.primitivesShader}\n        }\n        \n        return res;\n    }\n    `}get shader(){return`vec2 ${this.sdfVarName}=${this.mapFuncName}(${this.pointVarName}/${r(this.scaleValue)})*${r(this.scaleValue)};`}get addExisting(){return`res=opUnion(res,${this.sdfVarName});`}},n.JointSDF=class extends h{x1;y1;z1;x2;y2;z2;r;constructor(n={}){super(n);const{x1:t=0,y1:e=-.5,z1:a=0,x2:s=0,y2:r=.5,z2:i=0,r:o=.25}=n;this.x1=t,this.y1=e,this.z1=a,this.x2=s,this.y2=r,this.z2=i,this.r=o}get shader(){return`float ${this.sdfVarName}=sdCapsule(${this.pointVarName}/${r(this.scaleValue)},vec3(${r(this.x1)},${r(this.y1)},${r(this.z1)}),vec3(${r(this.x2)},${r(this.y2)},${r(this.z2)}),${r(this.r)})*${r(this.scaleValue)};`}},n.Marcher=class{utilFunction;mapFunction;material;lighting;render;getSceneColor;mainImage;groups;constructor(n={}){this.utilFunction="",this.mapFunction=null,this.material=null,this.lighting=null,this.render=new c,this.getSceneColor=null,this.mainImage=new o,this.groups=[];const{antialias:t=!1,skybox:e="vec3(10.,10.,10.)/255."}=n;t&&this.mainImage.setAntialias(!0),e&&this.render.setSkyBox(e)}setUtilFunction(n){return this.utilFunction=n,this}setMapFunction(n){return this.mapFunction=n,this}setMaterial(n){return this.material=n,this}setLighting(n){return this.lighting=n,this}setGetSceneColor(n){return this.getSceneColor=n,this}addGroup(n){return this.groups.push(n),this}get shaderSDFUtils(){return"\n// all sdfs\nfloat sdBox(vec3 p,vec3 b)\n{\n    vec3 q=abs(p)-b;\n    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);\n}\n\nfloat sdSphere(vec3 p,float s)\n{\n    return length(p)-s;\n}\n\n// infinite\nfloat sdCylinder(vec3 p,vec3 c)\n{\n    return length(p.xz-c.xy)-c.z;\n}\n\n// vertical\nfloat sdCylinder(vec3 p,vec2 h)\n{\n    vec2 d=abs(vec2(length(p.xz),p.y))-h;\n    return min(max(d.x,d.y),0.)+length(max(d,0.));\n}\n\n// arbitrary orientation\nfloat sdCylinder(vec3 p,vec3 a,vec3 b,float r)\n{\n    vec3 pa=p-a;\n    vec3 ba=b-a;\n    float baba=dot(ba,ba);\n    float paba=dot(pa,ba);\n    \n    float x=length(pa*baba-ba*paba)-r*baba;\n    float y=abs(paba-baba*.5)-baba*.5;\n    float x2=x*x;\n    float y2=y*y*baba;\n    float d=(max(x,y)<0.)?-min(x2,y2):(((x>0.)?x2:0.)+((y>0.)?y2:0.));\n    return sign(d)*sqrt(abs(d))/baba;\n}\n\nfloat sdHexPrism(vec3 p,vec2 h)\n{\n    const vec3 k=vec3(-.8660254,.5,.57735);\n    p=abs(p);\n    p.xy-=2.*min(dot(k.xy,p.xy),0.)*k.xy;\n    vec2 d=vec2(\n        length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x),h.x))*sign(p.y-h.x),\n    p.z-h.y);\n    return min(max(d.x,d.y),0.)+length(max(d,0.));\n}\n\nfloat sdOctogonPrism(in vec3 p,in float r,float h)\n{\n    const vec3 k=vec3(-.9238795325,// sqrt(2+sqrt(2))/2\n    .3826834323,// sqrt(2-sqrt(2))/2\n.4142135623);// sqrt(2)-1\n// reflections\np=abs(p);\np.xy-=2.*min(dot(vec2(k.x,k.y),p.xy),0.)*vec2(k.x,k.y);\np.xy-=2.*min(dot(vec2(-k.x,k.y),p.xy),0.)*vec2(-k.x,k.y);\n// polygon side\np.xy-=vec2(clamp(p.x,-k.z*r,k.z*r),r);\nvec2 d=vec2(length(p.xy)*sign(p.y),p.z-h);\nreturn min(max(d.x,d.y),0.)+length(max(d,0.));\n}\n\nfloat sdTriPrism(vec3 p,vec2 h)\n{\n    vec3 q=abs(p);\n    return max(q.z-h.y,max(q.x*.866025+p.y*.5,-p.y)-h.x*.5);\n}\n\nfloat sdCapsule(vec3 p,vec3 a,vec3 b,float r)\n{\n    vec3 pa=p-a,ba=b-a;\n    float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);\n    return length(pa-ba*h)-r;\n}\n\nfloat dot2(in vec2 v){return dot(v,v);}\nfloat dot2(in vec3 v){return dot(v,v);}\n\nfloat sdBezier(in vec2 pos,in vec2 A,in vec2 B,in vec2 C)\n{\n    vec2 a=B-A;\n    vec2 b=A-2.*B+C;\n    vec2 c=a*2.;\n    vec2 d=A-pos;\n    float kk=1./dot(b,b);\n    float kx=kk*dot(a,b);\n    float ky=kk*(2.*dot(a,a)+dot(d,b))/3.;\n    float kz=kk*dot(d,a);\n    float res=0.;\n    float p=ky-kx*kx;\n    float p3=p*p*p;\n    float q=kx*(2.*kx*kx-3.*ky)+kz;\n    float h=q*q+4.*p3;\n    if(h>=0.)\n    {\n        h=sqrt(h);\n        vec2 x=(vec2(h,-h)-q)/2.;\n        vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));\n        float t=clamp(uv.x+uv.y-kx,0.,1.);\n        res=dot2(d+(c+b*t)*t);\n    }\n    else\n    {\n        float z=sqrt(-p);\n        float v=acos(q/(p*z*2.))/3.;\n        float m=cos(v);\n        float n=sin(v)*1.732050808;\n        vec3 t=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);\n        res=min(dot2(d+(c+b*t.x)*t.x),\n        dot2(d+(c+b*t.y)*t.y));\n        // the third root cannot be the closest\n        // res = min(res,dot2(d+(c+b*t.z)*t.z));\n    }\n    return sqrt(res);\n}\n\nfloat opExtrusion_0(in vec3 p,in float sdf,in float h)\n{\n    vec2 w=vec2(sdf,abs(p.z)-h);\n    return min(max(w.x,w.y),0.)+length(max(w,0.));\n}\n\nfloat sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float h)\n{\n    return opExtrusion_0(pos,sdBezier(pos.xy,A,B,C),h);\n}\n\nconst float PI=3.14159265359;\n\nfloat sdBezier3D(in vec3 pos,in vec2 A,in vec2 B,in vec2 C,in float xMax,in float yMax,in float zMax)\n{\n    vec2 xyMax=vec2(xMax,yMax);\n    vec2 v0=xyMax*cos(A*PI);\n    vec2 v1=xyMax*cos(B*PI);\n    vec2 v2=xyMax*cos(C*PI);\n    return sdBezier3D(pos,v0,v1,v2,zMax);\n}\n\n// Credit: https://www.shadertoy.com/view/MsVGWG\nfloat sdUnterprim(vec3 p,vec4 s,vec3 r,vec2 ba,float sz2){\n    vec3 d=abs(p)-s.xyz;\n    float q=length(max(d.xy,0.))+min(0.,max(d.x,d.y))-r.x;\n    // hole support\n    q=abs(q)-s.w;\n    \n    vec2 pa=vec2(q,p.z-s.z);\n    vec2 diag=pa-vec2(r.z,sz2)*clamp(dot(pa,ba),0.,1.);\n    vec2 h0=vec2(max(q-r.z,0.),p.z+s.z);\n    vec2 h1=vec2(max(q,0.),p.z-s.z);\n    \n    return sqrt(min(dot(diag,diag),min(dot(h0,h0),dot(h1,h1))))\n    *sign(max(dot(pa,vec2(-ba.y,ba.x)),d.z))-r.y;\n}\n\nfloat sdUberprim(vec3 p,vec4 s,vec3 r){\n    // these operations can be precomputed\n    s.xy-=r.x;\n    r.x-=s.w;\n    s.w-=r.y;\n    s.z-=r.y;\n    vec2 ba=vec2(r.z,-2.*s.z);\n    return sdUnterprim(p,s,r,ba/dot(ba,ba),ba.y);\n}\n\n// sdf ops\nvec4 opElongate(in vec3 p,in vec3 h)\n{\n    vec3 q=abs(p)-h;\n    return vec4(max(q,0.),min(max(q.x,max(q.y,q.z)),0.));\n}\n\nfloat opRound(in float d,in float h)\n{\n    return d-h;\n}\n\nfloat opOnion(in float d,in float h)\n{\n    return abs(d)-h;\n}\n\nfloat opExtrusion_1(in vec3 p,in float sdf,in float h)\n{\n    vec2 w=vec2(sdf,abs(p.z)-h);\n    return min(max(w.x,w.y),0.)+length(max(w,0.));\n}\n\nvec2 opRevolution(in vec3 p,float w)\n{\n    return vec2(length(p.xz)-w,p.y);\n}\n\nfloat length2(vec2 p)\n{\n    return sqrt(p.x*p.x+p.y*p.y);\n}\n\nfloat length4(vec2 p)\n{\n    p=p*p;p=p*p;\n    return pow(p.x+p.y,1./4.);\n}\n\nfloat length6(vec2 p)\n{\n    p=p*p*p;p=p*p;\n    return pow(p.x+p.y,1./6.);\n}\n\nfloat length8(vec2 p)\n{\n    p=p*p;p=p*p;p=p*p;\n    return pow(p.x+p.y,1./8.);\n}\n\nfloat length8(vec3 p)\n{\n    p=p*p;p=p*p;p=p*p;\n    return pow(p.x+p.y+p.z,1./8.);\n}\n\nfloat opUnion(float d1,float d2)\n{\n    return min(d1,d2);\n}\n\nvec2 opUnion(vec2 d1,vec2 d2)\n{\n    return(d1.x<d2.x)?d1:d2;\n}\n\nfloat opIntersection(float d1,float d2)\n{\n    return max(d1,d2);\n}\n\nfloat opSubtraction(float d1,float d2)\n{\n    return max(-d1,d2);\n}\n\nfloat opSmoothUnion(float d1,float d2,float k)\n{\n    float h=max(k-abs(d1-d2),0.);\n    return min(d1,d2)-h*h*.25/k;\n}\n\nfloat opSmoothIntersection(float d1,float d2,float k)\n{\n    float h=max(k-abs(d1-d2),0.);\n    return max(d1,d2)+h*h*.25/k;\n}\n\nfloat opSmoothSubtraction(float d1,float d2,float k)\n{\n    float h=max(k-abs(-d1-d2),0.);\n    return max(-d1,d2)+h*h*.25/k;\n}\n\nfloat opRep(in float p,in float c)\n{\n    return mod(p,c)-.5*c;\n}\n\nvec2 opRep(in vec2 p,in vec2 c)\n{\n    return mod(p,c)-.5*c;\n}\n\nvec3 opRep(in vec3 p,in vec3 c)\n{\n    return mod(p,c)-.5*c;\n}\n\nfloat opRepLim(in float p,in float s,in float lima,in float limb)\n{\n    return p-s*clamp(round(p/s),lima,limb);\n}\n\nvec2 opRepLim(in vec2 p,in float s,in vec2 lima,in vec2 limb)\n{\n    return p-s*clamp(round(p/s),lima,limb);\n}\n\nvec3 opRepLim(in vec3 p,in float s,in vec3 lima,in vec3 limb)\n{\n    return p-s*clamp(round(p/s),lima,limb);\n}\n\nvec2 opSymX(in vec2 p)\n{\n    p.x=abs(p.x);\n    return p;\n}\n\nvec3 opSymX(in vec3 p)\n{\n    p.x=abs(p.x);\n    return p;\n}\n\nvec2 opSymY(in vec2 p)\n{\n    p.y=abs(p.y);\n    return p;\n}\n\nvec3 opSymY(in vec3 p)\n{\n    p.y=abs(p.y);\n    return p;\n}\n\nvec3 opSymZ(in vec3 p)\n{\n    p.z=abs(p.z);\n    return p;\n}\n\nvec3 opTx(vec3 p,mat4 m)\n{\n    return vec3(inverse(m)*vec4(p,1.));\n}\n\nvec3 opTwist(vec3 p,float k)\n{\n    float c=cos(k*p.y);\n    float s=sin(k*p.y);\n    mat2 m=mat2(c,-s,s,c);\n    vec3 q=vec3(m*p.xz,p.y);\n    return q;\n}\n\nvec3 opCheapBend(vec3 p,float k)\n{\n    float c=cos(k*p.y);\n    float s=sin(k*p.y);\n    mat2 m=mat2(c,-s,s,c);\n    vec3 q=vec3(m*p.xy,p.z);\n    return q;\n}\n\nfloat opHalfX(float sdf,vec3 pos){\n    return max(sdf,pos.x);\n}\n\nfloat opHalfY(float sdf,vec3 pos){\n    return max(sdf,pos.y);\n}\n\nfloat opHalfZ(float sdf,vec3 pos){\n    return max(sdf,pos.z);\n}\n\n// ray\nvec2 normalizeScreenCoords(vec2 screenCoord,vec2 resolution)\n{\n    vec2 result=2.*(screenCoord/resolution.xy-.5);\n    result.x*=resolution.x/resolution.y;// Correct for aspect ratio\n    return result;\n}\n\nmat3 setCamera(in vec3 ro,in vec3 ta,float cr)\n{\n    vec3 cw=normalize(ta-ro);\n    vec3 cp=vec3(sin(cr),cos(cr),0.);\n    vec3 cu=normalize(cross(cw,cp));\n    vec3 cv=(cross(cu,cw));\n    return mat3(cu,cv,cw);\n}\n\nvec3 getRayDirection(vec2 p,vec3 ro,vec3 ta,float fl){\n    mat3 ca=setCamera(ro,ta,0.);\n    vec3 rd=ca*normalize(vec3(p,fl));\n    return rd;\n}\n\n// lighting\n// https://learnopengl.com/Lighting/Basic-Lighting\n\nfloat saturate_2(float a){\n    return clamp(a,0.,1.);\n}\n\n// https://learnopengl.com/Lighting/Basic-Lighting\n\nfloat saturate_1(float a){\n    return clamp(a,0.,1.);\n}\n\nfloat diffuse(vec3 n,vec3 l){\n    float diff=saturate_1(dot(n,l));\n    return diff;\n}\n\n// https://learnopengl.com/Lighting/Basic-Lighting\n\nfloat saturate_0(float a){\n    return clamp(a,0.,1.);\n}\n\nfloat specular(vec3 n,vec3 l,float shininess){\n    float spec=pow(saturate_0(dot(n,l)),shininess);\n    return spec;\n}\n\n// https://www.shadertoy.com/view/4scSW4\nfloat fresnel(float bias,float scale,float power,vec3 I,vec3 N)\n{\n    return bias+scale*pow(1.+dot(I,N),power);\n}\n\n// rotate\nmat2 rotation2d(float angle){\n    float s=sin(angle);\n    float c=cos(angle);\n    \n    return mat2(\n        c,-s,\n        s,c\n    );\n}\n\nmat4 rotation3d(vec3 axis,float angle){\n    axis=normalize(axis);\n    float s=sin(angle);\n    float c=cos(angle);\n    float oc=1.-c;\n    \n    return mat4(\n        oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,\n        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,\n        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,\n        0.,0.,0.,1.\n    );\n}\n\nvec2 rotate(vec2 v,float angle){\n    return rotation2d(angle)*v;\n}\n\nvec3 rotate(vec3 v,vec3 axis,float angle){\n    return(rotation3d(axis,angle)*vec4(v,1.)).xyz;\n}\n\nmat3 rotation3dX(float angle){\n    float s=sin(angle);\n    float c=cos(angle);\n    \n    return mat3(\n        1.,0.,0.,\n        0.,c,s,\n        0.,-s,c\n    );\n}\n\nvec3 rotateX(vec3 v,float angle){\n    return rotation3dX(angle)*v;\n}\n\nmat3 rotation3dY(float angle){\n    float s=sin(angle);\n    float c=cos(angle);\n    \n    return mat3(\n        c,0.,-s,\n        0.,1.,0.,\n        s,0.,c\n    );\n}\n\nvec3 rotateY(vec3 v,float angle){\n    return rotation3dY(angle)*v;\n}\n\nmat3 rotation3dZ(float angle){\n    float s=sin(angle);\n    float c=cos(angle);\n    \n    return mat3(\n        c,s,0.,\n        -s,c,0.,\n        0.,0.,1.\n    );\n}\n\nvec3 rotateZ(vec3 v,float angle){\n    return rotation3dZ(angle)*v;\n}\n\n// gamma\nconst float gamma=2.2;\n\nfloat toGamma(float v){\n    return pow(v,1./gamma);\n}\n\nvec2 toGamma(vec2 v){\n    return pow(v,vec2(1./gamma));\n}\n\nvec3 toGamma(vec3 v){\n    return pow(v,vec3(1./gamma));\n}\n\nvec4 toGamma(vec4 v){\n    return vec4(toGamma(v.rgb),v.a);\n}\n"}get shaderMapFunction(){return this.mapFunction?.shader||"\nvec2 map(in vec3 pos)\n{\n    vec2 res=vec2(1e10,0.);\n    \n    return res;\n}\n"}get shaderRaycast(){return"\nvec2 raycast(in vec3 ro,in vec3 rd){\n    vec2 res=vec2(-1.,-1.);\n    float t=0.;\n    for(int i=0;i<64;i++)\n    {\n        vec3 p=ro+t*rd;\n        vec2 h=map(p);\n        if(abs(h.x)<(.001*t))\n        {\n            res=vec2(t,h.y);\n            break;\n        };\n        t+=h.x;\n    }\n    return res;\n}\n"}get shaderNormal(){return"\nvec3 calcNormal(vec3 pos,float eps){\n    const vec3 v1=vec3(1.,-1.,-1.);\n    const vec3 v2=vec3(-1.,-1.,1.);\n    const vec3 v3=vec3(-1.,1.,-1.);\n    const vec3 v4=vec3(1.,1.,1.);\n    \n    return normalize(v1*map(pos+v1*eps).x+\n    v2*map(pos+v2*eps).x+\n    v3*map(pos+v3*eps).x+\n    v4*map(pos+v4*eps).x);\n}\n\nvec3 calcNormal(vec3 pos){\n    return calcNormal(pos,.002);\n}\n\nfloat softshadow(in vec3 ro,in vec3 rd,in float mint,in float tmax)\n{\n    float res=1.;\n    float t=mint;\n    for(int i=0;i<16;i++)\n    {\n        float h=map(ro+rd*t).x;\n        res=min(res,8.*h/t);\n        t+=clamp(h,.02,.10);\n        if(h<.001||t>tmax)break;\n    }\n    return clamp(res,0.,1.);\n}\n\nfloat ao(in vec3 pos,in vec3 nor)\n{\n    float occ=0.;\n    float sca=1.;\n    for(int i=0;i<5;i++)\n    {\n        float hr=.01+.12*float(i)/4.;\n        vec3 aopos=nor*hr+pos;\n        float dd=map(aopos).x;\n        occ+=-(dd-hr)*sca;\n        sca*=.95;\n    }\n    return clamp(1.-3.*occ,0.,1.);\n}\n"}get shaderMaterial(){return this.material?.shader||"\nvec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){\n    // common material\n    col=vec3(153.,204.,255.)/255.;\n    \n    return col;\n}\n"}get shaderLighting(){return this.lighting||"\nvec3 lighting(in vec3 col,in vec3 pos,in vec3 rd,in vec3 nor){\n    vec3 lin=col;\n    \n    // sun\n    {\n        vec3 lig=normalize(vec3(1.,1.,1.));\n        float dif=diffuse(nor,lig);\n        float spe=specular(nor,lig,3.);\n        lin+=col*dif*spe;\n    }\n    \n    // sky\n    {\n        lin*=col*.7;\n    }\n    \n    return lin;\n}\n"}get shaderRender(){return this.render?.shader||"\nvec3 render(in vec3 ro,in vec3 rd){\n    // skybox\n    vec3 col=vec3(10.,10.,10.)/255.;\n    \n    // raymarching\n    vec2 res=raycast(ro,rd);\n    float t=res.x;\n    float m=res.y;\n    \n    if(m>-.5){\n        // position\n        vec3 pos=ro+t*rd;\n        // normal\n        vec3 nor=(m<1.5)?vec3(0.,1.,0.):calcNormal(pos);\n        \n        // material\n        col=material(col,pos,m,nor);\n        \n        // lighting\n        col=lighting(col,pos,rd,nor);\n    }\n    \n    return col;\n}\n"}get shaderGetSceneColor(){return this.getSceneColor||"\nvec3 getSceneColor(vec2 fragCoord){\n    vec2 p=normalizeScreenCoords(fragCoord,iResolution.xy);\n    \n    vec3 ro=vec3(0.,4.,8.);\n    vec3 ta=vec3(0.,0.,0.);\n    const float fl=2.5;\n    vec3 rd=getRayDirection(p,ro,ta,fl);\n    \n    // render\n    vec3 col=render(ro,rd);\n    \n    // gamma\n    col=toGamma(col);\n    \n    return col;\n}\n"}get shaderMainImage(){return this.mainImage?.shader||"\nvoid mainImage(out vec4 fragColor,in vec2 fragCoord){\n    vec3 tot=vec3(0.);\n    \n    float AA_size=1.;\n    float count=0.;\n    for(float aaY=0.;aaY<AA_size;aaY++)\n    {\n        for(float aaX=0.;aaX<AA_size;aaX++)\n        {\n            tot+=getSceneColor(fragCoord+vec2(aaX,aaY)/AA_size);\n            count+=1.;\n        }\n    }\n    tot/=count;\n    \n    fragColor=vec4(tot,1.);\n}\n"}get shaderGroupFunctions(){return i(this.groups.map((n=>n.mapFuncShader)))}get fragmentShader(){return`\n    ${this.shaderSDFUtils}\n\n    ${this.utilFunction}\n\n    ${this.shaderGroupFunctions}\n\n    ${this.shaderMapFunction}\n\n    ${this.shaderRaycast}\n\n    ${this.shaderNormal}\n\n    ${this.shaderMaterial}\n\n    ${this.shaderLighting}\n\n    ${this.shaderRender}\n\n    ${this.shaderGetSceneColor}\n\n    ${this.shaderMainImage}\n      `}},n.PolygonSDF=class extends h{edgeCount;value1;value2;value3;constructor(n={}){super(n);const{edgeCount:t=6,value1:e=.5,value2:a=.5,value3:s=.5}=n;this.edgeCount=t,this.value1=e,this.value2=a,this.value3=s}get sdFunctionName(){return{3:"sdTriPrism",4:"sdBox",6:"sdHexPrism",8:"sdOctogonPrism"}[this.edgeCount]||""}get shader(){return{3:`float ${this.sdfVarName}=sdTriPrism(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.value1)},${r(this.value2)}))*${r(this.scaleValue)};`,4:`float ${this.sdfVarName}=sdBox(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.value1)},${r(this.value2)},${r(this.value3)}))*${r(this.scaleValue)};`,6:`float ${this.sdfVarName}=sdHexPrism(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.value1)},${r(this.value2)}))*${r(this.scaleValue)};`,8:`float ${this.sdfVarName}=sdOctogonPrism(${this.pointVarName}/${r(this.scaleValue)},${r(this.value1)},${r(this.value2)})*${r(this.scaleValue)};`}[this.edgeCount]||""}},n.PrimitiveSDF=h,n.SDFLayer=class{primitives;customCodesBefore;customCodesAfter;constructor(){this.primitives=[],this.customCodesBefore=[],this.customCodesAfter=[]}addPrimitive(n){return this.primitives.push(n),this}prependCustomCode(n){return this.customCodesBefore.push(n),this}appendCustomCode(n){return this.customCodesAfter.push(n),this}get primitivesShader(){return i(this.primitives.map((n=>n.totalShader)))}get customCodesBeforeShader(){return i(this.customCodesBefore)}get customCodesAfterShader(){return i(this.customCodesAfter)}get shader(){return`\n      {\n        ${this.customCodesBeforeShader}\n        ${this.primitivesShader}\n        ${this.customCodesAfterShader}\n      }\n      `}},n.SDFMainImage=o,n.SDFMapFunction=class{layers;constructor(){this.layers=[]}addLayer(n){return this.layers.push(n),this}get shader(){return`\n      vec2 map(in vec3 pos)\n      {\n          vec2 res=vec2(1e10,0.);\n          \n          ${i(this.layers.map((n=>n.shader)))}\n          \n          return res;\n      }\n      `}},n.SDFMaterial=class{materials;constructor(){this.materials=[]}addMaterial(n=t,e=""){return this.materials.push(`\n    if(m==${n}){\n        ${e}\n    }\n      `),this}addColorMaterial(n=t,e=255,a=255,r=255){const i=`col=vec3(${s(e)},${s(a)},${s(r)})/255.;`;return this.addMaterial(n,i),this}get shader(){return`\n      vec3 material(in vec3 col,in vec3 pos,in float m,in vec3 nor){\n        col=vec3(153.,204.,255.)/255.;\n        \n        ${i(this.materials)}\n        \n        return col;\n    }\n      `}},n.SDFRender=c,n.SphereSDF=class extends h{radius;constructor(n={}){super(n);const{radius:t=.5}=n;this.radius=t}get shader(){return`float ${this.sdfVarName}=sdSphere(${this.pointVarName}/${r(this.scaleValue)},${r(this.radius)})*${r(this.scaleValue)};`}},n.TriangleSDF=class extends h{value1;value2;constructor(n={}){super(n);const{value1:t=.5,value2:e=.5}=n;this.value1=t,this.value2=e}get shader(){return`float ${this.sdfVarName}=sdTriPrism(${this.pointVarName}/${r(this.scaleValue)},vec2(${r(this.value1)},${r(this.value2)}))*${r(this.scaleValue)};`}},n.UberprimSDF=class extends h{width;height;depth;thickness;xCornerRadius;yCornerRadius;zCornerRadius;constructor(n={}){super(n);const{width:t=.5,height:e=.5,depth:a=.5,thickness:s=.25,xCornerRadius:r=0,yCornerRadius:i=0,zCornerRadius:o=0}=n;this.width=t,this.height=e,this.depth=a,this.thickness=s,this.xCornerRadius=r,this.yCornerRadius=i,this.zCornerRadius=o}get shader(){return`float ${this.sdfVarName}=sdUberprim(${this.pointVarName}/${r(this.scaleValue)},vec4(${r(this.width)},${r(this.height)},${r(this.depth)},${r(this.thickness)}),vec3(${r(this.xCornerRadius)},${r(this.yCornerRadius)},${r(this.zCornerRadius)}))*${r(this.scaleValue)};`}},n.compact=e,n.deg2rad=a,n.joinLine=i,n.rad2Deg=n=>180*n/Math.PI,n.toFixed1=s,n.toFixed2=r,Object.defineProperty(n,"__esModule",{value:!0})}));
