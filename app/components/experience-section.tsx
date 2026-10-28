"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { experiences, type Experience } from "@/lib/content";

const TimelineItemContent = memo(function TimelineItemContent({ item }: { item: Experience }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-3">
        {item.responsibilities.map((responsibility, idx) => (
          <div key={`${item.id}-resp-${idx}`} className="group flex items-start gap-3">
            <div className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-500 transition-colors duration-200 group-hover:bg-cyan-400" />
            <p className="text-sm leading-relaxed text-gray-400">{responsibility}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {item.skills.map((skill) => (
          <span
            key={`${item.id}-skill-${skill}`}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-gray-300"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* checkpoint number — echoes the 3D gate you just flew through */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 -left-2 text-6xl font-bold text-white/5 select-none md:-left-16 md:text-7xl"
      >
        {item.index}
      </span>

      <div
        className={`glass rounded-2xl transition-all duration-300 hover:border-white/20 ${
          expanded ? "border-cyan-400/30 shadow-[0_0_40px_-12px_rgba(34,211,238,0.25)]" : ""
        }`}
      >
        <button
          id={headerId}
          className="w-full cursor-pointer rounded-t-2xl p-5 text-left transition-colors duration-200 md:p-6"
          onClick={() => onToggle(item.id)}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-lg leading-tight font-semibold text-white">{item.title}</h3>
                <span className="text-sm font-medium text-cyan-300">{item.company}</span>
              </div>
              <p className="text-sm text-gray-400">{item.summary}</p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-semibold text-gray-300">
                  {item.type}
                </span>
                <span className="text-gray-500">{item.duration}</span>
              </div>
            </div>

            <div
              className={`mt-1 shrink-0 text-gray-500 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
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
    </motion.div>
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
      className="pointer-events-auto relative px-6 py-20 md:px-12"
    >
      <div className="mx-auto max-w-3xl">
        <div className="glass mb-8 rounded-2xl p-6 md:p-8 border border-white/12 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
              WAYPOINT 03 // CAREER TOWERS
            </span>
            <span className="text-[11px] font-medium text-gray-400">
              The journey so far
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Experience
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-300">
            Four checkpoints — from game dev intern to building production React apps.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 hidden w-px bg-linear-to-b from-transparent via-white/15 to-transparent md:left-8 md:block" />

          {experiences.map((item) => (
            // Each checkpoint is a camera waypoint for the 3D journey behind
            <div key={item.id} data-zone={`exp-${item.index}`} className="relative py-10 md:py-14">
              <div className="absolute top-1/2 left-0 hidden size-3 -translate-y-1/2 rounded-full border border-cyan-400/60 bg-[#0d0d0f] md:left-6 md:block" />
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
