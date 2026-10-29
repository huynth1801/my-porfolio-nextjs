"use client";

import { useRef } from "react";
import * as THREE from "three";

export function HometownLighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null!);

  return (
    <>
      {/* Golden Hour Sunset Sun (Mặt trời lặn ráng chiều Cổ Chiên) */}
      <directionalLight
        ref={sunRef}
        position={[24, 12, -6]}
        color="#ffaa66"
        intensity={3.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0003}
      />

      {/* Opposite sunset rim back-light for edge highlights on the brick domes */}
      <directionalLight position={[-18, 9, 14]} color="#ffd29d" intensity={1.2} />

      {/* Warm Ambient Light reflecting off Mekong river & red clay */}
      <ambientLight color="#ffccaa" intensity={0.85} />

      {/* Hemisphere Light: Golden Sunset Sky / Warm Terracotta Clay Ground */}
      <hemisphereLight args={["#fca5a5", "#78350f", 0.75]} />

      {/* Sunset Atmospheric Fog */}
      <fog attach="fog" args={["#c65922", 16, 58]} />
    </>
  );
}
