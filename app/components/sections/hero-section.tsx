"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, FileDown, MousePointerClick, Play, Rocket } from "lucide-react";
import { profile } from "@/lib/content";
import { journey } from "@/lib/journey-store";
import { startStory } from "@/app/components/three/island/story-store";

gsap.registerPlugin(useGSAP);

/**
 * Full-screen opener over the 3D workspace room. The section itself ignores
 * pointer events so the room stays draggable; interactive children opt back
 * in. A sr-only h1 keeps the full name in the document for SEO/a11y.
 */
export function HeroSection() {
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
      className="pointer-events-none relative flex min-h-screen flex-col items-start justify-end px-6 pb-28 text-left md:px-16"
    >
      {/* scrim so the HUD always reads over the room, at any viewport size */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[#0d0d0f]/90 via-[#0d0d0f]/45 to-transparent"
      />

      <h1 className="sr-only">{profile.name} — {profile.role}</h1>

      <div
        data-hero-reveal
        className="glass relative w-full max-w-md rounded-2xl p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl border border-white/12 md:p-7"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
            WAYPOINT 01 // OVERVIEW
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            {profile.location}
          </span>
        </div>

        <p className="mt-4 text-pretty text-lg leading-relaxed text-gray-100">
          {profile.tagline}
        </p>

        <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-violet-400 px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] transition-transform duration-200 hover:scale-[1.04] active:scale-95"
          >
            <Rocket className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Explore projects
          </a>
          <a
            href={profile.resume}
            download
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <FileDown className="size-4" />
            Download CV
          </a>
          <button
            onClick={() => startStory(0)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Play className="size-4" />
            Watch my story
          </button>
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <MousePointerClick className="size-3.5 shrink-0 text-cyan-400" />
          Drag to orbit the island — click districts to explore the journey
        </p>
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
