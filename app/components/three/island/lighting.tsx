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
    sun: { pos: [18, 28, 14], color: "#fff9ee", intensity: 3.2 },
    ambient: { color: "#e2f1ff", intensity: 1.15 },
    hemi: { sky: "#b8dcff", ground: "#756655", intensity: 0.8 },
    neon: 0,
  },
  golden: {
    sun: { pos: [26, 9, -4], color: "#ffa568", intensity: 3.4 },
    ambient: { color: "#ffe5cf", intensity: 0.75 },
    hemi: { sky: "#f0b68c", ground: "#6b5444", intensity: 0.6 },
    neon: 0.5,
  },
  night: {
    sun: { pos: [-14, 22, -12], color: "#9db4ff", intensity: 0.75 },
    ambient: { color: "#2d3760", intensity: 0.4 },
    hemi: { sky: "#2d3a66", ground: "#1f1d2b", intensity: 0.35 },
    neon: 1,
  },
};

export function getRig(): LightRig {
  return RIGS[getDayPhase()];
}

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
