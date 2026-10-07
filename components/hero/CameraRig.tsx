import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { MathUtils, type PerspectiveCamera } from "three";
import { CAMERA, GEOMETRY } from "./config";
import type { PointerState, SlotRect } from "./hooks";
import { OBJECT_CENTER } from "./uniforms";

interface CameraRigProps {
  /** Scene time in seconds (see HeroScene). */
  clockRef: RefObject<number>;
  slotRef: RefObject<SlotRect | null>;
  pointerRef: RefObject<PointerState>;
  reducedMotion: boolean;
  /** Touch devices get slow automatic movement in place of pointer parallax. */
  autoDrift: boolean;
}

/**
 * Frames the sphere into the CSS object slot every frame:
 *  - distance: chosen so the sphere's diameter fills CAMERA.slotFill of the slot
 *  - pitch: chosen so the horizon sits CAMERA.horizonBelow radii under the sphere
 *  - lens shift (setViewOffset): moves the image so the sphere lands on the slot's
 *    center; the grid's vanishing point stays directly under the object
 * Pointer, drift and scroll then orbit the camera slightly around the object,
 * so the background moves with parallax while the object stays put.
 */
export function CameraRig({
  clockRef,
  slotRef,
  pointerRef,
  reducedMotion,
  autoDrift,
}: CameraRigProps) {
  const eased = useRef({ x: 0, y: 0, scroll: 0 });

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const { width: W, height: H } = state.size;
    if (!W || !H) return;
    const t = clockRef.current;

    const aspect = W / H;
    camera.fov = MathUtils.lerp(
      CAMERA.portraitFov,
      CAMERA.fov,
      MathUtils.clamp((aspect - 0.5) / 0.5, 0, 1),
    );

    const s = slotRef.current ?? { x: W * 0.25, y: H * 0.15, w: W * 0.5, h: H * 0.5 };
    const cx = ((s.x + s.w / 2) / W) * 2 - 1;
    const cy = 1 - ((s.y + s.h / 2) / H) * 2;
    const radiusNdc = (Math.min(s.w, s.h) * 0.5 * CAMERA.slotFill) / (H / 2);
    const tanHalfFov = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const angularRadius = Math.atan(radiusNdc * tanHalfFov);
    let distance = GEOMETRY.sphereRadius / Math.sin(angularRadius);
    let pitch = Math.atan(CAMERA.horizonBelow * radiusNdc * tanHalfFov);

    // Input easing. With reduced motion, every value snaps and nothing animates.
    const e = eased.current;
    const p = pointerRef.current;
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * CAMERA.damping);
    e.x += ((p.active ? p.x : 0) - e.x) * k;
    e.y += ((p.active ? p.y : 0) - e.y) * k;
    const rect = state.gl.domElement.getBoundingClientRect();
    const scroll = MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
    e.scroll += (scroll - e.scroll) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 5));

    let yaw = e.x * CAMERA.parallax.yaw;
    pitch -= e.y * CAMERA.parallax.pitch;
    if (!reducedMotion) {
      yaw += (Math.sin(t * 0.071) + 0.6 * Math.sin(t * 0.023 + 1.3)) * CAMERA.drift.yaw;
      pitch += Math.sin(t * 0.053 + 0.4) * CAMERA.drift.pitch;
      if (autoDrift) {
        yaw += Math.sin(t * 0.13) * CAMERA.touchDrift.yaw;
        pitch += Math.sin(t * 0.097 + 2.0) * CAMERA.touchDrift.pitch;
      }
    }
    distance *= 1 - CAMERA.scroll.dolly * e.scroll;
    pitch -= CAMERA.scroll.rise * e.scroll;

    // Never let the camera sink below CAMERA.minHeight above the floor.
    const maxSin = (OBJECT_CENTER.y - (GEOMETRY.floorY + CAMERA.minHeight)) / distance;
    pitch = Math.min(pitch, Math.asin(MathUtils.clamp(maxSin, -1, 1)));

    camera.position.set(
      OBJECT_CENTER.x + distance * Math.sin(yaw) * Math.cos(pitch),
      OBJECT_CENTER.y - distance * Math.sin(pitch),
      OBJECT_CENTER.z + distance * Math.cos(yaw) * Math.cos(pitch),
    );
    camera.lookAt(OBJECT_CENTER);
    camera.setViewOffset(W, H, -cx * W * 0.5, cy * H * 0.5, W, H);
  }, -1);

  return null;
}
