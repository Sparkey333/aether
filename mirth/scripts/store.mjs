// ─────────────────────────────────────────────────────────────────────────────
// The store — Mirth's memory. Stable bit identity, the persistent corpus
// (catalog), the performance log, and the honest math shared across the Loom,
// the promoter, and the reaction CLIs. Pure Node, zero deps.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

// A bit's identity is its IDEA, not its wording — so the same fused premise maps
// to the same id across pulses (template-written or room-written). That's what
// lets a bit accumulate performances and graduate tiers over time.
const fnv1a = (str) => {
  let h = 0x811c9dc5;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
};
export const sigId = (spec) =>
  "bit_" + fnv1a([spec.subject.word, spec.pivot.word, spec.frame.id, spec.ancient, spec.modern].join("|"));

// honest math (mirrors the geomancy engine / heartbeat).
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export const sd = (a) => { const m = mean(a); return Math.sqrt(Math.max(0, mean(a.map((x) => (x - m) ** 2)))); };
export const zScore = (obs, m, s) => (s < 1e-9 ? (obs > m ? 99 : 0) : (obs - m) / s);
export const confidenceFromZ = (z) => 1 / (1 + Math.exp(-(z - 1) * 0.9));

// the persona's living state — distinct from the seed's starting config.
export function initPersona(seed) {
  return {
    id: seed.id, name: seed.name, form: seed.form,
    level: seed.level, practiceXp: seed.practiceXp || 0,
    movePool: seed.movePool, setList: [], evolution: seed.evolution,
    voice: seed.voice, readyToEvolve: false,
  };
}

export function loadCatalog(file, personaSeed) {
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  return { updatedAt: new Date().toISOString(), persona: initPersona(personaSeed), bits: {} };
}
export function saveCatalog(file, cat) {
  cat.updatedAt = new Date().toISOString();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(cat, null, 2));
}

export function loadPerformances(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
export function appendPerformance(file, perf) {
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(perf) + "\n");
}

export const tierCounts = (cat) => {
  const c = { "A-killed": 0, "B-crafted": 0, "C-styled": 0, "D-raw": 0 };
  for (const id in cat.bits) c[cat.bits[id].tier] = (c[cat.bits[id].tier] || 0) + 1;
  return c;
};
