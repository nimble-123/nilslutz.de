/**
 * Shared GLSL chunks for the "Strata" terrain renderers.
 * Written in GLSL ES 1.0 syntax; three.js maps it onto WebGL2 automatically.
 */

export const NOISE_GLSL = /* glsl */ `
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Quintic gradient noise, roughly in [-0.7, 0.7]
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(i), f);
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT = mat2(0.80, -0.60, 0.60, 0.80);

float fbm4(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * gnoise(p);
    p = ROT * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return s;
}

float fbm3(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * gnoise(p);
    p = ROT * p * 2.07 + 5.3;
    a *= 0.5;
  }
  return s;
}
`

/** Anti-aliased iso-line of `v` (one line per integer), `px` = stroke width in pixels. */
export const CONTOUR_GLSL = /* glsl */ `
float isoLine(float v, float px) {
  float fw = max(fwidth(v), 1e-5);
  float d = abs(fract(v - 0.5) - 0.5) / fw;
  float line = 1.0 - smoothstep(px * 0.5 - 0.5, px * 0.5 + 0.75, d);
  // fade where lines would crowd into mush (very steep slopes)
  return line * (1.0 - smoothstep(0.22, 0.55, fw));
}

float isIndexContour(float v, float every) {
  float lvl = floor(v + 0.5);
  return 1.0 - step(0.5, mod(lvl, every));
}
`
