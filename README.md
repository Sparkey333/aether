# Aether

> Read the land and the heavens. Archive what holds. Seek the next pattern.

Aether is a geomancy engine — a local-first map of Earth's sacred, ancient, and
anomalous places, a procedurally-synthesized planetary grid, and an autonomous
**Loom** that hunts for alignments and nexus points *and judges every one
against chance*. It is the cartographer organ of a larger constellation
([Pyramid Temples](../Pyramid%20Temples), [Jarvis](../Jarvis)) and ships as a
Mac/iOS app via Tauri.

## The doctrine, in one line

**Keep every layer. Label every layer.** From satellite-measured terrain to
channeled symbol systems to UFO reports — nothing is hidden, everything is
tagged by provenance (A-measured · B-scholarly · C-traditional · D-folklore).
The tier is metadata, never a delete key. That is what lets a pattern that
*does* hold up stand on firm ground. See [`content/canon/provenance.md`](content/canon/provenance.md).

## Quickstart

```bash
npm install            # Next 15 + React 19 + MapLibre + deck.gl
npm run dev            # the Atlas at http://localhost:3000
npm run heartbeat:run  # a Loom pulse — dependency-free, writes the pattern feed
npm run trophy:heartbeat  # a Trophy Hype "Hunt" pulse — expands the event library
```

The heartbeat needs **no install** — it's pure Node. Run it first to see the
engine work; it writes `public/data/hypotheses.json`, which the Atlas reads.

## What's built (v1 — the Atlas)

- **Dark world map** (MapLibre GL + deck.gl), county-scale to planetary.
- **The Codex**: 26 seed sites — Giza, Stonehenge, the Sedona vortexes, Mesa
  Verde / Chaco / Aztec (Ancestral Puebloan), Pikes Peak (Ute *Tava*),
  Wardenclyffe (the resonance endgame), and more — each tiered and sourced.
- **The planetary grid**: the Becker-Hagens icosa-dodeca grid (62 nodes, 15
  great circles), *synthesized* in [`src/lib/engine.ts`](src/lib/engine.ts) and
  anchored at Giza, because no canonical ley dataset exists to download.
- **The Loom**: alignment + nexus detection with a **Monte-Carlo chance
  baseline** ([`scripts/heartbeat.mjs`](scripts/heartbeat.mjs)).
- **Provenance filter**: toggle any tier on/off across every layer.

## Map of the repo

| Path | What lives there |
|---|---|
| `src/lib/engine.ts` | Geo math, the planetary grid, alignment + Monte-Carlo baseline |
| `src/lib/{types,tiers}.ts` | Domain types and the four-tier system |
| `src/data/*.seed.json` | Seed POIs and named leylines |
| `src/components/` | The Atlas map, layer panel, inspector, Loom feed |
| `scripts/heartbeat.mjs` | The Loom — the autonomous heartbeat |
| `content/canon/` | Soul-files: the mandate, the guide, the doctrine, the organs |
| `docs/SOURCE_ATLAS.md` | The 151-source, tiered resource atlas (the foundation) |
| `docs/martial-codex/` | The **Martial Codex** — 134 fighting styles (real, military & reality-built fiction), tiered, stat-blocked, ranked & remixed |
| `src/data/martial-arts.seed.json` | The Martial Codex dataset: 134 styles × 17 stats, the engine behind every ranking |
| `src/lib/trophy/` · `src/components/trophy/` | **Trophy Hype** — the competition tracker: integrity/proof engine, gamification, discovery, and UI |
| `scripts/trophy-heartbeat.mjs` | Trophy Hype's **Hunt** — the daily heartbeat that expands & ranks the opportunity library |
| `docs/TROPHY_HYPE.md` | Trophy Hype's full business plan & product scope |
| `docs/ARCHITECTURE.md` · `docs/ROADMAP.md` | Design and the road ahead |

## The eight organs

Atlas · Heavens · Codex · Lexicon · Resonance · Aegis · Nexus · the Loom.
Only the Atlas + Loom are built in v1. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🏆 Trophy Hype — track every arena, prove every win

A first-class module at [`/trophy`](src/app/trophy/page.tsx): find, plan for, and
earn **provable** gamified rewards across the whole spectrum of competition —
races, 14ers, angling award-collections, festivals, and creative competitions
(music first, then books, anime, games, apps). It reuses Aether's spine: a
dependency-free **Hunt** heartbeat that expands the event library each morning, a
four-tier **proof** system so no trophy can be faked (*no corruption — not even
the appearance of it*), and a rank/XP gamification engine. Full plan &
architecture in [`docs/TROPHY_HYPE.md`](docs/TROPHY_HYPE.md).

```bash
npm run trophy:heartbeat   # a Hunt pulse — writes public/data/trophy-discoveries.json
npm run dev                # then open http://localhost:3000/trophy
```
