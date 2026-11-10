"use client";

import { useEffect, useState, useRef, memo } from "react";
import { SKILL_TREE_NODES, type SkillBranchId } from "@/lib/skill-tree-data";

interface ConduitLine {
  fromId: string;
  toId: string;
  path: string;
  color: string;
}

interface SkillTreeConduitsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeBranch: SkillBranchId;
  selectedId: string | null;
}

export const SkillTreeConduits = memo(function SkillTreeConduits({
  containerRef,
  activeBranch,
  selectedId,
}: SkillTreeConduitsProps) {
  const [lines, setLines] = useState<ConduitLine[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const updateConduits = () => {
      const container = containerRef.current;
      if (!container || window.innerWidth < 768) {
        setLines([]);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const nextLines: ConduitLine[] = [];

      for (const node of SKILL_TREE_NODES) {
        // If filter is active and node is not in branch, skip
        if (activeBranch !== "all" && node.branch !== activeBranch) continue;

        for (const depId of node.dependencies) {
          const parentNode = SKILL_TREE_NODES.find((n) => n.id === depId);
          if (!parentNode) continue;
          if (activeBranch !== "all" && parentNode.branch !== activeBranch) continue;

          const fromEl = container.querySelector(`[data-skill-id="${depId}"]`);
          const toEl = container.querySelector(`[data-skill-id="${node.id}"]`);

          if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            // Calculate start and end coordinates relative to container
            const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
            const y1 = fromRect.bottom - containerRect.top;
            const x2 = toRect.left + toRect.width / 2 - containerRect.left;
            const y2 = toRect.top - containerRect.top;

            // Draw smooth S-curve bezier line
            const dy = Math.max(20, (y2 - y1) / 2);
            const path = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;

            const isHighlighted = selectedId === depId || selectedId === node.id;

            nextLines.push({
              fromId: depId,
              toId: node.id,
              path,
              color: isHighlighted ? "#38bdf8" : "rgba(255, 255, 255, 0.12)",
            });
          }
        }
      }

      setLines(nextLines);
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateConduits, 80);
    };

    updateConduits();
    window.addEventListener("resize", onResize, { passive: true });
    const timer = setTimeout(updateConduits, 100);

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      clearTimeout(timer);
    };
  }, [containerRef, activeBranch, selectedId]);

  if (lines.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 size-full z-0 overflow-visible hidden md:block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="conduit-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>
        <filter id="laser-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map((l, idx) => (
        <g key={`${l.fromId}-${l.toId}-${idx}`}>
          {/* Base conduit channel */}
          <path
            d={l.path}
            fill="none"
            stroke={l.color}
            strokeWidth={l.color.includes("#38bdf8") ? 2.5 : 1.5}
            strokeDasharray={l.color.includes("#38bdf8") ? "none" : "4 4"}
            className="transition-colors duration-300"
          />

          {/* Animated pulsing data spark */}
          {l.color.includes("#38bdf8") && (
            <circle r="4" fill="#38bdf8" filter="url(#laser-glow)">
              <animateMotion path={l.path} dur="1.8s" repeatCount="indefinite" rotate="auto" />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
});
