"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { journey } from "@/lib/journey-store";
import { Room } from "./room/room";

export default function Scene() {
  const low = journey.tier === "low";

  return (
    <Canvas
      shadows
      dpr={low ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 44, near: 0.1, far: 80, position: [3.4, 2.9, 4.4] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#0d0d0f");
      }}
    >
      <Room />
      {/* RGB, LED strips and the monitor actually glow — skipped on small/weak
          devices to protect the frame budget */}
      {!low && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.62} luminanceSmoothing={0.25} />
          <Vignette eskil={false} offset={0.22} darkness={0.5} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
