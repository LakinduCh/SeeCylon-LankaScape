// Tiny synthesized sound effects (no audio files). Each call makes its own short-lived
// AudioContext, which is fine at game-event rates and avoids holding one open.
function play(notes, { type = 'triangle', volume = 0.18 } = {}) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    let end = 0;
    notes.forEach(({ freq, at = 0, dur = 0.2, to }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      const t0 = ctx.currentTime + at;
      osc.frequency.setValueAtTime(freq, t0);
      if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      end = Math.max(end, at + dur);
    });
    setTimeout(() => ctx.close(), (end + 0.2) * 1000);
  } catch {
    // audio unavailable; the game still plays
  }
}

export const sfx = {
  coin(value) {
    const base = 660 + Math.min(value, 1000) * 0.35;
    play([{ freq: base, dur: 0.22 }, { freq: base * 1.5, at: 0.09, dur: 0.22 }]);
  },
  swing() {
    play([{ freq: 520, to: 180, dur: 0.14 }], { type: 'sawtooth', volume: 0.07 });
  },
  hit() {
    play([{ freq: 220, to: 90, dur: 0.12 }], { type: 'square', volume: 0.1 });
  },
  hurt() {
    play([{ freq: 150, to: 60, dur: 0.28 }], { type: 'sawtooth', volume: 0.2 });
  },
  warn() {
    play([{ freq: 880, dur: 0.06 }], { type: 'sine', volume: 0.05 });
  },
  start() {
    play([{ freq: 330, dur: 0.12 }, { freq: 330, at: 0.16, dur: 0.12 }, { freq: 494, at: 0.32, dur: 0.3 }], { type: 'square', volume: 0.08 });
  },
  win() {
    play([523, 659, 784, 1047].map((freq, i) => ({ freq, at: i * 0.1, dur: 0.25 })));
  },
  die() {
    play([{ freq: 392, dur: 0.3 }, { freq: 330, at: 0.28, dur: 0.3 }, { freq: 262, at: 0.56, dur: 0.6, to: 130 }], { type: 'sawtooth', volume: 0.14 });
  },
};
