import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";
import { GEOMETRY, PALETTE } from "./config";
import { mulberry32 } from "./hooks";
import { OBJECT_CENTER, type SharedUniforms } from "./uniforms";

const HEIGHT = 9;

const vertex = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uFloorY;
uniform float uPixelRatio;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uHeight;
varying float vAlpha;
varying float vTint;

void main() {
  vec3 p = position;
  p.y = uFloorY + mod(p.y - uFloorY + uTime * (0.03 + aSeed.x * 0.05), uHeight);
  p.x += sin(uTime * 0.11 + aSeed.y * 6.2831) * 0.35;
  p.z += cos(uTime * 0.09 + aSeed.z * 6.2831) * 0.35;

  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = (1.0 + aSeed.w * 2.0) * uPixelRatio * clamp(9.0 / depth, 0.5, 2.5);

  float h = (p.y - uFloorY) / uHeight;
  float fadeY = smoothstep(0.0, 0.15, h) * (1.0 - smoothstep(0.7, 1.0, h));
  // The sphere is sealed, so no dust drifts inside it, and no mote ever crosses the object's silhouette.
  float outside = smoothstep(uRadius * 1.03, uRadius * 1.3, length(p - uCenter));
  vec3 toCenter = uCenter - cameraPosition;
  float centerDist = length(toCenter);
  vec3 rel = p - cameraPosition;
  float along = dot(rel, toCenter) / centerDist;
  float offAxis = length(rel - toCenter * (along / centerDist)) / max(along, 0.1) * centerDist;
  float clearOfObject = smoothstep(uRadius * 1.02, uRadius * 1.4, offAxis);
  vAlpha = (0.12 + 0.45 * aSeed.w) * fadeY * outside * clearOfObject * (1.0 - smoothstep(16.0, 34.0, depth));
  vTint = aSeed.z;
}
`;

const fragment = /* glsl */ `
uniform vec3 uCyan;
uniform vec3 uMagenta;
varying float vAlpha;
varying float vTint;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 c = mix(uMagenta, uCyan, step(0.62, vTint)) * 0.8 + 0.2;
  gl_FragColor = vec4(c * a * a * vAlpha, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function buildDust(count: number) {
  const rand = mulberry32(2014);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    positions.set(
      [(rand() - 0.5) * 22, GEOMETRY.floorY + rand() * HEIGHT, -12 + rand() * 18],
      i * 3,
    );
    seeds.set([rand(), rand(), rand(), Math.pow(rand(), 2)], i * 4);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));
  return geometry;
}

interface DustProps {
  shared: SharedUniforms;
  clockRef: RefObject<number>;
  count: number;
}

/** A sparse field of slow motes. It gives the air depth when the camera moves, and stays barely visible. */
export function Dust({ shared, clockRef, count }: DustProps) {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => buildDust(count), [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: shared.uTime,
      uFloorY: shared.uFloorY,
      uPixelRatio: { value: 1 },
      uCenter: { value: OBJECT_CENTER.clone() },
      uRadius: { value: GEOMETRY.sphereRadius },
      uHeight: { value: HEIGHT },
      uCyan: { value: new Color(PALETTE.cyan) },
      uMagenta: { value: new Color(PALETTE.magenta) },
    }),
    [shared],
  );

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clockRef.current;
    material.current.uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} renderOrder={20} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
