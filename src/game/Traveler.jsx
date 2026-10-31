import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bicycle, TukTuk } from './Vehicles.jsx';

const SKIN = '#e0a878';
const SHIRT = '#1f9d8b';
const SHORTS = '#c9a66b';
const BOOT = '#3b2a20';
const PACK = '#e8631a';
const PACK_DARK = '#b34a10';
const STRAW = '#e6c76a';
const BAND = '#a8321f';

function Part({ position, args, color, rotation, shape = 'box' }) {
  return (
    <mesh position={position} rotation={rotation}>
      {shape === 'box' && <boxGeometry args={args} />}
      {shape === 'sphere' && <sphereGeometry args={args} />}
      {shape === 'cyl' && <cylinderGeometry args={args} />}
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

// A low-poly backpacker built from primitives. Local +Z is forward; feet at y = 0.
// Total height is about 1 unit, scaled by the `scale` prop.
const Traveler = forwardRef(function Traveler({ scale = 0.3, vehicle = 0 }, ref) {
  const root = useRef();
  const body = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const state = useRef({ phase: 0, speed: 0, swing: 0 });
  const rideRef = useRef(vehicle);
  rideRef.current = vehicle;

  useImperativeHandle(ref, () => ({
    group: root.current,
    setSpeed: (s) => {
      state.current.speed = s;
    },
    attack: () => {
      state.current.swing = 0.25;
    },
  }));

  useFrame((_, dt) => {
    const st = state.current;
    const moving = Math.min(1, Math.abs(st.speed) / 0.6);
    st.phase += dt * (4 + Math.abs(st.speed) * 4);
    const swing = Math.sin(st.phase) * 0.8 * moving;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;
    const ride = rideRef.current;
    if (ride === 1) {
      // pedalling: legs push, hands on the bars, leaning forward
      const pedal = Math.sin(st.phase * 1.4) * 0.55 * moving;
      if (legL.current) legL.current.rotation.x = -0.95 + pedal;
      if (legR.current) legR.current.rotation.x = -0.95 - pedal;
      if (armL.current) armL.current.rotation.x = -1.15;
      if (armR.current) armR.current.rotation.x = -1.15;
    } else if (ride === 2) {
      // seated in the driver's seat, hands on the handlebar
      if (legL.current) legL.current.rotation.x = -1.3;
      if (legR.current) legR.current.rotation.x = -1.3;
      if (armL.current) armL.current.rotation.x = -1.05;
      if (armR.current) armR.current.rotation.x = -1.05;
    }
    if (st.swing > 0 && armR.current) {
      st.swing = Math.max(0, st.swing - dt);
      armR.current.rotation.x = -1.4 - Math.sin((1 - st.swing / 0.25) * Math.PI) * 1.0;
    }
    if (body.current) {
      if (ride === 1) {
        body.current.position.set(0, 0.1, -0.08);
        body.current.rotation.x = 0.14;
      } else if (ride === 2) {
        body.current.position.set(0, 0.2, -0.04);
        body.current.rotation.x = 0;
      } else {
        body.current.position.set(0, Math.abs(Math.sin(st.phase)) * 0.025 * moving, 0);
        body.current.rotation.x = 0.06 * moving; // lean into the walk under the pack's weight
      }
    }
  });

  return (
    <group ref={root} scale={scale}>
      {vehicle === 1 && <Bicycle stateRef={state} scale={scale} />}
      {vehicle === 2 && <TukTuk stateRef={state} scale={scale} />}
      <group ref={body}>
        {/* Legs: pivot at the hip */}
        <group ref={legL} position={[-0.075, 0.46, 0]}>
          <Part position={[0, -0.12, 0]} args={[0.11, 0.24, 0.12]} color={SHORTS} />
          <Part position={[0, -0.28, 0]} args={[0.085, 0.16, 0.09]} color={SKIN} />
          <Part position={[0, -0.4, 0.02]} args={[0.115, 0.1, 0.17]} color={BOOT} />
        </group>
        <group ref={legR} position={[0.075, 0.46, 0]}>
          <Part position={[0, -0.12, 0]} args={[0.11, 0.24, 0.12]} color={SHORTS} />
          <Part position={[0, -0.28, 0]} args={[0.085, 0.16, 0.09]} color={SKIN} />
          <Part position={[0, -0.4, 0.02]} args={[0.115, 0.1, 0.17]} color={BOOT} />
        </group>

        {/* Torso and belt */}
        <Part position={[0, 0.62, 0]} args={[0.27, 0.3, 0.16]} color={SHIRT} />
        <Part position={[0, 0.46, 0]} args={[0.28, 0.04, 0.17]} color={BOOT} />

        {/* Arms: pivot at the shoulder */}
        <group ref={armL} position={[-0.175, 0.74, 0]}>
          <Part position={[0, -0.1, 0]} args={[0.075, 0.24, 0.085]} color={SHIRT} />
          <Part position={[0, -0.26, 0]} args={[0.065, 0.1, 0.07]} color={SKIN} />
        </group>
        <group ref={armR} position={[0.175, 0.74, 0]}>
          <Part position={[0, -0.1, 0]} args={[0.075, 0.24, 0.085]} color={SHIRT} />
          <Part position={[0, -0.26, 0]} args={[0.065, 0.1, 0.07]} color={SKIN} />
        </group>

        {/* Backpack on the back (-Z): pack, lid, bedroll, side pockets, straps */}
        <Part position={[0, 0.66, -0.17]} args={[0.3, 0.38, 0.17]} color={PACK} />
        <Part position={[0, 0.88, -0.17]} args={[0.31, 0.07, 0.18]} color={PACK_DARK} />
        <Part
          position={[0, 0.96, -0.17]}
          args={[0.065, 0.065, 0.34, 12]}
          color="#4a6b8a"
          shape="cyl"
          rotation={[0, 0, Math.PI / 2]}
        />
        <Part position={[-0.17, 0.58, -0.17]} args={[0.05, 0.18, 0.1]} color={PACK_DARK} />
        <Part position={[0.17, 0.58, -0.17]} args={[0.05, 0.18, 0.1]} color={PACK_DARK} />
        <Part position={[-0.1, 0.72, -0.075]} args={[0.035, 0.28, 0.02]} color={BAND} />
        <Part position={[0.1, 0.72, -0.075]} args={[0.035, 0.28, 0.02]} color={BAND} />
        <Part position={[0, 0.5, -0.09]} args={[0.26, 0.03, 0.02]} color={BAND} />

        {/* Neck, head, face */}
        <Part position={[0, 0.8, 0.005]} args={[0.06, 0.06, 0.06]} color={SKIN} />
        <Part position={[0, 0.9, 0.01]} args={[0.105, 20, 16]} color={SKIN} shape="sphere" />
        <Part position={[-0.038, 0.915, 0.095]} args={[0.014, 8, 8]} color="#1a1a1a" shape="sphere" />
        <Part position={[0.038, 0.915, 0.095]} args={[0.014, 8, 8]} color="#1a1a1a" shape="sphere" />
        <Part position={[0, 0.87, 0.1]} args={[0.05, 0.012, 0.012]} color="#8a3a2a" />

        {/* Straw sun hat */}
        <Part position={[0, 0.985, 0.01]} args={[0.2, 0.2, 0.02, 24]} color={STRAW} shape="cyl" />
        <Part position={[0, 1.035, 0.01]} args={[0.085, 0.1, 0.09, 20]} color={STRAW} shape="cyl" />
        <Part position={[0, 1.0, 0.01]} args={[0.102, 0.102, 0.03, 20]} color={BAND} shape="cyl" />
      </group>
    </group>
  );
});

export default Traveler;
