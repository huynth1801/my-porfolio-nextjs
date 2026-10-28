"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAchievements } from "@/lib/achievements";

/**
 * Celebration burst at the island centre whenever an achievement unlocks
 * (26 neon boxes with gravity + spin). Mounted once inside the Canvas.
 */
export function AchievementCelebration() {
  const lastSeen = useRef(0);
  const burstT = useRef(1);
  const meshes = useRef<THREE.Mesh[]>([]);
  const vels = useRef<THREE.Vector3[]>([]);

  const { unlocked } = useAchievements();

  useEffect(() => {
    if (unlocked > lastSeen.current && lastSeen.current >= 0 && unlocked > 0) {
      burstT.current = 0;
      vels.current = [];
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 1.4 + Math.random() * 1.8;
        vels.current.push(
          new THREE.Vector3(Math.cos(a) * v, 2.4 + Math.random() * 2.2, Math.sin(a) * v),
        );
      }
    }
    lastSeen.current = unlocked;
  }, [unlocked]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (burstT.current >= 1) {
      meshes.current.forEach((m) => {
        if (m) m.visible = false;
      });
      return;
    }
    burstT.current = Math.min(1, burstT.current + dt / 1.8);
    const tt = burstT.current;
    meshes.current.forEach((m, i) => {
      if (!m || !vels.current[i]) return;
      const vel = vels.current[i];
      m.visible = true;
      m.position.set(
        vel.x * tt * 1.1,
        2.6 + vel.y * tt - 3 * tt * tt,
        vel.z * tt * 1.1,
      );
      m.rotation.x += dt * 6;
      m.rotation.z += dt * 4;
      (m.material as THREE.MeshBasicMaterial).opacity = 1 - tt;
    });
  });

  return (
    <group>
      {Array.from({ length: 26 }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) meshes.current[i] = m; }} visible={false}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshBasicMaterial
            color={["#22d3ee", "#f472b6", "#a78bfa", "#fbbf24", "#34d399"][i % 5]}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
