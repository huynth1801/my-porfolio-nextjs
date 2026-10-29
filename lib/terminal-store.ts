"use client";

import { useSyncExternalStore } from "react";
import gsap from "gsap";
import { sfx } from "@/lib/audio";
import { story } from "@/app/components/three/island/story-store";
import { panelStore } from "@/lib/panel-store";

export type TerminalTheme = "amber" | "green" | "cyan";

export interface TerminalLine {
  id: string;
  type: "system" | "input" | "output" | "error" | "ascii";
  text: string;
}

interface TerminalState {
  isOpen: boolean;
  theme: TerminalTheme;
  lines: TerminalLine[];
  currentInput: string;
}

const WELCOME_BANNER: TerminalLine[] = [
  {
    id: "banner-1",
    type: "system",
    text: "HUY-OS v2.6.0 (tty1) — Lo-fi Indie Dev Workstation",
  },
  {
    id: "banner-2",
    type: "system",
    text: "Connected to diorama-island (127.0.0.1:3000)",
  },
  {
    id: "banner-3",
    type: "output",
    text: "Type 'help' for available commands, or tap a quick chip below.",
  },
];

const state: TerminalState = {
  isOpen: false,
  theme: "amber",
  lines: [...WELCOME_BANNER],
  currentInput: "",
};

const listeners = new Set<() => void>();
let snapshot = { ...state };

function emit() {
  snapshot = { ...state, lines: [...state.lines] };
  listeners.forEach((fn) => fn());
}

export function setTerminalInput(input: string) {
  state.currentInput = input;
  emit();
}

export function subscribeTerminal(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getTerminalSnapshot() {
  return snapshot;
}

export function useTerminal() {
  return useSyncExternalStore(subscribeTerminal, getTerminalSnapshot, getTerminalSnapshot);
}

export function openTerminal() {
  state.isOpen = true;
  story.pose = "type";
  // Smoothly glide onto the desk stool facing the 3D laptop
  const dist = Math.hypot(story.px - -2.632, story.pz - 3.297);
  const dur = dist < 1.2 ? 0.35 : dist < 4 ? 0.5 : 0.65;
  gsap.to(story, {
    px: -2.632,
    pz: 3.297,
    py: 0.32,
    heading: -2.79,
    duration: dur,
    ease: "power2.out",
  });
  emit();
}

export function closeTerminal() {
  state.isOpen = false;
  if (story.pose === "type") {
    story.pose = "idle";
    gsap.to(story, {
      py: 0.3,
      duration: 0.25,
      ease: "power1.out",
    });
  }
  emit();
}

export function toggleTerminal() {
  if (state.isOpen) {
    closeTerminal();
  } else {
    openTerminal();
  }
}

export function setTerminalTheme(theme: TerminalTheme) {
  state.theme = theme;
  emit();
}

function appendLine(type: TerminalLine["type"], text: string) {
  state.lines.push({
    id: `line-${Date.now()}-${Math.random()}`,
    type,
    text,
  });
  emit();
}

export const commandHistory: string[] = [];

export function executeCommand(rawInput: string) {
  const input = rawInput.trim();
  if (!input) return;

  commandHistory.push(input);
  state.currentInput = "";

  // Echo user input
  appendLine("input", `$ ${input}`);

  const parts = input.split(/\s+/);
  const command = parts[0].replace(/^\/+/, "").toLowerCase();
  const arg = parts[1]?.toLowerCase();

  switch (command) {
    case "help":
    case "?": {
      appendLine(
        "output",
        [
          "Available commands:",
          "  help             Show this help menu",
          "  skills           Display technical skill matrix & ASCII art",
          "  hire             Open contact form / send an inquiry",
          "  teleport <zone>  Warp boy (towers, house, arcade, school, radio)",
          "  cat              Meow with Huy's cat 🐱",
          "  theme <color>    Switch color (amber, green, cyan)",
          "  whoami           Show developer profile",
          "  clear            Clear terminal screen",
          "  exit             Close this terminal session",
        ].join("\n"),
      );
      break;
    }

    case "skills": {
      appendLine(
        "ascii",
        [
          " _   _ _   ___   __   ____  _______     __",
          "| | | | | | \\ \\ / /  |  _ \\| ____\\ \\   / /",
          "| |_| | | | |\\ V /   | | | |  _|  \\ \\ / / ",
          "|  _  | |_| | | |    | |_| | |___  \\ V /  ",
          "|_| |_|\\___/  |_|    |____/|_____|  \\_/   ",
          "",
          "[CORE CAPABILITIES]",
          "• Web Frontend: React 19, Next.js 16 (App Router), TypeScript 5",
          "• 3D & Creative: Three.js, React Three Fiber, WebGL, GSAP, Shaders",
          "• Game Feel:     Cocos Creator, WebAudio API, State Machines",
          "• Styling & UI:  Tailwind CSS v4, Motion/Framer, Radix UI",
          "",
          "[PHILOSOPHY]",
          "Crafting interfaces with weight, snappy easing & playful immersion.",
        ].join("\n"),
      );
      break;
    }

    case "hire":
    case "contact": {
      sfx.chime();
      appendLine(
        "output",
        [
          "Opening direct contact channel...",
          "Email:    huuhuy1801@gmail.com",
          "Location: Ho Chi Minh City, Vietnam",
          "Status:   Available for Full-time & Creative Frontend roles ✨",
        ].join("\n"),
      );
      closeTerminal();
      panelStore.open("contact");
      break;
    }

    case "teleport":
    case "tp":
    case "warp": {
      if (!arg) {
        appendLine("error", "Usage: teleport <zone>\nZones: towers, house, arcade, school, radio");
        return;
      }

      let dest = { x: 0, y: 0.3, z: 0, name: "" };
      if (arg === "towers" || arg === "tower") {
        dest = { x: 2.85, y: 3.85, z: -0.8, name: "Career Towers 35F Sky Observatory" };
      } else if (arg === "house" || arg === "home") {
        dest = { x: -3.17, y: 0.3, z: 3.37, name: "DistrictHouse (Porch & Cat)" };
      } else if (arg === "arcade" || arg === "game") {
        dest = { x: -2.54, y: 0.3, z: -1.56, name: "DistrictArcade (Flappy.DEV)" };
      } else if (arg === "school") {
        dest = { x: 2.8, y: 0.3, z: 2.4, name: "Tech Academy (Clocktower)" };
      } else if (arg === "radio" || arg === "beacon") {
        dest = { x: 0.2, y: 0.3, z: -3.8, name: "Broadcast Tower & Beacon" };
      } else {
        appendLine("error", `Unknown zone '${arg}'. Valid: towers, house, arcade, school, radio`);
        return;
      }

      sfx.warp();
      story.fx.sparkle++;
      story.pose = "cheer";

      gsap.to(story, {
        px: dest.x,
        py: dest.y,
        pz: dest.z,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setTimeout(() => {
            story.pose = "idle";
          }, 1200);
        },
      });

      appendLine("output", `⚡ Warp coordinates locked. Teleported to [${dest.name}]!`);
      break;
    }

    case "cat":
    case "meow": {
      sfx.meow();
      story.fx.sparkle++;
      appendLine(
        "ascii",
        [
          " /\\_/\\  ",
          "( o.o )  ~ Meow! Chú mèo cưng trên hiên nhà kêu thích thú!",
          " > ^ <  ",
        ].join("\n"),
      );
      break;
    }

    case "theme": {
      if (arg === "green" || arg === "amber" || arg === "cyan") {
        setTerminalTheme(arg);
        sfx.chime();
        appendLine("output", `Phosphor theme switched to [${arg}].`);
      } else {
        appendLine("error", "Usage: theme <amber | green | cyan>");
      }
      break;
    }

    case "whoami": {
      appendLine(
        "output",
        [
          "Huy Nguyen (Nguyen Thai Huu Huy)",
          "Frontend Developer based in Ho Chi Minh City.",
          "Passionate about interactive 3D, physics animations, and game-feel design.",
          "Portfolio: https://my-porfolio-nextjs.vercel.app",
        ].join("\n"),
      );
      break;
    }

    case "projects":
    case "project": {
      sfx.click();
      appendLine("output", "Opening featured projects showcase...");
      closeTerminal();
      panelStore.open("projects");
      break;
    }

    case "about":
    case "bio": {
      sfx.click();
      appendLine("output", "Opening developer story & bio...");
      closeTerminal();
      panelStore.open("about");
      break;
    }

    case "experience":
    case "exp": {
      sfx.click();
      appendLine("output", "Opening career timeline & experience...");
      closeTerminal();
      panelStore.open("experience");
      break;
    }

    case "cv":
    case "resume": {
      sfx.click();
      appendLine("output", "Downloading Huy Nguyen's updated resume PDF...");
      const a = document.createElement("a");
      a.href = "/NguyenThaiHuuHuy_FrontEndDeveloper_2026.pdf";
      a.download = "NguyenThaiHuuHuy_FrontEndDeveloper_2026.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      break;
    }

    case "clear":
    case "cls": {
      state.lines = [];
      emit();
      return;
    }

    case "exit":
    case "quit": {
      closeTerminal();
      return;
    }

    default: {
      appendLine("error", `command not found: ${command}. Type 'help' to see available commands.`);
    }
  }
}

// Global hotkey: ~ (Backquote) to toggle terminal
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    // Check if user is typing inside standard text input outside terminal
    const el = document.activeElement;
    const isExternalInput =
      el &&
      el.id !== "terminal-input" &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.getAttribute("contenteditable") === "true");

    if (isExternalInput) return;

    if (e.code === "Backquote") {
      e.preventDefault();
      toggleTerminal();
    }
  });
}
