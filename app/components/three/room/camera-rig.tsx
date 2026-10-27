"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { journey, clamp01, smoothstep } from "@/lib/journey-store";

/** Drag distance of the current/last pointer gesture — hotspots read this
    to tell a camera drag apart from a click. */
export const dragState = { moved: 0 };

// Orbit pivot sits at the desk; the room is framed like the reference shot.
const PIVOT_HOME = new THREE.Vector3(0.1, 1.3, -1.55);
const PIVOT_FAR = new THREE.Vector3(0.1, 2.1, -1.3); // past the hero: dollhouse
const YAW = { min: -0.75, max: 0.42, home: -0.22, far: -0.1 };
const PITCH = { min: 0.04, max: 0.4, home: 0.19, far: 0.33 };
const RADIUS_HOME = 6.2;
const RADIUS_FAR = 9.2;

/**
 * Drag-to-orbit around the desk with soft damping, gentle idle sway and
 * cursor parallax. Scrolling past the hero pulls the camera up and back
 * so the whole room becomes a dim backdrop behind the HTML sections.
 */
export function CameraRig() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // narrow screens: sit further back so the desk fits the frame
  const radiusHome = journey.tier === "low" ? 7.1 : RADIUS_HOME;
  const radiusFar = journey.tier === "low" ? 10.2 : RADIUS_FAR;

  const yaw = useRef(YAW.home);
  const pitch = useRef(PITCH.home);
  /** user drag offset, relative to the home pose */
  const userYaw = useRef(0);
  const userPitch = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button")) return; // let links behave normally
      dragging = true;
      dragState.moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      document.body.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragState.moved += Math.abs(dx) + Math.abs(dy);
      userYaw.current = THREE.MathUtils.clamp(
        userYaw.current - dx * 0.0034,
        YAW.min - YAW.home,
        YAW.max - YAW.home,
      );
      userPitch.current = THREE.MathUtils.clamp(
        userPitch.current + dy * 0.0024,
        PITCH.min - PITCH.home,
        PITCH.max - PITCH.home,
      );
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = "";
      // let hotspot onClick handlers check this before it resets
      setTimeout(() => (dragState.moved = 0), 60);
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  const pos = useRef(new THREE.Vector3(3.4, 2.9, 4.4));
  const look = useRef(PIVOT_HOME.clone());

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // scrolling out of the hero relaxes the user offset into the dollhouse shot
    const blend = smoothstep(clamp01(journey.progress / 0.13));
    const sway = journey.reduced ? 0 : Math.sin(t * 0.12) * 0.045;

    const yawTarget = THREE.MathUtils.lerp(
      YAW.home + userYaw.current * (1 - blend) + sway * (1 - blend) + journey.pointer.x * 0.03,
      YAW.far,
      blend,
    );
    const pitchTarget = THREE.MathUtils.lerp(
      PITCH.home + userPitch.current * (1 - blend) + journey.pointer.y * 0.02,
      PITCH.far,
      blend,
    );
    const radius = THREE.MathUtils.lerp(radiusHome, radiusFar, blend);
    const pivot = PIVOT_HOME.clone().lerp(PIVOT_FAR, blend);

    const k = 1 - Math.exp(-6 * delta);
    yaw.current += (yawTarget - yaw.current) * k;
    pitch.current += (pitchTarget - pitch.current) * k;

    pos.current.set(
      pivot.x + radius * Math.sin(yaw.current) * Math.cos(pitch.current),
      pivot.y + radius * Math.sin(pitch.current),
      pivot.z + radius * Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    camera.position.copy(pos.current);
    look.current.lerp(pivot, k);
    camera.lookAt(look.current);
  });

  return null;
}
