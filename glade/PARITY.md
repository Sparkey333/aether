# GLADE — Feature Parity Tracker

A living map of where GLADE stands against its ancestors — the **Sonic Adventure 2 (Battle)
Chao Garden** and the **GBA Tiny Chao Garden** — plus the ways it goes *beyond* them. Update
this on every build so the thread of "are we there yet, and where next" is always visible.

**Status legend**

| | Meaning |
|---|---|
| ✅ | **Done** — working in the shipped prototype (`index.html` / `pocket.html`) |
| 🟡 | **Partial** — a real working version exists; a deeper version is specced |
| 📐 | **Designed** — specced in a design doc (`DESIGN.md` / `BESTIARY.md`), not yet built |
| ⏳ | **Planned** — on the roadmap, not yet fully specced |
| ➕ | **Beyond Chao** — an expansion with no Chao-Garden equivalent |
| 🚫 | **Out of scope** — intentionally not doing (reason noted) |

_Last updated: 2026-07-25 · prototype v0.2_

---

## 1 · The bond & the creature's "face"

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| The emotion orb (mood/alignment at a glance) | The **Mote** | ✅ | colour = alignment, shape/pulse = mood |
| Petting | Pet (tap the creature) | ✅ | raises mood + Heart; it leans in; remembers |
| Feeding | Feed **essences** | ✅ | 8 essences → stat + alignment + morphology |
| Naming | Name it | ✅ | persists across lives |
| Calling it over | Call | ✅ | |
| Recognises / remembers you | Memory model | 🟡 | pets count, favourite essence, welcome-back gift; full **Trust + recognition-latency** model 📐 |
| Mood expressions | Mote shape + face | 🟡 | joyful / content / low / hungry now; the 8-silhouette set 📐 |
| Petting vs. mistreating bends its nature | Care shifts mood + alignment | 🟡 | neglect → lonely (never a fail-state); explicit "mistreat" accrual 📐 |

## 2 · Raising & evolution

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Chaos Drives (stat items) | **Essences** | ✅ | +stat, +alignment, +morph tally |
| Small animals (parts + behaviours) | Essence **morphology grafts** | ✅ | crown, horns, wings, fins, ears, tail, glow, freckles |
| Swim / Fly / Run / Power | **Grace / Vigor / Wit / Heart** (+ hidden **Soul**) | ✅ | mapped to **Aspects** Tide/Root/Gale/Hearth 📐 |
| Hero / Dark / Neutral alignment | **Solar / Lunar / Verdant** | ✅ | weighted by *when* you feed (day/night) |
| Evolution + two-letter types | Growth stages + trait composition | ✅ | egg→child→sprout→adult→elder; the **12 Natures** 📐 |
| No two Chao alike | Procedural traits + per-individual seed jitter | ✅ | |

## 3 · Lifecycle & the long game

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Reincarnation | **The Returning** | ✅ | carries Soul + name + a faint echo trait |
| Chaos Chao (immortal apex) | **The Everbloom** | ✅ | in-game + a whole **legendary pantheon** 📐 |
| Aging / lifespan | Wall-clock aging + offline catch-up | ✅ | gentle, capped so returning is a reunion |
| Death | — | 🚫 | GLADE has **no fail-state**; elders Return, they never die |

## 4 · The world / garden

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Garden as a calm sanctuary | The glade | ✅ | no timers, no game-over |
| _(minimal in SA2)_ | Day/night cycle | ➕ ✅ | drives the alignment axis |
| Weather | Weather | 📐 | rain *boosts* blooming; never punishing |
| Seasons | Seasons | 🟡 | label shown; mechanical effects 📐 |
| Multiple gardens | **Zones** (Pond / Meadow / Grove / Burrow) | ⏳ | roadmap |
| Decorating / growing the garden | **Verdancy** (garden blooms as you tend) | 🟡 | bloom + flowers + tree canopy now; threshold **biomes** 📐 |

## 5 · The Kindergarten & the economy

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Lessons (raise hidden stats) | **The Hollow** — tutors | 📐 | |
| Fortune teller | **Mote-Reader** | 📐 | hints your next morph + a secret |
| Health center | **Health Grove** | 📐 | |
| Black market (fruit / eggs / toys) | **Night Market** (Lunar-peak nights) | 📐 | |
| Rings (currency) | **Dewdrops** ✦ | 🟡 | collectible now; a shop to spend them 📐 |

## 6 · Expression & competition

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Chao Races | Optional "showings" | ⏳ | design keeps competition *downstream of care*, never the point |
| Chao Karate | — | ⏳ | if built, a gentle non-combat display, not a fight |

## 7 · Portability — the GBA magic

| Tiny Chao Garden (GBA) | GLADE | Status | Notes |
|---|---|---|---|
| A pocket version of your creature | **Pocket Glade** (`pocket.html`) | ✅ | phone-framed, installable **PWA**, offline |
| "It comes everywhere with me" | Same creature, same save | ✅ | shared `glade.save.v1` |
| Ring-earning minigames | Gather dewdrops + quick treats | 🟡 | gather now; dedicated minigames 📐 |
| Upload / download back home | Two-way sync | ✅ | live cross-tab `storage` sync + while-away card |

## 8 · Presentation

| Chao Garden | GLADE | Status | Notes |
|---|---|---|---|
| Art | Procedural in-game **+ Higgsfield concept art** | 🟡 | see [`design/GALLERY.md`](./design/GALLERY.md); final art pipeline ⏳ |
| Music | Synthesised ambient bed + fanfares | ✅ | |
| UI | Diegetic, calm, no aggressive HUD | ✅ | + optional **cozy-CRT** mode ➕ |

---

## 9 · Beyond the Chao Garden — GLADE-original expansions ➕

| Expansion | Status | Where |
|---|---|---|
| **12 Natures** (Alignment × Aspect) | 📐 (alignment ✅ in engine) | `BESTIARY.md` |
| **Earned rarity tiers** (Sprout→…→Legendary→Mythic) | 📐 | `BESTIARY.md` |
| **Chromatics** — the "shiny" system (Albloom/Umbral/Glass/Ashen) | 📐 | `BESTIARY.md` |
| **Motefall** — rare Mote variants | 📐 | `BESTIARY.md` |
| **Legendary pantheon** (7 named apexes) | 🟡 | Everbloom in-game; 5/7 concept-arted; Dreamer + Geminae pending |
| **The Almanac** — collection/discovery meta | ⏳ | `BESTIARY.md` |
| **Desktop app** (Tauri `.dmg`) | ✅ ➕ | Chao had none |
| **Cozy-CRT mode** | ✅ ➕ | |

---

## 10 · Roadmap — Now / Next / Later

### ▶ Now (approved 2026-07-25)
- [ ] **Draw the Dreamer + Geminae** legendaries — ⏸ _blocked: Higgsfield disconnected; resume when it reconnects_
- [ ] **The 12-Nature reference grid** (4 Aspects × 3 alignments) — ⏸ _blocked: Higgsfield_
- [ ] **Turnaround + expression sheets** for a chosen favourite — ⏸ _blocked: Higgsfield_
- [ ] **Wire the in-game Everbloom render toward its portrait** — code, ready to start (no external dep)

### ⏭ Next
- [ ] **Zones** (Pond / Meadow / Grove / Burrow) + **Verdancy biomes**
- [ ] **The Hollow** (Kindergarten analog) + **Night Market** + a dewdrop shop
- [ ] Full **memory / Trust** model + the **8 mood silhouettes**
- [ ] **The Almanac** — records Natures, Chromatics, and Legendaries as you find them

### ⏳ Later
- [ ] **Weather + season** mechanics
- [ ] **Chromatics + rarity** systems in the procedural engine
- [ ] Optional **"showings"** (races/karate reimagined, non-combat)
- [ ] **Code-sign / notarize** the `.dmg`

---

> This tracker is the single source of truth for GLADE's scope. When a row ships, bump its
> status and note the file. When a Chao feature is deliberately dropped, mark it 🚫 with the why —
> we track what we *chose not to* carry as carefully as what we did.
