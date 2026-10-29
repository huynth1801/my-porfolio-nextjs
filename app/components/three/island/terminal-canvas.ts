"use client";

import type { TerminalTheme, TerminalLine } from "@/lib/terminal-store";

const WIDTH = 1024;
const HEIGHT = 640;

const THEMES: Record<
  TerminalTheme,
  {
    bg: string;
    text: string;
    bright: string;
    prompt: string;
    dim: string;
    error: string;
    headerBg: string;
    headerBorder: string;
    scanline: string;
    cursor: string;
  }
> = {
  amber: {
    bg: "#0c0a07",
    text: "#f59e0b",
    bright: "#fef08a",
    prompt: "#fbbf24",
    dim: "#92400e",
    error: "#ef4444",
    headerBg: "#1c140a",
    headerBorder: "#78350f",
    scanline: "rgba(245, 158, 11, 0.045)",
    cursor: "#ffb000",
  },
  green: {
    bg: "#050e07",
    text: "#22c55e",
    bright: "#86efac",
    prompt: "#4ade80",
    dim: "#15803d",
    error: "#f87171",
    headerBg: "#081a0e",
    headerBorder: "#166534",
    scanline: "rgba(34, 197, 94, 0.045)",
    cursor: "#22c55e",
  },
  cyan: {
    bg: "#040d14",
    text: "#06b6d4",
    bright: "#67e8f9",
    prompt: "#22d3ee",
    dim: "#0e7490",
    error: "#f87171",
    headerBg: "#071b26",
    headerBorder: "#155e75",
    scanline: "rgba(6, 182, 212, 0.045)",
    cursor: "#06b6d4",
  },
};

export function createTerminalCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  return canvas;
}

export function drawTerminalToCanvas(
  canvas: HTMLCanvasElement,
  theme: TerminalTheme,
  lines: TerminalLine[],
  currentInput: string,
  cursorVisible: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const c = THEMES[theme] || THEMES.amber;

  // 1. CRT monitor background
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Title bar
  ctx.fillStyle = c.headerBg;
  ctx.fillRect(0, 0, w, 44);
  ctx.strokeStyle = c.headerBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, 44);

  // 3 retro window dots (Mac / Linux)
  const dots = [
    { x: 26, color: "#ef4444" },
    { x: 48, color: "#eab308" },
    { x: 70, color: "#22c55e" },
  ];
  dots.forEach(({ x, color }) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 22, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Title bar text
  ctx.fillStyle = c.bright;
  ctx.font = "bold 17px 'Menlo', 'Courier New', monospace";
  ctx.fillText("HUY-OS v2.6.0 (tty1) — diorama-island", 96, 28);

  ctx.fillStyle = c.text;
  ctx.font = "bold 14px 'Menlo', 'Courier New', monospace";
  ctx.fillText("[ONLINE]", w - 100, 28);

  // 3. Render terminal output lines
  const lineHeight = 25;
  const paddingX = 28;
  const startY = 76;
  const maxLines = 19;

  // Split multi-line strings into discrete lines
  const allSubLines: { text: string; color: string }[] = [];
  lines.forEach((l) => {
    const subs = l.text.split("\n");
    subs.forEach((lineText) => {
      let color = c.text;
      if (l.type === "system") color = c.dim;
      if (l.type === "input") color = c.bright;
      if (l.type === "error") color = c.error;
      if (l.type === "ascii") color = c.bright;
      allSubLines.push({ text: lineText, color });
    });
  });

  // Take the most recent lines so it auto-scrolls down
  const visibleLines = allSubLines.slice(-maxLines);
  ctx.font = "18px 'Menlo', 'Courier New', monospace";

  visibleLines.forEach((item, idx) => {
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, paddingX, startY + idx * lineHeight);
  });

  // 4. Active prompt & input line
  const promptY = startY + visibleLines.length * lineHeight;
  if (promptY <= h - 42) {
    ctx.fillStyle = c.prompt;
    const promptStr = "guest@diorama:~$ ";
    ctx.fillText(promptStr, paddingX, promptY);

    const prefixWidth = ctx.measureText(promptStr).width;
    ctx.fillStyle = c.bright;
    ctx.fillText(currentInput, paddingX + prefixWidth, promptY);

    // Blinking cursor
    if (cursorVisible) {
      const inputWidth = ctx.measureText(currentInput).width;
      ctx.fillStyle = c.cursor;
      ctx.fillRect(paddingX + prefixWidth + inputWidth + 2, promptY - 17, 10, 20);
    }
  }

  // 5. Bottom hint bar
  ctx.strokeStyle = c.headerBorder;
  ctx.strokeRect(0, h - 34, w, 34);
  ctx.fillStyle = c.headerBg;
  ctx.fillRect(0, h - 34, w, 34);

  ctx.fillStyle = c.dim;
  ctx.font = "14px 'Menlo', 'Courier New', monospace";
  ctx.fillText("Lệnh: help | skills | hire | teleport towers | cat | theme | exit", 24, h - 12);

  // 6. Scanlines
  ctx.fillStyle = c.scanline;
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
}
