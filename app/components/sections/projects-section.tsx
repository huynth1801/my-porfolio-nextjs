"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  Clapperboard,
  ExternalLink,
  Eye,
  Gamepad2,
  Github,
  Globe,
  Layers,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { projects, type Project, type ProjectCategory } from "@/lib/content";
import { sfx } from "@/lib/audio";

const ICONS = {
  store: ShoppingBag,
  clapperboard: Clapperboard,
  gamepad: Gamepad2,
  globe: Globe,
} as const;

const CATEGORY_TABS: { id: ProjectCategory; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "frontend", label: "Frontend & Web" },
  { id: "game_3d", label: "3D WebGL & Game" },
  { id: "fullstack", label: "Fullstack" },
];

function ProjectCard({
  project,
  index,
  onOpenModal,
}: {
  project: Project;
  index: number;
  onOpenModal: (project: Project) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = ICONS[project.icon];

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, delay: (index % 2) * 0.08, ease: "easeOut" }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 p-5 md:p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-white/25 hover:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]"
      >
        {/* Ambient accent wash */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ backgroundColor: project.accent }}
        />

        {/* Visual Mockup Screenshot Header */}
        <div className="relative mb-5 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
          {/* macOS Style Window Dots Bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-mono text-gray-400">
              <span
                className="size-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: project.accent }}
              />
              <span className="truncate max-w-[140px]">{project.title.toLowerCase()}.dev</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">{project.year}</span>
          </div>

          {/* Screenshot Image Container with Zoom & Quick View */}
          <div className="group/mockup relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
            <Image
              src={project.image}
              alt={`${project.title} mockup preview`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

            {/* Quick View Button on Hover */}
            <button
              onClick={() => {
                sfx.click();
                onOpenModal(project);
              }}
              className="absolute inset-0 m-auto flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white shadow-xl backdrop-blur-md opacity-0 transition-all duration-300 group-hover/mockup:opacity-100 group-hover/mockup:scale-105 hover:bg-white hover:text-black cursor-pointer"
              title="Xem chi tiết & ảnh mockup"
              aria-label={`Xem chi tiết ${project.title}`}
            >
              <Eye className="size-5" />
            </button>
          </div>
        </div>

        {/* Card Content Header */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5"
              style={{ color: project.accent }}
            >
              <Icon className="size-4" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">{project.title}</h3>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
            style={{
              backgroundColor: `${project.accent}15`,
              color: project.accent,
              borderColor: `${project.accent}30`,
            }}
          >
            {project.category === "fullstack"
              ? "Fullstack"
              : project.category === "game_3d"
                ? "3D & Game"
                : "Frontend"}
          </span>
        </div>

        <p className="text-xs font-medium" style={{ color: project.accent }}>
          {project.tagline}
        </p>

        <p className="mt-3 flex-1 text-xs md:text-sm leading-relaxed text-gray-300">
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.8 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={() => {
              sfx.click();
              onOpenModal(project);
            }}
            className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="size-3.5 text-cyan-400 transition-transform group-hover/btn:scale-110" />
            <span>Chi tiết & Kiến trúc</span>
          </button>

          <div className="flex items-center gap-3">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-all hover:text-white hover:underline underline-offset-4"
              >
                <ExternalLink className="size-3.5" />
                <span>Live demo</span>
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white"
                title="Xem mã nguồn trên GitHub"
              >
                <Github className="size-3.5" />
                <span>Source</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Client-side hydration safety for portal modal
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((p) =>
          p.categories.includes(activeTab as "fullstack" | "frontend" | "game_3d"),
        );

  const handleTabChange = (tabId: ProjectCategory) => {
    sfx.click();
    setActiveTab(tabId);
  };

  return (
    <section
      id="projects"
      data-zone="projects"
      className="pointer-events-auto relative px-5 py-24 sm:px-6 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section Header Box */}
        <div className="glass mb-8 max-w-xl rounded-2xl p-6 md:p-8 border border-white/12 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
              WAYPOINT 04 // PIXEL ARCADE
            </span>
            <span className="text-[11px] font-medium text-gray-400">Selected work</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Projects worth a click
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-300">
            Things you can actually open and use — from a full-stack e-commerce store to games and
            WebGL experiences.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "all"
                ? projects.length
                : projects.filter((p) =>
                    p.categories.includes(tab.id as "fullstack" | "frontend" | "game_3d"),
                  ).length;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-md ${
                  isActive
                    ? "bg-cyan-400 text-neutral-950 shadow-[0_0_16px_rgba(34,211,238,0.45)] scale-[1.02]"
                    : "border border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono transition-colors ${
                    isActive
                      ? "bg-black/25 text-neutral-950 font-bold"
                      : "bg-white/10 text-gray-400 group-hover:text-white"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid with AnimatePresence */}
        <motion.div layout className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpenModal={(p) => setSelectedProject(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Case Study / Detail Modal */}
      {mounted &&
        selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-gradient-to-b from-[#181824] to-[#0e0e16] p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Top Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5"
                    style={{ color: selectedProject.accent }}
                  >
                    {(() => {
                      const Icon = ICONS[selectedProject.icon];
                      return <Icon className="size-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {selectedProject.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm font-medium mt-0.5"
                      style={{ color: selectedProject.accent }}
                    >
                      {selectedProject.tagline}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sfx.click();
                    setSelectedProject(null);
                  }}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Đóng cửa sổ"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Large Mockup Showcase */}
              <div className="mt-5 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/12 shadow-inner bg-black">
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-300">
                {selectedProject.description}
              </p>

              {/* Technical Highlights */}
              {selectedProject.highlights && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2.5">
                    <Layers className="size-4 text-cyan-400" />
                    <span>Key Architecture & Features</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedProject.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack List */}
              <div className="mt-4">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Technology Stack:
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedProject.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer Links */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  {selectedProject.demo && (
                    <a
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Trải nghiệm Live Demo</span>
                    </a>
                  )}
                  {selectedProject.repo && (
                    <a
                      href={selectedProject.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <Github className="size-3.5" />
                      <span>Xem mã nguồn</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
