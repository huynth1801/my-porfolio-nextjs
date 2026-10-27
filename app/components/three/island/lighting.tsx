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
 * The island follows the visitor's real clock: golden afternoon sun, or a
 * starlit night where the windows and neon signs carry the scene.
 * `?phase=` in the URL overrides it (handy for demos/screenshots).
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
  hemi: { sky: string; ground: string; intensity: number };
  /** 0..1 — how much the neon/window accent lights are on */
  neon: number;
};

const RIGS: Record<DayPhase, LightRig> = {
  day: {
    sun: { pos: [18, 26, 12], color: "#fff1d6", intensity: 2.5 },
    ambient: { color: "#cfe0ff", intensity: 0.5 },
    hemi: { sky: "#9ec8ff", ground: "#6a5a4a", intensity: 0.6 },
    neon: 0,
  },
  golden: {
    sun: { pos: [26, 7, -4], color: "#ff9a5c", intensity: 2.7 },
    ambient: { color: "#ffd9b8", intensity: 0.36 },
    hemi: { sky: "#e8b98a", ground: "#5a4a3c", intensity: 0.4 },
    neon: 0.45,
  },
  night: {
    sun: { pos: [-14, 22, -12], color: "#8fa8ff", intensity: 0.55 },
    ambient: { color: "#2a3358", intensity: 0.24 },
    hemi: { sky: "#26304f", ground: "#1c1a22", intensity: 0.18 },
    neon: 1,
  },
};

/** Shared per-phase tuning for other components (windows, neon, sky…). */
export function getRig(): LightRig {
  return RIGS[getDayPhase()];
}

/**
 * Every light on the island, tuned to the current day phase and stuttering
 * on during the boot sequence.
 */
export function IslandLighting() {
  const rig = useMemo(() => RIGS[getDayPhase()], []);

  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const ambRef = useRef<THREE.AmbientLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const arcadeRef = useRef<THREE.PointLight>(null!);
  const homeRef = useRef<THREE.PointLight>(null!);
  const schoolRef = useRef<THREE.PointLight>(null!);
  const towersRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const b = boot.value;
    const flicker =
      b >= 1 ? 1 : Math.max(0.04, b * (0.82 + 0.18 * Math.sin(state.clock.elapsedTime * 47) * Math.sin(state.clock.elapsedTime * 13)));
    const k = b * b * (3 - 2 * b) * flicker;

    sunRef.current.intensity = rig.sun.intensity * k;
    ambRef.current.intensity = rig.ambient.intensity * k;
    hemiRef.current.intensity = rig.hemi.intensity * k;
    // neon accents live at night
    arcadeRef.current.intensity = 2.4 * rig.neon * k;
    homeRef.current.intensity = 1.6 * rig.neon * k;
    schoolRef.current.intensity = 1.4 * rig.neon * k;
    towersRef.current.intensity = 2.0 * rig.neon * k;
  });

  return (
    <>
      <ambientLight ref={ambRef} color={rig.ambient.color} intensity={rig.ambient.intensity} />
      <hemisphereLight ref={hemiRef} args={[rig.hemi.sky, rig.hemi.ground, rig.hemi.intensity]} />
      <directionalLight
        ref={sunRef}
        position={rig.sun.pos}
        color={rig.sun.color}
        intensity={rig.sun.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* District night light spills */}
      <pointLight ref={arcadeRef} position={[-3.2, 2.2, -2.2]} color="#ff5fd2" intensity={2.4} distance={7} decay={2} />
      <pointLight ref={homeRef} position={[-3.4, 1.6, 2.3]} color="#ffc078" intensity={1.6} distance={5} decay={2} />
      <pointLight ref={schoolRef} position={[3.2, 1.6, 2.8]} color="#ffd573" intensity={1.4} distance={5.5} decay={2} />
      <pointLight ref={towersRef} position={[3.6, 2.0, -1.1]} color="#38bdf8" intensity={2.0} distance={6.5} decay={2} />
    </>
  );
}
