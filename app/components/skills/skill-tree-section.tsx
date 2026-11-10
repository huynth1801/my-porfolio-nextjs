"use client";

import { useState, useRef, useMemo } from "react";
import {
  SKILL_BRANCHES,
  SKILL_TREE_NODES,
  type SkillBranchId,
  type SkillNode,
} from "@/lib/skill-tree-data";
import { HoloNode } from "./holo-node";
import { HoloInspectorModal } from "./holo-inspector-modal";
import { SkillTreeConduits } from "./skill-tree-conduits";
import { Cpu, Terminal, Activity, Globe, Zap, Gamepad2, Palette, Wrench } from "lucide-react";
import { sfx } from "@/lib/audio";

const BRANCH_ICONS: Record<SkillBranchId, React.ComponentType<{ className?: string }>> = {
  all: Globe,
  frontend: Zap,
  "creative-3d": Gamepad2,
  "ui-motion": Palette,
  "tooling-state": Wrench,
};

export function SkillTreeSection() {
  const [activeBranch, setActiveBranch] = useState<SkillBranchId>("all");
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter nodes based on selected branch
  const filteredNodes = useMemo(() => {
    if (activeBranch === "all") return SKILL_TREE_NODES;
    return SKILL_TREE_NODES.filter((n) => n.branch === activeBranch);
  }, [activeBranch]);

  const handleBranchClick = (branchId: SkillBranchId) => {
    sfx.click();
    setActiveBranch(branchId);
  };

  const handleSelectNode = (node: SkillNode) => {
    setSelectedNode(node);
  };

  const handleCloseModal = () => {
    setSelectedNode(null);
  };

  // Group filtered nodes by Tier (1, 2, 3) for intuitive RPG talent progression
  const tier1Nodes = filteredNodes.filter((n) => n.tier === 1);
  const tier2Nodes = filteredNodes.filter((n) => n.tier === 2);
  const tier3Nodes = filteredNodes.filter((n) => n.tier === 3);

  return (
    <section
      id="skills"
      data-zone="skills"
      className="pointer-events-auto relative px-3 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Futuristic Holo-Projector Header */}
        <header className="glass relative overflow-hidden rounded-3xl border border-white/12 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-purple-500/15 blur-3xl" />

          {/* Top Telemetry Line */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-300 uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                WAYPOINT 05 // SKILLS KIOSK & HOLO-PROJECTOR
              </span>
              <span className="font-mono text-[11px] text-gray-400 flex items-center gap-1">
                <Activity className="size-3 text-emerald-400" />
                STATUS: ONLINE (100%)
              </span>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 font-mono text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Cpu className="size-3.5 text-cyan-400" />
                <strong className="text-white">15</strong> Nodes
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1">
                <Activity className="size-3.5 text-amber-400" />
                <strong className="text-white">94%</strong> Avg Level
              </span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Holo-Skill Matrix</span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-400 uppercase px-2 py-1 rounded-md border border-cyan-400/30 bg-cyan-400/10">
                  RPG Tree v2.0
                </span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
                Cây kỹ năng RPG tương tác — Bấm vào từng nút công nghệ để kích hoạt Holo-Projector
                xem <strong>dự án thực tế</strong>, <strong>tư duy kiến trúc</strong> và{" "}
                <strong>mã nguồn sản xuất</strong>.
              </p>
            </div>

            {/* Hint Box */}
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-mono text-gray-400">
              <Terminal className="size-3.5 text-cyan-400" />
              <span>Click node để Holo-Inspect</span>
            </div>
          </div>

          {/* Branch Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {SKILL_BRANCHES.map((b) => {
              const isActive = activeBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBranchClick(b.id)}
                  className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-cyan-400/80 bg-cyan-400/20 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.35)] scale-[1.02]"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {(() => {
                    const Icon = BRANCH_ICONS[b.id];
                    return Icon ? (
                      <Icon className="size-3.5 transition-transform group-hover:scale-110" />
                    ) : null;
                  })()}
                  <span>{b.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? "bg-cyan-400 text-black font-bold" : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {b.id === "all"
                      ? SKILL_TREE_NODES.length
                      : SKILL_TREE_NODES.filter((n) => n.branch === b.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Tree Container with SVG Energy Conduits */}
        <div ref={containerRef} className="relative mt-12 space-y-12">
          {/* Animated SVG Conduit Connections */}
          <SkillTreeConduits
            containerRef={containerRef}
            activeBranch={activeBranch}
            selectedId={selectedNode?.id ?? null}
          />

          {/* Tier 1: Foundation Nodes */}
          {tier1Nodes.length > 0 && (
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  T1
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Tier 1: Core Foundation & Systems
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Ngôn ngữ nền tảng và tư duy công nghệ cốt lõi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tier1Nodes.map((node) => (
                  <div key={node.id} data-skill-id={node.id}>
                    <HoloNode
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      isDimmed={false}
                      onSelect={handleSelectNode}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier 2: Advanced & Core Frameworks */}
          {tier2Nodes.length > 0 && (
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 font-mono text-xs font-bold text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  T2
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Tier 2: Production Frameworks & Engines
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Frameworks chủ đạo, 3D graphics & UI engineering
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tier2Nodes.map((node) => (
                  <div key={node.id} data-skill-id={node.id}>
                    <HoloNode
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      isDimmed={false}
                      onSelect={handleSelectNode}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier 3: Mastery & Specialist Tech */}
          {tier3Nodes.length > 0 && (
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  T3
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Tier 3: Specialist Architecture & Shaders
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Tối ưu hiệu năng chuyên sâu, GLSL shaders và Next.js 16 App Router
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tier3Nodes.map((node) => (
                  <div key={node.id} data-skill-id={node.id}>
                    <HoloNode
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      isDimmed={false}
                      onSelect={handleSelectNode}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Holo Inspector Modal */}
        <HoloInspectorModal
          node={selectedNode}
          onClose={handleCloseModal}
          onSelectNode={handleSelectNode}
        />
      </div>
    </section>
  );
}
