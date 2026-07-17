# 🏆 Trophy Hype — Business Plan & Product Scope

> **Track every arena. Prove every win.**
> One place to *find*, *plan for*, and *earn* rewards across the entire spectrum
> of human competition — from a chip-timed 10K to a Colorado 14er, from a Master
> Angler catch to getting a song, a film, a game, or an app selected on the world
> stage — with gamified rewards that are **impossible to fake and impossible to
> corrupt**.

Trophy Hype is a first-class module of **Aether** (the Path pillar of the
DarkHearts ecosystem). It reuses Aether's proven spine — a dependency-free
"heartbeat" that expands a library each morning, a four-tier provenance system,
seed-driven data, and a gamified rank/badge system — and points all of it at a
new domain: **competition, everywhere, unified.**

---

## 1. The one-liner & the wedge

**Athlinks + Strava's gamification, FilmFreeway + Devpost's discovery, and a
public-ledger integrity model — unified across physical *and* creative arenas.**

Today, an athlete-creator's competitive life is scattered across a dozen silos:

| Silo | Covers | Gap |
|---|---|---|
| Athlinks / RunSignup / UltraSignup | Road & trail race results | Physical only, no creative, weak gamification |
| Strava | Training & segments | Not competitions; no medals/awards ledger |
| Peakbagger / 14ers.com | Summit logs | One niche, no cross-domain trophies |
| State wildlife Master-Angler pages | Angling awards | Fragmented per state, paper-era UX |
| FilmFreeway / Submittable | Creative submissions | No athletic side, no reward ledger |
| Devpost / itch.io / MLH | Hackathons & game jams | Dev-only, siloed |

Nobody unifies the **whole competitive self**, and nobody makes the reward
**provable**. Trophy Hype is that unifier, and provable integrity is the moat.

---

## 2. Why now

- **The "athlete-creator" is mainstream.** The same person runs a marathon,
  bags 14ers, ships a game jam entry, and submits a song. Their identity is
  multi-arena; their tools are single-arena.
- **Gamification fatigue with fake points.** Badges that anyone can self-award
  are worthless. A rewards system that is *verifiable* is genuinely new.
- **Discovery is broken.** Opportunities are buried across thousands of sites,
  PDFs, and state pages. An agent that hunts and ranks them daily is a step
  change — and Aether already ships that pattern (the Loom heartbeat).
- **BYOK AI is cheap and private.** Deep discovery + summarization can run on
  the user's own key, keeping data local — a DarkHearts standing rule.

---

## 3. Product scope

Trophy Hype has **five surfaces**, all shipped in this repo's first cut.

### 3.1 The two arenas
- **◈ The Field** — physical athletics: road running, trail & ultra, triathlon,
  cycling/gravel, obstacle racing, peak-bagging (14ers, 46ers, Seven Summits),
  mountaineering, climbing, **angling** (Master Angler programs, cutthroat
  slams, the Western Native Trout Challenge — the "Pacific-West trout"
  collection), open-water & paddle, strength sport, and martial arts (which ties
  straight into Aether's existing Martial Codex).
- **✦ The Stage** — creative submissions: **music first** (songwriting,
  production, beat battles), then film, animation & anime, writing, comics &
  manga, game dev (jams + indie awards), apps & software (hackathons for fun and
  work apps alike), engineering & design (civil, Formula SAE, Solar Decathlon —
  *engineer all of it*), visual art, and photography.

Everything is modeled as an **Opportunity** with a `kind`: `race`, `series`,
`peak`, `award-collection`, `festival`, `competition`, `open-call`, `grant`, or
`gig` (small private/indie events you can plan or host).

### 3.2 The Hunt — the daily morning heartbeat
A dependency-free pulse (`scripts/trophy-heartbeat.mjs`, `npm run
trophy:heartbeat`) that every morning:
1. **Expands the library** from source-pluggable discovery (offline curated pool
   today; live registry/web-search sources drop in behind the same `discover()`
   seam — Athlinks, RunSignup, UltraSignup, FilmFreeway, Devpost, state wildlife
   pages, itch.io, etc.).
2. **Scores every opportunity by fit** against the athlete-creator's profile
   (disciplines, interests, what they create, proximity, timing, cost,
   verifiability).
3. **Runs the integrity pass** (§4) *before* anything is ranked.
4. Writes `public/data/trophy-discoveries.json` — the app's **morning
   briefing**: new-this-pulse, top picks, and the integrity report.

The library **grows day over day** (results accumulate across pulses). Meant to
be wired to a cron / launchd job, mirroring Aether's Loom.

### 3.3 The Trophy Case — gamified, provable rewards
Every earned reward (medal, shirt, placement, PR, summit, catch, acceptance,
award, badge) is a **Trophy** carrying an open **Proof** record. XP =
`base(kind) × difficulty × proofWeight(tier)`. Total XP drives a **level** and a
**rank belt** (Spark → Contender → Challenger → Competitor → Champion → Legend →
Mythic). Streaks reward showing up.

### 3.4 Pursuits — the planning board
A Kanban of committed opportunities (`eyeing → training/building → registered →
submitted → completed`) with target dates and notes. This is where "find a race
to grow faster" becomes a plan.

### 3.5 Integrity — the public conscience
A permanent surface explaining the proof tiers and showing exactly which
listings the Hunt flagged and ranked down, and why. Trust is a feature, shown.

---

## 4. The integrity doctrine — *no corruption, not even the appearance of it*

This is the product's soul and its moat. It mirrors Aether's provenance doctrine
("keep every layer, label every layer"), applied to **proof**.

Every trophy wears a **proof tier**, derived from its strongest evidence — never
typed in by hand:

| Tier | Earns | Backed by |
|---|---|---|
| **V · Verified** | 100% XP | chip time · official results · GPS track · summit log · jury decision · acceptance letter |
| **D · Documented** | 70% XP | certificate · receipt · photo · video |
| **A · Attested** | 40% XP | named third-party witness |
| **C · Claimed** | 15% XP | self-report, nothing attached |

Consequences, enforced in code (`src/lib/trophy/proof.ts`, `gamify.ts`, and the
heartbeat's `integrityPass`):

1. **A lie can't win.** A blaze of unverified claims can never out-rank a smaller
   wall of verified finishes, because XP is multiplied by the proof weight.
2. **Nothing is hidden.** A claim is fully allowed and *visibly labelled* — it
   just counts for a fraction until backed. Leaderboards can filter to
   "verified only."
3. **Listings can't over-promise.** The Hunt caps a listing's trust at what its
   results can actually prove, and any opportunity dangling an unverifiable cash
   prize ("winner picked by us", "guaranteed medal, no result needed") is
   surfaced honestly but **hard-capped in rank** and flagged in the open.
4. **The tier is deterministic.** It is recomputed from evidence anywhere,
   anytime — it cannot be spoofed independently of what backs it, even in
   storage.

This is what makes a Trophy Hype leaderboard mean something. It is also a
compliance and trust story that no incumbent has.

---

## 5. Architecture (as shipped)

```
src/lib/trophy/
  types.ts       — domain model (Opportunity, Trophy, Proof, Pursuit, Profile, DiscoveryFeed)
  proof.ts       — the integrity engine: tiers, method→tier map, deterministic derivation
  gamify.ts      — XP, levels, ranks, streaks, standings
  discover.ts    — fit-scoring / ranking (mirrored by the heartbeat)
  library.ts     — taxonomy + seed helpers
  store.ts       — localStorage persistence; recomputes XP + proof on every write
src/data/trophy/
  disciplines.seed.json    — the two-arena taxonomy (23 disciplines)
  opportunities.seed.json  — 32 hand-curated real events across the full spectrum
  starter.seed.json        — demo profile + Trophy Case (spans every proof tier)
scripts/trophy-heartbeat.mjs — the Hunt (source-pluggable, offline by default)
src/components/trophy/       — Briefing · Discover · Trophy Case · Pursuits · AddTrophy
src/app/trophy/page.tsx      — the route
```

**Stack:** Next.js 15 + React 19 + TypeScript (this repo's stack), local-first
(localStorage now → SQLite/keychain when it ships in the Tauri shell, per
DarkHearts standards). BYOK for any AI narration; **no key is ever bundled.**

**Discovery is source-pluggable.** The offline curated source proves the whole
pipeline with zero network. Real sources (registries, web search, wildlife
pages) return the same shape and pass the identical fit + integrity gates.

---

## 6. Business model

Free core, always (a DarkHearts rule). Money comes from depth, reach, and being
the trusted rail between competitors and the events that want them.

**Revenue streams**

1. **Trophy Hype Pro (consumer subscription)** — ~$6–9/mo. Unlimited daily Hunt
   depth, advanced discovery filters, calendar/Strava/Garmin sync, verified
   badge exports, multi-arena analytics, priority AI narration.
2. **Event marketplace & registration (take rate)** — organizers of **small
   gigs, private, indie, and large events** list and take entries through Trophy
   Hype; a modest per-entry fee (competing with RunSignup/FilmFreeway on price
   *and* on built-in gamified reach). This directly serves the brief's "new
   private, small gig, or large race events to plan for."
3. **Organizer/Brand tools (B2B SaaS)** — verified results ingestion, custom
   award collections, sponsored medals/shirts, and an integrity-certified
   leaderboard widget. Priced per event / per seat.
4. **Sponsorships & fulfillment** — brands sponsor reward tiers (medals, tees,
   gear); optional print-on-demand fulfillment of earned shirts/medals.
5. **BYOK AI passthrough** — users bring their own key; we take nothing on
   inference. (Trust > margin. It compounds into the integrity brand.)

**Unit economics logic:** discovery + gamification drive DAUs cheaply (the Hunt
is a daily reason to open the app); the marketplace and B2B monetize the graph
we build between competitors and events; the integrity ledger is the reason both
sides trust the middle.

**Explicitly-refused revenue (integrity guardrails):** no pay-for-placement in
rankings, no selling verified status, no burying flagged listings for a fee.
These would violate "not even the appearance of it," and they're blocked in code.

---

## 7. Go-to-market

- **Creator-first wedge (music).** Start where the founder's own content lives —
  music submissions — then widen to books, anime, games, and apps. Creators are
  underserved by athletic tools and love a rewards ledger for their wins.
- **Niche athletic beachheads.** Colorado 14ers, angling award-collections, and
  a single flagship race community (e.g. Pikes Peak — already an Aether sacred
  site) — deep, evangelical, high word-of-mouth communities.
- **The unlock:** the *same person* discovers they can track a summit and a song
  in one Trophy Case. Cross-arena identity is the retention hook nobody else has.
- **Loops:** daily Hunt briefing (habit) → verified trophy shares (viral) →
  organizer inbound (marketplace) → more opportunities (better Hunt).

---

## 8. Competitive landscape

| Competitor | We win by |
|---|---|
| Athlinks / RunSignup / UltraSignup | Cross-arena unification + provable gamified rewards |
| Strava | We're the *competition & rewards* layer, not training; complementary (sync target) |
| Peakbagger / 14ers.com | Same summit logging, but as one trophy type in a unified case |
| FilmFreeway / Submittable / Devpost | We add the athletic half and a verifiable reward ledger |
| Generic "badge" gamification | Ours can't be faked — the integrity moat |

---

## 9. Roadmap

- **Phase 0 — Foundation (this cut, shipped):** domain model, integrity engine,
  gamification, 32-event seed library across both arenas, the Hunt heartbeat with
  integrity pass, and the full four-surface app. Verified end-to-end in a browser.
- **Phase 1 — Live discovery:** wire real sources behind `discover()` (web
  search + registries + state wildlife pages), scheduled cron/launchd Hunt,
  profile export to steer it.
- **Phase 2 — Verification rails:** OAuth into results providers (chip timing,
  Strava/Garmin GPS, festival acceptances) for one-tap Verified proof.
- **Phase 3 — Marketplace:** organizer listing + entry-taking, sponsored rewards,
  print-on-demand fulfillment.
- **Phase 4 — Social & ledger:** verified leaderboards, cross-arena profiles,
  shareable trophy cards, and an integrity ledger others can audit.
- **Phase 5 — Ship native:** fold into Aether's Tauri shell (SQLite + keychain),
  Mac/iOS, per DarkHearts shipping standards.

---

## 10. Success metrics

- **Habit:** Hunt-briefing open rate; day-streak distribution.
- **Value:** opportunities tracked → entered → completed (funnel).
- **Trust:** % of trophies at Verified tier; flagged-listing catch rate.
- **Growth:** verified-trophy shares → new signups; organizer inbound.
- **Money:** Pro conversion, marketplace GMV & take, B2B seats.

---

## 11. On the brief

This scope is a faithful build of the founding vision: *clone the Athlinks-style
tracker, gamify it efficiently, unify the whole physical-and-creative spectrum,
hunt the internet every morning to expand the library, keep it incorruptible,
and build around creative-submission competitions (music first).* The examples in
the brief — Master Angler awards, the Pacific-West trout collection, Colorado
14ers, festivals and indie competitions for music/books/anime/games/apps — are
all modeled today as first-class opportunities in `opportunities.seed.json` and
the Hunt's discovery pool. **Find the arenas. Prove the wins. Grow faster.**
