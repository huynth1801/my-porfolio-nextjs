/**
 * Bridge between 3D hotspot hover events (inside the Canvas) and the
 * HTML tooltip that follows the cursor (outside the Canvas).
 * Written from R3F pointer handlers, read from a rAF loop — no re-renders.
 */
export const hotspotStore = {
  active: false,
  /** client-space cursor position */
  x: 0,
  y: 0,
  label: "",
};

/** Shared state for the room's non-navigational toys (chair spin, cat). */
export const toyStore = {
  /** chair spins to this accumulated target (radians) */
  spinTarget: 0,
  /** incremented every time the cat gets poked */
  catPokes: 0,
};
