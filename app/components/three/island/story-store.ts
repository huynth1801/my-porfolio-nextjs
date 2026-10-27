"use client";

import gsap from "gsap";
import { toyStore } from "./hotspot-store";
import { sfx } from "@/lib/audio";

/**
 * "The Developer's Odyssey" — story mode state.
 *
 * GSAP tweens ONLY plain scalars on `story` (positions, jump progress,
 * pose flags, prop fades). The BoyCharacter turns those scalars into a
 * fully procedural pose every frame in useFrame (run cycles, squash &
 * stretch, damping) — that split is what keeps the whole thing at 60fps:
 * timeline seeks are instant, and no React component re-renders during
 * playback.
 */

export type StoryPose =
  | "sleep"
  | "idle"
  | "pet"
  | "prep"
  | "jump"
  | "land"
  | "walk"
  | "study"
  | "cheer"
  | "type"
  | "peace";

export const story = {
  playing: false,

  /** world position (x/z on the island, y = ground height of the stop) */
  px: -2.7,
  py: 0.3,
  pz: 1.75,
  /** facing, radians — damped in the character (shortest arc) */
  heading: 2.4,

  /** chibi → grown-up body scale */
  scale: 0.78,
  /** 0 = lying/sitting asleep, 1 = standing */
  rise: 1,
  /** 0..1 squash-stretch envelope (GSAP yoyo keyframes on jumps/landings) */
  squash: 0,
  /** active jump progress 0..1 (height = jumpH * 4t(1-t)) */
  jumpT: 1,
  jumpH: 0,
  /** 0..1 — full body flip during the arcade jump */
  flip: 0,
  /** ground speed → drives the run cycle */
  speed: 0,

  pose: "idle" as StoryPose,

  props: { backpack: 0, hoodie: 0, glasses: 0, badge: 0, gradCap: 0, laptop: 0, book: 0 },
  fx: { levelUp: 0, dust: 0, sparkle: 0, cubes: 0, confetti: 0 },
};

/** React-facing player state (chips, pause, captions) */
import { useSyncExternalStore } from "react";

type UiListener = () => void;
let uiOpen = false;
let paused = false;
let act = 0;
const uiListeners = new Set<UiListener>();
let uiSnapshot = { open: false, paused: false, act: 0 };

function emitUi() {
  uiSnapshot = { open: uiOpen, paused, act };
  uiListeners.forEach((fn) => fn());
}

export function useStoryUi() {
  return useSyncExternalStore(
    storyUi.subscribe,
    () => uiSnapshot,
    () => uiSnapshot,
  );
}

export const storyUi = {
  get open() {
    return uiOpen;
  },
  get paused() {
    return paused;
  },
  get act() {
    return act;
  },
  set(state: { open?: boolean; paused?: boolean; act?: number }) {
    if (state.open !== undefined) uiOpen = state.open;
    if (state.paused !== undefined) paused = state.paused;
    if (state.act !== undefined) act = state.act;
    emitUi();
  },
  subscribe(fn: UiListener) {
    uiListeners.add(fn);
    return () => uiListeners.delete(fn);
  },
};

/* ------------------------------------------------------------------ */
/* Waypoints (island world coords — measured from the district groups) */
/* ------------------------------------------------------------------ */

export const STOPS = {
  spawn: { x: -2.7, y: 0.3, z: 1.75 },
  porch: { x: -2.75, y: 0.3, z: 2.0 },
  school: { x: 2.95, y: 0.3, z: 3.75 },
  arcade: { x: -2.45, y: 0.3, z: -1.55 },
  towerBase: { x: 2.75, y: 0.3, z: -0.35 },
  ledge: { x: 2.42, y: 1.95, z: -0.62 },
  roof: { x: 2.85, y: 4.62, z: -0.8 },
};

function headingTo(from: { x: number; z: number }, to: { x: number; z: number }) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

/* ------------------------------------------------------------------ */
/* The timeline                                                        */
/* ------------------------------------------------------------------ */

let timeline: gsap.core.Timeline | null = null;

/** Caption track — the UI polls `captionFor(time)`. */
export const CAPTIONS: Array<{ t: number; text: string }> = [
  { t: 0, text: "Once upon a build — a curious kid wakes up in Saigon." },
  { t: 3.4, text: "First teammate: one very smug cat." },
  { t: 5.6, text: "Level up! School time." },
  { t: 9.4, text: "Jump #1 — the academic leap of faith." },
  { t: 12.4, text: "4 years of algorithms, UX and all-nighters." },
  { t: 16.2, text: "B.Sc. unlocked. Hat toss: flawless." },
  { t: 19.4, text: "Then the arcade called — games, not just apps." },
  { t: 23.2, text: "Shipped: Flappy Bird · Sunfix · MyShop…" },
  { t: 26.6, text: "Career towers: TGM · CAS · Likelion · Onechain." },
  { t: 30.4, text: "Sẵn sàng cho dự án tiếp theo cùng bạn!" },
];

export function captionFor(time: number): string {
  let text = CAPTIONS[0].text;
  for (const c of CAPTIONS) if (time >= c.t) text = c.text;
  return text;
}

// dev/testing aid: live story state readable from the console/tests
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__story = story;
}

export const STORY_ACTS = [
  { label: "Tuổi thơ", icon: "🏡", at: 0 },
  { label: "Đại học", icon: "🎓", at: 9.2 },
  { label: "Dự án", icon: "🕹️", at: 19.2 },
  { label: "Sự nghiệp", icon: "🏢", at: 26.4 },
];

export function buildStoryTimeline(): gsap.core.Timeline {
  if (timeline) return timeline;
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      story.pose = "peace";
    },
  });
  const S = story;
  // ground position helper: walk to a stop
  const walk = (to: { x: number; z: number }, dur: number, at?: number) => {
    tl.to(S, { px: to.x, pz: to.z, speed: 1, duration: dur, ease: "none" }, at);
    tl.to(S, { speed: 0, duration: 0.15 }, at === undefined ? ">" : (at as number) + dur);
  };
  const jump = (
    to: { x: number; y: number; z: number },
    dur: number,
    h: number,
    at: number,
    opts: { flip?: boolean; superman?: boolean } = {},
  ) => {
    tl.call(
      () => {
        S.heading = headingTo({ x: S.px, z: S.pz }, to);
        S.pose = "jump";
        S.squash = 1;
      },
      undefined,
      at,
    );
    tl.to(S, { squash: 0, duration: 0.18, ease: "power2.out" }, at + 0.02);
    tl.to(S, { px: to.x, pz: to.z, jumpT: 1, duration: dur, ease: "none" }, at);
    tl.fromTo(S, { jumpT: 0, jumpH: h }, { jumpH: h, duration: dur, ease: "none" }, at);
    if (opts.flip) tl.fromTo(S, { flip: 0 }, { flip: 1, duration: dur, ease: "power1.inOut" }, at);
    tl.call(
      () => {
        S.fx.dust++;
        S.py = to.y;
        S.jumpT = 1;
        S.jumpH = 0;
        S.flip = 0;
        S.pose = "land";
        S.squash = 1;
        sfx.click();
      },
      undefined,
      at + dur,
    );
    tl.to(S, { squash: 0, duration: 0.3, ease: "elastic.out(1, 0.4)" }, at + dur + 0.02);
  };

  /* ---------------- ACT 1 — Origins (house) ---------------- */
  tl.call(() => {
    S.px = STOPS.spawn.x;
    S.py = STOPS.spawn.y;
    S.pz = STOPS.spawn.z;
    S.scale = 0.55;
    S.rise = 0;
    S.pose = "sleep";
    S.heading = 2.4;
  });
  tl.to(S, { rise: 1, duration: 1.4, ease: "power2.inOut" }, 0.8);
  tl.call(() => {
    S.pose = "idle";
  }, undefined, 2.3);
  // pet the cat
  tl.call(() => {
    S.pose = "pet";
    toyStore.catPokes++;
    sfx.meow();
  }, undefined, 3.4);
  tl.to(S, { duration: 1.8 }); // hold the pet moment
  tl.call(() => {
    S.pose = "idle";
  }, undefined, 5.3);
  // level-up: ring + grow + backpack
  tl.call(() => {
    S.pose = "prep";
  }, undefined, 5.6);
  tl.to(S.fx, { levelUp: 1, duration: 0.7, ease: "power2.out" }, 5.6);
  tl.to(S, { scale: 0.78, duration: 1.3, ease: "power2.inOut" }, 5.7);
  tl.to(S.props, { backpack: 1, duration: 0.5 }, 6.1);
  tl.to(S.fx, { levelUp: 0, duration: 0.7, ease: "power2.in" }, 6.5);
  tl.call(() => {
    S.heading = headingTo(STOPS.spawn, STOPS.school);
  }, undefined, 8.2);
  tl.to(S, { duration: 1 }); // anticipation beat
  /* ---------------- ACT 2 — School ---------------- */
  jump(STOPS.school, 1.15, 2.6, 9.4, { superman: true });
  walk({ x: STOPS.school.x, z: STOPS.school.z }, 0.7, 10.6);
  // study: book up, tech cubes flow into him
  tl.call(() => {
    S.pose = "study";
    S.props.book = 1;
    S.fx.cubes = 1;
  }, undefined, 11.5);
  tl.to(S, { duration: 3.6 });
  tl.call(() => {
    S.fx.cubes = 0;
    S.props.book = 0;
  }, undefined, 15.2);
  // graduation: cheer hop + cap + toss with golden sparkles
  tl.call(() => {
    S.pose = "cheer";
    S.props.gradCap = 1;
    S.fx.sparkle++;
    sfx.meow(); // playful chirp substitute
  }, undefined, 15.8);
  tl.to(S, { py: 0.55, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }, 15.9);
  tl.to(S, { duration: 0.8 });
  // cap toss: the cap itself is animated in boy.tsx from tossT-like beat
  tl.call(() => {
    S.fx.sparkle++;
  }, undefined, 17.3);
  tl.to(S, { duration: 1.6 }); // bask in glory, look toward arcade
  tl.call(() => {
    S.heading = headingTo(STOPS.school, STOPS.arcade);
  }, undefined, 18.6);
  /* ---------------- ACT 3 — Arcade ---------------- */
  jump(STOPS.arcade, 1.25, 2.4, 19.4, { flip: true });
  tl.call(() => {
    S.pose = "idle";
    S.props.hoodie = 1;
  }, undefined, 20.9);
  walk({ x: STOPS.arcade.x + 0.55, z: STOPS.arcade.z + 0.75 }, 0.8, 21.0);
  // dev mode at the joystick: type + neon confetti bursts
  tl.call(() => {
    S.pose = "type";
    S.fx.confetti++;
  }, undefined, 22.4);
  tl.to(S, { duration: 2.2 });
  tl.call(() => {
    S.fx.confetti++;
  }, undefined, 24.6);
  tl.to(S, { duration: 1.6 }); // marquee blinking moment
  tl.call(() => {
    S.heading = headingTo(STOPS.arcade, STOPS.towerBase);
  }, undefined, 25.6);
  /* ---------------- ACT 4 — Career towers ---------------- */
  walk({ x: STOPS.towerBase.x - 0.6, z: STOPS.towerBase.z + 0.5 }, 1.3, 26.4);
  tl.call(() => {
    S.props.glasses = 1;
    S.props.badge = 1;
    S.props.laptop = 1;
    S.pose = "idle";
  }, undefined, 27.9);
  // climb: ledge hop then rooftop
  jump(STOPS.ledge, 0.85, 1.2, 28.6);
  jump(STOPS.roof, 1.05, 1.6, 29.8);
  // rooftop hero pose
  tl.call(() => {
    S.pose = "peace";
    S.fx.confetti++;
    S.fx.sparkle++;
    sfx.meow();
  }, undefined, 31.2);
  tl.to(S, { duration: 6 }); // hold the closing shot

  timeline = tl;
  return timeline;
}

/* ------------------------------------------------------------------ */
/* Player API                                                          */
/* ------------------------------------------------------------------ */

export function startStory(actIndex = 0) {
  const tl = buildStoryTimeline();
  const at = STORY_ACTS[actIndex]?.at ?? 0;
  if (!story.playing) {
    tl.timeScale(1);
    tl.play(0);
    if (at > 0) tl.seek(at, false);
    story.playing = true;
  } else {
    tl.seek(at, false);
  }
  act = actIndex;
  paused = false;
  uiOpen = true;
  emitUi();
}

export function exitStory() {
  story.playing = false;
  uiOpen = false;
  paused = false;
  timeline?.pause();
  // put the boy back on his feet at the house porch
  const S = story;
  S.px = -2.7;
  S.py = 0.3;
  S.pz = 1.75;
  S.scale = 0.78;
  S.rise = 1;
  S.pose = "idle";
  S.jumpT = 1;
  S.jumpH = 0;
  S.flip = 0;
  S.speed = 0;
  S.squash = 0;
  S.heading = 2.4;
  S.props.backpack = 0;
  S.props.hoodie = 0;
  S.props.glasses = 0;
  S.props.badge = 0;
  S.props.gradCap = 0;
  S.props.laptop = 0;
  S.props.book = 0;
  S.fx.cubes = 0;
  emitUi();
}

export function togglePause() {
  if (!timeline) return;
  paused = !paused;
  if (paused) timeline.pause();
  else timeline.play();
  emitUi();
}

export function replayStory() {
  const tl = buildStoryTimeline();
  tl.timeScale(1);
  tl.play(0);
  paused = false;
  story.playing = true;
  uiOpen = true;
  act = 0;
  emitUi();
}

export function seekAct(actIndex: number) {
  const tl = buildStoryTimeline();
  if (!story.playing) {
    story.playing = true;
    uiOpen = true;
  }
  tl.play(STORY_ACTS[actIndex]?.at ?? 0);
  paused = false;
  act = actIndex;
  emitUi();
}

export function storyTime(): number {
  return timeline?.time() ?? 0;
}

export function storyDuration(): number {
  return timeline?.duration() ?? 33;
}
