// Trophy Hype — the integrity engine.
//
// Every trophy wears its proof in the open. This module defines the four proof
// tiers, the evidence methods that qualify for each, and the XP weight each tier
// earns. The design goal is singular: make corruption pointless AND impossible to
// disguise. A claim is never hidden — it is labelled "Claimed" and worth a
// fraction of a verified result, so no leaderboard can be bought with a lie, and
// an honest verified finish always stands above a loud unverified one.

import type { Evidence, Proof, ProofMethod, ProofTier } from "./types";

/** Visual + semantic metadata for the four proof tiers. Strongest → weakest. */
export const PROOF_TIERS: Record<
  ProofTier,
  {
    label: string;
    short: string;
    hex: string;
    /** XP multiplier applied to a trophy proven at this tier. */
    weight: number;
    blurb: string;
  }
> = {
  verified: {
    label: "Verified",
    short: "V",
    hex: "#4ad6a0",
    weight: 1,
    blurb:
      "Independently confirmed — chip time, official results, a sanctioning body, a GPS track, or a jury's decision. The record stands on its own.",
  },
  documented: {
    label: "Documented",
    short: "D",
    hex: "#50c8ff",
    weight: 0.7,
    blurb:
      "Backed by tangible evidence — a certificate, a receipt, a photo or video of the bib, medal, catch, or screen. Strong, but not third-party confirmed.",
  },
  attested: {
    label: "Attested",
    short: "A",
    hex: "#ebbe5a",
    weight: 0.4,
    blurb:
      "Self-logged with real metadata — a date, a place, a named witness — but no external evidence attached. Honest, and marked as such.",
  },
  claimed: {
    label: "Claimed",
    short: "C",
    hex: "#e66e8c",
    weight: 0.15,
    blurb:
      "Asserted with nothing attached yet. Fully allowed, never hidden, and worth almost nothing until it is backed. Add evidence to promote it.",
  },
};

export const PROOF_ORDER: ProofTier[] = [
  "verified",
  "documented",
  "attested",
  "claimed",
];

/**
 * The strongest tier a given evidence method can support on its own.
 * The actual tier of a Proof is the strongest tier any one piece backs.
 */
export const METHOD_TIER: Record<ProofMethod, ProofTier> = {
  "chip-time": "verified",
  "official-results": "verified",
  "gps-track": "verified",
  "summit-log": "verified",
  "jury-decision": "verified",
  "acceptance-letter": "verified",
  certificate: "documented",
  receipt: "documented",
  photo: "documented",
  video: "documented",
  witness: "attested",
  "self-report": "claimed",
};

const RANK: Record<ProofTier, number> = {
  verified: 3,
  documented: 2,
  attested: 1,
  claimed: 0,
};

/** The tier a single evidence item earns. */
export function tierOfMethod(method: ProofMethod): ProofTier {
  return METHOD_TIER[method];
}

/**
 * Derive a proof's tier from its evidence: the STRONGEST tier any single piece
 * supports. Empty evidence is a bare "claimed". This is deterministic and can be
 * recomputed anywhere, so the tier can never be spoofed independently of what
 * actually backs it.
 */
export function deriveTier(evidence: Evidence[]): ProofTier {
  if (!evidence.length) return "claimed";
  let best: ProofTier = "claimed";
  for (const e of evidence) {
    const t = tierOfMethod(e.method);
    if (RANK[t] > RANK[best]) best = t;
  }
  return best;
}

/** Build a Proof from evidence, tier always derived (never trusted from input). */
export function makeProof(evidence: Evidence[] = []): Proof {
  return { tier: deriveTier(evidence), evidence };
}

/** The XP weight for a proof tier. */
export function proofWeight(tier: ProofTier): number {
  return PROOF_TIERS[tier].weight;
}

/** True when `a` is a stronger proof tier than `b`. */
export function isStronger(a: ProofTier, b: ProofTier): boolean {
  return RANK[a] > RANK[b];
}
