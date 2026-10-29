"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type KilnSmokeProps = {
  position?: [number, number, number];
  intensity?: number;
};

/**
 * Cute, puffy cartoon marshmallow smoke puffs
 * rising from the bell kiln chimney with playful wobble.
 */
export function KilnSmoke({ position = [0, 8.2, 0], intensity = 1 }: KilnSmokeProps) {
  const count = 24;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precomputed deterministic particle properties
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      life: i / count,
      speed: 0.22 + pseudo(i * 1.7 + 1) * 0.1,
      baseScale: 0.65 + pseudo(i * 2.3 + 2) * 0.45,
      driftAngle: pseudo(i * 3.1 + 3) * Math.PI * 2,
      wobbleSpeed: 2.2 + pseudo(i * 4.2 + 4) * 1.5,
      wobblePhase: pseudo(i * 5.5 + 5) * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const clampedDelta = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      p.life += p.speed * clampedDelta * intensity;
      if (p.life > 1) {
        p.life -= 1;
      }

      const t = p.life;
      // Height rises smoothly from chimney
      const y = t * 6.2;

      // Cute pop-in and marshmallow expansion curve
      // Starts small, quickly balloons out, bobs playfully, then soft shrink
      const popFactor = Math.sin(t * Math.PI);
      const scale = p.baseScale * (popFactor * 1.5 + 0.2);

      // Playful cartoon drifting & bobbing
      const wobbleX = Math.sin(time * p.wobbleSpeed + p.wobblePhase) * 0.22 + t * 1.6;
      const wobbleZ = Math.cos(time * (p.wobbleSpeed * 0.8) + p.wobblePhase) * 0.2 - t * 0.8;

      dummy.position.set(position[0] + wobbleX, position[1] + y, position[2] + wobbleZ);

      // Cute squishy squash & stretch
      const squash = 1 + Math.sin(time * 3 + p.wobblePhase) * 0.1;
      dummy.scale.set(scale * squash, scale * (2 - squash), scale * squash);
      dummy.rotation.set(t * 0.4, time * 0.5 + p.wobblePhase, t * 0.2);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow={false}
      receiveShadow={false}
    >
      {/* Cute rounded marshmallow puff sphere */}
      <sphereGeometry args={[0.72, 14, 14]} />
      <meshStandardMaterial
        color="#fff5ea"
        emissive="#ffe2cc"
        emissiveIntensity={0.25}
        roughness={0.65}
        metalness={0.0}
        transparent
        opacity={0.78}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
