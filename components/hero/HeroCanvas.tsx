"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { CAMERA, MOTION, PALETTE } from "./config";
import { detectTier, resolveQuality, useFinePointer, useReducedMotion } from "./hooks";
import { HeroScene } from "./HeroScene";
import styles from "./OutrunHero.module.css";

/**
 * Step quality down when the frame rate stays below 55 fps (quality never steps back up, so the
 * upper bound is Infinity). drei's default only steps down below 40 fps, so a device stuck at
 * 40-55 fps (visibly stuttering) would never adapt. A healthy 60 Hz device measures 60-64 fps here,
 * well clear of the line. The catch: a 50 Hz display would also step down, but those are rare.
 */
const FPS_BOUNDS = (): [number, number] => [55, Infinity];

/** Let shaders compile and the first frames settle before judging the frame rate. */
const MONITOR_DELAY_MS = 1500;

/**
 * The WebGL layer. It is only loaded on the client (see HeroCanvasLoader) and
 *  - picks a quality tier from device hints, then adapts it to the measured frame rate
 *  - stops rendering entirely while the hero is scrolled out of view
 *  - renders on demand only (a still frame) when the user prefers reduced motion
 */
export default function HeroCanvas() {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const [tier] = useState(detectTier);
  const [degrade, setDegrade] = useState(0);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const clockRef = useRef(MOTION.startTime);

  // Adaptive quality: step down on a sustained low frame rate, and stay there. Stepping back up
  // once the lighter setting holds 60 would only bring the stutter back until it stepped down
  // again. The start delay (MONITOR_DELAY_MS) keeps load-time hiccups from causing a downgrade.
  const level = useRef(0);
  const onDecline = () => {
    if (level.current >= 2) return;
    level.current += 1;
    setDegrade(level.current);
  };

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "64px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setMonitoring(true), MONITOR_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  const quality = resolveQuality(tier, degrade);
  const frameloop = !inView ? "never" : reducedMotion ? "demand" : "always";

  return (
    <div
      ref={wrapper}
      className={styles.canvas}
      data-ready={ready}
      data-quality={`${tier}/${degrade}`}
      aria-hidden="true"
    >
      <Canvas
        dpr={quality.dpr}
        frameloop={frameloop}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: CAMERA.fov, near: 0.1, far: 1500, position: [0, -1, 10] }}
        onCreated={({ gl }) => {
          gl.setClearColor(PALETTE.skyTop);
          requestAnimationFrame(() => setReady(true));
        }}
      >
        {monitoring && !reducedMotion && (
          <PerformanceMonitor bounds={FPS_BOUNDS} onDecline={onDecline} />
        )}
        <HeroScene
          key={quality.effects ? "post" : "direct"}
          quality={quality}
          reducedMotion={reducedMotion}
          finePointer={finePointer}
          clockRef={clockRef}
        />
      </Canvas>
    </div>
  );
}
