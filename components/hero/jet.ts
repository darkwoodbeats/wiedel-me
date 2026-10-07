import { BufferAttribute, BufferGeometry } from "three";
import { COMMON_GLSL, OUTPUT_GLSL } from "./glsl";

/*
 * The jet shared by the hero (Aircraft.tsx) and the jets lapping the contact panel (JetsCanvas.tsx):
 * its model, its material and its vapor trail.
 */

type V3 = [number, number, number];

/**
 * A low-poly twin-tail jet (a nod to the F/A-18s in Graves's squadron), 38 triangles, nose along +Z,
 * one unit long. Flat-shaded faces give it the faceted look of 1980s computer graphics.
 */
export function buildJet() {
  const verts: number[] = [];
  const tri = (a: V3, b: V3, c: V3) => verts.push(...a, ...b, ...c);
  const quad = (a: V3, b: V3, c: V3, d: V3) => {
    tri(a, b, c);
    tri(a, c, d);
  };

  // Fuselage: diamond cross-sections from the nose to the tail.
  const ring = (z: number, w: number, top: number, bottom: number): V3[] => [
    [0, top, z],
    [w, 0, z],
    [0, -bottom, z],
    [-w, 0, z],
  ];
  const nose: V3 = [0, 0, 0.5];
  const tail: V3 = [0, 0.005, -0.5];
  const rings = [
    ring(0.26, 0.035, 0.045, 0.03),
    ring(0, 0.06, 0.05, 0.04),
    ring(-0.38, 0.05, 0.035, 0.03),
  ];
  for (let s = 0; s < 4; s++) {
    const n = (s + 1) % 4;
    tri(nose, rings[0][s], rings[0][n]);
    for (let r = 0; r < rings.length - 1; r++) {
      quad(rings[r][s], rings[r + 1][s], rings[r + 1][n], rings[r][n]);
    }
    tri(rings[rings.length - 1][s], tail, rings[rings.length - 1][n]);
  }

  for (const side of [1, -1]) {
    const m = ([x, y, z]: V3): V3 => [x * side, y, z];
    // Swept wing, with a leading-edge strake running forward along the fuselage.
    quad(
      m([0.05, -0.01, 0.14]),
      m([0.44, -0.01, -0.2]),
      m([0.44, -0.01, -0.28]),
      m([0.05, -0.01, -0.24]),
    );
    tri(m([0.03, -0.005, 0.32]), m([0.1, -0.01, 0.08]), m([0.04, -0.01, 0.06]));
    // Tailplane.
    quad(
      m([0.04, -0.01, -0.34]),
      m([0.21, -0.01, -0.46]),
      m([0.21, -0.01, -0.53]),
      m([0.04, -0.01, -0.5]),
    );
    // Twin fins, canted outward.
    quad(
      m([0.045, 0.03, -0.2]),
      m([0.1, 0.2, -0.38]),
      m([0.1, 0.2, -0.47]),
      m([0.045, 0.03, -0.44]),
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(verts), 3));
  // Non-indexed, so every face keeps its own flat normal.
  geometry.computeVertexNormals();
  return geometry;
}

export const jetVertex = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
    m = modelMatrix * instanceMatrix;
  #endif
  vec4 wp = m * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormal = mat3(m) * normal;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const jetFragment = /* glsl */ `
${COMMON_GLSL}
uniform vec3 uBase;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform vec3 uRimDir;
uniform vec3 uCyan;
uniform vec3 uMagenta;
uniform vec3 uFillPos;
uniform float uRim;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vec3 N = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 toCam = cameraPosition - vWorldPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - NdV, 5.0);

  // Dark charcoal, lit by the same lights and environment as the cube.
  vec3 col = uBase * (0.6 + 0.8 * (0.5 + 0.5 * N.y));
  col += uBase * uKeyColor * max(dot(N, uKeyDir), 0.0) * 3.0;
  col += envRadiance(vWorldPos, reflect(-V, N), 0.5) * fresnel * 0.6;

  // As faces turn, they catch the scene's cyan rim light and the magenta glow off the horizon.
  col += uCyan * pow(max(dot(N, uRimDir), 0.0), 3.0) * 0.16;
  col += uMagenta * pow(max(dot(N, normalize(uFillPos - vWorldPos)), 0.0), 3.0) * 0.12;

  // A faint grazing edge light keeps the silhouette legible against the dark sky.
  col += mix(uMagenta, uCyan, 0.5 + 0.5 * N.y) * pow(1.0 - NdV, 2.0) * uRim;

  // The same atmospheric haze as the grid, so distant aircraft sit back in the air.
  col = mix(col, skyRadiance(-V), 1.0 - exp(-pow(dist / 40.0, 1.45)));

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

export const trailVertex = /* glsl */ `
attribute float aAge;
uniform float uPixelRatio;
uniform float uIntensity;
varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  // Starts just behind the tail, thins and fades over the trail's length of flight.
  float fade = 1.0 - aAge;
  vAlpha = uIntensity * fade * fade * smoothstep(0.04, 0.107, aAge);
  gl_PointSize = mix(2.2, 1.0, aAge) * uPixelRatio * clamp(9.0 / -mv.z, 0.6, 1.6);
}
`;

export const trailFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * a * vAlpha, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
