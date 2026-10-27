"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { boot } from "./boot";
export type DayPhase = "day" | "golden" | "night";

function phaseFromHour(h: number): DayPhase {
  if (h >= 7 && h <= 16) return "day";
  if (h >= 17 && h <= 18) return "golden";
  return "night";
}

/**
 * The room follows the visitor's real clock: golden afternoon sun, or a
 * dark studio where the RGB and monitor do the lighting. `?phase=` in the
 * URL overrides it (handy for demos/screenshots).
 */
let cachedPhase: DayPhase | null = null;
export function getDayPhase(): DayPhase {
  if (cachedPhase) return cachedPhase;
  let override: string | null = null;
  try {
    override = new URLSearchParams(window.location.search).get("phase");
  } catch {}
  cachedPhase =
    override === "day" || override === "golden" || override === "night"
      ? (override as DayPhase)
      : phaseFromHour(new Date().getHours());
  return cachedPhase;
}

type LightRig = {
  sun: { pos: [number, number, number]; color: string; intensity: number };
  ambient: { color: string; intensity: number };
  hemi: number;
  monitor: number;
  fill: number;
  led: number;
};

const RIGS: Record<DayPhase, LightRig> = {
  day: {
    sun: { pos: [4.2, 3.3, 1.1], color: "#ffe3c2", intensity: 2.2 },
    ambient: { color: "#ffe9d0", intensity: 0.42 },
    hemi: 0.55,
    monitor: 1.1,
    fill: 4,
    led: 0.18,
  },
  golden: {
    sun: { pos: [4.6, 1.5, 1.4], color: "#ff9a5c", intensity: 2.8 },
    ambient: { color: "#ffd9b8", intensity: 0.3 },
    hemi: 0.32,
    monitor: 1.8,
    fill: 3,
    led: 0.3,
  },
  night: {
    sun: { pos: [4.4, 2.6, 0.9], color: "#7fa0ff", intensity: 0.55 },
    ambient: { color: "#3d4668", intensity: 0.16 },
    hemi: 0.14,
    monitor: 3.6,
    fill: 1.1,
    led: 0.55,
  },
};

/** Shared per-phase tuning for other components (LED strip, window…). */
export function getRig(): LightRig {
  return RIGS[getDayPhase()];
}

/**
 * Every light in the room, tuned to the current day phase and stuttering
 * on during the boot sequence.
 */
export function RoomLighting() {
  const phase = getDayPhase();
  const rig = useMemo(() => RIGS[phase], [phase]);

  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const ambRef = useRef<THREE.AmbientLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const monitorRef = useRef<THREE.PointLight>(null!);
  const fillRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const b = boot.value;
    // flicker while the boot sequence stutters, then steady 1
    const flicker =
      b >= 1 ? 1 : Math.max(0.04, b * (0.82 + 0.18 * Math.sin(state.clock.elapsedTime * 47) * Math.sin(state.clock.elapsedTime * 13)));
    const k = b * b * (3 - 2 * b) * flicker;

    sunRef.current.intensity = rig.sun.intensity * k;
    ambRef.current.intensity = rig.ambient.intensity * k;
    hemiRef.current.intensity = rig.hemi * k;
    monitorRef.current.intensity = rig.monitor * (0.25 + 0.75 * k);
    fillRef.current.intensity = rig.fill * k;
  });

  return (
    <>
      <ambientLight ref={ambRef} color={rig.ambient.color} intensity={rig.ambient.intensity} />
      <hemisphereLight ref={hemiRef} args={["#cdd8ff", "#3a2a1c", rig.hemi]} />
      <directionalLight
        ref={sunRef}
        position={rig.sun.pos}
        color={rig.sun.color}
        intensity={rig.sun.intensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* monitor backlight spill */}
      <pointLight ref={monitorRef} position={[-0.45, 1.85, -2.25]} color="#4f8dff" intensity={rig.monitor} distance={3.5} decay={2} />
      {/* soft warm fill above the desk */}
      <pointLight ref={fillRef} position={[0.4, 2.9, -0.4]} color="#ffd9a6" intensity={rig.fill} distance={7} decay={2} />
    </>
  );
}
