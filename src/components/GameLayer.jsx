import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import locations from '../data/locations.json';
import { destinationThemeMusic } from '../data/destinationMusic';
import { toonify } from './ToonOutline';

// Game mode: a small traveller walks the map with the keyboard. Each place's theme music
// fades in as the traveller gets close and fades out as they walk away.

const MODEL = '/models/MPM-project_V6.glb';

const WALK = 0.75; // map units per second
const RUN = 1.7;
const TURN = 2.3; // radians per second
const SCALE = 0.11; // traveller height in map units
const CAM_BACK = 0.6;
const CAM_UP = 0.36;

const FULL_RADIUS = 0.55; // closer than this: place music at full volume
const SILENT_RADIUS = 1.5; // farther than this: silent
const MAX_VOLUME = 0.75;
const FADE_RATE = 2.2; // bigger = faster fades

const keys = new Set();

const smooth = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// A low-poly backpacker; local +Z is forward, feet at y = 0, about 1 unit tall.
function Traveler({ legL, legR, body }) {
  const part = (pos, size, color, extra = {}) => (
    <mesh position={pos} {...extra}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
  return (
    <group ref={body}>
      <group ref={legL} position={[-0.09, 0.36, 0]}>
        {part([0, -0.18, 0], [0.14, 0.36, 0.16], '#c9a66b')}
      </group>
      <group ref={legR} position={[0.09, 0.36, 0]}>
        {part([0, -0.18, 0], [0.14, 0.36, 0.16], '#c9a66b')}
      </group>
      {part([0, 0.55, 0], [0.4, 0.4, 0.24], '#1f9d8b')}
      {part([0, 0.57, -0.19], [0.3, 0.34, 0.14], '#e8631a')}
      <mesh position={[0, 0.86, 0]}>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color="#e0a878" />
      </mesh>
      <mesh position={[0, 0.97, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshStandardMaterial color="#e6c76a" />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.08, 16]} />
        <meshStandardMaterial color="#e6c76a" />
      </mesh>
    </group>
  );
}

export default function GameLayer({ isMuted = false, onNear }) {
  const { camera } = useThree();
  const { scene: mapScene } = useGLTF(MODEL);

  const root = useRef();
  const body = useRef();
  const legL = useRef();
  const legR = useRef();
  const pos = useRef(new THREE.Vector3());
  const heading = useRef(Math.PI);
  const phase = useRef(0);
  const ready = useRef(false);
  const island = useRef(null);
  const blockers = useRef([]);
  const lastNear = useRef(null);
  const sounds = useRef({}); // id -> { audio, vol }
  const live = useRef({});
  live.current = { isMuted, onNear };

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const camWant = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  // keyboard
  useEffect(() => {
    const typing = (e) => ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
    const down_ = (e) => {
      if (typing(e)) return;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
      keys.add(e.key.toLowerCase());
    };
    const up = (e) => keys.delete(e.key.toLowerCase());
    const clear = () => keys.clear();
    window.addEventListener('keydown', down_);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down_);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      keys.clear();
    };
  }, []);

  // closer near plane so the small traveller and landmarks are not clipped; restore on exit
  useEffect(() => {
    const prev = camera.near;
    camera.near = 0.04;
    camera.updateProjectionMatrix();
    return () => {
      camera.near = prev;
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  // give the traveller the toon look + outline
  useEffect(() => {
    if (root.current) toonify(root.current);
  }, []);

  // stop and clear all place music on exit
  useEffect(() => {
    const store = sounds.current;
    return () => {
      Object.values(store).forEach(({ audio }) => {
        try {
          audio.pause();
        } catch {
          /* ignore */
        }
      });
      live.current.onNear?.(null);
    };
  }, []);

  const groundAt = (x, z) => {
    if (!island.current) return { ok: true, y: pos.current.y };
    origin.set(x, 40, z);
    ray.set(origin, down);
    const hit = ray.intersectObject(island.current, false)[0];
    return hit ? { ok: true, y: hit.point.y } : { ok: false, y: pos.current.y };
  };

  // one-time setup once the map is in the scene with its final transforms
  const setup = () => {
    mapScene.updateMatrixWorld(true);
    island.current = mapScene.getObjectByName('island') || null;
    blockers.current = [];
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    mapScene.children.forEach((child) => {
      const n = child.name.toLowerCase();
      if (n === 'island' || n.includes('sea')) return;
      box.setFromObject(child);
      if (box.isEmpty()) return;
      box.getSize(size);
      box.getCenter(center);
      blockers.current.push({ x: center.x, z: center.z, r: 0.36 * Math.max(size.x, size.z) });
    });

    // start just south of Kandy, in the middle of the island, on solid ground
    const start = locations.find((l) => l.id === 'kandy') || locations[0];
    let found = null;
    for (let r = 0; r < 2 && !found; r += 0.1) {
      for (let a = 0; a < 12 && !found; a++) {
        const x = start.position[0] + Math.sin((a / 12) * Math.PI * 2) * r;
        const z = start.position[2] + 0.9 + Math.cos((a / 12) * Math.PI * 2) * r;
        const g = groundAt(x, z);
        if (g.ok && blockers.current.every((b) => Math.hypot(x - b.x, z - b.z) > b.r + 0.1)) found = { x, z, y: g.y };
      }
    }
    const s = found || { x: start.position[0], z: start.position[2] + 0.9, y: start.position[1] - 0.3 };
    pos.current.set(s.x, s.y, s.z);
    heading.current = Math.PI; // facing north
    ready.current = true;
  };

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (!ready.current) {
      setup();
    }
    const p = pos.current;

    // ---- input ----
    const k = (...names) => names.some((n) => keys.has(n));
    const fwd = (k('w', 'arrowup') ? 1 : 0) - (k('s', 'arrowdown') ? 0.6 : 0);
    const turn = (k('a', 'arrowleft') ? 1 : 0) - (k('d', 'arrowright') ? 1 : 0);
    heading.current += turn * TURN * dt;
    const speed = (k('shift') ? RUN : WALK) * fwd;

    // ---- move, stay on land, slide around landmarks ----
    if (speed !== 0) {
      const nx = p.x + Math.sin(heading.current) * speed * dt;
      const nz = p.z + Math.cos(heading.current) * speed * dt;
      let tx = nx;
      let tz = nz;
      for (const b of blockers.current) {
        const dx = tx - b.x;
        const dz = tz - b.z;
        const d = Math.hypot(dx, dz);
        if (d < b.r) {
          tx = b.x + (dx / (d || 1)) * b.r;
          tz = b.z + (dz / (d || 1)) * b.r;
        }
      }
      const g = groundAt(tx, tz);
      if (g.ok) {
        p.x = tx;
        p.z = tz;
      }
    }
    const g = groundAt(p.x, p.z);
    p.y += (g.y - p.y) * Math.min(1, dt * 12);

    // ---- traveller ----
    if (root.current) {
      root.current.position.copy(p);
      root.current.rotation.y = heading.current;
      root.current.scale.setScalar(SCALE);
    }
    const moving = Math.abs(speed) > 0.01;
    phase.current += moving ? dt * (Math.abs(speed) / WALK) * 9 : 0;
    const swing = moving ? Math.sin(phase.current) * 0.7 : 0;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (body.current) body.current.position.y = moving ? Math.abs(Math.sin(phase.current)) * 0.04 : 0;

    // ---- chase camera ----
    const fx = Math.sin(heading.current);
    const fz = Math.cos(heading.current);
    camWant.set(p.x - fx * CAM_BACK, p.y + CAM_UP, p.z - fz * CAM_BACK);
    if (camera.position.distanceTo(camWant) > 6) camera.position.copy(camWant);
    camera.position.lerp(camWant, 1 - Math.exp(-dt * 5));
    look.set(p.x + fx * 0.25, p.y + SCALE * 0.7, p.z + fz * 0.25);
    camera.lookAt(look);

    // ---- place music: fade in when close, out when far ----
    let nearest = null;
    let nearestD = Infinity;
    for (const loc of locations) {
      const d = Math.hypot(p.x - loc.position[0], p.z - loc.position[2]);
      if (d < nearestD) {
        nearestD = d;
        nearest = loc;
      }
      const src = destinationThemeMusic[loc.id]?.audioSrc;
      // some places use their narration as the theme: never play voice-overs in game mode
      if (!src || src === loc.audioUrl) continue;
      const gain = 1 - smooth(FULL_RADIUS, SILENT_RADIUS, d);
      let s = sounds.current[loc.id];
      if (!s) {
        if (gain <= 0) continue; // nothing to load until the traveller is within range
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;
        s = sounds.current[loc.id] = { audio, vol: 0 };
      }
      s.vol += (gain * MAX_VOLUME - s.vol) * (1 - Math.exp(-dt * FADE_RATE));
      s.audio.muted = live.current.isMuted;
      s.audio.volume = THREE.MathUtils.clamp(s.vol, 0, 1);
      if (s.vol > 0.01 && s.audio.paused) s.audio.play().catch(() => {});
      else if (s.vol < 0.004 && !s.audio.paused) s.audio.pause();
    }

    const nearId = nearestD < FULL_RADIUS + 0.2 ? nearest.id : null;
    if (nearId !== lastNear.current) {
      lastNear.current = nearId;
      live.current.onNear?.(nearId ? nearest : null);
    }
  });

  return (
    <group ref={root}>
      <Traveler legL={legL} legR={legR} body={body} />
    </group>
  );
}
