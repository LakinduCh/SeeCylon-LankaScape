import { ENEMIES } from './challenges';

// Pure challenge logic with no rendering, so it can be stepped and tested on its own.
// Positions are map-world x/z; headings follow the walker: forward = (sin h, cos h).

export const ATTACK_RANGE = 0.42;
export const ATTACK_ARC = 1.15; // half-angle in radians
export const ATTACK_COOLDOWN = 0.45;

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function startChallenge(loc, def) {
  const queue = [];
  if (def.kind === 'defend') {
    for (const [type, n] of def.enemies) for (let i = 0; i < n; i++) queue.push(type);
    shuffle(queue);
  }
  return {
    loc,
    def,
    t: 0,
    queue,
    total: queue.length,
    kills: 0,
    enemies: [],
    hazards: [],
    spawnTimer: def.kind === 'defend' ? 1.0 : 1.5,
    nextId: 1,
    done: null,
    dirty: true, // set when entities are added/removed so the renderer can refresh its list
  };
}

function spawnEnemy(ch, player, isLand) {
  const type = ch.queue.shift();
  let x = player.x;
  let z = player.z;
  for (let attempt = 0; attempt < 12; attempt++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.75 + Math.random() * 0.2;
    const sx = player.x + Math.cos(a) * r;
    const sz = player.z + Math.sin(a) * r;
    if (isLand(sx, sz)) {
      x = sx;
      z = sz;
      break;
    }
    // no land found: fall back to a closer spot beside the player
    x = player.x + Math.cos(a) * 0.3;
    z = player.z + Math.sin(a) * 0.3;
  }
  ch.enemies.push({
    id: ch.nextId++, type, x, z, hp: ENEMIES[type].hp, cool: 0.6, heading: 0,
    knock: 0, kx: 0, kz: 0, flash: 0, lunge: 0,
  });
  ch.dirty = true;
}

// Advance the challenge by dt. Returns the damage dealt to the player this step.
export function stepChallenge(ch, dt, player, isLand) {
  ch.t += dt;
  let damage = 0;
  const events = [];

  if (ch.def.kind === 'defend') {
    ch.spawnTimer -= dt;
    if (ch.queue.length && ch.spawnTimer <= 0 && ch.enemies.length < ch.def.maxAlive) {
      spawnEnemy(ch, player, isLand);
      ch.spawnTimer = ch.def.interval;
      events.push('spawn');
    }

    for (const e of ch.enemies) {
      const def = ENEMIES[e.type];
      e.cool -= dt;
      e.flash = Math.max(0, e.flash - dt);
      e.lunge = Math.max(0, e.lunge - dt);
      if (e.knock > 0) {
        e.knock -= dt;
        const nx = e.x + e.kx * dt;
        const nz = e.z + e.kz * dt;
        if (isLand(nx, nz)) {
          e.x = nx;
          e.z = nz;
        }
        continue;
      }
      const dx = player.x - e.x;
      const dz = player.z - e.z;
      const d = Math.hypot(dx, dz) || 1e-6;
      const reach = def.size * 0.55 + 0.08;
      e.heading = Math.atan2(dx, dz);
      if (d > reach) {
        const nx = e.x + (dx / d) * def.speed * dt;
        const nz = e.z + (dz / d) * def.speed * dt;
        if (isLand(nx, nz)) {
          e.x = nx;
          e.z = nz;
        } else if (isLand(nx, e.z)) {
          e.x = nx;
        } else if (isLand(e.x, nz)) {
          e.z = nz;
        }
      } else if (e.cool <= 0) {
        damage += def.dmg;
        e.cool = def.cooldown;
        e.lunge = 0.2;
        events.push('bite');
      }
    }

    // keep the pack from stacking on one spot
    for (let i = 0; i < ch.enemies.length; i++) {
      for (let j = i + 1; j < ch.enemies.length; j++) {
        const a = ch.enemies[i];
        const b = ch.enemies[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz) || 1e-6;
        const min = (ENEMIES[a.type].size + ENEMIES[b.type].size) * 0.45;
        if (d < min) {
          const push = (min - d) / 2;
          if (isLand(a.x - (dx / d) * push, a.z - (dz / d) * push)) {
            a.x -= (dx / d) * push;
            a.z -= (dz / d) * push;
          }
          if (isLand(b.x + (dx / d) * push, b.z + (dz / d) * push)) {
            b.x += (dx / d) * push;
            b.z += (dz / d) * push;
          }
        }
      }
    }

    if (!ch.queue.length && !ch.enemies.length) ch.done = 'win';
  } else {
    const hz = ch.def.hazard;
    const progress = Math.min(1, ch.t / ch.def.duration);
    ch.spawnTimer -= dt;
    if (ch.spawnTimer <= 0 && ch.t < ch.def.duration - hz.warn) {
      // half the strikes land right where the player stands, so standing still never works
      const onPlayer = Math.random() < 0.5;
      ch.hazards.push({
        id: ch.nextId++,
        x: player.x + (onPlayer ? 0 : (Math.random() - 0.5) * 0.7),
        z: player.z + (onPlayer ? 0 : (Math.random() - 0.5) * 0.7),
        age: 0,
        state: 'warn',
        dead: false,
      });
      ch.spawnTimer = ch.def.interval * (1 - 0.4 * progress);
      ch.dirty = true;
    }
    for (const h of ch.hazards) {
      h.age += dt;
      if (h.state === 'warn' && h.age >= hz.warn) {
        h.state = 'strike';
        if (Math.hypot(player.x - h.x, player.z - h.z) < hz.r + 0.03) {
          damage += hz.dmg;
          events.push('hit');
        }
      } else if (h.state === 'strike' && h.age >= hz.warn + 0.35) {
        h.dead = true;
      }
    }
    if (ch.hazards.some((h) => h.dead)) {
      ch.hazards = ch.hazards.filter((h) => !h.dead);
      ch.dirty = true;
    }
    if (ch.t >= ch.def.duration && !ch.hazards.length) ch.done = 'win';
  }

  return { damage, events };
}

// Swing at anything in the arc in front of the player. Returns { hits, kills }.
export function playerAttack(ch, player) {
  let hits = 0;
  let kills = 0;
  if (!ch || ch.def.kind !== 'defend') return { hits, kills };
  for (const e of ch.enemies) {
    const dx = e.x - player.x;
    const dz = e.z - player.z;
    const d = Math.hypot(dx, dz) || 1e-6;
    if (d > ATTACK_RANGE + ENEMIES[e.type].size * 0.4) continue;
    if (Math.abs(wrapAngle(Math.atan2(dx, dz) - player.heading)) > ATTACK_ARC) continue;
    e.hp -= 1;
    e.flash = 0.18;
    e.knock = 0.2;
    e.kx = (dx / d) * 1.8;
    e.kz = (dz / d) * 1.8;
    hits++;
  }
  const alive = ch.enemies.filter((e) => e.hp > 0);
  kills = ch.enemies.length - alive.length;
  if (kills) {
    ch.enemies = alive;
    ch.kills += kills;
    ch.dirty = true;
  }
  return { hits, kills };
}

// Short text for the HUD banner
export function challengeProgress(ch) {
  if (ch.def.kind === 'defend') {
    const left = ch.queue.length + ch.enemies.length;
    return { text: `${left} left to fend off`, fraction: ch.total ? 1 - left / ch.total : 1 };
  }
  const remaining = Math.max(0, ch.def.duration - ch.t);
  return { text: `Survive ${Math.ceil(remaining)}s`, fraction: Math.min(1, ch.t / ch.def.duration) };
}
