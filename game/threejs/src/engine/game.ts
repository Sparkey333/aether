// Single-player game singleton: owns the fixed-step loop, input, seeded RNG, the player, the enemy
// encounter, lock-on, and hit resolution. Systems run in a fixed order (part of the determinism
// contract): input -> lock-on/camera -> player -> enemies -> hit resolution -> soft body separation.
import { GameLoop } from '@/engine/GameLoop';
import { InputManager } from '@/input/InputManager';
import { Rng } from '@/engine/Rng';
import { PlayerController, type PlayerInput } from '@/actors/CharacterController';
import { Enemy } from '@/combat/Enemy';
import { LockOn } from '@/combat/LockOn';
import { HitResolution } from '@/combat/HitResolution';
import { applyLook, type CamState } from '@/render/camera/ThirdPersonCamera';
import type { DesignData } from '@/data/types';

class Game {
  loop = new GameLoop();
  input = new InputManager();
  rng = new Rng(1);
  player: PlayerController | null = null;
  enemies: Enemy[] = [];
  lockOn: LockOn | null = null;
  hits: HitResolution | null = null;
  cam: CamState = { yaw: Math.PI, pitch: 0.32 };
  data: DesignData | null = null;
  private started = false;

  start(data: DesignData): void {
    if (this.started) return;
    this.data = data;
    this.rng = new Rng(data.combat.prngSeed);
    this.input = new InputManager(data.combat.inputBufferFrames);
    const weapon = data.weapons.get('geomancers-edge')!;
    this.player = new PlayerController(data.combat, data.moves, weapon);
    this.lockOn = new LockOn(data.combat);
    this.hits = new HitResolution(data.combat);
    this.spawnEncounter(data);

    this.loop.addSystem((dt, frame) => this.fixedStep(dt, frame));
    this.started = true;
  }

  private fixedStep(dt: number, frame: number): void {
    const p = this.player!;
    this.input.beginFixedStep(frame);
    const [lx, ly] = this.input.consumeLook();

    // ---- lock-on ----
    if (this.input.consume('LockOn')) this.lockOn!.toggle(p.x, p.z, this.cam.yaw, this.enemies);
    if (this.input.consume('TargetSwitchLeft')) this.lockOn!.switchTarget(-1, p.x, p.z, this.enemies);
    if (this.input.consume('TargetSwitchRight')) this.lockOn!.switchTarget(1, p.x, p.z, this.enemies);
    this.lockOn!.update(p.x, p.z);
    const target = this.lockOn!.target;

    // ---- camera ----
    if (target) {
      const desired = Math.atan2(target.x - p.x, target.z - p.z);
      let d = desired - this.cam.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.cam.yaw += d * 0.2;
    } else {
      applyLook(this.cam, lx, ly);
    }

    // ---- player ----
    const input: PlayerInput = {
      move: this.input.moveVector(),
      sprint: this.input.isHeld('Sprint'),
      dodge: this.input.consume('Dodge'),
      light: this.input.consume('LightAttack'),
      heavy: this.input.consume('HeavyAttack'),
      block: this.input.isHeld('Block'),
      parry: this.input.consume('Parry'),
      special1: this.input.consume('Special1'),
      special2: this.input.consume('Special2'),
      cauterize: this.input.consume('Cauterize'),
    };
    p.step(dt, input, this.cam.yaw, target ? { x: target.x, z: target.z } : null);

    // ---- enemies ----
    const ptrans = { x: p.x, z: p.z, alive: p.alive() };
    for (const e of this.enemies) e.step(dt, ptrans, this.rng);

    // ---- hit resolution ----
    this.hits!.step([p, ...this.enemies]);

    // ---- soft body separation (no walking through each other) ----
    this.separate();
  }

  private separate(): void {
    const p = this.player!;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e.alive()) continue;
      // player vs enemy
      pushApart(p, e, p.radius + e.hurtRadius);
      for (let j = i + 1; j < this.enemies.length; j++) {
        const o = this.enemies[j];
        if (!o.alive()) continue;
        pushApart(e, o, e.hurtRadius + o.hurtRadius);
      }
    }
  }

  private spawnEncounter(data: DesignData): void {
    // M3 encounter: two Husks + a Stone Sentinel to exercise the full combat loop vs. real AI.
    this.enemies = [
      new Enemy('husk-1', data.enemies.get('husk')!, data.moves, data.combat, -3, -2),
      new Enemy('husk-2', data.enemies.get('husk')!, data.moves, data.combat, 4, -3),
      new Enemy('sentinel-1', data.enemies.get('stone-sentinel')!, data.moves, data.combat, 0, -9),
    ];
  }

  nearestEnemy(): Enemy | null {
    const p = this.player;
    if (!p) return null;
    let best: Enemy | null = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      if (!e.alive()) continue;
      const d = (e.x - p.x) ** 2 + (e.z - p.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  /** HUD snapshot pushed to the store each render frame. */
  hudSnapshot(): Record<string, unknown> {
    const p = this.player;
    if (!p || !this.data) return {};
    const t = (this.lockOn?.target as Enemy | null) ?? this.nearestEnemy();
    return {
      hp: p.health.current,
      hpMax: p.health.max,
      stamina: p.stamina,
      staminaMax: this.data.combat.player.stamina.max,
      aether: p.aether.current,
      aetherMax: p.aether.max,
      poise: p.poise.current,
      poiseMax: p.poise.max,
      flowFp: p.flow.fp,
      flowMax: this.data.combat.flow.maxFp,
      flowRank: p.flow.rankName(),
      cauterized: p.combat.cauterized,
      lockedOn: this.lockOn?.active ?? false,
      targetName: t ? t.displayName : null,
      targetHpPct: t ? t.health.pct : 0,
      targetIsBoss: false,
    };
  }
}

function pushApart(
  a: { x: number; z: number },
  b: { x: number; z: number },
  minDist: number,
): void {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  const d = Math.hypot(dx, dz);
  if (d >= minDist || d < 1e-4) return;
  const push = (minDist - d) / 2;
  const nx = dx / d;
  const nz = dz / d;
  a.x += nx * push;
  a.z += nz * push;
  b.x -= nx * push;
  b.z -= nz * push;
}

export const game = new Game();
