/**
 * GLSL shared by every material in the scene.
 *
 * The sky, the fog on the grid and mountains, and the reflections on the
 * glass and cube all use the same skyRadiance() and envRadiance() functions.
 * That keeps the reflected horizon and grid in step with the real ones and
 * lets the far grid fade seamlessly into the horizon glow.
 */
export const COMMON_GLSL = /* glsl */ `
uniform float uTime;
uniform float uFloorY;
uniform float uGridCell;
uniform float uGridSpeed;
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyLow;
uniform vec3 uHorizon;
uniform vec3 uHorizonCore;
uniform float uHorizonGlow;
uniform vec3 uGlowFocus;
uniform vec3 uGround;
uniform vec3 uGridColor;
uniform float uDither;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Sky light arriving from a world-space direction (without stars).
// The horizon glow is strongest behind the object (uGlowFocus) and falls off to the sides, like the last light of a sunset.
vec3 skyRadiance(vec3 dir) {
  float y = dir.y;
  float up = max(y, 0.0);
  vec3 col = mix(uSkyLow, uSkyMid, smoothstep(0.0, 0.16, up));
  col = mix(col, uSkyTop, smoothstep(0.12, 0.6, up));
  float along = acos(clamp(dot(normalize(dir.xz + vec2(1e-5, 0.0)), uGlowFocus.xz), -1.0, 1.0));
  float a2 = along * along;
  float wide = mix(0.25, 1.0, exp(-a2 / 0.2));
  float tight = mix(0.06, 1.0, exp(-a2 / 0.09));
  float ay = abs(y);
  col += uHorizon * uHorizonGlow * (0.06 * wide * exp(-ay * 5.0) + 0.42 * tight * exp(-ay * 42.0));
  col += uHorizonCore * uHorizonGlow * tight * 0.9 * exp(-ay * 420.0);
  return col;
}

vec2 gridCoord(vec2 xz) {
  return vec2(xz.x, xz.y - uTime * uGridSpeed) / uGridCell;
}

// Anti-aliased grid lines for coordinates in cell units, with widthPx measured in screen pixels.
// x = lines of constant x (they run toward the horizon), y = lines of constant z (the cross divisions).
// Lines fade out as cells shrink toward pixel size, which prevents moire near the horizon.
vec2 gridLines(vec2 g, float widthPx) {
  vec2 fw = max(fwidth(g), vec2(1e-5));
  vec2 d = abs(fract(g - 0.5) - 0.5) / fw;
  vec2 halfW = vec2(widthPx * 0.5);
  vec2 line = 1.0 - smoothstep(halfW - 0.5, halfW + 0.5, d);
  vec2 lod = 1.0 - smoothstep(0.04, 0.26, fw);
  return line * lod;
}

// What a reflective surface at origin sees along dir: sky above, the neon floor below.
// gridAmount scales the reflected grid lines. This is branch-free so fwidth() stays well defined.
vec3 envRadiance(vec3 origin, vec3 dir, float gridAmount) {
  vec3 sky = skyRadiance(dir);
  float dy = min(dir.y, -1e-3);
  float t = max((uFloorY - origin.y) / dy, 0.0);
  vec2 hit = origin.xz + dir.xz * t;
  vec2 m = gridLines(gridCoord(hit), 1.6);
  vec3 floorCol = uGround + uGridColor * max(m.x, m.y) * 1.3 * gridAmount;
  vec3 ground = mix(floorCol, sky, 1.0 - exp(-t * 0.05));
  return mix(ground, sky, smoothstep(-0.004, 0.004, dir.y));
}
`;

/** Tone mapping, output color space and optional dithering. Put this at the end of each main(). */
export const OUTPUT_GLSL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb += uDither * (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
`;
