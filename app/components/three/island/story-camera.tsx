"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { story, storyUi } from "./story-store";

/** current act — kept in the ui store, read here without re-renders */
function storyUiAct(): number {
  return storyUi.act;
}

/**
 * Director camera for story mode. While the story plays it owns the camera:
 * per-act framing offsets relative to the boy, softly damped, with a faint
 * handheld drift so it feels filmed, not rendered. Scrolling exits story
 * mode and hands the camera back to the tour rig.
 */

// per-act camera offset (world-space, relative to the boy) + fov
const SHOTS: Record<number, { off: [number, number, number]; fov: number }> = {
  0: { off: [2.2, 2.2, 2.4], fov: 50 }, // house — warm elevated side shot (above tree line)
  1: { off: [0.8, 4.4, 5.4], fov: 44 }, // school — high frontal, over the steps
  2: { off: [1.6, 2.6, 2.6], fov: 50 }, // arcade — from the square, over the joystick statue
  3: { off: [-3.4, 1.4, 4.4], fov: 42 }, // rooftop — from island side, sky behind
};

export function StoryCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const pos = useRef(new THREE.Vector3(8, 6, 10));
  const look = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame((state, rawDelta) => {
    if (!story.playing) return;
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    const act = storyUiAct();
    const shot = SHOTS[act] ?? SHOTS[0];

    const bx = story.px;
    const by = story.py + 0.6 * story.scale + (story.jumpT < 1 ? story.jumpH * story.jumpT * 0.6 : 0);
    const bz = story.pz;

    // handheld micro-drift
    const hx = Math.sin(t * 0.9) * 0.05 + Math.sin(t * 2.3) * 0.02;
    const hy = Math.cos(t * 1.1) * 0.04;

    target.current.set(bx + shot.off[0] + hx, by + shot.off[1] + hy, bz + shot.off[2]);
    const k = 1 - Math.exp(-2.4 * dt);
    pos.current.lerp(target.current, k);
    camera.position.copy(pos.current);

    lookTarget.current.set(bx, by + 0.15, bz);
    look.current.lerp(lookTarget.current, k);
    camera.lookAt(look.current);

    const fovTarget = shot.fov;
    if (Math.abs(camera.fov - fovTarget) > 0.05) {
      camera.fov += (fovTarget - camera.fov) * k;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
