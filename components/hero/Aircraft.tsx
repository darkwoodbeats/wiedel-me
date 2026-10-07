import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { AIRCRAFT, GEOMETRY, LIGHTS, PALETTE } from "./config";
import { buildJet, jetFragment, jetVertex, trailFragment, trailVertex } from "./jet";
import { OBJECT_CENTER, lightDir, type SharedUniforms } from "./uniforms";

const R = GEOMETRY.sphereRadius;
const TRAIL_POINTS = 60;
/** Seconds either side of "now" used to find each aircraft's heading and turn. */
const LOOK = 0.08;

/**
 * One aircraft's flight path around the object. Distances are in sphere radii, angles in radians.
 * Each path is an ellipse in its own tilted plane, gently perturbed so no two laps are identical.
 */
interface Orbit {
  /** Ellipse semi-axes. */
  a: number;
  b: number;
  /** Inclination of the orbit plane, and the heading it tilts toward. */
  tilt: number;
  node: number;
  /** Orbit centre raised (+) or lowered (-), and pushed back from the object for a distant plane. */
  lift: number;
  depth?: number;
  /** Angular speed in rad/s; the sign sets the direction of travel. */
  speed: number;
  phase: number;
  /** Now and then, briefly climb this far (a short bump, not a steady wave). */
  climb?: { height: number; rate: number; phase: number };
  /** Now and then, swing out this much wider for a closer look from further off. */
  widen?: { amount: number; rate: number; phase: number };
}

/** In priority order: lower quality tiers fly the first 3 or 4. */
const ORBITS: Orbit[] = [
  // A near-level patrol, just outside the glass.
  { a: 1.45, b: 1.32, tilt: 0.1, node: 0.3, lift: 0.1, speed: 0.105, phase: 1.1 },
  // A steeper, inclined circuit flown the other way.
  {
    a: 1.62,
    b: 1.42,
    tilt: 0.42,
    node: 0.9,
    lift: -0.05,
    speed: -0.085,
    phase: 2.2,
    climb: { height: 0.22, rate: 0.07, phase: 0.5 },
  },
  // A high orbit above the object, the quickest of the group, with the odd brief climb.
  {
    a: 1.34,
    b: 1.26,
    tilt: 0.18,
    node: -0.6,
    lift: 0.62,
    speed: 0.12,
    phase: 4.4,
    climb: { height: 0.3, rate: 0.09, phase: 2.6 },
  },
  // A low, slow, wider investigative pass that occasionally swings further out.
  {
    a: 1.7,
    b: 1.45,
    tilt: -0.16,
    node: 1.9,
    lift: -0.4,
    speed: -0.068,
    phase: 0.4,
    widen: { amount: 0.2, rate: 0.05, phase: 2.0 },
  },
  // A distant, even slower orbit well behind the object.
  { a: 2.0, b: 1.6, tilt: 0.12, node: -1.2, lift: 0.95, depth: 2.6, speed: 0.05, phase: 3.3 },
];

interface Flight extends Orbit {
  /** Rotates the orbit plane into place (tilt about X, then node about Y). */
  frame: Quaternion;
  /** The orbit plane's normal: the aircraft's "up" before it banks. */
  normal: Vector3;
}

const FLIGHTS: Flight[] = ORBITS.map((o) => {
  const frame = new Quaternion().setFromEuler(new Euler(o.tilt, o.node, 0, "YXZ"));
  return { ...o, frame, normal: new Vector3(0, 1, 0).applyQuaternion(frame) };
});

/** Where an aircraft is at time t. The path is a pure function of time, so trails need no history. */
function flightPosition(f: Flight, t: number, spread: number, out: Vector3) {
  // Speed breathes a little, so laps never line up with each other.
  const theta = f.phase + f.speed * t + 0.12 * Math.sin(t * 0.11 + f.phase * 3);
  let r = 1 + 0.03 * Math.sin(t * 0.07 + f.phase * 5);
  if (f.widen) {
    r += f.widen.amount * Math.pow(0.5 + 0.5 * Math.sin(t * f.widen.rate + f.widen.phase), 4);
  }
  let y = 0.035 * Math.sin(t * 0.19 + f.phase * 2);
  if (f.climb) {
    y += f.climb.height * Math.pow(Math.max(Math.sin(t * f.climb.rate + f.climb.phase), 0), 6);
  }
  out.set(Math.cos(theta) * f.a * r, y, Math.sin(theta) * f.b * r).applyQuaternion(f.frame);
  out.y += f.lift;
  out.z -= f.depth ?? 0;
  return out.multiplyScalar(R * spread).add(OBJECT_CENTER);
}


// Per-frame scratch objects, reused so the frame loop never allocates.
const _p = new Vector3();
const _ahead = new Vector3();
const _behind = new Vector3();
const _fwd = new Vector3();
const _inward = new Vector3();
const _up = new Vector3();
const _right = new Vector3();
const _scale = new Vector3();
const _m = new Matrix4();

interface AircraftProps {
  shared: SharedUniforms;
  clockRef: RefObject<number>;
  count: number;
  trails: boolean;
}

/**
 * A few tiny jets circling the object as if investigating it. All of them share one geometry and
 * one material in a single instanced draw call. They're opaque, so they render before the glass
 * sphere: the glass composites over any aircraft behind it, and an aircraft in front hides the glass
 * through the depth buffer. The cube hides them as they pass behind it.
 */
export function Aircraft({ shared, clockRef, count, trails }: AircraftProps) {
  const n = Math.min(count, FLIGHTS.length);
  const mesh = useRef<InstancedMesh>(null);
  const trailMaterial = useRef<ShaderMaterial>(null);

  const jet = useMemo(() => buildJet(), []);
  useEffect(() => () => jet.dispose(), [jet]);

  const trail = useMemo(() => {
    const geometry = new BufferGeometry();
    const position = new BufferAttribute(new Float32Array(n * TRAIL_POINTS * 3), 3);
    position.setUsage(DynamicDrawUsage);
    const age = new Float32Array(n * TRAIL_POINTS);
    for (let i = 0; i < age.length; i++) age[i] = (i % TRAIL_POINTS) / (TRAIL_POINTS - 1);
    geometry.setAttribute("position", position);
    geometry.setAttribute("aAge", new BufferAttribute(age, 1));
    return geometry;
  }, [n]);
  useEffect(() => () => trail.dispose(), [trail]);

  const jetUniforms = useMemo(
    () => ({
      ...shared,
      uBase: { value: new Color(PALETTE.cube) },
      uKeyDir: { value: lightDir(LIGHTS.key) },
      uKeyColor: { value: new Color(PALETTE.keyLight) },
      uRimDir: { value: lightDir(LIGHTS.rim) },
      uCyan: { value: new Color(PALETTE.cyan) },
      uMagenta: { value: new Color(PALETTE.magenta) },
      uFillPos: { value: new Vector3(...LIGHTS.fill) },
      uRim: { value: AIRCRAFT.rim },
    }),
    [shared],
  );

  const trailUniforms = useMemo(
    () => ({
      uPixelRatio: { value: 1 },
      uIntensity: { value: AIRCRAFT.trail },
      uColor: { value: new Color(PALETTE.cyan).lerp(new Color("#ffffff"), 0.55) },
    }),
    [],
  );

  useEffect(() => {
    mesh.current?.instanceMatrix.setUsage(DynamicDrawUsage);
  }, [n]);

  useFrame((state) => {
    const jets = mesh.current;
    if (!jets) return;
    const t = clockRef.current;
    const spread = state.size.width < state.size.height ? AIRCRAFT.portraitScale : 1;
    const cosBank = Math.cos(AIRCRAFT.bank);
    const sinBank = Math.sin(AIRCRAFT.bank);

    for (let i = 0; i < n; i++) {
      const f = FLIGHTS[i];
      flightPosition(f, t, spread, _p);
      flightPosition(f, t + LOOK, spread, _ahead);
      flightPosition(f, t - LOOK, spread, _behind);

      // Nose along the direction of travel.
      _fwd.subVectors(_ahead, _behind).normalize();
      // Toward the centre of the turn.
      _inward.copy(_ahead).add(_behind).addScaledVector(_p, -2);
      _inward.addScaledVector(_fwd, -_inward.dot(_fwd));
      const turning = _inward.lengthSq() > 1e-12;
      if (turning) _inward.normalize();
      // Wings level with the orbit plane, then banked into the turn.
      _up.copy(f.normal).addScaledVector(_fwd, -f.normal.dot(_fwd)).normalize();
      if (turning) _up.multiplyScalar(cosBank).addScaledVector(_inward, sinBank).normalize();
      _right.crossVectors(_up, _fwd).normalize();
      _up.crossVectors(_fwd, _right);

      _m.makeBasis(_right, _up, _fwd).scale(_scale.setScalar(AIRCRAFT.length)).setPosition(_p);
      jets.setMatrixAt(i, _m);
    }
    jets.instanceMatrix.needsUpdate = true;

    if (trails && trailMaterial.current) {
      trailMaterial.current.uniforms.uPixelRatio.value = state.viewport.dpr;
      const position = trail.getAttribute("position") as BufferAttribute;
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < TRAIL_POINTS; k++) {
          const age = k / (TRAIL_POINTS - 1);
          flightPosition(FLIGHTS[i], t - age * AIRCRAFT.trailSeconds, spread, _p);
          position.setXYZ(i * TRAIL_POINTS + k, _p.x, _p.y, _p.z);
        }
      }
      position.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh key={n} ref={mesh} args={[jet, undefined, n]} frustumCulled={false}>
        <shaderMaterial
          vertexShader={jetVertex}
          fragmentShader={jetFragment}
          uniforms={jetUniforms}
          side={DoubleSide}
        />
      </instancedMesh>
      {trails && (
        <points geometry={trail} renderOrder={11} frustumCulled={false}>
          <shaderMaterial
            ref={trailMaterial}
            vertexShader={trailVertex}
            fragmentShader={trailFragment}
            uniforms={trailUniforms}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      )}
    </>
  );
}
