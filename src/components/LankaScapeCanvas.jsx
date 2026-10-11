import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html, useProgress, Billboard } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import locations from '../data/locations.json';
import { mapStyles } from '../data/mapStyles';
import { destinationThemeMusic } from '../data/destinationMusic';

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
  adamspeak: 'Sacred Summit',
  delft: 'Coral Island',
  kandy: 'Sacred Tooth Relic',
  lotustower: 'Lotus Bloom',
  pinnawala: 'Elephant Haven',
  wilpattu: 'Natural Villus',
};

const destinationDisplayNames = {
  sigiriya: 'Sigiriya',
  ella: 'Nine Arch Bridge',
  horton: 'Horton Plains',
  galle: 'Galle Fort',
  mirissa: 'Mirissa',
  yala: 'Yala',
  arugambay: 'Arugam Bay',
  adamspeak: "Adam's Peak",
  delft: 'Delft Island',
  kandy: 'Kandy',
  lotustower: 'Lotus Tower',
  pinnawala: 'Pinnawala',
  wilpattu: 'Wilpattu',
};

const labelOffsets = {
  horton: [0, 0.38, 0],
  ella: [0, 0.46, 0],
  adamspeak: [0, 0.48, 0],
  pinnawala: [0, 0.46, 0],
  kandy: [0, 0.40, 0],
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

// Cached high-precision 3D Sculpted Teardrop Map Pin Geometry
let cachedTeardropGeometry = null;
function getTeardropGeometry() {
  if (!cachedTeardropGeometry) {
    const s = new THREE.Shape();
    // Tip at (0, 0.035) pointing downward to terrain
    s.moveTo(0, 0.035);
    // Smooth aerodynamic curve up to the right tangent point of the bulb
    s.quadraticCurveTo(0.045, 0.11, 0.091, 0.198);
    // Circular arc around bulb top (center: 0, 0.25; radius: 0.105)
    s.absarc(0, 0.25, 0.105, -Math.PI / 6, Math.PI + Math.PI / 6, false);
    // Symmetrical curve down to the tip
    s.quadraticCurveTo(-0.045, 0.11, 0, 0.035);

    // Inner circular aperture / window for bezel and luminous category jewel
    const hole = new THREE.Path();
    hole.absarc(0, 0.25, 0.070, 0, Math.PI * 2, true);
    s.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(s, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.007,
      bevelThickness: 0.007,
    });
    // Center depth along Z axis so the pin is symmetrically balanced around Z = 0
    geom.translate(0, 0, -0.012);
    geom.computeVertexNormals();
    cachedTeardropGeometry = geom;
  }
  return cachedTeardropGeometry;
}

// Location Node Component: Modern 3D Teardrop Pins with Metallic Bezel & Jewel Core
// Location Node Component: Modern 3D Teardrop Pins with Metallic Bezel & Jewel Core
function LocationNode({
  location,
  onSelect,
  isSelected,
  isHovered,
  onHover,
  activeCategory = 'all',
  activeSubcategory = 'all',
  activeStyle = 'realistic',
}) {
  const headGroupRef = useRef();
  const shadowRef = useRef();
  const ringRef = useRef();

  // Multi-Level Hierarchical Visibility Evaluation
  const isCategoryMatch = activeCategory === 'all' || location.categoryId === activeCategory;
  const isSubcategoryMatch = activeSubcategory === 'all' || location.subcategoryId === activeSubcategory;
  const isMatch = isCategoryMatch && isSubcategoryMatch;

  const activeColor = categoryColorMap[location.categoryId] || '#f59e0b';
  const texture = useCategoryTexture(location.categoryId, activeColor);
  const styleConfig = mapStyles[activeStyle] || mapStyles.realistic;
  const glowMultiplier = styleConfig.pinGlowMultiplier || 1.0;
  const labelPos = labelOffsets[location.id] || [0, 0.44, 0];

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Smooth sinusoidal bobbing, ground shadow scaling, and pulse ring
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const phaseOffset = location.position[0] * 1.8 + location.position[2] * 2.2;
    const bob = Math.sin(time * 2.4 + phaseOffset) * 0.014;

    if (headGroupRef.current) {
      headGroupRef.current.position.y = bob;
    }

    if (shadowRef.current) {
      const shadowScale = (1 - bob * 2.5) * (isMatch ? 1 : 0.6);
      shadowRef.current.scale.set(shadowScale, shadowScale, 1);
      if (shadowRef.current.material) {
        shadowRef.current.material.opacity = (0.36 - bob * 2.0) * (isMatch ? 1 : 0.1);
      }
    }

    if (ringRef.current) {
      const cycle = (time * 0.75 + phaseOffset * 0.3) % 1.0;
      const scale = (isMatch ? 0.6 : 0.4) + cycle * (isMatch ? 1.3 : 0.6);
      const opacity = (1 - cycle) * (isHovered || isSelected ? 0.85 : (isMatch ? 0.48 : 0.1)) * (activeStyle === 'night' ? 1.3 : 1.0);
      ringRef.current.scale.set(scale, scale, 1);
      if (ringRef.current.material) {
        ringRef.current.material.opacity = opacity;
      }
    }
  });

  const nodeScale = isMatch
    ? (isSelected ? 1.48 : (isHovered ? 1.28 : 1.20))
    : 0.55;

  return (
    <group
      position={location.position}
      scale={nodeScale}
      visible={true}
    >
      {/* 1. Soft Contact Shadow on Terrain */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.36}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Pinpoint Ground Anchor Target Dot & Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[0.012, 0.024, 24]} />
        <meshBasicMaterial
          color={isHovered || isSelected ? '#fbbf24' : activeColor}
          transparent
          opacity={isMatch ? 0.9 : 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Concentric Ground Radar Pulse */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}>
        <ringGeometry args={[0.02, 0.036, 32]} />
        <meshBasicMaterial
          color={isHovered || isSelected ? '#fbbf24' : activeColor}
          transparent
          opacity={isMatch ? 0.48 : 0.1}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Invisible 3D raycast hit cylinder for responsive click & hover */}
      <mesh
        position={[0, 0.22, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <cylinderGeometry args={[0.26, 0.26, 0.54, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 5. Floating Teardrop Pin Head & Bezel Group */}
      <group
        ref={headGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
      >
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          {/* Ambient Glow Halo */}
          <mesh position={[0, 0.25, -0.02]}>
            <circleGeometry args={[0.18, 32]} />
            <meshBasicMaterial
              color={isHovered || isSelected ? '#fbbf24' : activeColor}
              transparent
              opacity={(isHovered || isSelected ? 0.52 : 0.24) * glowMultiplier}
              depthWrite={false}
            />
          </mesh>

          {/* 3D Sculpted Teardrop Pin Body (Polished Platinum / Titanium Shell) */}
          <mesh geometry={getTeardropGeometry()} castShadow receiveShadow>
            <meshStandardMaterial
              color={isMatch ? (isHovered || isSelected ? '#fbbf24' : '#f8fafc') : '#94a3b8'}
              metalness={0.82}
              roughness={0.18}
              emissive={isHovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(isHovered || isSelected ? 0.40 : 0.12) * glowMultiplier}
            />
          </mesh>

          {/* Floating Metallic Pinpoint Tip Bead */}
          <mesh position={[0, 0.035, 0]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial
              color={isHovered || isSelected ? '#fbbf24' : '#cbd5e1'}
              metalness={0.95}
              roughness={0.10}
              emissive={isHovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(isHovered || isSelected ? 0.5 : 0.2) * glowMultiplier}
            />
          </mesh>

          {/* Polished Metallic Bezel Ring Framing the Jewel */}
          <mesh position={[0, 0.25, 0]}>
            <torusGeometry args={[0.070, 0.008, 16, 32]} />
            <meshStandardMaterial
              color={isHovered || isSelected ? '#fbbf24' : '#e2e8f0'}
              metalness={0.96}
              roughness={0.10}
              emissive={isHovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(isHovered || isSelected ? 0.60 : 0.25) * glowMultiplier}
            />
          </mesh>

          {/* Front Luminous Jewel Medallion with Category Icon Texture */}
          <mesh position={[0, 0.25, 0.003]}>
            <circleGeometry args={[0.066, 36]} />
            <meshStandardMaterial
              map={texture || undefined}
              color={texture ? '#ffffff' : activeColor}
              metalness={0.10}
              roughness={0.14}
              emissive={isHovered || isSelected ? '#fbbf24' : activeColor}
              emissiveIntensity={(isHovered || isSelected ? 0.60 : 0.35) * glowMultiplier}
            />
          </mesh>

          {/* Back Brushed Metallic Cover Plate */}
          <mesh position={[0, 0.25, -0.003]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.066, 36]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>
        </Billboard>
      </group>

      {/* 6. Unified Destination Map Overlay (Single Stable HTML Element) */}
      {!isSelected && isMatch && (
        <Html
          position={labelPos}
          center
          distanceFactor={7.0}
          zIndexRange={isHovered ? [990, 1000] : [100, 200]}
          className="pointer-events-auto select-none"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(location);
            }}
            onMouseEnter={() => {
              onHover(true);
              document.body.style.cursor = 'pointer';
            }}
            onMouseLeave={() => {
              onHover(false);
              document.body.style.cursor = 'auto';
            }}
            className="relative cursor-pointer transition-transform duration-200"
          >
            {isHovered ? (
              /* Rich Travel Badge when Hovered */
              <div
                className="flex flex-col items-center transform -translate-y-2 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  filter: activeStyle === 'night'
                    ? 'drop-shadow(0 14px 28px rgba(0,0,0,0.65))'
                    : 'drop-shadow(0 12px 24px rgba(15,23,42,0.18))',
                }}
              >
                <div
                  className="flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl border transition-all duration-200"
                  style={{
                    background: activeStyle === 'night'
                      ? 'rgba(24, 24, 27, 0.96)'
                      : 'rgba(255, 255, 255, 0.98)',
                    borderColor: activeStyle === 'night'
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'rgba(226, 232, 240, 0.95)',
                    boxShadow: activeStyle === 'night'
                      ? '0 10px 25px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                      : '0 10px 25px -4px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)',
                  }}
                >
                  {/* Clean Photo Thumbnail */}
                  <div
                    className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border"
                    style={{
                      borderColor: activeStyle === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={location.thumbnail}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Text */}
                  <div className="flex flex-col text-left pr-1 min-w-[110px] max-w-[170px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: activeColor }}
                      />
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider truncate"
                        style={{ color: activeStyle === 'night' ? '#a1a1aa' : '#64748b' }}
                      >
                        {shortTags[location.id] || location.subcategoryName || location.categoryName}
                      </span>
                    </div>

                    <h4
                      className="text-[13px] font-bold tracking-tight leading-tight truncate font-sans"
                      style={{ color: activeStyle === 'night' ? '#ffffff' : '#0f172a' }}
                    >
                      {location.name}
                    </h4>
                  </div>

                  {/* Action Chevron Circle */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: activeStyle === 'night'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(241, 245, 249, 1)',
                      color: activeStyle === 'night' ? '#e4e4e7' : '#475569',
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Clean Downward Pointer Arrow */}
                <div
                  className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                  style={{
                    borderTopColor: activeStyle === 'night'
                      ? 'rgba(24, 24, 27, 0.96)'
                      : 'rgba(255, 255, 255, 0.98)',
                  }}
                />
              </div>
            ) : (
              /* Sleek Persistent Pill Label when NOT Hovered */
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-200 hover:scale-105 shadow-md"
                style={{
                  backgroundColor: activeStyle === 'night'
                    ? 'rgba(15, 23, 42, 0.90)'
                    : 'rgba(255, 255, 255, 0.95)',
                  borderColor: activeStyle === 'night'
                    ? 'rgba(255, 255, 255, 0.16)'
                    : 'rgba(226, 232, 240, 0.95)',
                  color: activeStyle === 'night' ? '#f8fafc' : '#0f172a',
                  boxShadow: activeStyle === 'night'
                    ? '0 4px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.3)'
                    : '0 4px 14px rgba(15,23,42,0.15), 0 1px 3px rgba(15,23,42,0.06)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ backgroundColor: activeColor }}
                />
                <span className="text-[11px] font-bold tracking-tight whitespace-nowrap font-sans">
                  {destinationDisplayNames[location.id] || location.name}
                </span>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// GSAP Camera Fly-To & Free Cam Orbit Controller with Aspect Ratio Awareness
function CameraController({ targetPosition }) {
  const { camera, controls, size } = useThree();

  useEffect(() => {
    if (controls) {
      let destCam;
      let destTarget;

      // Aspect ratio compensation so vertical phone screens don't crop the island
      const aspect = size.width / Math.max(size.height, 1);
      const aspectMultiplier = aspect < 1.0 ? Math.min(1.8, 1.15 / aspect) : 1.0;

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
  }, [targetPosition, camera, controls, size.width, size.height]);

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

// Responsive R3F Canvas Viewport with Free Cam 3D Controls
export default function LankaScapeCanvas({
  selectedLocation,
  onSelectLocation,
  isCardAudioPlaying,
  activeCategory = 'all',
  activeSubcategory = 'all',
  activeStyle = 'realistic',
  isMuted = false,
}) {
  const styleConfig = mapStyles[activeStyle] || mapStyles.realistic;
  const [hoveredLocationId, setHoveredLocationId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const activeMusicRef = useRef(null);
  const currentMusicSrcRef = useRef(null);

  // Debounced hover manager: guarantees buttery smooth transition between 3D pin & DOM card
  const handleLocationHover = (locId, isHovering) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isHovering) {
      setHoveredLocationId(locId);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredLocationId((current) => (current === locId ? null : current));
      }, 140);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Immersive Location Music Theme & Ambient Island Sound System
  useEffect(() => {
    const defaultTrack = '/audio/sri-lanka-background.mp3';
    const locTheme = selectedLocation?.id ? destinationThemeMusic[selectedLocation.id]?.audioSrc : null;
    const targetTrack = locTheme || defaultTrack;

    // If already playing the target track, just update mute and volume
    if (currentMusicSrcRef.current === targetTrack && activeMusicRef.current) {
      activeMusicRef.current.muted = isMuted;
      activeMusicRef.current.volume = isCardAudioPlaying ? 0.08 : 0.38;
      return;
    }

    // Stop and clean up previous track
    const prevAudio = activeMusicRef.current;
    if (prevAudio) {
      try {
        prevAudio.pause();
        prevAudio.currentTime = 0;
      } catch (err) {
        // ignore
      }
      activeMusicRef.current = null;
    }

    currentMusicSrcRef.current = targetTrack;
    const newAudio = new Audio(targetTrack);
    newAudio.loop = true;
    newAudio.muted = isMuted;
    newAudio.volume = isCardAudioPlaying ? 0.08 : 0.38;
    activeMusicRef.current = newAudio;

    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy may defer until user gesture
        console.log('Audio playback waiting for user gesture:', err?.message || err);
      });
    }

    // Unlock audio on first user gesture if blocked
    const unlockOnGesture = () => {
      if (activeMusicRef.current) {
        activeMusicRef.current.play().then(() => {
          window.removeEventListener('pointerdown', unlockOnGesture);
          window.removeEventListener('keydown', unlockOnGesture);
        }).catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlockOnGesture);
    window.addEventListener('keydown', unlockOnGesture);

    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    };
  }, [selectedLocation?.id]);

  // Dynamic Mute Sync
  useEffect(() => {
    if (activeMusicRef.current) {
      activeMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Audio Ducking when destination card voice narration is playing
  useEffect(() => {
    if (activeMusicRef.current) {
      if (isCardAudioPlaying) {
        activeMusicRef.current.volume = 0.08;
      } else {
        activeMusicRef.current.volume = 0.38;
      }
    }
  }, [isCardAudioPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeMusicRef.current) {
        activeMusicRef.current.pause();
        activeMusicRef.current = null;
      }
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{
        position: [0, 12.0, 13.0],
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

      {/* 3D OrbitControls Configured for Free Cam */}
      <OrbitControls
        makeDefault
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={22.0}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 5.7, 1.0]}
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
      />

      {/* Render Location Raycast Nodes with Unified 3D Beacon Mesh */}
      {locations.map((loc) => (
        <LocationNode
          key={loc.id}
          location={loc}
          onSelect={onSelectLocation}
          isSelected={selectedLocation?.id === loc.id}
          isHovered={hoveredLocationId === loc.id}
          onHover={(isHovering) => handleLocationHover(loc.id, isHovering)}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          activeStyle={activeStyle}
        />
      ))}
    </Canvas>
  );
}

useGLTF.preload('/models/MPM-project_V4.glb');