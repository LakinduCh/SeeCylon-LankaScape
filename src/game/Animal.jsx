import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ENEMIES } from './challenges';

// Low-poly animals built from primitives, in a unit space about 1 long facing +Z.
// The caller scales the group by the enemy's size.

function Box({ p, s, c, r }) {
  return (
    <mesh position={p} rotation={r}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  );
}

function Quad({ d }) {
  const legs = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 11;
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = Math.sin(t + (i % 2 === 0 ? 0 : Math.PI) + (i > 1 ? Math.PI / 2 : 0)) * 0.5;
    });
  });
  const legPos = [[-0.15, 0.3, 0.3], [0.15, 0.3, 0.3], [-0.15, 0.3, -0.3], [0.15, 0.3, -0.3]];
  return (
    <group>
      <Box p={[0, 0.5, 0]} s={[0.42, 0.38, 0.9]} c={d.color} />
      {legPos.map((p, i) => (
        <group key={i} position={p} ref={(el) => { legs.current[i] = el; }}>
          <Box p={[0, -0.15, 0]} s={[0.12, 0.3, 0.12]} c={d.color} />
        </group>
      ))}
      <Box p={[0, 0.62, 0.58]} s={[0.32, 0.3, 0.34]} c={d.color} />
      {d.ears && (
        <>
          <Box p={[-0.1, 0.8, 0.52]} s={[0.07, 0.1, 0.06]} c={d.color} />
          <Box p={[0.1, 0.8, 0.52]} s={[0.07, 0.1, 0.06]} c={d.color} />
        </>
      )}
      {d.trunk && (
        <>
          <Box p={[0, 0.5, 0.82]} s={[0.14, 0.14, 0.3]} c={d.color} />
          <Box p={[0, 0.32, 0.94]} s={[0.12, 0.34, 0.12]} c={d.color} />
        </>
      )}
      {d.tusks && (
        <>
          <Box p={[-0.12, 0.54, 0.78]} s={[0.04, 0.04, 0.2]} c="#f4efe2" />
          <Box p={[0.12, 0.54, 0.78]} s={[0.04, 0.04, 0.2]} c="#f4efe2" />
        </>
      )}
      <Box p={[0, 0.66, -0.55]} s={[0.06, 0.06, 0.3]} c={d.color} r={[-0.5, 0, 0]} />
      {d.spots &&
        [[-0.1, 0.7, 0.2], [0.12, 0.7, -0.05], [-0.08, 0.7, -0.25], [0.1, 0.7, 0.3], [0.0, 0.7, -0.4]].map((p, i) => (
          <Box key={i} p={p} s={[0.1, 0.02, 0.1]} c={d.spots} />
        ))}
      <Box p={[-0.08, 0.66, 0.74]} s={[0.04, 0.04, 0.02]} c="#111" />
      <Box p={[0.08, 0.66, 0.74]} s={[0.04, 0.04, 0.02]} c="#111" />
    </group>
  );
}

export default function Animal({ type }) {
  const d = ENEMIES[type];
  return <Quad d={d} />;
}
