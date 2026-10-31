import { useSyncExternalStore } from 'react';

// Where the nearest uncollected coin is, relative to the way the traveler is facing.
// The 3D layer publishes it a few times a second; the HUD subscribes.
let hint = { active: false, deg: 0, dist: 0 };
const listeners = new Set();

export function setHint(next) {
  if (
    next.active === hint.active &&
    Math.abs(next.deg - hint.deg) < 1 &&
    Math.abs(next.dist - hint.dist) < 0.02
  ) {
    return;
  }
  hint = next;
  listeners.forEach((l) => l());
}

export function useHint() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => hint,
  );
}
