import { useSyncExternalStore } from 'react';

// Player health and the current challenge, shared between the 3D layer (which updates
// it every frame) and the HUD (which subscribes). Not React state: the frame loop must
// not trigger re-renders by itself.
const MAX_HEALTH = 100;

let state = {
  health: MAX_HEALTH,
  max: MAX_HEALTH,
  dead: false,
  hurtAt: 0, // timestamp of the last hit; the HUD keys its red flash on it
  challenge: null, // { title, blurb, kind, text, fraction } while one is running
  cleared: [], // location ids beaten on this walk
  message: null, // { text, key } transient banner
};
const listeners = new Set();

function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const getCombat = () => state;

export function resetCombat() {
  set({ health: MAX_HEALTH, dead: false, hurtAt: 0, challenge: null, cleared: [], message: null });
}

export function damagePlayer(amount) {
  if (state.dead || amount <= 0) return;
  const health = Math.max(0, state.health - amount);
  set({ health, dead: health <= 0, hurtAt: performance.now() });
}

export function healPlayer(amount) {
  if (state.dead) return;
  set({ health: Math.min(state.max, state.health + amount) });
}

export function setChallengeHud(challenge) {
  const prev = state.challenge;
  if (
    prev === challenge ||
    (prev && challenge && prev.title === challenge.title && prev.text === challenge.text &&
      Math.abs(prev.fraction - challenge.fraction) < 0.01)
  ) {
    return;
  }
  set({ challenge });
}

export function markCleared(id) {
  if (!state.cleared.includes(id)) set({ cleared: [...state.cleared, id] });
}

export function say(text) {
  set({ message: { text, key: Date.now() } });
}

export function useCombat() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
