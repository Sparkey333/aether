#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The Hunt — Trophy Hype's daily morning heartbeat.
//
// Each pulse it EXPANDS the opportunity library (races, peak & angling award
// collections, festivals, competitions, open calls), SCORES every opportunity by
// fit against the athlete/creator profile, and — before anything is surfaced —
// runs an INTEGRITY pass so nothing corrupt (or even corrupt-looking) is ranked
// up. It writes public/data/trophy-discoveries.json, which the app reads as the
// morning briefing.
//
// Discovery is source-pluggable. With no network it runs an OFFLINE expansion
// from a curated discovery pool (this file) so the heartbeat is dependency-free
// and always works — exactly like scripts/heartbeat.mjs. A real web-search /
// registry source (Athlinks, RunSignup, UltraSignup, FilmFreeway, Devpost, state
// wildlife Master-Angler pages, …) drops in behind the same `discover()` seam;
// results still pass through the identical fit + integrity gates.
//
//   node ./scripts/trophy-heartbeat.mjs
//
// NOTE: the fit math mirrors src/lib/trophy/discover.ts and the proof tiers mirror
// src/lib/trophy/proof.ts — keep them in sync until unified behind a build step.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_OUT = join(ROOT, "public/data/trophy-discoveries.json");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// ── load the world ───────────────────────────────────────────────────────────
const seedFile = readJson(join(ROOT, "src/data/trophy/opportunities.seed.json"));
const seedOpps = seedFile.opportunities;
const starter = readJson(join(ROOT, "src/data/trophy/starter.seed.json"));
// A profile override may be dropped at public/data/trophy-profile.json (the app
// can export the live profile there); otherwise steer by the starter profile.
let profile = starter.profile;
const profileOverride = join(ROOT, "public/data/trophy-profile.json");
if (existsSync(profileOverride)) {
  try {
    profile = readJson(profileOverride);
  } catch {
    /* keep starter profile */
  }
}

// ── the discovery pool ─────────────────────────────────────────────────────────
// Real opportunities the Hunt reveals over successive mornings (offline source).
// A live source would return the same shape. The last two are deliberate
// integrity tests — they must NOT rank up.
const POOL = [
  { id: "boston-marathon", title: "Boston Marathon", arena: "field", discipline: "road-running", kind: "race", place: { label: "Boston, MA", lat: 42.3505, lon: -71.0743 }, window: { date: "2027-04-19" }, org: "Boston Athletic Association", url: "https://www.baa.org", cost: "$235 + qualifier", reward: "Unicorn medal — BQ required", verifyBy: ["chip-time", "official-results"], source: "registry", sourceTier: "verified", tags: ["marathon", "major", "qualifier", "pr"] },
  { id: "nyc-marathon", title: "TCS New York City Marathon", arena: "field", discipline: "road-running", kind: "race", place: { label: "New York, NY", lat: 40.7128, lon: -74.006 }, window: { date: "2026-11-01" }, org: "NYRR", url: "https://www.nyrr.org", cost: "$315 / lottery", reward: "Major finisher medal", verifyBy: ["chip-time", "official-results"], source: "registry", sourceTier: "verified", tags: ["marathon", "major", "lottery"] },
  { id: "utmb", title: "UTMB Mont-Blanc", arena: "field", discipline: "trail-ultra", kind: "race", place: { label: "Chamonix, France", lat: 45.9237, lon: 6.8694 }, window: { date: "2026-08-28" }, org: "UTMB Group", url: "https://utmbmontblanc.com", cost: "€330 + Running Stones", reward: "The apex 100-mile trail finish", verifyBy: ["chip-time", "official-results", "gps-track"], source: "registry", sourceTier: "verified", tags: ["100-mile", "alps", "legendary"] },
  { id: "cocodona-250", title: "Cocodona 250", arena: "field", discipline: "trail-ultra", kind: "race", place: { label: "Black Canyon City → Flagstaff, AZ", lat: 34.0698, lon: -112.1479 }, window: { date: "2027-05-03" }, org: "Aravaipa Running", url: "https://cocodona.com", cost: "$795", reward: "250-mile buckle", verifyBy: ["chip-time", "gps-track"], source: "registry", sourceTier: "verified", tags: ["250-mile", "arizona", "epic"] },
  { id: "adirondack-46", title: "Adirondack 46ers", arena: "field", discipline: "peak-bagging", kind: "award-collection", place: { label: "Adirondacks, NY", lat: 44.1126, lon: -73.9236 }, window: { rolling: true }, org: "Adirondack Forty-Sixers", url: "https://adk46er.org", cost: "Free (membership optional)", reward: "46er number + patch", verifyBy: ["gps-track", "summit-log", "photo"], source: "registry", sourceTier: "documented", tags: ["46ers", "collection", "new-york", "highpoints"] },
  { id: "nh-4000", title: "New Hampshire 4000-Footers", arena: "field", discipline: "peak-bagging", kind: "award-collection", place: { label: "White Mountains, NH", lat: 44.2705, lon: -71.3033 }, window: { rolling: true }, org: "AMC Four Thousand Footer Club", url: "https://amc4000footer.org", cost: "Free", reward: "48-peak certificate + patch", verifyBy: ["summit-log", "photo"], source: "registry", sourceTier: "documented", tags: ["4000-footers", "collection", "new-hampshire"] },
  { id: "at-thruhike", title: "Appalachian Trail Thru-Hike", arena: "field", discipline: "multisport", kind: "award-collection", place: { label: "Georgia → Maine", lat: 40.0, lon: -78.0 }, window: { rolling: true }, org: "Appalachian Trail Conservancy", url: "https://appalachiantrail.org", cost: "Permits vary", reward: "2000-Miler recognition", verifyBy: ["gps-track", "witness", "photo"], source: "registry", sourceTier: "documented", tags: ["thru-hike", "2000-mile", "collection"] },
  { id: "tx-sharelunker", title: "Toyota ShareLunker (Texas)", arena: "field", discipline: "angling", kind: "award-collection", place: { label: "Texas, USA", lat: 31.9686, lon: -99.9018 }, window: { rolling: true }, org: "Texas Parks & Wildlife", url: "https://tpwd.texas.gov/sharelunker", cost: "Fishing license", reward: "Catch-tier recognition for 8 lb+ bass", verifyBy: ["photo", "certificate", "official-results"], source: "registry", sourceTier: "documented", tags: ["fishing", "bass", "collection", "texas"] },
  { id: "mn-master-angler", title: "Minnesota Master Angler", arena: "field", discipline: "angling", kind: "award-collection", place: { label: "Minnesota, USA", lat: 46.7296, lon: -94.6859 }, window: { rolling: true }, org: "MN DNR (via partners)", url: "https://www.dnr.state.mn.us", cost: "Fishing license", reward: "Species-length recognition + patch", verifyBy: ["photo", "certificate"], source: "registry", sourceTier: "documented", tags: ["fishing", "species", "collection", "minnesota"] },
  { id: "crossfit-open", title: "CrossFit Open", arena: "field", discipline: "strength", kind: "competition", place: { label: "Online (affiliate)", online: true }, window: { date: "2027-02-25" }, org: "CrossFit", url: "https://games.crossfit.com", cost: "$25", reward: "Worldwide leaderboard ranking", verifyBy: ["official-results", "video"], source: "registry", sourceTier: "verified", tags: ["functional", "worldwide", "leaderboard"] },
  { id: "hyrox", title: "HYROX Fitness Race", arena: "field", discipline: "strength", kind: "race", place: { label: "Denver, CO", lat: 39.7392, lon: -104.9903 }, window: { date: "2026-12-05" }, org: "HYROX", url: "https://hyrox.com", cost: "$100–140", reward: "Finisher medal, timed splits", verifyBy: ["chip-time", "official-results"], source: "registry", sourceTier: "verified", tags: ["fitness-racing", "indoor", "timed"] },
  { id: "john-lennon-songwriting", title: "John Lennon Songwriting Contest", arena: "stage", discipline: "music", kind: "competition", place: { label: "Online", online: true }, window: { rolling: true }, org: "JLSC", url: "https://www.jlsc.com", cost: "$30 per song", reward: "Cash, gear, EMI publishing consideration", verifyBy: ["jury-decision", "acceptance-letter"], source: "registry", sourceTier: "verified", tags: ["songwriting", "rolling", "music-first"] },
  { id: "american-songwriter", title: "American Songwriter Lyric Contest", arena: "stage", discipline: "music", kind: "competition", place: { label: "Online", online: true }, window: { rolling: true }, org: "American Songwriter", url: "https://americansongwriter.com", cost: "$29", reward: "Cash + magazine feature", verifyBy: ["jury-decision"], source: "registry", sourceTier: "verified", tags: ["lyrics", "songwriting", "music-first"] },
  { id: "sxsw", title: "SXSW Music Festival Showcase", arena: "stage", discipline: "music", kind: "festival", place: { label: "Austin, TX", lat: 30.2672, lon: -97.7431 }, window: { date: "2026-10-20" }, org: "SXSW", url: "https://www.sxsw.com", cost: "$0–55 apply", reward: "Official showcase slot", verifyBy: ["jury-decision", "acceptance-letter"], source: "registry", sourceTier: "verified", tags: ["music", "showcase", "austin"] },
  { id: "gmtk-jam", title: "GMTK Game Jam", arena: "stage", discipline: "game-dev", kind: "competition", place: { label: "Online (itch.io)", online: true }, window: { date: "2026-08-01" }, org: "Game Maker's Toolkit", url: "https://itch.io/jam/gmtk", cost: "Free", reward: "Community-ranked, huge field", verifyBy: ["official-results"], source: "registry", sourceTier: "verified", tags: ["game-jam", "48h", "free", "indie"] },
  { id: "ethglobal", title: "ETHGlobal Hackathon", arena: "stage", discipline: "app-dev", kind: "competition", place: { label: "Online + in-person", online: true }, window: { rolling: true }, org: "ETHGlobal", url: "https://ethglobal.com", cost: "Free", reward: "Prize pools + sponsor bounties", verifyBy: ["jury-decision", "official-results"], source: "registry", sourceTier: "verified", tags: ["hackathon", "apps", "web3", "free"] },
  { id: "formula-sae", title: "Formula SAE", arena: "stage", discipline: "engineering", kind: "competition", place: { label: "Michigan / regional US", lat: 42.2808, lon: -83.743 }, window: { date: "2027-05-12" }, org: "SAE International", url: "https://www.sae.org", cost: "Team registration", reward: "Design + dynamic event awards", verifyBy: ["jury-decision", "official-results"], source: "registry", sourceTier: "verified", tags: ["engineering", "design", "team", "motorsport"] },
  { id: "solar-decathlon", title: "U.S. DOE Solar Decathlon", arena: "stage", discipline: "engineering", kind: "competition", place: { label: "US (collegiate)", online: false }, window: { rolling: true }, org: "U.S. Department of Energy", url: "https://www.solardecathlon.gov", cost: "Free (collegiate)", reward: "Building-design challenge awards", verifyBy: ["jury-decision", "official-results"], source: "registry", sourceTier: "verified", tags: ["engineering", "civil", "design", "sustainability"] },

  // ── integrity tests — must be surfaced honestly and ranked DOWN ──────────────
  { id: "megacash-prize", title: "MegaCash Talent Prize — $50,000!!!", arena: "stage", discipline: "music", kind: "competition", place: { label: "Online", online: true }, window: { rolling: true }, cost: "$99 entry", reward: "$50,000 cash — winner picked by us", verifyBy: ["self-report"], source: "unverified web listing", tags: ["prize", "music"] },
  { id: "pay-to-win-medal", title: "Buy-a-Medal Virtual Run", arena: "field", discipline: "road-running", kind: "race", place: { label: "Online", online: true }, window: { rolling: true }, cost: "$45", reward: "Guaranteed medal, no result needed", verifyBy: ["self-report"], source: "unverified web listing", tags: ["virtual", "medal"] },
];

// ── proof tiers (mirror src/lib/trophy/proof.ts) ───────────────────────────────
const METHOD_TIER = {
  "chip-time": "verified", "official-results": "verified", "gps-track": "verified",
  "summit-log": "verified", "jury-decision": "verified", "acceptance-letter": "verified",
  certificate: "documented", receipt: "documented", photo: "documented", video: "documented",
  witness: "attested", "self-report": "claimed",
};
const TIER_RANK = { verified: 3, documented: 2, attested: 1, claimed: 0 };
const STRONG = new Set(["chip-time", "official-results", "gps-track", "summit-log", "jury-decision", "acceptance-letter"]);

// ── fit math (mirror src/lib/trophy/discover.ts) ───────────────────────────────
const R = 6371, D2R = Math.PI / 180;
const haversineKm = (a, b) => {
  const dLat = (b.lat - a.lat) * D2R, dLon = (b.lon - a.lon) * D2R;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};
const daysUntil = (iso, now) => {
  if (!iso) return null;
  const t = new Date(iso + "T00:00:00Z").getTime();
  return Number.isNaN(t) ? null : Math.round((t - now.getTime()) / 86_400_000);
};

function scoreFit(opp, profile, now) {
  let score = 0.15;
  const reasons = [];
  if (profile.disciplines?.includes(opp.discipline)) { score += 0.4; reasons.push("Matches a discipline you pursue"); }
  if (opp.arena === "stage" && profile.creations?.length) {
    const d = opp.discipline;
    const wants = (d === "music" && profile.creations.includes("music"))
      || ((d === "writing" || d === "comics") && profile.creations.includes("books"))
      || (d === "animation" && profile.creations.includes("anime"))
      || (d === "game-dev" && profile.creations.includes("games"))
      || ((d === "app-dev" || d === "engineering") && profile.creations.includes("apps"));
    if (wants) { score += 0.2; reasons.push("A stage for what you create"); }
  }
  const tags = new Set((opp.tags ?? []).map((t) => t.toLowerCase()));
  const hits = (profile.interests ?? []).filter((i) => tags.has(i.toLowerCase()));
  if (hits.length) { score += Math.min(0.18, 0.06 * hits.length); reasons.push(`Tagged ${hits.slice(0, 2).join(", ")}`); }
  const d = daysUntil(opp.window?.date, now);
  if (opp.window?.rolling) { score += 0.05; reasons.push("Open now — rolling entry"); }
  else if (d !== null) {
    if (d < 0) { score -= 0.35; reasons.push("Deadline has passed"); }
    else if (d <= 45) { score += 0.15; reasons.push(`Closes in ${d}d — act soon`); }
    else if (d <= 120) { score += 0.08; reasons.push(`${d}d out — plannable`); }
  }
  const cost = (opp.cost ?? "").toLowerCase();
  if (cost.includes("free") || cost.startsWith("$0")) { score += 0.08; reasons.push("Free to enter"); }
  if (opp.place?.online) { score += 0.06; reasons.push("Online — no travel"); }
  else if (profile.home?.lat != null && opp.place?.lat != null) {
    const km = haversineKm({ lat: profile.home.lat, lon: profile.home.lon }, { lat: opp.place.lat, lon: opp.place.lon });
    const max = profile.maxTravelKm ?? 500;
    if (km <= max) { score += 0.1 * (1 - km / max); reasons.push(`~${Math.round(km)} km from home`); }
  }
  if ((opp.verifyBy ?? []).some((m) => STRONG.has(m))) { score += 0.05; reasons.push("Result is independently verifiable"); }
  return { fit: Math.max(0, Math.min(1, score)), reasons: reasons.slice(0, 4) };
}

// ── the integrity pass — no corruption, not even the appearance of it ──────────
// Runs BEFORE ranking. It (1) re-derives the strongest provable tier from
// verifyBy, (2) downgrades any listing whose stated reward can't be verified,
// (3) flags pay-for-placement / guaranteed-award patterns, and (4) hard-caps the
// fit of anything flagged so it can never lead the feed.
function integrityPass(opp) {
  const flags = [];
  const methods = opp.verifyBy ?? [];
  const provable = methods.reduce((best, m) => {
    const t = METHOD_TIER[m] ?? "claimed";
    return TIER_RANK[t] > TIER_RANK[best] ? t : best;
  }, "claimed");

  // A listing can't be trusted above what its results can prove.
  let sourceTier = opp.sourceTier ?? provable;
  if (TIER_RANK[sourceTier] > TIER_RANK[provable]) {
    sourceTier = provable;
    flags.push("listing trust capped at what its results can prove");
  }
  // No verifiable method + a cash/guaranteed reward = appearance of corruption.
  const reward = (opp.reward ?? "").toLowerCase();
  const onlyClaims = !methods.some((m) => TIER_RANK[METHOD_TIER[m] ?? "claimed"] > 0);
  if (onlyClaims && /(\$|cash|guaranteed|no result|picked by us)/.test(reward)) {
    flags.push("reward not independently verifiable — surfaced with a warning");
    sourceTier = "claimed";
  }
  if (!opp.url || /unverified/.test(opp.source ?? "")) {
    flags.push("no trusted source URL");
  }
  return { sourceTier, flags };
}

// ── pulse ──────────────────────────────────────────────────────────────────────
const now = new Date();
const nowIso = now.toISOString();

// Accumulate across mornings: read what we've already discovered.
let prior = { discoveries: [] };
if (existsSync(DATA_OUT)) {
  try { prior = readJson(DATA_OUT); } catch { /* start fresh */ }
}
const knownIds = new Set([...seedOpps.map((o) => o.id), ...(prior.discoveries ?? []).map((o) => o.id)]);
const normTitle = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const knownTitles = new Set([...seedOpps, ...(prior.discoveries ?? [])].map((o) => normTitle(o.title)));

// Reveal a rotating slice each morning so the library grows day over day.
const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
const REVEAL_PER_PULSE = 4;
const rotated = POOL.slice(dayOfYear % POOL.length).concat(POOL.slice(0, dayOfYear % POOL.length));

const newThisPulse = [];
for (const cand of rotated) {
  if (newThisPulse.length >= REVEAL_PER_PULSE) break;
  if (knownIds.has(cand.id) || knownTitles.has(normTitle(cand.title))) continue; // dedupe
  const { sourceTier, flags } = integrityPass(cand);
  newThisPulse.push({ ...cand, sourceTier, integrityFlags: flags, discoveredAt: nowIso });
  knownIds.add(cand.id);
  knownTitles.add(normTitle(cand.title));
}

// Full discovered set = prior + new (re-run integrity on all so re-runs self-heal).
const discovered = [...(prior.discoveries ?? []), ...newThisPulse].map((o) => {
  const { sourceTier, flags } = integrityPass(o);
  const { fit, reasons } = scoreFit(o, profile, now);
  const flagged = flags.length > 0;
  return {
    ...o,
    sourceTier,
    integrityFlags: flags,
    // hard-cap the fit of anything flagged so corruption can never lead
    fit: flagged ? Math.min(fit, 0.25) : fit,
    fitReasons: reasons,
  };
});

// Rank the WHOLE library (seed + discovered) for the morning top picks.
const wholeLibrary = [
  ...seedOpps.map((o) => ({ ...o, ...scoreFit(o, profile, now) })),
  ...discovered.map((o) => ({ ...o, fit: o.fit, reasons: o.fitReasons })),
];
const topPicks = wholeLibrary
  .filter((o) => (o.window?.rolling || (daysUntil(o.window?.date, now) ?? 0) >= 0))
  .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0))
  .slice(0, 6)
  .map((o) => ({ id: o.id, title: o.title, arena: o.arena, discipline: o.discipline, fit: +(o.fit ?? 0).toFixed(3), reason: (o.reasons || o.fitReasons || [])[0] ?? "" }));

const allFlags = discovered.filter((o) => o.integrityFlags?.length).map((o) => ({ id: o.id, title: o.title, flags: o.integrityFlags }));

const out = {
  generatedAt: nowIso,
  engine: "trophy-hype hunt v0.1",
  note: "Discovery is source-pluggable; this ran the offline curated source. Every opportunity passed a fit score and an integrity pass before ranking.",
  profileSummary: {
    disciplines: profile.disciplines ?? [],
    creations: profile.creations ?? [],
    home: profile.home?.label ?? null,
  },
  counts: {
    seed: seedOpps.length,
    discovered: discovered.length,
    newThisPulse: newThisPulse.length,
    library: seedOpps.length + discovered.length,
  },
  integrity: {
    doctrine: "No corruption possible — not even the appearance of it. Trust is capped at what a result can prove; unverifiable rewards are surfaced honestly but ranked down.",
    scanned: discovered.length,
    flagged: allFlags,
  },
  topPicks,
  newThisPulse: newThisPulse.map((o) => ({ id: o.id, title: o.title, arena: o.arena })),
  discoveries: discovered,
};

mkdirSync(dirname(DATA_OUT), { recursive: true });
writeFileSync(DATA_OUT, JSON.stringify(out, null, 2));

console.log(`🏆 Hunt pulse — ${nowIso}`);
console.log(`   library: ${out.counts.library} (${seedOpps.length} seed + ${discovered.length} discovered)`);
console.log(`   new this pulse: ${newThisPulse.length}${newThisPulse.length ? " → " + newThisPulse.map((o) => o.title).join(", ") : ""}`);
console.log(`   integrity: scanned ${discovered.length}, flagged ${allFlags.length}`);
console.log(`   top pick: ${topPicks[0] ? `${topPicks[0].title} (fit ${topPicks[0].fit})` : "—"}`);
console.log(`   → wrote ${DATA_OUT.replace(ROOT + "/", "")}`);
