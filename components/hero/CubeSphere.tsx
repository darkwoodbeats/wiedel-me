import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  FileLoader,
  Group,
  Mesh,
  Quaternion,
  Raycaster,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { buildMarkedCube, placeMarks, type MarkedCube } from "./brandMark";
import { BRAND_MARK, CUBE_SIDE, GEOMETRY, LIGHTS, MATERIALS, MOTION, PALETTE } from "./config";
import {
  cubeFragment,
  cubeVertex,
  flareFragment,
  flareVertex,
  recessFragment,
  sphereFragment,
  sphereVertex,
} from "./cubeSphereShaders";
import type { PointerState } from "./hooks";
import { lightDir, type SharedUniforms } from "./uniforms";

const R = GEOMETRY.sphereRadius;
const HALF = CUBE_SIDE / 2;

/** The cube's eight vertices in its local space, each at distance R · vertexReach from the center. */
const CORNERS = [-1, 1].flatMap((x) =>
  [-1, 1].flatMap((y) => [-1, 1].map((z) => new Vector3(x * HALF, y * HALF, z * HALF))),
);

/** Turns the body diagonal (1,1,1) upright so the cube stands on a single corner. */
const STAND_ON_CORNER = new Quaternion().setFromUnitVectors(
  new Vector3(1, 1, 1).normalize(),
  new Vector3(0, 1, 0),
);
const UP = new Vector3(0, 1, 0);

// Per-frame scratch objects, reused so the frame loop never allocates.
const _spin = new Quaternion();
const _tilt = new Quaternion();
const _axis = new Vector3();
const _raycaster = new Raycaster();
const _bounds = new Sphere();
const _ndc = new Vector2();

/** The cube's orientation at time t: spinning about its vertical diagonal while that diagonal precesses slowly around a small cone. */
function orientCube(t: number, out: Quaternion) {
  _spin.setFromAxisAngle(UP, t * MOTION.cubeSpin);
  _axis.set(Math.cos(t * MOTION.cubeWobbleSpeed), 0, Math.sin(t * MOTION.cubeWobbleSpeed));
  _tilt.setFromAxisAngle(_axis, MOTION.cubeWobble);
  return out.copy(_tilt).multiply(_spin).multiply(STAND_ON_CORNER);
}

/**
 * The brand mark goes on all three sky-facing faces, each upright when its face points most
 * directly at the viewer (the camera sits in front of the object and a little below it).
 */
const MARKS = placeMarks(orientCube, MOTION.startTime, new Vector3(0, -0.2, 1).normalize());

interface CubeSphereProps {
  shared: SharedUniforms;
  clockRef: RefObject<number>;
  segments: [number, number];
  pointerRef: RefObject<PointerState>;
}

/**
 * The anomaly: a dark cube inscribed in a thin glass sphere.
 * The cube stands on one corner and turns slowly about its vertical diagonal,
 * so its top and bottom vertices stay pinned to the sphere's poles and the
 * other six sweep past its outline.
 */
export function CubeSphere({ shared, clockRef, segments, pointerRef }: CubeSphereProps) {
  const assembly = useRef<Group>(null);
  const cube = useRef<Mesh>(null);
  const sphere = useRef<Mesh>(null);
  const sphereMaterial = useRef<ShaderMaterial>(null);
  const flareMaterial = useRef<ShaderMaterial>(null);

  const sphereUniforms = useMemo(
    () => ({
      ...shared,
      uCenter: { value: new Vector3() },
      uContacts: { value: CORNERS.map(() => new Vector3()) },
      uHover: { value: 0 },
      uCyan: { value: new Color(PALETTE.cyan) },
      uMagenta: { value: new Color(PALETTE.magenta) },
      uRimAxis: { value: new Vector3(-0.8, 0.55, 0.25).normalize() },
      uKeyDir: { value: lightDir(LIGHTS.key) },
      uKeyColor: { value: new Color(PALETTE.keyLight) },
      uRim: { value: MATERIALS.sphere.rim },
      uReflect: { value: MATERIALS.sphere.reflection },
      uContact: { value: MATERIALS.sphere.contact },
      uBaseAlpha: { value: MATERIALS.sphere.baseAlpha },
    }),
    [shared],
  );

  const cubeUniforms = useMemo(
    () => ({
      ...shared,
      uHalf: { value: HALF },
      uBase: { value: new Color(PALETTE.cube) },
      uReflect: { value: MATERIALS.cube.reflection },
      uEdgeSheen: { value: MATERIALS.cube.edgeSheen },
      uCornerGlow: { value: MATERIALS.cube.cornerGlow },
      uHover: sphereUniforms.uHover,
      uCenter: sphereUniforms.uCenter,
      uKeyDir: sphereUniforms.uKeyDir,
      uKeyColor: sphereUniforms.uKeyColor,
      uRimDir: { value: lightDir(LIGHTS.rim) },
      uRimColor: sphereUniforms.uCyan,
      uFrontPos: { value: new Vector3(...LIGHTS.front) },
      uFillPos: { value: new Vector3(...LIGHTS.fill) },
      uFillColor: sphereUniforms.uMagenta,
    }),
    [shared, sphereUniforms],
  );

  const flareUniforms = useMemo(
    () => ({
      uContacts: sphereUniforms.uContacts,
      uCenter: sphereUniforms.uCenter,
      uHover: sphereUniforms.uHover,
      uRadius: { value: R },
      uColor: { value: new Color(PALETTE.cyan).lerp(new Color("#ffffff"), 0.35) },
      uIntensity: { value: MATERIALS.contactFlare },
      uPixelRatio: { value: 1 },
    }),
    [sphereUniforms],
  );
  const flareGeometry = useMemo(() => {
    // Eight placeholder vertices. The shader places each one on its contact point via gl_VertexID.
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(CORNERS.length * 3), 3));
    return g;
  }, []);
  useEffect(() => () => flareGeometry.dispose(), [flareGeometry]);

  const recessUniforms = useMemo(
    () => ({
      ...cubeUniforms,
      uMarkDepth: { value: BRAND_MARK.depth },
    }),
    [cubeUniforms],
  );

  // The brand marks load from their SVG, then replace the plain box. Without it, the cube stays plain.
  const [marked, setMarked] = useState<MarkedCube | null>(null);
  useEffect(() => {
    let cancelled = false;
    let built: MarkedCube | null = null;
    new FileLoader().load(
      BRAND_MARK.src,
      (text) => {
        if (cancelled) return;
        // The mark's fill is currentColor (on the site it inherits the CSS colour). It has no
        // bearing on the geometry, and three's colour parser would warn about it.
        const svg = new SVGLoader().parse(String(text).replaceAll("currentColor", "#000"));
        built = buildMarkedCube(svg, {
          marks: MARKS,
          side: CUBE_SIDE,
          width: BRAND_MARK.width,
          depth: BRAND_MARK.depth,
        });
        setMarked(built);
      },
      undefined,
      () => {},
    );
    return () => {
      cancelled = true;
      built?.cube.dispose();
      built?.recess.dispose();
    };
  }, []);

  const hover = useRef(0);

  useFrame((state, delta) => {
    const group = assembly.current;
    const cubeMesh = cube.current;
    const sphereMesh = sphere.current;
    const glass = sphereMaterial.current;
    if (!group || !cubeMesh || !sphereMesh || !glass) return;
    const t = clockRef.current;
    const u = glass.uniforms;
    u.uTime.value = t;

    // The whole assembly floats very slightly.
    group.position.set(
      Math.sin(t * MOTION.floatSpeed * 0.62) * MOTION.floatAmplitude * 0.5,
      Math.sin(t * MOTION.floatSpeed) * MOTION.floatAmplitude,
      0,
    );
    group.rotation.z = Math.sin(t * 0.17) * 0.012;

    orientCube(t, cubeMesh.quaternion);

    // Sphere: an almost imperceptible independent drift.
    sphereMesh.rotation.set(0.3, t * MOTION.sphereSpin, 0.1);

    // Update the contact directions: each cube vertex seen from the sphere's center.
    group.updateMatrixWorld(true);
    const center: Vector3 = u.uCenter.value.setFromMatrixPosition(group.matrixWorld);
    const contacts: Vector3[] = u.uContacts.value;
    for (let i = 0; i < CORNERS.length; i++) {
      contacts[i].copy(CORNERS[i]).applyMatrix4(cubeMesh.matrixWorld).sub(center).normalize();
    }

    // Hover: an analytic ray-sphere test, with no mesh raycasting. uHover is shared with the cube.
    const p = pointerRef.current;
    let target = 0;
    if (p.active) {
      _raycaster.setFromCamera(_ndc.set(p.x, p.y), state.camera);
      target = _raycaster.ray.intersectsSphere(_bounds.set(center, R)) ? 1 : 0;
    }
    hover.current += (target - hover.current) * (1 - Math.exp(-delta * MOTION.hoverEase));
    u.uHover.value = hover.current;
    if (flareMaterial.current)
      flareMaterial.current.uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <group ref={assembly}>
      <mesh ref={cube}>
        {marked ? (
          <primitive object={marked.cube} attach="geometry" />
        ) : (
          <boxGeometry args={[CUBE_SIDE, CUBE_SIDE, CUBE_SIDE]} />
        )}
        <shaderMaterial
          vertexShader={cubeVertex}
          fragmentShader={cubeFragment}
          uniforms={cubeUniforms}
        />
        {/* The pocket behind the cut-out mark. As a child of the cube, it turns with it. */}
        {marked && (
          <mesh geometry={marked.recess}>
            <shaderMaterial
              vertexShader={cubeVertex}
              fragmentShader={recessFragment}
              uniforms={recessUniforms}
              side={DoubleSide}
            />
          </mesh>
        )}
      </mesh>
      <mesh ref={sphere} renderOrder={10}>
        <sphereGeometry args={[R, segments[0], segments[1]]} />
        <shaderMaterial
          ref={sphereMaterial}
          vertexShader={sphereVertex}
          fragmentShader={sphereFragment}
          uniforms={sphereUniforms}
          transparent
          premultipliedAlpha
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <points geometry={flareGeometry} renderOrder={12} frustumCulled={false}>
        <shaderMaterial
          ref={flareMaterial}
          vertexShader={flareVertex}
          fragmentShader={flareFragment}
          uniforms={flareUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
