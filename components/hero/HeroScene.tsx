import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import { Aircraft } from "./Aircraft";
import { CameraRig } from "./CameraRig";
import type { QualitySettings } from "./config";
import { CubeSphere } from "./CubeSphere";
import { Dust } from "./Dust";
import { Effects } from "./Effects";
import { usePointer, useSlotRect } from "./hooks";
import { Mountains } from "./Mountains";
import { RetroGrid } from "./RetroGrid";
import { Sky } from "./Sky";
import { createSharedUniforms } from "./uniforms";

interface HeroSceneProps {
  quality: QualitySettings;
  reducedMotion: boolean;
  finePointer: boolean;
  /** Scene time in seconds. It lives in HeroCanvas so it survives a remount of the scene. */
  clockRef: RefObject<number>;
}

/**
 * The scene graph. HeroCanvas keys it on quality.effects: materials keep the uniforms they
 * were compiled with, so switching post-processing on or off (which changes dithering)
 * has to rebuild the materials rather than swap their uniforms.
 */
export function HeroScene({ quality, reducedMotion, finePointer, clockRef }: HeroSceneProps) {
  // Without post-processing the canvas writes 8-bit output directly, so the gradients get dithered.
  const dither = quality.effects ? 0 : 1;
  const shared = useMemo(() => createSharedUniforms(dither), [dither]);

  // Advance the scene clock. It freezes when the user prefers reduced motion.
  useFrame((_, delta) => {
    if (!reducedMotion) clockRef.current += Math.min(delta, 1 / 20);
  }, -2);

  const canvas = useThree((s) => s.gl.domElement);
  const invalidate = useThree((s) => s.invalidate);
  const pointerRef = usePointer(canvas, finePointer && !reducedMotion);
  const slotRef = useSlotRect(canvas, invalidate);

  // In on-demand mode (reduced motion), the composer and the layout take a few frames to settle.
  useEffect(() => {
    if (!reducedMotion) return;
    let n = 0;
    const id = window.setInterval(() => {
      invalidate();
      if (++n > 24) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [reducedMotion, invalidate, quality]);

  return (
    <>
      <CameraRig
        clockRef={clockRef}
        slotRef={slotRef}
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
        autoDrift={!finePointer}
      />
      <Sky shared={shared} clockRef={clockRef} starCount={quality.stars} />
      <Mountains shared={shared} />
      <RetroGrid shared={shared} clockRef={clockRef} />
      <CubeSphere
        shared={shared}
        clockRef={clockRef}
        segments={quality.sphereSegments}
        pointerRef={pointerRef}
      />
      <Aircraft
        shared={shared}
        clockRef={clockRef}
        count={quality.aircraft}
        trails={quality.aircraftTrails}
      />
      {quality.dust > 0 && <Dust shared={shared} clockRef={clockRef} count={quality.dust} />}
      {quality.effects && <Effects quality={quality} />}
    </>
  );
}
