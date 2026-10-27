import type { Vector3 } from "three";

/**
 * Mutable, render-free scroll/pointer state shared between the DOM world
 * (SmoothScroll writes it) and the WebGL world (Scene reads it every frame).
 * Deliberately not React state — updating this never triggers a re-render.
 */
export type JourneyKey = {
  /** scroll progress 0..1 at which the camera arrives at this pose */
  f: number;
  pos: Vector3;
  look: Vector3;
};

export type JourneyTier = "high" | "low";

export const journey = {
  /** 0..1 progress through the whole page scroll */
  progress: 0,
  /** pointer position in NDC (-1..1, y up) */
  pointer: { x: 0, y: 0 },
  /** camera keyframes measured from the DOM, sorted by f */
  keys: [] as JourneyKey[],
  /** prefers-reduced-motion */
  reduced: false,
  /** particle/geometry budget decided from device */
  tier: "high" as JourneyTier,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
