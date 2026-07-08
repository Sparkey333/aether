// Hit points. No passive regen (bible §2.1) — HP is restored only by the Attunement Flask.
export class Health {
  current: number;
  constructor(public max: number) {
    this.current = max;
  }
  get dead(): boolean {
    return this.current <= 0;
  }
  get pct(): number {
    return this.max > 0 ? this.current / this.max : 0;
  }
  damage(n: number): void {
    this.current = Math.max(0, this.current - n);
  }
  heal(n: number): void {
    this.current = Math.min(this.max, this.current + n);
  }
}
