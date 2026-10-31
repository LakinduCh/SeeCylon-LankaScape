import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Rides for the traveler, built from primitives in his unit space (he is 1 tall, facing +Z).
// Each takes the traveler's shared state ref so the wheels turn with his speed, and the
// traveler's world scale so the spin matches the ground speed.

function Part({ position, args, color, rotation, shape = 'box', opacity }) {
  return (
    <mesh position={position} rotation={rotation}>
      {shape === 'box' && <boxGeometry args={args} />}
      {shape === 'sphere' && <sphereGeometry args={args} />}
      {shape === 'cyl' && <cylinderGeometry args={args} />}
      {shape === 'torus' && <torusGeometry args={args} />}
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.25} transparent={opacity != null} opacity={opacity ?? 1} />
    </mesh>
  );
}

// A wheel spins about its X axis (the bike's lateral axis)
function useSpin(stateRef, scale, radius) {
  const wheels = useRef([]);
  useFrame((_, dt) => {
    const speed = stateRef.current.speed || 0;
    const turn = (speed / (radius * scale)) * 0.6 * dt;
    wheels.current.forEach((w) => {
      if (w) w.rotation.x -= turn;
    });
  });
  return (el, i) => {
    wheels.current[i] = el;
  };
}

export function Bicycle({ stateRef, scale }) {
  const ref = useSpin(stateRef, scale, 0.26);
  const wheel = (z, i) => (
    <group position={[0, 0.26, z]} ref={(el) => ref(el, i)}>
      <Part args={[0.26, 0.022, 10, 32]} color="#1b1b1b" shape="torus" rotation={[0, Math.PI / 2, 0]} />
      <Part args={[0.012, 0.5, 0.012]} color="#c8ccd2" />
      <Part args={[0.012, 0.012, 0.5]} color="#c8ccd2" />
      <Part args={[0.05, 0.05, 0.06, 12]} color="#888" shape="cyl" rotation={[0, 0, Math.PI / 2]} />
    </group>
  );
  return (
    <group>
      {wheel(0.42, 0)}
      {wheel(-0.42, 1)}
      {/* frame */}
      <Part position={[0, 0.5, 0.02]} args={[0.03, 0.03, 0.62]} color="#d62828" />
      <Part position={[0, 0.42, -0.1]} args={[0.03, 0.03, 0.7]} color="#d62828" rotation={[0.55, 0, 0]} />
      <Part position={[0, 0.4, -0.22]} args={[0.03, 0.4, 0.03]} color="#d62828" rotation={[-0.2, 0, 0]} />
      <Part position={[0, 0.42, 0.36]} args={[0.03, 0.52, 0.03]} color="#d62828" rotation={[0.32, 0, 0]} />
      {/* seat and handlebars */}
      <Part position={[0, 0.63, -0.26]} args={[0.12, 0.04, 0.2]} color="#222" />
      <Part position={[0, 0.7, 0.4]} args={[0.42, 0.03, 0.03]} color="#444" />
      <Part position={[-0.21, 0.7, 0.4]} args={[0.05, 0.05, 0.1]} color="#111" />
      <Part position={[0.21, 0.7, 0.4]} args={[0.05, 0.05, 0.1]} color="#111" />
      {/* pedals */}
      <Part position={[0, 0.2, 0.02]} args={[0.18, 0.02, 0.02]} color="#555" />
      {/* bell and basket for the pack's owner */}
      <Part position={[0, 0.78, 0.4]} args={[0.035, 8, 8]} color="#d4af37" shape="sphere" />
    </group>
  );
}

export function TukTuk({ stateRef, scale }) {
  const ref = useSpin(stateRef, scale, 0.17);
  const wheel = (x, z, i) => (
    <group position={[x, 0.17, z]} ref={(el) => ref(el, i)}>
      <Part args={[0.17, 0.17, 0.12, 20]} color="#1b1b1b" shape="cyl" rotation={[0, 0, Math.PI / 2]} />
      <Part args={[0.1, 0.1, 0.13, 12]} color="#cfd2d6" shape="cyl" rotation={[0, 0, Math.PI / 2]} />
      <Part args={[0.13, 0.02, 0.02]} color="#555" position={[0, 0, 0]} />
    </group>
  );
  return (
    <group>
      {wheel(0, 0.78, 0)}
      {wheel(-0.4, -0.5, 1)}
      {wheel(0.4, -0.5, 2)}
      {/* body */}
      <Part position={[0, 0.38, -0.12]} args={[0.82, 0.3, 1.0]} color="#f2b705" />
      <Part position={[0, 0.5, 0.52]} args={[0.5, 0.4, 0.4]} color="#f2b705" rotation={[0.18, 0, 0]} />
      <Part position={[0, 0.2, 0.62]} args={[0.12, 0.05, 0.4]} color="#2a2a2a" />
      {/* passenger bench and driver seat */}
      <Part position={[0, 0.58, -0.4]} args={[0.66, 0.12, 0.34]} color="#7a1f1f" />
      <Part position={[0, 0.78, -0.58]} args={[0.66, 0.34, 0.06]} color="#7a1f1f" />
      <Part position={[0, 0.55, -0.02]} args={[0.5, 0.09, 0.34]} color="#2a2a2a" />
      {/* canopy */}
      {[[-0.4, 0.38], [0.4, 0.38], [-0.4, -0.6], [0.4, -0.6]].map(([x, z], i) => (
        <Part key={i} position={[x, 0.95, z]} args={[0.05, 1.0, 0.05]} color="#2f6f3e" />
      ))}
      <Part position={[0, 1.46, -0.1]} args={[0.92, 0.06, 1.2]} color="#2f6f3e" />
      <Part position={[0, 1.5, -0.1]} args={[0.6, 0.04, 0.8]} color="#245a31" />
      {/* windscreen, handlebar, headlight, mirrors */}
      <Part position={[0, 1.0, 0.4]} args={[0.7, 0.5, 0.025]} color="#a5d8f0" opacity={0.45} rotation={[-0.25, 0, 0]} />
      <Part position={[0, 0.82, 0.38]} args={[0.5, 0.03, 0.03]} color="#444" />
      <Part position={[0, 0.5, 0.74]} args={[0.06, 12, 10]} color="#fff6c2" shape="sphere" />
      <Part position={[-0.4, 1.0, 0.42]} args={[0.04, 0.06, 0.04]} color="#111" />
      <Part position={[0.4, 1.0, 0.42]} args={[0.04, 0.06, 0.04]} color="#111" />
    </group>
  );
}
