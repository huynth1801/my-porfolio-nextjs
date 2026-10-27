"use client";

import { useSyncExternalStore } from "react";
import type { PanelKey } from "@/lib/content";

/**
 * Which quick-view panel is open. Module-level store so 3D hotspots (inside
 * the Canvas) and the HTML overlay (outside it) stay in sync without prop
 * drilling or context providers.
 */
let current: PanelKey | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export const panelStore = {
  get: () => current,
  open(key: PanelKey) {
    current = key;
    emit();
  },
  close() {
    current = null;
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function usePanel(): PanelKey | null {
  return useSyncExternalStore(panelStore.subscribe, panelStore.get, panelStore.get);
}
