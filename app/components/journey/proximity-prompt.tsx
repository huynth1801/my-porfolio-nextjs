"use client";

import { AnimatePresence, motion } from "motion/react";
import { useProximity, proximityStore } from "@/lib/proximity-store";
import { Sparkles } from "lucide-react";

export function ProximityPrompt() {
  const { active, toast } = useProximity();

  return (
    <>
      {/* Interaction Toast Notice */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="proximity-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-none fixed top-20 inset-x-0 z-50 flex justify-center px-4"
          >
            <div className="glass pointer-events-auto flex items-center gap-3 rounded-full border border-amber-400/30 bg-black/75 px-5 py-2.5 text-sm font-medium text-amber-200 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-xl">
              <span className="text-base">{toast.icon}</span>
              <span>{toast.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proximity Action Prompt [E] */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={`prompt-${active.id}`}
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 pointer-events-none"
          >
            <button
              onClick={() => proximityStore.triggerActive()}
              className="glass pointer-events-auto group flex items-center gap-3 rounded-full border border-white/20 bg-black/80 px-4 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.25)] backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-cyan-400/60 active:scale-95 cursor-pointer"
            >
              {/* Keyboard badge [E] */}
              <div className="flex size-7 items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-400/20 text-xs font-black tracking-wider text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)] group-hover:bg-cyan-400 group-hover:text-black transition-colors duration-200">
                E
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-base">{active.icon}</span>
                <span>{active.label}</span>
              </div>

              {/* Hint badge */}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300">
                <Sparkles className="size-2.5 text-cyan-400" />
                Click / Bấm E
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
