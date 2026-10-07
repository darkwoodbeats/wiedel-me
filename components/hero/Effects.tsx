import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useMemo } from "react";
import { HalfFloatType, Vector2 } from "three";
import { EFFECTS, type QualitySettings } from "./config";

/**
 * Retro post-processing, used sparingly. The composer merges these into
 * as few full-screen passes as possible: chromatic aberration and bloom share
 * a pass, then tone mapping, grain and vignette.
 * Scanlines live in CSS, so they stay pixel-crisp at any DPR and never touch the text.
 */
export function Effects({ quality }: { quality: QualitySettings }) {
  const caOffset = useMemo(
    () => new Vector2(EFFECTS.chromaticAberration, EFFECTS.chromaticAberration * 0.6),
    [],
  );

  return (
    <EffectComposer multisampling={quality.msaa} frameBufferType={HalfFloatType}>
      {quality.chromatic ? (
        <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.45} />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={EFFECTS.bloom.intensity}
        luminanceThreshold={EFFECTS.bloom.threshold}
        luminanceSmoothing={EFFECTS.bloom.smoothing}
        radius={EFFECTS.bloom.radius}
        levels={quality.bloomLevels}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Noise premultiply blendFunction={BlendFunction.ADD} opacity={EFFECTS.grain} />
      <Vignette offset={EFFECTS.vignette.offset} darkness={EFFECTS.vignette.darkness} />
    </EffectComposer>
  );
}
