"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, MousePointerClick, Play, Rocket } from "lucide-react";
import { profile } from "@/lib/content";
import { journey } from "@/lib/journey-store";
import { useAchievements } from "@/lib/achievements";
import { startStory } from "@/app/components/three/island/story-store";

gsap.registerPlugin(useGSAP);

/**
 * Full-screen opener over the 3D workspace room. The section itself ignores
 * pointer events so the room stays draggable; interactive children opt back
 * in. A sr-only h1 keeps the full name in the document for SEO/a11y.
 */
export function HeroSection() {
  const ach = useAchievements();
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (journey.reduced) return;
      gsap.from("[data-hero-reveal]", {
        y: 26,
        opacity: 0,
        duration: 0.9,
        stagger: 0.14,
        delay: 0.7,
        ease: "power3.out",
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="home"
      data-zone="hero"
      className="pointer-events-none relative flex min-h-screen flex-col items-start justify-end px-6 pb-24 text-left md:px-14"
    >
      {/* Subtle bottom edge gradient so text stays legible without darkening the 3D diorama */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/45 to-transparent pointer-events-none"
      />

      <div data-hero-reveal className="relative max-w-xl mb-4">
        {/* Breadcrumb Tagline */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-black/45 border border-white/15 backdrop-blur-md shadow-md">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            OVERVIEW // DIORAMA
          </span>
          <span className="text-[11px] font-mono font-medium text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {profile.location}
          </span>
        </div>

        {/* Cinematic Headline Tagline (Borderless Typography) */}
        <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] leading-snug">
          {profile.tagline}
        </h1>

        {/* Minimalist Floating Action Micro-Capsules */}
        <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-2.5">
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-950 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-200 hover:bg-neutral-100 hover:scale-[1.03] active:scale-95"
          >
            <Rocket className="size-3.5 sm:size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span>Explore projects</span>
          </a>

          <button
            onClick={() => startStory(0)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-black/75 hover:border-white/40 hover:scale-[1.03] active:scale-95"
          >
            <Play className="size-3.5 sm:size-4 text-cyan-300 fill-cyan-300" />
            <span>Watch story</span>
          </button>
        </div>

        {/* Subtle Tutorial Hint & Exploration Telemetry */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4.5 items-center justify-center rounded border border-white/20 bg-black/40 text-[9px] text-cyan-300 font-bold backdrop-blur-xs">
              WASD
            </span>
            <span>dạo chơi</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="size-3 text-cyan-300" />
            <span>Xoay đảo 3D</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">Khám phá {ach.visited}/6</span>
        </div>
      </div>

      {/* bottom HUD — game flavor, kept subtle */}
      <div className="absolute inset-x-0 bottom-8 flex items-end justify-between px-6 md:px-12">
        <a
          href="#about"
          className="pointer-events-auto group flex items-center gap-2 text-xs tracking-[0.25em] text-gray-500 uppercase transition-colors hover:text-gray-300"
        >
          <ChevronDown className="size-4 animate-bounce" />
          Scroll to play
        </a>
        <div className="hidden gap-2 md:flex">
          {["React", "Next.js", "TypeScript", "WebGL"].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-[#0d0d0f]/60 px-2.5 py-1 text-[11px] font-medium text-gray-400 backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
