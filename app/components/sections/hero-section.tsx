"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, FileDown, Rocket } from "lucide-react";
import { profile } from "@/lib/content";
import { journey } from "@/lib/journey-store";

gsap.registerPlugin(useGSAP);

/**
 * Full-screen opener. The visible "HUY" is drawn by the particle canvas
 * behind this section — real HTML text lives in the sr-only h1 so search
 * engines and screen readers still get the full name.
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
        delay: 0.9,
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
      className="relative flex min-h-screen flex-col items-center justify-end px-6 pb-32 text-center"
    >
      <h1 className="sr-only">{profile.name} — {profile.role}</h1>

      <p
        data-hero-reveal
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm"
      >
        {profile.role} · {profile.location}
      </p>

      <p
        data-hero-reveal
        className="max-w-xl text-balance text-lg leading-relaxed text-gray-300 md:text-xl"
      >
        {profile.tagline}
      </p>

      <div data-hero-reveal className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#projects"
          className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-violet-400 px-6 py-3 text-sm font-semibold text-gray-950 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Rocket className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
          Explore projects
        </a>
        <a
          href={profile.resume}
          download
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10"
        >
          <FileDown className="size-4" />
          Download CV
        </a>
      </div>

      {/* bottom HUD — game flavor, kept subtle */}
      <div className="absolute inset-x-0 bottom-8 flex items-end justify-between px-6 md:px-12">
        <a
          href="#about"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gray-500 transition-colors hover:text-gray-300"
        >
          <ChevronDown className="size-4 animate-bounce" />
          Scroll to play
        </a>
        <div className="hidden gap-2 md:flex">
          {["React", "Next.js", "TypeScript", "WebGL"].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-400 backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
