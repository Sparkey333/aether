// Trajectory — the "Projekt Z" idea proper: project forward from the points
// that actually exist, and say plainly which points are missing.
//
// The honest baseline, inherited from the Atlas's Monte-Carlo doctrine: a
// projection is only worth as much as the data under it. So every number here
// is traceable to a counter someone actually wrote in a sheet, and the missing
// input (career history) is named rather than guessed around.
//
// See content/canon/lyfe.md and docs/LYFE.md.

export type Accountability = "external" | "internal";

export interface Board {
  id: string;
  board: string;
  sheet: string;
  done: number;
  total: number;
  accountability: Accountability;
  note?: string;
}

export interface Throughput {
  done: number;
  total: number;
  /** completion ratio 0..1; null when nothing has been committed to yet */
  rate: number | null;
  boards: number;
  /** boards that exist but hold no items at all */
  empty: number;
}

export function throughput(boards: Board[]): Throughput {
  const done = boards.reduce((a, b) => a + b.done, 0);
  const total = boards.reduce((a, b) => a + b.total, 0);
  return {
    done,
    total,
    rate: total > 0 ? done / total : null,
    boards: boards.length,
    empty: boards.filter((b) => b.total === 0).length,
  };
}

export function splitByAccountability(boards: Board[]): {
  external: Throughput;
  internal: Throughput;
} {
  return {
    external: throughput(boards.filter((b) => b.accountability === "external")),
    internal: throughput(boards.filter((b) => b.accountability === "internal")),
  };
}

/** The finding, stated in plain language with its own evidence attached.
 *  Written to be read kindly — this is a pattern, not a verdict on a person. */
export interface Finding {
  headline: string;
  evidence: string;
  reading: string;
  /** the gentle, concrete move that would change the trend */
  lever: string;
  /** what would make this finding stronger or overturn it */
  caveat: string;
}

export function accountabilityFinding(boards: Board[]): Finding | null {
  const { external, internal } = splitByAccountability(boards);
  if (external.rate === null || internal.rate === null) return null;

  const gap = external.rate - internal.rate;
  const pct = (r: number) => `${Math.round(r * 100)}%`;

  if (gap > 0.25) {
    return {
      headline: "Work with a witness gets finished. Work without one waits.",
      evidence: `${external.done}/${external.total} done (${pct(external.rate)}) where someone else is expecting it · ${internal.done}/${internal.total} (${pct(internal.rate)}) where only you are.`,
      reading:
        "This is not a discipline problem — the external number is strong. It is a structural one: your follow-through is wired to other people, and your own work is the only work that arrives without anyone waiting for it.",
      lever:
        "Give one soul-project a witness this week — a date, a listener, a person expecting it. One is enough to test whether the pattern is structural.",
      caveat:
        "Drawn from the boards' own counters, not from time logs. A self-directed project finished outside these sheets would not appear here and would soften the gap.",
    };
  }
  if (gap < -0.25) {
    return {
      headline: "Your own work moves faster than the work others wait on.",
      evidence: `${internal.done}/${internal.total} (${pct(internal.rate)}) self-directed · ${external.done}/${external.total} (${pct(external.rate)}) externally owed.`,
      reading:
        "The soul is well fed here. The risk sits on the other side: commitments to other people are the ones that carry consequences when they slip.",
      lever: "Pull the nearest externally-owed item forward before it becomes urgent.",
      caveat: "Based on board counters only; work completed outside these sheets is invisible to it.",
    };
  }
  return {
    headline: "You finish at about the same rate whoever is watching.",
    evidence: `${pct(external.rate)} external · ${pct(internal.rate)} internal.`,
    reading:
      "That is a rare and steady thing — the water line is holding on its own, without external pressure doing the steering.",
    lever: "Protect it. The next thing to watch is load, not motivation.",
    caveat: "Based on board counters only.",
  };
}

/** Carry-load: what is actually open across the whole tree, and what the
 *  measured completion rate implies about clearing it. Deliberately expressed
 *  as a range and a caution, never as a false-precision date. */
export function carryLoad(
  boards: Board[],
  openProjects: number,
  openItems: number,
): {
  openProjects: number;
  openItems: number;
  rate: number | null;
  impliedClearable: number | null;
  note: string;
} {
  const t = throughput(boards);
  const impliedClearable = t.rate === null ? null : Math.round(openItems * t.rate);
  return {
    openProjects,
    openItems,
    rate: t.rate,
    impliedClearable,
    note:
      t.rate === null
        ? "No completion data yet — connect Todoist to measure a real rate."
        : `At the completion rate these sheets actually show (${Math.round(t.rate * 100)}%), roughly ${impliedClearable} of ${openItems} open items are the realistic near-horizon. The rest is not failure — it is the honest size of the tree.`,
  };
}

/** What Lyfe cannot yet see. Naming the gap is part of the projection. */
export const MISSING_INPUTS = [
  {
    input: "Résumé / LinkedIn history",
    unlocks: "Career points to project from — tenure, titles, the arc already walked.",
    status: "not connected",
  },
  {
    input: "Todoist live sync",
    unlocks: "Real completion timestamps, so the rate becomes a velocity over time rather than a ratio.",
    status: "not connected",
  },
  {
    input: "Local file scan (Mac build)",
    unlocks: "Which projects have real artifacts behind them versus only tasks.",
    status: "awaiting the Vacuum's file access",
  },
];
