import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { QUALITY, type QualitySettings, type QualityTier } from "./config";

function mediaQueryStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    getSnapshot: () => window.matchMedia(query).matches,
  };
}

const reducedMotionQuery = mediaQueryStore("(prefers-reduced-motion: reduce)");
const finePointerQuery = mediaQueryStore("(hover: hover) and (pointer: fine)");

export function useReducedMotion() {
  return useSyncExternalStore(
    reducedMotionQuery.subscribe,
    reducedMotionQuery.getSnapshot,
    () => false,
  );
}

/** true for a mouse or trackpad. Touch-first devices get automatic camera drift instead. */
export function useFinePointer() {
  return useSyncExternalStore(
    finePointerQuery.subscribe,
    finePointerQuery.getSnapshot,
    () => false,
  );
}

/** Picks a starting quality tier from device hints. The PerformanceMonitor adjusts it at runtime. */
export function detectTier(): QualityTier {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarse && shortSide < 600) return "low";
  if (coarse || cores <= 4 || memory <= 4) return "medium";
  return "high";
}

/** degrade 0 = the tier's defaults, 1 = lighter, 2 = no post-processing at all. */
export function resolveQuality(tier: QualityTier, degrade: number): QualitySettings {
  const base = QUALITY[tier];
  if (degrade <= 0) return base;
  if (degrade === 1)
    return { ...base, dpr: [1, Math.min(base.dpr[1], 1.25)], msaa: 0, chromatic: false };
  return { ...base, dpr: [1, 1], msaa: 0, chromatic: false, effects: false };
}

export interface PointerState {
  /** Normalized device coordinates relative to the canvas: -1..1, with +y pointing up. */
  x: number;
  y: number;
  /** false when the pointer is outside the hero or is not a mouse or pen. */
  active: boolean;
}

/**
 * Follows the mouse relative to `element` without re-rendering React.
 * It listens on window so the HTML overlay above the canvas never blocks it.
 */
export function usePointer(element: HTMLElement, enabled: boolean): RefObject<PointerState> {
  const state = useRef<PointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const s = state.current;
    if (!enabled) {
      s.active = false;
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = element.getBoundingClientRect();
      s.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.y = 1 - ((e.clientY - r.top) / r.height) * 2;
      s.active = Math.abs(s.x) <= 1 && Math.abs(s.y) <= 1;
    };
    const onLeave = () => {
      s.active = false;
    };
    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [element, enabled]);

  return state;
}

export interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Measures the `[data-hero-slot]` element (the space CSS leaves for the object)
 * relative to the canvas. The camera frames the sphere into that box, so
 * breakpoints in CSS drive the 3D composition.
 */
export function useSlotRect(canvas: HTMLElement, onChange: () => void): RefObject<SlotRect | null> {
  const rect = useRef<SlotRect | null>(null);

  useEffect(() => {
    const host = canvas.closest<HTMLElement>("[data-hero]");
    const slot = host?.querySelector<HTMLElement>("[data-hero-slot]");
    if (!host || !slot) return;

    let alive = true;
    const measure = () => {
      if (!alive) return;
      const a = slot.getBoundingClientRect();
      const b = canvas.getBoundingClientRect();
      rect.current = { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
      onChange();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(slot);
    ro.observe(host);
    document.fonts?.ready.then(measure);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [canvas, onChange]);

  return rect;
}

/** Small seeded PRNG so procedural geometry is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
