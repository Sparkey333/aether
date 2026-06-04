#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Aether ingest — fill the Codex with real sites from Wikidata (WDQS / SPARQL).
//
// Two queries (validated live against query.wikidata.org):
//   • ancient/megalithic sites (pyramids, megaliths, stone circles, dolmens,
//     henges, menhirs, passage graves) → Tier B-scholarly
//   • sacred sites (sacred mountains, holy wells, pilgrimage sites, shrines)
//     → Tier C-traditional (tradition-based significance)
//
// Dedupes by Wikidata QID, drops unlabeled items, and skips anything within
// 2 km of a hand-curated seed POI (the seed wins). Writes
// src/data/poi.ingested.json (committed, regenerable). The app imports it and
// merges with the seed; the heartbeat reads it too.
//
//   node ./scripts/ingest.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "AetherGeomancy/0.1 (personal research; brandonlbarkey@gmail.com)";
const LANGS = "en,fr,de,es,it,pt,nl,ru,sv,da,ja,zh,ar,tr,pl";

const ANCIENT_SPARQL = `SELECT DISTINCT ?item ?itemLabel ?lat ?lon WHERE {
  {
    { ?item wdt:P31/wdt:P279* wd:Q12516 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q164240 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q53336805 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q10521078 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q1935728 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q101659 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q1035294 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q193475 . }
    UNION { ?item wdt:P31/wdt:P279* wd:Q1426772 . }
  }
  ?item p:P625 ?stmt . ?stmt psv:P625 ?cv .
  ?cv wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${LANGS}". }
} LIMIT 1000`;

const SACRED_SPARQL = `SELECT ?site ?siteLabel ?coord ?typeLabel WHERE {
  {
    { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q1595289 ; wdt:P625 ?coord . BIND(wd:Q1595289 AS ?type) } LIMIT 60 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q1371047 ; wdt:P625 ?coord . BIND(wd:Q1371047 AS ?type) } LIMIT 60 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q15135589 ; wdt:P625 ?coord . BIND(wd:Q15135589 AS ?type) } LIMIT 60 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q697295 ; wdt:P625 ?coord . BIND(wd:Q697295 AS ?type) } LIMIT 60 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q4588528 ; wdt:P625 ?coord . BIND(wd:Q4588528 AS ?type) } LIMIT 40 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q16412466 ; wdt:P625 ?coord . BIND(wd:Q16412466 AS ?type) } LIMIT 40 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q811600 ; wdt:P625 ?coord . BIND(wd:Q811600 AS ?type) } LIMIT 40 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q180987 ; wdt:P625 ?coord . BIND(wd:Q180987 AS ?type) } LIMIT 40 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q20064854 ; wdt:P625 ?coord . BIND(wd:Q20064854 AS ?type) } LIMIT 40 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q11331347 ; wdt:P625 ?coord . BIND(wd:Q11331347 AS ?type) } LIMIT 30 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q692581 ; wdt:P625 ?coord . BIND(wd:Q692581 AS ?type) } LIMIT 30 }
    UNION { SELECT ?site ?coord ?type WHERE { ?site wdt:P31 wd:Q25616450 ; wdt:P625 ?coord . BIND(wd:Q25616450 AS ?type) } LIMIT 30 }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${LANGS}". }
}`;

async function wdqs(sparql) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("query", sparql);
  url.searchParams.set("format", "json");
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
  });
  if (!res.ok) throw new Error(`WDQS ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.results.bindings;
}

const R = 6371,
  D2R = Math.PI / 180;
const haversine = (a, b) => {
  const dLat = (b[1] - a[1]) * D2R,
    dLon = (b[0] - a[0]) * D2R;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};
const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const seed = JSON.parse(readFileSync(join(ROOT, "src/data/poi.seed.json"), "utf8")).pois;
  const seedPts = seed.map((p) => [p.lon, p.lat]);
  const byQid = new Map();

  // ── ancient / megalithic ──
  try {
    const rows = await wdqs(ANCIENT_SPARQL);
    let kept = 0;
    for (const b of rows) {
      const qid = b.item.value.split("/").pop();
      const name = b.itemLabel?.value;
      if (!name || name === qid || byQid.has(qid)) continue;
      const lat = parseFloat(b.lat.value),
        lon = parseFloat(b.lon.value);
      if (!isFinite(lat) || !isFinite(lon)) continue;
      byQid.set(qid, {
        id: `wd-${qid}`,
        name,
        lat,
        lon,
        category: "ancient-site",
        tier: "B-scholarly",
        source: `Wikidata https://www.wikidata.org/wiki/${qid}`,
        tags: ["ancient", "ingested"],
      });
      kept++;
    }
    console.log(`  ancient/megalithic: ${rows.length} rows → ${kept} kept`);
  } catch (e) {
    console.error(`  ⚠ ancient query failed: ${e.message}`);
  }

  // polite gap between requests
  await new Promise((r) => setTimeout(r, 1500));

  // ── sacred ──
  try {
    const rows = await wdqs(SACRED_SPARQL);
    let kept = 0;
    for (const b of rows) {
      const qid = b.site.value.split("/").pop();
      const name = b.siteLabel?.value;
      if (!name || name === qid || byQid.has(qid)) continue;
      const m = /Point\(([-0-9.eE]+) ([-0-9.eE]+)\)/.exec(b.coord?.value || "");
      if (!m) continue;
      const lon = parseFloat(m[1]),
        lat = parseFloat(m[2]);
      const type = b.typeLabel?.value || "sacred site";
      byQid.set(qid, {
        id: `wd-${qid}`,
        name,
        lat,
        lon,
        category: slug(type) || "sacred-site",
        tier: "C-traditional",
        tradition: type,
        source: `Wikidata https://www.wikidata.org/wiki/${qid}`,
        tags: ["sacred", "ingested"],
      });
      kept++;
    }
    console.log(`  sacred: ${rows.length} rows → ${kept} kept`);
  } catch (e) {
    console.error(`  ⚠ sacred query failed: ${e.message}`);
  }

  // ── drop anything within 2 km of a curated seed POI (seed wins) ──
  let dropped = 0;
  const pois = [];
  for (const p of byQid.values()) {
    const near = seedPts.some((s) => haversine(s, [p.lon, p.lat]) < 2);
    if (near) {
      dropped++;
      continue;
    }
    pois.push(p);
  }
  pois.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(
    join(ROOT, "src/data/poi.ingested.json"),
    JSON.stringify(
      {
        _doc: "Aether ingested sites from Wikidata (WDQS). Regenerate with `npm run ingest`. Deduped by QID; sites within 2km of a curated seed POI are dropped (seed wins).",
        generatedAt: new Date().toISOString(),
        count: pois.length,
        pois,
      },
      null,
      0,
    ),
  );
  console.log(`  dropped ${dropped} near-seed duplicates`);
  console.log(`✦ ingested ${pois.length} sites → src/data/poi.ingested.json`);
}

main().catch((e) => {
  console.error("ingest failed:", e);
  process.exit(1);
});
