// Trophy Hype — the discovery / fit engine (in-app).
//
// Scores each opportunity against the athlete/creator profile so the feed leads
// with what fits: your disciplines, your interests, what's near, what's soon,
// what's free, and — in keeping with the integrity spine — what can actually be
// verified. The daily heartbeat (scripts/trophy-heartbeat.mjs) mirrors this math
// so the morning feed and the in-app feed agree.

import type { Opportunity, Profile, ProofMethod } from "./types";

const R = 6371;
const D2R = Math.PI / 180;

export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = (b.lat - a.lat) * D2R;
  const dLon = (b.lon - a.lon) * D2R;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Whole days from `now` until an ISO date; negative if already passed. */
export function daysUntil(dateIso: string | undefined, now = new Date()): number | null {
  if (!dateIso) return null;
  const then = new Date(dateIso + "T00:00:00Z").getTime();
  if (Number.isNaN(then)) return null;
  return Math.round((then - now.getTime()) / 86_400_000);
}

const STRONG_METHODS: ProofMethod[] = [
  "chip-time",
  "official-results",
  "gps-track",
  "summit-log",
  "jury-decision",
  "acceptance-letter",
];

export interface FitResult {
  fit: number;
  reasons: string[];
}

/** Score one opportunity against a profile → { fit 0..1, reasons }. */
export function scoreFit(
  opp: Opportunity,
  profile: Profile,
  now = new Date(),
): FitResult {
  let score = 0.15; // small floor so nothing is exactly zero
  const reasons: string[] = [];

  // Discipline is the strongest signal.
  if (profile.disciplines.includes(opp.discipline)) {
    score += 0.4;
    reasons.push("Matches a discipline you pursue");
  }

  // Creative arena vs the creations you submit.
  if (opp.arena === "stage" && profile.creations?.length) {
    const disc = opp.discipline;
    const wantsIt =
      (disc === "music" && profile.creations.includes("music")) ||
      ((disc === "writing" || disc === "comics") && profile.creations.includes("books")) ||
      (disc === "animation" && profile.creations.includes("anime")) ||
      (disc === "game-dev" && profile.creations.includes("games")) ||
      ((disc === "app-dev" || disc === "engineering") && profile.creations.includes("apps"));
    if (wantsIt) {
      score += 0.2;
      reasons.push("A stage for what you create");
    }
  }

  // Interest / tag overlap.
  const tags = new Set((opp.tags ?? []).map((t) => t.toLowerCase()));
  const hits = profile.interests.filter((i) => tags.has(i.toLowerCase()));
  if (hits.length) {
    score += Math.min(0.18, 0.06 * hits.length);
    reasons.push(`Tagged ${hits.slice(0, 2).join(", ")}`);
  }

  // Timing: soon-but-not-passed is best; passed dated events sink.
  const d = daysUntil(opp.window.date, now);
  if (opp.window.rolling) {
    score += 0.05;
    reasons.push("Open now — rolling entry");
  } else if (d !== null) {
    if (d < 0) {
      score -= 0.35;
      reasons.push("Deadline has passed");
    } else if (d <= 45) {
      score += 0.15;
      reasons.push(`Closes in ${d}d — act soon`);
    } else if (d <= 120) {
      score += 0.08;
      reasons.push(`${d}d out — plannable`);
    }
  }

  // Cost: free / cheap nudges up.
  const cost = (opp.cost ?? "").toLowerCase();
  if (cost.includes("free") || cost.startsWith("$0")) {
    score += 0.08;
    reasons.push("Free to enter");
  }

  // Location: near home (field) or online.
  if (opp.place.online) {
    score += 0.06;
    reasons.push("Online — no travel");
  } else if (profile.home?.lat != null && opp.place.lat != null && opp.place.lon != null) {
    const km = haversineKm(
      { lat: profile.home.lat, lon: profile.home.lon! },
      { lat: opp.place.lat, lon: opp.place.lon },
    );
    const max = profile.maxTravelKm ?? 500;
    if (km <= max) {
      score += 0.1 * (1 - km / max);
      reasons.push(`~${Math.round(km)} km from home`);
    }
  }

  // Integrity nudge: reward opportunities whose results can be strongly verified.
  if ((opp.verifyBy ?? []).some((m) => STRONG_METHODS.includes(m))) {
    score += 0.05;
    reasons.push("Result is independently verifiable");
  }

  return { fit: Math.max(0, Math.min(1, score)), reasons: reasons.slice(0, 4) };
}

/** Rank a library against a profile, filling fit + fitReasons, best first. */
export function rankOpportunities(
  opps: Opportunity[],
  profile: Profile,
  now = new Date(),
): Opportunity[] {
  return opps
    .map((o) => {
      const { fit, reasons } = scoreFit(o, profile, now);
      return { ...o, fit, fitReasons: reasons };
    })
    .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0));
}
