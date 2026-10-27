"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { journey } from "@/lib/journey-store";

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
 * Fixed full-screen backdrop for the whole site. Decides between the 3D
 * journey and a static gradient fallback (reduced motion, no WebGL).
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
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Static ambient gradient — always rendered: it is the fallback and
          stays behind the canvas so there is never a flash of bare black. */}
      <div className="ambient-bg absolute inset-0" />
      {mode === "3d" && <Scene />}
    </div>
  );
}
