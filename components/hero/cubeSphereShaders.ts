import { COMMON_GLSL, OUTPUT_GLSL } from "./glsl";

/**
 * Shaders for the cube, the glass sphere and the contact flares (see CubeSphere.tsx).
 * All lighting is evaluated here against the procedural environment in glsl.ts.
 * No three.js lights or env maps are involved, so the scene has no shadow or PMREM cost.
 */

export const sphereVertex = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjPos;

void main() {
  vObjPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const sphereFragment = /* glsl */ `
${COMMON_GLSL}
uniform vec3 uCenter;
uniform vec3 uContacts[8];
uniform float uHover;
uniform vec3 uCyan;
uniform vec3 uMagenta;
uniform vec3 uRimAxis;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform float uRim;
uniform float uReflect;
uniform float uContact;
uniform float uBaseAlpha;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjPos;

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

void main() {
  // Both walls of a thin glass shell: the front surface and, seen through it, the inside of the back.
  bool inner = !gl_FrontFacing;
  vec3 N = normalize(vWorldNormal) * (inner ? -1.0 : 1.0);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float edge = 1.0 - NdV;
  float fresnel = 0.035 + 0.965 * pow(edge, 5.0);

  // Faint surface imperfections so the glass reads as a physical object, not a CG primitive.
  float smudge = 0.78 + 0.44 * noise3(vObjPos * 2.1);

  vec3 R = reflect(-V, N);
  vec3 col = envRadiance(vWorldPos, R, 0.3) * fresnel * uReflect * smudge;

  // Two-tone rim: cyan on the side facing uRimAxis, magenta on the side toward the horizon glow.
  vec3 radial = normalize(vWorldPos - uCenter);
  float side = dot(radial, uRimAxis) * 0.5 + 0.5;
  vec3 rimTint = mix(uMagenta, uCyan, smoothstep(0.25, 0.8, side));
  float rim = pow(edge, 3.0) * 0.25 + pow(edge, 10.0) * 1.3;
  col += rimTint * rim * uRim * (1.0 + 0.45 * uHover) * smudge;

  // Glints from the key light: a tight hotspot plus a broad sheen.
  vec3 H = normalize(uKeyDir + V);
  float NdH = max(dot(N, H), 0.0);
  col += uKeyColor * (pow(NdH, 2400.0) * 1.8 + pow(NdH, 80.0) * 0.05) * (inner ? 0.4 : 1.0);

  // The eight contact points: a tight kiss of light where each vertex meets the glass.
  // Contacts on the sphere's outline, where the touch is easiest to read, are brighter than those facing the viewer.
  float contact = 0.0;
  for (int i = 0; i < 8; i++) {
    float k = 1.0 - dot(radial, uContacts[i]);
    contact += exp(-k * 3000.0) + 0.2 * exp(-k * 260.0);
  }
  col += uCyan * contact * uContact * mix(0.12, 1.2, edge * edge) * (1.0 + 0.8 * uHover);

  float alpha = clamp(uBaseAlpha + fresnel * 0.85 + rim * 0.1, 0.0, 1.0);
  if (inner) {
    col *= 0.5;
    alpha *= 0.55;
  }

  // Premultiplied output: color is added, and alpha controls how much of the background shows through.
  gl_FragColor = vec4(col, alpha);
  ${OUTPUT_GLSL}
}
`;

export const cubeVertex = /* glsl */ `
varying vec3 vLocal;
varying vec3 vLocalNormal;
varying vec3 vWorldPos;

void main() {
  vLocal = position;
  vLocalNormal = normal;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const cubeFragment = /* glsl */ `
${COMMON_GLSL}
uniform mat4 modelMatrix;
uniform float uHalf;
uniform vec3 uBase;
uniform float uReflect;
uniform float uEdgeSheen;
uniform float uCornerGlow;
uniform float uHover;
uniform vec3 uCenter;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform vec3 uRimDir;
uniform vec3 uRimColor;
uniform vec3 uFrontPos;
uniform vec3 uFillPos;
uniform vec3 uFillColor;

varying vec3 vLocal;
varying vec3 vLocalNormal;
varying vec3 vWorldPos;

void main() {
  // Tangent-plane coordinates on the current face, running 0 at its center to 1 at its edges.
  vec3 p = vLocal / uHalf;
  vec3 nL = normalize(vLocalNormal);
  vec3 tc = abs(p) * (1.0 - step(0.5, abs(nL)));
  float e1 = max(tc.x, max(tc.y, tc.z));
  float e2 = tc.x + tc.y + tc.z - e1;

  // A micro-bevel along every edge, at least ~1.5px wide so it never shimmers.
  float w = max(0.012, fwidth(e1) * 1.6);
  float edge = smoothstep(1.0 - w, 1.0, e1);
  float corner = smoothstep(0.9, 1.0, e1) * smoothstep(0.9, 1.0, e2);

  // Tilt the normal toward the neighbouring face near an edge, so edges catch light like a real bevel.
  vec3 nearest = step(vec3(e1 - 1e-4), tc);
  vec3 bevel = normalize(nL + nearest * sign(p) * edge * 0.9);
  vec3 N = normalize(mat3(modelMatrix) * bevel);

  vec3 V = normalize(cameraPosition - vWorldPos);
  float NdV = max(dot(N, V), 1e-3);
  float fresnel = 0.04 + 0.96 * pow(1.0 - NdV, 5.0);
  vec3 R = reflect(-V, N);

  // Glossy charcoal: a low diffuse response, so faces separate by a few shades, plus controlled reflections.
  vec3 Lf = normalize(uFrontPos - vWorldPos);
  vec3 Lm = normalize(uFillPos - vWorldPos);
  float sky = 0.5 + 0.5 * N.y;
  vec3 col = uBase * (0.5 + 1.2 * sky);
  col += uBase * uKeyColor * max(dot(N, Lf), 0.0) * 3.2;
  col += uBase * uFillColor * max(dot(N, Lm), 0.0) * 3.0;
  col += uBase * uKeyColor * max(dot(N, uKeyDir), 0.0) * 1.5;
  col += envRadiance(vWorldPos, R, 0.6) * fresnel * uReflect;

  // A broad, soft sheen from the front light gives each face a gentle gradient.
  vec3 Hf = normalize(Lf + V);
  col += uKeyColor * pow(max(dot(N, Hf), 0.0), 24.0) * fresnel * 0.35;
  vec3 H1 = normalize(uKeyDir + V);
  col += uKeyColor * pow(max(dot(N, H1), 0.0), 240.0) * fresnel * 5.0;
  vec3 H2 = normalize(uRimDir + V);
  col += uRimColor * pow(max(dot(N, H2), 0.0), 50.0) * fresnel * 2.5;

  // Edges pick up a thin line of rim light (a controlled reflection, not neon).
  float grazing = 0.3 + 0.7 * pow(1.0 - NdV, 2.0);
  col += mix(uRimColor, uFillColor, 0.35) * edge * uEdgeSheen * grazing * (1.0 + 0.6 * uHover);

  // The corners, where they meet the glass. They are brightest when on the sphere's outline.
  float outline = 1.0 - abs(dot(normalize(vWorldPos - uCenter), V));
  col += uRimColor * corner * uCornerGlow * mix(0.1, 1.4, outline * outline) * (1.0 + 0.8 * uHover);

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

/**
 * The pockets of the brand marks cut into the cube (walls and floors; see brandMark.ts). It shares the
 * cube's satin-black response and lights, but reads as machined: the floor is rougher and less
 * reflective, less light reaches the bottom of the cut, and the walls catch a hairline of the
 * existing key and rim light at the lip, so the scene's own lighting reveals the depth.
 */
export const recessFragment = /* glsl */ `
${COMMON_GLSL}
uniform mat4 modelMatrix;
uniform float uHalf;
uniform vec3 uBase;
uniform float uReflect;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform vec3 uRimDir;
uniform vec3 uRimColor;
uniform vec3 uFrontPos;
uniform vec3 uFillPos;
uniform vec3 uFillColor;
uniform float uMarkDepth;

varying vec3 vLocal;
varying vec3 vLocalNormal;
varying vec3 vWorldPos;

void main() {
  // Which face this pocket belongs to. The pockets sit on the +X, +Y and +Z faces, just under the
  // surface, and the mark spans well under half a face, so the largest coordinate identifies it.
  vec3 markNormal = vLocal.x > max(vLocal.y, vLocal.z)
    ? vec3(1.0, 0.0, 0.0)
    : (vLocal.y > vLocal.z ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0));

  // Walls are seen from inside the pocket, so turn every normal toward the viewer.
  vec3 nL = normalize(vLocalNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 N = normalize(mat3(modelMatrix) * nL);
  bool isFloor = dot(nL, markNormal) > 0.5;
  // 0 at the lip where the cut meets the face, 1 at the floor.
  float cut = clamp((uHalf - dot(vLocal, markNormal)) / uMarkDepth, 0.0, 1.0);

  vec3 V = normalize(cameraPosition - vWorldPos);
  float NdV = max(dot(N, V), 1e-3);
  float fresnel = 0.04 + 0.96 * pow(1.0 - NdV, 5.0);
  vec3 R = reflect(-V, N);

  // The face's diffuse response (see cubeFragment), with a satin floor and brighter-edged walls.
  vec3 Lf = normalize(uFrontPos - vWorldPos);
  vec3 Lm = normalize(uFillPos - vWorldPos);
  float sky = 0.5 + 0.5 * N.y;
  vec3 col = uBase * (0.5 + 1.2 * sky);
  col += uBase * uKeyColor * max(dot(N, Lf), 0.0) * 3.2;
  col += uBase * uFillColor * max(dot(N, Lm), 0.0) * 3.0;
  col += uBase * uKeyColor * max(dot(N, uKeyDir), 0.0) * 1.5;
  col += envRadiance(vWorldPos, R, 0.6) * fresnel * uReflect * (isFloor ? 0.62 : 0.6);

  vec3 H1 = normalize(uKeyDir + V);
  col += uKeyColor * pow(max(dot(N, H1), 0.0), isFloor ? 40.0 : 120.0) * fresnel * (isFloor ? 1.0 : 3.0);

  // Less light reaches the bottom of the cut.
  col *= mix(1.0, isFloor ? 0.7 : 0.66, cut);

  // A hairline of the existing key and rim light where each wall meets the face.
  if (!isFloor) {
    float lip = smoothstep(0.6, 0.0, cut);
    col += (uRimColor * max(dot(N, uRimDir), 0.0) * 0.07 + uKeyColor * max(dot(N, uKeyDir), 0.0) * 0.06) * lip;
  }

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

export const flareVertex = /* glsl */ `
uniform vec3 uContacts[8];
uniform vec3 uCenter;
uniform float uRadius;
uniform float uPixelRatio;
varying float vStrength;

void main() {
  vec3 c = uContacts[gl_VertexID];
  vec3 p = uCenter + c * uRadius;
  // 1 when the vertex sits exactly on the sphere's outline as seen from the camera, and falls off sharply.
  float outline = 1.0 - abs(dot(c, normalize(cameraPosition - p)));
  vStrength = pow(outline, 10.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  gl_PointSize = 30.0 * uPixelRatio;
}
`;

export const flareFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uHover;
varying float vStrength;

void main() {
  float d2 = dot(gl_PointCoord - 0.5, gl_PointCoord - 0.5) * 4.0;
  float glow = exp(-d2 * 90.0) * 1.6 + exp(-d2 * 9.0) * 0.14;
  gl_FragColor = vec4(uColor * glow * vStrength * uIntensity * (1.0 + 0.6 * uHover), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
