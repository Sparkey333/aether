// The Lyfe engine — pure functions, no I/O, mirroring Aether's engine.ts. It
// reveals the order latent in a scattered life and weighs plans against the
// Water-Line (urgency · priority · soul). Every score exposes what would move it.

import type {
  LyfeProject,
  Pillar,
  PillarBalance,
  Snag,
  Tides,
} from "./types";

export const PILLARS: Pillar[] = [
  "mind",
  "body",
  "spirit",
  "craft",
  "work",
  "service",
];

export const PILLAR_META: Record<
  Pillar,
  { label: string; glyph: string; hex: string; blurb: string }
> = {
  mind: { label: "Mind", glyph: "✶", hex: "#50c8ff", blurb: "Learning, engineering, science, invention." },
  body: { label: "Body", glyph: "❂", hex: "#78e6a0", blurb: "Health, fitness, food, land, the creatures." },
  spirit: { label: "Spirit", glyph: "✷", hex: "#ebbe5a", blurb: "Faith, meditation, truth, the inner work." },
  craft: { label: "Craft", glyph: "✺", hex: "#8a7dff", blurb: "Music, writing, art, games — making beauty." },
  work: { label: "Work", glyph: "⚒", hex: "#e6a45a", blurb: "Career, business, wealth, the sustaining trade." },
  service: { label: "Service", glyph: "♥", hex: "#e66e8c", blurb: "People, teaching, charity, community." },
};

/** Tally how active work is distributed across the pillars. */
export function balanceByPillar(projects: LyfeProject[]): PillarBalance[] {
  const totalActive = projects.filter((p) => p.state === "active").length || 1;
  return PILLARS.map((pillar) => {
    const inPillar = projects.filter((p) => p.pillar === pillar);
    const active = inPillar.filter((p) => p.state === "active").length;
    return {
      pillar,
      projects: inPillar.length,
      active,
      shells: inPillar.length - active,
      share: active / totalActive,
    };
  });
}

/** Shannon evenness of active work across pillars, 0..1. 1 = perfectly even,
 *  0 = everything piled into one pillar. The structural side of the Water-Line. */
export function pillarEvenness(projects: LyfeProject[]): number {
  const shares = balanceByPillar(projects)
    .map((b) => b.share)
    .filter((s) => s > 0);
  if (shares.length <= 1) return shares.length === 1 ? 0 : 1;
  const h = -shares.reduce((acc, s) => acc + s * Math.log(s), 0);
  return h / Math.log(PILLARS.length); // normalize by max possible entropy
}

/** Find the clutter: empty shells, near-duplicate names, fragmentation.
 *  Read-only — these are *findings*, each paired with a SAFE suggestion. */
export function detectSnags(projects: LyfeProject[]): Snag[] {
  const snags: Snag[] = [];

  // near-duplicate project names (same normalized title across entries)
  const byName = new Map<string, LyfeProject[]>();
  for (const p of projects) {
    const key = p.name.trim().toLowerCase().replace(/\s+/g, " ");
    byName.set(key, [...(byName.get(key) ?? []), p]);
  }
  for (const [key, group] of byName) {
    if (group.length > 1) {
      snags.push({
        id: `dup:${key}`,
        kind: "duplicate",
        title: `"${group[0].name}" appears ${group.length}×`,
        detail: `The same project exists ${group.length} times (Todoist ids ${group
          .map((g) => g.todoistId ?? "—")
          .join(", ")}). Likely re-created instead of moved.`,
        members: group.map((g) => g.id),
        suggestion: `Keep the fullest copy, archive the rest (backup first). Nothing deleted until you confirm.`,
      });
    }
  }

  // empty shells — named intentions with no work yet
  const shells = projects.filter((p) => p.state === "shell");
  if (shells.length) {
    snags.push({
      id: "shells",
      kind: "shell",
      title: `${shells.length} empty shells`,
      detail: `Projects named but never filled: ${shells
        .slice(0, 8)
        .map((s) => s.name)
        .join(", ")}${shells.length > 8 ? "…" : ""}.`,
      members: shells.map((s) => s.id),
      suggestion: `Each shell is a seed or a should-let-go. Triage gently: plant (add a first task) or compost (archive).`,
    });
  }

  return snags;
}

/** The Order Score, 0..100 — an honest read of how gathered the life is.
 *  Composed of: balance across pillars, share of real (non-shell) work, and a
 *  penalty for duplication. Every component is returned so the UI can show what
 *  would move it. */
export function orderScore(projects: LyfeProject[]): {
  score: number;
  parts: { label: string; value: number; of: number; hint: string }[];
} {
  const total = projects.length || 1;
  const shells = projects.filter((p) => p.state === "shell").length;
  const realShare = 1 - shells / total;

  const evenness = pillarEvenness(projects);

  const dupSnags = detectSnags(projects).filter((s) => s.kind === "duplicate");
  const dupCount = dupSnags.reduce((a, s) => a + (s.members.length - 1), 0);
  const dupPenalty = Math.min(1, dupCount / total); // 0..1

  // weighted: balance 40, real-work 40, cleanliness 20
  const balancePts = evenness * 40;
  const realPts = realShare * 40;
  const cleanPts = (1 - dupPenalty) * 20;
  const score = Math.round(balancePts + realPts + cleanPts);

  return {
    score,
    parts: [
      {
        label: "Balance across pillars",
        value: Math.round(balancePts),
        of: 40,
        hint: "Spread active work so no pillar drowns the others.",
      },
      {
        label: "Real work vs. empty shells",
        value: Math.round(realPts),
        of: 40,
        hint: `${shells} shells. Plant them or let them go to lift this.`,
      },
      {
        label: "Cleanliness (no duplicates)",
        value: Math.round(cleanPts),
        of: 20,
        hint: `${dupCount} duplicate copies found. Merge to lift this.`,
      },
    ],
  };
}

/** The Water-Line itself: weigh a plan's three tides and report the lean.
 *  Balance is highest when the three are close; the lean names the tide that is
 *  drowning the others, so the next choice can correct toward center. */
export function waterLine(t: Tides): {
  balance: number; // 0..1
  lean: "urgency" | "priority" | "soul" | "centered";
  reading: string;
} {
  const tides: [string, number][] = [
    ["urgency", t.urgency],
    ["priority", t.priority],
    ["soul", t.soul],
  ];
  const mean = (t.urgency + t.priority + t.soul) / 3 || 0;
  const spread =
    tides.reduce((a, [, v]) => a + Math.abs(v - mean), 0) / tides.length;
  const balance = Math.max(0, 1 - spread * 2);

  const sorted = [...tides].sort((a, b) => b[1] - a[1]);
  const [topName, topVal] = sorted[0];
  const lean =
    topVal - mean < 0.12
      ? "centered"
      : (topName as "urgency" | "priority" | "soul");

  const reading =
    lean === "centered"
      ? "The wave holds the line — urgency, priority, and soul move together."
      : lean === "soul"
        ? "Soul leads. Beautiful — just keep an eye that the necessary still gets done."
        : lean === "urgency"
          ? "Urgency is cresting. Protect some time for what matters and what feeds you."
          : "Priority leads. Make room for soul before the wave tips to grind.";

  return { balance, lean, reading };
}
