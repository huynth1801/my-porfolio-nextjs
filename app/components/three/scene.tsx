"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Island />

      {/* Windows, neon arcade signs, and radio beacon glow with bloom —
          skipped on small/weak devices to protect the frame budget */}
      {!low && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.25} />
          <Vignette eskil={false} offset={0.18} darkness={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
