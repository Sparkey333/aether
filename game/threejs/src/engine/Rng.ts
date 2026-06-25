// Deterministic xorshift128 PRNG. Seeded from combat.json:prngSeed (0x41455448 = "AETH").
// Every "random" boss/AI choice MUST draw from a named instance of this so the three engine
// builds produce identical boss-kill telemetry (bible §2.14 determinism contract).
export class Rng {
  private x: number;
  private y: number;
  private z: number;
  private w: number;

  constructor(seed: number) {
    // expand a 32-bit seed into four state words (splitmix-ish, integer-only)
    let s = seed >>> 0;
    const next = () => {
      s = (s + 0x9e3779b9) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 16), 0x21f0aaad) >>> 0;
      t = Math.imul(t ^ (t >>> 15), 0x735a2d97) >>> 0;
      return (t ^ (t >>> 15)) >>> 0;
    };
    this.x = next() || 1;
    this.y = next() || 1;
    this.z = next() || 1;
    this.w = next() || 1;
  }

  /** raw 32-bit unsigned */
  nextUint(): number {
    const t = this.x ^ ((this.x << 11) >>> 0);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    return this.w >>> 0;
  }

  /** float in [0,1) */
  nextFloat(): number {
    return this.nextUint() / 0x100000000;
  }

  /** integer in [0,maxExclusive) */
  nextInt(maxExclusive: number): number {
    return Math.floor(this.nextFloat() * maxExclusive);
  }

  /** weighted index pick; weights need not sum to 1 */
  weightedPick(weights: number[]): number {
    let total = 0;
    for (const w of weights) total += w;
    let r = this.nextFloat() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i;
    }
    return weights.length - 1;
  }

  /** snapshot for save/replay */
  getState(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
  setState(s: [number, number, number, number]): void {
    [this.x, this.y, this.z, this.w] = s;
  }
}
