import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html, useProgress, Billboard } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import locations from '../data/locations.json';
import { mapStyles } from '../data/mapStyles';
import { destinationThemeMusic } from '../data/destinationMusic';
import SkyDome, { HORIZON_COLOR } from './SkyDome';
import ToonOutline, { toonify } from './ToonOutline';
import GameLayer from './GameLayer';

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
  const { scene, animations } = useGLTF('/models/MPM-project_V6.glb');
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

      toonify(scene);
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
      position={[0.03, 5.3, 0.28]}
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
  anuradhapura: 'Ancient Capital',
  minneriya: 'Elephant Gathering',
  nallur: 'Sacred Kovil',
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
  anuradhapura: 'Anuradhapura',
  minneriya: 'Minneriya',
  nallur: 'Nallur Kovil',
};

const labelOffsets = {
  // Northern Region
  delft: [-0.08, 0.44, 0],
  nallur: [0.08, 0.46, 0],
  wilpattu: [-0.08, 0.44, 0],
  anuradhapura: [0.02, 0.52, -0.06],
  sigiriya: [-0.10, 0.42, 0.04],
  minneriya: [0.12, 0.44, 0],

  // Central Region
  pinnawala: [-0.14, 0.46, 0],
  kandy: [0.10, 0.46, -0.04],
  lotustower: [-0.10, 0.46, 0],

  // Highland Region
  adamspeak: [-0.08, 0.48, 0.06],
  horton: [0, 0.42, 0.06],
  ella: [0.12, 0.48, -0.02],

  // Eastern & Southern Coastal Region
  arugambay: [0.08, 0.44, 0],
  yala: [0.08, 0.46, 0],
  galle: [-0.08, 0.46, 0],
  mirissa: [0.08, 0.42, 0],
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
  const labelPos = [0, 0.2, 0];

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
    ? (isSelected ? 1.5 : (isHovered ? 1.4 : 1.0))
    : 0.6;

  return (
    <group
      position={location.position}
      scale={nodeScale}
      visible={true}
    >
      {/* 4. Invisible 3D raycast hit cylinder for responsive click & hover */}
      <mesh
        position={[0, 0.07, 0]}
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
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} userData={{ outlineParameters: { visible: false } }} />
      </mesh>

      {/* 5. Small flat map dot: dark outline, category colour, tiny white centre */}
      <Billboard position={[0, 0.07, 0]}>
        <mesh>
          <circleGeometry args={[0.052, 28]} />
          <meshBasicMaterial color="#0b3d4a" transparent opacity={isMatch ? 0.9 : 0.3} depthWrite={false} fog={false} userData={{ outlineParameters: { visible: false } }} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[0.038, 28]} />
          <meshBasicMaterial color={isHovered || isSelected ? '#ffd83d' : activeColor} transparent opacity={isMatch ? 0.95 : 0.35} depthWrite={false} fog={false} userData={{ outlineParameters: { visible: false } }} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <circleGeometry args={[0.013, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={isMatch ? 0.95 : 0.35} depthWrite={false} fog={false} userData={{ outlineParameters: { visible: false } }} />
        </mesh>
      </Billboard>

      {/* 6. Hover-only cartoon name tag */}
      {!isSelected && isMatch && isHovered && (
        <Html
          position={labelPos}
          center
          distanceFactor={7.0}
          zIndexRange={[990, 1000]}
          className="pointer-events-none select-none"
        >
          <div className="cartoon-name-tag" style={{ '--tag-color': activeColor }}>
            <span className="cartoon-name-dot" />
            <span className="cartoon-name-text">
              {destinationDisplayNames[location.id] || location.name}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// GSAP Camera Fly-To & Free Cam Orbit Controller with Aspect Ratio Awareness
function CameraController({ targetPosition, gameMode = false }) {
  const { camera, controls, size } = useThree();

  useEffect(() => {
    if (controls && !gameMode) {
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
  }, [targetPosition, camera, controls, size.width, size.height, gameMode]);

  // Keep camera pan smoothly bounded within the ocean frame
  useFrame(() => {
    if (controls && !gameMode) {
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
  outlineEnabled = true,
  gameMode = false,
  onNearPlace,
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
      if (gameMode) {
        activeMusicRef.current.volume = 0.14;
      } else if (isCardAudioPlaying) {
        activeMusicRef.current.volume = 0.08;
      } else {
        activeMusicRef.current.volume = 0.38;
      }
    }
  }, [isCardAudioPlaying, gameMode]);

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
        position: [0, 11.0, 12.5],
        fov: 48,
      }}
      className={`w-full h-screen transition-colors duration-500 ${styleConfig.bgClass}`}
    >
      <ToonOutline enabled={outlineEnabled} />

      {/* Day sky + haze that melts the sea's far edge into the horizon */}
      {activeStyle === 'night' ? (
        <fog attach="fog" args={['#0b1020', 24, 44]} />
      ) : (
        <>
          <SkyDome />
          <fog attach="fog" args={[HORIZON_COLOR, 24, 44]} />
        </>
      )}

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
        enabled={!gameMode}
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={15.0}
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
        gameMode={gameMode}
      />

      {gameMode && (
        <Suspense fallback={null}>
          <GameLayer isMuted={isMuted} onNear={onNearPlace} />
        </Suspense>
      )}

      {/* Render Location Raycast Nodes with Unified 3D Beacon Mesh */}
      {!gameMode && locations.map((loc) => (
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

useGLTF.preload('/models/MPM-project_V6.glb');