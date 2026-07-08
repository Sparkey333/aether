// The player actor. Owns locomotion + dodge (M2) AND the full combat layer (M3): health, poise,
// stamina, Aether, the Flow meter, and the combo/parry/block/special system (PlayerCombat). Implements
// the CombatActor contract so HitResolution treats it identically to enemies. Movement truth is plain
// numbers stepped at a fixed 60Hz; the mesh reads the interpolated transform to render.
import { collision } from '@/world/collision';
import { clamp } from '@/engine/math';
import type { CombatConstants, Move, WeaponConfig } from '@/data/types';
import { Health } from '@/combat/Health';
import { Poise } from '@/combat/Poise';
import { Aether } from '@/combat/Aether';
import { Flow } from '@/combat/Flow';
import { PlayerCombat, type CombatInput } from '@/combat/PlayerCombat';
import { type ActiveHit } from '@/combat/MoveRunner';
import { resolveIncoming, type CombatActor, type DefenseState, type Incoming, type HitOutcome } from '@/combat/actor';

export type LocoState = 'idle' | 'move' | 'dodge' | 'attack' | 'stagger';

export interface PlayerInput {
  move: [number, number];
  sprint: boolean;
  dodge: boolean;
  light: boolean;
  heavy: boolean;
  block: boolean;
  parry: boolean;
  special1: boolean;
  special2: boolean;
  cauterize: boolean;
}

export class PlayerController implements CombatActor {
  readonly id = 'player';
  readonly team = 'player' as const;

  x = 0;
  z = 6;
  y = 0; // feet on ground
  yaw = Math.PI; // facing -Z toward arena center
  radius = 0.4;
  hurtRadius = 0.45;
  hurtHeight = 1.8;

  state: LocoState = 'idle';
  stamina: number;
  private staminaRegenDelay = 0; // frames until regen resumes

  health: Health;
  poise: Poise;
  aether: Aether;
  flow: Flow;
  combat: PlayerCombat;
  freezeFrames = 0;

  // dodge
  private dodgeFrame = 0;
  private dodgeDirX = 0;
  private dodgeDirZ = 0;

  // knockback (while hit/staggered)
  private kbX = 0;
  private kbZ = 0;

  // interpolation (previous step transform for render lerp)
  prevX = 0;
  prevZ = 6;
  prevYaw = Math.PI;

  constructor(private c: CombatConstants, moves: Map<string, Move>, weapon: WeaponConfig) {
    this.stamina = c.player.stamina.max;
    this.health = new Health(c.player.hp);
    this.poise = new Poise(c.player.poise.max, c.player.poise.regenPerSec, c.player.poise.regenDelaySec);
    this.aether = new Aether(c.player.aether.max, c.player.aether.startValue);
    this.flow = new Flow(c.flow);
    this.combat = new PlayerCombat(c, moves, weapon);
  }

  // ---- CombatActor ----
  alive(): boolean {
    return !this.health.dead;
  }

  get invulnerable(): boolean {
    if (this.state !== 'dodge') return false;
    const [a, b] = this.c.dodge.iframes;
    return this.dodgeFrame >= a && this.dodgeFrame <= b;
  }

  defense(): DefenseState {
    return {
      iframe: this.invulnerable,
      hyperArmor: this.combat.hyperArmor(),
      blocking: this.combat.blocking,
      parry: this.combat.parryActive(),
    };
  }

  activeHits(): ActiveHit[] {
    return this.combat.activeHits(this);
  }

  receiveHit(inc: Incoming): HitOutcome {
    const out = resolveIncoming(this, this.defense(), inc, this.c);
    if (out.staggered) {
      this.combat.cancel();
      this.state = 'stagger';
    }
    return out;
  }

  onDamaged(): void {
    this.flow.onDamaged();
  }

  outgoingMult(): number {
    return this.combat.outgoingMult();
  }

  onLandHit(): void {
    const fid = this.combat.currentFlowMoveId() ?? 'attack';
    const ae = this.flow.onHit(fid);
    this.aether.add(ae);
  }

  onParried(): void {
    this.poise.staggerFrames = Math.max(this.poise.staggerFrames, 90);
    this.combat.cancel();
    this.state = 'stagger';
  }

  setFreeze(frames: number): void {
    this.freezeFrames = Math.max(this.freezeFrames, frames);
  }

  applyKnockback(dx: number, dz: number, force: number): void {
    this.kbX += dx * force;
    this.kbZ += dz * force;
  }

  // ---- fixed step ----
  step(dt: number, input: PlayerInput, cameraYaw: number, lockTarget: { x: number; z: number } | null): void {
    this.prevX = this.x;
    this.prevZ = this.z;
    this.prevYaw = this.yaw;

    const c = this.c;
    const staminaMax = c.player.stamina.max;

    // hitstop freeze pauses everything
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      this.integrateKb();
      return;
    }

    this.poise.step(dt);
    this.flow.step(dt);

    // staggered: no control
    if (this.poise.staggered) {
      this.state = 'stagger';
      this.integrateKb();
      this.regenStamina(dt, staminaMax);
      return;
    }

    // camera-relative world move dir
    const [mx, mz] = input.move;
    const mag = Math.hypot(mx, mz);
    let worldX = 0;
    let worldZ = 0;
    if (mag > 0.01) {
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      worldX = mx * cos + mz * sin;
      worldZ = -mx * sin + mz * cos;
    }

    // ---- dodge (priority; can style-cancel an attack in its cancel window) ----
    if (this.state === 'dodge') {
      this.advanceDodge(dt);
      this.regenStamina(dt, staminaMax);
      this.integrateKb();
      return;
    }
    const canDodge =
      input.dodge &&
      this.stamina >= c.staminaCosts.dodge &&
      (!this.combat.isBusy() || (this.combat.state === 'attack' && !!this.combat.runner?.inCancelWindow(c.comboLinkWindowFrames)));
    if (canDodge) {
      this.combat.cancel();
      this.stamina -= c.staminaCosts.dodge;
      this.staminaRegenDelay = Math.round(c.player.stamina.regenDelaySec * 60);
      this.state = 'dodge';
      this.dodgeFrame = 0;
      if (mag > 0.01) {
        const l = Math.hypot(worldX, worldZ) || 1;
        this.dodgeDirX = worldX / l;
        this.dodgeDirZ = worldZ / l;
      } else {
        this.dodgeDirX = -Math.sin(this.yaw);
        this.dodgeDirZ = -Math.cos(this.yaw);
      }
      this.integrateKb();
      return;
    }

    // ---- combat (attacks / parry / block / specials / cauterize) ----
    const staminaBefore = this.stamina;
    const cin: CombatInput = {
      light: input.light,
      heavy: input.heavy,
      special1: input.special1,
      special2: input.special2,
      cauterize: input.cauterize,
      blockHeld: input.block,
      parry: input.parry,
    };
    this.combat.step(this, cin);
    if (this.stamina < staminaBefore) this.staminaRegenDelay = Math.round(c.player.stamina.regenDelaySec * 60);

    // ---- facing ----
    if (lockTarget) {
      this.faceTo(lockTarget.x, lockTarget.z, 0.4);
    }

    // ---- locomotion (only if not rooted by an attack/parry) ----
    if (this.combat.isBusy()) {
      this.state = 'attack';
    } else if (mag > 0.01) {
      const blocking = this.combat.blocking;
      const sprinting = input.sprint && !blocking && this.stamina > 0;
      let speed = sprinting ? c.player.sprintSpeedMps : c.player.walkSpeedMps;
      if (blocking) speed *= 0.4;
      const l = Math.hypot(worldX, worldZ) || 1;
      this.x += (worldX / l) * speed * mag * dt;
      this.z += (worldZ / l) * speed * mag * dt;
      if (!lockTarget) this.faceDir(worldX, worldZ, 0.35);
      this.state = 'move';
      if (sprinting) {
        this.stamina = Math.max(0, this.stamina - c.player.stamina.sprintDrainPerSec * dt);
        this.staminaRegenDelay = Math.round(c.player.stamina.regenDelaySec * 60);
      } else {
        this.regenStamina(dt, staminaMax);
      }
    } else {
      this.state = this.combat.blocking ? 'idle' : 'idle';
      this.regenStamina(dt, staminaMax);
    }

    [this.x, this.z] = collision.resolve(this.x, this.z, this.radius);
    this.integrateKb();
  }

  private advanceDodge(dt: number): void {
    const c = this.c;
    this.dodgeFrame++;
    const t = clamp(this.dodgeFrame / c.dodge.totalFrames, 0, 1);
    const speed = (c.dodge.distanceM / c.dodge.totalFrames) * 60 * (1 - t) * 2;
    this.x += this.dodgeDirX * speed * dt;
    this.z += this.dodgeDirZ * speed * dt;
    this.faceDir(this.dodgeDirX, this.dodgeDirZ, 0.5);
    if (this.dodgeFrame >= c.dodge.totalFrames) this.state = 'idle';
    [this.x, this.z] = collision.resolve(this.x, this.z, this.radius);
  }

  private regenStamina(dt: number, max: number): void {
    if (this.staminaRegenDelay > 0) {
      this.staminaRegenDelay--;
      return;
    }
    this.stamina = Math.min(max, this.stamina + this.c.player.stamina.regenPerSec * dt);
  }

  private integrateKb(): void {
    if (Math.abs(this.kbX) < 1e-3 && Math.abs(this.kbZ) < 1e-3) return;
    const sx = this.kbX * 0.3;
    const sz = this.kbZ * 0.3;
    this.x += sx;
    this.z += sz;
    this.kbX -= sx;
    this.kbZ -= sz;
    [this.x, this.z] = collision.resolve(this.x, this.z, this.radius);
  }

  private faceDir(dx: number, dz: number, rate: number): void {
    if (Math.hypot(dx, dz) < 0.001) return;
    this.faceTo(this.x + dx, this.z + dz, rate);
  }

  private faceTo(tx: number, tz: number, rate: number): void {
    const target = Math.atan2(tx - this.x, tz - this.z);
    let diff = target - this.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.yaw += diff * rate;
  }
}
