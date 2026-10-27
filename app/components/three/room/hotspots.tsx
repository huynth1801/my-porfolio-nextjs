"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { profile, type PanelKey } from "@/lib/content";
import { panelStore } from "@/lib/panel-store";
import { sfx } from "@/lib/audio";
import { hotspotStore, toyStore } from "./hotspot-store";
import { getGlowTexture } from "../glow-texture";
import { dragState } from "./camera-rig";

/**
 * Wraps an interactive object in the room. Hover: soft glow disc under the
 * object + pointer cursor + tooltip label. Click (if it wasn't a drag):
 * open the matching quick-view panel — or trigger a toy (chair spin, cat).
 */
export function Hotspot({
  position,
  radius,
  height = 0.6,
  glowY,
  label,
  target,
  children,
}: {
  position: [number, number, number];
  /** hit-cylinder radius (also scales the glow disc) */
  radius: number;
  /** hit-cylinder height, centred on `position` */
  height?: number;
  /** local y for the glow disc; defaults to just under the hit cylinder */
  glowY?: number;
  label: string;
  /** panel to open, CV download, or a room toy */
  target: PanelKey | "resume" | "spin" | "meow";
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const glow = useRef<THREE.Mesh>(null!);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  useFrame((state, delta) => {
    const m = glow.current.material as THREE.MeshBasicMaterial;
    const targetOpacity = hovered ? 0.45 : 0;
    m.opacity += (targetOpacity - m.opacity) * Math.min(1, delta * 10);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    glow.current.scale.setScalar(radius * pulse);
  });

  return (
    <group position={position}>
      {children}
      {/* invisible hit volume — forgiving hover/click area (transparent, not
          visible={false}, so it still receives raycasts) */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          hotspotStore.active = true;
          hotspotStore.label = label;
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={(e) => {
          hotspotStore.x = e.clientX;
          hotspotStore.y = e.clientY;
        }}
        onPointerOut={() => {
          setHovered(false);
          hotspotStore.active = false;
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (dragState.moved > 6) return; // that was a camera drag, not a click
          if (target === "resume") {
            sfx.click();
            const a = document.createElement("a");
            a.href = profile.resume;
            a.download = "";
            a.click();
            return;
          }
          if (target === "spin") {
            sfx.click();
            toyStore.spinTarget += Math.PI * 3.5;
            return;
          }
          if (target === "meow") {
            toyStore.catPokes++;
            sfx.meow();
            return;
          }
          sfx.click();
          panelStore.open(target);
        }}
      >
        <cylinderGeometry args={[radius, radius, height, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* glow disc under the object */}
      <mesh
        ref={glow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, glowY ?? -height / 2 + 0.01, 0]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          color="#35d0ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
