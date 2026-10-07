"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PANEL_JETS } from "@/components/hero/config";
import { supportsWebGL2 } from "@/components/hero/HeroCanvasLoader";
import { useReducedMotion } from "@/components/hero/hooks";
import styles from "./Jets.module.css";

/** three.js loads with the hero; this chunk only adds the jets' scene. */
const JetsCanvas = dynamic(() => import("@/components/hero/JetsCanvas"), { ssr: false });

const subscribeNever = () => () => {};

/** If the WebGL context still fails at runtime, the panel simply has no jets. */
class JetsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The hero's jets, lapping the contact panel in 3D (hero/JetsCanvas.tsx). Covers the panel's
 * wrapper plus PANEL_JETS.margin on each side, so the jets can swing wide. The canvas is created
 * once the panel comes near the screen and paused whenever it's out of view. Nothing renders
 * without WebGL 2, or for readers who prefer reduced motion.
 */
export function Jets() {
  const reducedMotion = useReducedMotion();
  const webgl = useSyncExternalStore(subscribeNever, supportsWebGL2, () => false);
  const enabled = webgl && !reducedMotion;
  const wrapper = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapper.current;
    if (!enabled || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;
  const { x, y } = PANEL_JETS.margin;
  return (
    <div
      ref={wrapper}
      className={styles.jets}
      style={{ inset: `${-y * 100}% ${-x * 100}%` }}
      aria-hidden="true"
    >
      {mounted && (
        <JetsBoundary>
          <JetsCanvas active={inView} />
        </JetsBoundary>
      )}
    </div>
  );
}
