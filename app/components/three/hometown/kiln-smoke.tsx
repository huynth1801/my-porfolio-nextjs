"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

type KilnSmokeProps = {
  position?: [number, number, number];
  intensity?: number;
};

function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function KilnSmoke({ position = [0, 9.6, 0], intensity = 1 }: KilnSmokeProps) {
  const count = 36;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Particle data tracking life, speed, offsets (deterministic seeded)
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      life: i / count, // stagger starting life between 0 and 1
      speed: 0.18 + pseudo(i * 1.7 + 1) * 0.12,
      baseRadius: 0.4 + pseudo(i * 2.3 + 2) * 0.35,
      driftAngle: pseudo(i * 3.1 + 3) * Math.PI * 2,
      driftSpeed: 0.4 + pseudo(i * 4.9 + 4) * 0.3,
      rotSpeed: (pseudo(i * 5.7 + 5) - 0.5) * 0.8,
      wobbleSeed: pseudo(i * 6.3 + 6) * 10,
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

      // Height: rises from 0 up to 7 units above chimney
      const t = p.life;
      const y = t * 6.5;

      // Expansion: starts small (0.35), puffs out to ~2.2, then softens
      const scale = Math.sin(t * Math.PI * 0.9) * 1.6 + 0.35;

      // Drift with wind (drifting in +x and +z direction like an evening breeze)
      const windX = Math.pow(t, 1.4) * 2.8 + Math.sin(time * 0.8 + p.wobbleSeed) * 0.3;
      const windZ = Math.pow(t, 1.3) * -1.2 + Math.cos(time * 0.6 + p.wobbleSeed) * 0.25;

      dummy.position.set(position[0] + windX, position[1] + y, position[2] + windZ);

      dummy.scale.set(scale, scale * 0.85, scale);
      dummy.rotation.set(t * p.rotSpeed, time * 0.2 + p.wobbleSeed, t * p.rotSpeed * 0.7);

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
      <dodecahedronGeometry args={[0.9, 1]} />
      <meshStandardMaterial
        color="#fff1e6"
        roughness={0.9}
        metalness={0.0}
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  );
}
