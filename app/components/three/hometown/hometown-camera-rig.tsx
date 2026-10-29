"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type ViewPreset = "overview" | "kiln" | "river" | "fire";

export const VIEW_PRESETS: Record<
  ViewPreset,
  { label: string; icon: string; pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: {
    label: "Toàn cảnh hoàng hôn",
    icon: "🌅",
    pos: [0, 9.5, 23.5],
    target: [0, 3.5, 0],
  },
  kiln: {
    label: "Cận cảnh Lò Úp",
    icon: "🏺",
    pos: [-1.2, 5.2, 8.2],
    target: [-1.5, 4.5, 1.2],
  },
  river: {
    label: "Bến thuyền Cổ Chiên",
    icon: "🛶",
    pos: [4.6, 2.2, 14.8],
    target: [2.8, 0.6, 9.8],
  },
  fire: {
    label: "Cửa lò rực lửa",
    icon: "🔥",
    pos: [-1.5, 1.6, 7.0],
    target: [-1.5, 0.9, 4.6],
  },
};

type Props = {
  desiredPos: [number, number, number];
  desiredTarget: [number, number, number];
  isTransitioning: boolean;
  onTransitionEnd?: () => void;
};

export function HometownCameraRig({
  desiredPos,
  desiredTarget,
  isTransitioning: _isTransitioning,
  onTransitionEnd,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const { camera } = useThree();

  const targetVec = useRef(new THREE.Vector3(...desiredTarget));
  const posVec = useRef(new THREE.Vector3(...desiredPos));
  const isMoving = useRef(false);

  useEffect(() => {
    targetVec.current.set(...desiredTarget);
    posVec.current.set(...desiredPos);
    isMoving.current = true;
  }, [desiredPos, desiredTarget]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isMoving.current) {
      const step = Math.min(1, delta * 3.2);

      camera.position.lerp(posVec.current, step);
      controlsRef.current.target.lerp(targetVec.current, step);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(posVec.current) < 0.08 &&
        controlsRef.current.target.distanceTo(targetVec.current) < 0.08
      ) {
        camera.position.copy(posVec.current);
        controlsRef.current.target.copy(targetVec.current);
        controlsRef.current.update();
        isMoving.current = false;
        onTransitionEnd?.();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3.5}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 - 0.02} // don't go below ground level
      minPolarAngle={0.15}
    />
  );
}
