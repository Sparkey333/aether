// ─────────────────────────────────────────────────────────────────────────────
// Aether geometry & pattern engine
//
// Pure functions, no side effects. Three jobs:
//   1. Spherical geo math (haversine, bearing, cross/along-track distance).
//   2. The Becker-Hagens "EarthStar" planetary grid — SYNTHESIZED from the
//      icosa-dodecahedron, because (per the Source Atlas gaps doctrine) no
//      redistributable machine-readable global ley dataset exists. We generate
//      the 62 nodes (12 icosa + 20 dodeca + 30 edge) and 15 great circles, and
//      anchor node 1 at Giza, as the tradition does. Tier: C-traditional.
//   3. Alignment detection over POIs, with a Monte-Carlo NULL BASELINE so an
//      observed line is always reported against how many a random field of the
//      same size would throw by chance (Broadbent/Behrend). Honesty over
//      wishful lines.
// ─────────────────────────────────────────────────────────────────────────────

export type LngLat = [number, number]; // [lon, lat] in degrees

const R = 6371; // km
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const clamp = (x: number) => Math.max(-1, Math.min(1, x));

// ── spherical geo ────────────────────────────────────────────────────────────

export function haversine(a: LngLat, b: LngLat): number {
  const dLat = (b[1] - a[1]) * D2R;
  const dLon = (b[0] - a[0]) * D2R;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(clamp(Math.sqrt(s)));
}

export function bearing(a: LngLat, b: LngLat): number {
  const f1 = a[1] * D2R;
  const f2 = b[1] * D2R;
  const dl = (b[0] - a[0]) * D2R;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Perpendicular (cross-track) distance, km, of p from the great circle a→b. */
export function crossTrack(p: LngLat, a: LngLat, b: LngLat): number {
  const d13 = haversine(a, p) / R;
  const t13 = bearing(a, p) * D2R;
  const t12 = bearing(a, b) * D2R;
  return Math.abs(Math.asin(clamp(Math.sin(d13) * Math.sin(t13 - t12))) * R);
}

/** Along-track distance, km, from a toward b of p's projection onto a→b. */
export function alongTrack(p: LngLat, a: LngLat, b: LngLat): number {
  const d13 = haversine(a, p) / R;
  const dxt = Math.asin(clamp(Math.sin(d13) * Math.sin((bearing(a, p) - bearing(a, b)) * D2R)));
  return Math.acos(clamp(Math.cos(d13) / Math.cos(dxt))) * R;
}

// ── 3-vector helpers (unit sphere) ───────────────────────────────────────────

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: V3): V3 => {
  const m = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / m, a[1] / m, a[2] / m];
};

function toCart([lon, lat]: LngLat): V3 {
  const f = lat * D2R;
  const l = lon * D2R;
  return [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)];
}
function toLngLat([x, y, z]: V3): LngLat {
  return [Math.atan2(y, x) * R2D, Math.asin(clamp(z)) * R2D];
}

/** Rodrigues rotation that carries unit vector u onto unit vector v. */
function rotateAlign(u: V3, v: V3): (p: V3) => V3 {
  u = norm(u);
  v = norm(v);
  const axis = cross(u, v);
  const s = Math.hypot(axis[0], axis[1], axis[2]);
  const c = dot(u, v);
  if (s < 1e-9) return (p) => p;
  const k = norm(axis);
  return (p: V3) => {
    const kxp = cross(k, p);
    const kdp = dot(k, p);
    return add(add(scl(p, c), scl(kxp, s)), scl(k, kdp * (1 - c)));
  };
}

// ── the Becker-Hagens planetary grid ─────────────────────────────────────────

export interface GridNode {
  id: string;
  position: LngLat;
  kind: "icosa" | "dodeca" | "edge";
}
export interface GridCircle {
  id: string;
  /** great circle sampled & split at the antimeridian into draw-able segments */
  segments: LngLat[][];
}
export interface PlanetaryGrid {
  nodes: GridNode[];
  circles: GridCircle[];
}

const GIZA: LngLat = [31.1342, 29.9792]; // Great Pyramid — the tradition's node 1

function icosahedron(): V3[] {
  const p = (1 + Math.sqrt(5)) / 2;
  const raw: V3[] = [
    [0, 1, p], [0, -1, p], [0, 1, -p], [0, -1, -p],
    [1, p, 0], [-1, p, 0], [1, -p, 0], [-1, -p, 0],
    [p, 0, 1], [-p, 0, 1], [p, 0, -1], [-p, 0, -1],
  ];
  return raw.map(norm);
}

/** Split a sampled ring into segments wherever it crosses the ±180° meridian. */
function splitDateline(pts: LngLat[]): LngLat[][] {
  const segs: LngLat[][] = [];
  let cur: LngLat[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i > 0 && Math.abs(pts[i][0] - pts[i - 1][0]) > 180) {
      if (cur.length > 1) segs.push(cur);
      cur = [];
    }
    cur.push(pts[i]);
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

function greatCircle(n: V3, id: string, samples = 256): GridCircle {
  const seed: V3 = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u = norm(cross(n, seed));
  const v = cross(n, u); // unit, since n & u are orthonormal
  const pts: LngLat[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 2 * Math.PI;
    pts.push(toLngLat(add(scl(u, Math.cos(t)), scl(v, Math.sin(t)))));
  }
  return { id, segments: splitDateline(pts) };
}

/**
 * Generate the planetary grid, rigidly rotated so icosa node 1 sits at `anchor`
 * (Giza by default). Returns 62 nodes and the 15 icosahedral great circles.
 */
export function planetaryGrid(anchor: LngLat = GIZA): PlanetaryGrid {
  const base = icosahedron();
  const rot = rotateAlign(base[0], toCart(anchor));
  const v = base.map(rot);

  // edges: adjacent icosa vertices share dot ≈ 1/√5 ≈ 0.447
  const edges: [number, number][] = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      if (Math.abs(dot(v[i], v[j]) - 0.4472) < 0.05) edges.push([i, j]);

  // faces: mutually-adjacent triples → dodecahedron vertices (face centroids)
  const isEdge = (a: number, b: number) =>
    edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const dodeca: V3[] = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      for (let k = j + 1; k < 12; k++)
        if (isEdge(i, j) && isEdge(j, k) && isEdge(i, k))
          dodeca.push(norm(add(add(v[i], v[j]), v[k])));

  const nodes: GridNode[] = [];
  v.forEach((p, i) => nodes.push({ id: `i${i + 1}`, position: toLngLat(p), kind: "icosa" }));
  dodeca.forEach((p, i) => nodes.push({ id: `d${i + 1}`, position: toLngLat(p), kind: "dodeca" }));
  edges.forEach(([a, b], i) =>
    nodes.push({ id: `e${i + 1}`, position: toLngLat(norm(add(v[a], v[b]))), kind: "edge" }),
  );

  // 15 great circles: each icosahedral mirror plane contains a pair of opposite
  // edges. The plane normal = cross(edge direction, edge midpoint). Dedupe the
  // 30 edge-derived normals down to the 15 distinct planes.
  const normals: V3[] = [];
  for (const [a, b] of edges) {
    const dir = norm([v[b][0] - v[a][0], v[b][1] - v[a][1], v[b][2] - v[a][2]]);
    const mid = norm(add(v[a], v[b]));
    const n = norm(cross(dir, mid));
    if (!normals.some((m) => Math.abs(dot(m, n)) > 0.999)) normals.push(n);
  }
  const circles = normals.map((n, i) => greatCircle(n, `gc${i + 1}`));

  return { nodes, circles };
}

// ── alignment detection + chance baseline ────────────────────────────────────

export interface AlignParams {
  tolKm: number; // corridor half-width
  minMembers: number; // points required to call it a line
  minSpanKm: number; // ignore trivially-short pairs
}
export const DEFAULT_ALIGN: AlignParams = { tolKm: 12, minMembers: 5, minSpanKm: 400 };

export interface Alignment {
  id: string;
  aId: string;
  bId: string;
  memberIds: string[];
  count: number;
}

export interface GeoPoint {
  id: string;
  position: LngLat;
}

export const DECLUSTER_KM = 40;

export interface Cluster {
  /** id of the representative point (a real POI id) */
  id: string;
  /** cluster centroid */
  position: LngLat;
  /** every original id folded into this cluster */
  memberIds: string[];
}

/**
 * Collapse near-duplicate points (within `radiusKm`) into single representative
 * nodes. Without this, tight clusters — the four Sedona vortexes, the DC cluster —
 * are trivially collinear with everything and inflate the alignment count, the
 * dense-field artifact the Source Atlas warns about. The Loom runs on the
 * declustered set so a "line" means distinct places, not the same spot counted
 * four times.
 */
export function declusterPoints(points: GeoPoint[], radiusKm = DECLUSTER_KM): Cluster[] {
  const used = new Array(points.length).fill(false);
  const clusters: Cluster[] = [];
  for (let i = 0; i < points.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const members = [points[i]];
    for (let j = i + 1; j < points.length; j++) {
      if (!used[j] && haversine(points[i].position, points[j].position) <= radiusKm) {
        used[j] = true;
        members.push(points[j]);
      }
    }
    const lon = members.reduce((s, m) => s + m.position[0], 0) / members.length;
    const lat = members.reduce((s, m) => s + m.position[1], 0) / members.length;
    clusters.push({ id: points[i].id, position: [lon, lat], memberIds: members.map((m) => m.id) });
  }
  return clusters;
}

/**
 * Find straight (great-circle) alignments through a point field.
 *
 * Vectorized: every point is converted once to a unit vector, then membership is
 * a dot-product test against the plane normal of each candidate pair — far
 * cheaper than recomputing bearings/haversines per check (the O(n³) loop runs
 * thousands of times under the Monte-Carlo baseline, so this matters).
 */
export function findAlignments(points: GeoPoint[], pr: AlignParams = DEFAULT_ALIGN): Alignment[] {
  const n = points.length;
  const V = points.map((p) => toCart(p.position));
  const tolAng = pr.tolKm / R; // angular cross-track tolerance
  const minSpanAng = pr.minSpanKm / R;
  const out: Alignment[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const Vi = V[i];
      const Vj = V[j];
      const angAB = Math.acos(clamp(dot(Vi, Vj)));
      if (angAB < minSpanAng) continue;
      const nrm = norm(cross(Vi, Vj)); // great-circle plane normal
      const members = [points[i].id, points[j].id];
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const Vk = V[k];
        if (Math.abs(Math.asin(clamp(dot(Vk, nrm)))) > tolAng) continue; // cross-track gate
        const angAP = Math.acos(clamp(dot(Vi, Vk)));
        const angBP = Math.acos(clamp(dot(Vj, Vk)));
        if (angAP <= angAB + tolAng && angBP <= angAB + tolAng) members.push(points[k].id);
      }
      if (members.length >= pr.minMembers) {
        const key = [...members].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ id: `al_${out.length}`, aId: points[i].id, bId: points[j].id, memberIds: members, count: members.length });
        }
      }
    }
  }
  return out.sort((x, y) => y.count - x.count);
}

export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export function bboxOf(points: GeoPoint[]): BBox {
  const lons = points.map((p) => p.position[0]);
  const lats = points.map((p) => p.position[1]);
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

/** Area-correct random point in a bbox (uniform on the sphere within the box). */
function randomPoint(b: BBox, rand: () => number): LngLat {
  const lon = b.minLon + rand() * (b.maxLon - b.minLon);
  const s0 = Math.sin(b.minLat * D2R);
  const s1 = Math.sin(b.maxLat * D2R);
  const lat = Math.asin(s0 + rand() * (s1 - s0)) * R2D;
  return [lon, lat];
}

export interface Baseline {
  mean: number;
  sd: number;
  trials: number;
}

/**
 * Monte-Carlo null: scatter `n` random points in `bbox` `trials` times and
 * count how many alignments arise by chance. This is what an observed count is
 * judged against — the difference between a real pattern and a dense-field
 * artifact.
 */
export function monteCarloBaseline(
  n: number,
  bbox: BBox,
  pr: AlignParams = DEFAULT_ALIGN,
  trials = 200,
  rand: () => number = Math.random,
): Baseline {
  let sum = 0;
  let sumSq = 0;
  for (let t = 0; t < trials; t++) {
    const pts: GeoPoint[] = Array.from({ length: n }, (_, i) => ({
      id: `r${i}`,
      position: randomPoint(bbox, rand),
    }));
    const c = findAlignments(pts, pr).length;
    sum += c;
    sumSq += c * c;
  }
  const mean = sum / trials;
  const variance = Math.max(0, sumSq / trials - mean * mean);
  return { mean, sd: Math.sqrt(variance), trials };
}

/** z-score of an observed count against a chance baseline. */
export function zScore(observed: number, base: Baseline): number {
  if (base.sd < 1e-9) return observed > base.mean ? 99 : 0;
  return (observed - base.mean) / base.sd;
}

/** Map a z-score to a 0..1 confidence (logistic; z≈2 → ~0.75, z≈4 → ~0.93). */
export function confidenceFromZ(z: number): number {
  return 1 / (1 + Math.exp(-(z - 1) * 0.9));
}
