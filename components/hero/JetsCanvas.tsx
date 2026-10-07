"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DoubleSide,
  DynamicDrawUsage,
  type InstancedMesh,
  Matrix4,
  OneFactor,
  type PerspectiveCamera,
  type ShaderMaterial,
  Vector3,
  ZeroFactor,
} from "three";
import { AIRCRAFT, LIGHTS, PALETTE, PANEL_JETS } from "./config";
import { buildJet, jetFragment, jetVertex } from "./jet";
import { createSharedUniforms, lightDir } from "./uniforms";

/**
 * One jet's lap of the contact panel: a rounded rectangle just outside its edges, in a plane leaned
 * diagonally, so the jet swings toward the viewer past one corner and away behind the opposite one
 * (where the panel hides it), crossing the panel's plane beside the other two. Distances are world
 * units (PANEL_JETS.pxPerUnit pixels each at the panel's plane); they shrink with the panel on phones.
 */
interface Lap {
  /** The corner the lap swings toward the viewer at, as [x, y] signs. The opposite corner is behind. */
  front: [number, number];
  /** Clearance outside the panel's edges, and the lap's corner radius. */
  gap: number;
  radius: number;
  /** Toward the viewer at the front corner, and as far away at the opposite one. */
  depth: number;
  /** Units per second along the lap; the sign sets the direction. */
  speed: number;
  /** Where the lap starts, as a fraction of it. */
  phase: number;
  /** Wings rolled from the lap's plane toward the viewer: 0 shows a profile, ~0.6 shows the top too. */
  roll: number;
}

/** Three laps, like the hero's three orbits: a close patrol, a wider circuit flown the other way, a quick tight one. */
const LAPS: Lap[] = [
  { front: [-1, 1], gap: 0.35, radius: 0.9, depth: 1.6, speed: 0.75, phase: 0.05, roll: 0.55 },
  { front: [-1, -1], gap: 0.6, radius: 1.2, depth: 1.9, speed: -0.6, phase: 0.45, roll: 0.45 },
  { front: [1, 1], gap: 0.2, radius: 0.7, depth: 1.3, speed: 0.9, phase: 0.75, roll: 0.65 },
];

/**
 * Contrails, longer and denser than the hero's faint trails so they read as unbroken vapor: each
 * covers this many seconds of flight in this many points, and brightens to this intensity.
 */
const CONTRAIL = { seconds: 3.4, points: 160, intensity: 0.3 };

/** Seconds either side of "now" used to find each jet's heading. */
const LOOK = 0.08;

/** A contrail point: tight and bright just behind the tail, then spreading and fading like vapor. */
const contrailVertex = /* glsl */ `
attribute float aAge;
uniform float uPixelRatio;
uniform float uIntensity;
varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float fade = 1.0 - aAge;
  vAlpha = uIntensity * fade * fade * smoothstep(0.015, 0.06, aAge);
  gl_PointSize = mix(2.4, 6.0, aAge) * uPixelRatio * clamp(12.0 / -mv.z, 0.7, 1.4);
}
`;

/**
 * For a transparent canvas: the glow is premultiplied with zero alpha (and the blending below leaves
 * the canvas's alpha alone), so the page composites it as light added on top, not as dark squares.
 */
const contrailFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * a * vAlpha, 0.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** The panel's half-size in world units, read off the canvas (which is the panel plus PANEL_JETS.margin). */
function panelSize(width: number, height: number) {
  const { margin, pxPerUnit } = PANEL_JETS;
  const w = width / (1 + 2 * margin.x) / 2 / pxPerUnit;
  const h = height / (1 + 2 * margin.y) / 2 / pxPerUnit;
  // Laps tighten on narrow panels, so phones still see the jets beside the panel.
  return { w, h, k: Math.min(Math.max(w / 5, 0.35), 1) };
}
type Panel = ReturnType<typeof panelSize>;

/** One side of a lap and the corner arc after it, clockwise from the left end of the top edge. */
interface Side {
  length: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  nx: number;
  ny: number;
  cx: number;
  cy: number;
  from: number;
}

/**
 * A lap's geometry for the panel's current size. Built once per resize, so the frame loop, which
 * looks up hundreds of points a frame for the contrails, never allocates.
 */
function buildPath(lap: Lap, panel: Panel) {
  const a = panel.w + lap.gap * panel.k;
  const b = panel.h + lap.gap * panel.k;
  const r = Math.min(lap.radius * panel.k, a, b);
  const ca = a - r;
  const cb = b - r;
  const depth = lap.depth * panel.k;
  const sides: Side[] = [
    { length: 2 * ca, x: -ca, y: b, dx: 1, dy: 0, nx: 0, ny: -1, cx: ca, cy: cb, from: Math.PI / 2 },
    { length: 2 * cb, x: a, y: cb, dx: 0, dy: -1, nx: -1, ny: 0, cx: ca, cy: -cb, from: 0 },
    { length: 2 * ca, x: ca, y: -b, dx: -1, dy: 0, nx: 0, ny: 1, cx: -ca, cy: -cb, from: -Math.PI / 2 },
    { length: 2 * cb, x: -a, y: -cb, dx: 0, dy: 1, nx: 1, ny: 0, cx: -ca, cy: cb, from: Math.PI },
  ];
  return {
    lap,
    r,
    arc: (Math.PI / 2) * r,
    perimeter: 4 * (ca + cb) + 2 * Math.PI * r,
    sides,
    // The leaned plane: z = alpha * x + beta * y.
    alpha: (depth * lap.front[0]) / (2 * a),
    beta: (depth * lap.front[1]) / (2 * b),
    drift: 0.08 * panel.k,
  };
}
type Path = ReturnType<typeof buildPath>;

/**
 * Where a jet is at time t, and optionally the direction from it toward the middle of its lap. The
 * path is a pure function of time (like the hero's), so contrails need no history.
 */
function pathPosition(path: Path, t: number, out: Vector3, inward?: Vector3) {
  const { lap, r, arc, perimeter, sides } = path;
  let s = (((lap.phase * perimeter + lap.speed * t) % perimeter) + perimeter) % perimeter;
  let x = sides[0].x;
  let y = sides[0].y;
  let nx = 0;
  let ny = -1;
  for (let i = 0; i < 4; i++) {
    const side = sides[i];
    if (s <= side.length) {
      x = side.x + side.dx * s;
      y = side.y + side.dy * s;
      nx = side.nx;
      ny = side.ny;
      break;
    }
    s -= side.length;
    if (s <= arc) {
      const phi = side.from - s / r;
      x = side.cx + r * Math.cos(phi);
      y = side.cy + r * Math.sin(phi);
      nx = -Math.cos(phi);
      ny = -Math.sin(phi);
      break;
    }
    s -= arc;
  }

  // On the leaned plane, plus a slow drift in depth like the hero's gentle altitude changes.
  const drift = path.drift * Math.sin(t * 0.19 + lap.phase * 9);
  out.set(x, y, path.alpha * x + path.beta * y + drift);
  inward?.set(nx, ny, path.alpha * nx + path.beta * ny).normalize();
  return out;
}

// Per-frame scratch objects, reused so the frame loop never allocates.
const _p = new Vector3();
const _ahead = new Vector3();
const _behind = new Vector3();
const _fwd = new Vector3();
const _inward = new Vector3();
const _normal = new Vector3();
const _up = new Vector3();
const _right = new Vector3();
const _scale = new Vector3();
const _m = new Matrix4();

/** Keeps the panel's plane at PANEL_JETS.pxPerUnit pixels per unit as the canvas resizes. */
function FitCamera() {
  const fittedHeight = useRef(0);
  useFrame((state) => {
    if (fittedHeight.current === state.size.height) return;
    fittedHeight.current = state.size.height;
    const { cameraDistance, pxPerUnit } = PANEL_JETS;
    const camera = state.camera as PerspectiveCamera;
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);
    camera.fov = (2 * Math.atan(state.size.height / 2 / pxPerUnit / cameraDistance) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  });
  return null;
}

/** The hero's jets (jet.ts), trailing contrails, flying LAPS around an invisible stand-in for the panel. */
function Jets() {
  const n = LAPS.length;
  const mesh = useRef<InstancedMesh>(null);
  const jetMaterial = useRef<ShaderMaterial>(null);
  const contrailMaterial = useRef<ShaderMaterial>(null);
  const clock = useRef(0);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const { panel, paths } = useMemo(() => {
    const size = panelSize(width, height);
    return { panel: size, paths: LAPS.map((lap) => buildPath(lap, size)) };
  }, [width, height]);

  const jet = useMemo(() => buildJet(), []);
  useEffect(() => () => jet.dispose(), [jet]);

  const contrails = useMemo(() => {
    const geometry = new BufferGeometry();
    const position = new BufferAttribute(new Float32Array(n * CONTRAIL.points * 3), 3);
    position.setUsage(DynamicDrawUsage);
    const age = new Float32Array(n * CONTRAIL.points);
    for (let i = 0; i < age.length; i++) age[i] = (i % CONTRAIL.points) / (CONTRAIL.points - 1);
    geometry.setAttribute("position", position);
    geometry.setAttribute("aAge", new BufferAttribute(age, 1));
    return geometry;
  }, [n]);
  useEffect(() => () => contrails.dispose(), [contrails]);

  // The same material as the hero's jets: the scene's lights, sky and haze (rendered straight to the
  // screen here, so the shared uniforms dither).
  const jetUniforms = useMemo(
    () => ({
      ...createSharedUniforms(1),
      uBase: { value: new Color(PALETTE.cube) },
      uKeyDir: { value: lightDir(LIGHTS.key) },
      uKeyColor: { value: new Color(PALETTE.keyLight) },
      uRimDir: { value: lightDir(LIGHTS.rim) },
      uCyan: { value: new Color(PALETTE.cyan) },
      uMagenta: { value: new Color(PALETTE.magenta) },
      uFillPos: { value: new Vector3(...LIGHTS.fill) },
      uRim: { value: AIRCRAFT.rim },
    }),
    [],
  );
  // Near-white vapor, a breath of the hero trails' cyan.
  const contrailUniforms = useMemo(
    () => ({
      uPixelRatio: { value: 1 },
      uIntensity: { value: CONTRAIL.intensity },
      uColor: { value: new Color(PALETTE.cyan).lerp(new Color("#ffffff"), 0.8) },
    }),
    [],
  );

  useEffect(() => {
    mesh.current?.instanceMatrix.setUsage(DynamicDrawUsage);
  }, []);

  useFrame((state, delta) => {
    const jets = mesh.current;
    if (!jets) return;
    clock.current += Math.min(delta, 0.1);
    const t = clock.current;
    // Moves the grid reflected in the jets, as in the hero (uTime is shared by the material's uniforms).
    if (jetMaterial.current) jetMaterial.current.uniforms.uTime.value = t;
    const length = PANEL_JETS.length * (0.8 + 0.2 * panel.k);

    for (let i = 0; i < n; i++) {
      const path = paths[i];
      pathPosition(path, t, _p, _inward);
      pathPosition(path, t + LOOK, _ahead);
      pathPosition(path, t - LOOK, _behind);
      _normal.set(-path.alpha, -path.beta, 1).normalize();

      // Nose along the direction of travel; canopy toward the middle of the lap, as if circling
      // the panel to look at it, rolled toward the viewer so the jet reads in 3D, not as a profile.
      const roll = path.lap.roll;
      _fwd.subVectors(_ahead, _behind).normalize();
      _up.copy(_inward).multiplyScalar(Math.cos(roll)).addScaledVector(_normal, Math.sin(roll));
      _up.addScaledVector(_fwd, -_up.dot(_fwd)).normalize();
      _right.crossVectors(_up, _fwd).normalize();
      _up.crossVectors(_fwd, _right);

      _m.makeBasis(_right, _up, _fwd).scale(_scale.setScalar(length)).setPosition(_p);
      jets.setMatrixAt(i, _m);
    }
    jets.instanceMatrix.needsUpdate = true;

    if (contrailMaterial.current) {
      contrailMaterial.current.uniforms.uPixelRatio.value = state.viewport.dpr;
      const position = contrails.getAttribute("position") as BufferAttribute;
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < CONTRAIL.points; k++) {
          const age = k / (CONTRAIL.points - 1);
          pathPosition(paths[i], t - age * CONTRAIL.seconds, _p);
          position.setXYZ(i * CONTRAIL.points + k, _p.x, _p.y, _p.z);
        }
      }
      position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* The panel, in depth only: it hides the jets and contrails while they pass behind it. */}
      <mesh renderOrder={-1} scale={[2 * panel.w, 2 * panel.h, 1]}>
        <planeGeometry />
        <meshBasicMaterial colorWrite={false} />
      </mesh>
      <instancedMesh ref={mesh} args={[jet, undefined, n]} frustumCulled={false}>
        <shaderMaterial
          ref={jetMaterial}
          vertexShader={jetVertex}
          fragmentShader={jetFragment}
          uniforms={jetUniforms}
          side={DoubleSide}
        />
      </instancedMesh>
      <points geometry={contrails} renderOrder={11} frustumCulled={false}>
        <shaderMaterial
          ref={contrailMaterial}
          vertexShader={contrailVertex}
          fragmentShader={contrailFragment}
          uniforms={contrailUniforms}
          transparent
          depthWrite={false}
          blending={CustomBlending}
          blendEquation={AddEquation}
          blendSrc={OneFactor}
          blendDst={OneFactor}
          blendSrcAlpha={ZeroFactor}
          blendDstAlpha={OneFactor}
        />
      </points>
    </>
  );
}

/**
 * The jets' WebGL layer over the contact panel: transparent, so the page shows through everywhere
 * but the jets. Loaded on the client only (site/Jets.tsx), and stopped while it's out of view.
 */
export default function JetsCanvas({ active }: { active: boolean }) {
  return (
    <Canvas
      // R3F gives its container pointer-events: auto (for its own event system), which would
      // override the wrapper's none and swallow every click on the panel beneath. The jets are
      // decoration only, so they take no pointer events at all.
      style={{ pointerEvents: "none" }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, stencil: false, powerPreference: "high-performance" }}
      camera={{ near: 0.1, far: 100, position: [0, 0, PANEL_JETS.cameraDistance] }}
    >
      <FitCamera />
      <Jets />
    </Canvas>
  );
}
