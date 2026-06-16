#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The Loom — Aether's heartbeat.
//
// On each pulse it reads the Codex (seed + ingested POIs), declusters them, hunts
// straight (great-circle) alignments through them, and — crucially — judges every
// line against a NULL BASELINE: how many alignments a random field of the same
// size throws by chance. Confidence rises only when the observed pattern beats
// chance. Honest lines, not wishful ones.
//
// The null is **density-matched**: it preserves how real sacred sites *cluster*
// (a clumpy field throws far more straight lines than a flat one), so the z-score
// reflects genuine alignment, not mere clustering. A uniform-random null is also
// computed, for contrast — the gap between the two is the clustering artifact the
// Source Atlas warns about.
//
// Writes public/data/hypotheses.json, which the Atlas's Loom feed reads.
//
// Dependency-free: runs on plain Node, no install required.
//   node ./scripts/heartbeat.mjs
//
// NOTE: this mirrors the math in src/lib/engine.ts. Keep the two in sync until
// they're unified behind a build step (see ROADMAP).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

const PARAMS = { tolKm: 12, minMembers: 5, minSpanKm: 400 };

// Vectorized: unit vectors + dot-product gates (mirrors src/lib/engine.ts).
const unit = ([lon, lat]) => {
  const f = lat * D2R, l = lon * D2R, cf = Math.cos(f);
  return [cf * Math.cos(l), cf * Math.sin(l), Math.sin(f)];
};
function findAlignments(points, pr = PARAMS) {
  const n = points.length;
  const V = points.map((p) => unit(p.position));
  const tolAng = pr.tolKm / R;
  const sinTol = Math.sin(tolAng); // gate on the chord, so the hot loop needs no asin
  const minSpanAng = pr.minSpanKm / R;
  const out = [];
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const Vi = V[i];
    for (let j = i + 1; j < n; j++) {
      const Vj = V[j];
      const angAB = Math.acos(clamp(Vi[0] * Vj[0] + Vi[1] * Vj[1] + Vi[2] * Vj[2]));
      if (angAB < minSpanAng) continue;
      let nx = Vi[1] * Vj[2] - Vi[2] * Vj[1];
      let ny = Vi[2] * Vj[0] - Vi[0] * Vj[2];
      let nz = Vi[0] * Vj[1] - Vi[1] * Vj[0];
      const nm = Math.hypot(nx, ny, nz) || 1;
      nx /= nm; ny /= nm; nz /= nm;
      // angAP ≤ angAB+tol  ⟺  cos(angAP) ≥ cos(angAB+tol); compare cosines, no acos.
      const cosLimit = Math.cos(angAB + tolAng);
      const members = [points[i].id, points[j].id];
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const Vk = V[k];
        const d = Vk[0] * nx + Vk[1] * ny + Vk[2] * nz; // sin(cross-track)
        if (d > sinTol || d < -sinTol) continue; // cross-track gate
        if (Vi[0] * Vk[0] + Vi[1] * Vk[1] + Vi[2] * Vk[2] < cosLimit) continue; // along-track, from a
        if (Vj[0] * Vk[0] + Vj[1] * Vk[1] + Vj[2] * Vk[2] < cosLimit) continue; // along-track, from b
        members.push(points[k].id);
      }
      if (members.length >= pr.minMembers) {
        const key = [...members].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ aId: points[i].id, bId: points[j].id, memberIds: members, count: members.length, span: angAB * R });
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

// ── uniform-random null (the naive baseline; kept for contrast) ───────────────
const randomPoint = (b) => {
  const lon = b.minLon + Math.random() * (b.maxLon - b.minLon);
  const s0 = Math.sin(b.minLat * D2R), s1 = Math.sin(b.maxLat * D2R);
  return [lon, Math.asin(s0 + Math.random() * (s1 - s0)) * R2D];
};
function monteCarloBaseline(n, bbox, pr = PARAMS, trials = 150) {
  let sum = 0, sumSq = 0;
  for (let t = 0; t < trials; t++) {
    const pts = Array.from({ length: n }, (_, i) => ({ id: "r" + i, position: randomPoint(bbox) }));
    const c = findAlignments(pts, pr).length;
    sum += c;
    sumSq += c * c;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(Math.max(0, sumSq / trials - mean * mean));
  return { mean, sd, trials, model: "uniform-random" };
}

// ── density-matched null (the honest baseline) ────────────────────────────────
// A uniform null asks "is this field more aligned than a flat random one?" — but
// real sacred sites cluster (Europe, the US Southwest), and a clumpy field throws
// straight lines for free. So we instead ask the harder, fairer question: "is this
// field more aligned than a random field with the *same clustering*?" We build
// that null by resampling from a Gaussian KDE of the real points: pick a real
// node at random, jitter it by a Gaussian whose width is the field's own median
// nearest-neighbour distance. Density (clustering) is preserved; any organized
// linear structure is destroyed — so what survives in the observed count is
// alignment beyond clustering.
const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
function medianNearestNeighborKm(pts) {
  const nn = [];
  for (let i = 0; i < pts.length; i++) {
    let best = Infinity;
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue;
      const d = haversine(pts[i].position, pts[j].position);
      if (d < best) best = d;
    }
    if (best < Infinity) nn.push(best);
  }
  nn.sort((a, b) => a - b);
  const m = nn.length;
  if (!m) return 0;
  return m % 2 ? nn[(m - 1) / 2] : (nn[m / 2 - 1] + nn[m / 2]) / 2;
}
function densityField(pts, n, hKm) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const s = pts[(Math.random() * pts.length) | 0].position;
    const east = gauss() * hKm;
    const north = gauss() * hKm;
    let lat = s[1] + (north / R) * R2D;
    let lon = s[0] + (east / (R * Math.cos(s[1] * D2R))) * R2D;
    lat = Math.max(-89.9, Math.min(89.9, lat));
    lon = (((lon + 180) % 360) + 360) % 360 - 180;
    out.push({ id: "r" + k, position: [lon, lat] });
  }
  return out;
}
function densityMatchedBaseline(pts, pr = PARAMS, trials = 60) {
  const h = medianNearestNeighborKm(pts);
  let sum = 0, sumSq = 0, sumMax = 0, sumMaxSq = 0, sumDeg = 0, sumDegSq = 0;
  for (let t = 0; t < trials; t++) {
    const al = findAlignments(densityField(pts, pts.length, h), pr);
    const c = al.length;
    const mx = al.length ? al[0].count : 0; // findAlignments sorts desc by count
    // busiest node: how many distinct lines pass through one point in a clustered
    // (but unaligned) field — the honest yardstick for a "nexus".
    const deg = {};
    let dmax = 0;
    for (const a of al) for (const id of a.memberIds) {
      const v = (deg[id] || 0) + 1;
      deg[id] = v;
      if (v > dmax) dmax = v;
    }
    sum += c; sumSq += c * c;
    sumMax += mx; sumMaxSq += mx * mx;
    sumDeg += dmax; sumDegSq += dmax * dmax;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(Math.max(0, sumSq / trials - mean * mean));
  const maxMean = sumMax / trials;
  const maxSd = Math.sqrt(Math.max(0, sumMaxSq / trials - maxMean * maxMean));
  const nodeMaxMean = sumDeg / trials;
  const nodeMaxSd = Math.sqrt(Math.max(0, sumDegSq / trials - nodeMaxMean * nodeMaxMean));
  return {
    mean, sd, trials, bandwidthKm: +h.toFixed(1),
    maxMean, maxSd, nodeMaxMean, nodeMaxSd, model: "density-matched-kde",
  };
}

const zScore = (obs, base) => (base.sd < 1e-9 ? (obs > base.mean ? 99 : 0) : (obs - base.mean) / base.sd);
const zAgainst = (obs, mean, sd) => (sd < 1e-9 ? (obs > mean ? 99 : 0) : (obs - mean) / sd);
const confidenceFromZ = (z) => 1 / (1 + Math.exp(-(z - 1) * 0.9));

const DECLUSTER_KM = 40;
function declusterPoints(pts, radiusKm = DECLUSTER_KM) {
  const used = new Array(pts.length).fill(false);
  const clusters = [];
  for (let i = 0; i < pts.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const members = [pts[i]];
    for (let j = i + 1; j < pts.length; j++) {
      if (!used[j] && haversine(pts[i].position, pts[j].position) <= radiusKm) {
        used[j] = true;
        members.push(pts[j]);
      }
    }
    const lon = members.reduce((s, m) => s + m.position[0], 0) / members.length;
    const lat = members.reduce((s, m) => s + m.position[1], 0) / members.length;
    clusters.push({ id: pts[i].id, position: [lon, lat], memberIds: members.map((m) => m.id) });
  }
  return clusters;
}

// ── pulse ────────────────────────────────────────────────────────────────────

// Load the curated seed plus any ingested sites (poi.ingested.json), if present.
const poiFile = JSON.parse(readFileSync(join(ROOT, "src/data/poi.seed.json"), "utf8"));
let pois = poiFile.pois;
try {
  const ingested = JSON.parse(readFileSync(join(ROOT, "src/data/poi.ingested.json"), "utf8"));
  if (Array.isArray(ingested.pois)) pois = [...pois, ...ingested.pois];
} catch {
  /* no ingested file yet */
}

const rawPoints = pois.map((p) => ({ id: p.id, position: [p.lon, p.lat] }));
const clusters = declusterPoints(rawPoints);
const points = clusters.map((c) => ({ id: c.id, position: c.position }));

console.log(
  `☉ Loom pulse — ${pois.length} sites in the Codex; ${points.length} after declustering ≤${DECLUSTER_KM}km; analyzing all ${points.length}`,
);

const t0 = Date.now();
const aligns = findAlignments(points);
const box = bboxOf(points);
const DENSITY_TRIALS = 60;
const UNIFORM_TRIALS = 60;
const dBase = densityMatchedBaseline(points, PARAMS, DENSITY_TRIALS);
const uBase = monteCarloBaseline(points.length, box, PARAMS, UNIFORM_TRIALS);

const now = new Date().toISOString();
const z = zScore(aligns.length, dBase); // honest: vs a null with the SAME clustering
const zUniform = zScore(aligns.length, uBase); // naive: vs a flat field (inflated)

console.log(`  observed alignments: ${aligns.length}`);
console.log(
  `  density-matched null: ${dBase.mean.toFixed(2)} ± ${dBase.sd.toFixed(2)} over ${dBase.trials} fields (KDE bandwidth ≈ ${dBase.bandwidthKm} km)`,
);
console.log(`  uniform-random null (contrast): ${uBase.mean.toFixed(2)} ± ${uBase.sd.toFixed(2)} over ${uBase.trials} fields`);

const hypotheses = aligns.slice(0, 12).map((a, i) => {
  // Honest per-line significance: does this line have more members than the
  // *longest* line the density-matched null typically produces?
  const lineZ = zAgainst(a.count, dBase.maxMean, dBase.maxSd);
  return {
    id: `al_${now}_${i}`,
    kind: "alignment",
    createdAt: now,
    memberIds: a.memberIds,
    tier: "C-traditional",
    confidence: +confidenceFromZ(lineZ).toFixed(3),
    observed: a.count,
    expected: +dBase.maxMean.toFixed(2),
    sd: +dBase.maxSd.toFixed(2),
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
  .map(([id, c], i) => {
    // Honest nexus significance: a busy node only means something if it beats the
    // busiest node of a density-matched (clustered but unaligned) field.
    const nz = zAgainst(c, dBase.nodeMaxMean, dBase.nodeMaxSd);
    return {
      id: `nx_${now}_${i}`,
      kind: "nexus",
      createdAt: now,
      memberIds: [id],
      tier: "C-traditional",
      confidence: +confidenceFromZ(nz).toFixed(3),
      observed: c,
      expected: +dBase.nodeMaxMean.toFixed(1),
      sd: +dBase.nodeMaxSd.toFixed(1),
      z: +nz.toFixed(2),
      note: `${pois.find((p) => p.id === id)?.name ?? id} sits on ${c} alignment lines (chance field's busiest node: ~${dBase.nodeMaxMean.toFixed(0)}).`,
    };
  });

const all = [...hypotheses, ...nexus];

mkdirSync(join(ROOT, "public/data"), { recursive: true });
writeFileSync(
  join(ROOT, "public/data/hypotheses.json"),
  JSON.stringify(
    {
      generatedAt: now,
      engine: "aether-loom v0.2",
      note: "Each hypothesis is reported against a density-matched null (a random field with the SAME clustering as the real sites), so z reflects alignment, not clustering. A uniform-random null is included for contrast.",
      params: PARAMS,
      analyzed: points.length,
      total: pois.length,
      baseline: dBase,
      baselineUniform: uBase,
      overallZ: +z.toFixed(2),
      overallZUniform: +zUniform.toFixed(2),
      hypotheses: all,
    },
    null,
    2,
  ),
);

console.log(`  → wrote ${all.length} hypotheses (${hypotheses.length} alignments, ${nexus.length} nexus) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(
  `  overall z vs density-matched null = ${z.toFixed(2)}  (the honest number)` +
    `\n  overall z vs uniform null      = ${zUniform.toFixed(2)}  (inflated — the gap is the clustering artifact)`,
);
console.log("✦ pulse complete → public/data/hypotheses.json");
