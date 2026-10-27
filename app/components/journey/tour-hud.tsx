"use client";

import { useEffect, useState } from "react";
import { Compass, Moon, Sun, Sunset } from "lucide-react";
import { journey, tourState, TOUR_WAYPOINTS } from "@/lib/journey-store";
import { phaseStore, useDayPhase, type DayPhase } from "@/app/components/three/island/lighting";
import { sfx } from "@/lib/audio";

export function TourHud() {
  const currentPhase = useDayPhase();
  const [activeIdx, setActiveIdx] = useState(0);

  // Poll tourState every animation frame (lightweight, avoids heavy React re-renders)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setActiveIdx((prev) => (prev !== tourState.activeWaypointIndex ? tourState.activeWaypointIndex : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const activeWaypoint = TOUR_WAYPOINTS[activeIdx] ?? TOUR_WAYPOINTS[0];

  const handleWaypointClick = (id: string) => {
    sfx.click();
    journey.lenis?.scrollTo(`#${id}`, { offset: -32, duration: 1.6 });
  };

  const handlePhaseChange = (phase: DayPhase) => {
    sfx.click();
    phaseStore.set(phase);
  };

  return (
    <aside
      aria-label="3D Island Tour HUD"
      className="pointer-events-auto fixed right-4 bottom-5 z-30 flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6"
    >
      {/* Waypoint Telemetry Pill */}
      <div className="glass flex items-center gap-3 rounded-full px-4 py-2 text-xs shadow-xl backdrop-blur-xl border border-white/12">
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
      </div>

      {/* Flight Control Track + Time of Day Switcher */}
      <div className="glass flex items-center gap-1.5 rounded-full p-1.5 shadow-2xl backdrop-blur-xl border border-white/12">
        {/* Clickable Waypoint Pills (Hidden on very small screens to conserve space) */}
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

        {/* Time of Day Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePhaseChange("day")}
            title="Day Mode (Sunlight)"
            aria-label="Switch to Day Mode"
            className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
              currentPhase === "day"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sun className="size-3.5" />
          </button>

          <button
            onClick={() => handlePhaseChange("golden")}
            title="Golden Hour (Sunset)"
            aria-label="Switch to Golden Hour Mode"
            className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
              currentPhase === "golden"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sunset className="size-3.5" />
          </button>

          <button
            onClick={() => handlePhaseChange("night")}
            title="Night Mode (Starlight & Neon)"
            aria-label="Switch to Night Mode"
            className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
              currentPhase === "night"
                ? "bg-violet-500/25 text-violet-300 border border-violet-400/40 shadow-[0_0_10px_rgba(167,139,250,0.4)]"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Moon className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
