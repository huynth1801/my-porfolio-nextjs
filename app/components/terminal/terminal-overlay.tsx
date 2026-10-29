"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  useTerminal,
  closeTerminal,
  executeCommand,
  setTerminalTheme,
  setTerminalInput,
  commandHistory,
  type TerminalTheme,
} from "@/lib/terminal-store";
import { sfx } from "@/lib/audio";
import { Terminal, X, Sparkles, CornerDownLeft } from "lucide-react";
import { SittingTypingBoy } from "./sitting-typing-boy";

const QUICK_COMMANDS = [
  { label: "help", cmd: "help", desc: "Tất cả lệnh" },
  { label: "skills", cmd: "skills", desc: "ASCII art & Kỹ năng" },
  { label: "hire", cmd: "hire", desc: "Mở form liên hệ" },
  { label: "teleport towers", cmd: "teleport towers", desc: "Dịch chuyển tháp" },
  { label: "cat", cmd: "cat", desc: "Vuốt mèo meow" },
  { label: "whoami", cmd: "whoami", desc: "Hồ sơ dev" },
  { label: "clear", cmd: "clear", desc: "Xóa màn hình" },
  { label: "exit", cmd: "exit", desc: "Đóng console" },
];

export function TerminalOverlay() {
  const { isOpen, theme, lines, currentInput } = useTerminal();
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    sfx.click();
    closeTerminal();
    setHistoryIndex(null);
  };

  // Auto scroll to bottom when lines change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation & execution
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    sfx.click();

    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = currentInput.trim();
      if (trimmed) {
        executeCommand(trimmed);
        setHistoryIndex(null);
      }
      return;
    }

    // Up Arrow (Navigate back in history)
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex =
        historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setTerminalInput(commandHistory[nextIndex] ?? "");
      return;
    }

    // Down Arrow (Navigate forward in history)
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length === 0 || historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setTerminalInput("");
      } else {
        setHistoryIndex(nextIndex);
        setTerminalInput(commandHistory[nextIndex] ?? "");
      }
      return;
    }
  };

  const handleChipClick = (cmd: string) => {
    sfx.click();
    executeCommand(cmd);
    inputRef.current?.focus();
  };

  // Color theme styling maps
  const themeClasses: Record<
    TerminalTheme,
    {
      windowBorder: string;
      glowShadow: string;
      primaryText: string;
      accentText: string;
      promptText: string;
      scanlineTint: string;
      activeChip: string;
    }
  > = {
    amber: {
      windowBorder: "border-amber-500/40",
      glowShadow: "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.25)]",
      primaryText: "text-amber-300",
      accentText: "text-amber-400",
      promptText: "text-amber-400 font-bold",
      scanlineTint: "rgba(245, 158, 11, 0.04)",
      activeChip: "bg-amber-400/15 border-amber-400/50 text-amber-200 hover:bg-amber-400/25",
    },
    green: {
      windowBorder: "border-emerald-500/40",
      glowShadow: "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.25)]",
      primaryText: "text-emerald-300",
      accentText: "text-emerald-400",
      promptText: "text-emerald-400 font-bold",
      scanlineTint: "rgba(16, 185, 129, 0.04)",
      activeChip:
        "bg-emerald-400/15 border-emerald-400/50 text-emerald-200 hover:bg-emerald-400/25",
    },
    cyan: {
      windowBorder: "border-cyan-500/40",
      glowShadow: "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.25)]",
      primaryText: "text-cyan-300",
      accentText: "text-cyan-400",
      promptText: "text-cyan-400 font-bold",
      scanlineTint: "rgba(6, 182, 212, 0.04)",
      activeChip: "bg-cyan-400/15 border-cyan-400/50 text-cyan-200 hover:bg-cyan-400/25",
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end p-3 sm:p-6 md:pr-10 bg-black/40 backdrop-blur-[2px] pointer-events-auto">
          {/* Subtle backdrop dismiss */}
          <div className="absolute inset-0 -z-10" onClick={handleClose} />

          {/* Full Interactive Terminal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, x: 25 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={`relative flex h-[76vh] max-h-[580px] w-full max-w-lg lg:max-w-xl flex-col rounded-2xl border bg-black/90 font-mono text-xs sm:text-sm ${currentTheme.windowBorder} ${currentTheme.glowShadow}`}
          >
            {/* Cute Sitting Typing Dev Mascot perched atop the CRT Monitor Screen */}
            <div className="absolute -top-15 right-8 sm:right-14 z-40 scale-85 sm:scale-100 origin-bottom pointer-events-auto">
              <SittingTypingBoy theme={theme} isTyping={currentInput.length > 0} />
            </div>

            {/* Screen Inner Container (Scanlines, Header, Output, Input) */}
            <div className="relative flex flex-col flex-1 overflow-hidden rounded-2xl">
              {/* Retro CRT Scanlines Overlay */}
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${currentTheme.scanlineTint} 2px,
                    ${currentTheme.scanlineTint} 4px
                  )`,
                }}
              />

              {/* Window Title Bar */}
              <div className="relative z-30 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 py-2.5 backdrop-blur-sm select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <button
                      onClick={handleClose}
                      className="size-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors cursor-pointer"
                      title="Close"
                    />
                    <div className="size-3 rounded-full bg-amber-500/80" />
                    <div className="size-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <Terminal className="size-4 text-zinc-400" />
                  <span className="font-semibold text-zinc-200 tracking-wide">HUY-OS v2.6.0</span>
                  <span className="hidden sm:inline-block text-[11px] text-zinc-500">
                    (tty1 — lo-fi dev terminal)
                  </span>
                </div>

                {/* Theme Selector & Close Button */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/60 p-0.5 text-[10px]">
                    {(["amber", "green", "cyan"] as TerminalTheme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          sfx.click();
                          setTerminalTheme(t);
                        }}
                        className={`rounded px-1.5 py-0.5 font-bold uppercase transition-colors cursor-pointer ${
                          theme === t
                            ? "bg-white/20 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                    <span className="hidden sm:inline">ESC</span>
                  </button>
                </div>
              </div>

              {/* Terminal Body / Output History (ALWAYS VISIBLE & SCROLLABLE) */}
              <div
                ref={scrollRef}
                className={`relative z-10 flex-1 overflow-y-auto p-4 space-y-2 select-text leading-relaxed ${currentTheme.primaryText}`}
              >
                {lines.map((line) => {
                  if (line.type === "system") {
                    return (
                      <div key={line.id} className="text-zinc-400 text-xs italic tracking-wide">
                        [sys] {line.text}
                      </div>
                    );
                  }
                  if (line.type === "input") {
                    return (
                      <div key={line.id} className={`font-semibold ${currentTheme.accentText}`}>
                        {line.text}
                      </div>
                    );
                  }
                  if (line.type === "error") {
                    return (
                      <div key={line.id} className="text-rose-400 whitespace-pre-wrap">
                        ✖ {line.text}
                      </div>
                    );
                  }
                  if (line.type === "ascii") {
                    return (
                      <pre
                        key={line.id}
                        className={`whitespace-pre font-mono text-[11px] sm:text-xs leading-none overflow-x-auto py-1 ${currentTheme.accentText}`}
                      >
                        {line.text}
                      </pre>
                    );
                  }
                  return (
                    <div key={line.id} className="whitespace-pre-wrap text-zinc-200">
                      {line.text}
                    </div>
                  );
                })}
              </div>

              {/* Prompt Input Line */}
              <div className="relative z-30 border-t border-white/10 bg-zinc-950/95 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 ${currentTheme.promptText}`}>guest@diorama:~$</span>
                  <input
                    ref={inputRef}
                    id="terminal-input"
                    type="text"
                    value={currentInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập lệnh (help, skills, hire, teleport towers, cat)..."
                    className="w-full bg-transparent text-white outline-none placeholder:text-zinc-600 font-mono text-xs sm:text-sm"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    onClick={() => {
                      if (currentInput.trim()) {
                        sfx.click();
                        executeCommand(currentInput.trim());
                      }
                    }}
                    className="rounded bg-white/10 p-1 text-zinc-400 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                    title="Gửi lệnh (Enter)"
                  >
                    <CornerDownLeft className="size-3.5" />
                  </button>
                </div>

                {/* Quick Command Chips */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-500 font-bold mr-1 flex items-center gap-1">
                    <Sparkles className="size-2.5 text-amber-400" />
                    Lệnh nhanh:
                  </span>
                  {QUICK_COMMANDS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleChipClick(item.cmd)}
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-all duration-150 cursor-pointer ${currentTheme.activeChip}`}
                      title={item.desc}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
