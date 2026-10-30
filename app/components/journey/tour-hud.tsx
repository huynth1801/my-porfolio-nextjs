"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Compass,
  Moon,
  Sun,
  Sunset,
  CloudRain,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { journey, tourState, TOUR_WAYPOINTS } from "@/lib/journey-store";
import { phaseStore, useDayPhase, type DayPhase } from "@/app/components/three/island/lighting";
import { soundscape, useSoundscape } from "@/lib/soundscape";
import { sfx } from "@/lib/audio";

const WEATHER_LABELS: Record<DayPhase, { name: string; icon: string }> = {
  day: { name: "Nắng Vàng", icon: "☀️" },
  golden: { name: "Hoàng Hôn", icon: "🌅" },
  rain: { name: "Mưa Miền Tây", icon: "🌧️" },
  night: { name: "Đêm & Đom Đóm", icon: "✨" },
};

const WEATHER_ICONS: Record<DayPhase, React.ComponentType<{ className?: string }>> = {
  day: Sun,
  golden: Sunset,
  rain: CloudRain,
  night: Moon,
};

const WEATHER_BUTTON_STYLES: Record<DayPhase, string> = {
  day: "bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.35)]",
  rain: "bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.4)]",
  golden:
    "bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.35)]",
  night:
    "bg-violet-500/30 text-violet-300 border border-violet-400/50 shadow-[0_0_10px_rgba(167,139,250,0.45)]",
};

const NEXT_PHASE: Record<DayPhase, DayPhase> = {
  day: "rain",
  rain: "golden",
  golden: "night",
  night: "day",
};

export function TourHud() {
  const currentPhase = useDayPhase();
  const soundscapeActive = useSoundscape();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Poll tourState every animation frame (lightweight, avoids heavy React re-renders)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setActiveIdx((prev) =>
        prev !== tourState.activeWaypointIndex ? tourState.activeWaypointIndex : prev,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track scroll position to auto-collapse into sleek compact mode when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 60 || tourState.activeWaypointId !== "home";
      setIsScrolled(scrolled);
      // Auto-collapse when user actively scrolls down
      if (scrolled) {
        setIsExpanded(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const activeWaypoint = TOUR_WAYPOINTS[activeIdx] ?? TOUR_WAYPOINTS[0];
  const ActiveWeatherIcon = WEATHER_ICONS[currentPhase];

  const handleWaypointClick = (id: string) => {
    sfx.click();
    journey.lenis?.scrollTo(`#${id}`, { offset: -32, duration: 1.6 });
  };

  const handlePhaseChange = (phase: DayPhase) => {
    sfx.click();
    phaseStore.set(phase);
  };

  const handleToggleSoundscape = async () => {
    sfx.click();
    await soundscape.toggle();
  };

  // Compact mode is active when user scrolled away, unless they hover or tap to expand
  const showCompact = isScrolled && !isHovered && !isExpanded;

  return (
    <aside
      aria-label="3D Island Tour HUD"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto fixed right-4 bottom-5 z-30 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6"
    >
      {/* Waypoint & Weather Telemetry Pill (Only shown at hero top to prevent double-stack clutter while scrolling) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            key="telemetry-pill"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass flex items-center gap-3 rounded-full px-4 py-2 text-xs shadow-xl backdrop-blur-xl border border-white/12"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-cyan-400" />
              </span>
              <span className="font-mono text-[11px] font-semibold tracking-wider text-cyan-300">
                {activeWaypoint.index}
              </span>
            </div>
            <div className="h-3.5 w-px bg-white/15" />
            <span className="font-mono text-[11px] font-medium tracking-wide text-gray-200 uppercase">
              {activeWaypoint.district}
            </span>
            <div className="h-3.5 w-px bg-white/15 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-200">
              <span>{WEATHER_LABELS[currentPhase].icon}</span>
              <span>{WEATHER_LABELS[currentPhase].name}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar: Compact Capsule vs Full Expanded Bar */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="glass flex items-center rounded-full p-1.5 shadow-2xl backdrop-blur-xl border border-white/12"
      >
        {showCompact ? (
          /* ================= COMPACT CAPSULE (When scrolling) ================= */
          <div className="flex items-center gap-2 px-1.5 py-0.5">
            {/* Active Waypoint Pill (tap/hover to expand) */}
            <button
              onClick={() => setIsExpanded(true)}
              title="Bấm để mở danh sách 7 quận và thời tiết"
              aria-label="Expand tour controls"
              className="group flex cursor-pointer items-center gap-2 font-mono text-xs transition-colors hover:opacity-90"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-cyan-400" />
              </span>
              <span className="text-[11px] font-bold text-cyan-300">{activeWaypoint.index}</span>
              <span className="max-w-[120px] truncate text-[11px] font-semibold tracking-wide text-gray-200 uppercase sm:max-w-[150px]">
                {activeWaypoint.district}
              </span>
              <ChevronUp className="size-3 text-gray-400 group-hover:text-cyan-300 transition-colors" />
            </button>

            <div className="h-3 w-px bg-white/15" />

            {/* Quick Cycle Weather Button */}
            <button
              onClick={() => handlePhaseChange(NEXT_PHASE[currentPhase])}
              title={`Thời tiết: ${WEATHER_LABELS[currentPhase].name} (Bấm để đổi)`}
              aria-label="Cycle weather mode"
              className={`flex size-6 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${WEATHER_BUTTON_STYLES[currentPhase]}`}
            >
              <ActiveWeatherIcon className="size-3" />
            </button>

            <div className="h-3 w-px bg-white/15" />

            {/* Quick Soundscape Toggle Button */}
            <button
              onClick={handleToggleSoundscape}
              title={
                soundscapeActive
                  ? `Âm thanh (${WEATHER_LABELS[currentPhase].name}): Đang phát (Bấm để tắt)`
                  : `Âm thanh (${WEATHER_LABELS[currentPhase].name}): Đang tắt (Bấm để bật)`
              }
              aria-label="Toggle ambient soundscape"
              className={`flex size-6 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ${
                soundscapeActive
                  ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
                  : "border-white/10 bg-white/[0.04] text-gray-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {soundscapeActive ? (
                <Volume2 className="size-3 text-cyan-300 animate-pulse" />
              ) : (
                <VolumeX className="size-3" />
              )}
            </button>
          </div>
        ) : (
          /* ================= FULL CONTROLS (At top or on hover/tap) ================= */
          <div className="flex items-center gap-1.5">
            {/* Waypoint Pills */}
            <div className="hidden items-center gap-1 sm:flex pr-1.5 border-r border-white/10">
              <Compass className="ml-1.5 mr-1 size-3.5 text-cyan-400/80" />
              {TOUR_WAYPOINTS.map((w, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleWaypointClick(w.id)}
                    title={`Fly to ${w.name} (${w.district})`}
                    aria-label={`Fly to ${w.name}`}
                    className={`flex size-6 cursor-pointer items-center justify-center rounded-full font-mono text-[10px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-400 text-gray-950 shadow-[0_0_12px_rgba(34,211,238,0.7)] scale-110"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {w.index}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Weather & Lighting Mode Switcher */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePhaseChange("day")}
                title="Sunny Golden Hour (Nắng vàng & Bụi nắng)"
                aria-label="Switch to Sunny Mode"
                className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                  currentPhase === "day"
                    ? "bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.35)] scale-105"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sun className="size-3.5" />
              </button>

              <button
                onClick={() => handlePhaseChange("rain")}
                title="Mekong Delta Rain (Mưa rào & Gợn sóng)"
                aria-label="Switch to Mekong Rain Mode"
                className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                  currentPhase === "rain"
                    ? "bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.4)] scale-105"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <CloudRain className="size-3.5" />
              </button>

              <button
                onClick={() => handlePhaseChange("golden")}
                title="Golden Hour Sunset (Hoàng hôn êm dịu)"
                aria-label="Switch to Golden Hour Mode"
                className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                  currentPhase === "golden"
                    ? "bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.35)] scale-105"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sunset className="size-3.5" />
              </button>

              <button
                onClick={() => handlePhaseChange("night")}
                title="Starlight & Fireflies (Đêm sao & Đom đóm)"
                aria-label="Switch to Night & Fireflies Mode"
                className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                  currentPhase === "night"
                    ? "bg-violet-500/30 text-violet-300 border border-violet-400/50 shadow-[0_0_10px_rgba(167,139,250,0.45)] scale-105"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Moon className="size-3.5" />
              </button>
            </div>

            {/* Ambient Soundscape Toggle Button */}
            <div className="flex items-center pl-1 border-l border-white/10">
              <button
                onClick={handleToggleSoundscape}
                title={
                  soundscapeActive
                    ? `Âm thanh môi trường (${WEATHER_LABELS[currentPhase].name}): Đang phát (Bấm để tắt)`
                    : `Âm thanh môi trường (${WEATHER_LABELS[currentPhase].name}): Đang tắt (Bấm để bật)`
                }
                aria-label="Toggle Ambient Weather Soundscape"
                className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 transition-all duration-200 text-xs font-mono font-medium ${
                  soundscapeActive
                    ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                    : "border-white/10 bg-white/[0.04] text-gray-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {soundscapeActive ? (
                  <>
                    <Volume2 className="size-3.5 text-cyan-400" />
                    <span className="flex items-center gap-1 text-[10px] text-cyan-200">
                      <span className="inline-block size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="hidden sm:inline">ÂM THANH</span>
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="size-3.5" />
                    <span className="hidden sm:inline text-[10px]">ÂM THANH</span>
                  </>
                )}
              </button>
            </div>

            {/* Collapse button when manually expanded while scrolled */}
            {isScrolled && (
              <button
                onClick={() => setIsExpanded(false)}
                title="Thu gọn"
                aria-label="Collapse tour controls"
                className="flex size-7 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronDown className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </aside>
  );
}
