// Procedural CanvasTextures — generated in code, no image files. Replaces
// the flat untextured primitives (a "lesson learned": bare boxes read as
// unfinished even in a greybox). Value-noise speckle + structural detail
// (cracks for ground, panel seams for metal) sold at PS2 texel budgets.
import * as THREE from 'three';

function makeCanvas(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d'), size };
}

function speckle(ctx, size, amount, light, dark) {
  for (let i = 0; i < amount; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.fillStyle = Math.random() > 0.5 ? light : dark;
    ctx.globalAlpha = 0.05 + Math.random() * 0.12;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;
}

function finish(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 1;
  tex.magFilter = THREE.NearestFilter; // keep the crunch
  return tex;
}

/** Cracked, dusty ground — sun-bleached wasteland floor. */
export function makeGround(base = '#6b5d47') {
  const { canvas, ctx, size } = makeCanvas(128);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, 900, '#8a7a5c', '#4a3f30');
  // hairline cracks
  ctx.strokeStyle = 'rgba(30,24,18,.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    let x = Math.random() * size, y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return finish(canvas);
}

/** Riveted metal panels — platforms and the Foundry look. */
export function makeMetal(base = '#4c5568') {
  const { canvas, ctx, size } = makeCanvas(128);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, 500, '#68728a', '#333a48');
  // panel seams
  ctx.strokeStyle = 'rgba(15,18,24,.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, size - 4, size - 4);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
  ctx.stroke();
  // rivets
  ctx.fillStyle = 'rgba(20,24,30,.8)';
  for (const [x, y] of [[12, 12], [size - 12, 12], [12, size - 12], [size - 12, size - 12], [size / 2, size / 2]]) {
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  }
  return finish(canvas);
}

/** Dark grimy blocks — arena cover, industrial detritus. */
export function makeGrime(base = '#383442') {
  const { canvas, ctx, size } = makeCanvas(128);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, 700, '#4a4658', '#221f2a');
  ctx.strokeStyle = 'rgba(10,8,14,.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, size - 6, size - 6);
  return finish(canvas);
}

/** Vertical gradient sky with a faint star dusting, for the sky dome. */
export function makeSky() {
  const { canvas, ctx, size } = makeCanvas(256);
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#05040a');
  grad.addColorStop(0.55, '#0d0a1a');
  grad.addColorStop(0.8, '#1a1220');
  grad.addColorStop(1, '#241826');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * size * 0.7;
    ctx.fillStyle = 'rgba(200,210,230,' + (0.1 + Math.random() * 0.5) + ')';
    ctx.fillRect(Math.random() * size, y, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/** Glowing rift disc — the Riftmaw torn in the sky (lore, made visible). */
export function makeRift() {
  const { canvas, ctx, size } = makeCanvas(256);
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, size / 2);
  grad.addColorStop(0, 'rgba(220,180,255,.95)');
  grad.addColorStop(0.35, 'rgba(140,51,217,.8)');
  grad.addColorStop(0.7, 'rgba(80,20,130,.35)');
  grad.addColorStop(1, 'rgba(40,10,70,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(cx, cy, size / 2, size / 2.6, 0, 0, Math.PI * 2); ctx.fill();
  // jagged tendrils
  ctx.strokeStyle = 'rgba(200,150,255,.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let x = cx, y = cy;
    for (let s = 0; s < 4; s++) {
      x += Math.cos(a) * 14 + (Math.random() - 0.5) * 16;
      y += Math.sin(a) * 12 + (Math.random() - 0.5) * 16;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
