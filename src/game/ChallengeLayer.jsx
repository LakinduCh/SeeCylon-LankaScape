import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import locations from '../data/locations.json';
import Animal from './Animal';
import { CHALLENGES, ENEMIES, ZONE_ABANDON, ZONE_ARM, ZONE_RADIUS } from './challenges';
import {
  ATTACK_ARC, ATTACK_COOLDOWN, challengeProgress, playerAttack, startChallenge, stepChallenge,
} from './combat';
import {
  damagePlayer, getCombat, healPlayer, markCleared, resetCombat, say, setChallengeHud, useCombat,
} from './combatStore';
import { consumeAttack } from './input';
import { sfx } from './sfx';

const REGEN_PER_SECOND = 1.5;
const CLEAR_HEAL = 30;
const FALLBACK_GROUND = 5.4;

const groundAt = (terrain, x, z) => terrain.current?.heightAt(x, z) ?? FALLBACK_GROUND;

function Enemy({ e, terrain }) {
  const ref = useRef();
  const size = ENEMIES[e.type].size;
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const lunge = e.lunge > 0 ? Math.sin((e.lunge / 0.2) * Math.PI) * 0.06 : 0;
    g.position.set(e.x + Math.sin(e.heading) * lunge, groundAt(terrain, e.x, e.z), e.z + Math.cos(e.heading) * lunge);
    g.rotation.y = e.heading;
    const s = size * (e.flash > 0 ? 1.3 : 1);
    g.scale.setScalar(s);
    g.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 9 + e.id)) * size * 0.05;
  });
  return (
    <group ref={ref}>
      <Animal type={e.type} />
    </group>
  );
}

// A strike: a red circle that fills as the moment nears, then the hit itself.
function Hazard({ h, hz, terrain }) {
  const root = useRef();
  const fill = useRef();
  const strike = useRef();
  const drop = useRef();
  useFrame(() => {
    const y = groundAt(terrain, h.x, h.z) + 0.03;
    if (root.current) root.current.position.set(h.x, y, h.z);
    const warning = h.state === 'warn';
    const t = Math.min(1, h.age / hz.warn);
    if (fill.current) {
      fill.current.visible = warning;
      fill.current.scale.setScalar(Math.max(0.05, t));
    }
    if (drop.current) {
      drop.current.visible = warning && hz.style === 'drop';
      drop.current.position.y = 0.9 * (1 - t) + 0.05;
    }
    if (strike.current) {
      strike.current.visible = !warning;
      const f = Math.max(0, 1 - (h.age - hz.warn) / 0.35);
      strike.current.material.opacity = f * 0.85;
      if (hz.style === 'burst') strike.current.scale.setScalar(1 + (1 - f) * 0.5);
    }
  });
  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[hz.r * 0.93, hz.r, 40]} />
        <meshBasicMaterial color="#ff4030" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={fill} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[hz.r * 0.93, 40]} />
        <meshBasicMaterial color="#ff4030" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={drop} position={[0, 0.9, 0]}>
        <sphereGeometry args={[hz.r * 0.35, 12, 10]} />
        <meshStandardMaterial color={hz.color} roughness={0.9} />
      </mesh>
      {hz.style === 'bolt' ? (
        <mesh ref={strike} position={[0, 0.6, 0]} visible={false}>
          <cylinderGeometry args={[hz.r * 0.25, hz.r * 0.25, 1.2, 8]} />
          <meshBasicMaterial color={hz.color} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ) : (
        <mesh ref={strike} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} visible={false}>
          <circleGeometry args={[hz.r, 40]} />
          <meshBasicMaterial color={hz.color} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// Runs the challenge at whichever destination the traveler walks into: spawns the
// animals or hazards, resolves the fighting and drives the health store.
export default function ChallengeLayer({ active, posRef, headingRef, terrain, travelerRef, onClear, onDeath, muted }) {
  const combat = useCombat();
  const ch = useRef(null);
  const armed = useRef(new Set());
  const attackCd = useRef(0);
  const slashT = useRef(0);
  const slashRef = useRef();
  const hudClock = useRef(0);
  const regenAcc = useRef(0);
  const deathSent = useRef(false);
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const live = useRef({});
  live.current = { onClear, onDeath, muted };

  useEffect(() => {
    if (!active) {
      ch.current = null;
      setChallengeHud(null);
      return undefined;
    }
    resetCombat();
    ch.current = null;
    armed.current = new Set();
    deathSent.current = false;
    regenAcc.current = 0;
    bump();
    return undefined;
  }, [active]);

  useFrame((_, rawDt) => {
    if (!active || !terrain.current) return;
    const T = terrain.current;
    const dt = Math.min(rawDt, 0.05);
    const p = posRef.current;
    const player = { x: p.x, z: p.z, heading: headingRef.current };
    const isLand = (x, z) => T.isLand(x, z);
    const sound = !live.current.muted;

    if (getCombat().dead) {
      if (!deathSent.current) {
        deathSent.current = true;
        if (sound) sfx.die();
        live.current.onDeath?.();
      }
      return;
    }

    // Swing
    attackCd.current -= dt;
    slashT.current = Math.max(0, slashT.current - dt);
    if (consumeAttack() && attackCd.current <= 0) {
      attackCd.current = ATTACK_COOLDOWN;
      slashT.current = 0.15;
      travelerRef.current?.attack?.();
      if (sound) sfx.swing();
      const { hits } = playerAttack(ch.current, player);
      if (hits && sound) sfx.hit();
    }
    if (slashRef.current) {
      slashRef.current.visible = slashT.current > 0;
      slashRef.current.position.set(player.x, groundAt(terrain, player.x, player.z) + 0.06, player.z);
      slashRef.current.rotation.y = player.heading;
    }

    // A zone only triggers after the traveler has been well clear of it once
    for (const loc of locations) {
      if (Math.hypot(p.x - loc.position[0], p.z - loc.position[2]) > ZONE_ARM) armed.current.add(loc.id);
    }

    if (!ch.current) {
      const cleared = getCombat().cleared;
      let near = null;
      let nearDist = Infinity;
      for (const loc of locations) {
        if (!CHALLENGES[loc.id] || cleared.includes(loc.id) || !armed.current.has(loc.id)) continue;
        const d = Math.hypot(p.x - loc.position[0], p.z - loc.position[2]);
        if (d < ZONE_RADIUS && d < nearDist) {
          near = loc;
          nearDist = d;
        }
      }
      if (near) {
        const def = CHALLENGES[near.id];
        ch.current = startChallenge(near, def);
        say(`${def.title}!`);
        if (sound) sfx.start();
        bump();
      } else {
        // out of danger: heal slowly
        const { health, max } = getCombat();
        if (health < max) {
          regenAcc.current += dt * REGEN_PER_SECOND;
          if (regenAcc.current >= 1) {
            healPlayer(Math.floor(regenAcc.current));
            regenAcc.current %= 1;
          }
        }
      }
      return;
    }

    const c = ch.current;
    if (Math.hypot(p.x - c.loc.position[0], p.z - c.loc.position[2]) > ZONE_ABANDON) {
      ch.current = null;
      setChallengeHud(null);
      say('You ran from the challenge');
      bump();
      return;
    }

    const { damage } = stepChallenge(c, dt, player, isLand);
    if (damage > 0) {
      damagePlayer(damage);
      if (sound) sfx.hurt();
      if (getCombat().dead) return;
    }

    hudClock.current += dt;
    if (hudClock.current > 0.1) {
      hudClock.current = 0;
      setChallengeHud({ title: c.def.title, blurb: c.def.blurb, kind: c.def.kind, ...challengeProgress(c) });
    }
    if (c.dirty) {
      c.dirty = false;
      bump();
    }

    if (c.done === 'win') {
      const { reward, title } = c.def;
      healPlayer(CLEAR_HEAL);
      markCleared(c.loc.id);
      say(`${title} cleared!`);
      if (sound) sfx.win();
      live.current.onClear?.(c.loc, reward);
      ch.current = null;
      setChallengeHud(null);
      bump();
    }
  });

  if (!active) return null;
  const c = ch.current;
  const ringGround = (loc) => groundAt(terrain, loc.position[0], loc.position[2]) + 0.04;

  return (
    <group>
      {/* Danger rings around destinations still to be cleared */}
      {terrain.current &&
        locations
          .filter((loc) => CHALLENGES[loc.id] && !combat.cleared.includes(loc.id))
          .map((loc) => (
            <mesh key={loc.id} position={[loc.position[0], ringGround(loc), loc.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ZONE_RADIUS - 0.025, ZONE_RADIUS, 48]} />
              <meshBasicMaterial color="#ff5a4a" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}

      {c && c.enemies.map((e) => <Enemy key={e.id} e={e} terrain={terrain} />)}
      {c && c.hazards.map((h) => <Hazard key={h.id} h={h} hz={c.def.hazard} terrain={terrain} />)}

      {/* Sword swing */}
      <group ref={slashRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.42, 20, 1, -Math.PI / 2 - ATTACK_ARC, ATTACK_ARC * 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
