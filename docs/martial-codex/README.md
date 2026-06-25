# The Aether Martial Codex

> *Read the body and the blade. Archive what holds. Seek the next pattern.*

A sourced, provenance-tiered atlas of **134 fighting styles** — real, military, and reality-built fiction — profiled, stat-blocked, ranked, and remixed. Built in the [Aether](../../README.md) house style: **keep every layer, label every layer** (A-measured · B-scholarly · C-traditional · D-folklore/myth). It is a Codex of combat the way the [Source Atlas](../SOURCE_ATLAS.md) is a Codex of place.

This was the brief: *deep-search the major martial arts and their branches globally and historically; pull in US military/special-operations combatives (honestly — no fabricated "black project" secrets); map the best reality-built movie/anime/game styles (MGS CQC, John Wick, Avatar bending…); then grade, rank, and remix them into a safe, fun, public "Fight Club" parody.* This is the result of a 12-agent deep-research sweep + adversarial fact-checking + a deterministic ranking engine.

## How it's organized

**Section 1 — Real arts, global & ancient**
- [01 · East Asian Striking](01-east-asian-striking.md) — Karate, Taekwondo, Kickboxing
- [02 · Chinese Martial Arts](02-chinese-martial-arts.md) — external kung fu, internal arts, JKD
- [03 · Southeast & South Asian](03-southeast-south-asian.md) — Muay Thai, Silat, Kali, Kalaripayattu
- [04 · Japanese Grappling & Koryū](04-japanese-grappling-koryu.md) — the Jūjutsu → Judo → BJJ line
- [05 · Wrestling Worldwide](05-wrestling-global.md) — freestyle to Senegalese Laamb
- [06 · Western & European](06-western-european.md) — Boxing, Savate, HEMA, Fencing
- [07 · Hybrid, Afro-Diasporic & Indigenous](07-hybrid-afro-indigenous.md) — MMA, Capoeira, Dambe, Lua
- [08 · Ancient & Civilizational Roots](08-ancient-civilizational.md) — Pankration to Beni Hasan

**Section 2 — Combatives & fiction (tied in)**
- [09 · US Military Combatives](09-us-military-combatives.md) — Defendu → LINE → MCMAP → MACP → SOCP
- [10 · International Tactical & RBSD](10-international-tactical.md) — Krav Maga, Systema, Combat Sambo
- [11 · Video-Game Fighting Styles](11-games-cqc.md) — **MGS CQC** & beyond
- [12 · Film & Anime Fighting Styles](12-film-anime.md) — John Wick, Bourne, Avatar bending, Baki…

**Section 3 — Synthesis: grade, remix, build**
- [13 · The Grading Engine](13-grading-and-rankings.md) — rubric, 5 leaderboards, tier list, lineage clusters
- [14 · The Fusion Lab](14-fusion-lab.md) — original hybrid styles (real-only + sci-fi)
- [15 · The Aether Fight Club](15-aether-fight-club.md) — safe-parody tournament & training ladder
- [16 · Provenance & Corrections](16-provenance-and-corrections.md) — the myth-busting ledger

**Data**
- [`src/data/martial-arts.seed.json`](../../src/data/martial-arts.seed.json) — the full structured dataset (134 styles × 17 stats), the engine behind every ranking.

## The 17-stat model

Every style is scored 0–10 on: `rangeStriking · rangeClinch · rangeGround · rangeWeapon · learningCurve · physicalDemand · injuryRiskTraining · selfDefense1v1 · vsArmed · vsMultiple · adaptability · energyEfficiency · accessibility · competitionDepth · spectacle · funFactor · safetyForSparring`. Re-weight them and the leaderboards re-rank — the model is open.

## Headline findings

- **MMA** is the lone **S-tier** and #1 in Sport + Versatility — the empirical proving ground.
- **You called it: BJJ is up there.** Self-Defense **#4**, Sport **#5**, and Fight-Club Fun-&-Safe **#2** — the most well-rounded *effective-yet-recreational* pick.
- **Filipino Kali is the Self-Defense #1** — it trains the weapon problem everyone else ignores.
- **Capoeira tops our flagship Fun-&-Safe board** (and is one of only two real arts to out-spectacle the movies).
- **The hype dies in the data:** **Systema** sits near the bottom of every board; "**John Wick uses CAR**" is **disputed**; "**Kalaripayattu, oldest art**" is **marketing**; the "**secret black-ops martial art**" does not exist.

## Status & next layers

This is the **focused first sweep** the brief asked for ("starting focused for now… spreading broader and deeper"). Deferred for round 2: more sub-branch granularity (individual koryū, Silat styles, kwan-by-kwan TKD), African & Pacific arts beyond the majors, a playable web demo over the seed data, and prototyping the [Flow-Strike](14-fusion-lab.md) ruleset in VR. Tell the Loom where to dig next.
