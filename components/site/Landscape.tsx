import styles from "./Landscape.module.css";

/** The hero's seeded PRNG (hero/hooks.ts), repeated here because that module imports client-only hooks. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

const point = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/**
 * A low-poly ridge drawn like the hero's (Mountains.tsx): ridged value noise, the same seed, and a
 * vector-terrain wireframe of contour rows and columns. It parts in a valley in the middle, where
 * the panel stands, so the peaks rise beside it. Drawn in a 1000 x 100 box whose bottom is the horizon.
 */
function buildRidge() {
  const rand = mulberry32(42);
  const lattice = Array.from({ length: 256 }, rand);
  const noise = (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lattice[i & 255] * (1 - u) + lattice[(i + 1) & 255] * u;
  };
  const ridged = (x: number) => {
    let sum = 0;
    let amp = 0.6;
    let freq = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * (1 - Math.abs(noise(x * freq) * 2 - 1));
      amp *= 0.5;
      freq *= 2.1;
    }
    return sum;
  };

  const count = 64;
  const peaks: [number, number][] = [];
  for (let i = 0; i <= count; i++) {
    const u = i / count;
    const jitter = i > 0 && i < count ? (rand() - 0.5) * (1000 / count) * 0.6 : 0;
    const valley = smoothstep(0.22, 0.46, Math.abs(u - 0.5));
    const height = Math.min(Math.max(0, ridged(u * 11) - 0.32) * valley * 125, 94);
    peaks.push([u * 1000 + jitter, height]);
  }

  const at = (fraction: number) => peaks.map(([x, h]) => point([x, 100 - h * fraction]));
  const ridge = at(1);
  const silhouette = `M0 100 L${ridge.join(" L")} L1000 100 Z`;
  const rows = [0.3, 0.62].map((fraction) => `M${at(fraction).join(" L")}`);
  const columns = peaks.filter(([, h]) => h > 2).map(([x, h]) => `M${point([x, 100])} L${point([x, 100 - h])}`);
  return { silhouette, ridge: `M${ridge.join(" L")}`, wire: [...rows, ...columns].join(" ") };
}

const RIDGE = buildRidge();

/**
 * The hero's world behind and beneath the contact panel: its sky (gradient, halo, stars and the
 * light streaks above the horizon), its mountains, and its grid floor. The panel's glowing foot is
 * the horizon, set by --floor-depth on the section. Static, apart from the floor's CSS animation.
 */
export function Landscape() {
  return (
    <div className={styles.landscape} aria-hidden="true">
      <div className={styles.sky} />
      <svg className={styles.mountains} viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="landscape-rock" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#07030d" />
            <stop offset="0.6" stopColor="#0c0416" />
            <stop offset="1" stopColor="#2a0a32" />
          </linearGradient>
          <linearGradient id="landscape-wire" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#9c2a9a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#9c2a9a" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path d={RIDGE.silhouette} fill="url(#landscape-rock)" />
        <path d={RIDGE.wire} fill="none" stroke="url(#landscape-wire)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={RIDGE.ridge} fill="none" stroke="#c43fc0" strokeOpacity="0.8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={styles.floor} />
    </div>
  );
}
