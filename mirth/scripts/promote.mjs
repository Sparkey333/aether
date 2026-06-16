#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// promote — the moat. The only path to A-killed.
//
// It reads the corpus and the performance log, computes the room's LAUGH
// BASELINE (the Monte-Carlo honesty of the geomancy Loom, turned on funny: did
// this bit beat what this room laughs at on average?), and promotes only the
// bits whose real laugh-z clears the bar across enough rooms. Then it grows the
// persona — set list, XP, and the gate to its next evolution.
//
// Two refusals are load-bearing:
//   1. SYNTHETIC reactions (laugh tracks, rehearsals) never count toward A.
//   2. A bit needs ENOUGH real rooms (minPerf) — one good night isn't proof.
//
//   node scripts/promote.mjs   →   writes out/catalog.json + out/setlist.json
// ─────────────────────────────────────────────────────────────────────────────

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { loadCatalog, saveCatalog, loadPerformances, mean, sd, zScore, confidenceFromZ, tierCounts } from "./store.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const persona = JSON.parse(readFileSync(join(ROOT, "data/persona.seed.json"), "utf8"));
const CATALOG = join(ROOT, "out/catalog.json");
const PERFS = join(ROOT, "out/performances.jsonl");

const PARAMS = { minPerf: 2, zKill: 1.0, killXp: 25, xpPerLevel: 100 };

const cat = loadCatalog(CATALOG, persona);
const perfs = loadPerformances(PERFS);
const rate = (p) => p.laughs / Math.max(1, p.audienceSize);

// only performances of bits we know, split by whether the room was real.
const known = perfs.filter((p) => cat.bits[p.bitId]);
const real = known.filter((p) => !p.synthetic);
const synthetic = known.filter((p) => p.synthetic);

console.log(`🎭 promote — corpus ${Object.keys(cat.bits).length} bits; ${real.length} real reactions, ${synthetic.length} synthetic (ignored for A)`);

if (!real.length) {
  console.log("  no real reactions yet — nothing can earn A. Perform a set and log it with react.mjs.");
  process.exit(0);
}

// the room's baseline warmth: the spread of laugh-rates across all real perfs.
const baseVals = real.map(rate);
const baseMean = mean(baseVals);
const baseSd = sd(baseVals);
console.log(`  laugh baseline: ${(baseMean * 100).toFixed(0)}% ± ${(baseSd * 100).toFixed(0)}pts across ${real.length} real performances`);

// group real performances by bit.
const byBit = {};
for (const p of real) (byBit[p.bitId] ||= []).push(p);

let newA = 0, refusedSynthetic = 0, refusedThin = 0;
const promoted = [];

for (const id in cat.bits) {
  const bit = cat.bits[id];
  const mine = byBit[id] || [];
  const mysynth = synthetic.filter((p) => p.bitId === id);

  // record everything onto the bit (kept either way — the shelf remembers).
  bit.performances = [...mine, ...mysynth];

  if (!mine.length) continue;

  const observed = mean(mine.map(rate));
  const z = zScore(observed, baseMean, baseSd);
  const conf = confidenceFromZ(z);
  bit.room = {
    realPerformances: mine.length,
    observed: +observed.toFixed(3),
    expected: +baseMean.toFixed(3),
    sd: +baseSd.toFixed(3),
    z: +z.toFixed(2),
    confidence: +conf.toFixed(3),
    judgedAt: new Date().toISOString(),
  };

  const beatsBar = z >= PARAMS.zKill;
  const enoughRooms = mine.length >= PARAMS.minPerf;

  if (bit.tier === "A-killed") continue; // already earned
  if (beatsBar && !enoughRooms) { refusedThin++; continue; } // one good night ≠ proof
  if (beatsBar && enoughRooms) {
    bit.tier = "A-killed";
    if (!cat.persona.setList.includes(id)) {
      cat.persona.setList.push(id);
      cat.persona.practiceXp += PARAMS.killXp;
      newA++;
      promoted.push({ id, z: bit.room.z, text: bit.text });
    }
  }
}

// also count bits that have ONLY synthetic reactions and would have looked great.
for (const id in cat.bits) {
  if (byBit[id]) continue;
  const myS = synthetic.filter((p) => p.bitId === id);
  if (myS.length && mean(myS.map(rate)) >= baseMean) refusedSynthetic++;
}

// grow the persona.
cat.persona.level = 1 + Math.floor(cat.persona.practiceXp / PARAMS.xpPerLevel);
const need = cat.persona.evolution.killedNeeded;
cat.persona.readyToEvolve = cat.persona.setList.length >= need;

saveCatalog(CATALOG, cat);

// a human-readable set list of what the room actually blessed.
const setList = cat.persona.setList.map((id) => ({
  id, z: cat.bits[id].room?.z, text: cat.bits[id].text,
}));
writeFileSync(join(ROOT, "out/setlist.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  persona: { name: cat.persona.name, form: cat.persona.form, level: cat.persona.level, practiceXp: cat.persona.practiceXp },
  killedNeeded: need, killedSoFar: cat.persona.setList.length, readyToEvolve: cat.persona.readyToEvolve,
  setList,
}, null, 2));

const tc = tierCounts(cat);
console.log(`  promoted to A this run: ${newA}${newA ? "  🏆" : ""}`);
if (refusedThin) console.log(`  held back ${refusedThin} bit(s) that beat the bar in only one room — A needs ${PARAMS.minPerf}+`);
if (refusedSynthetic) console.log(`  refused ${refusedSynthetic} synthetic-only 'win(s)' — a laugh track grants nothing`);
console.log(`  corpus now — A:${tc["A-killed"]} B:${tc["B-crafted"]} C:${tc["C-styled"]}`);
console.log(`  ${cat.persona.name}: Lv.${cat.persona.level}, ${cat.persona.practiceXp} XP, set list ${cat.persona.setList.length}/${need}`);
for (const p of promoted) console.log(`    🏆 A-killed [room z=${p.z}]: "${(p.text || "").replace(/\n/g, " ").slice(0, 88)}"`);
if (cat.persona.readyToEvolve) {
  console.log(`\n✦ ${cat.persona.name} has ${cat.persona.setList.length} killed bits — the threshold. IT IS READY TO EVOLVE.`);
  console.log(`  (Phase 3 writes the new stage form into canon. The becoming becomes the show.)`);
}
console.log(`🎤 → out/catalog.json, out/setlist.json`);
