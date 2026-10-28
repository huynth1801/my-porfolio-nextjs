"use client";

import { useEffect, useRef } from "react";
import { useFlappy, flappyPress, flappyClose, attachFlappyHudCanvas } from "./flappy";
import { panelStore } from "@/lib/panel-store";
import { sfx } from "@/lib/audio";

export function ArcadeCabinetOverlay() {
  const { isOpen, mode, score, best } = useFlappy();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Attach HUD canvas to mirror the pixel-art rendering in real-time
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (canvas) {
      attachFlappyHudCanvas(canvas);
    }
    return () => {
      attachFlappyHudCanvas(null);
    };
  }, [isOpen]);

  // Global keyboard shortcuts during arcade session
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.code === "KeyE" ||
        e.code === "Enter"
      ) {
        e.preventDefault();
        flappyPress();
        return;
      }
      if (e.code === "Escape") {
        e.preventDefault();
        sfx.click();
        flappyClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={(e) => {
        // Clicking the darkened backdrop exits arcade mode
        if (e.target === e.currentTarget) {
          sfx.click();
          flappyClose();
        }
      }}
    >
      {/* Retro Arcade Cabinet Frame */}
      <div className="relative w-full max-w-[380px] sm:max-w-[420px] rounded-3xl bg-gradient-to-b from-purple-950/95 via-slate-900/95 to-black/95 border-2 border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.35),0_0_80px_rgba(168,85,247,0.25)] p-4 sm:p-5 flex flex-col items-center">
        {/* Glowing Top Marquee */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-purple-500/30 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl animate-pulse">🕹️</span>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-widest text-cyan-300 font-mono uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                ARCADE ZONE
              </h2>
              <p className="text-[10px] text-purple-300 font-mono tracking-wider">FLAPPY.DEV // PIXEL RUNNER</p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.click();
              flappyClose();
            }}
            className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-rose-500/80 rounded-lg border border-slate-700 hover:border-rose-400 transition-all cursor-pointer"
            title="Thoát (ESC)"
          >
            ✕ ESC
          </button>
        </div>

        {/* CRT Arcade Monitor Container */}
        <div
          className="relative w-full aspect-[256/300] max-h-[360px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/50 shadow-inner flex items-center justify-center cursor-pointer select-none group"
          onClick={() => {
            flappyPress();
          }}
        >
          {/* Mirrored High-Res Pixel Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain [image-rendering:pixelated]"
          />

          {/* CRT Scanlines Overlay Effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.28)_50%)] bg-[length:100%_4px] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-black/40" />

          {/* Click to Flap Hint Indicator */}
          {mode === "play" && (
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-200/90 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-xs">
                CHẠM / BẤM SPACE ĐỂ BAY 🪽
              </span>
            </div>
          )}
        </div>

        {/* Live Score & Status Panel */}
        <div className="w-full mt-3 flex items-center justify-between px-2 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Điểm:</span>
            <span className="text-base sm:text-lg font-black text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Kỷ lục:</span>
            <span className="text-sm sm:text-base font-black text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">
              🏆 {best}
            </span>
          </div>
        </div>

        {/* Game Over Actions or In-Game Controls */}
        {mode === "over" ? (
          <div className="w-full mt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                flappyPress();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🕹️ CHƠI LẠI (BẤM SPACE)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sfx.click();
                  flappyClose();
                  panelStore.open("projects");
                }}
                className="py-2 px-2 text-xs font-mono font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer text-center"
              >
                📁 Xem dự án
              </button>

              <button
                onClick={() => {
                  sfx.click();
                  flappyClose();
                }}
                className="py-2 px-2 text-xs font-mono font-bold text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 rounded-xl border border-slate-600/50 hover:border-slate-400 transition-all cursor-pointer text-center"
              >
                ✕ Thoát ra đảo
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mt-3 flex items-center gap-2">
            {/* Mobile / Direct Touch Big Flap Button */}
            <button
              onClick={() => flappyPress()}
              className="flex-1 py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900/90 active:bg-cyan-800 text-cyan-300 font-mono font-bold text-xs rounded-xl border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <span>🪽</span>
              <span>NHẤP ĐỂ BAY (SPACE / W)</span>
            </button>

            <button
              onClick={() => {
                sfx.click();
                flappyClose();
                panelStore.open("projects");
              }}
              className="py-2 px-3 text-xs font-mono font-bold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 rounded-xl border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer"
              title="Xem các dự án nổi bật"
            >
              📁 Dự án
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
