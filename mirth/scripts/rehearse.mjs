#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// rehearse — a SYNTHETIC room. It generates fake reactions so the persona can
// rehearse sequencing and so the promoter's honesty can be demonstrated.
//
// These reactions are stamped synthetic:true and CANNOT promote a bit to A.
// That is the whole point. A laugh track is tier-D cosplaying as tier-A; the
// promoter counts it for nothing. Only a real room (react.mjs) grants A.
//
//   node scripts/rehearse.mjs [count]
// ─────────────────────────────────────────────────────────────────────────────

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { loadCatalog, appendPerformance } from "./store.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const persona = JSON.parse(readFileSync(join(ROOT, "data/persona.seed.json"), "utf8"));
const cat = loadCatalog(join(ROOT, "out/catalog.json"), persona);
const PERFS = join(ROOT, "out/performances.jsonl");

const ids = Object.keys(cat.bits);
if (!ids.length) { console.log("No corpus yet. Run `npm run pulse` first."); process.exit(0); }

const count = Math.min(Number(process.argv[2]) || 6, ids.length);
const crowd = 30;
let n = 0;
for (const id of ids.slice(0, count)) {
  // deliberately generous fake laughs — to prove the promoter still refuses them
  const laughs = Math.round(crowd * (0.7 + Math.random() * 0.25));
  appendPerformance(PERFS, { at: new Date().toISOString(), bitId: id, venue: "rehearsal", laughs, audienceSize: crowd, synthetic: true });
  n++;
}
console.log(`🤖 wrote ${n} SYNTHETIC rehearsal reactions (≈70–95% fake laughs).`);
console.log(`   These can NEVER promote a bit to A. Run \`npm run promote\` and watch them get refused.`);
