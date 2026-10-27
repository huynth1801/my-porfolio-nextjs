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
