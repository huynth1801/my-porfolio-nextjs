"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type SkillNode, SKILL_TREE_NODES } from "@/lib/skill-tree-data";
import {
  X,
  ExternalLink,
  Check,
  Copy,
  Zap,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { sfx } from "@/lib/audio";

interface HoloInspectorModalProps {
  node: SkillNode | null;
  onClose: () => void;
  onSelectNode: (node: SkillNode) => void;
}

export function HoloInspectorModal({ node, onClose, onSelectNode }: HoloInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "code">("overview");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(node.codeSnippet.code);
      setCopied(true);
      sfx.chime();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  // Find prerequisite and connected child nodes
  const prerequisiteNodes = SKILL_TREE_NODES.filter((n) => node.dependencies.includes(n.id));
  const childNodes = SKILL_TREE_NODES.filter((n) => n.dependencies.includes(node.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sfx.click();
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative z-10 w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-2xl text-white"
        >
          {/* Futuristic Scanline Effect */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-15 overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))",
              backgroundSize: "100% 4px, 6px 100%",
            }}
          />

          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                HOLO-PROJECTOR // NODE #{node.id.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => {
                sfx.click();
                onClose();
              }}
              aria-label="Close Inspector"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Node Hero Summary */}
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                  <Zap className="size-3" />
                  Tier {node.tier} {"//"} {node.rank}
                </span>
                <span className="text-xs font-mono text-gray-400">{node.experience}</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {node.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-cyan-200/80">{node.tagline}</p>
            </div>

            {/* Mastery Level Gauge Card */}
            <div className="flex flex-col items-end rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-400" />
                <span className="font-mono text-lg font-black text-white">{node.level}%</span>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                Mastery Index
              </span>
            </div>
          </div>

          {/* Tabs Selector: Overview & Insights VS Live Code Snippet */}
          <div className="mt-6 flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              Kiến trúc & Dự án thực tế
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "code"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Code2 className="size-3.5" />
              Mã nguồn thực tế ({node.codeSnippet.language})
            </button>
          </div>

          {/* Tab 1: Overview, Architecture & Production Proof */}
          {activeTab === "overview" && (
            <div className="mt-5 space-y-5">
              {/* Production Proof Section */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">
                  <Layers className="size-3.5 text-cyan-400" />
                  Dự án đã áp dụng thực tế (Production Proof)
                </h4>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  {node.productionProof.map((proof, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors hover:border-cyan-500/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold text-white">{proof.project}</p>
                        {proof.url && (
                          <a
                            href={proof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:underline"
                          >
                            Live <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-amber-300/80 font-medium">{proof.role}</p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-300">
                        {proof.highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Strengths */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">
                  <Check className="size-3.5 text-emerald-400" />
                  Điểm mạnh kiến trúc & kỹ thuật
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {node.keyStrengths.map((str, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-300"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisite & Synergies Navigation */}
              {(prerequisiteNodes.length > 0 || childNodes.length > 0) && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono text-[11px] font-semibold uppercase">
                      Liên kết cây kỹ năng:
                    </span>
                    {prerequisiteNodes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          sfx.click();
                          onSelectNode(p);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                      >
                        ← {p.name}
                      </button>
                    ))}
                    {childNodes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          sfx.click();
                          onSelectNode(c);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300 hover:bg-purple-500/25 transition-colors cursor-pointer"
                      >
                        {c.name} <ArrowRight className="size-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Interactive Code Snippet */}
          {activeTab === "code" && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">{node.codeSnippet.title}</span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Sao chép code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box */}
              <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-black/80 p-4 font-mono text-xs leading-relaxed text-gray-200">
                <pre>
                  <code>{node.codeSnippet.code}</code>
                </pre>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
