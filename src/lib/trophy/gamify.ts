// Trophy Hype — the gamification engine.
//
// Turns a Trophy Case into a level, a rank, and a streak — honestly. Every XP
// number traces back to (a) how hard the thing was and (b) how well it is proven.
// A blaze of unverified claims can never out-rank a smaller wall of verified
// finishes, because XP is multiplied by the proof weight (see proof.ts). The
// scoreboard rewards doing the thing AND proving it.

import { proofWeight } from "./proof";
import type { Arena, Trophy, TrophyKind } from "./types";

/** Base XP by trophy kind, before difficulty and proof weighting. */
const KIND_BASE: Record<TrophyKind, number> = {
  medal: 120,
  shirt: 40,
  placement: 200,
  finish: 100,
  pr: 90,
  summit: 150,
  catch: 80,
  acceptance: 220, // getting selected / published is hard-won
  award: 320, // winning is the apex
  badge: 60,
};

/**
 * XP for a single trophy = base(kind) × difficulty × proofWeight(tier).
 * difficulty defaults to 1 and scales the base up to 5× for apex efforts.
 * The proof weight is what keeps the board honest.
 */
export function trophyXp(t: Pick<Trophy, "kind" | "difficulty" | "proof">): number {
  const base = KIND_BASE[t.kind] ?? 80;
  const diff = clamp(t.difficulty ?? 1, 0.5, 5);
  const weight = proofWeight(t.proof.tier);
  return Math.round(base * diff * weight);
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** The ranks — a Trophy Hype belt system, earned by total XP. */
export interface Rank {
  id: string;
  name: string;
  minXp: number;
  hex: string;
}

export const RANKS: Rank[] = [
  { id: "spark", name: "Spark", minXp: 0, hex: "#9aa0bd" },
  { id: "contender", name: "Contender", minXp: 500, hex: "#78e6a0" },
  { id: "challenger", name: "Challenger", minXp: 1500, hex: "#50c8ff" },
  { id: "competitor", name: "Competitor", minXp: 3500, hex: "#8a7dff" },
  { id: "champion", name: "Champion", minXp: 7000, hex: "#ebbe5a" },
  { id: "legend", name: "Legend", minXp: 14000, hex: "#ff9d4d" },
  { id: "mythic", name: "Mythic", minXp: 28000, hex: "#ff5e7a" },
];

export function rankForXp(xp: number): Rank {
  let r = RANKS[0];
  for (const rank of RANKS) if (xp >= rank.minXp) r = rank;
  return r;
}

export function nextRank(xp: number): Rank | null {
  return RANKS.find((r) => r.minXp > xp) ?? null;
}

/** Level curve: smooth, ~quadratic so early levels come fast then slow down. */
export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 60)) + 1);
}

/** XP needed to reach a given level (inverse of levelForXp). */
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 60;
}

export interface Standing {
  totalXp: number;
  verifiedXp: number;
  level: number;
  levelXp: number; // xp into the current level
  levelSpan: number; // xp width of the current level
  rank: Rank;
  next: Rank | null;
  toNextRank: number; // xp remaining to the next rank (0 if maxed)
  counts: { total: number; verified: number; byArena: Record<Arena, number> };
}

/** Roll a Trophy Case up into a full standing for the profile header. */
export function computeStanding(trophies: Trophy[]): Standing {
  let totalXp = 0;
  let verifiedXp = 0;
  let verified = 0;
  const byArena: Record<Arena, number> = { field: 0, stage: 0 };

  for (const t of trophies) {
    totalXp += t.xp;
    byArena[t.arena] = (byArena[t.arena] ?? 0) + 1;
    if (t.proof.tier === "verified") {
      verified += 1;
      verifiedXp += t.xp;
    }
  }

  const level = levelForXp(totalXp);
  const levelFloor = xpForLevel(level);
  const levelCeil = xpForLevel(level + 1);
  const rank = rankForXp(totalXp);
  const next = nextRank(totalXp);

  return {
    totalXp,
    verifiedXp,
    level,
    levelXp: totalXp - levelFloor,
    levelSpan: levelCeil - levelFloor,
    rank,
    next,
    toNextRank: next ? next.minXp - totalXp : 0,
    counts: { total: trophies.length, verified, byArena },
  };
}

/**
 * Current activity streak in days: consecutive calendar days ending today (or
 * yesterday) that have at least one earned trophy. Rewards showing up.
 */
export function computeStreak(trophies: Trophy[], today = new Date()): number {
  if (!trophies.length) return 0;
  const days = new Set(trophies.map((t) => t.earnedAt.slice(0, 10)));
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // allow the streak to still count if nothing today but something yesterday
  if (!days.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
