"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ACHIEVEMENT_DEFS, useAchievements, type AchievementId } from "@/lib/achievements";

/**
 * "🏆 Achievement unlocked" toast — appears bottom-right for a few seconds
 * whenever a new badge is earned. Pure HTML, mounted next to the page.
 */
export function AchievementToasts() {
  const { last } = useAchievements();
  const [visibleId, setVisibleId] = useState<AchievementId | null>(null);

  useEffect(() => {
    if (!last) return;
    queueMicrotask(() => setVisibleId(last.id));
    const timer = setTimeout(() => setVisibleId((cur) => (cur === last.id ? null : cur)), 4500);
    return () => clearTimeout(timer);
  }, [last]);

  const def = visibleId ? ACHIEVEMENT_DEFS[visibleId] : null;

  return (
    <AnimatePresence>
      {def && (
        <motion.div
          key={visibleId}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#f2ead9]/25 bg-[#12121a]/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          <span className="text-3xl" aria-hidden>
            {def.icon}
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#f2ead9]/70 uppercase">
              Achievement unlocked
            </p>
            <p className="text-sm font-semibold text-white">{def.title}</p>
            <p className="text-xs text-gray-400">{def.desc}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
