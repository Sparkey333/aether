// Kinematic player controller (M2): camera-relative locomotion, sprint, dodge-roll with i-frames,
// frame-counted. Movement truth is plain numbers stepped at fixed 60Hz; the mesh reads it to render.
// Combat (combos, stamina spend on attacks) layers on in M3 — the dodge/stamina scaffolding is here.
import { collision } from '@/world/collision';
import { clamp } from '@/engine/math';
import type { CombatConstants } from '@/data/types';

export type LocoState = 'idle' | 'move' | 'dodge';

export class PlayerController {
  x = 0;
  z = 6;
  y = 0; // feet on ground
  yaw = Math.PI; // facing -Z toward arena center
  radius = 0.4;

  state: LocoState = 'idle';
  stamina: number;
  private staminaRegenDelay = 0; // frames until regen resumes

  // dodge
  private dodgeFrame = 0;
  private dodgeDirX = 0;
  private dodgeDirZ = 0;

  // interpolation (previous step transform for render lerp)
  prevX = 0;
  prevZ = 6;
  prevYaw = Math.PI;

  constructor(private c: CombatConstants) {
    this.stamina = c.player.stamina.max;
  }

  get invulnerable(): boolean {
    if (this.state !== 'dodge') return false;
    const [a, b] = this.c.dodge.iframes;
    return this.dodgeFrame >= a && this.dodgeFrame <= b;
  }

  /** one fixed step. moveX/moveZ are camera-relative analog inputs in [-1,1]; cameraYaw radians. */
  step(
    dt: number,
    move: [number, number],
    cameraYaw: number,
    sprintHeld: boolean,
    dodgePressed: boolean,
  ): void {
    this.prevX = this.x;
    this.prevZ = this.z;
    this.prevYaw = this.yaw;

    const c = this.c;
    const staminaMax = c.player.stamina.max;

    // ---- dodge handling ----
    if (this.state === 'dodge') {
      this.dodgeFrame++;
      const t = clamp(this.dodgeFrame / c.dodge.totalFrames, 0, 1);
      // ease-out distance curve
      const speed = (c.dodge.distanceM / c.dodge.totalFrames) * 60 * (1 - t) * 2;
      this.x += this.dodgeDirX * speed * dt;
      this.z += this.dodgeDirZ * speed * dt;
      this.faceDir(this.dodgeDirX, this.dodgeDirZ, 0.5);
      if (this.dodgeFrame >= c.dodge.totalFrames) this.state = 'idle';
      [this.x, this.z] = collision.resolve(this.x, this.z, this.radius);
      this.regenStamina(dt, staminaMax, true);
      return;
    }

    // translate input to world (camera-relative)
    const [mx, mz] = move;
    const mag = Math.hypot(mx, mz);
    let worldX = 0;
    let worldZ = 0;
    if (mag > 0.01) {
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      // forward (mz) is -Z in camera space
      worldX = mx * cos + mz * sin;
      worldZ = -mx * sin + mz * cos;
    }

    // ---- start a dodge ----
    if (dodgePressed && this.stamina >= c.staminaCosts.dodge) {
      this.stamina -= c.staminaCosts.dodge;
      this.staminaRegenDelay = Math.round(c.player.stamina.regenDelaySec * 60);
      this.state = 'dodge';
      this.dodgeFrame = 0;
      // dodge in input direction, or backward if no input
      if (mag > 0.01) {
        const l = Math.hypot(worldX, worldZ) || 1;
        this.dodgeDirX = worldX / l;
        this.dodgeDirZ = worldZ / l;
      } else {
        this.dodgeDirX = -Math.sin(this.yaw);
        this.dodgeDirZ = -Math.cos(this.yaw);
      }
      return;
    }

    // ---- normal locomotion ----
    if (mag > 0.01) {
      const sprinting = sprintHeld && this.stamina > 0;
      const speed = sprinting ? c.player.sprintSpeedMps : c.player.walkSpeedMps;
      const l = Math.hypot(worldX, worldZ) || 1;
      this.x += (worldX / l) * speed * mag * dt;
      this.z += (worldZ / l) * speed * mag * dt;
      this.faceDir(worldX, worldZ, 0.35);
      this.state = 'move';
      if (sprinting) {
        this.stamina = Math.max(0, this.stamina - c.player.stamina.sprintDrainPerSec * dt);
        this.staminaRegenDelay = Math.round(c.player.stamina.regenDelaySec * 60);
      } else {
        this.regenStamina(dt, staminaMax, false);
      }
    } else {
      this.state = 'idle';
      this.regenStamina(dt, staminaMax, false);
    }

    [this.x, this.z] = collision.resolve(this.x, this.z, this.radius);
  }

  private regenStamina(dt: number, max: number, duringDodge: boolean): void {
    if (this.staminaRegenDelay > 0) {
      this.staminaRegenDelay--;
      return;
    }
    if (duringDodge) return;
    this.stamina = Math.min(max, this.stamina + this.c.player.stamina.regenPerSec * dt);
  }

  private faceDir(dx: number, dz: number, rate: number): void {
    if (Math.hypot(dx, dz) < 0.001) return;
    const target = Math.atan2(dx, dz);
    let diff = target - this.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.yaw += diff * rate;
  }
}
