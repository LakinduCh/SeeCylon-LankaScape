// Rupee coins hidden across the island. The layout is seeded, so it is the same every
// session and a saved collection keeps matching. Rarer, richer coins sit far from the start.

export const COIN_PLAN = [
  [1000, 1],
  [500, 2],
  [100, 4],
  [50, 5],
  [20, 6],
  [10, 8],
  [5, 10],
];
export const COIN_COUNT = COIN_PLAN.reduce((n, [, c]) => n + c, 0);
export const COIN_TOTAL = COIN_PLAN.reduce((n, [v, c]) => n + v * c, 0);

// Tier colors: bronze, silver, gold, emerald, ruby
export const COIN_STYLE = {
  5: { rim: '#8a5a2b', face: '#cd7f32', ink: '#4a2a0c' },
  10: { rim: '#8a5a2b', face: '#d98a3d', ink: '#4a2a0c' },
  20: { rim: '#7d8791', face: '#c9d1d9', ink: '#2b3138' },
  50: { rim: '#7d8791', face: '#e3e8ee', ink: '#2b3138' },
  100: { rim: '#a87b00', face: '#f5c542', ink: '#5a3f00' },
  500: { rim: '#1c6b45', face: '#3fc58a', ink: '#06301f' },
  1000: { rim: '#8a1530', face: '#ee4466', ink: '#ffffff' },
};

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function coinId(coin) {
  return `${coin.value}@${coin.x.toFixed(2)},${coin.z.toFixed(2)}`;
}

// A spot counts only if the ground around it is clear, so coins never sit on the shoreline
// or inside a tree.
function solidLand(T, x, z) {
  const m = 0.07;
  return (
    T.isWalkable(x, z) &&
    T.isWalkable(x + m, z) &&
    T.isWalkable(x - m, z) &&
    T.isWalkable(x, z + m) &&
    T.isWalkable(x, z - m)
  );
}

// Flood-fills the clear ground from the start on a coarse grid, so coins are never placed
// on a patch he can't reach (the small islets off the coast, or a pocket cut off by rocks).
function reachableFrom(T, spawn) {
  const step = 0.03;
  const { minX, maxX, minZ, maxZ } = T.region;
  const cols = Math.ceil((maxX - minX) / step);
  const rows = Math.ceil((maxZ - minZ) / step);
  const cell = (x, z) => {
    const i = Math.floor((x - minX) / step);
    const j = Math.floor((z - minZ) / step);
    return i < 0 || j < 0 || i >= cols || j >= rows ? -1 : j * cols + i;
  };
  const free = (i, j) => T.isWalkable(minX + (i + 0.5) * step, minZ + (j + 0.5) * step);

  // start from the nearest clear ground to the spawn point
  let start = -1;
  for (let r = 0; r <= 1.2 && start < 0; r += step) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const k = cell(spawn.x + Math.cos(a) * r, spawn.z + Math.sin(a) * r);
      if (k >= 0 && free(k % cols, Math.floor(k / cols))) {
        start = k;
        break;
      }
    }
  }
  const seen = new Uint8Array(cols * rows);
  if (start < 0) return () => true;
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const k = stack.pop();
    const i = k % cols;
    const j = (k - i) / cols;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
      const nk = nj * cols + ni;
      if (!seen[nk] && free(ni, nj)) {
        seen[nk] = 1;
        stack.push(nk);
      }
    }
  }
  return (x, z) => {
    const k = cell(x, z);
    return k >= 0 && seen[k] === 1;
  };
}

export function generateCoins(T, spawn, pins) {
  const rand = mulberry32(20260930);
  const { minX, maxX, minZ, maxZ } = T.region;
  const coins = [];
  const reachable = reachableFrom(T, spawn);

  for (const [value, count] of COIN_PLAN) {
    const minFromSpawn = value >= 1000 ? 7.0 : value >= 500 ? 4.8 : value >= 100 ? 1.5 : 0.5;
    for (let n = 0; n < count; n++) {
      for (let attempt = 0; attempt < 6000; attempt++) {
        const x = minX + rand() * (maxX - minX);
        const z = minZ + rand() * (maxZ - minZ);
        if (!solidLand(T, x, z) || !reachable(x, z)) continue;
        if (Math.hypot(x - spawn.x, z - spawn.z) < minFromSpawn) continue;
        if (pins.some((p) => Math.hypot(x - p.position[0], z - p.position[2]) < 0.3)) continue;
        if (coins.some((c) => Math.hypot(x - c.x, z - c.z) < 0.35)) continue;
        const y = T.heightAt(x, z);
        if (y == null) continue;
        coins.push({ value, x, z, y });
        break;
      }
    }
  }
  return coins.map((c) => ({ ...c, id: coinId(c) }));
}
