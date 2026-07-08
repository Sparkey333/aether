// Executes one attack (a Move) as a frame counter. Reports which hit volumes are active on the
// current frame (multi-hit moves split their active window into equal sub-windows). Hyper-armor and
// the combo cancel window are derived here. Hit-once-per-target is enforced by HitResolution using
// the unique instanceId. The caller must NOT step() while frozen by hitstop.
import type { Move } from '@/data/types';
import { attackVolume, type WorldVolume } from './geometry';

export interface ActiveHit {
  instanceId: number;
  hitIndex: number;
  hit: import('@/data/types').Hit;
  vol: WorldVolume;
}

let INSTANCE = 0;

export class MoveRunner {
  frame = 0;
  readonly instanceId: number;
  constructor(public move: Move) {
    this.instanceId = ++INSTANCE;
  }

  get done(): boolean {
    return this.frame > this.move.frames.total;
  }

  /** advance one fixed frame */
  step(): void {
    this.frame++;
  }

  hyperArmor(): boolean {
    const ha = this.move.frames.hyperArmorFrom;
    return ha != null && this.frame >= ha;
  }

  /** can the combo be canceled into a follow-up now? (after active frames, within the link window) */
  inCancelWindow(linkWindow: number): boolean {
    const activeEnd = this.move.frames.active[1];
    return this.frame > activeEnd && this.frame <= activeEnd + linkWindow;
  }

  /** hit volumes active on the current frame, in world space at (x,y,z,yaw). */
  activeHits(x: number, y: number, z: number, yaw: number): ActiveHit[] {
    const [a, b] = this.move.frames.active;
    if (this.frame < a || this.frame > b) return [];
    const hits = this.move.hits;
    const out: ActiveHit[] = [];
    if (hits.length <= 1) {
      if (hits.length === 1) {
        out.push({ instanceId: this.instanceId, hitIndex: 0, hit: hits[0], vol: attackVolume(hits[0].hitbox, x, y, z, yaw) });
      }
      return out;
    }
    const span = (b - a + 1) / hits.length;
    for (let i = 0; i < hits.length; i++) {
      const start = a + Math.floor(i * span);
      const end = i === hits.length - 1 ? b : a + Math.floor((i + 1) * span) - 1;
      if (this.frame >= start && this.frame <= end) {
        out.push({ instanceId: this.instanceId, hitIndex: i, hit: hits[i], vol: attackVolume(hits[i].hitbox, x, y, z, yaw) });
      }
    }
    return out;
  }
}
