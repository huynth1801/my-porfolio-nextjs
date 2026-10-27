"use client";

import { useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { boot } from "./boot";

export type DayPhase = "day" | "golden" | "night";

function phaseFromHour(h: number): DayPhase {
  if (h >= 7 && h <= 16) return "day";
  if (h >= 17 && h <= 18) return "golden";
  return "night";
}

const listeners = new Set<() => void>();
let currentPhase: DayPhase = (function () {
  let override: string | null = null;
  try {
    override = new URLSearchParams(window.location.search).get("phase");
  } catch {}
  if (override === "day" || override === "golden" || override === "night") return override;
  return phaseFromHour(new Date().getHours());
})();

export const phaseStore = {
  get: () => currentPhase,
  set: (p: DayPhase) => {
    currentPhase = p;
    listeners.forEach((fn) => fn());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useDayPhase(): DayPhase {
  return useSyncExternalStore(phaseStore.subscribe, phaseStore.get, () => "day");
}

export function getDayPhase(): DayPhase {
  return phaseStore.get();
}

type LightRig = {
  sun: { pos: [number, number, number]; color: string; intensity: number };
  ambient: { color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
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
  return RIGS[phaseStore.get()];
}

export function IslandLighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const ambRef = useRef<THREE.AmbientLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const arcadeRef = useRef<THREE.PointLight>(null!);
  const homeRef = useRef<THREE.PointLight>(null!);
  const schoolRef = useRef<THREE.PointLight>(null!);
  const towersRef = useRef<THREE.PointLight>(null!);

  const curSunColor = useRef(new THREE.Color(RIGS[currentPhase].sun.color));
  const curAmbColor = useRef(new THREE.Color(RIGS[currentPhase].ambient.color));
  const curNeon = useRef(RIGS[currentPhase].neon);
  const curSunIntensity = useRef(RIGS[currentPhase].sun.intensity);
  const curAmbIntensity = useRef(RIGS[currentPhase].ambient.intensity);

  useFrame((state, delta) => {
    const phase = phaseStore.get();
    const targetRig = RIGS[phase];

    // Smoothly transition between day / golden / night
    const lerpSpeed = 1 - Math.exp(-3.0 * delta);
    curSunColor.current.lerp(new THREE.Color(targetRig.sun.color), lerpSpeed);
    curAmbColor.current.lerp(new THREE.Color(targetRig.ambient.color), lerpSpeed);
    curNeon.current += (targetRig.neon - curNeon.current) * lerpSpeed;
    curSunIntensity.current += (targetRig.sun.intensity - curSunIntensity.current) * lerpSpeed;
    curAmbIntensity.current += (targetRig.ambient.intensity - curAmbIntensity.current) * lerpSpeed;

    const b = boot.value;
    const flicker =
      b >= 1
        ? 1
        : Math.max(
            0.04,
            b *
              (0.82 +
                0.18 *
                  Math.sin(state.clock.elapsedTime * 47) *
                  Math.sin(state.clock.elapsedTime * 13)),
          );
    const k = b * b * (3 - 2 * b) * flicker;

    if (sunRef.current) {
      sunRef.current.intensity = curSunIntensity.current * k;
      sunRef.current.color.copy(curSunColor.current);
    }
    if (ambRef.current) {
      ambRef.current.intensity = curAmbIntensity.current * k;
      ambRef.current.color.copy(curAmbColor.current);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = targetRig.hemi.intensity * k;
    }
    if (arcadeRef.current) {
      arcadeRef.current.intensity = 2.4 * curNeon.current * k;
    }
    if (homeRef.current) {
      homeRef.current.intensity = 1.6 * curNeon.current * k;
    }
    if (schoolRef.current) {
      schoolRef.current.intensity = 1.4 * curNeon.current * k;
    }
    if (towersRef.current) {
      towersRef.current.intensity = 2.0 * curNeon.current * k;
    }
  });

  const init = RIGS[currentPhase];

  return (
    <>
      <ambientLight ref={ambRef} color={init.ambient.color} intensity={init.ambient.intensity} />
      <hemisphereLight ref={hemiRef} args={[init.hemi.sky, init.hemi.ground, init.hemi.intensity]} />
      <directionalLight
        ref={sunRef}
        position={init.sun.pos}
        color={init.sun.color}
        intensity={init.sun.intensity}
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
