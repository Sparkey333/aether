// Aether charge (AE): the DMC-payoff resource. Built ONLY by landing varied hits (via Flow rank),
// spent by leyline specials. No passive regen (bible §2.1).
export class Aether {
  constructor(public max: number, public current: number) {}
  get pct(): number {
    return this.max > 0 ? this.current / this.max : 0;
  }
  add(n: number): void {
    this.current = Math.min(this.max, this.current + n);
  }
  /** spend n if affordable; returns true on success */
  spend(n: number): boolean {
    if (this.current < n) return false;
    this.current -= n;
    return true;
  }
}
