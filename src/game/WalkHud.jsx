import { useRef, useState } from 'react';
import { input, pressAttack } from './input';
import { useHint } from './hintStore';
import { useCombat } from './combatStore';
import { COIN_COUNT, COIN_TOTAL } from './coins';

const STICK_RADIUS = 48;

function Joystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const origin = useRef(null);

  const update = (e) => {
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, len / STICK_RADIUS);
    const nx = (dx / len) * k;
    const ny = (dy / len) * k;
    setKnob({ x: nx * STICK_RADIUS, y: ny * STICK_RADIUS });
    input.stickX = nx;
    input.stickY = -ny;
  };

  const release = () => {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    input.stickX = 0;
    input.stickY = 0;
  };

  return (
    <div
      className="pointer-events-auto touch-none select-none w-32 h-32 rounded-full bg-slate-900/60 border border-white/20 backdrop-blur-md flex items-center justify-center"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        update(e);
      }}
      onPointerMove={(e) => origin.current && update(e)}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div
        className="w-14 h-14 rounded-full bg-amber-400/80 shadow-lg"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}

const isTouch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

const rs = (n) => `Rs ${n.toLocaleString('en-LK')}`;

// Points to the nearest coin you haven't found yet, relative to where the traveler faces
function Compass() {
  const hint = useHint();
  if (!hint.active) {
    return (
      <div className="pointer-events-none px-4 py-2 rounded-xl bg-emerald-900/70 border border-emerald-300/30 backdrop-blur-md text-emerald-100 text-sm font-semibold shadow-xl">
        🎉 Every coin found!
      </div>
    );
  }
  const label = hint.dist < 0.4 ? 'Very close!' : hint.dist < 1.2 ? 'Getting warm' : hint.dist < 3 ? 'Keep exploring' : 'Far away';
  return (
    <div className="pointer-events-none flex items-center gap-3 px-3 py-2 rounded-full bg-slate-900/70 border border-white/15 backdrop-blur-md text-slate-100 shadow-xl">
      <div
        className="w-9 h-9 rounded-full bg-amber-400/90 text-slate-900 flex items-center justify-center text-xl font-black"
        style={{ transform: `rotate(${hint.deg}deg)`, transition: 'transform 0.1s linear' }}
      >
        ↑
      </div>
      <div className="text-sm font-semibold pr-1">
        Nearest coin <span className="text-amber-300">· {label}</span>
      </div>
    </div>
  );
}

function HealthBar() {
  const { health, max } = useCombat();
  const pct = Math.round((health / max) * 100);
  const color = pct > 60 ? 'from-emerald-400 to-emerald-500' : pct > 30 ? 'from-amber-400 to-amber-500' : 'from-red-500 to-red-600';
  return (
    <div className="fixed top-24 left-4 z-40 pointer-events-none select-none w-56 sm:w-64">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md shadow-xl">
        <span className="text-lg" aria-hidden="true">❤️</span>
        <div className="flex-1">
          <div className="h-3 rounded-full bg-slate-700/80 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-200`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-bold text-slate-100 tabular-nums w-14 text-right">{health}/{max}</span>
      </div>
    </div>
  );
}

// Names the challenge in progress and shows how close it is to being won
function ChallengeBanner() {
  const { challenge, message } = useCombat();
  return (
    <>
      {message && (
        <div
          key={message.key}
          className="pointer-events-none px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-300/40 text-amber-200 text-sm font-bold shadow-xl"
          style={{ animation: 'banner-fade 2.6s ease-out forwards' }}
        >
          {message.text}
        </div>
      )}
      {challenge && (
        <div className="pointer-events-none w-72 px-4 py-2.5 rounded-xl bg-red-950/75 border border-red-400/40 backdrop-blur-md text-slate-100 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-red-200 text-sm">
              {challenge.kind === 'defend' ? '⚔️' : '⚠️'} {challenge.title}
            </span>
            <span className="text-xs font-semibold text-amber-200">{challenge.text}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            {challenge.kind === 'defend' ? 'Press Space to fight back' : 'Leave the red circles before they land'}
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-700/80 overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: `${Math.round(challenge.fraction * 100)}%` }} />
          </div>
        </div>
      )}
    </>
  );
}

function HitFlash() {
  const { hurtAt } = useCombat();
  if (!hurtAt) return null;
  return (
    <div
      key={hurtAt}
      className="fixed inset-0 z-30 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(220,38,38,0) 45%, rgba(220,38,38,0.55) 100%)',
        animation: 'hit-flash 0.55s ease-out forwards',
      }}
    />
  );
}

function DeathScreen({ onRetry, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-w-sm w-[90%] text-center px-8 py-8 rounded-3xl bg-slate-900/95 border border-red-500/40 shadow-2xl">
        <div className="text-5xl mb-2" aria-hidden="true">💀</div>
        <h2 className="text-3xl font-extrabold text-red-400 mb-1">You died</h2>
        <p className="text-slate-300 text-sm mb-6">
          The island won this round. Your coins and stamps are reset, and the journey starts again at Galle Fort.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 hover:scale-105 active:scale-95 transition-transform"
          >
            Try again
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-full text-sm text-slate-300 hover:text-white">
            Back to the map
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WalkHud({
  walking,
  onToggle,
  stampCount,
  total,
  rupees = 0,
  ride,
  nextRide,
  coinsFound = 0,
  lastPickup,
  onResetCoins,
  dead = false,
  onRetry,
  onCloseDeath,
}) {
  return (
    <>
      {walking && <HealthBar />}
      {walking && <HitFlash />}
      {dead && <DeathScreen onRetry={onRetry} onClose={onCloseDeath} />}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
        {walking && lastPickup && (
          <div
            key={lastPickup.key}
            className="pointer-events-none text-2xl font-black text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            style={{ animation: 'coin-pop 1.4s ease-out forwards' }}
          >
            +{rs(lastPickup.value)}
          </div>
        )}
        {walking && <ChallengeBanner />}
        {walking && <Compass />}
        {walking && (
          <div className="pointer-events-none px-4 py-2 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-slate-100 text-xs sm:text-sm text-center shadow-xl">
            <span className="font-semibold text-amber-300">W / S</span> walk &nbsp;·&nbsp;
            <span className="font-semibold text-amber-300">A / D</span> turn &nbsp;·&nbsp;
            <span className="font-semibold text-amber-300">Shift</span> run &nbsp;·&nbsp;
            <span className="font-semibold text-amber-300">Space</span> attack &nbsp;·&nbsp;
            <span className="font-semibold text-amber-300">Esc</span> exit
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="pointer-events-auto px-5 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            {walking ? 'Stop walking' : '🎒 Start walking'}
          </button>
          <div className="pointer-events-none px-3 py-2 rounded-full bg-slate-900/70 border border-white/15 backdrop-blur-md text-slate-100 text-sm font-semibold">
            🏅 {stampCount}/{total}
          </div>
          <div
            className="pointer-events-none px-3 py-2 rounded-full bg-slate-900/70 border border-amber-300/30 backdrop-blur-md text-amber-300 text-sm font-bold"
            title={`${coinsFound} of ${COIN_COUNT} coins found, ${rs(COIN_TOTAL)} hidden in total`}
          >
            💰 {rs(rupees)} · {coinsFound}/{COIN_COUNT}
          </div>
          {walking && ride && (
            <div
              className="pointer-events-none px-3 py-2 rounded-full bg-slate-900/70 border border-white/15 backdrop-blur-md text-slate-100 text-sm font-semibold"
              title={nextRide ? `Next ride: ${nextRide.name} at ${rs(nextRide.min)}` : 'Best ride unlocked'}
            >
              {ride.emoji} {ride.name}
              {nextRide && <span className="text-slate-400 font-normal"> · next {nextRide.emoji} at {rs(nextRide.min)}</span>}
            </div>
          )}
          {walking && coinsFound > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Put every coin back on the map and reset your rupees?')) onResetCoins?.();
              }}
              className="pointer-events-auto px-3 py-2 rounded-full bg-slate-900/70 border border-white/15 backdrop-blur-md text-slate-300 text-xs hover:text-white"
              title="Reset coins"
            >
              ↺
            </button>
          )}
        </div>
      </div>
      {walking && isTouch && (
        <>
          <div className="fixed bottom-6 right-6 z-40">
            <Joystick />
          </div>
          <button
            type="button"
            aria-label="Attack"
            onPointerDown={(e) => {
              e.preventDefault();
              pressAttack();
            }}
            className="fixed bottom-44 right-10 z-40 w-16 h-16 rounded-full bg-red-600/90 border border-white/30 text-2xl shadow-xl active:scale-90 touch-none select-none"
          >
            ⚔️
          </button>
        </>
      )}
    </>
  );
}
