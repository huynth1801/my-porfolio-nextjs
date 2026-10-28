"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { PanelKey } from "@/lib/content";

/**
 * Achievement system: track exploration + playful interactions, unlock
 * badges, and surface a toast. Persisted in localStorage so progress
 * survives reloads.
 */

export type AchievementId = "explorer" | "gamer" | "cat";

export const ACHIEVEMENT_DEFS: Record<
  AchievementId,
  { title: string; desc: string; icon: string }
> = {
  explorer: { title: "Certified Explorer", desc: "Visited all 6 districts of the island", icon: "🏆" },
  gamer: { title: "Flappy Master", desc: "Scored 5+ in Flappy.DEV", icon: "🎮" },
  cat: { title: "Cat Person", desc: "Petted the island cat 3 times", icon: "🐈" },
};

export const DISTRICT_KEYS: PanelKey[] = [
  "about",
  "experience",
  "projects",
  "skills",
  "education",
  "contact",
];

type Persisted = { visited: PanelKey[]; catPokes: number };

const state = {
  visited: new Set<PanelKey>(),
  catPokes: 0,
  unlocked: new Set<AchievementId>(),
  /** last unlock, for the toast — session only */
  last: null as { id: AchievementId; title: string; desc: string; icon: string } | null,
};

const listeners = new Set<() => void>();
let snapshot: AchSnapshot = readSnapshot();

function readSnapshot(): AchSnapshot {
  return {
    visited: state.visited.size,
    unlocked: state.unlocked.size,
    last: state.last,
  };
}

function emitUi() {
  snapshot = readSnapshot();
  listeners.forEach((fn) => fn());
}

/**
 * Restores saved progress. MUST run after mount (never during render):
 * the server and the first client render both see the empty state, so
 * hydration matches — saved values fade in right after.
 */
export function hydrateAchievements() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem("huy:ach");
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      (p.visited ?? []).forEach((k) => state.visited.add(k));
      state.catPokes = p.catPokes ?? 0;
      emitUi();
    }
  } catch {}
}

let hydrated = false;

function persist() {
  try {
    localStorage.setItem(
      "huy:ach",
      JSON.stringify({ visited: [...state.visited], catPokes: state.catPokes }),
    );
  } catch {}
}

function unlock(id: AchievementId) {
  if (state.unlocked.has(id)) return;
  state.unlocked.add(id);
  const def = ACHIEVEMENT_DEFS[id];
  state.last = { id, ...def };
  emitUi();
}

function checkExplorer() {
  if (DISTRICT_KEYS.every((k) => state.visited.has(k))) unlock("explorer");
}

/* ---------------- public API ---------------- */

export function visitDistrict(key: PanelKey) {
  if (!state.visited.has(key)) {
    state.visited.add(key);
    persist();
    checkExplorer();
    emitUi();
  }
}

export function noteCatPoke() {
  state.catPokes++;
  persist();
  if (state.catPokes >= 3) unlock("cat");
  emitUi();
}

export function noteFlappyScore(score: number) {
  if (score >= 5) unlock("gamer");
  emitUi();
}

export function isUnlocked(id: AchievementId) {
  return state.unlocked.has(id);
}

/* ---------------- React bridge ---------------- */

export type AchSnapshot = {
  visited: number;
  unlocked: number;
  last: { id: AchievementId; title: string; desc: string; icon: string } | null;
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useAchievements(): AchSnapshot {
  // restore saved progress right after mount (empty state on first paint
  // keeps SSR and client identical — no hydration mismatch)
  useEffect(() => {
    hydrateAchievements();
  }, []);
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
