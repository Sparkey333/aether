# Aether — Roadmap

The order is chosen so each phase stands on measured ground before the
interpretive layers rest on top. Provenance first, always.

## Phase 0 — The Atlas (v1) ✅ built

- [x] Repo born in the constellation's image (Next 15 / React 19 / Tauri-ready).
- [x] Four-tier provenance system (`tiers.ts`) wired through every layer.
- [x] Dark world map (MapLibre + deck.gl), POI + leyline + grid layers.
- [x] Planetary grid synthesized (icosa-dodeca, 62 nodes, 15 great circles, Giza-anchored).
- [x] The Loom: alignment + nexus detection with a Monte-Carlo chance baseline.
- [x] Seed Codex of 26 sites; Source Atlas of 151 tiered sources.

## Phase 1 — The Atlas, deepened

- [x] **De-cluster the detector.** Near-duplicate points collapse to one node
      (≤40 km) before alignment scoring (`declusterPoints`). Done — also
      vectorized the detector (~20× faster) and tightened params (≤12 km
      corridor, ≥5 members).
- [x] **Real ingest (Wikidata).** `scripts/ingest.mjs` pulls ~1,263 sites from
      WDQS — archaeological/megalithic (Tier B) + sacred mountains/wells/
      pilgrimage (Tier C). *Still to do:* Pleiades + OSM (Overpass) + NRHP, and a
      density-matched null model for the Loom.
- [x] **Substrate overlays (Tier A).** USGS magnetic-anomaly raster (WMTS),
      live earthquake GeoJSON, and Quaternary fault lines — toggleable in the
      Atlas. *Still to do:* NOAA WMM, principal aquifers.
- [ ] **Loom coverage.** Spatial index / viewport-scoped pulse so the hunt
      covers all ~430 declustered nodes, not a capped 120–140. Add a
      density-preserving null so z reflects alignment, not clustering.
- [ ] **Draw tools.** Let the priest draw and save leylines by hand; terrain
      horizon from a DEM (OpenTopography / USGS 3DEP).
- [ ] **County/city zoom.** Vector tiles / PMTiles for fast parcel-scale reading.

## Phase 2 — The Heavens

- [ ] 3D globe + sky view (CesiumJS or R3F).
- [ ] Ephemeris (JPL DE441 + Skyfield backend; Astronomy-Engine client-side).
- [ ] HYG star catalog + IAU constellation boundaries + Stellarium sky-cultures.
- [ ] Archaeoastronomy: per-site solstice/star alignment azimuths vs modeled horizon.
- [ ] **Star-of-Bethlehem mode** — 7–5 BC sky, the Magi conjunction thread.

## Phase 3 — The Lexicon

- [ ] OpenScriptures Strong's + STEPBible TIPNR (geolocated biblical names).
- [ ] Multi-system gematria engine (Hebrew/Greek/English) + match search.
- [ ] Sacred geometry generator (Flower of Life → Metatron → Platonic solids).
- [ ] Sigil construction (planetary kameas, Rose Cross, chaos-magic fusion).
- [ ] "Holy language in the land": geolocate gematria/symbol resonance to places.

## Phase 4 — The Resonance

- [ ] Schumann + cymatics module (modal physics, Falstad-style interactive).
- [ ] Frequency↔place mappings (disclosed as designed correspondences, Tier C).
- [ ] The Tesla layer: Wardenclyffe, Colorado Springs notes, the patents — and a
      model of global resonance toward wireless free energy (the endgame).

## Phase 5 — The Aegis (counter-sigils)

- [ ] Catalog ritual/summoning geometry (Key of Solomon pentacles, Goetic seals).
- [ ] Catalog apotropaic wards (hexafoil, hamsa, Helm of Awe).
- [ ] Generative counter-sigil workshop — derive warding forms from both.
- [ ] (FMA nationwide-array kept strictly D-folklore / fictional aesthetic.)

## Phase 6 — Ship

- [ ] Tauri Mac + iOS build (`output: export`, fs/sqlite via Tauri plugins).
- [ ] Scheduled Loom (heartbeat as a sidecar / cron) with the Anthropic
      reasoning layer narrating new high-z hypotheses.
- [ ] Sync with Pyramid Temples' frequency/cymatics canon.

## Standing engineering vows

1. Never draw a line without its chance baseline.
2. Never let an interpretive layer borrow the authority of a measured one.
3. Coarse-locate and flag protected/sacred/tribal coordinates; never scrape restricted data.
4. Every derived dataset is disclosed as derived.
