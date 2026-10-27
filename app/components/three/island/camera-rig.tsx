"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { journey, clamp01, smoothstep } from "@/lib/journey-store";
import { panelStore } from "@/lib/panel-store";
import type { PanelKey } from "@/lib/content";

/** Drag distance of the current/last pointer gesture — hotspots read this
    to tell a camera drag apart from a click. */
export const dragState = { moved: 0 };

const PIVOT_HOME = new THREE.Vector3(0, 1.4, 0);
const PITCH = { min: 0.22, max: 0.85, home: 0.5 };
const RADIUS_HOME = 16.5;
const YAW_SPEED = 0.045;

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
 * Orbiting diorama camera. Slowly auto-rotates when idle; dragging spins it;
 * opening a district panel glides the camera in for a close-up, closing
 * glides back to the overview. Scrolling past the hero recedes gently so
 * the island becomes a backdrop behind the HTML sections.
 */
export function CameraRig() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const yaw = useRef(0.6);
  const pitch = useRef(PITCH.home);
  const userYaw = useRef(0);
  const userPitch = useRef(0);
  const wasFocused = useRef(false);

  const pivot = useRef(PIVOT_HOME.clone());
  const radius = useRef(RADIUS_HOME);
  const pos = useRef(new THREE.Vector3(12, 11, 14));
  const look = useRef(PIVOT_HOME.clone());

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

  useFrame((_, delta) => {
    const blend = smoothstep(clamp01(journey.progress / 0.13));
    const key = panelStore.get();
    const focus = key ? FOCUS[key] : null;

    // Detect panel close -> resume smooth orbit from current angle
    if (wasFocused.current && !focus) {
      userYaw.current = yaw.current - 0.6;
    }
    wasFocused.current = !!focus;

    // auto-rotate only while idle at the overview (no drag, no panel open)
    if (!journey.reduced && !focus && dragState.moved === 0) {
      userYaw.current -= YAW_SPEED * delta;
    }

    let yawTarget: number;
    let pitchTarget: number;
    let radiusTarget: number;
    let pivotTarget: THREE.Vector3;

    if (focus) {
      // Zoom and focus into district
      yawTarget = shortestAngle(yaw.current, focus.yaw);
      pitchTarget = focus.pitch;
      radiusTarget = focus.radius;
      pivotTarget = focus.pivot.clone();
    } else {
      // Overview diorama
      yawTarget = 0.6 + userYaw.current;
      pitchTarget = THREE.MathUtils.lerp(
        PITCH.home + userPitch.current * (1 - blend) + journey.pointer.y * 0.02,
        PITCH.home + 0.08,
        blend,
      );
      radiusTarget = THREE.MathUtils.lerp(
        journey.tier === "low" ? RADIUS_HOME + 2 : RADIUS_HOME,
        RADIUS_HOME + 6,
        blend,
      );
      pivotTarget = PIVOT_HOME.clone();
      pivotTarget.y += blend * 2.5;
    }

    const k = 1 - Math.exp(-3.5 * delta);
    yaw.current += (yawTarget - yaw.current) * k;
    pitch.current += (pitchTarget - pitch.current) * k;
    radius.current += (radiusTarget - radius.current) * k;
    pivot.current.lerp(pivotTarget, k);
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
