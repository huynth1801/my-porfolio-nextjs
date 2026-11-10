"use client";

import { memo } from "react";
import { type SkillNode } from "@/lib/skill-tree-data";
import { CheckCircle2, ChevronRight, Zap, Code2 } from "lucide-react";
import { sfx } from "@/lib/audio";

interface HoloNodeProps {
  node: SkillNode;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (node: SkillNode) => void;
}

const colorMap = {
  cyan: {
    border: "border-cyan-500/40 hover:border-cyan-400",
    borderActive: "border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.45)]",
    bg: "from-cyan-950/40 to-slate-900/80",
    text: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    glow: "rgba(6, 182, 212, 0.4)",
    radial: "#06b6d4",
  },
  violet: {
    border: "border-purple-500/40 hover:border-purple-400",
    borderActive:
      "border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.45)]",
    bg: "from-purple-950/40 to-slate-900/80",
    text: "text-purple-400",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    glow: "rgba(168, 85, 247, 0.4)",
    radial: "#a855f7",
  },
  emerald: {
    border: "border-emerald-500/40 hover:border-emerald-400",
    borderActive:
      "border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.45)]",
    bg: "from-emerald-950/40 to-slate-900/80",
    text: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.4)",
    radial: "#10b981",
  },
  amber: {
    border: "border-amber-500/40 hover:border-amber-400",
    borderActive:
      "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.45)]",
    bg: "from-amber-950/40 to-slate-900/80",
    text: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    glow: "rgba(245, 158, 11, 0.4)",
    radial: "#f59e0b",
  },
};

export const HoloNode = memo(function HoloNode({
  node,
  isSelected,
  isDimmed,
  onSelect,
}: HoloNodeProps) {
  const c = colorMap[node.color] ?? colorMap.cyan;

  const handleClick = () => {
    sfx.click();
    onSelect(node);
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (node.level / 100) * circumference;

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${node.name} - Tier ${node.tier} ${node.rank}`}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none backdrop-blur-xl bg-gradient-to-br ${
        c.bg
      } ${
        isSelected
          ? c.borderActive
          : `${c.border} hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]`
      } ${isDimmed ? "opacity-35 grayscale-[0.6] scale-95" : "opacity-100"}`}
    >
      {/* Top Header: Tier Badge & Circular Mastery Ring */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase ${c.badge}`}
            >
              <Zap className="size-2.5" />T{node.tier} {"//"} {node.rank}
            </span>
            {node.level >= 95 && (
              <span className="inline-flex items-center rounded-full bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-mono text-amber-300 font-bold">
                MAX
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
            {node.name}
          </h3>
        </div>

        {/* Circular SVG Level Gauge */}
        <div className="relative flex size-12 shrink-0 items-center justify-center">
          <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="18"
              className="text-white/10"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              stroke={c.radial}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-mono text-[11px] font-bold text-white">{node.level}%</span>
        </div>
      </div>

      {/* Middle Tagline */}
      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
        {node.tagline}
      </p>

      {/* Bottom Footer: Experience & Inspect CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="font-mono text-[11px] font-medium text-gray-400">{node.experience}</span>

        <span
          className={`flex items-center gap-1 text-[11px] font-semibold transition-transform duration-200 group-hover:translate-x-1 ${c.text}`}
        >
          <Code2 className="size-3" />
          <span>Holo-Inspect</span>
          <ChevronRight className="size-3" />
        </span>
      </div>

      {/* Active Selection Indicator Ribbon */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)]">
          <CheckCircle2 className="size-3.5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
});
