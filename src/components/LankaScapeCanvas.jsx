import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html, useProgress, Billboard } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import locations from '../data/locations.json';
import { mapStyles } from '../data/mapStyles';

// Sleek 3D Loading Indicator
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl backdrop-blur-xl shadow-2xl text-center min-w-[280px]">
        <div className="w-12 h-12 mb-3 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <p className="text-amber-400 font-bold text-sm tracking-wider uppercase mb-1 font-sans">
          Loading 3D LankaScape
        </p>
        <p className="text-[11px] text-slate-400 mb-3">Initializing 3D Map & Terrain...</p>
        <div className="w-52 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/80">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(progress)}%` }}
          ></div>
        </div>
        <span className="text-xs text-amber-400/80 mt-2 font-mono">{Math.round(progress)}% loaded</span>
      </div>
    </Html>
  );
}

function SriLankaMap({ activeStyle = 'realistic' }) {
  const { scene, animations } = useGLTF('/models/MPM-project_V4.glb');
  const { actions } = useAnimations(animations, scene);

  // Auto-play wildlife and ambient idle animations
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach((action) => {
        action?.reset().fadeIn(0.5).play();
      });
    }
  }, [actions]);

  // Dynamic Map Style Switching: Shader & Material Updates (WEB-5.2)
  useEffect(() => {
    if (scene) {
      const styleConfig = mapStyles[activeStyle] || mapStyles.realistic;

      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            child.material.side = 2; // THREE.DoubleSide
            child.material.roughness = styleConfig.terrainMaterial.roughness;
            child.material.metalness = styleConfig.terrainMaterial.metalness;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, activeStyle]);

  return (
    <primitive
      object={scene}
      scale={0.456}
      position={[0, -4.12, -0.127]}
    />
  );
}

// Category Color and Icon Mapping
const categoryColorMap = {
  'nature-wildlife': '#10b981',    // Emerald Green
  'cultural-heritage': '#f43f5e',  // Vibrant Ruby/Rose
  'coastal-marine': '#06b6d4',     // Cyan Azure
  'highland-adventure': '#f59e0b', // Warm Amber Gold
};

const shortTags = {
  sigiriya: 'Ancient Citadel',
  ella: 'Scenic Railway',
  horton: 'Cloud Forest',
  galle: 'Dutch Bastion',
  mirissa: 'Golden Coast',
  yala: 'Wildlife Safari',
  arugambay: 'Surf Point',
};

// Helper to darken hex color for rich radial gradient shading
function darkenHex(hex, factor = 0.45) {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - factor)));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - factor)));
  const b = Math.max(0, Math.floor((num & 255) * (1 - factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Generate high-resolution, crisp GPU canvas texture for 3D jewel pin heads
function createCategoryTexture(categoryId, colorHex) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 128;
  const cy = 128;
  const r = 114;

  // 1. Dark outer rim
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#090d16';
  ctx.fill();

  // 2. Rich radial gemstone gradient
  const grad = ctx.createRadialGradient(cx - 30, cy - 35, 12, cx, cy, r);
  grad.addColorStop(0, '#ffffff'); // bright specular center
  grad.addColorStop(0.22, colorHex); // vibrant category jewel color
  grad.addColorStop(0.82, darkenHex(colorHex, 0.45)); // deep rich shade
  grad.addColorStop(1.0, '#020617'); // dark border edge

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. Crisp inner hairline ring
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4. Glossy top specular crescent reflection
  ctx.beginPath();
  ctx.ellipse(cx, cy - 44, 62, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.fill();

  // 5. Crisp vector emblem icon with drop shadow
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  switch (categoryId) {
    case 'cultural-heritage':
      // Classical UNESCO Citadel & Temple
      ctx.beginPath();
      ctx.moveTo(cx, cy - 38);
      ctx.lineTo(cx - 42, cy - 14);
      ctx.lineTo(cx + 42, cy - 14);
      ctx.closePath();
      ctx.fill();

      // Architrave
      ctx.fillRect(cx - 44, cy - 12, 88, 6);

      // 4 Columns
      const colW = 9;
      const colH = 34;
      const colY = cy - 4;
      ctx.fillRect(cx - 36, colY, colW, colH);
      ctx.fillRect(cx - 15, colY, colW, colH);
      ctx.fillRect(cx + 6, colY, colW, colH);
      ctx.fillRect(cx + 27, colY, colW, colH);

      // Plinths
      ctx.fillRect(cx - 44, cy + 32, 88, 6);
      ctx.fillRect(cx - 48, cy + 40, 96, 7);
      break;

    case 'highland-adventure':
      // Overlapping Majestic Mountain Peaks
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy - 16);
      ctx.lineTo(cx - 56, cy + 36);
      ctx.lineTo(cx + 6, cy + 36);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 38);
      ctx.lineTo(cx - 28, cy + 38);
      ctx.lineTo(cx + 54, cy + 38);
      ctx.closePath();
      ctx.fill();

      // Mountain ridge shadow
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 38);
      ctx.lineTo(cx + 12, cy + 38);
      ctx.lineTo(cx + 54, cy + 38);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fill();
      break;

    case 'nature-wildlife':
      // Safari Wildlife Paw Print
      ctx.beginPath();
      ctx.ellipse(cx, cy + 14, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      const toes = [
        { x: -28, y: -10, rx: 8, ry: 13, rot: -0.35 },
        { x: -10, y: -24, rx: 8.5, ry: 14, rot: -0.1 },
        { x: 10, y: -24, rx: 8.5, ry: 14, rot: 0.1 },
        { x: 28, y: -10, rx: 8, ry: 13, rot: 0.35 },
      ];
      toes.forEach(({ x, y, rx, ry, rot }) => {
        ctx.beginPath();
        ctx.ellipse(cx + x, cy + y, rx, ry, rot, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'coastal-marine':
      // Ocean Waves with Sea Spray
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#ffffff';

      // Upper crest
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 2, 28, Math.PI * 0.9, Math.PI * 1.95, false);
      ctx.stroke();

      // Wave curl
      ctx.beginPath();
      ctx.arc(cx + 16, cy - 14, 10, Math.PI * 0.95, Math.PI * 0.1, true);
      ctx.stroke();

      // Lower wave
      ctx.beginPath();
      ctx.arc(cx + 4, cy + 22, 34, Math.PI * 0.85, Math.PI * 1.8, false);
      ctx.stroke();

      // Sea spray droplet
      ctx.beginPath();
      ctx.arc(cx + 34, cy - 22, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const categoryTextureCache = new Map();

function useCategoryTexture(categoryId, colorHex) {
  return useMemo(() => {
    const key = `${categoryId}_${colorHex}`;
    if (!categoryTextureCache.has(key)) {
      const tex = createCategoryTexture(categoryId, colorHex);
      if (tex) categoryTextureCache.set(key, tex);
    }
    return categoryTextureCache.get(key) || null;
  }, [categoryId, colorHex]);
}

// Location Node Component: Refined Minimalist 3D Pins with Hover/Select Reveal
function LocationNode({
  location,
  onSelect,
  isSelected,
  activeCategory = 'all',
  activeSubcategory = 'all',
  activeStyle = 'realistic',
  cameraMode = 'birdseye',
}) {
  const headGroupRef = useRef();
  const shadowRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Multi-Level Hierarchical Visibility Evaluation
  const isCategoryMatch = activeCategory === 'all' || location.categoryId === activeCategory;
  const isSubcategoryMatch = activeSubcategory === 'all' || location.subcategoryId === activeSubcategory;
  const isMatch = isCategoryMatch && isSubcategoryMatch;

  const activeColor = categoryColorMap[location.categoryId] || '#f59e0b';
  const texture = useCategoryTexture(location.categoryId, activeColor);
  const styleConfig = mapStyles[activeStyle] || mapStyles.realistic;
  const glowMultiplier = styleConfig.pinGlowMultiplier || 1.0;

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Smooth sinusoidal bobbing, ground shadow scaling, and pulse ring
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const phaseOffset = location.position[0] * 1.8 + location.position[2] * 2.2;
    const bob = Math.sin(time * 2.4 + phaseOffset) * 0.016;

    if (headGroupRef.current) {
      headGroupRef.current.position.y = 0.28 + bob;
    }

    if (shadowRef.current) {
      const shadowScale = (1 - bob * 2.5) * (isMatch ? 1 : 0.6);
      shadowRef.current.scale.set(shadowScale, shadowScale, 1);
      if (shadowRef.current.material) {
        shadowRef.current.material.opacity = (0.34 - bob * 1.8) * (isMatch ? 1 : 0.1);
      }
    }

    if (ringRef.current) {
      const cycle = (time * 0.75 + phaseOffset * 0.3) % 1.0;
      const scale = (isMatch ? 0.6 : 0.4) + cycle * (isMatch ? 1.3 : 0.6);
      const opacity = (1 - cycle) * (hovered || isSelected ? 0.85 : (isMatch ? 0.48 : 0.1)) * (activeStyle === 'night' ? 1.3 : 1.0);
      ringRef.current.scale.set(scale, scale, 1);
      if (ringRef.current.material) {
        ringRef.current.material.opacity = opacity;
      }
    }
  });

  const nodeScale = isMatch
    ? (isSelected ? 1.22 : (hovered ? 1.15 : 1.0))
    : 0.45;

  return (
    <group
      position={location.position}
      scale={nodeScale}
      visible={true}
    >
      {/* 1. Soft Contact Shadow on Terrain */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.075, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Pinpoint Ground Anchor Bead & Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[0.012, 0.024, 24]} />
        <meshBasicMaterial
          color={hovered || isSelected ? '#fbbf24' : activeColor}
          transparent
          opacity={isMatch ? 0.9 : 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Concentric Ground Radar Pulse */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}>
        <ringGeometry args={[0.02, 0.034, 32]} />
        <meshBasicMaterial
          color={hovered || isSelected ? '#fbbf24' : activeColor}
          transparent
          opacity={isMatch ? 0.48 : 0.1}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Slender Polished Metal Needle Stem */}
      <group position={[0, 0, 0]}>
        {/* Metallic needle body */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.004, 0.01, 0.22, 16]} />
          <meshStandardMaterial
            color={hovered || isSelected ? '#fbbf24' : '#e2e8f0'}
            metalness={0.92}
            roughness={0.16}
          />
        </mesh>

        {/* Luminous core glow inside stem */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.002, 0.003, 0.22, 12]} />
          <meshBasicMaterial
            color={hovered || isSelected ? '#fbbf24' : activeColor}
            transparent
            opacity={hovered || isSelected ? 0.85 : 0.35}
          />
        </mesh>

        {/* Needle Top Collar Sphere */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial
            color={hovered || isSelected ? '#fbbf24' : '#e2e8f0'}
            metalness={0.94}
            roughness={0.14}
          />
        </mesh>
      </group>

      {/* 5. Invisible 3D raycast hit cylinder for instant click & hover */}
      <mesh
        position={[0, 0.26, 0]}
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
        <cylinderGeometry args={[0.26, 0.26, 0.56, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 6. Billboarded Jewel Head Group (Faces camera at ALL angles) */}
      <group
        ref={headGroupRef}
        position={[0, 0.28, 0]}
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
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          {/* Ambient Glow Halo */}
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.13, 32]} />
            <meshBasicMaterial
              color={hovered || isSelected ? '#fbbf24' : activeColor}
              transparent
              opacity={(hovered || isSelected ? 0.42 : 0.16) * glowMultiplier}
              depthWrite={false}
            />
          </mesh>

          {/* Polished Metallic Bezel Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.088, 0.012, 16, 36]} />
            <meshStandardMaterial
              color={hovered || isSelected ? '#fbbf24' : '#cbd5e1'}
              metalness={0.94}
              roughness={0.14}
              emissive={hovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(hovered || isSelected ? 0.5 : 0.15) * glowMultiplier}
            />
          </mesh>

          {/* Front Gemstone Medallion with Custom Vector Icon */}
          <mesh position={[0, 0, 0.004]}>
            <circleGeometry args={[0.084, 36]} />
            <meshStandardMaterial
              map={texture || undefined}
              color={texture ? '#ffffff' : activeColor}
              metalness={0.12}
              roughness={0.18}
              emissive={hovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(hovered || isSelected ? 0.35 : 0.12) * glowMultiplier}
            />
          </mesh>

          {/* Back Brushed Metallic Cover Plate */}
          <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.084, 36]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>
        </Billboard>

        {/* 7. Hover & Selection ONLY: Rich Glassmorphic Preview Card */}
        {(hovered || isSelected) && isMatch && (
          <Html
            position={[0, 0.30, 0]}
            center
            distanceFactor={cameraMode === 'birdseye' ? 8.2 : 6.8}
            zIndexRange={[990, 1000]}
            className="pointer-events-auto select-none"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(location);
              }}
              onMouseEnter={() => {
                setHovered(true);
                document.body.style.cursor = 'pointer';
              }}
              onMouseLeave={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
              }}
              className="relative cursor-pointer transition-all duration-300 transform -translate-y-4"
              style={{
                filter: isSelected
                  ? 'drop-shadow(0 14px 28px rgba(0,0,0,0.85)) drop-shadow(0 0 16px rgba(251,191,36,0.35))'
                  : `drop-shadow(0 12px 24px rgba(0,0,0,0.75)) drop-shadow(0 0 12px ${activeColor}40)`,
              }}
            >
              {/* Glassmorphic Card Container */}
              <div
                className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl border backdrop-blur-2xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.92) 100%)',
                  borderColor: isSelected ? '#fbbf24' : `${activeColor}80`,
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Image Thumbnail */}
                <div
                  className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border shadow-inner"
                  style={{ borderColor: `${activeColor}70` }}
                >
                  <img
                    src={location.thumbnail}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>

                {/* Info Text */}
                <div className="flex flex-col text-left min-w-[130px] max-w-[190px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                      style={{
                        backgroundColor: activeColor,
                        boxShadow: `0 0 6px ${activeColor}`,
                      }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 truncate">
                      {shortTags[location.id] || location.subcategoryName || location.categoryName}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded-full border border-amber-400/40 ml-auto whitespace-nowrap">
                        Active
                      </span>
                    )}
                  </div>

                  <h4 className="text-[13px] font-bold text-white tracking-tight leading-tight truncate font-sans">
                    {location.name}
                  </h4>

                  <p className="text-[10px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                    <span>{isSelected ? 'Viewing 3D details' : 'Click to explore 3D'}</span>
                    <span className="text-[11px] leading-none">→</span>
                  </p>
                </div>
              </div>

              {/* Downward Anchor Stem / Triangle Arrow pointing to Pin Head */}
              <div
                className="w-0 h-0 mx-auto border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px]"
                style={{
                  borderTopColor: isSelected ? '#fbbf24' : `${activeColor}dd`,
                }}
              />
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// GSAP Camera Fly-To & Mode Transition Controller with Aspect Ratio Awareness
function CameraController({ targetPosition, cameraMode = 'birdseye' }) {
  const { camera, controls, size } = useThree();

  useEffect(() => {
    if (controls) {
      let destCam;
      let destTarget;

      // Aspect ratio compensation so vertical phone screens don't crop the island
      const aspect = size.width / Math.max(size.height, 1);
      const aspectMultiplier = aspect < 1.0 ? Math.min(1.8, 1.15 / aspect) : 1.0;

      if (cameraMode === 'birdseye') {
        // Bird's-Eye View: Aerial overhead map perspective centered over Sri Lanka
        if (targetPosition) {
          // Overhead view on selected location
          destCam = {
            x: targetPosition[0],
            y: (targetPosition[1] + 9.5) * (aspect < 1.0 ? 1.25 : 1.0),
            z: targetPosition[2] + 0.05,
          };
          destTarget = {
            x: targetPosition[0],
            y: targetPosition[1],
            z: targetPosition[2],
          };
        } else {
          // Full overhead aerial map overview of Sri Lanka nicely centered
          destCam = {
            x: 0,
            y: 20.0 * aspectMultiplier,
            z: 1.60,
          };
          destTarget = {
            x: 0,
            y: 5.7,
            z: 1.55,
          };
        }
      } else {
        // Free Cam: Dynamic 3D perspective orbit camera
        if (targetPosition) {
          // 3D angled close-up on destination
          destCam = {
            x: targetPosition[0],
            y: (targetPosition[1] + 3.0) * (aspect < 1.0 ? 1.2 : 1.0),
            z: (targetPosition[2] + 4.0) * (aspect < 1.0 ? 1.2 : 1.0),
          };
          destTarget = {
            x: targetPosition[0],
            y: targetPosition[1] + 0.4,
            z: targetPosition[2],
          };
        } else {
          // 3D angled overview
          destCam = {
            x: 0,
            y: 12.0 * aspectMultiplier,
            z: 13.0 * aspectMultiplier,
          };
          destTarget = {
            x: 0,
            y: 5.7,
            z: 1.0,
          };
        }
      }

      const tweenCam = gsap.to(camera.position, {
        ...destCam,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      const tweenTarget = gsap.to(controls.target, {
        ...destTarget,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      return () => {
        tweenCam.kill();
        tweenTarget.kill();
      };
    }
  }, [targetPosition, cameraMode, camera, controls, size.width, size.height]);

  // Keep camera pan smoothly bounded within the ocean frame
  useFrame(() => {
    if (controls) {
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -6.0, 6.0);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -6.0, 6.5);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 4.5, 7.0);
    }
  });

  return null;
}

// Responsive R3F Canvas Viewport with Bird's-Eye / Free Cam Modes
export default function LankaScapeCanvas({
  selectedLocation,
  onSelectLocation,
  isCardAudioPlaying,
  activeCategory = 'all',
  activeSubcategory = 'all',
  activeStyle = 'realistic',
  cameraMode = 'birdseye',
  isMuted = false,
}) {
  const bgAudioRef = useRef(null);
  const styleConfig = mapStyles[activeStyle] || mapStyles.realistic;

  // Background Audio Handling
  useEffect(() => {
    const audio = new Audio('/audio/sri-lanka-background.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = isMuted;
    bgAudioRef.current = audio;

    const startAudio = () => {
      audio.play().catch(() => {
        console.log('Audio could not start.');
      });
      window.removeEventListener('click', startAudio);
    };

    audio.play().catch(() => {
      window.addEventListener('click', startAudio);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      bgAudioRef.current = null;
      window.removeEventListener('click', startAudio);
    };
  }, []);

  // Sync mute state dynamically
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Duck background audio when destination card audio is playing
  useEffect(() => {
    if (bgAudioRef.current) {
      if (isCardAudioPlaying) {
        bgAudioRef.current.volume = 0.05;
      } else {
        bgAudioRef.current.volume = 0.35;
      }
    }
  }, [isCardAudioPlaying]);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{
        position: cameraMode === 'birdseye' ? [0, 20.0, 1.60] : [0, 12.0, 13.0],
        fov: 48,
      }}
      className={`w-full h-screen transition-colors duration-500 ${styleConfig.bgClass}`}
    >
      {/* Dynamic Lighting System Driven by Map Style Theming Engine */}
      <ambientLight
        color={styleConfig.ambientLight.color}
        intensity={styleConfig.ambientLight.intensity}
      />
      <directionalLight
        position={styleConfig.directionalLight1.position}
        color={styleConfig.directionalLight1.color}
        intensity={styleConfig.directionalLight1.intensity}
      />
      <directionalLight
        position={styleConfig.directionalLight2.position}
        color={styleConfig.directionalLight2.color}
        intensity={styleConfig.directionalLight2.intensity}
      />

      {/* 3D OrbitControls Configured for Bird's-Eye vs Free Cam */}
      <OrbitControls
        makeDefault
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minDistance={cameraMode === 'birdseye' ? 5.0 : 3.5}
        maxDistance={cameraMode === 'birdseye' ? 28.0 : 22.0}
        minPolarAngle={cameraMode === 'birdseye' ? 0.01 : 0.15}
        maxPolarAngle={cameraMode === 'birdseye' ? Math.PI / 4.2 : Math.PI / 2.2}
        target={cameraMode === 'birdseye' ? [0, 5.7, 1.55] : [0, 5.7, 1.0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />

      <Suspense fallback={<CanvasLoader />}>
        <SriLankaMap activeStyle={activeStyle} />
      </Suspense>

      <CameraController
        targetPosition={selectedLocation?.position}
        cameraMode={cameraMode}
      />

      {/* Render Location Raycast Nodes with Unified 3D Beacon Mesh */}
      {locations.map((loc) => (
        <LocationNode
          key={loc.id}
          location={loc}
          onSelect={onSelectLocation}
          isSelected={selectedLocation?.id === loc.id}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          activeStyle={activeStyle}
          cameraMode={cameraMode}
        />
      ))}
    </Canvas>
  );
}

useGLTF.preload('/models/MPM-project_V4.glb');