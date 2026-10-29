"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { journey, tourState } from "@/lib/journey-store";
import { story } from "./story-store";
import { panelStore } from "@/lib/panel-store";
import { flappy } from "./flappy";
import { getTerminalSnapshot } from "@/lib/terminal-store";
import type { PanelKey } from "@/lib/content";

/** Drag distance of the current/last pointer gesture — hotspots read this
    to tell a camera drag apart from a click. */
export const dragState = { moved: 0 };

const PITCH = { min: 0.22, max: 0.85, home: 0.5 };

type FocusTarget = {
  pivot: THREE.Vector3;
  radius: number;
  yaw: number;
  pitch: number;
};

/** Where the camera flies when a district panel is open */
const FOCUS: Record<PanelKey, FocusTarget> = {
  about: { pivot: new THREE.Vector3(-3.4, 0.9, 2.3), radius: 6.8, yaw: 0.35, pitch: 0.38 }, // house
  education: { pivot: new THREE.Vector3(3.2, 1.1, 2.8), radius: 7.2, yaw: 0.95, pitch: 0.38 }, // school
  experience: { pivot: new THREE.Vector3(3.6, 1.7, -1.1), radius: 8.5, yaw: 1.85, pitch: 0.36 }, // towers
  projects: { pivot: new THREE.Vector3(-3.2, 1.2, -2.2), radius: 7.0, yaw: -2.05, pitch: 0.38 }, // arcade
  contact: { pivot: new THREE.Vector3(0.2, 2.0, -4.3), radius: 7.6, yaw: -3.14, pitch: 0.34 }, // beacon
  skills: { pivot: new THREE.Vector3(-3.2, 1.0, -2.2), radius: 6.8, yaw: -1.95, pitch: 0.38 }, // skills terminal
};

function shortestAngle(from: number, to: number): number {
  const diff = (to - from) % (Math.PI * 2);
  const normalized = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return from + normalized;
}

/**
 * Scrollytelling Drone Camera Rig.
 * Continuously glides along the 5 districts as you scroll down the page.
 * Dragging allows manual orbit exploration; opening panels zooms in for close-up.
 */
export function CameraRig() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const yaw = useRef(0.6);
  const pitch = useRef(PITCH.home);
  const userYaw = useRef(0);
  const userPitch = useRef(0);
  const wasFocused = useRef(false);

  const pivot = useRef(new THREE.Vector3(0, 1.4, 0));
  const radius = useRef(16.5);
  const pos = useRef(new THREE.Vector3(12, 11, 14));
  const look = useRef(new THREE.Vector3(0, 1.4, 0));
  /** reused per-frame — avoids allocating inside useFrame (GC hitches) */
  const pivotTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button")) return;
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
      userYaw.current -= dx * 0.0034;
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

  useFrame((state, rawDelta) => {
    // story mode's director camera owns the rig while playing
    if (story.playing) return;
    // clamp so a tab-switch delta spike never teleports the camera
    const delta = Math.min(rawDelta, 0.05);
    const elapsed = state.clock.elapsedTime;
    const key = panelStore.get();
    const focus = key ? FOCUS[key] : null;

    // Detect panel close -> resume smooth orbit from current angle
    if (wasFocused.current && !focus) {
      userYaw.current = yaw.current - tourState.targetYaw;
    }
    wasFocused.current = !!focus;

    let yawTarget: number;
    let pitchTarget: number;
    let radiusTarget: number;

    const term = getTerminalSnapshot();

    if (term.isOpen) {
      // Elevated over-the-right-shoulder shot looking clearly down at laptop screen & keyboard
      const baseYaw = 0.52 + userYaw.current;
      yawTarget = shortestAngle(yaw.current, baseYaw);
      pitchTarget = THREE.MathUtils.clamp(0.48 + userPitch.current * 0.7, 0.22, 0.85);
      radiusTarget = 1.15;
      pivotTarget.current.set(-2.73, 0.58, 3.12);
    } else if (flappy.isOpen) {
      // Zoom right into the retro arcade entrance & screen
      yawTarget = shortestAngle(yaw.current, -0.8);
      pitchTarget = 0.14;
      radiusTarget = 2.4;
      pivotTarget.current.set(-3.86, 0.85, -1.56);
    } else if (focus) {
      // Zoom and focus into district close-up for opened panel
      yawTarget = shortestAngle(yaw.current, focus.yaw);
      pitchTarget = focus.pitch;
      radiusTarget = focus.radius;
      pivotTarget.current.copy(focus.pivot);
    } else {
      // Follow the continuous Drone Tour path driven by GSAP ScrollTrigger
      const isOverview = tourState.activeWaypointIndex === 0 && journey.progress < 0.05;

      // Gentle sway at the overview — NOT a continuous orbit (an endlessly
      // rotating camera makes the whole island look like it is spinning)
      const sway =
        !journey.reduced && isOverview && dragState.moved === 0
          ? Math.sin(elapsed * 0.22) * 0.05
          : 0;
      if (dragState.moved === 0) {
        // Softly ease user drag offset back to waypoint path when idle
        userYaw.current *= Math.exp(-2.2 * delta);
        userPitch.current *= Math.exp(-2.2 * delta);
      }

      const baseYaw = tourState.targetYaw + userYaw.current + sway;
      yawTarget = shortestAngle(yaw.current, baseYaw);
      pitchTarget = THREE.MathUtils.clamp(
        tourState.targetPitch + userPitch.current * 0.7 + journey.pointer.y * 0.02,
        PITCH.min,
        PITCH.max,
      );
      radiusTarget = journey.tier === "low" ? tourState.targetRadius + 1.5 : tourState.targetRadius;
      pivotTarget.current.set(
        tourState.targetPivot[0],
        tourState.targetPivot[1],
        tourState.targetPivot[2],
      );
    }

    const k = 1 - Math.exp(-3.5 * delta);
    yaw.current += (yawTarget - yaw.current) * k;
    pitch.current += (pitchTarget - pitch.current) * k;
    radius.current += (radiusTarget - radius.current) * k;
    pivot.current.lerp(pivotTarget.current, k);
    look.current.lerp(pivot.current, k);

    pos.current.set(
      pivot.current.x + radius.current * Math.sin(yaw.current) * Math.cos(pitch.current),
      pivot.current.y + radius.current * Math.sin(pitch.current),
      pivot.current.z + radius.current * Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });

  return null;
}
