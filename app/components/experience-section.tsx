"use client";

import { memo, useCallback, useState } from "react";
import { ChevronDown, Award, Briefcase } from "lucide-react";
import { experiences, type Experience } from "@/lib/content";

const QUEST_STATUS: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  "01": {
    label: "MAIN QUEST · IN PROGRESS",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClass: "bg-emerald-400 animate-pulse",
  },
  "02": {
    label: "CAMPAIGN COMPLETED",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    dotClass: "bg-cyan-400",
  },
  "03": {
    label: "MENTORSHIP CONTRACT",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    dotClass: "bg-purple-400",
  },
  "04": {
    label: "ORIGINS · GAME LOOP TUTORIAL",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClass: "bg-amber-400",
  },
};

const TimelineItemContent = memo(function TimelineItemContent({ item }: { item: Experience }) {
  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-3">
        {item.responsibilities.map((responsibility, idx) => (
          <div key={`${item.id}-resp-${idx}`} className="group flex items-start gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <p className="text-sm leading-relaxed text-gray-300">{responsibility}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
        {item.skills.map((skill) => (
          <span
            key={`${item.id}-skill-${skill}`}
            className="rounded-md border border-white/10 bg-[#0e111a] px-2.5 py-1 text-xs font-mono font-medium text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
});
TimelineItemContent.displayName = "TimelineItemContent";

function TimelineItem({
  item,
  expanded,
  onToggle,
}: {
  item: Experience;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const headerId = `timeline-header-${item.id}`;
  const contentId = `timeline-content-${item.id}`;
  const questMeta = QUEST_STATUS[item.index] ?? {
    label: "MISSION RECORD",
    badgeClass: "border-white/15 bg-white/5 text-gray-300",
    dotClass: "bg-gray-400",
  };

  return (
    <div className="relative">
      {/* Background Watermark Quest Number */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 -left-2 text-7xl font-mono font-black text-white/[0.03] select-none md:-left-12 md:text-8xl"
      >
        {item.index}
      </span>

      <div
        className={`glass rounded-2xl border transition-all duration-300 ${
          expanded
            ? "border-cyan-400/40 shadow-[0_0_35px_-10px_rgba(34,211,238,0.25)]"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <button
          id={headerId}
          className="w-full cursor-pointer rounded-2xl p-5 text-left transition-colors duration-200 md:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          onClick={() => onToggle(item.id)}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {/* Quest Milestone Chip */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${questMeta.badgeClass}`}
                >
                  <span className={`size-1.5 rounded-full ${questMeta.dotClass}`} />
                  {questMeta.label}
                </span>
                <span className="font-mono text-xs text-gray-400">{item.duration}</span>
              </div>

              {/* Title & Organization */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-sm font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-cyan-400" />
                  {item.company}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{item.summary}</p>
            </div>

            <div
              className={`mt-1 shrink-0 flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all duration-200 ${
                expanded ? "rotate-180 border-cyan-400/30 text-cyan-300 bg-cyan-950/30" : ""
              }`}
            >
              <ChevronDown className="size-4" />
            </div>
          </div>
        </button>

        {expanded && (
          <div
            id={contentId}
            role="region"
            aria-labelledby={headerId}
            className="border-t border-white/10 px-5 pb-6 md:px-6"
          >
            <TimelineItemContent item={item} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperienceSection() {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(experiences.map((item) => item.id)),
  );

  const onToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <section
      id="experience"
      className="pointer-events-auto relative px-5 py-24 sm:px-8 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section Header Card */}
        <div className="glass mb-10 rounded-2xl p-6 sm:p-8 md:p-9 border border-white/12 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
                WAYPOINT 03 // CAREER QUEST LOG
              </span>
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <Award className="size-3.5 text-amber-400" />4 Verified Campaigns
              </span>
            </div>
            <span className="font-mono text-[11px] text-gray-400">2021 – 2026 Present</span>
          </div>

          <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Career Journey & Milestones
          </h2>
          <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-gray-300">
            Hành trình tiến hóa qua 4 cột mốc: từ nghiên cứu game loop 2D/3D tại Onechain, giảng dạy
            lập trình frontend tại Likelion, đến thiết kế và vận hành các hệ thống web quy mô tại
            TGM Research.
          </p>
        </div>

        {/* Timeline Track with Cyber Indicators */}
        <div className="relative">
          <div className="absolute top-0 bottom-0 hidden w-px bg-linear-to-b from-cyan-400/40 via-white/15 to-transparent md:left-8 md:block" />

          {experiences.map((item) => (
            <div key={item.id} data-zone={`exp-${item.index}`} className="relative py-6 md:py-8">
              <div className="absolute top-12 left-0 hidden size-4 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-[#07080b] shadow-[0_0_12px_rgba(34,211,238,0.8)] md:left-6 md:block" />
              <div className="md:pl-16">
                <TimelineItem item={item} expanded={expanded.has(item.id)} onToggle={onToggle} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExperienceSection;
