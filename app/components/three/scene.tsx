"use client";

import { Canvas } from "@react-three/fiber";
import { journey } from "@/lib/journey-store";
import { JourneyWorld } from "./journey-world";

export default function Scene() {
  const low = journey.tier === "low";

  return (
    <Canvas
      dpr={low ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 55, near: 0.1, far: 180, position: [0, 0.3, 11] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#0d0d0f"]} />
      <fog attach="fog" args={["#0d0d0f", 9, 46]} />
      <JourneyWorld />
    </Canvas>
  );
}
