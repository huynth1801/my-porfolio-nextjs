"use client";

import { useSyncExternalStore } from "react";
import gsap from "gsap";
import { story } from "@/app/components/three/island/story-store";
import { noteCatPoke } from "@/lib/achievements";
import { sfx } from "@/lib/audio";
import { profile } from "@/lib/content";
import { flappyOpen } from "@/app/components/three/island/flappy";
import { toyStore } from "@/app/components/three/island/hotspot-store";
import { openTerminal } from "@/lib/terminal-store";

export type ProximityId =
  | "cat"
  | "mailbox"
  | "arcade"
  | "elevator-up"
  | "elevator-down"
  | "dev-desk";

export interface ProximityTarget {
  id: ProximityId;
  label: string;
  icon: string;
  pos: [number, number, number]; // [x, y, z]
  radius: number;
  check?: (py: number) => boolean;
}

export const PROXIMITY_TARGETS: ProximityTarget[] = [
  {
    id: "dev-desk",
    label: "Lập trình (~ / CLI)",
    icon: "💻",
    pos: [-2.75, 0.3, 3.1],
    radius: 1.4,
    check: (py) => py < 1.0,
  },
  {
    id: "cat",
    label: "Vuốt ve Mèo cưng",
    icon: "🐾",
    pos: [-3.17, 0.3, 3.37],
    radius: 1.35,
    check: (py) => py < 1.0,
  },
  {
    id: "mailbox",
    label: "Nhận CV (PDF)",
    icon: "📬",
    pos: [-2.2, 0.3, 3.4],
    radius: 1.25,
    check: (py) => py < 1.0,
  },
  {
    id: "arcade",
    label: "Chơi Flappy.DEV",
    icon: "🕹️",
    pos: [-2.54, 0.3, -1.56],
    radius: 1.35,
    check: (py) => py < 1.0,
  },
  {
    id: "elevator-up",
    label: "Đi thang máy lên sân thượng",
    icon: "🛗",
    pos: [2.75, 0.3, -0.35],
    radius: 1.45,
    check: (py) => py < 1.2,
  },
  {
    id: "elevator-down",
    label: "Đi thang máy xuống đất",
    icon: "🛗",
    pos: [2.85, 3.85, -0.8],
    radius: 1.6,
    check: (py) => py > 3.0,
  },
];

type ProximityState = {
  active: ProximityTarget | null;
  heartsCount: number;
  mailboxOpen: boolean;
  toast: { text: string; icon: string } | null;
};

const state: ProximityState = {
  active: null,
  heartsCount: 0,
  mailboxOpen: false,
  toast: null,
};

const listeners = new Set<() => void>();
let snapshot = { ...state };

function emit() {
  snapshot = { ...state };
  listeners.forEach((fn) => fn());
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
export function showProximityToast(text: string, icon = "✨") {
  if (toastTimer) clearTimeout(toastTimer);
  state.toast = { text, icon };
  emit();
  toastTimer = setTimeout(() => {
    state.toast = null;
    emit();
  }, 3500);
}

export const proximityStore = {
  get: () => snapshot,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setActive: (target: ProximityTarget | null) => {
    if (state.active?.id !== target?.id) {
      state.active = target;
      emit();
    }
  },
  triggerActive: () => {
    if (!state.active) return;
    executeInteraction(state.active.id);
  },
  triggerId: (id: ProximityId) => {
    executeInteraction(id);
  },
};

export function useProximity() {
  return useSyncExternalStore(proximityStore.subscribe, proximityStore.get, proximityStore.get);
}

// Interaction execution logic
let isInteracting = false;

function executeInteraction(id: ProximityId) {
  if (isInteracting) return;

  switch (id) {
    case "dev-desk": {
      isInteracting = true;
      gsap.to(story, {
        px: -2.62,
        pz: 3.32,
        py: 0.36,
        heading: 3.49,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          isInteracting = false;
        },
      });
      sfx.click();
      openTerminal();
      showProximityToast("Đang ngồi lập trình tại bàn máy tính (~)", "💻");
      break;
    }

    case "cat": {
      isInteracting = true;
      // Face the cat
      const catPos = PROXIMITY_TARGETS.find((t) => t.id === "cat")!.pos;
      story.heading = Math.atan2(catPos[0] - story.px, catPos[2] - story.pz);
      story.pose = "pet"; // triggers Dance_Wave animation

      sfx.meow();
      noteCatPoke();
      toyStore.catPokes++;
      state.heartsCount++;
      emit();

      showProximityToast("Mèo cưng kêu meow và thích thú!", "🐱");

      setTimeout(() => {
        story.pose = "idle";
        isInteracting = false;
      }, 2400);
      break;
    }

    case "mailbox": {
      isInteracting = true;
      const mailPos = PROXIMITY_TARGETS.find((t) => t.id === "mailbox")!.pos;
      story.heading = Math.atan2(mailPos[0] - story.px, mailPos[2] - story.pz);
      story.pose = "peace"; // reach/greeting pose

      sfx.click();
      state.mailboxOpen = true;
      story.fx.sparkle++;
      emit();

      // Trigger actual download of CV
      const a = document.createElement("a");
      a.href = profile.resume;
      a.download = "NguyenThaiHuuHuy_FrontEndDeveloper_2026.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showProximityToast("Đã nhận hồ sơ CV của Huy Nguyen!", "📄");

      setTimeout(() => {
        story.pose = "idle";
        state.mailboxOpen = false;
        isInteracting = false;
        emit();
      }, 1800);
      break;
    }

    case "arcade": {
      const arcPos = PROXIMITY_TARGETS.find((t) => t.id === "arcade")!.pos;
      story.heading = Math.atan2(arcPos[0] - story.px, arcPos[2] - story.pz);
      sfx.click();
      flappyOpen();
      showProximityToast("Đang chơi máy Arcade Flappy.DEV! Bấm Space / Click để bay", "🕹️");
      break;
    }

    case "elevator-up": {
      isInteracting = true;
      sfx.chime();
      showProximityToast("Đang đi thang máy lên đài quan sát...", "🛗");

      // Elevator glide up
      gsap.to(story, {
        px: 2.85,
        pz: -0.8,
        py: 3.85,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          sfx.chime();
          story.pose = "cheer";
          story.fx.sparkle++;
          showProximityToast("Chào mừng bạn lên đỉnh tháp Career Towers! 🌆", "🏢");
          setTimeout(() => {
            story.pose = "idle";
            isInteracting = false;
          }, 1500);
        },
      });
      break;
    }

    case "elevator-down": {
      isInteracting = true;
      sfx.chime();
      showProximityToast("Đang đi thang máy xuống sảnh tầng trệt...", "🛗");

      // Elevator glide down
      gsap.to(story, {
        px: 2.75,
        pz: -0.35,
        py: 0.3,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          sfx.chime();
          story.pose = "idle";
          showProximityToast("Đã trở lại sảnh tầng trệt!", "🏡");
          isInteracting = false;
        },
      });
      break;
    }
  }
}
