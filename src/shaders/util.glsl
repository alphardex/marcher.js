// consts
const float PI=3.14159265359;
const float TWO_PI=6.28318530718;

// all sdfs
#pragma glslify:sdBox=require(glsl-sdf/3d/primitives/sdBox)
#pragma glslify:sdSphere=require(glsl-sdf/3d/primitives/sdSphere)
#pragma glslify:sdCylinder=require(glsl-sdf/3d/primitives/sdCylinder)
#pragma glslify:sdCapsule=require(glsl-sdf/3d/primitives/sdCapsule)
#pragma glslify:sdBezier3D=require(glsl-sdf/extra/primitives/sdBezier3D)
#pragma glslify:sdUberprim=require(glsl-sdf/extra/primitives/sdUberprim)
#pragma glslify:sdStar3D=require(glsl-sdf/extra/primitives/sdStar3D)
#pragma glslify:sdTriangle3D=require(glsl-sdf/extra/primitives/sdTriangle3D)
#pragma glslify:sdGyroid=require(glsl-sdf/extra/primitives/sdGyroid)
#pragma glslify:sdRhombus=require(glsl-sdf/3d/primitives/sdRhombus)

// sdf ops
#pragma glslify:opElongate=require(glsl-sdf/3d/alterations/opElongate)
#pragma glslify:opRound=require(glsl-sdf/3d/alterations/opRound)
#pragma glslify:opOnion=require(glsl-sdf/3d/alterations/opOnion)
#pragma glslify:opShell=require(glsl-sdf/3d/alterations/opShell)
#pragma glslify:opExtrusion=require(glsl-sdf/3d/alterations/opExtrusion)
#pragma glslify:opRevolution=require(glsl-sdf/3d/alterations/opRevolution)
#pragma glslify:length2=require(glsl-sdf/3d/alterations/length2)
#pragma glslify:length4=require(glsl-sdf/3d/alterations/length4)
#pragma glslify:length6=require(glsl-sdf/3d/alterations/length6)
#pragma glslify:length8=require(glsl-sdf/3d/alterations/length8)
#pragma glslify:opUnion=require(glsl-sdf/3d/combinations/opUnion)
#pragma glslify:opIntersection=require(glsl-sdf/3d/combinations/opIntersection)
#pragma glslify:opSubtraction=require(glsl-sdf/3d/combinations/opSubtraction)
#pragma glslify:opSmoothUnion=require(glsl-sdf/3d/combinations/opSmoothUnion)
#pragma glslify:opSmoothIntersection=require(glsl-sdf/3d/combinations/opSmoothIntersection)
#pragma glslify:opSmoothSubtraction=require(glsl-sdf/3d/combinations/opSmoothSubtraction)
#pragma glslify:opRep=require(glsl-sdf/3d/positioning/opRep)
#pragma glslify:opRepLim=require(glsl-sdf/3d/positioning/opRepLim)
#pragma glslify:opSymX=require(glsl-sdf/3d/positioning/opSymX)
#pragma glslify:opSymY=require(glsl-sdf/3d/positioning/opSymY)
#pragma glslify:opSymZ=require(glsl-sdf/3d/positioning/opSymZ)
#pragma glslify:opTx=require(glsl-sdf/3d/positioning/opTx)
#pragma glslify:opTwist=require(glsl-sdf/3d/deformations/opTwist)
#pragma glslify:opCheapBend=require(glsl-sdf/3d/deformations/opCheapBend)
#pragma glslify:opHalfX=require(glsl-sdf/extra/alterations/opHalfX)
#pragma glslify:opHalfY=require(glsl-sdf/extra/alterations/opHalfY)
#pragma glslify:opHalfZ=require(glsl-sdf/extra/alterations/opHalfZ)

// ray
#pragma glslify:normalizeScreenCoords=require(glsl-takara/vector/normalizeScreenCoords)
#pragma glslify:getRayDirection=require(glsl-takara/vector/getRayDirection)

// lighting
#pragma glslify:saturate=require(glsl-takara/light/saturate)
#pragma glslify:diffuse=require(glsl-takara/light/diffuse)
#pragma glslify:specular=require(glsl-takara/light/specular)
#pragma glslify:fresnel=require(glsl-takara/light/fresnel)

// rotate
#pragma glslify:rotate=require(glsl-takara/rotate/rotate)
#pragma glslify:rotateX=require(glsl-takara/rotate/rotateX)
#pragma glslify:rotateY=require(glsl-takara/rotate/rotateY)
#pragma glslify:rotateZ=require(glsl-takara/rotate/rotateZ)

// gamma
#pragma glslify:toGamma=require(glsl-takara/gamma/out)