// Fixed-timestep accumulator (Glenn Fiedler "Fix Your Timestep"). ALL gameplay logic runs in
// fixedStep() at exactly 1/60 s; rendering interpolates between the previous and current step.
// This is the determinism backbone that makes boss fights reproducible across the three engines.
import { FIXED_DT } from './math';

export type System = (dt: number, frame: number) => void;

export class GameLoop {
  private accumulator = 0;
  frame = 0;
  /** interpolation alpha in [0,1) for the current render frame */
  alpha = 0;
  private systems: System[] = [];
  private maxRealDelta = 0.25; // spiral-of-death guard

  /** systems run in registration order — order is part of the determinism contract */
  addSystem(s: System): void {
    this.systems.push(s);
  }

  /** call once per render frame with the real elapsed time in seconds */
  advance(realDelta: number): number {
    this.accumulator += Math.min(realDelta, this.maxRealDelta);
    let steps = 0;
    while (this.accumulator >= FIXED_DT) {
      for (const s of this.systems) s(FIXED_DT, this.frame);
      this.frame++;
      this.accumulator -= FIXED_DT;
      steps++;
    }
    this.alpha = this.accumulator / FIXED_DT;
    return steps;
  }

  reset(): void {
    this.accumulator = 0;
    this.frame = 0;
    this.alpha = 0;
  }
}
