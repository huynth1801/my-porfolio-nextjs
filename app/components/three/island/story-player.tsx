"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import {
  CAPTIONS,
  STORY_ACTS,
  captionFor,
  exitStory,
  seekAct,
  storyDuration,
  storyTime,
  togglePause,
  useStoryUi,
} from "./story-store";

/**
 * Cinematic player bar for story mode: chapter chips, pause/replay, exit
 * and the current caption. Pure HTML — mounted next to the page content.
 */
export function StoryPlayer() {
  const ui = useStoryUi();
  const [caption, setCaption] = useState(CAPTIONS[0].text);
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  // poll the timeline clock (rAF, no GSAP dependency in React land)
  useEffect(() => {
    if (!ui.open) return;
    let raf = 0;
    const tick = () => {
      setCaption(captionFor(storyTime()));
      setProgress(storyTime() / Math.max(1, storyDuration()));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ui.open]);

  // exit on Escape or on any scroll intent
  useEffect(() => {
    if (!ui.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitStory();
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
    };
    const onScrollIntent = () => exitStory();
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onScrollIntent, { passive: true });
    window.addEventListener("touchmove", onScrollIntent, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onScrollIntent);
      window.removeEventListener("touchmove", onScrollIntent);
    };
  }, [ui.open]);

  return (
    <AnimatePresence>
      {ui.open && (
        <motion.div
          key="story-player"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
        >
          <div
            ref={barRef}
            className="glass pointer-events-auto w-full max-w-2xl rounded-2xl p-4 shadow-2xl"
          >
            {/* caption */}
            <p className="mb-3 text-center text-sm font-medium text-cyan-100">
              {caption}
            </p>

            {/* progress */}
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#f2ead9] transition-[width] duration-200"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* chapters */}
              <div className="flex flex-wrap gap-2">
                {STORY_ACTS.map((a, i) => (
                  <button
                    key={a.label}
                    onClick={() => seekAct(i)}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      ui.act === i
                        ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>

              {/* controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  aria-label={ui.paused ? "Resume story" : "Pause story"}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-200 transition-colors hover:border-white/30"
                >
                  {ui.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </button>
                <button
                  onClick={() => seekAct(0)}
                  aria-label="Replay story"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-200 transition-colors hover:border-white/30"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  onClick={exitStory}
                  aria-label="Exit story mode"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
