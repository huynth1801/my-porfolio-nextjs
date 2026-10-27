"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { journey } from "@/lib/journey-store";
import { HotspotTooltip, RoomDimmer } from "./room-overlay";

// WebGL is client-only by nature; the canvas mounts after we know the
// device can handle it. `Scene` must not be imported on the server.
const Scene = dynamic(() => import("@/app/components/three/scene"), { ssr: false });

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed full-screen backdrop for the whole site: the 3D workspace room.
 * Decides between the interactive room and a static gradient fallback
 * (reduced motion, no WebGL). Sections above keep `pointer-events` on
 * their interactive children only, so the room stays draggable/clickable.
 */
export function JourneyCanvas() {
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    journey.reduced = reduced;
    journey.tier = window.innerWidth < 768 ? "low" : "high";
    // one intentional transition after mount — the whole point of this effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(!reduced && webglAvailable() ? "3d" : "static");
  }, []);

  return (
    <>
      {/* NB: no negative z-index here — a -z child of <body> paints below the
          body box and can never be hit-tested, so hotspots would be dead. */}
      <div aria-hidden className="fixed inset-0">
        {/* Static ambient gradient — the fallback, and what shows before
            hydration so there is never a flash of bare black. */}
        <div className="ambient-bg absolute inset-0" />
        {mode === "3d" && <Scene />}
        <RoomDimmer />
      </div>
      <HotspotTooltip />
    </>
  );
}
