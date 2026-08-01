// Time-Waves — the urgency tide of the Water-Line, fed by real dated
// commitments imported from the per-area TODO sheets. Pure functions.
// See content/canon/lyfe.md (the Water-Line: urgency · priority · soul).

export interface Commitment {
  id: string;
  project: string;
  source: string;
  task: string;
  due: string; // raw "M/D" as written
  dueISO: string; // year inferred (see seed meta.yearNote)
  urgent?: boolean;
  note?: string;
}

/** Seed the urgency tide from the shape of the dated commitments: how many are
 *  open, and whether any are flagged urgent. Gentle and bounded — a starting
 *  read the person can always nudge. Labelled as seeded, never a live clock. */
export function seededUrgency(commitments: Commitment[]): number {
  const open = commitments.length;
  const urgent = commitments.filter((c) => c.urgent).length;
  const u = 0.4 + 0.03 * open + 0.1 * urgent;
  return Math.max(0, Math.min(1, u));
}

/** Sort soonest-due first; urgent rises within the same day. */
export function byDue(commitments: Commitment[]): Commitment[] {
  return [...commitments].sort((a, b) => {
    if (a.dueISO !== b.dueISO) return a.dueISO < b.dueISO ? -1 : 1;
    return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
  });
}
