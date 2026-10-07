"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";
import { StaticFallback } from "./StaticFallback";

/** three.js, R3F and post-processing load in their own chunk, after the HTML hero is already on screen. */
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

let webgl2Support: boolean | undefined;
/** Also used by the contact panel's jets (site/Jets.tsx). */
export function supportsWebGL2() {
  if (webgl2Support === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      webgl2Support = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl2Support = false;
    }
  }
  return webgl2Support;
}

const subscribeNever = () => () => {};

/** If context creation still fails at runtime (blocklisted GPU, lost context), show the static drawing. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticFallback /> : this.props.children;
  }
}

export function HeroCanvasLoader() {
  const support = useSyncExternalStore(
    subscribeNever,
    () => (supportsWebGL2() ? "webgl" : "none"),
    () => "pending",
  );

  if (support === "pending") return null;
  if (support === "none") return <StaticFallback />;
  return (
    <WebGLBoundary>
      <HeroCanvas />
    </WebGLBoundary>
  );
}
