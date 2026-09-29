/**
 * GLSL for the Tide hero.
 *
 * Pipeline per frame:
 *   drop  -> update (x2) -> normals        (ping-pong height field, half-float)
 *   composite: baked clay (+ carved wordmark) refracted through the water,
 *              Fresnel + overcast-sky specular, foam at the waterline
 *   crystals: instanced salt cubes that grow where the clay has dried
 */

export const fullscreenVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const noise = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = r * p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v;
  }
`

/** Shared waterline — must match between composite and crystals. */
export const waterline = /* glsl */ `
  float tideLevel(float tide) {
    return mix(1.12, -0.45, tide);
  }
  float waterEdge(float x, float tide, float time) {
    float l = tideLevel(tide);
    l += 0.028 * (vnoise(vec2(x * 2.6 + 3.1, time * 0.07)) - 0.5);
    l += 0.012 * (vnoise(vec2(x * 9.0 - time * 0.21, 1.7)) - 0.5);
    l += 0.006 * sin(x * 17.0 + time * 1.05) + 0.004 * sin(time * 0.83);
    return l;
  }
  float dryness(float y, float edge) {
    return clamp((y - edge) * 2.2, 0.0, 1.0);
  }
`

export const dropFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uAspect;
  uniform vec4 uSeg[8];     // a.xy -> b.xy in uv space
  uniform vec2 uParam[8];   // radius, strength
  uniform int uCount;
  varying vec2 vUv;
  const float PI = 3.14159265;

  float segDist(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec4 info = texture2D(uTex, vUv);
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    for (int i = 0; i < 8; i++) {
      if (i >= uCount) break;
      vec4 s = uSeg[i];
      float d = segDist(p, vec2(s.x * uAspect, s.y), vec2(s.z * uAspect, s.w));
      float drop = max(0.0, 1.0 - d / uParam[i].x);
      drop = 0.5 - cos(drop * PI) * 0.5;
      info.r += drop * uParam[i].y;
    }
    gl_FragColor = info;
  }
`

export const updateFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform float uDamping;
  varying vec2 vUv;
  void main() {
    vec4 info = texture2D(uTex, vUv);
    vec2 dx = vec2(uTexel.x, 0.0);
    vec2 dy = vec2(0.0, uTexel.y);
    float average = (
      texture2D(uTex, vUv - dx).r +
      texture2D(uTex, vUv - dy).r +
      texture2D(uTex, vUv + dx).r +
      texture2D(uTex, vUv + dy).r
    ) * 0.25;
    info.g += (average - info.r) * 2.0;
    info.g *= uDamping;
    info.r += info.g;
    info.r *= 0.9995;
    gl_FragColor = info;
  }
`

export const normalFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    vec4 info = texture2D(uTex, vUv);
    vec3 dx = vec3(uTexel.x, texture2D(uTex, vec2(vUv.x + uTexel.x, vUv.y)).r - info.r, 0.0);
    vec3 dy = vec3(0.0, texture2D(uTex, vec2(vUv.x, vUv.y + uTexel.y)).r - info.r, uTexel.y);
    info.ba = normalize(cross(dy, dx)).xz;
    gl_FragColor = info;
  }
`

/**
 * Bake: procedural tidal-flat clay (ripple marks, grain) with the wordmark
 * carved into it. r = height, gb = normal.xy, a = sharp letter mask.
 */
export const bakeFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uWordSoft;
  uniform sampler2D uWordSharp;
  uniform float uAspect;
  uniform vec2 uTexel;
  varying vec2 vUv;
  ${noise}

  float ripples(vec2 p) {
    vec2 q = p + 0.12 * vec2(fbm(p * 1.7), fbm(p * 1.7 + 7.3));
    float ph = q.y * 46.0 + q.x * 7.0 + fbm(p * 0.9) * 6.0;
    float r = 1.0 - abs(sin(ph * 0.5));
    r = r * r;
    float amp = smoothstep(0.25, 0.75, fbm(p * 1.2 + 3.1));
    return r * (0.35 + 0.65 * amp);
  }

  float heightAt(vec2 uv) {
    vec2 p = vec2(uv.x * uAspect, uv.y);
    float groove = texture2D(uWordSoft, uv).r;
    float h = 0.55;
    h += ripples(p) * 0.26 * (1.0 - groove);
    h += (fbm(p * 13.0) - 0.5) * 0.16;
    h += (vnoise(p * 70.0) - 0.5) * 0.05;
    h -= smoothstep(0.05, 0.95, groove) * 0.5;
    return h;
  }

  void main() {
    float h = heightAt(vUv);
    float hx = heightAt(vUv + vec2(uTexel.x, 0.0));
    float hy = heightAt(vUv + vec2(0.0, uTexel.y));
    vec2 slope = vec2(hx - h, hy - h) / uTexel.y * 0.0085;
    vec3 n = normalize(vec3(-slope, 1.0));
    float sharp = texture2D(uWordSharp, vUv).r;
    gl_FragColor = vec4(clamp(h, 0.0, 1.0), n.xy * 0.5 + 0.5, sharp);
  }
`

export const compositeFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uSim;
  uniform sampler2D uClay;
  uniform vec2 uSimTexel;
  uniform vec2 uRes;
  uniform float uAspect;
  uniform float uTime;
  uniform float uTide;
  uniform float uDark;
  uniform float uIntro;
  uniform vec3 uPaper;
  varying vec2 vUv;
  ${noise}
  ${waterline}

  vec3 pal(vec3 day, vec3 night) { return mix(day, night, uDark); }

  vec3 sky(vec3 r) {
    vec3 zenith = pal(vec3(0.80, 0.83, 0.84), vec3(0.05, 0.07, 0.085));
    vec3 horizon = pal(vec3(0.94, 0.945, 0.935), vec3(0.16, 0.19, 0.21));
    vec3 c = mix(horizon, zenith, clamp(r.y * 1.4, 0.0, 1.0));
    vec3 sunDir = normalize(vec3(-0.35, 0.55, 0.76));
    float s = max(dot(r, sunDir), 0.0);
    vec3 glow = pal(vec3(1.0, 0.985, 0.95), vec3(0.78, 0.84, 0.9));
    c += glow * (pow(s, 24.0) * 0.18 + pow(s, 900.0) * 1.4);
    return c;
  }

  vec3 shadeClay(vec2 uv, float wet, float dry) {
    vec4 c = texture2D(uClay, uv);
    float h = c.r;
    vec3 n = normalize(vec3(c.gb * 2.0 - 1.0, 0.0));
    n.z = sqrt(max(1.0 - dot(n.xy, n.xy), 0.0));
    float letter = c.a;

    vec3 dryCol = pal(vec3(0.745, 0.705, 0.655), vec3(0.29, 0.265, 0.24));
    vec3 saltCol = pal(vec3(0.86, 0.85, 0.825), vec3(0.34, 0.33, 0.315));
    vec3 wetCol = pal(vec3(0.43, 0.385, 0.335), vec3(0.14, 0.125, 0.115));

    // letters are carved: they stay wetter and darker
    float w = clamp(max(wet, letter * 0.85 * (1.0 - dry * 0.55)), 0.0, 1.0);
    vec3 albedo = mix(dryCol, wetCol, w);
    albedo = mix(albedo, saltCol, dry * (1.0 - letter) * smoothstep(0.35, 0.8, h) * 0.55);
    albedo *= 0.92 + 0.16 * fbm(uv * vec2(uAspect, 1.0) * 5.0);

    vec3 L = normalize(vec3(-0.45, 0.62, 0.64));
    float diff = 0.62 + 0.5 * dot(n, L);
    float ao = mix(0.62, 1.0, smoothstep(0.0, 0.6, h));
    vec3 col = albedo * diff * ao;

    // wet sheen: sky reflected in the film of water left on the clay
    vec3 V = normalize(vec3(0.0, -0.3, 1.0));
    vec3 R = reflect(-V, n);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    col = mix(col, sky(R), w * (0.14 + fres * 0.5));
    float spec = pow(max(dot(R, normalize(vec3(-0.35, 0.55, 0.76))), 0.0), 60.0);
    col += spec * w * pal(vec3(0.5), vec3(0.35));
    return col;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    // ---- water surface
    vec4 sim = texture2D(uSim, uv);
    // gentle swell so the water breathes even when untouched
    vec2 p = vec2(uv.x * uAspect, uv.y);
    vec2 swell = vec2(
      cos(p.x * 5.1 + t * 0.9) * 0.6 + cos((p.x + p.y) * 9.3 - t * 1.3) * 0.4,
      sin(p.y * 6.3 - t * 0.7) * 0.6 + sin((p.x - p.y) * 7.7 + t * 1.1) * 0.4
    ) * 0.035;
    vec2 slope = sim.ba * 1.0 + swell;
    vec3 N = normalize(vec3(-slope.x, -slope.y, 1.0));

    float edge = waterEdge(uv.x, uTide, t);
    float depth = edge - uv.y;
    float water = smoothstep(-0.0015, 0.004, depth);
    float dry = dryness(uv.y, edge);
    float wet = 1.0 - smoothstep(0.0, 0.22, uv.y - edge);

    // ---- refraction of the clay bed (and the carved name)
    float d = clamp(depth, 0.0, 0.45);
    vec2 refr = slope * (0.06 + d * 0.22) * water;
    vec3 bed = shadeClay(uv + refr, max(wet, water), dry);

    // caustics from the height-field laplacian
    float hL = texture2D(uSim, uv - vec2(uSimTexel.x, 0.0)).r;
    float hR = texture2D(uSim, uv + vec2(uSimTexel.x, 0.0)).r;
    float hD = texture2D(uSim, uv - vec2(0.0, uSimTexel.y)).r;
    float hU = texture2D(uSim, uv + vec2(0.0, uSimTexel.y)).r;
    float lap = hL + hR + hD + hU - 4.0 * sim.r;
    float caust = clamp(-lap * 26.0, 0.0, 1.0) * water;
    caust += (pow(vnoise(p * 22.0 + vec2(t * 0.4, -t * 0.3)), 6.0) * 0.5) * water * smoothstep(0.02, 0.2, d);
    bed += caust * pal(vec3(0.16, 0.17, 0.165), vec3(0.06, 0.07, 0.08));

    // ---- absorption: shallow tidal water, grey-green Atlantic
    vec3 deep = pal(vec3(0.30, 0.37, 0.39), vec3(0.03, 0.05, 0.06));
    float absorb = 0.16 + 0.5 * (1.0 - exp(-d * 3.2));
    vec3 under = mix(bed, deep, absorb);

    // ---- surface reflection: Fresnel over an overcast sky
    vec3 V = normalize(vec3(0.0, -0.45 + uv.y * 0.2, 1.0));
    vec3 R = reflect(-V, N);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
    fres = clamp(fres + mix(0.05, 0.28, uv.y), 0.0, 1.0);
    vec3 surf = mix(under, sky(R), fres);

    // ---- foam where the water meets the clay
    float fn = fbm(vec2(uv.x * uAspect * 34.0, uv.y * 60.0) + vec2(t * 0.25, 0.0));
    float foam = smoothstep(0.011, 0.0, abs(depth - 0.002)) * smoothstep(0.35, 0.65, fn);
    foam += smoothstep(0.03, 0.0, abs(depth - 0.012)) * smoothstep(0.62, 0.8, fn) * 0.6;
    vec3 foamCol = pal(vec3(0.97, 0.975, 0.965), vec3(0.62, 0.67, 0.7));

    vec3 col = mix(bed, surf, water);
    col = mix(col, foamCol, clamp(foam, 0.0, 1.0) * 0.75 * step(0.0005, uTide + 0.001));

    // ---- finish: vignette, grain, intro wash from paper
    float vig = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(uAspect * 0.85, 1.0)));
    col *= mix(0.9, 1.0, vig);
    col += (hash21(uv * uRes + fract(t) * 91.0) - 0.5) * 0.018;
    col = mix(uPaper, col, smoothstep(0.0, 1.0, uIntro));

    gl_FragColor = vec4(col, 1.0);
  }
`

export const crystalVert = /* glsl */ `
  attribute vec3 aOffset;   // uv.x, uv.y, size (device px)
  attribute vec2 aSeed;     // random, groove (1 = sits on a carved letter rim)
  uniform vec2 uRes;
  uniform float uTide;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAspect;
  varying vec3 vN;
  varying float vSeed;
  varying float vGlint;
  varying float vGrow;
  ${noise}
  ${waterline}

  void main() {
    float edge = waterEdge(aOffset.x, uTide, uTime);
    float dry = dryness(aOffset.y, edge);
    float th = mix(0.3 + aSeed.x * 0.65, 0.12 + aSeed.x * 0.45, aSeed.y);
    float grow = smoothstep(th, th + 0.22, dry);
    vGrow = grow;
    vSeed = aSeed.x;

    vec2 dp = (aOffset.xy - uPointer) * vec2(uAspect, 1.0);
    float near = exp(-dot(dp, dp) * 90.0);
    vGlint = near;

    vec4 local = instanceMatrix * vec4(position, 1.0);
    vN = normalize(mat3(instanceMatrix) * normal);
    vec2 ndc = aOffset.xy * 2.0 - 1.0;
    vec2 px = local.xy * aOffset.z * grow * (1.0 + near * 0.35);
    gl_Position = vec4(ndc + px * 2.0 / uRes, 0.0, 1.0);
  }
`

export const crystalFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uDark;
  uniform float uIntro;
  varying vec3 vN;
  varying float vSeed;
  varying float vGlint;
  varying float vGrow;
  void main() {
    if (vGrow < 0.01) discard;
    vec3 n = normalize(vN);
    vec3 L = normalize(vec3(-0.45, 0.62, 0.64));
    float diff = 0.55 + 0.5 * max(dot(n, L), 0.0);
    vec3 base = mix(vec3(0.975, 0.972, 0.955), vec3(0.72, 0.76, 0.79), uDark);
    vec3 shadow = mix(vec3(0.72, 0.75, 0.77), vec3(0.3, 0.34, 0.37), uDark);
    vec3 col = mix(shadow, base, clamp(diff, 0.0, 1.0));
    float tw = pow(0.5 + 0.5 * sin(uTime * (1.3 + vSeed * 2.1) + vSeed * 61.0), 24.0);
    float facing = pow(max(n.z, 0.0), 6.0);
    col += (tw * 0.9 + vGlint * 0.8) * facing;
    gl_FragColor = vec4(col, uIntro);
  }
`
