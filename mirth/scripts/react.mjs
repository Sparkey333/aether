#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// react — log a REAL room's response to a bit. This is the only honest source of
// the laughs that can promote a bit to A. The numbers come from outside the
// machine: a club, a stream, a couch full of friends — wherever you ran the set.
//
//   node scripts/react.mjs --list                       # show bit ids + text
//   node scripts/react.mjs <bitId> <laughs> <crowd> [venue]
//
// Example:  node scripts/react.mjs bit_abc123 18 25 set
//   → 18 of 25 people laughed at bit_abc123, performed at a "set".
// ─────────────────────────────────────────────────────────────────────────────

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadCatalog, appendPerformance } from "./store.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "out/catalog.json");
const PERFS = join(ROOT, "out/performances.jsonl");
const persona = JSON.parse((await import("node:fs")).readFileSync(join(ROOT, "data/persona.seed.json"), "utf8"));
const cat = loadCatalog(CATALOG, persona);

const [, , a, b, c, d] = process.argv;

if (!a || a === "--list" || a === "-l") {
  const ids = Object.keys(cat.bits);
  if (!ids.length) { console.log("No corpus yet. Run `npm run pulse` first."); process.exit(0); }
  console.log(`🎟  ${ids.length} bits in the corpus:\n`);
  for (const id of ids) {
    const bit = cat.bits[id];
    const perfs = bit.performances?.length || 0;
    console.log(`  ${id}  [${bit.tier}${perfs ? `, ${perfs} perf` : ""}]`);
    console.log(`    "${(bit.text || "").replace(/\n/g, " ").slice(0, 96)}"`);
  }
  console.log(`\nLog a real reaction:  node scripts/react.mjs <bitId> <laughs> <crowd> [venue]`);
  process.exit(0);
}

const bitId = a;
const laughs = Number(b);
const crowd = Number(c);
const venue = d || "set";

if (!cat.bits[bitId]) { console.error(`✗ no such bit: ${bitId}  (try: node scripts/react.mjs --list)`); process.exit(1); }
if (!Number.isFinite(laughs) || !Number.isFinite(crowd) || crowd <= 0 || laughs < 0) {
  console.error("✗ usage: node scripts/react.mjs <bitId> <laughs> <crowd> [venue]   (crowd > 0)");
  process.exit(1);
}

const perf = { at: new Date().toISOString(), bitId, venue, laughs, audienceSize: crowd, synthetic: false };
appendPerformance(PERFS, perf);
console.log(`🎤 logged: ${laughs}/${crowd} laughed at ${bitId} @ ${venue}  (${(100 * laughs / crowd).toFixed(0)}% of the room)`);
console.log(`   when enough rooms have weighed in:  npm run promote`);
