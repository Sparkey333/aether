// The Loom, in-app. Same engine as scripts/heartbeat.mjs, but runnable from a
// button inside Aether — no terminal. Persists the result to localStorage so the
// Dashboard and the Atlas's Loom feed both read the latest pulse.

import {
  confidenceFromZ,
  declusterPoints,
  DECLUSTER_KM,
  densityMatchedBaseline,
  findAlignments,
  haversine,
  zAgainst,
  zScore,
  type AlignParams,
  type GeoPoint,
} from "./engine";
import type { Hypothesis, POI } from "./types";

const PARAMS: AlignParams = { tolKm: 12, minMembers: 5, minSpanKm: 400 };
const STORAGE_KEY = "aether.hypotheses.v1";
// Alignment detection is O(n³); cap the working set so an in-app pulse stays snappy.
// The map still shows every site — only the pattern hunt is capped (and we say so).
// The CLI heartbeat (scripts/heartbeat.mjs) runs the full, uncapped pulse.
const MAX_LOOM_NODES = 160;
const TRIALS = 30;

export interface PulseResult {
  generatedAt: string;
  engine: string;
  baseline: { mean: number; sd: number; trials: number };
  overallZ: number;
  analyzed: number;
  total: number;
  hypotheses: Hypothesis[];
}

/** One heartbeat: hunt alignments + nexus, judged against a chance baseline. */
export function runPulse(pois: POI[]): PulseResult {
  // Decluster first: tight clusters (Sedona vortexes, the DC cluster) collapse to
  // one node so they don't inflate the alignment count. Then cap the working set
  // (callers pass the curated seed first, so it is always analyzed).
  const rawPoints: GeoPoint[] = pois.map((p) => ({ id: p.id, position: [p.lon, p.lat] }));
  const clustersAll = declusterPoints(rawPoints, DECLUSTER_KM);
  const clusters = clustersAll.slice(0, MAX_LOOM_NODES);
  const posOf = new Map<string, [number, number]>(clusters.map((c) => [c.id, c.position]));
  const points: GeoPoint[] = clusters.map((c) => ({ id: c.id, position: c.position }));

  const aligns = findAlignments(points, PARAMS);
  // The honest null: a random field with the SAME clustering as the real sites,
  // so z reflects alignment, not the fact that sacred places clump together.
  const baseline = densityMatchedBaseline(points, PARAMS, TRIALS);
  const now = new Date().toISOString();
  const overallZ = zScore(aligns.length, baseline);

  const alignmentHyps: Hypothesis[] = aligns.slice(0, 12).map((a, i) => {
    const span = haversine(posOf.get(a.aId)!, posOf.get(a.bId)!);
    // Does this line have more members than the *longest* line the null throws?
    const lineZ = zAgainst(a.count, baseline.maxMean ?? 0, baseline.maxSd ?? 0);
    return {
      id: `al_${now}_${i}`,
      kind: "alignment",
      createdAt: now,
      memberIds: a.memberIds,
      tier: "C-traditional",
      confidence: +confidenceFromZ(lineZ).toFixed(3),
      observed: a.count,
      expected: +(baseline.maxMean ?? 0).toFixed(2),
      sd: +(baseline.maxSd ?? 0).toFixed(2),
      z: +lineZ.toFixed(2),
      note: `${a.count}-point alignment spanning ${Math.round(span)} km.`,
    };
  });

  const tally: Record<string, number> = {};
  for (const a of aligns) for (const id of a.memberIds) tally[id] = (tally[id] || 0) + 1;
  const nexusHyps: Hypothesis[] = Object.entries(tally)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, c], i) => {
      // A busy node only counts if it beats the busiest node of the clustered null.
      const nz = zAgainst(c, baseline.nodeMaxMean ?? 0, baseline.nodeMaxSd ?? 0);
      return {
        id: `nx_${now}_${i}`,
        kind: "nexus",
        createdAt: now,
        memberIds: [id],
        tier: "C-traditional",
        confidence: +confidenceFromZ(nz).toFixed(3),
        observed: c,
        expected: +(baseline.nodeMaxMean ?? 0).toFixed(1),
        sd: +(baseline.nodeMaxSd ?? 0).toFixed(1),
        z: +nz.toFixed(2),
        note: `${pois.find((p) => p.id === id)?.name ?? id} sits on ${c} alignment lines (chance field's busiest node: ~${(baseline.nodeMaxMean ?? 0).toFixed(0)}).`,
      };
    });

  return {
    generatedAt: now,
    engine: "aether-loom v0.2 (in-app)",
    baseline: {
      mean: +baseline.mean.toFixed(4),
      sd: +baseline.sd.toFixed(4),
      trials: baseline.trials,
    },
    overallZ: +overallZ.toFixed(2),
    analyzed: points.length,
    total: pois.length,
    hypotheses: [...alignmentHyps, ...nexusHyps],
  };
}

export function saveHypotheses(r: PulseResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function loadHypotheses(): PulseResult | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? (JSON.parse(s) as PulseResult) : null;
  } catch {
    return null;
  }
}
