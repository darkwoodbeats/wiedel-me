"use client";

import { useEffect, useRef, useState } from "react";
import { CAMERA } from "./config";
import styles from "./OutrunHero.module.css";

type V3 = [number, number, number];

/**
 * The same cube-in-sphere, drawn once as a static SVG for browsers without WebGL.
 * It uses plain math instead of three.js so this file stays tiny.
 */
const DRAWING = (() => {
  // For a unit sphere the inscribed cube's half side is 1/√3, which is also each component of the unit diagonal.
  const h = 1 / Math.sqrt(3);
  const up: V3 = [h, h, h];
  const a: V3 = [1 / Math.SQRT2, -1 / Math.SQRT2, 0];
  const b: V3 = [
    up[1] * a[2] - up[2] * a[1],
    up[2] * a[0] - up[0] * a[2],
    up[0] * a[1] - up[1] * a[0],
  ];
  const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const spin = 0.95;
  const pitch = -0.2;

  // Stand the cube on a corner, spin it about the vertical, then tilt for a slightly low viewpoint.
  const project = (v: V3): V3 => {
    const x = dot(v, a);
    const y = dot(v, up);
    const z = dot(v, b);
    const x2 = x * Math.cos(spin) - z * Math.sin(spin);
    const z2 = x * Math.sin(spin) + z * Math.cos(spin);
    const y3 = y * Math.cos(pitch) - z2 * Math.sin(pitch);
    const z3 = y * Math.sin(pitch) + z2 * Math.cos(pitch);
    return [x2, -y3, z3];
  };

  const faces: { corners: V3[]; normal: V3 }[] = [];
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [-1, 1]) {
      const [u, w] = [0, 1, 2].filter((i) => i !== axis);
      const corners = (
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ] as const
      ).map(([cu, cw]) => {
        const v: V3 = [0, 0, 0];
        v[axis] = sign * h;
        v[u] = cu * h;
        v[w] = cw * h;
        return project(v);
      });
      const n: V3 = [0, 0, 0];
      n[axis] = sign;
      faces.push({ corners, normal: project(n) });
    }
  }

  return faces
    .filter((f) => f.normal[2] > 0)
    .map((f) => ({
      points: f.corners,
      shade: 0.045 + Math.max(0, -f.normal[1]) * 0.08 + Math.max(0, -f.normal[0]) * 0.035,
    }));
})();

interface Box {
  cx: number;
  cy: number;
  r: number;
}

export function StaticFallback() {
  const svg = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const host = svg.current?.closest<HTMLElement>("[data-hero]");
    const slot = host?.querySelector<HTMLElement>("[data-hero-slot]");
    if (!host || !slot) return;
    const ro = new ResizeObserver(() => {
      const s = slot.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      setBox({
        cx: s.left - h.left + s.width / 2,
        cy: s.top - h.top + s.height / 2,
        r: (Math.min(s.width, s.height) / 2) * CAMERA.slotFill,
      });
    });
    ro.observe(host);
    ro.observe(slot);
    return () => ro.disconnect();
  }, []);

  return (
    <svg ref={svg} className={styles.fallback} aria-hidden="true">
      <defs>
        <linearGradient id="hero-fallback-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38e8ff" />
          <stop offset="1" stopColor="#ff3cb0" />
        </linearGradient>
        <radialGradient id="hero-fallback-glass" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#b98cff" stopOpacity="0.16" />
        </radialGradient>
      </defs>
      {box && (
        <g transform={`translate(${box.cx} ${box.cy}) scale(${box.r})`}>
          {DRAWING.map((face, i) => (
            <polygon
              key={i}
              points={face.points.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill={`rgb(${Math.round(face.shade * 255)} ${Math.round(face.shade * 240)} ${Math.round(face.shade * 290)})`}
              stroke="rgba(120, 220, 255, 0.35)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          ))}
          <circle r={1} fill="url(#hero-fallback-glass)" />
          <circle
            r={1}
            fill="none"
            stroke="url(#hero-fallback-rim)"
            strokeOpacity={0.7}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      )}
    </svg>
  );
}
