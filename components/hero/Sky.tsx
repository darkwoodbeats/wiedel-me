import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  ShaderMaterial,
  Vector3,
} from "three";
import { PALETTE, SCENE } from "./config";
import { COMMON_GLSL, OUTPUT_GLSL } from "./glsl";
import { mulberry32 } from "./hooks";
import { OBJECT_CENTER, type SharedUniforms } from "./uniforms";

const domeVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const domeFragment = /* glsl */ `
${COMMON_GLSL}
uniform vec3 uHaloDir;
uniform vec3 uHaloColor;
uniform float uHaloSize;
uniform float uHaloIntensity;
uniform float uStreaks;
varying vec3 vDir;

float band(float y, float center, float sharpness) {
  float d = (y - center) * sharpness;
  return exp(-d * d);
}

void main() {
  vec3 dir = normalize(vDir);
  vec3 col = skyRadiance(dir);

  // Soft atmospheric backlight behind the object, so the dark cube reads as a silhouette.
  float ang2 = 2.0 * (1.0 - dot(dir, uHaloDir));
  col += uHaloColor * uHaloIntensity * exp(-ang2 / (uHaloSize * uHaloSize));

  // Faint horizontal light streaks just above the horizon.
  float s = band(dir.y, 0.036, 700.0) * 0.5 + band(dir.y, 0.066, 900.0) * 0.28 + band(dir.y, 0.108, 1100.0) * 0.14;
  float drift = 0.55 + 0.45 * sin(dir.x * 2.3 + dir.z * 1.7 + uTime * 0.04);
  col += uHorizon * s * drift * uStreaks;

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

const starVertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aBright;
uniform float uTime;
uniform float uPixelRatio;
varying float vAlpha;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.72 + 0.28 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 40.0);
  float y = normalize(position).y;
  vAlpha = aBright * twinkle * smoothstep(0.03, 0.28, y);
  gl_PointSize = aSize * uPixelRatio;
}
`;

const starFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * a * a * vAlpha, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function buildStars(count: number) {
  const rand = mulberry32(1987);
  const positions = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const bright = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const y = 0.02 + Math.pow(rand(), 0.85) * 0.98;
    const theta = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    positions.set([r * Math.cos(theta) * 400, y * 400, r * Math.sin(theta) * 400], i * 3);
    const b = Math.pow(rand(), 5);
    size[i] = 1.1 + b * 2.4;
    bright[i] = 0.12 + b * 0.9;
    phase[i] = rand();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(size, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(phase, 1));
  geometry.setAttribute("aBright", new BufferAttribute(bright, 1));
  return geometry;
}

interface SkyProps {
  shared: SharedUniforms;
  clockRef: RefObject<number>;
  starCount: number;
}

/** Gradient sky, horizon glow, halo and stars. Centered on the camera so it always sits at infinity. */
export function Sky({ shared, clockRef, starCount }: SkyProps) {
  const group = useRef<Group>(null);
  const dome = useRef<ShaderMaterial>(null);
  const starMaterial = useRef<ShaderMaterial>(null);

  const domeUniforms = useMemo(
    () => ({
      ...shared,
      uHaloDir: { value: new Vector3(0, 0, -1) },
      uHaloColor: { value: new Color(PALETTE.halo) },
      uHaloSize: { value: SCENE.halo.size },
      uHaloIntensity: { value: SCENE.halo.intensity },
      uStreaks: { value: SCENE.streaks },
    }),
    [shared],
  );

  const starUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new Color("#dcd6ff") },
    }),
    [],
  );

  const stars = useMemo(() => buildStars(starCount), [starCount]);
  useEffect(() => () => stars.dispose(), [stars]);

  useFrame((state) => {
    if (!group.current || !dome.current || !starMaterial.current) return;
    group.current.position.copy(state.camera.position);
    dome.current.uniforms.uTime.value = clockRef.current;
    dome.current.uniforms.uHaloDir.value.copy(OBJECT_CENTER).sub(state.camera.position).normalize();
    starMaterial.current.uniforms.uTime.value = clockRef.current;
    starMaterial.current.uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <group ref={group}>
      <mesh renderOrder={-100} frustumCulled={false}>
        <sphereGeometry args={[50, 48, 24]} />
        <shaderMaterial
          ref={dome}
          vertexShader={domeVertex}
          fragmentShader={domeFragment}
          uniforms={domeUniforms}
          side={BackSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <points geometry={stars} renderOrder={-90} frustumCulled={false}>
        <shaderMaterial
          ref={starMaterial}
          vertexShader={starVertex}
          fragmentShader={starFragment}
          uniforms={starUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
