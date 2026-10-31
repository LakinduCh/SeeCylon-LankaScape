import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import locations from '../data/locations.json';
import Traveler from './Traveler';
import Coin from './Coin';
import { captureTerrain } from './terrain';
import { attachKeyboard, readInput } from './input';
import { generateCoins } from './coins';
import { setHint } from './hintStore';
import ChallengeLayer from './ChallengeLayer';
import { CHALLENGES } from './challenges';
import { getCombat, say } from './combatStore';
import { sfx } from './sfx';
import { vehicleFor } from './rides';

const WALK_SPEED = 0.9; // map units per second
const RUN_SPEED = 2.0;
const TURN_RATE = 2.2; // radians per second
const ARRIVE_RADIUS = 0.45;
const LEAVE_RADIUS = 0.8;
const PICKUP_RADIUS = 0.12;
const CAM_DISTANCE = 1.7;
const CAM_HEIGHT = 1.05;

// The journey starts at Galle Fort on the south coast, facing north up the island
const START_ID = 'galle';
const start = locations.find((l) => l.id === START_ID);
const SPAWN = { x: start.position[0], z: start.position[2], heading: Math.PI };

// Short two-note ping; higher value, higher pitch
function playPing(value) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const base = 660 + Math.min(value, 1000) * 0.35;
    [base, base * 1.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {
    // audio unavailable; the pickup still counts
  }
}

// Walkable traveler on the island: reads keyboard / joystick input, stays on land,
// follows the terrain height, drives a chase camera, reports arrivals at destinations
// and collects the rupee coins scattered across the map.
export default function GameLayer({ active, onArrive, onCollect, onDeath, collectedIds = [], muted = false, rupees = 0 }) {
  const { gl, scene, camera, controls } = useThree();
  const traveler = useRef();
  const terrain = useRef(null);
  const pos = useRef(new THREE.Vector3(SPAWN.x, 6, SPAWN.z));
  const heading = useRef(SPAWN.heading);
  const arrivedAt = useRef(null);
  const lookAt = useRef(new THREE.Vector3());
  const needsSnap = useRef(true);
  const hintClock = useRef(0);
  const [coins, setCoins] = useState([]);

  // Latest props for the frame loop, which must not re-subscribe on every change
  const live = useRef({});
  const ride = vehicleFor(rupees);
  live.current = { onArrive, onCollect, onDeath, muted, ride, collected: new Set(collectedIds) };

  // Announce each new ride as it's earned (not when a walk starts or resets)
  const lastTier = useRef(0);
  useEffect(() => {
    if (!active) {
      lastTier.current = 0;
      return;
    }
    if (ride.tier > lastTier.current) {
      say(`${ride.emoji} You got a ${ride.name.toLowerCase()}!`);
      if (!live.current.muted) sfx.win();
    }
    lastTier.current = ride.tier;
  }, [active, ride.tier, ride.emoji, ride.name]);

  useEffect(() => {
    if (!active) return undefined;
    needsSnap.current = true;
    pos.current.set(SPAWN.x, pos.current.y, SPAWN.z);
    heading.current = SPAWN.heading;
    arrivedAt.current = START_ID; // already here; don't pop the card until he leaves and returns
    return attachKeyboard();
  }, [active]);

  // The walker owns the camera while active; hand it back to OrbitControls afterwards.
  useEffect(() => {
    if (!controls) return undefined;
    controls.enabled = !active;
    return () => {
      controls.enabled = true;
    };
  }, [active, controls]);

  useEffect(() => {
    if (!active && controls && lookAt.current.lengthSq() > 0) {
      controls.target.copy(lookAt.current);
    }
    if (!active) setHint({ active: false, deg: 0, dist: 0 });
  }, [active, controls]);

  useFrame((_, rawDt) => {
    const group = traveler.current?.group;
    if (!group) return;
    group.visible = active;
    if (!active) return;

    if (!terrain.current) {
      const map = scene.getObjectByName('lanka-map');
      if (!map) return;
      terrain.current = captureTerrain(gl, scene, map);
      setCoins(generateCoins(terrain.current, SPAWN, locations));
    }
    const T = terrain.current;
    const dt = Math.min(rawDt, 0.05);
    const p = pos.current;

    if (needsSnap.current) {
      // The pin can sit on the shoreline or under a tree; start on the nearest clear ground
      if (!T.isWalkable(p.x, p.z)) {
        search: for (let r = 0.05; r <= 1.2; r += 0.05) {
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
            const sx = p.x + Math.cos(a) * r;
            const sz = p.z + Math.sin(a) * r;
            if (T.isWalkable(sx, sz)) {
              p.x = sx;
              p.z = sz;
              break search;
            }
          }
        }
      }
      p.y = T.heightAt(p.x, p.z) ?? p.y;
      camera.position.set(p.x, p.y + CAM_HEIGHT + 1.5, p.z + CAM_DISTANCE + 1.5);
      needsSnap.current = false;
    }

    // Frozen once dead
    const { turn, move, run } = getCombat().dead ? { turn: 0, move: 0, run: false } : readInput();
    heading.current -= turn * TURN_RATE * live.current.ride.turn * dt;
    const h = heading.current;
    const fx = Math.sin(h);
    const fz = Math.cos(h);
    const speed = move * (run ? RUN_SPEED : WALK_SPEED) * live.current.ride.speed;

    if (speed !== 0) {
      const nx = p.x + fx * speed * dt;
      const nz = p.z + fz * speed * dt;
      // Trees, props and the sea block him. Slide along them: try the full step, then each
      // axis on its own. If he's somehow inside an obstacle, any land lets him walk back out.
      const stuck = !T.isWalkable(p.x, p.z);
      const canStep = (x, z) => (stuck ? T.isLand(x, z) : T.isWalkable(x, z));
      if (canStep(nx, nz)) {
        p.x = nx;
        p.z = nz;
      } else if (canStep(nx, p.z)) {
        p.x = nx;
      } else if (canStep(p.x, nz)) {
        p.z = nz;
      }
    }

    const ground = T.heightAt(p.x, p.z);
    if (ground != null) p.y += (ground - p.y) * Math.min(1, dt * 12);

    group.position.copy(p);
    group.rotation.y = h;
    traveler.current.setSpeed(speed);

    // Chase camera behind the traveler
    const camScale = live.current.ride.cam;
    const desired = new THREE.Vector3(p.x - fx * CAM_DISTANCE * camScale, p.y + CAM_HEIGHT * camScale, p.z - fz * CAM_DISTANCE * camScale);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 5));
    lookAt.current.set(p.x + fx * 0.2, p.y + 0.13, p.z + fz * 0.2);
    camera.lookAt(lookAt.current);

    // Destinations with a challenge open their card once it's beaten (and again on a return
    // visit); every other destination opens its card as soon as you walk up to it.
    if (arrivedAt.current) {
      const at = locations.find((l) => l.id === arrivedAt.current);
      if (Math.hypot(p.x - at.position[0], p.z - at.position[2]) > LEAVE_RADIUS) arrivedAt.current = null;
    } else {
      const cleared = getCombat().cleared;
      for (const loc of locations) {
        if (CHALLENGES[loc.id] && !cleared.includes(loc.id)) continue;
        if (Math.hypot(p.x - loc.position[0], p.z - loc.position[2]) < ARRIVE_RADIUS) {
          arrivedAt.current = loc.id;
          live.current.onArrive?.(loc);
          break;
        }
      }
    }

    // Coin pickup, and a compass hint toward the nearest coin still out there
    const { collected } = live.current;
    let nearest = null;
    let nearestDist = Infinity;
    for (const coin of coins) {
      if (collected.has(coin.id)) continue;
      const d = Math.hypot(p.x - coin.x, p.z - coin.z);
      if (d < PICKUP_RADIUS) {
        collected.add(coin.id); // guard against a double pickup before props catch up
        live.current.onCollect?.(coin);
        if (!live.current.muted) playPing(coin.value);
        continue;
      }
      if (d < nearestDist) {
        nearestDist = d;
        nearest = coin;
      }
    }
    hintClock.current += dt;
    if (hintClock.current > 0.1) {
      hintClock.current = 0;
      if (nearest) {
        // Heading shrinks on a right turn, so (heading - bearing) is clockwise degrees on screen
        const bearing = Math.atan2(nearest.x - p.x, nearest.z - p.z);
        let rel = ((h - bearing) * 180) / Math.PI;
        rel = ((((rel + 180) % 360) + 360) % 360) - 180;
        setHint({ active: true, deg: rel, dist: nearestDist });
      } else {
        setHint({ active: false, deg: 0, dist: 0 });
      }
    }
  });

  return (
    <>
      <Traveler ref={traveler} scale={0.2} vehicle={ride.tier} />
      <ChallengeLayer
        active={active}
        posRef={pos}
        headingRef={heading}
        terrain={terrain}
        travelerRef={traveler}
        muted={muted}
        onDeath={() => live.current.onDeath?.()}
        onClear={(loc, reward) => {
          live.current.onCollect?.({ id: `reward:${loc.id}`, value: reward });
          live.current.onArrive?.(loc);
          arrivedAt.current = loc.id;
        }}
      />
      {active && coins.filter((c) => !collectedIds.includes(c.id)).map((c) => <Coin key={c.id} coin={c} />)}
    </>
  );
}
