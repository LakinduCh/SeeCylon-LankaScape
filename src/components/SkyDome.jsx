import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Colour at the horizon. The scene fog uses the same value, so the far edge of the sea
// dissolves into the sky instead of ending in a hard line.
export const HORIZON_COLOR = '#d6ecf8';

// Cartoon sky: an inside-out sphere with a gradient painted in hard colour bands, puffy
// flat-shaded clouds with a soft blue underside and a thin ink edge, and a flat sun with a
// halo ring. Below the horizon it keeps the horizon colour so there is no seam behind the sea.
const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vDir;
  uniform float uTime;
  uniform vec3 uHorizon;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  // few octaves on purpose: big round puffs, not wispy detail
  float puff(vec2 p) {
    float v = 0.0, a = 0.55;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.45; }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir); // re-normalise per pixel so shapes are not faceted by the sphere mesh
    // camera looks down at the map: stretch the visible slice (a bit below the horizon upward) over the whole sky
    float h = clamp((dir.y + 0.16) * 2.4, 0.0, 1.0);

    // gradient quantised into flat colour bands
    float band = floor(pow(h, 0.65) * 6.0);
    vec3 c0 = uHorizon;
    vec3 c1 = vec3(0.70, 0.88, 0.98);
    vec3 c2 = vec3(0.55, 0.81, 0.98);
    vec3 c3 = vec3(0.40, 0.73, 0.96);
    vec3 c4 = vec3(0.27, 0.64, 0.94);
    vec3 c5 = vec3(0.18, 0.55, 0.90);
    vec3 col = c0;
    if (band >= 1.0) col = c1;
    if (band >= 2.0) col = c2;
    if (band >= 3.0) col = c3;
    if (band >= 4.0) col = c4;
    if (band >= 5.0) col = c5;

    // flat sun with a halo ring
    vec3 sunDir = normalize(vec3(-0.32, -0.032, -0.95));
    float d = dot(dir, sunDir);
    col = mix(col, vec3(1.0, 0.97, 0.78), smoothstep(0.9984, 0.9986, d) * 0.55);
    col = mix(col, vec3(1.0, 0.86, 0.35), smoothstep(0.99925, 0.99935, d));

    // puffy cartoon clouds
    if (h > 0.12) {
      vec2 uv = vec2(atan(dir.x, -dir.z) * 1.6, h * 2.6) + vec2(uTime * 0.01, 0.0);
      float f = puff(uv * 1.5);
      float fSh = puff(uv * 1.5 + vec2(0.0, 0.16)); // same cloud nudged: gives a flat underside
      float body = step(0.52, f);
      float edge = step(0.495, f) - body;        // thin rim just outside the white
      float under = body * (1.0 - step(0.52, fSh)); // lower lip of each puff
      float fade = smoothstep(0.12, 0.24, h);
      vec3 white = vec3(1.0);
      vec3 shade = vec3(0.80, 0.90, 0.99);
      vec3 ink = vec3(0.45, 0.62, 0.82);
      vec3 cloud = mix(white, shade, under);
      col = mix(col, ink, edge * fade * 0.8);
      col = mix(col, cloud, body * fade);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        userData: { outlineParameters: { visible: false } },
        uniforms: {
          uTime: { value: 0 },
          uHorizon: { value: new THREE.Color(HORIZON_COLOR) },
        },
      }),
    []
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh renderOrder={-1000} frustumCulled={false} material={material}>
      <sphereGeometry args={[150, 96, 64]} />
    </mesh>
  );
}
