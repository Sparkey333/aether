// Procedural placeholder textures (no DCC tools in this environment). Point-filtered, no mipmaps,
// small — exactly the bible's retro texture contract (≤128², point sample).
import * as THREE from 'three';

function finish(tex: THREE.DataTexture): THREE.DataTexture {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function makeChecker(size = 16, a = '#2a3242', b = '#1c2330'): THREE.DataTexture {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const c = (x ^ y) & 1 ? ca : cb;
      data[i] = c.r * 255;
      data[i + 1] = c.g * 255;
      data[i + 2] = c.b * 255;
      data[i + 3] = 255;
    }
  }
  return finish(new THREE.DataTexture(data, size, size));
}

export function makeNoise(size = 32, base = '#3a3140', amt = 28): THREE.DataTexture {
  const c = new THREE.Color(base);
  const data = new Uint8Array(size * size * 4);
  // deterministic value noise so all engines could match
  let seed = 0x6d2b79f5;
  const rnd = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), seed | 1) >>> 0) % 1000 / 1000;
    return seed;
  };
  for (let i = 0; i < size * size; i++) {
    const j = i * 4;
    const n = (rnd() - 0.5) * amt;
    data[j] = Math.max(0, Math.min(255, c.r * 255 + n));
    data[j + 1] = Math.max(0, Math.min(255, c.g * 255 + n));
    data[j + 2] = Math.max(0, Math.min(255, c.b * 255 + n));
    data[j + 3] = 255;
  }
  return finish(new THREE.DataTexture(data, size, size));
}
