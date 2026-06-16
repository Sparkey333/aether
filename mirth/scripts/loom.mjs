#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The Mirth Loom — the Jester's heartbeat.
//
// On each pulse it GENERATES raw premises, STYLES them through a voice, FUSES one
// ancient technique with one modern one (the Bach-and-Metallica combinator), and
// — crucially — judges every bit against a Monte-Carlo BASELINE: is this fusion
// more surprising than pairing the subject with a RANDOM pivot would be? A bit
// that beats that baseline is promoted to B-crafted. Then it SEQUENCES a set.
//
// Honest by construction: structural surprise is necessary, not sufficient, for
// funny. So the Loom can reach B on its own — but it can NEVER assign A-killed.
// Only a real room promotes a bit to A. That refusal is the whole point.
//
// Writes out/set.json, the sibling of Aether's public/data/hypotheses.json.
//
// Dependency-free: runs on plain Node, no install required.
//   node ./scripts/loom.mjs
//
// The wit is deliberately scaffold-grade here: this file is the ENGINE
// (generate · fuse · score · sequence · shelf). The actual writing plugs in at
// craftBit() via an optional LLM writer layer — see docs/MIRTH.md, Phase 1.5.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { makeWriter } from "./writer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const lexicon = read("data/techniques.seed.json").techniques;
const seed = read("data/premises.seed.json");
const persona = read("data/persona.seed.json");

const PARAMS = { pulseSize: 10, trials: 200, zPromote: 0.5, setSize: 5, candidatePivots: 3 };

// ── honest scoring (mirrors Aether's engine.ts / heartbeat.mjs) ──────────────
const zScore = (obs, base) => (base.sd < 1e-9 ? (obs > base.mean ? 99 : 0) : (obs - base.mean) / base.sd);
const confidenceFromZ = (z) => 1 / (1 + Math.exp(-(z - 1) * 0.9));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const stripDot = (s) => s.replace(/\.\s*$/, "");
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// ── the domain space: incongruity = distance between two domains ─────────────
const DOM = seed.domains;
const domDist = (a, b) => Math.hypot(DOM[a][0] - DOM[b][0], DOM[a][1] - DOM[b][1]);
let MAXD = 1e-9;
for (const a of Object.keys(DOM)) for (const b of Object.keys(DOM)) MAXD = Math.max(MAXD, domDist(a, b));
const incong = (a, b) => domDist(a, b) / MAXD; // normalized 0..1

// The combinator searches for a surprising-but-coherent fusion: sample a few
// pivots, keep the most incongruous. Sometimes the search comes up shallow —
// and that bit stays at C and gets shelved. As it should.
function searchPivot(subjectDomain) {
  let best = null, bestV = -1;
  for (let i = 0; i < PARAMS.candidatePivots; i++) {
    const p = pick(seed.pivots);
    const v = incong(subjectDomain, p.domain);
    if (v > bestV) { bestV = v; best = p; }
  }
  return best;
}

// Monte-Carlo: how surprising is a RANDOM pivot for this subject? That's chance.
function baselineFor(subjectDomain, trials = PARAMS.trials) {
  let sum = 0, sumSq = 0;
  for (let t = 0; t < trials; t++) {
    const v = incong(subjectDomain, pick(seed.pivots).domain);
    sum += v; sumSq += v * v;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(Math.max(0, sumSq / trials - mean * mean));
  return { mean: +mean.toFixed(3), sd: +sd.toFixed(3), trials };
}

// ── the move-pool, split by era ──────────────────────────────────────────────
const byId = Object.fromEntries(lexicon.map((t) => [t.id, t]));
const have = (era) => persona.movePool.filter((id) => byId[id]?.era === era);

// ── the templates: ancient shapes the TURN, modern shapes the DELIVERY ───────
function structureTurn(ancientId, s, p) {
  switch (ancientId) {
    case "rule-of-three": return `It's three things, honestly: the waiting, the eye contact, and ${p}.`;
    case "misdirection": return `You think ${s} is about ${s} — it's about ${p}, and it always was.`;
    case "mechanical-encrustation": return `We run ${s} like it's ${p}: same buffering face, same crashes, no undo button.`;
    case "sacred-clown-reversal": return `The fool treats ${s} like ${p} — and somehow that's the only sane move left.`;
    case "parabasis": return `Real talk, no bit: ${s} and ${p} are the same machinery and we all know it.`;
    case "lazzi": return `Then comes the little routine — ${s}, then ${p}, then the slow look at the camera.`;
    default: return `Somehow ${s} keeps turning into ${p}.`;
  }
}
function deliveryWrap(modernId, setup, turn, s) {
  switch (modernId) {
    case "observational": return `You ever notice — ${lower(setup)} ${turn}`;
    case "one-liner": return turn;
    case "act-out": return `${setup} It's like ${s} looks you dead in the eye and goes, "${stripDot(turn)}."`;
    case "deadpan-list": return `${setup}\n  - ${turn}\n  - and that, for legal reasons, is the whole show.`;
    case "anti-comedy": return `${setup} ${turn} ...Anyway.`;
    case "absurdist-runner": return `${setup} ${turn} And then it happens again. And again. And nobody stops it.`;
    case "roast": return `${setup} ${turn} I say it with love. Mostly love.`;
    default: return `${setup} ${turn}`;
  }
}

// ── craft one bit, in three honest steps ─────────────────────────────────────
// 1. specFor: the deterministic choice + the SCORING. The tier is decided here,
//    from the domains alone — it does NOT depend on who writes the words.
// 2. words: either the writers' room (writer.mjs) or the template engine.
// 3. assemble: glue the spec's evidence to the words. A is never assignable.

function specFor(i, now) {
  const subject = pick(seed.subjects);
  const frame = pick(seed.frames);
  const pivot = searchPivot(subject.domain);
  const ancient = pick(have("ancient"));
  const modern = pick(have("modern"));
  const setup = frame.template.replaceAll("{subject}", subject.word).replaceAll("{Subject}", cap(subject.word));

  const observed = incong(subject.domain, pivot.domain);
  const base = baselineFor(subject.domain);
  const z = zScore(observed, base);
  const tier = z >= PARAMS.zPromote ? "B-crafted" : "C-styled";

  return { i, now, subject, frame, pivot, ancient, modern, setup, observed, base, z, tier };
}

// the zero-dep voice: ancient shapes the turn, modern shapes the delivery.
function renderTemplate(spec) {
  const turn = structureTurn(spec.ancient, spec.subject.word, spec.pivot.word);
  const text = deliveryWrap(spec.modern, spec.setup, turn, spec.subject.word);
  return { premise: spec.setup, angle: turn, text };
}

function assemble(spec, words) {
  const w = words || renderTemplate(spec);
  return {
    id: `bit_${spec.now}_${spec.i}`,
    createdAt: spec.now,
    subject: spec.subject.word,
    subjectDomain: spec.subject.domain,
    pivot: spec.pivot.word,
    pivotDomain: spec.pivot.domain,
    frame: spec.frame.id,
    technique: [spec.ancient, spec.modern],
    lineage: `${byId[spec.ancient].name} × ${byId[spec.modern].name} (technique-fusion; disclosed, not impersonation)`,
    premise: w.premise,
    angle: w.angle,
    text: w.text,
    tier: spec.tier, // never "A-killed" — only a real room promotes a bit to A
    performances: [],
    observed: +spec.observed.toFixed(3),
    expected: spec.base.mean,
    sd: spec.base.sd,
    z: +spec.z.toFixed(2),
    confidence: +confidenceFromZ(spec.z).toFixed(3),
  };
}

// ── sequence a set: open strong, close strongest, wire a callback ────────────
function buildSet(crafted) {
  const ranked = [...crafted].sort((a, b) => b.z - a.z).slice(0, PARAMS.setSize);
  if (ranked.length === 0) return [];
  // closer = highest z; opener = second; the rest build in the middle.
  const closer = ranked[0];
  const rest = ranked.slice(1);
  const opener = rest.shift();
  const ordered = [opener, ...rest, closer].filter(Boolean);

  // callback: if a later bit shares a subject or domain with an earlier one,
  // pay it off — the room feels clever.
  let callbacks = 0;
  for (let j = 1; j < ordered.length; j++) {
    const earlier = ordered.find((b, k) => k < j &&
      (b.subject === ordered[j].subject || b.pivotDomain === ordered[j].pivotDomain));
    if (earlier && earlier.id !== ordered[j].id) {
      ordered[j] = { ...ordered[j], callbackTo: earlier.id, text: `${ordered[j].text}  (and yeah — callback to ${earlier.subject}).` };
      callbacks++;
    }
  }
  return { ordered: ordered.map((b, k) => ({ ...b, position: k === 0 ? "opener" : k === ordered.length - 1 ? "closer" : "build" })), callbacks };
}

// ── pulse ─────────────────────────────────────────────────────────────────────
const now = new Date().toISOString();

console.log(`🎭 Mirth pulse — persona "${persona.name}" (Lv.${persona.level}, form ${persona.form}); move-pool: ${persona.movePool.length}/${lexicon.length} techniques`);
console.log(`  ancient moves: ${have("ancient").join(", ")}`);
console.log(`  modern  moves: ${have("modern").join(", ")}`);

const writer = await makeWriter(persona);
const writerLabel = writer
  ? `LIVE (${process.env.MIRTH_MODEL || "claude-opus-4-8"})`
  : "templates (set ANTHROPIC_API_KEY + npm install to open the writers' room)";
console.log(`  writers' room: ${writerLabel}`);

const specs = Array.from({ length: PARAMS.pulseSize }, (_, i) => specFor(i, now));
const words = writer ? await writer(specs, lexicon) : null;
const bits = specs.map((s, i) => assemble(s, words && words[i] ? words[i] : null));
const crafted = bits.filter((b) => b.tier === "B-crafted");
const shelf = bits.filter((b) => b.tier !== "B-crafted");
const { ordered: set, callbacks } = buildSet(crafted);

const avgBaseMean = +(bits.reduce((s, b) => s + b.expected, 0) / bits.length).toFixed(3);
const avgBaseSd = +(bits.reduce((s, b) => s + b.sd, 0) / bits.length).toFixed(3);

console.log(`  generated ${bits.length} raw premises; styled + fused across eras`);
console.log(`  structural-surprise baseline: ${avgBaseMean} ± ${avgBaseSd} over ${PARAMS.trials} random pivots (avg per subject)`);
console.log(`  crafted (beat baseline → B): ${crafted.length}    shelved (C, kept not deleted): ${shelf.length}`);
console.log(`  set: ${set.length} bits sequenced (opener → build → closer), ${callbacks} callback(s) wired`);
console.log(`  A-killed this pulse: 0  — and that is correct. Only a real room promotes a bit to A.`);

if (set.length) {
  const closer = set[set.length - 1];
  console.log(`  closer  [z=${closer.z} conf=${closer.confidence}  ${closer.technique.join("×")}]:`);
  console.log(`    "${closer.text.replace(/\n/g, " ")}"`);
}

const out = {
  generatedAt: now,
  engine: "mirth-loom v0.2",
  voice: writer ? (process.env.MIRTH_MODEL || "claude-opus-4-8") : "templates",
  note: "Each bit is scored on STRUCTURAL SURPRISE against a Monte-Carlo baseline of random pivots — necessary, not sufficient, for funny. The Loom can reach B-crafted; it can never assign A-killed. Only a real room does that. The writers' room only changes the words; the scoring is identical.",
  params: PARAMS,
  persona: { id: persona.id, name: persona.name, form: persona.form, level: persona.level, movePoolSize: persona.movePool.length },
  baseline: { meanAvg: avgBaseMean, sdAvg: avgBaseSd, trials: PARAMS.trials },
  set,
  shelf,
  vows: [
    "Never call a bit funny without the room's number behind it.",
    "Never let a laugh track borrow the authority of a real laugh.",
    "Study the masters' craft; never wear a living person's face.",
    "Keep every bomb — the shelf is a seed bank, not a graveyard.",
  ],
};

mkdirSync(join(ROOT, "out"), { recursive: true });
writeFileSync(join(ROOT, "out/set.json"), JSON.stringify(out, null, 2));
console.log(`🎤 pulse complete → mirth/out/set.json  (${set.length} in the set, ${shelf.length} on the shelf)`);
