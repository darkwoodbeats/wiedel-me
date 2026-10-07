import { Color, Vector3 } from "three";
import { GEOMETRY, PALETTE, SCENE } from "./config";

/**
 * Uniforms shared by every material. Each material spreads this object into
 * its own uniforms, so all of them hold the same { value } objects: setting
 * uTime once per frame moves the grid, the reflections and the fog together.
 *
 * @param dither 1 when the canvas renders straight to 8-bit output (no post-processing).
 */
export function createSharedUniforms(dither: number) {
  return {
    uTime: { value: 0 },
    uFloorY: { value: GEOMETRY.floorY },
    uGridCell: { value: SCENE.grid.cellSize },
    uGridSpeed: { value: SCENE.grid.speed },
    uSkyTop: { value: new Color(PALETTE.skyTop) },
    uSkyMid: { value: new Color(PALETTE.skyMid) },
    uSkyLow: { value: new Color(PALETTE.skyLow) },
    uHorizon: { value: new Color(PALETTE.horizon) },
    uHorizonCore: { value: new Color(PALETTE.horizonCore) },
    uHorizonGlow: { value: SCENE.horizonGlow },
    /** World direction the horizon glow is centered on: straight "behind" the object as seen from the camera. */
    uGlowFocus: { value: new Vector3(0, 0, -1) },
    uGround: { value: new Color(PALETTE.ground) },
    uGridColor: { value: new Color(PALETTE.grid) },
    uDither: { value: dither },
  };
}

export type SharedUniforms = ReturnType<typeof createSharedUniforms>;

export const lightDir = (d: readonly [number, number, number]) => new Vector3(...d).normalize();

/** Where the object sits in the world. The camera frames this point. */
export const OBJECT_CENTER = new Vector3(0, 0, 0);
