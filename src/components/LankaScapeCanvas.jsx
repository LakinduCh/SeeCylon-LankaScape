import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import gsap from 'gsap';
import locations from '../data/locations.json';

function SriLankaMap() {
  const { scene } = useGLTF('/models/SriLankaMap_terrain_v2_.glb');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Ensure proper material side rendering for all meshes (terrain and globe)
          if (child.material) {
            child.material.side = 2; // DoubleSide
            child.material.roughness = 0.8;
            child.material.metalness = 0.1;
          }
        }
      });
    }
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={0.456}
      position={[0, -4.12, -0.127]}
    />
  );
}

// Location Node Component with Raycasting Hitboxes & Hover States (WEB-1.3)
function LocationNode({ location, onSelect, isSelected }) {
  const meshRef = useRef();
  const stemRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Bobbing and rotation animation for the floating pointer mesh
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Bob up and down
      meshRef.current.position.y = 0.8 + Math.sin(time * 2.5) * 0.06;
      // Rotate
      meshRef.current.rotation.y = time * 1.2;
    }
    if (ringRef.current) {
      // Pulse animation for the ground ring
      const cycle = (time % 1.5) / 1.5; // 0 to 1
      const scale = 1 + cycle * 1.5;
      const opacity = 1 - cycle;
      ringRef.current.scale.set(scale, scale, 1);
      if (ringRef.current.material) {
        ringRef.current.material.opacity = opacity * 0.6;
      }
    }
  });

  return (
    <group position={location.position}>
      {/* 1. Pulsing ground ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.08, 0.4, 32]} />
        <meshBasicMaterial
          color={hovered || isSelected ? "#fbbf24" : "#f59e0b"}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Static ground base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0, 0.12, 32]} />
        <meshBasicMaterial
          color={hovered || isSelected ? "#fbbf24" : "#d97706"}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 2. Vertical pin stem */}
      <mesh ref={stemRef} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
        <meshStandardMaterial
          color={hovered || isSelected ? "#fbbf24" : "#d97706"}
          emissive={hovered || isSelected ? "#fbbf24" : "#d97706"}
          emissiveIntensity={hovered || isSelected ? 0.9 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 3. Floating pointer tip */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Diamond mesh */}
        <mesh ref={meshRef} position={[0, 0.8, 0]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color={hovered || isSelected ? "#fbbf24" : "#f59e0b"}
            emissive={hovered || isSelected ? "#f59e0b" : "#b45309"}
            emissiveIntensity={hovered || isSelected ? 1.8 : 0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Larger invisible raycast target for easier clicking */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 1.1, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>

      {/* 4. HTML Floating Badge */}
      <Html
        position={[0, 1.25, 0]}
        center
        distanceFactor={6}
        className="pointer-events-none select-none transition-all duration-300"
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg transition-all duration-300 ${
            hovered || isSelected
              ? "bg-amber-500/95 border-amber-300 text-slate-950 scale-110 shadow-amber-500/40"
              : "bg-slate-900/90 border-slate-700/60 text-slate-100 scale-100"
          }`}
        >
          {/* Custom SVG Location Pin Icon */}
          <svg
            className={`w-3.5 h-3.5 transition-colors ${
              hovered || isSelected ? "text-slate-950" : "text-amber-400"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap font-sans">
            {location.name}
          </span>
        </div>
      </Html>
    </group>
  );
}

// GSAP Camera Fly-To Interpolation Controller (WEB-2.1)
function CameraController({ targetPosition }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (controls) {
      const destCam = targetPosition
        ? { x: targetPosition[0], y: targetPosition[1] + 3, z: targetPosition[2] + 6 }
        : { x: 0, y: 15, z: 24 };

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

      const tweenCam = gsap.to(camera.position, {
        ...destCam,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      const tweenTarget = gsap.to(controls.target, {
        ...destTarget,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      return () => {
        tweenCam.kill();
        tweenTarget.kill();
      };
    }
  }, [targetPosition, camera, controls]);

  return null;
}

// Responsive R3F Canvas Viewport (WEB-1.2)
export default function LankaScapeCanvas({ selectedLocation, onSelectLocation }) {
  console.log("LankaScapeCanvas rendering. locations:", locations);

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
      camera={{ position: [0, 15, 24], fov: 50 }}
      className="w-full h-screen bg-slate-950"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />

      {/* Constrained Orbit Controls (WEB-1.3) */}
      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={65}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan={true}
      />

      <SriLankaMap />

      <CameraController targetPosition={selectedLocation?.position} />

      {/* Render Location Raycast Nodes */}
      {locations.map((loc) => (
        <LocationNode
          key={loc.id}
          location={loc}
          onSelect={onSelectLocation}
          isSelected={selectedLocation?.id === loc.id}
        />
      ))}
    </Canvas>
  );
}

useGLTF.preload('/models/SriLankaMap_terrain_v2_.glb');