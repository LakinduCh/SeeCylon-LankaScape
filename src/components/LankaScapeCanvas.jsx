import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import locations from '../data/locations.json';

function SriLankaMap() {
  const { scene } = useGLTF('/models/SriLankaMap.glb');

  return (
    <primitive
      object={scene}
      scale={2}
      position={[0, 0, 0]}
    />
  );
}


// Location Node Component
function LocationNode({ location, onSelect }) {
  const meshRef = useRef();

  return (
    <group
      position={[
        location.position[0],
        location.position[1] + 4.5,
        location.position[2]
      ]}
    >
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />

        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}


// Camera Controller
function CameraController({ targetPosition }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (controls) {

      const destCam = targetPosition
        ? {
            x: targetPosition[0],
            y: targetPosition[1] + 2,
            z: targetPosition[2] + 4
          }
        : {
            x: 0,
            y: 5,
            z: 8
          };

      const destTarget = targetPosition
        ? {
            x: targetPosition[0],
            y: targetPosition[1],
            z: targetPosition[2]
          }
        : {
            x: 0,
            y: 0,
            z: 0
          };

      gsap.to(camera.position, {
        ...destCam,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      gsap.to(controls.target, {
        ...destTarget,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });
    }
  }, [targetPosition, camera, controls]);

  return null;
}


// Main Canvas
export default function LankaScapeCanvas({
  selectedLocation,
  onSelectLocation
}) {

  console.log(
    "LankaScapeCanvas rendering. locations:",
    locations
  );


  // ==========================================
  // LANDING PAGE AUDIO
  // ==========================================

  useEffect(() => {

    const audio = new Audio('/audio/sri-lanka-background.mp3');

    audio.loop = true;
    audio.volume = 0.4;

    const startAudio = () => {

      audio.play().catch(() => {
        console.log('Audio could not start.');
      });

      window.removeEventListener('click', startAudio);
    };

    // Try autoplay
    audio.play().catch(() => {
      // Browser blocked autoplay.
      // Start after first click.
      window.addEventListener('click', startAudio);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      window.removeEventListener('click', startAudio);
    };

  }, []);


  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{
        position: [0, 5, 15],
        fov: 50
      }}
      className="w-full h-screen bg-slate-950"
    >

      <ambientLight intensity={0.6} />

      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
      />

      <OrbitControls
        makeDefault
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan={true}
      />

      <SriLankaMap />

      <CameraController
        targetPosition={selectedLocation?.position}
      />

      {locations.map((loc) => (
        <LocationNode
          key={loc.id}
          location={loc}
          onSelect={onSelectLocation}
        />
      ))}

    </Canvas>
  );
}