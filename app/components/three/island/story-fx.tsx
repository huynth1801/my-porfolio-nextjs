"use client";

 

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { story } from "./story-store";
import { getGlowTexture } from "../glow-texture";

/**
 * Pooled story effects: landing dust rings, golden sparkle bursts, neon
 * confetti and the study-phase tech cubes. All triggered by counter bumps
 * on the story store (fx.dust / fx.sparkle / fx.confetti) and animated
 * procedurally in useFrame.
 */

const CONFETTI_COLORS = ["#22d3ee", "#f472b6", "#a78bfa", "#fbbf24", "#34d399"];

export function StoryFx() {
  const glow = useMemo(() => getGlowTexture(), []);

  // dust rings
  const dust = useRef(
    Array.from({ length: 3 }, () => ({
      active: false,
      t: 0,
      group: null as THREE.Group | null,
    })),
  );
  const dustGroups = useRef<THREE.Group[]>([]);
  const lastDust = useRef(story.fx.dust);

  // sparkle sprites
  const SPARK_N = 12;
  const sparkle = useRef({ active: false, t: 0 });
  const sparkleSprites = useRef<THREE.Sprite[]>([]);
  const sparkleVels = useRef<THREE.Vector3[]>([]);
  const sparkleOrigin = useRef(new THREE.Vector3());
  const lastSparkle = useRef(story.fx.sparkle);

  // confetti boxes
  const CONF_N = 18;
  const confetti = useRef({ active: false, t: 0 });
  const confettiMeshes = useRef<THREE.Mesh[]>([]);
  const confettiVels = useRef<THREE.Vector3[]>([]);
  const confettiOrigin = useRef(new THREE.Vector3());
  const lastConfetti = useRef(story.fx.confetti);

  // tech cubes (study)
  const CUBE_N = 5;
  const cubes = useRef<THREE.Mesh[]>([]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const anchorY = story.py + 0.55 * story.scale;
    const anchor = new THREE.Vector3(story.px, anchorY, story.pz);

    /* ---- landing dust ---- */
    if (story.fx.dust !== lastDust.current) {
      lastDust.current = story.fx.dust;
      const slot = dust.current.find((d) => !d.active) ?? dust.current[0];
      slot.active = true;
      slot.t = 0;
    }
    dust.current.forEach((d, i) => {
      const g = dustGroups.current[i];
      if (!g) return;
      if (d.active) {
        d.t += dt / 0.55;
        if (d.t >= 1) {
          d.active = false;
          g.visible = false;
          return;
        }
        g.visible = true;
        g.position.set(story.px, story.py + 0.06, story.pz);
        const s = 0.5 + d.t * 2.2;
        g.scale.setScalar(s);
        g.children.forEach((c) => {
          (c as THREE.Sprite).material.opacity = 0.5 * (1 - d.t);
        });
      }
    });

    /* ---- golden sparkles ---- */
    if (story.fx.sparkle !== lastSparkle.current) {
      lastSparkle.current = story.fx.sparkle;
      sparkle.current.active = true;
      sparkle.current.t = 0;
      sparkleOrigin.current.copy(anchor);
      sparkleVels.current = [];
      for (let i = 0; i < SPARK_N; i++) {
        const a = (i / SPARK_N) * Math.PI * 2 + Math.random();
        const v = 1.2 + Math.random() * 1.2;
        sparkleVels.current.push(
          new THREE.Vector3(Math.cos(a) * v * 0.6, 1.6 + Math.random() * 1.2, Math.sin(a) * v * 0.6),
        );
      }
    }
    if (sparkle.current.active) {
      sparkle.current.t += dt / 1.1;
      if (sparkle.current.t >= 1) sparkle.current.active = false;
      sparkleSprites.current.forEach((sp, i) => {
        if (!sparkle.current.active) {
          sp.material.opacity = 0;
          return;
        }
        const tt = sparkle.current.t;
        const vel = sparkleVels.current[i];
        sp.position.set(
          sparkleOrigin.current.x + vel.x * tt * 0.9,
          sparkleOrigin.current.y + 0.3 + vel.y * tt - 2.2 * tt * tt,
          sparkleOrigin.current.z + vel.z * tt * 0.9,
        );
        sp.material.opacity = 0.95 * (1 - tt);
        sp.scale.setScalar(0.16 + Math.sin(tt * 12 + i) * 0.03);
      });
    }

    /* ---- neon confetti ---- */
    if (story.fx.confetti !== lastConfetti.current) {
      lastConfetti.current = story.fx.confetti;
      confetti.current.active = true;
      confetti.current.t = 0;
      confettiOrigin.current.copy(anchor);
      confettiVels.current = [];
      for (let i = 0; i < CONF_N; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 1 + Math.random() * 1.6;
        confettiVels.current.push(
          new THREE.Vector3(Math.cos(a) * v, 1.8 + Math.random() * 1.6, Math.sin(a) * v),
        );
        const m = confettiMeshes.current[i];
        (m.material as THREE.MeshBasicMaterial).color.set(
          CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        );
      }
    }
    if (confetti.current.active) {
      confetti.current.t += dt / 1.5;
      if (confetti.current.t >= 1) confetti.current.active = false;
      confettiMeshes.current.forEach((m, i) => {
        if (!confetti.current.active) {
          m.visible = false;
          return;
        }
        const tt = confetti.current.t;
        const vel = confettiVels.current[i];
        m.visible = true;
        m.position.set(
          confettiOrigin.current.x + vel.x * tt * 0.9,
          confettiOrigin.current.y + vel.y * tt - 2.6 * tt * tt,
          confettiOrigin.current.z + vel.z * tt * 0.9,
        );
        m.rotation.x += dt * 7;
        m.rotation.y += dt * 5;
        (m.material as THREE.MeshBasicMaterial).opacity = 1 - tt;
      });
    }

    /* ---- study cubes ---- */
    const cubesOn = story.fx.cubes > 0;
    cubes.current.forEach((cube, i) => {
      if (!cubesOn) {
        cube.visible = false;
        return;
      }
      cube.visible = true;
      const phase = (t * 0.55 + i / CUBE_N) % 1;
      const from = new THREE.Vector3(story.px - 0.15, anchorY + 0.35, story.pz + 0.28);
      const to = new THREE.Vector3(story.px, anchorY + 0.15, story.pz);
      // arced path into the chest
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 0.9;
      const a = from.clone().lerp(mid, phase);
      const b = mid.clone().lerp(to, phase);
      cube.position.copy(a.lerp(b, phase));
      cube.rotation.x += dt * 4;
      cube.rotation.y += dt * 3;
      (cube.material as THREE.MeshBasicMaterial).opacity = 0.9 * Math.sin(phase * Math.PI);
    });

    void glow;
  });

  return (
    <group>
      {/* dust rings */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) dustGroups.current[i] = g;
          }}
          visible={false}
        >
          {[0, 1, 2, 3, 4].map((j) => {
            const a = (j / 5) * Math.PI * 2;
            return (
              <sprite
                key={j}
                position={[Math.cos(a) * 0.45, 0.1, Math.sin(a) * 0.45]}
                scale={[0.35, 0.28, 1]}
              >
                <spriteMaterial
                  map={glow}
                  color="#c8b9a4"
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </sprite>
            );
          })}
        </group>
      ))}

      {/* golden sparkles */}
      {Array.from({ length: SPARK_N }).map((_, i) => (
        <sprite
          key={i}
          ref={(s) => {
            if (s) sparkleSprites.current[i] = s;
          }}
          scale={[0.16, 0.16, 1]}
        >
          <spriteMaterial
            map={glow}
            color="#ffd24a"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}

      {/* tech cubes (study) */}
      {Array.from({ length: CUBE_N }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) cubes.current[i] = m; }} visible={false}>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}

      {/* neon confetti */}
      {Array.from({ length: CONF_N }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) confettiMeshes.current[i] = m; }} visible={false}>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshBasicMaterial transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
