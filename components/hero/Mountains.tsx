import { useEffect, useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color } from "three";
import { GEOMETRY, PALETTE } from "./config";
import { COMMON_GLSL, OUTPUT_GLSL } from "./glsl";
import { mulberry32 } from "./hooks";
import type { SharedUniforms } from "./uniforms";

const SEG_X = 110;
const SEG_Z = 7;
const WIDTH = 420;
const Z_NEAR = -62;
const Z_FAR = -96;
const PEAK = 11;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * A distant ridge line. It is low-poly on purpose and parts in a valley
 * behind the object, so the horizon behind the sphere stays clean.
 */
function buildMountains() {
  const rand = mulberry32(42);
  const lattice = Array.from({ length: 512 }, rand);
  const noise1 = (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lattice[((i % 512) + 512) % 512] * (1 - u) + lattice[(((i + 1) % 512) + 512) % 512] * u;
  };
  const ridged = (x: number) => {
    let sum = 0;
    let amp = 0.6;
    let freq = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * (1 - Math.abs(noise1(x * freq) * 2 - 1));
      amp *= 0.5;
      freq *= 2.1;
    }
    return sum;
  };

  const cols = SEG_X + 1;
  const rows = SEG_Z + 1;
  const positions = new Float32Array(cols * rows * 3);
  const grid = new Float32Array(cols * rows * 2);
  for (let j = 0; j < rows; j++) {
    const v = j / SEG_Z;
    const z = Z_NEAR + (Z_FAR - Z_NEAR) * v;
    // The range rises toward the back rows and meets the ground at the front row.
    const rowProfile = Math.sin(Math.min(v * 1.25, 1) * Math.PI * 0.5);
    for (let i = 0; i < cols; i++) {
      const u = i / SEG_X;
      let x = (u - 0.5) * WIDTH;
      if (i > 0 && i < SEG_X) x += (rand() - 0.5) * (WIDTH / SEG_X) * 0.6;
      const valley = smoothstep(12, 44, Math.abs(x));
      const h = Math.max(0, ridged(x * 0.028 + j * 0.37) - 0.35) * PEAK * rowProfile * valley * 1.6;
      const k = (j * cols + i) * 3;
      positions[k] = x;
      positions[k + 1] = GEOMETRY.floorY + (j === 0 ? 0 : h);
      positions[k + 2] = z + (j > 0 && j < SEG_Z ? (rand() - 0.5) * 2 : 0);
      grid[(j * cols + i) * 2] = i;
      grid[(j * cols + i) * 2 + 1] = j;
    }
  }

  const index: number[] = [];
  for (let j = 0; j < SEG_Z; j++) {
    for (let i = 0; i < SEG_X; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      index.push(a, b, c, b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aGrid", new BufferAttribute(grid, 2));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();
  return geometry;
}

const vertex = /* glsl */ `
attribute vec2 aGrid;
varying vec3 vWorldPos;
varying vec2 vGrid;
void main() {
  vGrid = aGrid;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragment = /* glsl */ `
${COMMON_GLSL}
uniform vec3 uColor;
uniform vec3 uLine;
uniform float uPeak;
varying vec3 vWorldPos;
varying vec2 vGrid;

void main() {
  // Flat-shaded facets from screen-space derivatives.
  vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 toCam = cameraPosition - vWorldPos;
  vec3 V = normalize(toCam);
  if (dot(N, V) < 0.0) N = -N;

  float h = clamp((vWorldPos.y - uFloorY) / uPeak, 0.0, 1.0);
  float backlit = pow(clamp(dot(N, normalize(vec3(0.0, 0.35, -1.0))), 0.0, 1.0), 2.0);
  vec3 col = uColor * (0.6 + 0.5 * clamp(N.y, 0.0, 1.0)) + uHorizon * backlit * 0.03;

  // A vector-terrain wireframe, stronger toward the ridgelines.
  vec2 m = gridLines(vGrid, 1.0);
  col += uLine * max(m.x, m.y) * (0.12 + 0.88 * h) * 0.35;

  // Atmospheric haze: the bases dissolve into the horizon glow.
  float haze = mix(0.82, 0.3, smoothstep(0.0, 0.5, h));
  col = mix(col, skyRadiance(-V), haze);

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

export function Mountains({ shared }: { shared: SharedUniforms }) {
  const geometry = useMemo(() => buildMountains(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      ...shared,
      uColor: { value: new Color(PALETTE.mountain) },
      uLine: { value: new Color(PALETTE.mountainLine) },
      uPeak: { value: PEAK },
    }),
    [shared],
  );

  return (
    <mesh geometry={geometry}>
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}
