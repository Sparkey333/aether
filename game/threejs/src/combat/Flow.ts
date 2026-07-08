// The Flow meter — the Souls<->DMC coupling (bible §2.10). Landing VARIED hits raises FP through
// ranks D->S; repeating a move or taking damage collapses it. Crucially, Flow rank determines
// Aether-per-hit (aeByRank), so stylish play is what fuels your specials. FP decays over time,
// doubly so for a few seconds after taking damage.
import type { CombatConstants } from '@/data/types';

type FlowConfig = CombatConstants['flow'];

export class Flow {
  fp = 0;
  private history: string[] = []; // last N flowMoveIds, most-recent last
  private damageDecayFrames = 0; // frames of doubled decay after taking damage

  constructor(private c: FlowConfig) {}

  rankIndex(): number {
    let idx = 0;
    for (let i = 0; i < this.c.ranks.length; i++) {
      if (this.fp >= this.c.ranks[i].threshold) idx = i;
    }
    return idx;
  }

  rankName(): string {
    return this.c.ranks[this.rankIndex()].name;
  }

  varietyMultFor(flowMoveId: string): number {
    const last = this.history[this.history.length - 1];
    if (flowMoveId === last) return this.c.varietyRepeatMult;
    if (this.history.includes(flowMoveId)) return this.c.varietyRecentMult;
    return this.c.varietyNovelMult;
  }

  /** register a landed hit; returns AE granted for this hit (aeByRank[currentRank]). */
  onHit(flowMoveId: string): number {
    const mult = this.varietyMultFor(flowMoveId);
    this.fp = Math.min(this.c.maxFp, this.fp + this.c.baseFpPerHit * mult);
    this.history.push(flowMoveId);
    while (this.history.length > this.c.varietyWindow) this.history.shift();
    return this.c.aeByRank[this.rankIndex()] ?? 0;
  }

  onDamaged(): void {
    this.fp = Math.max(0, this.fp * (1 - this.c.damagePenaltyPct));
    this.damageDecayFrames = Math.round(this.c.damageDecaySec * 60);
  }

  step(dt: number): void {
    const mult = this.damageDecayFrames > 0 ? this.c.damageDecayMult : 1;
    if (this.damageDecayFrames > 0) this.damageDecayFrames--;
    this.fp = Math.max(0, this.fp - this.c.decayPerSec * mult * dt);
  }
}
