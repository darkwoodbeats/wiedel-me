/**
 * Every visual setting for the hero lives in this file.
 * Colors are sRGB hex strings. The scene converts them to linear space.
 * Intensities above 1 feed the bloom pass.
 */

export const GEOMETRY = {
  /** Sphere radius in world units. The camera frames everything around it. */
  sphereRadius: 1.5,
  /**
   * How far the cube's vertices reach toward the sphere, from 0 to 1.
   * At 1 they sit exactly on the surface. A hair under 1 stops them poking
   * through the flat facets of the sphere's mesh.
   */
  vertexReach: 0.996,
  /** World-space height of the grid floor. The object hovers above it. */
  floorY: -3.1,
};

/**
 * Cube side length. The half-diagonal of a cube with side s is s·√3/2.
 * Setting that equal to R gives s = 2R/√3, which puts all eight vertices on the sphere.
 */
export const CUBE_SIDE = (2 * GEOMETRY.sphereRadius * GEOMETRY.vertexReach) / Math.sqrt(3);

export const PALETTE = {
  skyTop: "#020106",
  skyMid: "#0a0418",
  skyLow: "#1c0729",
  horizon: "#ff2a8c",
  horizonCore: "#ffc2ea",
  ground: "#050209",
  grid: "#d8228f",
  cyan: "#38e8ff",
  magenta: "#ff3cb0",
  halo: "#4a1670",
  cube: "#141419",
  mountain: "#07030d",
  mountainLine: "#9c2a9a",
  keyLight: "#d9e2ff",
};

export const LIGHTS = {
  /**
   * Directional lights, given as world-space directions from the surface toward the light.
   * key: cool light from above-left and slightly behind. It puts a glint near the glass outline and rims the cube.
   * rim: cyan edge light from the left.
   */
  key: [-0.37, 0.57, -0.73] as const,
  rim: [-0.95, 0.2, -0.45] as const,
  /**
   * Point lights (world positions). Their direction changes across each face, so faces get soft gradients.
   * front: dim, cool light that separates the cube's faces by a few shades.
   * fill: magenta bounce from the horizon glow, low on the right.
   */
  front: [-5, 4, 8] as const,
  fill: [7, -4, 3] as const,
};

export const MATERIALS = {
  sphere: {
    /** Overall strength of the cyan/magenta Fresnel rim. */
    rim: 0.55,
    /** Strength of the scene reflected in the glass. */
    reflection: 0.62,
    /** Glow where each cube vertex meets the glass. Keep it low. */
    contact: 0.45,
    /** How much the glass darkens what is behind it (0 = invisible). */
    baseAlpha: 0.035,
  },
  cube: {
    /** Glossy reflection strength. Higher values make the cube look more like chrome. */
    reflection: 0.7,
    /** Light caught by the cube's micro-bevelled edges. */
    edgeSheen: 0.16,
    /** Faint glow at the corners where they touch the glass. */
    cornerGlow: 0.35,
  },
  /** Small flares that appear where a vertex meets the sphere's outline. 0 turns them off. */
  contactFlare: 0.9,
};

export const SCENE = {
  horizonGlow: 1.0,
  /** Soft backlight behind the object that lets the dark cube read as a silhouette. */
  halo: { intensity: 0.55, size: 0.3 },
  /** Faint horizontal light streaks above the horizon. */
  streaks: 0.5,
  grid: { cellSize: 1.25, speed: 0.55, intensity: 0.5 },
};

export const MOTION = {
  /** Scene time when the page opens. It sets the first (and reduced-motion) pose. */
  startTime: 14,
  /** The cube stands on one corner and spins about its vertical body diagonal (rad/s). */
  cubeSpin: 0.085,
  /** Tilt of that diagonal (radians) and how fast the tilt precesses (rad/s). */
  cubeWobble: 0.11,
  cubeWobbleSpeed: 0.045,
  /** The sphere turns much more slowly and about its own axis. */
  sphereSpin: 0.012,
  /** Slow floating of the whole assembly. */
  floatAmplitude: 0.055,
  floatSpeed: 0.33,
  /** Hover glow easing (per second). */
  hoverEase: 3.5,
};

export const CAMERA = {
  /** Vertical field of view in degrees on landscape screens. */
  fov: 34,
  /**
   * Portrait screens widen the lens up to this FOV (reached at aspect ratio 0.5).
   * Otherwise the narrow view pushes the camera far back, and the horizon glow swamps the small sphere.
   */
  portraitFov: 48,
  /** Fraction of the layout's object slot that the sphere's diameter fills. */
  slotFill: 0.86,
  /** Distance of the horizon below the sphere's center, in sphere radii (bigger = lower). */
  horizonBelow: 1.18,
  /** Lowest camera height above the floor, in world units. */
  minHeight: 0.9,
  /** Pointer parallax range (radians). */
  parallax: { yaw: 0.085, pitch: 0.024 },
  /** Always-on slow cinematic drift (radians). */
  drift: { yaw: 0.018, pitch: 0.006 },
  /** Extra automatic drift on touch devices, in place of pointer parallax (radians). */
  touchDrift: { yaw: 0.05, pitch: 0.014 },
  /** Scrolling the hero out of view dollies in (fraction of the distance) and climbs (radians). */
  scroll: { dolly: 0.16, rise: 0.05 },
  /** Easing rate for pointer and scroll input (per second). */
  damping: 2.2,
};

/**
 * The brand mark machined into the cube (see brandMark.ts). It goes on each of the three
 * sky-facing faces, upright when that face points most directly at the viewer.
 */
export const BRAND_MARK = {
  /** Local copy of the wiedel.me header mark. */
  src: "/brand/wiedel-mark.svg",
  /** Width of the mark as a fraction of the cube face. */
  width: 0.3,
  /**
   * How deep it is cut into the face, in world units (the cube's side is ~1.73). Keep it shallow:
   * the mark's strokes are only ~0.06 wide, and a deeper cut makes the floor visibly slide under the
   * outline as the cube turns, which reads as the mark drifting.
   */
  depth: 0.008,
};

/** The same jets lapping the contact panel further down the page (JetsCanvas.tsx, laps there). */
export const PANEL_JETS = {
  /** How far the jets' canvas reaches past the panel on each side, as fractions of its width and height. */
  margin: { x: 0.24, y: 0.3 },
  /** Screen pixels per world unit, at the panel's plane. */
  pxPerUnit: 100,
  /** Camera distance from the panel's plane, in world units. Nearer gives stronger perspective. */
  cameraDistance: 12,
  /** Nose-to-tail length in world units: 0.24 is 24px at the panel's plane (the hero's are ~17px). */
  length: 0.24,
};

/** The small aircraft circling the object (see Aircraft.tsx for their flight paths). */
export const AIRCRAFT = {
  /**
   * Nose-to-tail length in world units. The sphere's diameter is 3, so 0.12 is 4% of it:
   * about 17px on a laptop, still enough to read the swept wings and twin tails.
   */
  length: 0.12,
  /** Bank angle into the turn, in radians. */
  bank: 0.32,
  /** Edge light that keeps the tiny dark silhouettes legible against the dark sky. */
  rim: 0.24,
  /** Vapor trail: seconds of flight path it covers, and its brightness (0 = off). */
  trailSeconds: 1.8,
  trail: 0.16,
  /** Orbits pull in on portrait screens, where there is little room either side of the sphere. */
  portraitScale: 0.88,
};

export const EFFECTS = {
  bloom: { intensity: 0.85, threshold: 0.42, smoothing: 0.28, radius: 0.72 },
  chromaticAberration: 0.0009,
  grain: 0.22,
  vignette: { offset: 0.28, darkness: 0.62 },
};

export type QualityTier = "high" | "medium" | "low";

export interface QualitySettings {
  /** Device pixel ratio clamp [min, max]. */
  dpr: [number, number];
  /** MSAA samples on the post-processing buffer. */
  msaa: number;
  sphereSegments: [number, number];
  stars: number;
  dust: number;
  chromatic: boolean;
  bloomLevels: number;
  /** false = no post-processing at all (last-resort fallback). */
  effects: boolean;
  /**
   * Aircraft circling the object, and whether they leave vapor trails. Three keeps the scene calm;
   * Aircraft.tsx defines five flight paths, flown in priority order, if you ever want more.
   */
  aircraft: number;
  aircraftTrails: boolean;
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  high: {
    dpr: [1, 1.75],
    msaa: 4,
    sphereSegments: [128, 96],
    stars: 1400,
    dust: 140,
    chromatic: true,
    bloomLevels: 8,
    effects: true,
    aircraft: 3,
    aircraftTrails: true,
  },
  medium: {
    dpr: [1, 1.5],
    msaa: 2,
    sphereSegments: [96, 72],
    stars: 900,
    dust: 90,
    chromatic: true,
    bloomLevels: 7,
    effects: true,
    aircraft: 3,
    aircraftTrails: true,
  },
  low: {
    dpr: [1, 1.5],
    msaa: 0,
    sphereSegments: [64, 48],
    stars: 450,
    dust: 40,
    chromatic: false,
    bloomLevels: 6,
    effects: true,
    aircraft: 3,
    aircraftTrails: false,
  },
};
