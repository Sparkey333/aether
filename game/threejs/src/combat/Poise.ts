// Poise & stagger. Taking poiseDamage drains poise; at <=0 the actor is staggered (a vulnerable
// window) and poise resets. Poise regenerates after a delay. Hyper-armor (during heavy active frames)
// halves incoming poise damage — handled by the caller before calling damage().
export class Poise {
  current: number;
  staggerFrames = 0;
  private regenDelayFrames = 0;

  constructor(
    public max: number,
    private regenPerSec: number,
    private regenDelaySec: number,
    private staggerDurationFrames = 90,
  ) {
    this.current = max;
  }

  get staggered(): boolean {
    return this.staggerFrames > 0;
  }

  /** apply poise damage; returns true if this broke poise (stagger just triggered) */
  damage(n: number): boolean {
    if (this.staggered) return false;
    this.current -= n;
    this.regenDelayFrames = Math.round(this.regenDelaySec * 60);
    if (this.current <= 0) {
      this.current = this.max;
      this.staggerFrames = this.staggerDurationFrames;
      this.regenDelayFrames = this.staggerDurationFrames + Math.round(this.regenDelaySec * 60);
      return true;
    }
    return false;
  }

  step(dt: number): void {
    if (this.staggerFrames > 0) this.staggerFrames--;
    if (this.regenDelayFrames > 0) {
      this.regenDelayFrames--;
      return;
    }
    this.current = Math.min(this.max, this.current + this.regenPerSec * dt);
  }
}
