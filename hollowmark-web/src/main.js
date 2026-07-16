// HOLLOWMARK — greybox slice (browser/Tauri prototype).
// A feel test of the Unity design in hollowmark/: movement, Splitfang cores,
// Hollow form, enemy waves, and the Vat-Thing. Primitives only, on purpose.
import * as THREE from 'three';

// ---------------------------------------------------------------- HUD
const byId = (id) => document.getElementById(id);
const hud = {
  hp: byId('hp').firstElementChild,
  hollow: byId('hollow').firstElementChild,
  cor: byId('cor').firstElementChild,
  coreName: byId('core-name'),
  ammo: byId('ammo'),
  sparks: byId('sparks-count'),
  bossWrap: byId('boss-wrap'),
  bossName: byId('boss-name'),
  boss: byId('boss').firstElementChild,
  announce: byId('announce'),
  death: byId('death'),
  overlay: byId('overlay'),
};
let announceTimer = null;
function announce(text) {
  hud.announce.textContent = text;
  hud.announce.style.opacity = 1;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => (hud.announce.style.opacity = 0), 1600);
}

// ---------------------------------------------------------------- renderer
const canvas = byId('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
const RETRO_SCALE = 0.35; // the PS2 lever: render tiny, upscale pixelated
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 300);
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(Math.max(2, Math.floor(w * RETRO_SCALE)), Math.max(2, Math.floor(h * RETRO_SCALE)), false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
scene.fog = new THREE.Fog(0x0a0a14, 40, 120);
scene.add(new THREE.HemisphereLight(0x8899bb, 0x221a26, 0.9));
const sun = new THREE.DirectionalLight(0xffe8c8, 1.1);
sun.position.set(20, 40, -15);
scene.add(sun);

// ---------------------------------------------------------------- input
const keys = new Set();
let lookDX = 0, lookDY = 0, mouseDown = false, locked = false;
let lastJumpPress = -99, dashPressed = false, meleePressed = false;

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys.add(e.code);
  if (e.code === 'Space') lastJumpPress = now;
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') dashPressed = true;
  if (e.code === 'KeyF') meleePressed = true;
  if (e.code === 'KeyQ') swapCore(-1);
  if (e.code === 'KeyE') swapCore(1);
  if (e.code === 'KeyT') toggleHollow();
  if (e.code === 'KeyR') refillAmmo();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('mousedown', () => { if (locked) { mouseDown = true; tryFire(); } });
window.addEventListener('mouseup', () => (mouseDown = false));
window.addEventListener('mousemove', (e) => {
  if (!locked) return;
  lookDX += e.movementX;
  lookDY += e.movementY;
});
hud.overlay.addEventListener('click', () => canvas.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  hud.overlay.style.display = locked ? 'none' : 'flex';
});

// ---------------------------------------------------------------- world
const solids = []; // { min, max } AABBs the player collides with
const solidMeshes = [];
function addBox(cx, cy, cz, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(cx, cy, cz);
  scene.add(mesh);
  solids.push({
    min: new THREE.Vector3(cx - sx / 2, cy - sy / 2, cz - sz / 2),
    max: new THREE.Vector3(cx + sx / 2, cy + sy / 2, cz + sz / 2),
  });
  solidMeshes.push(mesh);
  return mesh;
}

addBox(0, -0.5, 0, 80, 1, 80, 0x6b5d47); // ground slab
// platform gauntlet marching up +Z
addBox(0, 0.5, 8, 3, 1, 3, 0x4c5568);
addBox(3, 1.4, 13, 3, 1, 3, 0x4c5568);
addBox(0, 2.4, 18, 3, 1, 3, 0x4c5568);
addBox(-3, 3.4, 23, 3, 1, 3, 0x4c5568);
addBox(0, 4.2, 29, 6, 1, 6, 0x5a647a); // summit ledge
// arena cover
addBox(17, 0.75, 14, 1.5, 1.5, 1.5, 0x383442);
addBox(24, 0.75, 22, 1.5, 1.5, 1.5, 0x383442);
addBox(16, 0.75, 25, 2, 1.5, 1, 0x383442);

// ---------------------------------------------------------------- player
const P = {
  pos: new THREE.Vector3(0, 0, 0), // feet
  vel: new THREE.Vector3(),
  hx: 0.45, height: 1.7,
  grounded: false, lastGrounded: -99,
  doubleJump: true, airDash: true,
  dashUntil: -99, dashCooldownUntil: -99, dashDir: new THREE.Vector3(1, 0, 0),
  hp: 100, maxHp: 100, dead: false,
  staggerUntil: -99,
  moveMult: 1, meleeMult: 1, dmgTakenMult: 1,
};
const SPEED = 8, ACCEL = 60, DECEL = 70, AIR_CONTROL = 0.5, GRAVITY = -30;
const JUMP_V = Math.sqrt(2 * 30 * 2.2), DJUMP_V = Math.sqrt(2 * 30 * 1.8);
const COYOTE = 0.12, BUFFER = 0.12, DASH_SPEED = 20, DASH_TIME = 0.15, DASH_CD = 0.6;

const playerMat = new THREE.MeshLambertMaterial({ color: 0x26808c });
const playerMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 4, 10), playerMat);
const visor = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.14, 0.24),
  new THREE.MeshLambertMaterial({ color: 0x0a0a10 })
);
visor.position.set(0, 0.42, 0.4);
playerMesh.add(visor);
scene.add(playerMesh);

let respawnPoint = new THREE.Vector3(0, 0, 0);

function damagePlayer(amount, knockback) {
  if (P.dead) return;
  P.hp = Math.max(0, P.hp - amount * P.dmgTakenMult);
  if (knockback) P.vel.add(knockback);
  hud.hp.style.width = `${(P.hp / P.maxHp) * 100}%`;
  if (P.hp <= 0) die();
}
function die() {
  P.dead = true;
  if (hollow.on) exitHollow();
  hud.death.classList.add('on');
  setTimeout(() => {
    P.pos.copy(respawnPoint).add(new THREE.Vector3(0, 0.5, 0));
    P.vel.set(0, 0, 0);
    P.hp = P.maxHp;
    P.dead = false;
    hud.hp.style.width = '100%';
    hud.death.classList.remove('on');
  }, 2000);
}

// ---------------------------------------------------------------- camera orbit
let yaw = 0, pitch = 0.25;
const focus = new THREE.Vector3(0, 1.5, 0);
function updateCamera(dt) {
  yaw -= lookDX * 0.0022;
  pitch = THREE.MathUtils.clamp(pitch + lookDY * 0.0022, -0.65, 1.2);
  lookDX = lookDY = 0;
  const target = P.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
  focus.lerp(target, 1 - Math.exp(-12 * dt));
  const dir = new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)
  );
  camera.position.copy(focus).addScaledVector(dir, 5.5);
  camera.lookAt(focus);
}

// ---------------------------------------------------------------- combat
const CORES = [
  { name: 'MAW', dmg: 12, interval: 0.7, pellets: 8, spread: 12, range: 18, maxAmmo: 24, auto: false, color: 0xff8c26, kb: 6 },
  { name: 'LANCE', dmg: 45, interval: 0.5, pellets: 1, spread: 0, range: 60, maxAmmo: 30, auto: false, color: 0x33e6ff, kb: 3 },
  { name: 'SWARM', dmg: 6, interval: 0.08, pellets: 1, spread: 3, range: 40, maxAmmo: 200, auto: true, color: 0xccff4d, kb: 1 },
];
let coreIndex = 0;
const ammo = CORES.map((c) => c.maxAmmo);
let nextFire = 0;
const raycaster = new THREE.Raycaster();

function updateWeaponHud() {
  const core = CORES[coreIndex];
  hud.coreName.textContent = core.name;
  hud.ammo.textContent = `${ammo[coreIndex]} / ${core.maxAmmo}`;
}
function swapCore(dir) {
  coreIndex = (coreIndex + dir + CORES.length) % CORES.length;
  updateWeaponHud();
  announce(`CORE: ${CORES[coreIndex].name}`);
}
function refillAmmo() {
  for (let i = 0; i < CORES.length; i++) ammo[i] = CORES[i].maxAmmo;
  updateWeaponHud();
  announce('CORES REFILLED');
}
function tryFire() {
  const core = CORES[coreIndex];
  if (P.dead || now < nextFire) return;
  if (ammo[coreIndex] <= 0) { announce('CORE EMPTY — R TO REFILL'); nextFire = now + 0.4; return; }
  nextFire = now + core.interval;
  ammo[coreIndex]--;
  updateWeaponHud();

  const origin = camera.position.clone();
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const chest = P.pos.clone().add(new THREE.Vector3(0, 1.3, 0));

  for (let p = 0; p < core.pellets; p++) {
    const dir = forward.clone();
    if (core.spread > 0) {
      const s = THREE.MathUtils.degToRad(core.spread);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * s);
      dir.applyAxisAngle(camera.up.clone().cross(forward).normalize(), (Math.random() - 0.5) * s);
      dir.normalize();
    }
    raycaster.set(origin, dir);
    raycaster.far = core.range + 6; // camera sits behind the player
    const targets = enemies.filter((e) => !e.dead).map((e) => e.mesh);
    const hits = raycaster.intersectObjects([...solidMeshes, ...targets], false);
    let end = origin.clone().addScaledVector(dir, core.range + 6);
    for (const hit of hits) {
      end = hit.point;
      const enemy = hit.object.userData.enemy;
      if (enemy) enemy.damage(core.dmg, dir.clone().multiplyScalar(core.kb));
      break;
    }
    spawnTracer(chest, end, core.color);
  }
}
function melee() {
  if (P.dead || now < P.staggerUntil) return;
  const facing = new THREE.Vector3(Math.sin(playerMesh.rotation.y), 0, Math.cos(playerMesh.rotation.y));
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const to = enemy.pos.clone().sub(P.pos); to.y = 0;
    const dist = to.length();
    if (dist < 2.4 && to.normalize().dot(facing) > 0.2)
      enemy.damage(18 * P.meleeMult, to.multiplyScalar(8));
  }
  if (hollow.on && now >= hollow.nextLash) {
    hollow.nextLash = now + 3;
    spawnLash(P.pos.clone().add(new THREE.Vector3(0, 1, 0)));
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const to = enemy.pos.clone().sub(P.pos); to.y = 0;
      if (to.length() < 6) enemy.damage(40 * P.meleeMult, to.normalize().multiplyScalar(14));
    }
  }
}

// ---------------------------------------------------------------- effects
const effects = [];
function spawnTracer(from, to, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  effects.push({ mesh: line, ttl: 0.1, fade: material });
}
function spawnLash(center) {
  const material = new THREE.MeshBasicMaterial({ color: 0x8c33d9, transparent: true, opacity: 0.55 });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), material);
  sphere.position.copy(center);
  scene.add(sphere);
  effects.push({ mesh: sphere, ttl: 0.3, fade: material, grow: 38 });
}
function spawnRing(center, color, ttl, growTo) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 1, 24), material);
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(center).add(new THREE.Vector3(0, 0.06, 0));
  scene.add(ring);
  effects.push({ mesh: ring, ttl, fade: material, grow: growTo / ttl });
}
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const fx = effects[i];
    fx.ttl -= dt;
    if (fx.grow) fx.mesh.scale.addScalar(fx.grow * dt);
    if (fx.fade) fx.fade.opacity = Math.max(0, fx.fade.opacity - dt * 3);
    if (fx.ttl <= 0) {
      scene.remove(fx.mesh);
      fx.mesh.geometry.dispose();
      effects.splice(i, 1);
    }
  }
}

// ---------------------------------------------------------------- hollow form
const hollow = { meter: 0, cor: 0, on: false, nextLash: 0 };
function addHollow(amount) {
  hollow.meter = Math.min(100, hollow.meter + amount);
  hud.hollow.style.width = `${hollow.meter}%`;
}
function toggleHollow() {
  if (P.dead) return;
  if (hollow.on) { exitHollow(); return; }
  if (hollow.meter < 50) { announce('HOLLOW METER LOW'); return; }
  hollow.on = true;
  P.moveMult = 1.35; P.meleeMult = 2; P.dmgTakenMult = 0.5;
  playerMat.color.setHex(0x5a1a80);
  scene.fog.color.setHex(0x140a1e);
  announce('HOLLOW FORM');
}
function exitHollow() {
  hollow.on = false;
  P.moveMult = P.meleeMult = P.dmgTakenMult = 1;
  playerMat.color.setHex(0x26808c);
  scene.fog.color.setHex(0x0a0a14);
  playerMesh.scale.setScalar(1);
}
function updateHollow(dt) {
  if (hollow.on) {
    hollow.meter = Math.max(0, hollow.meter - 6 * dt);
    hollow.cor = Math.min(100, hollow.cor + 10 * dt);
    playerMesh.scale.setScalar(1 + Math.sin(now * 8) * 0.04);
    if (hollow.cor >= 100) {
      exitHollow();
      hollow.meter = 0; hollow.cor = 0;
      P.staggerUntil = now + 1.5;
      announce('LOST CONTROL');
    } else if (hollow.meter <= 0) exitHollow();
  } else if (hollow.cor > 0) {
    hollow.cor = Math.max(0, hollow.cor - 5 * dt);
  }
  hud.hollow.style.width = `${hollow.meter}%`;
  hud.cor.style.width = `${hollow.cor}%`;
}

// ---------------------------------------------------------------- sparks
let sparkCount = 0;
const sparks = [];
function spawnSpark(position) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 0),
    new THREE.MeshBasicMaterial({ color: 0xffd94d })
  );
  mesh.position.copy(position);
  scene.add(mesh);
  sparks.push({ mesh, base: position.clone(), phase: Math.random() * 6.28 });
}
function updateSparks(dt) {
  const chest = P.pos.clone().add(new THREE.Vector3(0, 1, 0));
  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];
    const dist = spark.mesh.position.distanceTo(chest);
    if (dist < 0.7) {
      scene.remove(spark.mesh);
      sparks.splice(i, 1);
      sparkCount++;
      hud.sparks.textContent = sparkCount;
      continue;
    }
    if (dist < 4) {
      spark.mesh.position.lerp(chest, Math.min(1, 10 * dt / dist));
    } else {
      spark.mesh.position.y = spark.base.y + 0.3 + Math.sin(now * 2.5 + spark.phase) * 0.15;
      spark.mesh.rotation.y += 2 * dt;
    }
  }
}
[[4, 0.3, 4], [8, 0.3, 8], [12, 0.3, 12], [0, 1.3, 8], [3, 2.2, 13], [0, 3.2, 18],
 [-3, 4.2, 23], [-1, 5, 29], [0, 5, 30], [1, 5, 29], [-10, 0.3, 12], [-14, 0.3, 18]]
  .forEach(([x, y, z]) => spawnSpark(new THREE.Vector3(x, y, z)));

// ---------------------------------------------------------------- checkpoints
const checkpoints = [
  { pos: new THREE.Vector3(0, 0, 5), lit: false, mesh: null },
  { pos: new THREE.Vector3(14, 0, 14), lit: false, mesh: null },
];
for (const checkpoint of checkpoints) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 2.4, 10),
    new THREE.MeshLambertMaterial({ color: 0x5a5a66 })
  );
  mesh.position.copy(checkpoint.pos).add(new THREE.Vector3(0, 1.2, 0));
  scene.add(mesh);
  checkpoint.mesh = mesh;
}
function updateCheckpoints() {
  for (const checkpoint of checkpoints) {
    if (checkpoint.lit) continue;
    if (P.pos.distanceTo(checkpoint.pos) < 2.5) {
      checkpoint.lit = true;
      checkpoint.mesh.material.color.setHex(0x33ff66);
      respawnPoint = checkpoint.pos.clone();
      announce('CHECKPOINT');
    }
  }
}

// ---------------------------------------------------------------- enemies
const enemies = [];
class Enemy {
  constructor(position, { big = false } = {}) {
    this.big = big;
    this.hp = big ? 400 : 40;
    this.maxHp = this.hp;
    this.speed = big ? 2.2 : 4.5;
    this.dead = false;
    this.pos = position.clone(); // feet
    this.push = new THREE.Vector3();
    this.nextTouch = 0;
    this.flashUntil = 0;
    this.slamAt = 0;
    this.slamTelegraphed = false;
    const radius = big ? 1.2 : 0.5;
    const material = new THREE.MeshLambertMaterial({ color: big ? 0x4d1f59 : 0x73331f });
    this.baseColor = material.color.getHex();
    this.mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, big ? 2 : 1, 4, 10), material);
    this.mesh.userData.enemy = this;
    this.halfHeight = big ? 2 : 1;
    scene.add(this.mesh);
    enemies.push(this);
  }
  damage(amount, knockback) {
    if (this.dead) return;
    this.hp -= amount;
    this.flashUntil = now + 0.1;
    this.mesh.material.color.setHex(0xffffff);
    if (knockback && !this.big) this.push.add(knockback);
    if (this.big) updateBossBar(this);
    if (this.hp <= 0) this.die();
  }
  die() {
    this.dead = true;
    addHollow(8);
    const drops = this.big ? 10 : 3;
    for (let i = 0; i < drops; i++) {
      const angle = (i / drops) * Math.PI * 2;
      spawnSpark(this.pos.clone().add(new THREE.Vector3(Math.cos(angle), 0.4, Math.sin(angle))));
    }
    if (this.big) { hud.bossWrap.style.display = 'none'; announce('THE VAT-THING FALLS'); }
    scene.remove(this.mesh);
  }
  update(dt) {
    if (this.dead || P.dead) return;
    if (now < this.flashUntil) { /* hold flash */ }
    else this.mesh.material.color.setHex(this.baseColor);

    const to = P.pos.clone().sub(this.pos); to.y = 0;
    const dist = to.length();

    if (this.big && dist < 14 && now >= this.slamAt) {
      if (!this.slamTelegraphed) {
        this.slamTelegraphed = true;
        this.slamAt = now + 0.6;
        spawnRing(this.pos.clone(), 0xff5522, 0.6, 9);
      } else {
        this.slamTelegraphed = false;
        this.slamAt = now + (this.hp < this.maxHp / 2 ? 2.4 : 4);
        if (dist < 4.5 && P.pos.y < this.pos.y + 1.2)
          damagePlayer(25, to.clone().normalize().multiplyScalar(10).setY(6));
      }
    }

    if (dist > (this.big ? 3 : 1.1)) {
      to.normalize();
      this.pos.addScaledVector(to, this.speed * dt);
      this.mesh.rotation.y = Math.atan2(to.x, to.z);
    } else if (!this.big && now >= this.nextTouch) {
      this.nextTouch = now + 0.9;
      damagePlayer(12, to.clone().normalize().multiplyScalar(5).setY(3));
    }

    this.pos.addScaledVector(this.push, dt * 6);
    this.push.multiplyScalar(Math.max(0, 1 - 8 * dt));
    this.pos.y = 0; // greybox ground dwellers
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, -39, 39);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, -39, 39);
    this.mesh.position.copy(this.pos).add(new THREE.Vector3(0, this.halfHeight, 0));
  }
}
function updateBossBar(boss) {
  hud.bossWrap.style.display = 'block';
  hud.bossName.textContent = 'THE VAT-THING';
  hud.boss.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
}

// arena waves + boss
const arenaCenter = new THREE.Vector3(20, 0, 20);
const waves = [3, 5];
let waveIndex = -1, arenaStarted = false, arenaDone = false;
let boss = null, bossAwake = false;
function updateArena() {
  if (!arenaStarted) {
    if (P.pos.distanceTo(arenaCenter) < 12) {
      arenaStarted = true;
      waveIndex = 0;
      startWave();
    }
    return;
  }
  if (arenaDone) return;
  const waveAlive = enemies.some((e) => !e.dead && !e.big);
  if (!waveAlive) {
    waveIndex++;
    if (waveIndex < waves.length) startWave();
    else {
      arenaDone = true;
      announce('ARENA CLEAR');
      for (let i = 0; i < 6; i++)
        spawnSpark(arenaCenter.clone().add(new THREE.Vector3(Math.cos(i) * 2, 0.4, Math.sin(i) * 2)));
    }
  }
}
function startWave() {
  announce(`WAVE ${waveIndex + 1}`);
  const count = waves[waveIndex];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    new Enemy(arenaCenter.clone().add(new THREE.Vector3(Math.cos(angle) * 7, 0, Math.sin(angle) * 7)));
  }
}
boss = new Enemy(new THREE.Vector3(28, 0, -26), { big: true });
function updateBoss() {
  if (!bossAwake && !boss.dead && P.pos.distanceTo(boss.pos) < 18) {
    bossAwake = true;
    announce('THE VAT-THING');
    updateBossBar(boss);
  }
}

// ---------------------------------------------------------------- player physics
function playerAabb() {
  return {
    min: new THREE.Vector3(P.pos.x - P.hx, P.pos.y, P.pos.z - P.hx),
    max: new THREE.Vector3(P.pos.x + P.hx, P.pos.y + P.height, P.pos.z + P.hx),
  };
}
function collide() {
  P.grounded = false;
  for (const solid of solids) {
    const box = playerAabb();
    const ox = Math.min(box.max.x, solid.max.x) - Math.max(box.min.x, solid.min.x);
    const oy = Math.min(box.max.y, solid.max.y) - Math.max(box.min.y, solid.min.y);
    const oz = Math.min(box.max.z, solid.max.z) - Math.max(box.min.z, solid.min.z);
    if (ox <= 0 || oy <= 0 || oz <= 0) continue;

    if (oy <= ox && oy <= oz) {
      const center = (solid.min.y + solid.max.y) / 2;
      if (P.pos.y + P.height / 2 > center) {
        P.pos.y = solid.max.y;
        if (P.vel.y <= 0) { P.vel.y = 0; P.grounded = true; }
      } else {
        P.pos.y = solid.min.y - P.height;
        P.vel.y = Math.min(0, P.vel.y);
      }
    } else if (ox <= oz) {
      P.pos.x += (P.pos.x > (solid.min.x + solid.max.x) / 2 ? ox : -ox);
    } else {
      P.pos.z += (P.pos.z > (solid.min.z + solid.max.z) / 2 ? oz : -oz);
    }
  }
}
function updatePlayer(dt) {
  const stunned = P.dead || now < P.staggerUntil;
  // camera-relative wish direction
  let wishX = 0, wishZ = 0;
  if (!stunned && locked) {
    if (keys.has('KeyW')) wishZ += 1;
    if (keys.has('KeyS')) wishZ -= 1;
    if (keys.has('KeyA')) wishX -= 1;
    if (keys.has('KeyD')) wishX += 1;
  }
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(-forward.z, 0, forward.x);
  const wish = new THREE.Vector3()
    .addScaledVector(forward, wishZ)
    .addScaledVector(right, wishX);
  if (wish.lengthSq() > 1) wish.normalize();

  const dashing = now < P.dashUntil;
  const target = wish.clone().multiplyScalar(SPEED * P.moveMult);
  const horizontal = new THREE.Vector3(P.vel.x, 0, P.vel.z);
  const rate = (target.lengthSq() > horizontal.lengthSq() ? ACCEL : DECEL) * (P.grounded ? 1 : AIR_CONTROL);
  horizontal.x = THREE.MathUtils.damp(horizontal.x, target.x, rate / SPEED, dt);
  horizontal.z = THREE.MathUtils.damp(horizontal.z, target.z, rate / SPEED, dt);

  if (dashing) {
    horizontal.copy(P.dashDir).multiplyScalar(DASH_SPEED);
    P.vel.y = 0;
  } else {
    P.vel.y = Math.max(-40, P.vel.y + GRAVITY * dt);
  }
  P.vel.x = horizontal.x;
  P.vel.z = horizontal.z;

  // buffered / coyote jump
  if (!stunned && now - lastJumpPress <= BUFFER) {
    const canGround = P.grounded || now - P.lastGrounded <= COYOTE;
    if (canGround) {
      P.vel.y = JUMP_V; lastJumpPress = -99; P.lastGrounded = -99;
    } else if (P.doubleJump) {
      P.doubleJump = false; P.vel.y = DJUMP_V; lastJumpPress = -99;
    }
  }
  if (!keys.has('Space') && P.vel.y > 0 && !dashing) P.vel.y *= Math.pow(0.5, dt * 10); // jump cut

  // dash
  if (dashPressed) {
    dashPressed = false;
    if (!stunned && now >= P.dashCooldownUntil && (P.grounded || P.airDash)) {
      P.dashDir.copy(wish.lengthSq() > 0.01 ? wish.clone().normalize()
        : new THREE.Vector3(Math.sin(playerMesh.rotation.y), 0, Math.cos(playerMesh.rotation.y)));
      P.dashUntil = now + DASH_TIME;
      P.dashCooldownUntil = now + DASH_CD;
      if (!P.grounded) P.airDash = false;
      P.vel.y = 0;
    }
  }
  if (meleePressed) { meleePressed = false; if (!stunned) melee(); }
  if (mouseDown && CORES[coreIndex].auto && !stunned) tryFire();

  P.pos.addScaledVector(P.vel, dt);
  collide();
  if (P.pos.y < -12) { damagePlayer(9999); } // fell off the world
  if (P.grounded) { P.lastGrounded = now; P.doubleJump = true; P.airDash = true; }

  // facing + mesh
  const face = dashing ? P.dashDir : wish;
  if (face.lengthSq() > 0.01) {
    const targetYaw = Math.atan2(face.x, face.z);
    let delta = targetYaw - playerMesh.rotation.y;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    playerMesh.rotation.y += delta * Math.min(1, 14 * dt);
  }
  playerMesh.position.copy(P.pos).add(new THREE.Vector3(0, 0.85, 0));
}

// ---------------------------------------------------------------- main loop
let now = 0;
const clock = new THREE.Clock();
updateWeaponHud();
resize();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  now += dt;
  updatePlayer(dt);
  updateCamera(dt);
  updateHollow(dt);
  updateSparks(dt);
  updateCheckpoints();
  updateArena();
  updateBoss();
  for (const enemy of enemies) enemy.update(dt);
  updateEffects(dt);
  renderer.render(scene, camera);
}
frame();
