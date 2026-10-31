// Shared walking input: keyboard and the on-screen joystick both write here,
// the walker reads it every frame.
export const input = {
  keys: new Set(),
  stickX: 0, // -1 (left) .. 1 (right)
  stickY: 0, // -1 (back) .. 1 (forward)
  attack: false, // set by Space / J / the touch button, cleared when the game reads it
};

export function pressAttack() {
  input.attack = true;
}

export function consumeAttack() {
  const pressed = input.attack;
  input.attack = false;
  return pressed;
}

const TURN_LEFT = ['a', 'arrowleft'];
const TURN_RIGHT = ['d', 'arrowright'];
const FORWARD = ['w', 'arrowup'];
const BACK = ['s', 'arrowdown'];

const anyDown = (names) => names.some((n) => input.keys.has(n));

export function readInput() {
  const turn = (anyDown(TURN_RIGHT) ? 1 : 0) - (anyDown(TURN_LEFT) ? 1 : 0) + input.stickX;
  const move = (anyDown(FORWARD) ? 1 : 0) - (anyDown(BACK) ? 1 : 0) + input.stickY;
  return {
    turn: Math.max(-1, Math.min(1, turn)),
    move: Math.max(-1, Math.min(1, move)),
    run: input.keys.has('shift'),
  };
}

export function attachKeyboard() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  const down = (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (k === ' ' || k === 'j') input.attack = true;
    input.keys.add(k);
  };
  const up = (e) => {
    // Space must not "click" whichever button still has focus (e.g. Start walking)
    if (e.key === ' ') e.preventDefault();
    input.keys.delete(e.key.toLowerCase());
  };
  const clear = () => {
    input.keys.clear();
    input.stickX = 0;
    input.stickY = 0;
    input.attack = false;
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', clear);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', clear);
    clear();
  };
}
