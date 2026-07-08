// Enemy actor: a CombatActor with health/poise/hurtbox, knockback, and a small deterministic AI
// (chase / kite / hyper-armor-punish from enemies.json). Attack selection uses the shared seeded Rng
// so behavior is identical across the three engine builds. Bosses (M5/M6) reuse this same shape.
import type { EnemyConfig, Move, CombatConstants } from '@/data/types';
import type { Rng } from '@/engine/Rng';
import { collision } from '@/world/collision';
import { Health } from './Health';
import { Poise } from './Poise';
import { MoveRunner, type ActiveHit } from './MoveRunner';
import { resolveIncoming, type CombatActor, type DefenseState, type Incoming, type HitOutcome } from './actor';

export interface PlayerTransform {
  x: number;
  z: number;
  alive: boolean;
}

const SIZES: Record<string, { r: number; h: number; scale: number }> = {
  husk: { r: 0.45, h: 1.85, scale: 1.0 },
  'sundered-acolyte': { r: 0.42, h: 1.8, scale: 0.95 },
  'stone-sentinel': { r: 0.7, h: 2.3, scale: 1.4 },
};

export class Enemy implements CombatActor {
  readonly team = 'enemy' as const;
  x: number; y = 0; z: number; yaw = 0;
  prevX: number; prevZ: number; prevYaw = 0;
  hurtRadius: number;
  hurtHeight: number;
  scale: number;
  readonly displayName: string;
  health: Health;
  poise: Poise;
  freezeFrames = 0;
  state: 'idle' | 'move' | 'attack' | 'stagger' | 'dead' = 'idle';
  runner: MoveRunner | null = null;
  deadFrames = 0;

  private kbX = 0;
  private kbZ = 0;
  private cooldowns: Record<string, number> = {};

  constructor(
    readonly id: string,
    private cfg: EnemyConfig,
    private moves: Map<string, Move>,
    private c: CombatConstants,
    spawnX: number,
    spawnZ: number,
  ) {
    const size = SIZES[cfg.id] ?? { r: 0.5, h: 1.9, scale: 1.0 };
    this.hurtRadius = size.r;
    this.hurtHeight = size.h;
    this.scale = size.scale;
    this.displayName = cfg.name;
    this.x = spawnX;
    this.z = spawnZ;
    this.prevX = spawnX;
    this.prevZ = spawnZ;
    this.health = new Health(cfg.hp);
    this.poise = new Poise(cfg.poise, cfg.poiseRegenPerSec ?? 12, this.c.player.poise.regenDelaySec);
  }

  alive(): boolean {
    return !this.health.dead;
  }

  defense(): DefenseState {
    return { iframe: false, hyperArmor: this.runner?.hyperArmor() ?? false, blocking: false, parry: false };
  }

  activeHits(): ActiveHit[] {
    return this.runner ? this.runner.activeHits(this.x, this.y, this.z, this.yaw) : [];
  }

  receiveHit(inc: Incoming): HitOutcome {
    const out = resolveIncoming(this, this.defense(), inc, this.c);
    if (out.staggered) {
      this.runner = null;
      this.state = 'stagger';
    }
    return out;
  }

  outgoingMult(): number {
    return 1;
  }

  onLandHit(): void {
    /* enemies do not build Flow */
  }

  onParried(): void {
    // player parried this enemy — force a big stagger (the parry payoff)
    this.poise.staggerFrames = Math.max(this.poise.staggerFrames, 120);
    this.runner = null;
    this.state = 'stagger';
  }

  setFreeze(frames: number): void {
    this.freezeFrames = Math.max(this.freezeFrames, frames);
  }

  applyKnockback(dx: number, dz: number, force: number): void {
    this.kbX += dx * force;
    this.kbZ += dz * force;
  }

  step(dt: number, player: PlayerTransform, rng: Rng): void {
    this.prevX = this.x;
    this.prevZ = this.z;
    this.prevYaw = this.yaw;

    if (this.health.dead) {
      this.state = 'dead';
      this.deadFrames++;
      this.integrateKb();
      return;
    }
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      this.integrateKb();
      return;
    }

    this.poise.step(dt);
    for (const k of Object.keys(this.cooldowns)) if (this.cooldowns[k] > 0) this.cooldowns[k]--;

    if (this.poise.staggered) {
      this.state = 'stagger';
      this.integrateKb();
      return;
    }

    if (this.runner) {
      if (this.runner.frame < this.runner.move.frames.active[0]) this.faceTo(player.x, player.z, 0.18);
      this.runner.step();
      if (this.runner.done) {
        this.setCooldown(this.runner.move.id);
        this.runner = null;
        this.state = 'idle';
      }
      this.integrateKb();
      return;
    }

    const dist = Math.hypot(player.x - this.x, player.z - this.z);
    this.faceTo(player.x, player.z, 0.2);

    const eligible = this.cfg.attacks.filter(
      (a) => dist >= (a.minRangeM ?? 0) && dist <= (a.maxRangeM ?? 999) && (this.cooldowns[a.moveRef] ?? 0) <= 0,
    );
    if (player.alive && eligible.length > 0) {
      const idx = rng.weightedPick(eligible.map((a) => a.weight));
      const move = this.moves.get(eligible[idx].moveRef);
      if (move) {
        this.runner = new MoveRunner(move);
        this.state = 'attack';
        this.integrateKb();
        return;
      }
    }

    // locomotion toward/away from the player per behavior
    const [mx, mz] = this.desiredMove(dist, player);
    if (Math.hypot(mx, mz) > 0.01) {
      this.x += mx * this.cfg.moveSpeedMps! * dt;
      this.z += mz * this.cfg.moveSpeedMps! * dt;
      this.state = 'move';
    } else {
      this.state = 'idle';
    }
    [this.x, this.z] = collision.resolve(this.x, this.z, this.hurtRadius);
    this.integrateKb();
  }

  private desiredMove(dist: number, player: PlayerTransform): [number, number] {
    const toX = player.x - this.x;
    const toZ = player.z - this.z;
    const len = Math.hypot(toX, toZ) || 1;
    const nx = toX / len;
    const nz = toZ / len;
    if (this.cfg.behavior === 'kite') {
      if (dist < 5) return [-nx, -nz]; // back away
      if (dist > 12) return [nx, nz]; // close in
      return [0, 0];
    }
    // chase / hyper-armor-punish / default
    if (dist > 1.7) return [nx, nz];
    return [0, 0];
  }

  private setCooldown(moveId: string): void {
    const ref = this.cfg.attacks.find((a) => a.moveRef === moveId);
    this.cooldowns[moveId] = ref?.cooldownFrames ?? 60;
  }

  private faceTo(tx: number, tz: number, rate: number): void {
    const target = Math.atan2(tx - this.x, tz - this.z);
    let d = target - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += d * rate;
  }

  private integrateKb(): void {
    if (Math.abs(this.kbX) < 1e-3 && Math.abs(this.kbZ) < 1e-3) return;
    const sx = this.kbX * 0.3;
    const sz = this.kbZ * 0.3;
    this.x += sx;
    this.z += sz;
    this.kbX -= sx;
    this.kbZ -= sz;
    [this.x, this.z] = collision.resolve(this.x, this.z, this.hurtRadius);
  }
}
