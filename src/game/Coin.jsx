import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COIN_STYLE } from './coins';

const faceTextures = new Map();

// Coin face drawn on a canvas: "Rs" over the value, one texture per denomination.
function faceTexture(value) {
  if (faceTextures.has(value)) return faceTextures.get(value);
  const style = COIN_STYLE[value];
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size * 0.4, size * 0.35, 10, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, style.face);
  grad.addColorStop(1, style.rim);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = style.rim;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = style.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 54px system-ui, sans-serif';
  ctx.fillText('Rs', size / 2, size * 0.32);
  ctx.font = `800 ${value >= 1000 ? 84 : value >= 100 ? 96 : 110}px system-ui, sans-serif`;
  ctx.fillText(String(value), size / 2, size * 0.62);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  faceTextures.set(value, tex);
  return tex;
}

// Richer coins are bigger and have a taller light beam so they can be spotted from afar.
function sizeFor(value) {
  if (value >= 1000) return 0.13;
  if (value >= 500) return 0.11;
  if (value >= 100) return 0.09;
  return 0.07;
}

export default function Coin({ coin }) {
  const group = useRef();
  const spin = useRef(Math.random() * Math.PI * 2);
  const radius = sizeFor(coin.value);
  const style = COIN_STYLE[coin.value];
  const beamHeight = coin.value >= 500 ? 1.1 : coin.value >= 100 ? 0.7 : 0.45;
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: style.rim, metalness: 0.6, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: faceTexture(coin.value), metalness: 0.4, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: faceTexture(coin.value), metalness: 0.4, roughness: 0.35 }),
    ],
    [coin.value, style.rim],
  );

  useFrame((state, dt) => {
    spin.current += dt * 2.2;
    if (group.current) {
      group.current.rotation.y = spin.current;
      group.current.position.y = coin.y + radius + 0.04 + Math.sin(state.clock.elapsedTime * 2 + coin.x * 9) * 0.015;
    }
  });

  return (
    <group position={[coin.x, 0, coin.z]}>
      <group ref={group}>
        {/* Cylinder axis is Y; lay it on its side so the face points sideways as it spins */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[radius, radius, radius * 0.22, 32]} />
        </mesh>
      </group>
      <mesh position={[0, coin.y + beamHeight / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, beamHeight, 8, 1, true]} />
        <meshBasicMaterial
          color={style.face}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
