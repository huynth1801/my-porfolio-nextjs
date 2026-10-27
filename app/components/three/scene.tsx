"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { journey } from "@/lib/journey-store";
import { Room } from "./room/room";

export default function Scene() {
  const low = journey.tier === "low";

  return (
    <Canvas
      shadows
      dpr={low ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 80, position: [3.4, 2.9, 4.4] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#0d0d0f");
      }}
    >
      <Room />
    </Canvas>
  );
}
