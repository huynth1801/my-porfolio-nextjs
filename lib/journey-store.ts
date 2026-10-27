import type Lenis from "lenis";

/**
 * Mutable, render-free state shared between the DOM world (SmoothScroll
 * writes it) and the WebGL world (the room scene reads it every frame).
 * Deliberately not React state — updating this never triggers a re-render.
 */
export type JourneyTier = "high" | "low";

export const journey = {
  /** 0..1 progress through the whole page scroll */
  progress: 0,
  /** pointer position in NDC (-1..1, y up) */
  pointer: { x: 0, y: 0 },
  /** prefers-reduced-motion */
  reduced: false,
  /** geometry/shadow budget decided from device */
  tier: "high" as JourneyTier,
  /** the Lenis instance, so 3D hotspots can scroll to sections */
  lenis: null as Lenis | null,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
