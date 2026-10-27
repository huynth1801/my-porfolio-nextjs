"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ExternalLink,
  Gamepad2,
  Gauge,
  Github,
  Globe,
  Linkedin,
  Mail,
  Rocket,
  ShoppingBag,
  X,
} from "lucide-react";
import { usePanel, panelStore } from "@/lib/panel-store";
import { journey } from "@/lib/journey-store";
import {
  educations,
  experiences,
  profile,
  projects,
  skillGroups,
  strengths,
  type PanelKey,
} from "@/lib/content";

const LABELS: Record<PanelKey, string> = {
  about: "About me",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  contact: "Contact",
};

const PROJECT_ICONS = {
  store: ShoppingBag,
  clapperboard: ExternalLink,
  gamepad: Gamepad2,
  globe: Globe,
} as const;

const STRENGTH_ICONS = { gamepad: Gamepad2, gauge: Gauge, rocket: Rocket } as const;

/* -------------------------------------------------------------- */
/* Compact panel content                                           */
/* -------------------------------------------------------------- */

function AboutContent() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Image
          src="/huy.jpg"
          alt={profile.name}
          width={72}
          height={72}
          className="size-18 rounded-xl border border-white/10 object-cover"
        />
        <div>
          <p className="font-semibold text-white">{profile.fullName}</p>
          <p className="text-sm text-cyan-300">{profile.role}</p>
          <p className="text-xs text-gray-500">{profile.location}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-400">{profile.tagline}</p>

      <div className="space-y-2.5">
        {strengths.map((s) => {
          const Icon = STRENGTH_ICONS[s.icon];
          return (
            <div key={s.title} className="flex items-start gap-3 rounded-lg bg-white/[0.04] p-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-cyan-300" />
              <div>
                <p className="text-sm font-medium text-gray-200">{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="panel-link">
          <Github className="size-4" /> GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="panel-link">
          <Linkedin className="size-4" /> LinkedIn
        </a>
      </div>
    </div>
  );
}

function ExperienceContent() {
  return (
    <div className="space-y-4">
      {experiences.map((exp) => (
        <article key={exp.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              {exp.title} <span className="text-cyan-300">· {exp.company}</span>
            </p>
            <span className="shrink-0 text-[11px] text-gray-500">{exp.duration}</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{exp.summary}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {exp.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">
                {skill}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectsContent() {
  return (
    <div className="space-y-3">
      {projects.map((p) => {
        const Icon = PROJECT_ICONS[p.icon];
        return (
          <article key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${p.accent}22`, color: p.accent }}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                <p className="text-xs" style={{ color: p.accent }}>{p.tagline}</p>
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-gray-400">{p.description}</p>
            <div className="mt-3 flex items-center gap-4 text-xs">
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noopener noreferrer" className="panel-link !text-xs">
                  Live demo
                </a>
              )}
              {p.repo && (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="panel-link !text-xs">
                  Source
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="space-y-5">
      {skillGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EducationContent() {
  return (
    <div className="space-y-3">
      {educations.map((edu) => (
        <article key={edu.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-white">{edu.degree}</p>
            <span className="shrink-0 text-[11px] text-gray-500">
              {edu.startDate} — {edu.endDate}
            </span>
          </div>
          <p className="mt-1 text-xs text-cyan-300">{edu.school}</p>
          {edu.description && (
            <p className="mt-2 text-xs leading-relaxed text-gray-400">{edu.description}</p>
          )}
        </article>
      ))}
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-gray-400">
        My inbox is always in player-ready state — pick any channel below.
      </p>
      <a href={`mailto:${profile.email}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-cyan-400/40">
        <Mail className="size-4 text-cyan-300" />
        <span className="text-sm font-medium text-gray-200">{profile.email}</span>
      </a>
      <div className="grid grid-cols-2 gap-3">
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="panel-link justify-center !py-3">
          <Linkedin className="size-4" /> LinkedIn
        </a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="panel-link justify-center !py-3">
          <Github className="size-4" /> GitHub
        </a>
      </div>
      <a href="/contact" className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-violet-400 py-3 text-sm font-semibold text-gray-950 transition-transform hover:scale-[1.02]">
        <Rocket className="size-4" /> Open the contact form
      </a>
    </div>
  );
}

const CONTENT: Record<PanelKey, () => React.ReactElement> = {
  about: AboutContent,
  experience: ExperienceContent,
  projects: ProjectsContent,
  skills: SkillsContent,
  education: EducationContent,
  contact: ContactContent,
};

/* -------------------------------------------------------------- */
/* Overlay shell                                                   */
/* -------------------------------------------------------------- */

export function PanelOverlay() {
  const key = usePanel();

  useEffect(() => {
    if (!key) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") panelStore.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key]);

  const Content = key ? CONTENT[key] : null;

  return (
    <AnimatePresence>
      {key && Content && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => panelStore.close()}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={LABELS[key]}
            className="absolute inset-x-0 bottom-0 flex max-h-[78vh] flex-col rounded-t-2xl border border-white/10 bg-[#12121a]/95 shadow-2xl backdrop-blur-xl sm:inset-y-auto sm:top-24 sm:bottom-6 sm:left-auto sm:right-6 sm:max-h-none sm:w-[430px] sm:rounded-2xl"
            initial={{ opacity: 0, x: 48, y: 32 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 48, y: 32 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold tracking-wide text-white">
                <span className="mr-2 inline-block size-1.5 rounded-full bg-cyan-400 align-middle" />
                {LABELS[key]}
              </p>
              <button
                onClick={() => panelStore.close()}
                aria-label="Close panel"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-white/25 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5" data-lenis-prevent>
              <Content />
            </div>

            <footer className="border-t border-white/10 px-5 py-3">
              <button
                onClick={() => {
                  panelStore.close();
                  requestAnimationFrame(() =>
                    journey.lenis?.scrollTo(`#${key}`, { offset: -64, duration: 1.6 }),
                  );
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cyan-300/90 transition-colors hover:text-cyan-200"
              >
                <ArrowDown className="size-3.5" />
                Jump to the full {LABELS[key].toLowerCase()} section
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
