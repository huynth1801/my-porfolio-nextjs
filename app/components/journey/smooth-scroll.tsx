"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey } from "@/lib/journey-store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires Lenis smooth scroll into GSAP's ticker and publishes global scroll
 * progress + pointer position into the shared journey store (no re-renders).
 */
export function SmoothScroll() {
  useEffect(() => {
    journey.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      // A touch of floatiness; ScrollTrigger scrub adds its own smoothing on top
      lerp: 0.11,
      anchors: true,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        journey.progress = self.progress;
      },
    });
    journey.progress = trigger.progress;

    const onPointerMove = (e: PointerEvent) => {
      journey.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journey.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      gsap.ticker.remove(raf);
      trigger.kill();
      lenis.destroy();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
