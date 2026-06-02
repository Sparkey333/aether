# Aether — Architecture

Aether is an *organism*, not a page. It reads the earth below and the heavens
above, archives what it finds, and seeks the next connection. This document maps
its anatomy, its stack, and the one principle that holds it honest.

---

## The governing principle: an honest baseline

The fastest way to ruin a leyline map is to draw every line that *could* exist.
A dense enough field of points throws straight lines by pure chance
(Broadbent/Behrend; see the Source Atlas §1). So Aether never reports an
alignment alone — it reports it **against a Monte-Carlo null baseline**: scatter
the same number of random points in the same region, count the alignments that
arise, repeat hundreds of times. A pattern earns confidence only when it beats
that chance distribution.

This is implemented in `src/lib/engine.ts` (`monteCarloBaseline`, `zScore`,
`confidenceFromZ`) and run each pulse by `scripts/heartbeat.mjs`. It is the
engineering form of the provenance doctrine: *confidence is earned, never
assumed.*

---

## The eight organs

| Organ | Reads | Status |
|---|---|---|
| **Atlas** | The land — GIS, POIs, terrain/aquifer/magnetic overlays, ley drawing | **v1 built** |
| **Heavens** | The sky — ephemeris, stars, archaeoastronomy, Star-of-Bethlehem | planned |
| **Codex** | The archive — sites, events, anomalies as a tiered knowledge graph | seed built |
| **Lexicon** | The symbols — gematria, numerology, sacred geometry, sigils | planned |
| **Resonance** | The frequencies — Schumann, cymatics, toward Tesla's grid | planned |
| **Aegis** | The wards — apotropaic + ritual symbolism → counter-sigils | planned |
| **Nexus** | The crossings — portals/nexus scoring where lines meet | seed (in Loom) |
| **The Loom** | All of the above — the autonomous heartbeat that seeks patterns | **v1 built** |

---

## Stack

Mirrors the constellation (Pyramid Temples), so the apps share muscle memory.

- **Next.js 15 + React 19 + TypeScript** — the UI shell.
- **MapLibre GL JS + deck.gl** — the Atlas. No-key CARTO/OSM dark raster basemap
  in v1; vector tiles / PMTiles later.
- **better-sqlite3 + gray-matter** — the Codex (Node-side) and canon soul-files.
- **@anthropic-ai/sdk** — the Loom's optional reasoning/narration layer.
- **Tauri 2** — the Mac/iOS shell (config to be added; `output: export` in
  `next.config.mjs`).
- **Pure-Node heartbeat** — `scripts/heartbeat.mjs` runs with zero deps.

---

## Data model (`src/lib/types.ts`)

Every entity carries a `Tier`:

```
Tier      = "A-measured" | "B-scholarly" | "C-traditional" | "D-folklore"
POI       = { id, name, lat, lon, category, tier, tradition?, source?, ... }
Leyline   = { id, name, tier, anchors[], path[], note? }
Hypothesis= { id, kind, memberIds[], tier, confidence, observed, expected, sd, z, note }
```

`Hypothesis` is the Loom's output: it always carries `observed` vs `expected`±`sd`
and the resulting `z` and `confidence`, so the UI can never present a line
without its chance context.

---

## Data flow

```
seed JSON ─┐
           ├─► AtlasShell (state: layers, tier filter, selection)
grid (computed in-browser via engine.planetaryGrid())
           │        │
           │        ├─► AtlasMap (MapLibre + deck.gl layers)
           │        ├─► LayerPanel / PoiInspector
           │        └─► LoomFeed ◄── fetch('/data/hypotheses.json')
           │
heartbeat.mjs ── reads seed ── runs alignment + Monte-Carlo ── writes hypotheses.json
```

The browser computes the grid live (it's pure math). The Loom runs out-of-band
(CLI now; scheduled/Tauri-sidecar later) and the UI simply reads its output —
the local-first pattern from Jarvis.

---

## What Aether must generate itself

The Source Atlas's "Gaps" section is load-bearing: no redistributable global ley
dataset, no site→star alignment database, no Strong's→gematria table, no unified
anomaly gazetteer exist. So these are Aether's *original* work, and almost all
must be tagged C/D and disclosed as derived — never passed off as measured:

- the planetary grid (synthesized — **done**),
- ley/nexus detection with a chance baseline (**done**),
- the merged, de-duplicated POI layer (Pleiades + Wikidata + OSM + NRHP),
- ancient-epoch star positions (precess Hipparcos/HYG),
- the KJV/esoteric correspondence graph,
- counter-sigils derived from apotropaic + ceremonial traditions.

See `docs/ROADMAP.md` for the order of building.
