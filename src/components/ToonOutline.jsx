import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

// Cartoon look for the map: hard-banded (cel) shading plus an ink outline around every model.
// The outline is an inverted hull drawn by three's OutlineEffect. It reacts to zoom:
//   zoomed in  -> thick, fully opaque, close to black
//   zoomed out -> thinner, shrinking away to nothing (colour stays black)

// camera distance (to the orbit target) at which the outline is fully "in" / fully "out"
const NEAR = 3.5; // closest zoom: full thickness (matches OrbitControls minDistance)
const FAR = 9;

const INK = [0.02, 0.02, 0.03]; // near black, always
const THICK_NEAR = 0.0032;
// the landmark models are packed with texture detail, so they get a thinner line than the island
const LANDMARK_SCALE = 0.4;
const THICK_FAR = 0.0; // fades out by shrinking to nothing (alpha blending made the map see-through)

let gradient = null;
function getGradient() {
  if (!gradient) {
    // four light bands; kept bright so the painted textures stay colourful
    const bands = [0.62, 0.78, 0.92, 1.0];
    const data = new Uint8Array(bands.map((b) => Math.round(b * 255)));
    gradient = new THREE.DataTexture(data, bands.length, 1, THREE.RedFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
}

// outline parameter objects we animate with zoom
const outlineParams = [];

// Swaps every mesh under `root` to a toon material that keeps its texture and colour.
export function toonify(root) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || o.material.isMeshToonMaterial) return;
    const old = o.material;
    const toon = new THREE.MeshToonMaterial({
      color: old.color ? old.color.clone() : new THREE.Color('#ffffff'),
      map: old.map || null,
      gradientMap: getGradient(),
      side: old.side,
      transparent: old.transparent,
      opacity: old.opacity,
      alphaTest: old.alphaTest,
      vertexColors: old.vertexColors,
    });
    if (o.name.toLowerCase().includes('sea')) {
      // the open-sea plane gets no outline
      toon.userData.outlineParameters = { visible: false };
    } else {
      const params = { thickness: THICK_NEAR, color: INK, alpha: 1, scale: o.name.toLowerCase().includes('island') ? 1 : LANDMARK_SCALE };
      toon.userData.outlineParameters = params;
      outlineParams.push(params);
    }
    o.material = toon;
  });
}

// Takes over rendering so the outline pass runs every frame.
export default function ToonOutline({ enabled = true }) {
  const gl = useThree((s) => s.gl);
  const effect = useMemo(() => new OutlineEffect(gl, { defaultThickness: THICK_NEAR }), [gl]);

  useFrame((state) => {
    const { scene, camera, controls } = state;
    const target = controls?.target;
    const dist = target ? camera.position.distanceTo(target) : camera.position.length();
    // 0 = max zoom in, 1 = zoomed out; thickness grows steadily as you zoom in
    const k = THREE.MathUtils.clamp((dist - NEAR) / (FAR - NEAR), 0, 1);

    const thickness = THREE.MathUtils.lerp(THICK_NEAR, THICK_FAR, k);
    for (const p of outlineParams) {
      p.thickness = thickness * p.scale;
    }
    effect.enabled = enabled; // off = plain render, no outline
    effect.render(scene, camera);
  }, 1);

  return null;
}
