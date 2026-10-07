import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { Color, ShaderMaterial } from "three";
import { GEOMETRY, PALETTE, SCENE } from "./config";
import { COMMON_GLSL, OUTPUT_GLSL } from "./glsl";
import { OBJECT_CENTER, type SharedUniforms } from "./uniforms";

const vertex = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragment = /* glsl */ `
${COMMON_GLSL}
uniform vec3 uGlowCenter;
uniform vec3 uPoolColor;
uniform float uIntensity;
varying vec3 vWorldPos;

void main() {
  vec3 toFrag = vWorldPos - cameraPosition;
  float dist = length(toFrag);
  vec3 dir = toFrag / dist;

  vec2 g = gridCoord(vWorldPos.xz);
  vec2 core = gridLines(g, 1.3);
  vec2 halo = gridLines(g, 7.0);

  // A soft pool of light on the floor beneath the object.
  vec2 d = vWorldPos.xz - uGlowCenter.xz;
  float pool = exp(-dot(d, d) / 28.0);

  float lines = core.x * 0.8 + core.y;
  float glow = max(halo.x, halo.y) * 0.1;
  vec3 col = uGround;
  col += uGridColor * uIntensity * (lines + glow) * (1.0 + pool * 1.2);
  col += uPoolColor * pool * 0.045;

  // Lines right under the lens are huge; tone them down so they never compete with the object.
  col *= mix(0.3, 1.0, smoothstep(2.5, 12.0, dist));

  // Distance fog that dissolves into the exact color of the horizon behind it.
  float fog = 1.0 - exp(-pow(dist / 40.0, 1.45));
  col = mix(col, skyRadiance(dir), fog);

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

/** The outrun floor: one large quad with procedural, anti-aliased grid lines that scroll toward the camera. */
export function RetroGrid({
  shared,
  clockRef,
}: {
  shared: SharedUniforms;
  clockRef: RefObject<number>;
}) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      ...shared,
      uGlowCenter: { value: OBJECT_CENTER.clone() },
      uPoolColor: { value: new Color(PALETTE.magenta).lerp(new Color(PALETTE.cyan), 0.35) },
      uIntensity: { value: SCENE.grid.intensity },
    }),
    [shared],
  );

  // uTime is shared, so this also scrolls the grid reflected in the glass and the cube.
  useFrame(() => {
    if (material.current) material.current.uniforms.uTime.value = clockRef.current;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, GEOMETRY.floorY, -110]} frustumCulled={false}>
      <planeGeometry args={[480, 280]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
