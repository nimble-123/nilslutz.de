/**
 * Event-mesh particle shaders.
 *
 * Every particle knows four destinations (attributes) and the vertex shader blends between them:
 *   0  hero      — events flowing along topic channels, converging into the "Nils Lutz" wordmark
 *   1  core      — a stable Clean Core sphere with side-by-side extensions in orbit
 *   2  topology  — producers → broker → consumers, events travelling the edges
 *   3  starfield — calm, drifting points for the quiet part of the page
 *
 * Motion comes from an analytic curl field (curl of a sum-of-sines stream function): divergence
 * free, cheap, and stateless, so no GPGPU ping-pong is needed. The cursor/finger is a broker
 * that deflects and swirls the stream; clicks/taps publish pulses that ripple outward.
 */

export const PULSE_COUNT = 6

export const vertexShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uConverge;
uniform float uMorph;
uniform float uPixelRatio;
uniform float uSize;
uniform float uHeroShift;
uniform float uStarDrift;
uniform vec2 uWorld;
uniform vec3 uPointer;      // xy world, z = strength 0..1
uniform vec2 uPointerVel;
uniform vec4 uPulses[${PULSE_COUNT}]; // xy world, z = start time, w = strength
uniform vec3 uCoreCenter;
uniform float uCoreR;
uniform float uRingR;
uniform float uTilt;
uniform float uOrbit;

attribute vec3 aText;
attribute float aTextFlag;
attribute vec3 aCore;
attribute vec2 aCoreMeta;
attribute vec3 aEdgeA;
attribute vec3 aEdgeB;
attribute vec2 aEdgeMeta;
attribute vec3 aStar;
attribute vec4 aRand;

varying vec3 vColor;
varying float vAlpha;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;

// Curl of psi(p,t) = sum a_i sin(k_i . p + w_i t + phi_i)  ->  v = (dpsi/dy, -dpsi/dx)
vec2 curl2(vec2 p, float t) {
  vec2 v = vec2(0.0);
  vec2 k; float arg;
  k = vec2(1.30, 0.70);  arg = dot(k, p) + t * 0.90 + 1.3;  v += 0.50 * cos(arg) * vec2(k.y, -k.x);
  k = vec2(-0.80, 1.70); arg = dot(k, p) - t * 0.70 + 4.1;  v += 0.36 * cos(arg) * vec2(k.y, -k.x);
  k = vec2(2.90, -1.90); arg = dot(k, p) + t * 1.30 + 2.2;  v += 0.18 * cos(arg) * vec2(k.y, -k.x);
  k = vec2(-4.70, -3.30);arg = dot(k, p) + t * 1.70 + 0.4;  v += 0.08 * cos(arg) * vec2(k.y, -k.x);
  return v;
}

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

vec3 ringPoint(float a, float r) {
  return rotX(uTilt) * vec3(cos(a) * r, 0.0, sin(a) * r);
}

float stage(float m, float k) {
  // Per-particle staggered progress of the transition k -> k+1
  float p = clamp((m - k) * 1.5 - aRand.y * 0.5, 0.0, 1.0);
  return p * p * (3.0 - 2.0 * p);
}

void main() {
  float t = uTime;

  // ---------------------------------------------------------------- 0: hero
  float W = uWorld.x * 1.3;
  float dir = aRand.z > 0.5 ? 1.0 : -1.0;
  float speed = mix(0.18, 0.75, aRand.x) * dir;
  float fx = mod(position.x * W + t * speed, W) - W * 0.5;
  float laneY = (position.y - 0.5) * uWorld.y * 1.05;
  vec3 flow = vec3(fx, laneY + sin(fx * 0.55 + position.y * 17.0 + t * 0.35) * 0.22, position.z);
  flow.xy += curl2(flow.xy * 0.42, t * 0.22) * 0.32;

  vec3 textP = aText + vec3(curl2(aText.xy * 1.4 + 3.0, t * 0.35) * 0.012, 0.0);
  float c = clamp(uConverge * 1.7 - aRand.y * 0.7, 0.0, 1.0);
  c = c * c * (3.0 - 2.0 * c);
  c *= aTextFlag;
  vec3 p0 = mix(flow, textP, c);
  p0.xy += curl2(p0.xy * 0.8, t * 0.6) * sin(c * PI) * 0.55;
  p0.y += uHeroShift * (0.6 + aTextFlag * 0.4);
  float hot0 = step(0.955, aRand.w) * (1.0 - c * 0.6);

  // ---------------------------------------------------------------- 1: core
  float kind = aCoreMeta.x;
  vec3 p1;
  float hot1 = 0.0;
  if (kind < 0.5) {
    // Clean Core: stable sphere, slow rotation, tiny breathing
    vec3 s = rotX(0.32) * rotY(t * 0.08) * aCore;
    p1 = uCoreCenter + s * uCoreR * (1.0 + 0.012 * sin(t * 0.8 + aRand.x * TAU));
  } else if (kind < 1.5) {
    // Extension satellites (side-by-side on BTP)
    float a = aCoreMeta.y * TAU / 5.0 + t * uOrbit;
    p1 = uCoreCenter + ringPoint(a, uRingR) + aCore * uCoreR * 0.16;
    hot1 = 1.0;
  } else if (kind < 2.5) {
    // Orbit dust tracing the ring
    float a = aCoreMeta.y * TAU + t * uOrbit * 0.55;
    p1 = uCoreCenter + ringPoint(a, uRingR * (1.0 + aCore.x * 0.035)) + vec3(0.0, aCore.y * 0.02, 0.0);
  } else {
    // Released-API traffic: satellite -> core surface
    float a = aCoreMeta.y * TAU / 5.0 + t * uOrbit;
    vec3 sat = uCoreCenter + ringPoint(a, uRingR);
    vec3 surf = uCoreCenter + normalize(sat - uCoreCenter) * uCoreR * 1.03;
    float k = fract(t * (0.22 + aRand.x * 0.18) + aRand.z);
    p1 = mix(sat, surf, k) + aCore * 0.018;
    hot1 = 0.75;
  }

  // ---------------------------------------------------------------- 2: topology
  vec3 p2;
  float hot2 = 0.0;
  if (aEdgeMeta.x < 0.5) {
    float r = pow(aRand.x, 0.6) * (0.07 + aEdgeMeta.y * 0.12);
    p2 = aEdgeA + aCore * r;
    p2.xy += curl2(aEdgeA.xy * 3.0 + aCore.xy, t * 0.8) * 0.01;
    hot2 = aEdgeMeta.y * 0.9;
  } else {
    float k = fract(t * (0.1 + aRand.w * 0.16) + aRand.x);
    vec3 mid = (aEdgeA + aEdgeB) * 0.5;
    vec3 d = aEdgeB - aEdgeA;
    vec3 n = normalize(vec3(-d.y, d.x, 0.0) + 1e-5);
    vec3 ctrl = mid + n * aEdgeMeta.y * 0.12 * length(d);
    vec3 q = mix(mix(aEdgeA, ctrl, k), mix(ctrl, aEdgeB, k), k);
    p2 = q + n * (aRand.y - 0.5) * 0.035 + vec3(0.0, 0.0, (aRand.z - 0.5) * 0.05);
    hot2 = step(0.72, aRand.w);
  }

  // ---------------------------------------------------------------- 3: starfield
  vec3 p3 = aStar * vec3(uWorld.x * 0.75, uWorld.y * 0.75, 1.0);
  p3.y = mod(p3.y + uStarDrift + t * 0.02 * (0.3 + aRand.x) + uWorld.y * 0.75, uWorld.y * 1.5) - uWorld.y * 0.75;
  float hot3 = step(0.985, aRand.w);

  // ---------------------------------------------------------------- blend
  float s1 = stage(uMorph, 0.0);
  float s2 = stage(uMorph, 1.0);
  float s3 = stage(uMorph, 2.0);
  vec3 pos = mix(p0, p1, s1);
  pos = mix(pos, p2, s2);
  pos = mix(pos, p3, s3);
  float hot = mix(hot0, hot1, s1);
  hot = mix(hot, hot2, s2);
  hot = mix(hot, hot3, s3);

  // Re-routing swirl while in transit between states
  float transit = sin(s1 * PI) + sin(s2 * PI) + sin(s3 * PI);
  pos.xy += curl2(pos.xy * 0.6 + aRand.xy * 4.0, t * 0.5) * transit * 0.45;
  pos.z += transit * (aRand.z - 0.5) * 1.2;

  // ---------------------------------------------------------------- broker (pointer)
  vec2 dp = pos.xy - uPointer.xy;
  float r2 = dot(dp, dp);
  float infl = exp(-r2 / 0.18) * uPointer.z;
  vec2 dirv = dp / (sqrt(r2) + 1e-4);
  pos.xy += dirv * infl * 0.24 + vec2(-dirv.y, dirv.x) * infl * 0.2;
  pos.xy += uPointerVel * infl * 0.35;
  // A faint halo just outside the broker: the re-routed stream lights up
  float halo = exp(-pow((sqrt(r2) - 0.5) / 0.22, 2.0)) * uPointer.z;
  float glow = infl * 0.8 + halo * 0.35;

  // ---------------------------------------------------------------- publish pulses
  for (int i = 0; i < ${PULSE_COUNT}; i++) {
    vec4 pu = uPulses[i];
    float age = t - pu.z;
    if (age > 0.0 && age < 3.0 && pu.w > 0.0) {
      float d = distance(pos.xy, pu.xy);
      float ring = age * 2.4;
      float band = exp(-pow((d - ring) / 0.16, 2.0)) * exp(-age * 1.3) * pu.w;
      pos.xy += normalize(pos.xy - pu.xy + 1e-4) * band * 0.12;
      glow += band * 1.4;
    }
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float starSize = mix(1.0, 0.7 + aRand.x * 1.1, s3);
  float size = uSize * (0.6 + aRand.x * 0.8) * (1.0 + hot * 0.55 + glow * 0.9) * starSize;
  gl_PointSize = size * uPixelRatio * (10.0 / -mv.z);

  vec3 cool = mix(vec3(0.46, 0.53, 0.67), vec3(0.78, 0.83, 0.92), aRand.z);
  vec3 sodium = vec3(1.0, 0.54, 0.17);
  float h = clamp(hot + glow, 0.0, 1.0);
  vColor = mix(cool, sodium, h) + vec3(1.0, 0.8, 0.6) * glow * 0.35;

  float twinkle = mix(1.0, 0.45 + 0.55 * sin(t * (0.6 + aRand.w * 1.8) + aRand.x * TAU), s3);
  float a = mix(0.4, 0.95, h) * twinkle;
  // Text reads crisper once formed; ambient flow stays quieter
  a *= mix(mix(0.62, 1.2, c), 1.0, max(max(s1, s2), s3));
  vAlpha = a;
}
`

export const fragmentShader = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float a = core * core * vAlpha;
  gl_FragColor = vec4(vColor, a);
}
`
