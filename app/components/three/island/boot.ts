"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { journey } from "@/lib/journey-store";

/**
 * Boot sequence state: 0 = room dark, monitor off; 1 = everything on.
 * GSAP flickers it on at mount; every consumer (lights, clock texture)
 * reads `boot.value` per frame — no re-renders involved.
 */
export const boot = { value: 0 };

export function startBoot() {
  if (journey.reduced) {
    boot.value = 1;
    return;
  }
  // stutter like an old power strip: on… dip… on fully
  gsap.to(boot, {
    keyframes: [
      { value: 0.35, duration: 0.45 },
      { value: 0.12, duration: 0.2 },
      { value: 0.75, duration: 0.5 },
      { value: 0.55, duration: 0.18 },
      { value: 1, duration: 1.1 },
    ],
    delay: 0.25,
  });
}

/** True while the boot sequence is still running. */
export function isBooting() {
  return boot.value < 1;
}

export function useBoot() {
  useEffect(() => {
    startBoot();
  }, []);
}
