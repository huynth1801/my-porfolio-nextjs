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
let actAt: number[] = [0, 9, 19, 27];

/** Caption track — the UI polls `captionFor(time)`. */
export const CAPTIONS: Array<{ t: number; text: string }> = [
  { t: 0, text: "Once upon a build — a curious kid wakes up in Saigon." },
  { t: 2.7, text: "First teammate: one very smug cat." },
  { t: 4.8, text: "Level up! School time." },
  { t: 8.3, text: "Jump #1 — the academic leap of faith." },
  { t: 11.3, text: "4 years of algorithms, UX and all-nighters." },
  { t: 14.9, text: "B.Sc. unlocked. Hat toss: flawless." },
  { t: 18.5, text: "Then the arcade called — games, not just apps." },
  { t: 22.2, text: "Shipped: Flappy Bird · Sunfix · MyShop…" },
  { t: 26.5, text: "Career towers: TGM · CAS · Likelion · Onechain." },
  { t: 32.4, text: "Sẵn sàng cho dự án tiếp theo cùng bạn!" },
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
  { label: "Tuổi thơ", icon: "🏡" },
  { label: "Đại học", icon: "🎓" },
  { label: "Dự án", icon: "🕹️" },
  { label: "Sự nghiệp", icon: "🏢" },
];

/** Timeline time at which each act begins (filled during build). */
export function getActTimes(): number[] {
  return [...actAt];
}

export function buildStoryTimeline(): gsap.core.Timeline {
  if (timeline) return timeline;
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      story.pose = "peace";
    },
  });
  const S = story;
  let c = 0; // sequential cursor — every helper advances it
  actAt = [];

  const hold = (dur: number) => {
    c += dur;
  };
  const call = (fn: () => void) => {
    tl.call(fn, undefined, c);
  };
  const tween = (vars: gsap.TweenVars, dur: number, ease = "power2.inOut") => {
    tl.to(S, { ...vars, duration: dur, ease }, c);
    c += dur;
  };
  const turn = (dir: number, dur = 0.3) => {
    tl.to(S, { heading: dir, duration: dur, ease: "power2.inOut" }, c);
    c += dur;
  };
  // walk = turn toward target + speed ramp + move + stop (no instant velocity)
  const walk = (to: { x: number; y: number; z: number }, dur: number) => {
    turn(headingTo(cur, to), 0.3);
    tl.to(S, { speed: 1, duration: 0.25, ease: "power1.in" }, c);
    c += 0.25;
    tl.to(S, { px: to.x, pz: to.z, duration: dur, ease: "none" }, c);
    c += dur;
    tl.to(S, { speed: 0, duration: 0.3, ease: "power2.out" }, c);
    c += 0.3;
  };
  // jump = turn + anticipation crouch + parabola + landing squash. All in one
  // helper so every leap gets the same anticipation/overshoot treatment, and
  // jumpT is driven by exactly one tween (tl.set, not a competing .to).
  const jump = (
    to: { x: number; y: number; z: number },
    dur: number,
    h: number,
    opts: { flip?: boolean; superman?: boolean } = {},
  ) => {
    turn(headingTo(cur, to), 0.28);
    call(() => {
      S.pose = "prep";
      S.squash = 1;
    });
    hold(0.28);
    tl.to(S, { squash: 0, duration: 0.16, ease: "power2.out" }, c);
    tl.set(S, { jumpT: 0, jumpH: h }, c);
    const js = c;
    tl.to(S, { px: to.x, pz: to.z, jumpT: 1, duration: dur, ease: "none" }, c);
    c += dur;
    if (opts.flip) tl.fromTo(S, { flip: 0 }, { flip: 1, duration: dur, ease: "power1.inOut" }, js);
    call(() => {
      S.fx.dust++;
      S.py = to.y;
      S.jumpT = 1;
      S.jumpH = 0;
      S.flip = 0;
      S.pose = "land";
      S.squash = 1;
      sfx.click();
    });
    tl.to(S, { squash: 0, duration: 0.35, ease: "elastic.out(1, 0.45)" }, c);
    c += 0.35;
  };

  /* ---------------- ACT 1 — Origins (house) ---------------- */
  actAt.push(0);
  call(() => {
    S.px = STOPS.spawn.x;
    S.py = STOPS.spawn.y;
    S.pz = STOPS.spawn.z;
    S.scale = 0.55;
    S.rise = 0;
    S.pose = "sleep";
    S.heading = 2.4;
  });
  hold(0.8);
  tween({ rise: 1 }, 1.4);
  call(() => {
    S.pose = "idle";
  });
  hold(0.5);
  call(() => {
    S.pose = "pet";
    toyStore.catPokes++;
    sfx.meow();
  });
  hold(1.8);
  call(() => {
    S.pose = "idle";
  });
  hold(0.3);
  // level-up: ring + grow + backpack
  call(() => {
    S.pose = "prep";
  });
  tween({ fx: { ...S.fx, levelUp: 1 } }, 0.7, "power2.out");
  tween({ scale: 0.78 }, 1.3);
  tween({ props: { ...S.props, backpack: 1 } }, 0.5);
  tween({ fx: { ...S.fx, levelUp: 0 } }, 0.7, "power2.in");
  hold(0.3);

  /* ---------------- ACT 2 — School ---------------- */
  actAt.push(c);
  let cur = STOPS.spawn;
  jump(STOPS.school, 1.15, 2.6, { superman: true });
  cur = STOPS.school;
  turn(0.25, 0.4);
  call(() => {
    S.pose = "study";
    S.props.book = 1;
    S.fx.cubes = 1;
  });
  hold(3.4);
  call(() => {
    S.fx.cubes = 0;
    S.props.book = 0;
  });
  hold(0.2);
  call(() => {
    S.pose = "cheer";
    S.props.gradCap = 1;
    S.fx.sparkle++;
    sfx.meow();
  });
  tween({ py: 0.55 }, 0.3, "power2.out");
  tween({ py: 0.3 }, 0.3, "power2.in");
  hold(0.7);
  call(() => {
    S.fx.sparkle++;
  });
  hold(1.5);
  hold(0.4);

  /* ---------------- ACT 3 — Arcade ---------------- */
  actAt.push(c);
  jump(STOPS.arcade, 1.25, 2.4, { flip: true });
  cur = STOPS.arcade;
  call(() => {
    S.pose = "idle";
    S.props.hoodie = 1;
  });
  walk({ x: cur.x + 0.55, y: 0.3, z: cur.z + 0.75 }, 0.6);
  call(() => {
    S.pose = "type";
    S.fx.confetti++;
  });
  hold(2.2);
  call(() => {
    S.fx.confetti++;
  });
  hold(1.4);
  hold(0.4);

  /* ---------------- ACT 4 — Career towers ---------------- */
  actAt.push(c);
  cur = STOPS.towerBase;
  walk({ x: cur.x - 0.6, y: 0.3, z: cur.z + 0.5 }, 1.1);
  call(() => {
    S.props.glasses = 1;
    S.props.badge = 1;
    S.props.laptop = 1;
    S.pose = "idle";
  });
  hold(0.5);
  jump(STOPS.ledge, 0.85, 1.2);
  jump(STOPS.roof, 1.05, 1.6);
  call(() => {
    S.pose = "peace";
    S.fx.confetti++;
    S.fx.sparkle++;
    sfx.meow();
  });
  hold(6);

  timeline = tl;
  return timeline;
}

/* ------------------------------------------------------------------ */
/* Player API                                                          */
/* ------------------------------------------------------------------ */

export function startStory(actIndex = 0) {
  buildStoryTimeline();
  if (actIndex === 0) {
    timeline!.play(0);
    story.playing = true;
    act = 0;
    paused = false;
    uiOpen = true;
    emitUi();
  } else {
    seekAct(actIndex);
  }
}

export function exitStory() {
  story.playing = false;
  uiOpen = false;
  paused = false;
  timeline?.pause();
  // put the boy back on his feet at the house porch
  const S = story;
  S.px = STOPS.spawn.x;
  S.py = STOPS.spawn.y;
  S.pz = STOPS.spawn.z;
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
  buildStoryTimeline();
  timeline!.timeScale(1);
  timeline!.play(0);
  paused = false;
  story.playing = true;
  uiOpen = true;
  act = 0;
  emitUi();
}

export function seekAct(actIndex: number) {
  const tl = buildStoryTimeline();
  story.playing = true;
  uiOpen = true;
  act = actIndex;
  paused = false;
  emitUi();

  // glide the boy to the act entry point before handing control back —
  // a raw tl.seek() would teleport him across the island
  tl.pause();
  const at = getActTimes()[actIndex] ?? 0;
  const entries = [
    { x: STOPS.spawn.x, z: STOPS.spawn.z },
    { x: STOPS.school.x, z: STOPS.school.z },
    { x: STOPS.arcade.x, z: STOPS.arcade.z },
    { x: STOPS.towerBase.x, z: STOPS.towerBase.z },
  ];
  const entry = entries[actIndex] ?? entries[0];
  gsap.to(story, {
    px: entry.x,
    pz: entry.z,
    py: 0.3,
    duration: 0.55,
    ease: "power2.inOut",
    onComplete: () => {
      tl.play(at, false);
    },
  });
}

export function storyTime(): number {
  return timeline?.time() ?? 0;
}

export function storyDuration(): number {
  return timeline?.duration() ?? 33;
}
