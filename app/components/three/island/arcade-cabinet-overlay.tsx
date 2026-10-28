"use client";

import { useEffect, useRef } from "react";
import { RotateCcw, FolderGit2, ArrowLeft, ArrowUp, X } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity duration-200 animate-fadeIn"
      onClick={(e) => {
        // Clicking the darkened backdrop exits arcade mode
        if (e.target === e.currentTarget) {
          sfx.click();
          flappyClose();
        }
      }}
    >
      {/* Handcrafted Arcade Cabinet Frame */}
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-2xl bg-[#0d0f17] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] p-3.5 sm:p-4.5 flex flex-col items-center">
        {/* Clean Header Bar */}
        <div className="w-full flex items-center justify-between pb-2.5 border-b border-white/8 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-neutral-200 uppercase">
              Flappy.DEV
            </span>
            <span className="text-[10px] font-mono text-neutral-500">v1.0</span>
          </div>

          <button
            onClick={() => {
              sfx.click();
              flappyClose();
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] rounded-md border border-white/10 transition-colors cursor-pointer"
            title="Thoát (ESC)"
          >
            <X className="size-3" />
            <span>Esc</span>
          </button>
        </div>

        {/* CRT Arcade Monitor Container */}
        <div
          className="relative w-full aspect-[256/300] max-h-[350px] rounded-xl overflow-hidden bg-[#04060a] border border-white/10 shadow-inner flex items-center justify-center cursor-pointer select-none group"
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
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-black/35" />

          {/* Click to Flap Hint Indicator */}
          {mode === "play" && (
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 border border-white/10 backdrop-blur-sm text-[11px] font-mono text-neutral-300">
                <kbd className="px-1 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white">
                  Space
                </kbd>
                <span>hoặc Click để bay</span>
              </div>
            </div>
          )}
        </div>

        {/* Score & Status Panel */}
        <div className="w-full mt-2.5 flex items-center justify-between px-1 font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Điểm:</span>
            <span className="text-base font-bold text-neutral-100">{score}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Kỷ lục:</span>
            <span className="text-sm font-bold text-amber-400">{best}</span>
          </div>
        </div>

        {/* Actions Section */}
        {mode === "over" ? (
          <div className="w-full mt-2.5 flex flex-col gap-2">
            {/* Primary Tactile Button */}
            <button
              onClick={() => {
                flappyPress();
              }}
              className="w-full flex items-center justify-between py-2 px-3.5 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-950 font-mono text-xs font-semibold rounded-lg shadow-sm active:translate-y-px transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="size-3.5" />
                <span>Chơi lại</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/90 text-[10px] text-neutral-700 font-mono font-normal">
                Space
              </kbd>
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sfx.click();
                  flappyClose();
                  panelStore.open("projects");
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                <FolderGit2 className="size-3.5 text-neutral-400" />
                <span>Xem dự án</span>
              </button>

              <button
                onClick={() => {
                  sfx.click();
                  flappyClose();
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5 text-neutral-400" />
                <span>Thoát ra đảo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mt-2.5 flex items-center gap-2">
            {/* Mobile / Direct Touch Big Flap Button */}
            <button
              onClick={() => flappyPress()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] text-neutral-200 font-mono text-xs font-medium rounded-lg border border-white/10 transition-colors cursor-pointer select-none"
            >
              <ArrowUp className="size-3.5 text-cyan-400" />
              <span>Bay lên</span>
              <kbd className="px-1 py-0.2 rounded bg-white/10 text-[10px] text-neutral-400 font-normal">
                Space
              </kbd>
            </button>

            <button
              onClick={() => {
                sfx.click();
                flappyClose();
                panelStore.open("projects");
              }}
              className="flex items-center gap-1.5 py-2 px-3 text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg border border-white/10 transition-colors cursor-pointer"
              title="Xem các dự án nổi bật"
            >
              <FolderGit2 className="size-3.5" />
              <span>Dự án</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
