"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, TiltShift2, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { journey } from "@/lib/journey-store";
import { Island } from "./island/island";

export default function Scene() {
  const low = journey.tier === "low";

  return (
    <Canvas
      shadows
      dpr={low ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 42, near: 0.2, far: 120, position: [14, 11, 14] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <Island />

      {/* Cinematic Post-Processing Suite:
          - N8AO: Screen Space Ambient Occlusion for realistic ground/contact shadows
          - TiltShift2: Macro lens blur on top/bottom for miniature diorama aesthetic
          - Bloom: Soft atmospheric neon glow for windows, radio beacon, and arcade signs
          - Vignette: Subtle lens edge darkening to focus viewer attention
          Skipped on low-tier mobile devices to preserve 60fps frame budget */}
      {!low && (
        <EffectComposer multisampling={0}>
          <N8AO
            aoRadius={0.9}
            distanceFalloff={0.65}
            intensity={2.2}
            quality="medium"
            halfRes
            color="#090e1f"
          />
          <TiltShift2 blur={0.12} taper={0.65} samples={5} />
          <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.52} luminanceSmoothing={0.25} />
          <Vignette eskil={false} offset={0.18} darkness={0.42} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
