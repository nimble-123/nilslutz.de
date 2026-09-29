/* GLSL for the Monolith room. Colours are authored in display space (no tone mapping). */

const common = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }
  float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

  // Travertine by day, basalt after hours. p in world units, id = panel id for per-panel variation.
  vec3 stone(vec2 p, vec2 id, float night) {
    vec2 o = vec2(hash(id), hash(id + 3.1)) * 40.0;
    vec2 q = p + o;
    float warp = fbm(q * 0.9);
    float band = fbm(vec2(q.x * 0.28, q.y * 2.6) + warp * 0.9);
    float vein = smoothstep(0.52, 0.78, band);
    vec3 lime = vec3(0.905, 0.872, 0.815);
    vec3 honey = vec3(0.835, 0.785, 0.705);
    vec3 col = mix(lime, honey, vein * 0.75);
    float pores = smoothstep(0.74, 0.86, noise(vec2(q.x * 11.0, q.y * 34.0)));
    col *= 1.0 - pores * 0.16;
    col *= 0.975 + 0.05 * noise(q * 70.0);
    col *= 0.975 + 0.05 * hash(id + 9.0);

    vec3 basalt = vec3(0.078, 0.078, 0.084) * (0.8 + 0.45 * fbm(q * 2.2));
    basalt += vec3(0.02, 0.018, 0.015) * smoothstep(0.8, 0.95, noise(q * 26.0));
    return mix(col, basalt, night);
  }

  float joints(vec2 p, vec2 size, out vec2 id) {
    vec2 g = p / size;
    id = floor(g);
    vec2 f = abs(fract(g) - 0.5) * size; // distance to cell centre in world units
    vec2 d = size * 0.5 - f;             // distance to joint
    float w = 0.004;
    vec2 aa = fwidth(p) * 1.2;
    float jx = 1.0 - smoothstep(w, w + aa.x, d.x);
    float jy = 1.0 - smoothstep(w, w + aa.y, d.y);
    return max(jx, jy);
  }

  // Cheap caustic web
  float caustic(vec2 p, float t) {
    vec2 q = p;
    float c = 0.0;
    for (int i = 0; i < 3; i++) {
      q += vec2(sin(q.y * 1.7 + t), cos(q.x * 1.3 - t * 0.8)) * 0.45;
      c += 1.0 / (1.0 + 26.0 * abs(sin(q.x) * sin(q.y)));
    }
    return c / 3.0;
  }
`

const roomUniforms = /* glsl */ `
  uniform vec3 uLight;
  uniform float uNight;
  uniform float uTime;
  uniform float uAssembled; // 1 = intact monolith, 0 = fully fractured
  uniform float uSlabH;
  uniform vec2 uSlabHalf;   // half width, half depth
  uniform float uBreath;
`

export const roomVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

export const wallFragment = /* glsl */ `
  ${roomUniforms}
  uniform sampler2D uWord;
  uniform vec2 uWordTexel;
  uniform vec4 uWordRect;
  uniform float uWallZ;
  varying vec3 vWorld;
  varying vec2 vUv;
  ${common}

  void main() {
    vec2 p = vWorld.xy;
    vec2 id;
    float j = joints(p + vec2(0.0, 0.0), vec2(1.9, 0.95), id);
    vec3 alb = stone(p, id, uNight);

    // carved wordmark: height field from a blurred mask
    vec2 wuv = (p - uWordRect.xy) / uWordRect.zw;
    float h = texture2D(uWord, wuv).r;
    float hl = texture2D(uWord, wuv - vec2(uWordTexel.x, 0.0)).r;
    float hr = texture2D(uWord, wuv + vec2(uWordTexel.x, 0.0)).r;
    float hd = texture2D(uWord, wuv - vec2(0.0, uWordTexel.y)).r;
    float hu = texture2D(uWord, wuv + vec2(0.0, uWordTexel.y)).r;
    float k = 9.0;
    vec3 N = normalize(vec3((hr - hl) * k, (hu - hd) * k, 1.0));

    vec3 L = uLight - vWorld;
    float d = length(L);
    L /= d;
    float diff = max(dot(N, L), 0.0);
    float att = 1.0 / (1.0 + d * d * 0.035);
    // grazing light across the carving
    float carve = dot(N.xy, L.xy) * 0.9;

    // museum light: ceiling wash by day, a narrow warm pool after hours
    float wash = mix(0.66, 0.84, smoothstep(0.0, 4.5, p.y));
    float poolDay = exp(-pow(length((p - vec2(0.0, 1.9)) * vec2(0.22, 0.42)), 2.0)) * 0.12;
    float poolNight = exp(-pow(length((p - vec2(0.0, 1.55)) * vec2(0.42, 0.5)), 2.0));
    float ambient = mix(wash + poolDay, 0.05 + poolNight * 0.26, uNight);

    // shadow + caustic of the glass on the wall
    vec3 toL = uLight - vWorld;
    float t = (0.0 - vWorld.z) / toL.z;
    vec3 Q = vWorld + toL * t;
    float sd = sdBox(Q.xy - vec2(0.0, uSlabH * 0.5), vec2(uSlabHalf.x, uSlabH * 0.5));
    float pen = 0.05 + 0.08 * t;
    float occ = 1.0 - smoothstep(-pen, pen, sd);
    float glassShadow = occ * mix(0.32, 0.14, 1.0 - uAssembled) * (0.35 + 0.65 * uAssembled);
    float cz = caustic(Q.xy * 3.2, uTime * 0.12) * occ * uAssembled;

    vec3 lightCol = mix(vec3(1.0, 0.975, 0.94), vec3(1.0, 0.8, 0.55), uNight);
    float direct = diff * att * mix(0.55, 1.35, uNight) * (1.0 - glassShadow);
    vec3 col = alb * (ambient + direct * lightCol);
    col += alb * lightCol * carve * mix(0.55, 1.1, uNight) * att * 3.0;
    col += lightCol * cz * mix(0.05, 0.08, uNight) * att;

    // carved letter interior sits a touch darker (occluded)
    col *= 1.0 - smoothstep(0.35, 0.9, h) * mix(0.06, 0.25, uNight);
    // joints
    col *= 1.0 - j * mix(0.16, 0.5, uNight);
    // floor contact AO
    col *= mix(0.78, 1.0, smoothstep(0.0, 0.7, p.y));

    gl_FragColor = vec4(col, 1.0);
  }
`

export const floorFragment = /* glsl */ `
  ${roomUniforms}
  uniform float uWallZ;
  varying vec3 vWorld;
  varying vec2 vUv;
  ${common}

  void main() {
    vec2 p = vWorld.xz;
    vec2 id;
    float j = joints(p + vec2(0.6, 0.0), vec2(1.2, 1.2), id);
    vec3 alb = stone(p * vec2(1.0, 1.0) + 13.0, id, uNight) * 0.97;

    vec3 N = vec3(0.0, 1.0, 0.0);
    vec3 L = uLight - vWorld;
    float d = length(L);
    L /= d;
    float att = 1.0 / (1.0 + d * d * 0.035);
    float diff = max(dot(N, L), 0.0);
    vec3 V = normalize(cameraPosition - vWorld);
    float sheen = pow(max(dot(reflect(-L, N), V), 0.0), 28.0) * mix(0.12, 0.3, uNight);

    // soft cast shadow from a point light: march the light ray through the slab's height
    float occ = 0.0;
    vec2 hit = vec2(0.0);
    for (int i = 0; i < 9; i++) {
      float hgt = (float(i) + 0.5) / 9.0 * uSlabH * uBreath;
      vec2 Q = p + (uLight.xz - p) * (hgt / uLight.y);
      float pen = 0.015 + 0.16 * hgt / uSlabH;
      float o = 1.0 - smoothstep(-pen, pen, sdBox(Q, uSlabHalf));
      if (o > occ) { occ = o; hit = Q; }
    }
    float contact = exp(-max(sdBox(p, uSlabHalf), 0.0) * 9.0);
    float strength = mix(0.34, 0.18, 1.0 - uAssembled) * (0.3 + 0.7 * uAssembled);
    float shadow = max(occ * strength, contact * mix(0.5, 0.2, 1.0 - uAssembled));

    float cz = pow(caustic(p * 4.2 + hit * 2.0, uTime * 0.14), 1.6) * occ * uAssembled;

    float wash = mix(0.7, 0.8, smoothstep(6.0, -2.0, p.y));
    float poolNight = exp(-pow(length((p - vec2(0.0, 0.3)) * vec2(0.45, 0.6)), 2.0));
    float ambient = mix(wash, 0.04 + poolNight * 0.22, uNight);

    vec3 lightCol = mix(vec3(1.0, 0.975, 0.94), vec3(1.0, 0.8, 0.55), uNight);
    float direct = diff * att * mix(0.45, 1.4, uNight);
    vec3 col = alb * (ambient + direct * lightCol) * (1.0 - shadow);
    col += lightCol * (sheen * att * (1.0 - shadow));
    col += lightCol * cz * mix(0.1, 0.2, uNight) * att;

    col *= 1.0 - j * mix(0.14, 0.45, uNight);
    // wall junction AO
    col *= mix(0.74, 1.0, smoothstep(0.0, 0.9, vWorld.z - uWallZ));
    // distance fog into the room colour
    float fog = smoothstep(4.0, 9.0, vWorld.z);
    col = mix(col, mix(vec3(0.9, 0.87, 0.82), vec3(0.03), uNight), fog * 0.5);

    gl_FragColor = vec4(col, 1.0);
  }
`

export const postVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const postFragment = /* glsl */ `
  uniform sampler2D uScene;
  uniform float uTime;
  uniform float uNight;
  uniform vec2 uRes;
  varying vec2 vUv;
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  void main() {
    vec3 col = texture2D(uScene, vUv).rgb;
    vec2 c = vUv - 0.5;
    c.x *= uRes.x / uRes.y;
    float vig = smoothstep(1.25, 0.25, length(c));
    col *= mix(0.9, 1.0, vig);
    col *= mix(1.0, mix(0.35, 1.0, vig), uNight);
    float g = hash(vUv * uRes + fract(uTime * 7.0) * 100.0) - 0.5;
    col += g * mix(0.018, 0.026, uNight);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const glassVertex = /* glsl */ `
  attribute vec4 aEdge;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec4 vEdge;
  varying vec3 vLocal;
  varying vec3 vView;
  void main() {
    vEdge = aEdge;
    vLocal = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * w;
    vView = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

export const glassFragment = /* glsl */ `
  uniform sampler2D uBg;
  uniform vec2 uRes;
  uniform vec3 uLight;
  uniform float uNight;
  uniform float uTime;
  uniform float uThickness;
  uniform float uFocus;
  uniform float uCore;
  uniform float uReveal;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec4 vEdge;
  varying vec3 vLocal;
  varying vec3 vView;

  vec3 sampleBg(vec2 uv, float lod) {
    uv = clamp(uv, vec2(0.001), vec2(0.999));
    return texture2D(uBg, uv, lod).rgb;
  }

  void main() {
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vWorld);
    float NdV = max(dot(N, V), 0.0);

    float edgeDist = min(min(vEdge.x, vEdge.z - vEdge.x), min(vEdge.y, vEdge.w - vEdge.y));
    float bevel = exp(-edgeDist / 0.022);
    float rimLine = exp(-edgeDist / 0.0045);

    vec2 suv = gl_FragCoord.xy / uRes;
    // view-space refraction offset, three wavelengths → dispersion
    vec3 viewN = normalize((viewMatrix * vec4(N, 0.0)).xyz);
    // cast-glass imperfection: a slow, low-frequency waviness inside the body
    vec2 wob = vec2(sin(vLocal.y * 5.0 + vLocal.x * 3.0 + uTime * 0.05), cos(vLocal.x * 6.0 - vLocal.y * 3.5)) * 0.07;
    viewN = normalize(viewN + vec3(wob, 0.0));
    vec3 inc = normalize(vView);
    float thick = uThickness * (1.0 + bevel * 2.2);
    float lod = mix(0.0, 2.6, uCore) + bevel * 1.2;
    vec3 refr = vec3(0.0);
    const int SAMPLES = 6;
    for (int i = 0; i < SAMPLES; i++) {
      float s = float(i) / float(SAMPLES - 1);
      float ior = mix(1.14, 1.24, s);
      vec3 rd = refract(inc, viewN, 1.0 / ior);
      vec2 off = (rd.xy - inc.xy) * thick;
      vec3 c = sampleBg(suv + off, lod);
      // spread each sample across the spectrum (R → G → B)
      vec3 w = vec3(smoothstep(0.55, 0.0, s), 1.0 - abs(s - 0.5) * 2.0, smoothstep(0.45, 1.0, s));
      refr += c * w;
    }
    refr /= vec3(2.0, 2.0 + 0.4, 2.0) * 0.85;
    refr = clamp(refr, 0.0, 1.2);

    // absorption tint: faintly green-grey glass by day, smoky after hours
    vec3 tint = mix(vec3(0.955, 0.985, 0.975), vec3(0.86, 0.9, 0.94), uNight);
    refr *= mix(vec3(1.0), tint, 0.6 + bevel * 0.4);

    // reflection of an imaginary gallery: bright ceiling, stone walls
    vec3 R = reflect(-V, N);
    vec3 envDay = mix(vec3(0.84, 0.8, 0.74), vec3(1.0, 0.99, 0.97), smoothstep(-0.1, 0.8, R.y));
    vec3 envNight = mix(vec3(0.02), vec3(0.14, 0.12, 0.1), smoothstep(0.2, 0.9, R.y));
    vec3 env = mix(envDay, envNight, uNight);
    // skylight strip
    env += smoothstep(0.93, 0.99, R.y) * mix(0.25, 0.1, uNight);

    float F0 = 0.04;
    float fres = F0 + (1.0 - F0) * pow(1.0 - NdV, 4.0);

    vec3 Ld = normalize(uLight - vWorld);
    vec3 H = normalize(Ld + V);
    float spec = pow(max(dot(N, H), 0.0), 180.0) * 2.2 + pow(max(dot(N, H), 0.0), 18.0) * 0.08;
    vec3 lightCol = mix(vec3(1.0, 0.98, 0.95), vec3(1.0, 0.82, 0.58), uNight);

    // caustic-like inner highlight: looking through the glass toward the light
    vec3 inside = refract(-V, N, 1.0 / 1.2);
    float innerGlow = pow(max(dot(inside, Ld), 0.0), 24.0) * 0.35;
    float shimmer = 0.5 + 0.5 * sin(vLocal.y * 9.0 + vLocal.x * 5.0 + uTime * 0.4);
    innerGlow *= 0.7 + 0.3 * shimmer;

    vec3 brass = vec3(0.78, 0.62, 0.38);
    vec3 col = refr * (1.0 - fres) + env * fres;
    col += lightCol * (spec + innerGlow);
    // polished edges catch light; the focused exhibit glints brass
    vec3 edgeCol = mix(mix(vec3(1.0), vec3(0.92, 0.97, 0.95), 0.5), brass * 1.25, max(uFocus, uCore * 0.6));
    col += edgeCol * rimLine * mix(0.35, 0.7, max(uFocus, uNight)) * (0.5 + 0.5 * fres);
    col += edgeCol * bevel * 0.06;

    // the Clean Core: a quiet, warm inner light
    float coreGlow = uCore * (0.08 + 0.05 * sin(uTime * 0.6));
    col += brass * coreGlow * (1.0 - fres) * mix(0.8, 1.6, uNight);
    col = mix(col, col * 1.04 + brass * 0.05, uFocus * 0.6);

    gl_FragColor = vec4(col, uReveal);
  }
`
