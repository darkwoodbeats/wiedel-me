"use client";

import { useEffect, useRef } from "react";
import styles from "./OutrunHero.module.css";

type Interval = readonly [number, number];

// Timing in ms. The first event (a sparkle) lands just after the scene fades in; after that come long, uneven gaps.
const FIRST_DELAY: Interval = [2200, 2900];
const GAP: Interval = [5500, 13000];
/** With the pointer nearby, glints come a little more often. */
const GAP_NEAR: Interval = [2600, 6000];
const NEAR_PX = 160;
/** Stars available at once: enough for a sparkle of up to three. */
const STARS = 3;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

/**
 * Where light can catch the top of each capital in D-R-E-A-M-S, as fractions of the letter's box:
 * flat tops, the point of the A, the tops of the M's stems, the crest of the S.
 */
const CATCH: Interval[][] = [
  [[0.2, 0.62]],
  [[0.2, 0.6]],
  [[0.2, 0.85]],
  [[0.46, 0.54]],
  [
    [0.1, 0.2],
    [0.8, 0.9],
  ],
  [[0.42, 0.66]],
];

interface Twinkle {
  scale: Interval;
  duration: Interval;
  peak: number;
  delay?: number;
}

/**
 * "Dreams", with rare moments of light that are easy to miss. Three kinds:
 *  - glint:   one tiny star catches the top edge of a letter
 *  - sweep:   a highlight slides across the word (sometimes with a glint)
 *  - sparkle: two or three smaller stars pop in quick succession along the word; it happens
 *             once just after the page loads, riding along with the sweep, then occasionally
 * Each event varies in letters, size, spin and speed, and the pauses between them are long and
 * irregular, so it never reads as a loop. It runs on the Web Animations API, with no React
 * re-renders, and stays still when the user prefers reduced motion.
 */
export function DreamsWord() {
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const word = wordRef.current;
    const text = word?.firstChild;
    const stars = word ? Array.from(word.querySelectorAll<HTMLElement>("[data-spark]")) : [];
    if (!word || !(text instanceof Text) || stars.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const letter = document.createRange();
    let timer = 0;
    let frame = 0;
    let near = false;
    let lastFire = 0;
    let nextStar = 0;

    const schedule = ([min, max]: Interval, first = false) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fire(first), rand(min, max));
    };

    const onScreen = () => {
      const r = word.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    /** One star on the top edge of letter i, where the italic's upper corner catches the light. */
    const twinkle = (i: number, { scale, duration, peak, delay = 0 }: Twinkle) => {
      const star = stars[nextStar++ % stars.length];
      const style = getComputedStyle(word);
      const size = parseFloat(style.fontSize);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = ctx.measureText("D");

      const [from, to] = pick(CATCH[i]);
      letter.setStart(text, i);
      letter.setEnd(text, i + 1);
      const glyph = letter.getBoundingClientRect();
      const box = word.getBoundingClientRect();
      // A letter's box top sits the font's ascent above its baseline; the cap line sits the cap height above it.
      const capLine =
        glyph.top - box.top + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent;
      // Letter boxes are upright but the caps lean right, so their tops sit ~0.13em further along.
      const x = glyph.left - box.left + size * 0.13 + glyph.width * rand(from, to);
      const y = capLine + size * rand(0, 0.04);
      const s = rand(...scale);
      const spin = rand(25, 55) * (Math.random() < 0.5 ? -1 : 1);
      const at = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;

      star.animate(
        [
          { transform: `${at} scale(0) rotate(0deg)`, opacity: 0 },
          {
            transform: `${at} scale(${s.toFixed(2)}) rotate(${spin / 2}deg)`,
            opacity: peak,
            offset: 0.35,
          },
          { transform: `${at} scale(0) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: rand(...duration), delay, easing: "cubic-bezier(0.3, 0, 0.3, 1)" },
      );
    };

    const glint = (peak: number) =>
      twinkle(Math.floor(Math.random() * CATCH.length), {
        scale: [0.75, 1.1],
        duration: [850, 1300],
        peak,
      });

    /** Two or three smaller, softer stars, left to right along the word, a beat apart. */
    const sparkle = (peak: number) => {
      const pool = CATCH.map((_, i) => i);
      const letters: number[] = [];
      for (let n = Math.random() < 0.6 ? 3 : 2; n > 0; n--) {
        letters.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
      }
      letters.sort((a, b) => a - b);
      let delay = 0;
      for (const i of letters) {
        twinkle(i, { scale: [0.6, 0.9], duration: [600, 900], peak, delay });
        delay += rand(140, 280);
      }
    };

    /** A highlight sliding once across the word: the top background layer over its chrome (see .dreams). */
    const sweep = () => {
      const size = parseFloat(getComputedStyle(word).fontSize);
      const start = -size * 0.8;
      const end = word.getBoundingClientRect().width + size * 0.1;
      word.animate(
        [
          { backgroundPosition: `${start.toFixed(1)}px 0, 0 0` },
          { backgroundPosition: `${end.toFixed(1)}px 0, 0 0` },
        ],
        { duration: rand(750, 1100), easing: "cubic-bezier(0.45, 0, 0.3, 1)" },
      );
    };

    function fire(first: boolean) {
      lastFire = performance.now();
      if (!document.hidden && onScreen()) {
        const peak = near ? 1 : 0.9;
        const roll = Math.random();
        if (first) {
          // The word's arrival: a light passes and leaves a few sparks in its wake.
          sweep();
          sparkle(peak);
        } else if (roll < 0.5) {
          glint(peak);
        } else if (roll < 0.68) {
          sweep();
          glint(peak);
        } else if (roll < 0.82) {
          sweep();
        } else {
          sparkle(peak);
        }
      }
      schedule(near ? GAP_NEAR : GAP);
    }

    // Optional and subtle: coming near the word invites a glint a little sooner, never back to back.
    const onPointerMove = (e: PointerEvent) => {
      if (frame) return;
      const { clientX, clientY } = e;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = word.getBoundingClientRect();
        const dx = Math.max(r.left - clientX, 0, clientX - r.right);
        const dy = Math.max(r.top - clientY, 0, clientY - r.bottom);
        const wasNear = near;
        near = Math.hypot(dx, dy) < NEAR_PX;
        if (near && !wasNear && performance.now() - lastFire > 3500) schedule([700, 1800]);
      });
    };

    const start = () => schedule(FIRST_DELAY, true);
    const stop = () => {
      window.clearTimeout(timer);
      word.getAnimations().forEach((a) => a.cancel());
      stars.forEach((star) => star.getAnimations().forEach((a) => a.cancel()));
    };
    const onMotionPreference = () => (reducedMotion.matches ? stop() : start());

    reducedMotion.addEventListener("change", onMotionPreference);
    if (finePointer.matches)
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (!reducedMotion.matches) start();

    return () => {
      stop();
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", onMotionPreference);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <span ref={wordRef} className={`${styles.titleLoud} ${styles.dreams}`}>
      Dreams
      {Array.from({ length: STARS }, (_, i) => (
        <span key={i} className={styles.spark} data-spark="" aria-hidden="true">
          <svg viewBox="0 0 20 20">
            <path d="M10 0C10.6 6.4 13.6 9.4 20 10 13.6 10.6 10.6 13.6 10 20 9.4 13.6 6.4 10.6 0 10 6.4 9.4 9.4 6.4 10 0Z" />
          </svg>
        </span>
      ))}
    </span>
  );
}
