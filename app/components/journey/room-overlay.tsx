"use client";

import { useEffect, useRef } from "react";
import { journey, clamp01 } from "@/lib/journey-store";
import { hotspotStore } from "@/app/components/three/island/hotspot-store";
import { getTerminalSnapshot } from "@/lib/terminal-store";

/** Floating label that follows the cursor while a 3D hotspot is hovered. */
export function HotspotTooltip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        if (hotspotStore.active && !getTerminalSnapshot().isOpen) {
          el.textContent = hotspotStore.label;
          // keep the tooltip inside the viewport: flip above the cursor near
          // the bottom edge, pull left near the right edge (the tour HUD and
          // waypoint label live in that corner)
          const w = el.offsetWidth || 120;
          const h = el.offsetHeight || 30;
          let tx = hotspotStore.x + 16;
          let ty = hotspotStore.y + 18;
          if (tx + w > window.innerWidth - 12) tx = hotspotStore.x - w - 14;
          if (ty + h > window.innerHeight - 90) ty = hotspotStore.y - h - 14;
          el.style.transform = `translate(${Math.max(8, tx)}px, ${Math.max(8, ty)}px)`;
          el.style.opacity = "1";
        } else {
          el.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[70] rounded-md border border-cyan-400/40 bg-[#0d0d0f]/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-cyan-200 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-150"
    />
  );
}

/** Dark veil over the room so glass sections stay readable while scrolling. */
export function RoomDimmer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        // fade in during the hero → about hand-off, then hold
        const t = clamp01((journey.progress - 0.03) / 0.12);
        el.style.opacity = String(t * 0.72);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 bg-[#070913] opacity-0"
    />
  );
}
