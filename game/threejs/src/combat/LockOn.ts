// Lock-on targeting (bible §2.4): acquire the nearest enemy in front of the camera within range,
// keep the player facing it (strafe movement), break on death / range. Target switching picks the
// next enemy to the requested side. Feeds the camera framing, player facing, and the HUD reticle.
import type { CombatConstants } from '@/data/types';
import type { CombatActor } from './actor';

export class LockOn {
  target: CombatActor | null = null;
  private switchCd = 0;

  constructor(private c: CombatConstants) {}

  get active(): boolean {
    return this.target !== null && this.target.alive();
  }

  toggle(px: number, pz: number, camYaw: number, enemies: CombatActor[]): void {
    if (this.active) {
      this.target = null;
      return;
    }
    this.target = this.acquire(px, pz, camYaw, enemies);
  }

  /** drop the target if it died or wandered out of range; tick the switch cooldown. */
  update(px: number, pz: number): void {
    if (this.switchCd > 0) this.switchCd--;
    if (this.target) {
      const d = Math.hypot(this.target.x - px, this.target.z - pz);
      if (!this.target.alive() || d > this.c.lockOn.breakRangeM) this.target = null;
    }
  }

  switchTarget(dir: number, px: number, pz: number, enemies: CombatActor[]): void {
    if (!this.active || this.switchCd > 0) return;
    const others = enemies.filter((e) => e.alive() && e !== this.target && Math.hypot(e.x - px, e.z - pz) <= this.c.lockOn.breakRangeM);
    if (others.length === 0) return;
    // pick by signed side relative to the player->target direction
    const tx = this.target!.x - px;
    const tz = this.target!.z - pz;
    let best: CombatActor | null = null;
    let bestScore = Infinity;
    for (const e of others) {
      const ex = e.x - px;
      const ez = e.z - pz;
      const cross = tx * ez - tz * ex; // >0 left, <0 right (screen depends on handedness; consistent enough)
      if ((dir < 0 && cross <= 0) || (dir > 0 && cross >= 0)) continue;
      const score = Math.hypot(e.x - px, e.z - pz);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    if (!best) best = others.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz))[0];
    this.target = best;
    this.switchCd = Math.round((this.c.lockOn.switchCooldownMs / 1000) * 60);
  }

  private acquire(px: number, pz: number, camYaw: number, enemies: CombatActor[]): CombatActor | null {
    const fwdx = Math.sin(camYaw);
    const fwdz = Math.cos(camYaw);
    const coneCos = Math.cos((this.c.lockOn.coneDeg * Math.PI) / 180 / 2);
    let inCone: CombatActor | null = null;
    let inConeD = Infinity;
    let nearest: CombatActor | null = null;
    let nearestD = Infinity;
    for (const e of enemies) {
      if (!e.alive()) continue;
      const d = Math.hypot(e.x - px, e.z - pz);
      if (d > this.c.lockOn.acquireRangeM) continue;
      if (d < nearestD) {
        nearestD = d;
        nearest = e;
      }
      const dot = ((e.x - px) / d) * fwdx + ((e.z - pz) / d) * fwdz;
      if (dot >= coneCos && d < inConeD) {
        inConeD = d;
        inCone = e;
      }
    }
    return inCone ?? nearest;
  }
}
