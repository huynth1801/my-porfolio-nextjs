"use client";

import React from "react";
import { GraduationCap, Award } from "lucide-react";
import clsx from "clsx";
import { educations } from "@/lib/content";

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  tags?: string[];
  logoSrc?: string;
};

interface EducationSectionProps {
  title?: string;
  subtitle?: string;
  items?: EducationItem[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  title = "Education & Training",
  subtitle = "Học vấn chính quy, chứng chỉ chuyên sâu và nền tảng kỹ thuật phần mềm.",
  items = educations,
}) => {
  return (
    <section
      id="education"
      data-zone="education"
      className="pointer-events-auto relative px-5 py-24 sm:px-8 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section Header Card */}
        <div className="glass mb-10 rounded-2xl p-6 sm:p-8 md:p-9 border border-white/12 shadow-2xl flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25">
                WAYPOINT 06 // TECH ACADEMY
              </span>
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-cyan-400" />
                Verified Credentials
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1.5 font-mono text-xs font-semibold text-cyan-300">
            <Award className="size-4 text-amber-400" />
            <span>{items.length} Credentials Logged</span>
          </div>
        </div>

        <div className="relative">
          {/* Vertical timeline line on md+ */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-linear-to-b from-cyan-400/40 via-white/15 to-transparent" />

          <div className="space-y-6 md:space-y-8">
            {items.map((it) => (
              <article key={it.id} className={clsx("relative md:pl-16", "group")}>
                {/* Timeline dot (desktop) */}
                <div className="hidden md:absolute md:left-6 md:top-6 -translate-x-1/2">
                  <div className="size-4 rounded-full border-2 border-cyan-400 bg-[#07080b] shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 md:p-7 shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_12px_32px_-10px_rgba(34,211,238,0.2)]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {it.degree} {it.field ? `· ${it.field}` : ""}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-cyan-300 mt-0.5">
                        {it.school}
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-col sm:items-end sm:text-right gap-1.5 shrink-0">
                      <span className="font-mono text-xs text-gray-400 rounded-md border border-white/10 bg-black/40 px-2 py-0.5">
                        {formatRange(it.startDate, it.endDate)}
                      </span>
                    </div>
                  </div>

                  {it.description && (
                    <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {it.description}
                    </p>
                  )}

                  {it.tags && it.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                      {it.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/10 bg-[#0e111a] px-2 py-0.5 font-mono text-[11px] text-gray-300 transition-colors hover:border-cyan-400/30 hover:text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (!start) return `${end ?? ""}`;
  if (!end) return `${start} – Present`;
  return `${start} – ${end}`;
}

export default EducationSection;
