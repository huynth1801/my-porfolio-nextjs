"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, MousePointerClick, Play, Rocket, Terminal, Compass } from "lucide-react";
import { profile } from "@/lib/content";
import { journey } from "@/lib/journey-store";
import { useAchievements } from "@/lib/achievements";
import { startStory } from "@/app/components/three/island/story-store";
import { openTerminal, useTerminal } from "@/lib/terminal-store";

gsap.registerPlugin(useGSAP);

/**
 * Cyber Game Dev / High-Tech RPG Pilot HUD Opener.
 * Sits over the interactive 3D island diorama.
 * Ignores pointer events on the background canvas while keeping interactive pills clickable.
 */
export function HeroSection() {
  const ach = useAchievements();
  const { isOpen: isTerminalOpen } = useTerminal();
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (journey.reduced) return;
      gsap.from("[data-hero-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        delay: 0.6,
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
      className="pointer-events-none relative flex min-h-screen flex-col items-start justify-end px-5 pb-24 text-left sm:px-8 md:px-14 lg:px-20"
    >
      {/* High-contrast bottom gradient so text stays ultra-crisp over 3D lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07080b]/90 via-[#07080b]/40 to-transparent"
      />

      <div
        data-hero-reveal
        className={`relative z-10 max-w-2xl mb-4 transition-opacity duration-300 ${
          isTerminalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Top Tactical Telemetry Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/35 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYS.ACT // LEVEL 4 · FRONTEND ARCHITECT
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            <span className="size-1 rounded-full bg-cyan-400" />
            {profile.location} (GMT+7)
          </span>
        </div>

        {/* Cinematic High-Impact Tagline */}
        <h1 className="mt-3.5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight">
          <span className="sr-only">Huy Nguyen · Frontend Developer & Creative Technologist. </span>
          Crafting high-performance web systems with game-feel & 3D WebGL.
        </h1>

        <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-gray-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
          {profile.tagline}
        </p>

        {/* Action Pills */}
        <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all duration-200 hover:bg-cyan-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Rocket className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span>Khám phá Projects</span>
          </a>

          <button
            onClick={() => startStory(0)}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-black/80 hover:border-cyan-400/50 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Play className="size-3.5 text-cyan-300 fill-cyan-300" />
            <span>Xem Story Tour</span>
          </button>

          <button
            onClick={() => openTerminal()}
            className="hidden sm:inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-medium text-gray-300 backdrop-blur-md transition-colors duration-200 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Kích hoạt Retro Terminal (phím ~)"
          >
            <Terminal className="size-3.5 text-emerald-400" />
            <span>Terminal</span>
            <kbd className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-gray-400">
              ~
            </kbd>
          </button>
        </div>

        {/* Telemetry Strip: Controls & Exploration Gauge */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-mono text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded border border-cyan-400/30 bg-cyan-950/40 text-[9px] text-cyan-300 font-bold backdrop-blur-xs">
              WASD
            </span>
            <span>Di chuyển phi hành gia</span>
          </span>
          <span className="text-white/30">|</span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="size-3.5 text-cyan-300" />
            <span>Xoay đảo 3D</span>
          </span>
          <span className="text-white/30">|</span>
          <span className="inline-flex items-center gap-1.5 text-white/90">
            <Compass className="size-3.5 text-amber-300" />
            <span>Waypoint:</span>
            <span className="text-cyan-300 font-bold">{ach.visited}/6</span>
          </span>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="absolute inset-x-0 bottom-6 flex items-end justify-between px-5 sm:px-8 md:px-14 lg:px-20">
        <a
          href="#about"
          className="pointer-events-auto group inline-flex min-h-[44px] items-center gap-2 text-xs font-mono tracking-[0.2em] text-gray-400 uppercase transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
        >
          <ChevronDown className="size-4 animate-bounce text-cyan-400" />
          <span>Scroll to explore</span>
        </a>

        <div className="hidden gap-2 md:flex items-center">
          {["React 19", "Next.js 16", "TypeScript", "Three.js / R3F", "Tailwind v4"].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-[#0d0f18]/70 px-2.5 py-1 text-[11px] font-mono font-medium text-gray-400 backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
