"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey, tourState, TOUR_WAYPOINTS, clamp01, smoothstep } from "@/lib/journey-store";

gsap.registerPlugin(ScrollTrigger);

function shortestAngle(from: number, to: number): number {
  const diff = (to - from) % (Math.PI * 2);
  const normalized = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return from + normalized;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Wires Lenis smooth scroll into GSAP and continuously updates the 3D drone
 * camera flight trajectory through the 5 island districts as the user scrolls.
 */
export function SmoothScroll() {
  useEffect(() => {
    journey.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      lerp: 0.1,
      anchors: true,
      wheelMultiplier: 1,
    });
    journey.lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Compute centers of all 7 sections
    const updateWaypoints = () => {
      const scrollCenter = window.scrollY + window.innerHeight * 0.45;
      const centers: number[] = [];

      for (let i = 0; i < TOUR_WAYPOINTS.length; i++) {
        const el = document.getElementById(TOUR_WAYPOINTS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const docTop = rect.top + window.scrollY;
          // For hero (#home), center is near top
          const c = i === 0 ? 0 : docTop + rect.height * 0.35;
          centers.push(c);
        } else {
          centers.push(i * 1000);
        }
      }

      // Find which segment we are currently in
      let seg = 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (scrollCenter >= centers[i]) {
          seg = i;
        }
      }

      if (scrollCenter <= centers[0]) {
        const w = TOUR_WAYPOINTS[0];
        tourState.targetPivot = [...w.pivot];
        tourState.targetRadius = w.radius;
        tourState.targetYaw = w.yaw;
        tourState.targetPitch = w.pitch;
        tourState.activeWaypointIndex = 0;
        tourState.activeWaypointId = w.id;
      } else if (scrollCenter >= centers[centers.length - 1]) {
        const w = TOUR_WAYPOINTS[TOUR_WAYPOINTS.length - 1];
        tourState.targetPivot = [...w.pivot];
        tourState.targetRadius = w.radius;
        tourState.targetYaw = w.yaw;
        tourState.targetPitch = w.pitch;
        tourState.activeWaypointIndex = TOUR_WAYPOINTS.length - 1;
        tourState.activeWaypointId = w.id;
      } else {
        const wA = TOUR_WAYPOINTS[seg];
        const wB = TOUR_WAYPOINTS[seg + 1];
        const dist = Math.max(1, centers[seg + 1] - centers[seg]);
        const rawT = clamp01((scrollCenter - centers[seg]) / dist);
        const t = smoothstep(rawT);

        tourState.targetPivot = [
          lerp(wA.pivot[0], wB.pivot[0], t),
          lerp(wA.pivot[1], wB.pivot[1], t),
          lerp(wA.pivot[2], wB.pivot[2], t),
        ];
        tourState.targetRadius = lerp(wA.radius, wB.radius, t);
        tourState.targetPitch = lerp(wA.pitch, wB.pitch, t);
        const targetB = shortestAngle(wA.yaw, wB.yaw);
        tourState.targetYaw = lerp(wA.yaw, targetB, t);

        const activeIdx = t < 0.5 ? seg : seg + 1;
        tourState.activeWaypointIndex = activeIdx;
        tourState.activeWaypointId = TOUR_WAYPOINTS[activeIdx].id;
      }
    };

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        journey.progress = self.progress;
        updateWaypoints();
      },
    });
    journey.progress = trigger.progress;
    updateWaypoints();

    window.addEventListener("resize", updateWaypoints);

    const onPointerMove = (e: PointerEvent) => {
      journey.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journey.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      gsap.ticker.remove(raf);
      trigger.kill();
      lenis.destroy();
      journey.lenis = null;
      window.removeEventListener("resize", updateWaypoints);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
