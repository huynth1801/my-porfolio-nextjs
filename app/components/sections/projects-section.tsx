"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Clapperboard, ExternalLink, Gamepad2, Github, Globe, ShoppingBag } from "lucide-react";
import { projects, type Project } from "@/lib/content";

const ICONS = {
  store: ShoppingBag,
  clapperboard: Clapperboard,
  gamepad: Gamepad2,
  globe: Globe,
} as const;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = ICONS[project.icon];

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.12, ease: "easeOut" }}
    >
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-white/20 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* accent wash */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ backgroundColor: project.accent }}
        />

        <div className="mb-5 flex items-start justify-between">
          <div
            className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5"
            style={{ color: project.accent }}
          >
            <Icon className="size-6" />
          </div>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-gray-400">
            {project.year}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-white">{project.title}</h3>
        <p className="mt-0.5 text-sm" style={{ color: project.accent }}>
          {project.tagline}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 transition-colors hover:text-white"
            >
              <ExternalLink className="size-4" />
              Live demo
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              <Github className="size-4" />
              Source
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      data-zone="projects"
      className="pointer-events-auto relative px-6 py-28 md:px-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Selected work
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Projects worth a click
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
            Things you can actually open and use — from a real-time chat app to a game built in a
            game engine.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
