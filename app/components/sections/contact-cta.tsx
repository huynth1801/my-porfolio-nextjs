import { ArrowRight, FileDown, Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/lib/content";

/**
 * The end of the scroll journey — one clear call to action, with every
 * way to reach Huy visible without leaving the page.
 */
export function ContactCta() {
  return (
    <section
      id="contact"
      data-zone="contact"
      className="pointer-events-auto relative flex min-h-[92vh] flex-col items-center justify-center px-6 py-28 text-center"
    >
      <div className="glass max-w-2xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/12 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
            WAYPOINT 07 // BROADCAST STATION
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            Signal Active
          </span>
        </div>

        <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
          Let&apos;s build the next level together.
        </h2>

        <p className="mt-4 max-w-lg text-pretty leading-relaxed text-gray-300">
          Looking for a frontend developer who cares about how a product feels, not just how it
          looks? My inbox is always in player-ready state.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-violet-400 px-6 py-3 text-sm font-semibold text-gray-950 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] transition-transform duration-200 hover:scale-[1.04] active:scale-95"
          >
            <Mail className="size-4" />
            {profile.email}
          </a>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10"
          >
            Use the contact form
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
          >
            <Github className="size-4.5" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
          >
            <Linkedin className="size-4.5" />
          </a>
          <a
            href={profile.resume}
            download
            aria-label="Download resume"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
          >
            <FileDown className="size-4.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
