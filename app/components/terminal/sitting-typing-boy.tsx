"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TerminalTheme } from "@/lib/terminal-store";
import { sfx } from "@/lib/audio";

interface SittingTypingBoyProps {
  theme: TerminalTheme;
  isTyping?: boolean;
}

const PARTICLES = ["</>", "{;}", "const", "01", "fn()", "✨", "git", "npm", "⚡"];

export function SittingTypingBoy({ theme, isTyping = false }: SittingTypingBoyProps) {
  const [particles, setParticles] = useState<
    { id: number; char: string; x: number; delay: number }[]
  >([]);
  const [isBouncing, setIsBouncing] = useState(false);

  // Theme glow colors
  const themeColors = {
    amber: {
      screen: "#ffb000",
      glow: "rgba(245, 158, 11, 0.4)",
      spark: "text-amber-400",
    },
    green: {
      screen: "#22c55e",
      glow: "rgba(34, 197, 94, 0.4)",
      spark: "text-emerald-400",
    },
    cyan: {
      screen: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.4)",
      spark: "text-cyan-400",
    },
  }[theme];

  // Spawn gentle code sparks every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const char = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
      const id = Date.now() + Math.random();
      const x = (Math.random() - 0.5) * 36;
      setParticles((prev) => [...prev.slice(-4), { id, char, x, delay: 0 }]);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    sfx.chime();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col items-center select-none cursor-pointer"
      title="Huy is coding... Bấm để cổ vũ dev! ✨"
    >
      {/* Floating Code Particles */}
      <div className="pointer-events-none absolute -top-8 inset-x-0 flex justify-center">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, y: 0, scale: 0.7, x: p.x }}
              animate={{ opacity: [0, 1, 0.8, 0], y: -28, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className={`absolute font-mono text-[10px] font-bold ${themeColors.spark} drop-shadow-[0_0_8px_currentColor]`}
            >
              {p.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Speech bubble on hover */}
      <div className="pointer-events-none absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
        <div className="rounded-full border border-white/20 bg-zinc-900/90 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-200 shadow-lg backdrop-blur-md whitespace-nowrap">
          ⌨️ Coding lo-fi beats...
        </div>
      </div>

      {/* Chibi Character SVG */}
      <motion.div
        animate={isBouncing ? { y: [-6, 2, 0], rotate: [-4, 4, 0] } : { y: [0, -1.5, 0] }}
        transition={
          isBouncing ? { duration: 0.5 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative"
      >
        <svg
          width="76"
          height="76"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        >
          {/* Dangling Legs (swinging behind/over the bezel) */}
          <g className="origin-top">
            {/* Left Leg */}
            <motion.g
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "42px 70px" }}
            >
              <rect x="38" y="68" width="8" height="18" rx="4" fill="#1e293b" />
              {/* Sneaker Left */}
              <rect x="34" y="82" width="14" height="7" rx="3" fill="#f8fafc" />
              <rect x="34" y="85" width="14" height="4" rx="2" fill="#ef4444" />
            </motion.g>

            {/* Right Leg */}
            <motion.g
              animate={{ rotate: [6, -6, 6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "58px 70px" }}
            >
              <rect x="54" y="68" width="8" height="18" rx="4" fill="#1e293b" />
              {/* Sneaker Right */}
              <rect x="52" y="82" width="14" height="7" rx="3" fill="#f8fafc" />
              <rect x="52" y="85" width="14" height="4" rx="2" fill="#ef4444" />
            </motion.g>
          </g>

          {/* Torso / Hoodie */}
          <rect x="36" y="44" width="28" height="28" rx="8" fill="#334155" />
          {/* Inner t-shirt */}
          <path d="M46 44 L50 51 L54 44 Z" fill="#f8fafc" />

          {/* Head & Face */}
          <g>
            {/* Head base */}
            <circle cx="50" cy="32" r="16" fill="#fed7aa" />
            {/* Hair bangs */}
            <path
              d="M36 28 C37 20, 63 20, 64 28 C61 24, 53 25, 50 27 C47 25, 39 24, 36 28 Z"
              fill="#292524"
            />

            {/* Focused Eyes */}
            <circle cx="44" cy="33" r="2.2" fill="#1c1917" />
            <circle cx="56" cy="33" r="2.2" fill="#1c1917" />
            {/* Eye glint */}
            <circle cx="43.3" cy="32.3" r="0.8" fill="#ffffff" />
            <circle cx="55.3" cy="32.3" r="0.8" fill="#ffffff" />

            {/* Rosy blush */}
            <ellipse cx="40" cy="36" rx="2.2" ry="1.2" fill="#f87171" opacity="0.6" />
            <ellipse cx="60" cy="36" rx="2.2" ry="1.2" fill="#f87171" opacity="0.6" />

            {/* Focused smile */}
            <path
              d="M47 38 Q50 40 53 38"
              stroke="#78350f"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>

          {/* Red Baseball Cap (Huy's iconic look) */}
          <g>
            {/* Cap Dome */}
            <path d="M34 26 C34 14, 66 14, 66 26 Z" fill="#ef4444" />
            {/* Cap Brim / Visor angled forward */}
            <path d="M32 25 Q50 20 68 25 L71 28 Q50 23 29 28 Z" fill="#dc2626" />
            {/* Top Button */}
            <circle cx="50" cy="14" r="2" fill="#b91c1c" />
          </g>

          {/* Laptop Base (on lap) */}
          <rect x="32" y="60" width="36" height="5" rx="1.5" fill="#475569" />

          {/* Laptop Screen Lid angled up with Glowing Display */}
          <g>
            {/* Screen backing */}
            <path d="M34 60 L38 46 L62 46 L66 60 Z" fill="#1e293b" />
            {/* Screen glowing bezel */}
            <path
              d="M36 59 L39 48 L61 48 L64 59 Z"
              fill={themeColors.screen}
              style={{
                filter: `drop-shadow(0 0 6px ${themeColors.glow})`,
              }}
            />
            {/* Code lines on screen */}
            <line x1="42" y1="51" x2="58" y2="51" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
            <line x1="40" y1="54" x2="55" y2="54" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
            <line x1="43" y1="57" x2="52" y2="57" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          </g>

          {/* Animated Hands typing on keyboard */}
          {/* Left Hand */}
          <motion.circle
            cx="43"
            cy="61"
            r="3.2"
            fill="#fed7aa"
            animate={isTyping ? { cy: [61, 58, 61] } : { cy: [61, 59, 61] }}
            transition={{
              duration: isTyping ? 0.15 : 0.28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Right Hand */}
          <motion.circle
            cx="57"
            cy="61"
            r="3.2"
            fill="#fed7aa"
            animate={isTyping ? { cy: [58, 61, 58] } : { cy: [59, 61, 59] }}
            transition={{
              duration: isTyping ? 0.15 : 0.28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
