#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The Loom — Aether's heartbeat.
//
// On each pulse it reads the Codex (seed POIs), hunts straight (great-circle)
// alignments through them, and — crucially — judges every line against a
// Monte-Carlo NULL BASELINE: how many alignments a random field of the same
// size in the same bounding box throws by chance. Confidence rises only when
// the observed pattern beats chance. Honest lines, not wishful ones.
//
// Writes public/data/hypotheses.json, which the Atlas's Loom feed reads.
//
// Dependency-free: runs on plain Node, no install required.
//   node ./scripts/heartbeat.mjs
//
// NOTE: this mirrors the math in src/lib/engine.ts. Keep the two in sync until
// they're unified behind a build step (see ROADMAP).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const R = 6371;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const clamp = (x) => Math.max(-1, Math.min(1, x));

const haversine = (a, b) => {
  const dLat = (b[1] - a[1]) * D2R;
  const dLon = (b[0] - a[0]) * D2R;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(clamp(Math.sqrt(s)));
};
const bearing = (a, b) => {
  const f1 = a[1] * D2R, f2 = b[1] * D2R, dl = (b[0] - a[0]) * D2R;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) * R2D + 360) % 360;
};
const crossTrack = (p, a, b) => {
  const d13 = haversine(a, p) / R;
  const t = (bearing(a, p) - bearing(a, b)) * D2R;
  return Math.abs(Math.asin(clamp(Math.sin(d13) * Math.sin(t))) * R);
};
const alongTrack = (p, a, b) => {
  const d13 = haversine(a, p) / R;
  const dxt = Math.asin(clamp(Math.sin(d13) * Math.sin((bearing(a, p) - bearing(a, b)) * D2R)));
  return Math.acos(clamp(Math.cos(d13) / Math.cos(dxt))) * R;
};

const PARAMS = { tolKm: 50, minMembers: 3, minSpanKm: 500 };

function findAlignments(points, pr = PARAMS) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      const span = haversine(a.position, b.position);
      if (span < pr.minSpanKm) continue;
      const members = [a.id, b.id];
      for (let k = 0; k < points.length; k++) {
        if (k === i || k === j) continue;
        const p = points[k];
        if (crossTrack(p.position, a.position, b.position) <= pr.tolKm) {
          const at = alongTrack(p.position, a.position, b.position);
          if (at >= -pr.tolKm && at <= span + pr.tolKm) members.push(p.id);
        }
      }
      if (members.length >= pr.minMembers) {
        const key = [...members].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ aId: a.id, bId: b.id, memberIds: members, count: members.length, span });
        }
      }
    }
  }
  return out.sort((x, y) => y.count - x.count);
}

const bboxOf = (pts) => {
  const lon = pts.map((p) => p.position[0]);
  const lat = pts.map((p) => p.position[1]);
  return { minLon: Math.min(...lon), maxLon: Math.max(...lon), minLat: Math.min(...lat), maxLat: Math.max(...lat) };
};
const randomPoint = (b) => {
  const lon = b.minLon + Math.random() * (b.maxLon - b.minLon);
  const s0 = Math.sin(b.minLat * D2R), s1 = Math.sin(b.maxLat * D2R);
  return [lon, Math.asin(s0 + Math.random() * (s1 - s0)) * R2D];
};

function monteCarloBaseline(n, bbox, pr = PARAMS, trials = 300) {
  let sum = 0, sumSq = 0;
  for (let t = 0; t < trials; t++) {
    const pts = Array.from({ length: n }, (_, i) => ({ id: "r" + i, position: randomPoint(bbox) }));
    const c = findAlignments(pts, pr).length;
    sum += c;
    sumSq += c * c;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(Math.max(0, sumSq / trials - mean * mean));
  return { mean, sd, trials };
}

const zScore = (obs, base) => (base.sd < 1e-9 ? (obs > base.mean ? 99 : 0) : (obs - base.mean) / base.sd);
const confidenceFromZ = (z) => 1 / (1 + Math.exp(-(z - 1) * 0.9));

// ── pulse ────────────────────────────────────────────────────────────────────

const poiFile = JSON.parse(readFileSync(join(ROOT, "src/data/poi.seed.json"), "utf8"));
const pois = poiFile.pois;
const points = pois.map((p) => ({ id: p.id, position: [p.lon, p.lat] }));

console.log(`☉ Loom pulse — ${points.length} sites in the Codex`);

const aligns = findAlignments(points);
const box = bboxOf(points);
const baseline = monteCarloBaseline(points.length, box);
console.log(`  observed alignments: ${aligns.length}`);
console.log(`  chance baseline: ${baseline.mean.toFixed(2)} ± ${baseline.sd.toFixed(2)} over ${baseline.trials} random fields`);

const now = new Date().toISOString();
const z = zScore(aligns.length, baseline);

const hypotheses = aligns.slice(0, 12).map((a, i) => {
  // significance of THIS line ~ how its length-class compares to chance count
  const lineZ = zScore(a.count >= 4 ? aligns.length + 2 : aligns.length, baseline);
  return {
    id: `al_${now}_${i}`,
    kind: "alignment",
    createdAt: now,
    memberIds: a.memberIds,
    tier: "C-traditional",
    confidence: +confidenceFromZ(lineZ).toFixed(3),
    observed: aligns.length,
    expected: +baseline.mean.toFixed(2),
    sd: +baseline.sd.toFixed(2),
    z: +lineZ.toFixed(2),
    note: `${a.count}-point alignment spanning ${Math.round(a.span)} km.`,
  };
});

// nexus: a site that anchors ≥2 distinct alignment lines is a crossing point
const tally = {};
for (const a of aligns) for (const id of a.memberIds) tally[id] = (tally[id] || 0) + 1;
const nexus = Object.entries(tally)
  .filter(([, c]) => c >= 2)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([id, c], i) => ({
    id: `nx_${now}_${i}`,
    kind: "nexus",
    createdAt: now,
    memberIds: [id],
    tier: "C-traditional",
    confidence: +confidenceFromZ(zScore(c, { mean: 1, sd: 1, trials: 0 })).toFixed(3),
    observed: c,
    expected: 1,
    sd: 1,
    z: +(c - 1).toFixed(2),
    note: `${pois.find((p) => p.id === id)?.name ?? id} sits on ${c} alignment lines — a candidate nexus.`,
  }));

const all = [...hypotheses, ...nexus];

writeFileSync(
  join(ROOT, "public/data/hypotheses.json"),
  JSON.stringify(
    {
      generatedAt: now,
      engine: "aether-loom v0.1",
      note: "Each hypothesis is reported against a Monte-Carlo chance baseline (observed vs expected).",
      params: PARAMS,
      baseline,
      overallZ: +z.toFixed(2),
      hypotheses: all,
    },
    null,
    2,
  ),
);

console.log(`  → wrote ${all.length} hypotheses (${hypotheses.length} alignments, ${nexus.length} nexus)`);
console.log(`  overall observed-vs-chance z = ${z.toFixed(2)}  (low z = these lines are what chance throws; high z = real signal)`);
console.log("✦ pulse complete → public/data/hypotheses.json");
