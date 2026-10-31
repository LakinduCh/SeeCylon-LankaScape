import * as THREE from 'three';

const EMPTY = -999;

// Island area in map-world units; the ocean backdrop around it is far larger.
export const ISLAND_REGION = { minX: -3.6, maxX: 3.2, minZ: -5.0, maxZ: 5.3 };

// Clouds float above the island; anything whose lowest point is above this is
// left out of the capture so it can't hide the coast or count as land.
const CLOUD_MIN_Y = 6.0;

const heightMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: `
    varying float vY;
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vY = world.y;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: `
    varying float vY;
    void main() { gl_FragColor = vec4(vY, 0.0, 0.0, 1.0); }
  `,
});

function makeTopCamera(region, top) {
  const width = region.maxX - region.minX;
  const depth = region.maxZ - region.minZ;
  const cx = (region.minX + region.maxX) / 2;
  const cz = (region.minZ + region.maxZ) / 2;
  const cam = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0.1, 1000);
  cam.up.set(0, 0, -1);
  cam.position.set(cx, top, cz);
  cam.lookAt(cx, 0, cz);
  cam.updateMatrixWorld(true);
  return cam;
}

// Renders only the map (plus lights) from above into a target and reads pixels.
function renderTop(gl, rootScene, mapObject, region, width, height, options) {
  const { type, override, clear } = options;
  const target = new THREE.WebGLRenderTarget(width, height, {
    type,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: true,
  });
  const hidden = [];
  rootScene.children.forEach((child) => {
    if (child !== mapObject && !child.isLight && child.visible) {
      child.visible = false;
      hidden.push(child);
    }
  });
  mapObject.traverse((node) => {
    if (node.isMesh && node.visible && new THREE.Box3().setFromObject(node).min.y > CLOUD_MIN_Y) {
      node.visible = false;
      hidden.push(node);
    }
  });
  const prevOverride = rootScene.overrideMaterial;
  const prevTarget = gl.getRenderTarget();
  const prevClear = gl.getClearColor(new THREE.Color());
  const prevAlpha = gl.getClearAlpha();

  rootScene.overrideMaterial = override || null;
  gl.setRenderTarget(target);
  gl.setClearColor(clear, 1);
  gl.clear();
  gl.render(rootScene, makeTopCamera(region, 100));
  const data = type === THREE.FloatType ? new Float32Array(width * height * 4) : new Uint8Array(width * height * 4);
  gl.readRenderTargetPixels(target, 0, 0, width, height, data);

  gl.setRenderTarget(prevTarget);
  gl.setClearColor(prevClear, prevAlpha);
  rootScene.overrideMaterial = prevOverride;
  hidden.forEach((child) => { child.visible = true; });
  target.dispose();
  return data;
}

// Land is anything that is not the blue ocean: the island reads green/brown/white,
// the sea reads blue-dominant.
function isLandPixel(r, g, b) {
  return !(b > g * 1.05 && b > r * 1.3);
}

// Captures ground height and a land mask for the island once, so the walker can
// query them every frame without raycasting millions of triangles.
export function captureTerrain(gl, rootScene, mapObject, region = ISLAND_REGION, size = 768) {
  mapObject.updateMatrixWorld(true);
  const width = region.maxX - region.minX;
  const depth = region.maxZ - region.minZ;
  const w = size;
  const h = Math.round(size * (depth / width));

  const hData = renderTop(gl, rootScene, mapObject, region, w, h, {
    type: THREE.FloatType,
    override: heightMaterial,
    clear: new THREE.Color(EMPTY, 0, 0),
  });
  const cData = renderTop(gl, rootScene, mapObject, region, w, h, {
    type: THREE.UnsignedByteType,
    override: null,
    clear: new THREE.Color(0, 0, 0),
  });

  const heights = new Float32Array(w * h);
  const land = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    heights[i] = hData[i * 4];
    land[i] = isLandPixel(cData[i * 4], cData[i * 4 + 1], cData[i * 4 + 2]) && heights[i] > EMPTY / 2 ? 1 : 0;
  }

  function index(x, z) {
    const i = Math.floor(((x - region.minX) / width) * w);
    // Camera up is -Z, so buffer row 0 (bottom of the image) is the southern edge (maxZ).
    const j = Math.floor(((region.maxZ - z) / depth) * h);
    if (i < 0 || j < 0 || i >= w || j >= h) return -1;
    return j * w + i;
  }

  // The top surface includes tree canopies and rooftops. Find the raised blobs, tell trees
  // (green, walk through them) from solid objects (block him), and rebuild the real ground
  // under the trees from the terrain around them.
  const { ground, blocked, kind } = analyseSurface(heights, land, w, h, cData);

  return {
    region, w, h, heights, land, blocked, kind, colors: cData,
    isLand(x, z) {
      const k = index(x, z);
      return k >= 0 && land[k] === 1;
    },
    // Land that isn't a solid object (trees don't count: he walks through them)
    isWalkable(x, z) {
      const k = index(x, z);
      return k >= 0 && land[k] === 1 && blocked[k] === 0;
    },
    // Ground height under any trees at world (x, z); null off the captured area.
    heightAt(x, z) {
      const k = index(x, z);
      if (k < 0) return null;
      const v = ground[k];
      return v <= EMPTY / 2 ? null : v;
    },
  };
}

// Separable box blur that only averages land pixels.
function blurLand(heights, land, w, h, radius) {
  const sums = new Float32Array(w * h);
  const counts = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;
        const k = y * w + xx;
        if (land[k]) {
          sum += heights[k];
          n++;
        }
      }
      sums[y * w + x] = sum;
      counts[y * w + x] = n;
    }
  }
  const out = new Float32Array(w * h).fill(EMPTY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        sum += sums[yy * w + x];
        n += counts[yy * w + x];
      }
      if (n > 0) out[y * w + x] = sum / n;
    }
  }
  return out;
}

// Objects shorter than this above the ground are stepped over (grass, rocks, roots)
const OBSTACLE_HEIGHT = 0.06;
// A jump this big between two samples STEEP_STEP pixels apart is a wall, not a slope
const STEEP = 0.05;
const STEEP_STEP = 4;
// Window (in half-resolution pixels) wider than any tree canopy, used to find the ground
const OPEN_RADIUS = 11;
// Each blocked area is shrunk by this many full-resolution pixels so solid objects stop him
// at their wall, not a few pixels before it.
const SHRINK = 4;
// Non-green raised pixels are solid objects, but trunks and leaf shadows are non-green too.
// An opening of this radius (full-resolution pixels) drops anything thinner than a real wall.
const SOLID_OPEN = 6;
// Raised blobs are grown by this much before being cut out of the ground estimate, so the
// leafy fringe doesn't leak into the terrain height
const BLOB_GROW = 2;

const isFoliage = (r, g, b) => g > r * 1.08 && g > b * 1.08;

// Grey-scale min/max over a square window, ignoring invalid cells (separable).
function windowFilter(values, valid, w, h, r, takeMin) {
  const pass = (src, srcValid, horizontal) => {
    const out = new Float32Array(w * h);
    const outValid = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let best = takeMin ? Infinity : -Infinity;
        let any = false;
        for (let d = -r; d <= r; d++) {
          const xx = horizontal ? x + d : x;
          const yy = horizontal ? y : y + d;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const k = yy * w + xx;
          if (!srcValid[k]) continue;
          any = true;
          const v = src[k];
          if (takeMin ? v < best : v > best) best = v;
        }
        const k = y * w + x;
        out[k] = best;
        outValid[k] = any ? 1 : 0;
      }
    }
    return [out, outValid];
  };
  const [a, av] = pass(values, valid, true);
  return pass(a, av, false);
}

// kind[k]: 0 = open ground, 1 = tree (passable), 2 = non-green raised pixel (solid when thick)
function analyseSurface(heights, land, w, h, colors) {
  // Work at half resolution to keep the window filters cheap
  const hw = w >> 1;
  const hh = h >> 1;
  const top = new Float32Array(hw * hh);
  const valid = new Uint8Array(hw * hh);
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      let best = -Infinity;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const k = (y * 2 + dy) * w + (x * 2 + dx);
          if (land[k] && heights[k] > best) best = heights[k];
        }
      }
      if (best > -Infinity) {
        top[y * hw + x] = best;
        valid[y * hw + x] = 1;
      }
    }
  }
  // Opening = erode then dilate: removes bumps narrower than the window. Only used to
  // detect what is raised; the final ground comes from the terrain around each blob.
  const [eroded, erodedValid] = windowFilter(top, valid, hw, hh, OPEN_RADIUS, true);
  const [opened, openedValid] = windowFilter(eroded, erodedValid, hw, hh, OPEN_RADIUS, false);

  const raised = new Float32Array(w * h).fill(EMPTY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!land[k]) continue;
      const hk = Math.min(y >> 1, hh - 1) * hw + Math.min(x >> 1, hw - 1);
      raised[k] = openedValid[hk] ? Math.min(opened[hk], heights[k]) : heights[k];
    }
  }
  const detectGround = blurLand(raised, land, w, h, 3);

  const raw = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!land[k]) continue;
      if (heights[k] - detectGround[k] > OBSTACLE_HEIGHT) raw[k] = 1;
      const kx = k + STEEP_STEP;
      if (x + STEEP_STEP < w && land[kx] && Math.abs(heights[kx] - heights[k]) > STEEP) {
        raw[k] = 1;
        raw[kx] = 1;
      }
      const kz = k + STEEP_STEP * w;
      if (y + STEEP_STEP < h && land[kz] && Math.abs(heights[kz] - heights[k]) > STEEP) {
        raw[k] = 1;
        raw[kz] = 1;
      }
    }
  }

  // Raised green pixels are trees (he walks through them); raised pixels of any other color
  // are solid objects (temples, the dagoba, rocks) and block him.
  const all = new Uint8Array(w * h).fill(1);
  const [grown] = windowFilter(raw, all, w, h, BLOB_GROW, false);
  const kind = new Uint8Array(w * h);
  const solidRaw = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) {
    if (!land[k] || !raw[k]) continue;
    if (isFoliage(colors[k * 4], colors[k * 4 + 1], colors[k * 4 + 2])) {
      kind[k] = 1;
    } else {
      kind[k] = 2;
      solidRaw[k] = 1;
    }
  }
  const [thick] = windowFilter(solidRaw, all, w, h, SOLID_OPEN, true);
  const [solidOpened] = windowFilter(thick, all, w, h, SOLID_OPEN, false);
  const solid = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) solid[k] = solidOpened[k] > 0 && land[k] ? 1 : 0;

  // Ground = the terrain around every raised area, spread inwards. Unraised land keeps its own height.
  const gv = new Float32Array(hw * hh);
  const gValid = new Uint8Array(hw * hh);
  const gLand = new Uint8Array(hw * hh);
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      let sum = 0;
      let n = 0;
      let anyLand = false;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const k = (y * 2 + dy) * w + (x * 2 + dx);
          if (!land[k]) continue;
          anyLand = true;
          if (!(grown[k] > 0)) {
            sum += heights[k];
            n++;
          }
        }
      }
      const i = y * hw + x;
      gLand[i] = anyLand ? 1 : 0;
      if (n) {
        gv[i] = sum / n;
        gValid[i] = 1;
      }
    }
  }
  for (let pass = 0; pass < 160; pass++) {
    const nextV = gv.slice();
    const nextValid = gValid.slice();
    let changed = false;
    for (let y = 0; y < hh; y++) {
      for (let x = 0; x < hw; x++) {
        const i = y * hw + x;
        if (gValid[i] || !gLand[i]) continue;
        let sum = 0;
        let n = 0;
        if (x > 0 && gValid[i - 1]) { sum += gv[i - 1]; n++; }
        if (x < hw - 1 && gValid[i + 1]) { sum += gv[i + 1]; n++; }
        if (y > 0 && gValid[i - hw]) { sum += gv[i - hw]; n++; }
        if (y < hh - 1 && gValid[i + hw]) { sum += gv[i + hw]; n++; }
        if (n) {
          nextV[i] = sum / n;
          nextValid[i] = 1;
          changed = true;
        }
      }
    }
    gv.set(nextV);
    gValid.set(nextValid);
    if (!changed) break;
  }
  const floor = new Float32Array(w * h).fill(EMPTY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!land[k]) continue;
      const i = Math.min(y >> 1, hh - 1) * hw + Math.min(x >> 1, hw - 1);
      floor[k] = gValid[i] ? gv[i] : heights[k];
    }
  }
  const ground = blurLand(floor, land, w, h, 3);

  // Only solid objects block; shrink them so he stops at their wall
  const [core] = windowFilter(solid, all, w, h, SHRINK, true);
  const blocked = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) blocked[i] = core[i] > 0 && land[i] ? 1 : 0;
  return { ground, blocked, kind };
}
