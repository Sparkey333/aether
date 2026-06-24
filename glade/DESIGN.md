# GLADE — Game Design Document

> *A quiet garden, and one small life that grows into whoever you help it become.*

GLADE is a spiritual successor to the **Chao Garden** of *Sonic Adventure 2: Battle* and
the **Tiny Chao Garden** of the GBA *Sonic Advance* games. It takes the part that was once
a side mode — the creature you raised and the garden you raised it in — and makes it the
**whole game**. No races to grind for, no loud action stage next door: a refuge where
wonder, discovery, and a genuine bond compound over weeks, months, and across lifetimes.

This document is the vision (the GDD) followed by the spec for the **v0.1 playable
prototype** that lives beside it in [`index.html`](./index.html). It was authored from a
seven-pillar design pass (Bond · Evolution · Sanctuary · Pocket · Stewardship · Secrets ·
Art/Audio) and condensed into one decision-set.

---

# Part I — Game Design Document

## Vision

GLADE is a calm, offline-first sanctuary game about raising a **Bloomling** — a soft,
part-spirit / part-flora creature born from a seed-egg — through patient daily care, and
tending the living garden that grows up around it. The promise is simple and total:
*nothing can hurt you here, and the thing you love will remember you.*

## What we are carrying forward (and why the original worked)

The Chao Garden's magic was specific, not vague — it came from mechanics doing emotional work:

- **The emotion orb** was the entire interface of love: a glance in, a feeling back. You
  read a *face*, not a stat sheet. → GLADE's **Mote**.
- **Raising via Chaos Drives + animal parts** meant your creature became a *visible record
  of your choices* — it wore its upbringing on its body. → GLADE's **essences → morphology**.
- **Hero/Dark/Neutral** was a *consequence* of behavior over weeks, never a button. → GLADE's
  **Solar/Lunar/Verdant** alignment, tied to *when* and *what* you feed.
- **The garden was slow because the rest of the game was fast** — sanctuary by contrast. With
  no loud room next door, GLADE must *build* refuge through light, sound, pacing, forgiveness.
- **Reincarnation + the Chaos Chao** made care compound across time; the immortal form was a
  monument to *consistency of love*. → **The Returning** and the secret **Everbloom**.
- **The GBA Tiny Chao Garden** made the bond *portable* — take it with you, tend it in the
  world, bring what you earned home. The creature wasn't in a game; it was in your life. →
  **Pocket Glade**.

## Design Pillars

1. **The Bond is reciprocal and remembering.** The Bloomling recognizes you, seeks the
   essences it loves, greets you faster the more you show up, and sours (never fails) when
   neglected. Devotion is something it *visibly returns*.
2. **Evolution is an accumulating portrait of your choices.** No hand-authored forms. Every
   Bloomling is composed each frame from its care history and is unmistakably *yours*.
3. **The garden is the second creature you raise.** The world grows visibly and permanently
   with every act of care — the long-game reward, not a backdrop.
4. **Refuge is earned and textured, not empty.** Slowness is built through sound, light,
   pacing, and forgiveness into a place that feels *safe*, not merely idle.
5. **Stakes are gentle, slow, and always reversible.** Every tension is nursed back, never
   lost, often convertible into a gift. Protection rewards the return, never the absence.
6. **Secrets are deterministic but unguessable.** Every rare outcome has a precise trigger,
   none surfaced in UI — a communal hunt, not a wiki dependency.
7. **The bond is portable.** Pocket Glade lets one Bloomling travel with you — a no-fail,
   no-decay pocket refuge that meaningfully (but boundedly) feeds the home garden.

## Core Loops

- **Moment (seconds):** *Pet* (it leans into your hand, the Mote brightens, a soft chime
  plays); *Feed essences* (accepted eagerly, neutrally, or refused); *read the Mote* at a
  glance — color = alignment, shape/pulse = mood. A glance in, a feeling back.
- **Daily (2–5 min):** return, receive a greeting whose warmth scales with the bond, give a
  few feeds and pets, check weather and any wilting plot. One short visit holds the garden.
- **Lifetime (weeks → generations):** a preference crystallizes; a morph appears; a season
  turns; the garden lushens at a threshold; a long-loved Bloomling cocoons and **Returns**,
  carrying a fraction of its Soul and a faint echo of its body. Care compounds.

## The Bloomling

Born from a seed-egg in the roots of the Old Tree, with a floating **Mote** as its entire
emotional interface (read ambiently, never via menu).

- **Stats:** Grace (flow), Vigor (run), Wit (fly/puzzle), Heart (bond) + a hidden **Soul**
  that persists across lives.
- **The Mote — mood language:** mood is a continuous *valence/arousal* vector mapped to the
  nearest of eight silhouettes (Content, Joyful, Curious, Sleepy, Lonely, Sulking, Anxious,
  and the rare radiant **Blooming**), color and pulse interpolating continuously. The Mote
  leads the emotion before the body animates.
- **Memory (the reciprocity engine):** tracks **Trust** (never shown as a bar, only
  expressed through behavior), **recognition latency** (low trust → it ignores a Call for a
  beat; high trust → it crosses the glade the instant you arrive), a rolling **preference
  profile** (loved/disliked essences it seeks or refuses), and a 14-day **treatment ledger**.
  Mistreatment is never rewarded and never instantly punished — it *accrues*, so it reads as
  a relationship souring, not a fail-state.

## Essences, Stats & Morphology

Every fed essence adds to a category counter, grants stat XP, nudges alignment, and over
time grows a body part. Appearance is **composed each frame** from a hidden Trait Ledger.

| Essence category | Stat | Morph slot | Hue family |
|---|---|---|---|
| **Flora** (petals, spores) | Grace | crown petals / leaf-fronds | greens, rose |
| **Fauna** (fur, fin, chitin) | Vigor | fins, fur, claws, tails | umber, amber |
| **Weather** (mist, ember, frost) | Wit | wings / aura veil | cyan, gold |
| **Mineral** (crystal, ore) | Heart | horns, carapace, gemglow | violet, slate |
| **Emotional** (joy, calm, grief) | Soul + temperament | Mote glyph + body luminance | saturation |

- **Stat rule:** +6 XP per feed (+2 if fed at the matching time of day); 100 XP = +1 level.
- **Morph rule:** every 10 essences of a category = +1 morph **tier** (cap 5); tier sets the
  count/size of parts, dominant subtype picks the variant, hue is the category average.
- **Legible but surprising:** players learn "crystals → horns," but a per-individual seed
  jitters scale/asymmetry ±8%, so identical feeding still yields distinct creatures.
- **Overfeeding can't be exploited:** beyond ~6 essences/day, reactions turn negative — the
  creature is satiated, not a slot machine.

## Alignment: Solar / Lunar / Verdant

A single float (−100 Lunar … +100 Solar; |x|<25 = Verdant) tied to the day-night cycle. Each
feed nudges alignment toward the essence's polarity, **scaled by *when* you feed** (Solar
pushes harder by day, Lunar by night, ×1.5 at dawn/dusk). Idle drift decays toward Verdant.
*When* you tend is as load-bearing as *what* you feed. Bands unlock exclusive morph subtypes
(solar manes, lunar frostwings, verdant moss-pelts).

## Growth, The Returning & Everbloom

- **Stages:** Seed-egg → Child (high Heart gain) → **First Morph** (the cocoon-flash where
  slots snap to the ledger and the alignment band locks the visual key) → Adult → Elder.
- **The Returning (reincarnation):** at adulthood a loved Bloomling may cocoon. Stats and
  morph tiers reset — **but** `soul += (sum of stat levels)/8`, and ~15% of each morph tier is
  retained as a faint **echo** (a child of a winged parent sprouts wing-nubs early). Higher
  Soul → faster growth and more starting echoes. A fifth-generation Bloomling visibly carries
  its lineage.
- **Everbloom (the secret apex):** reached only if, across **≥3 Returnings**, the Bloomling
  held Verdant balance at each cocoon, reached every stat high, and Soul ran deep. It stops
  aging, its Mote becomes a slow prism through all three bands, and it gains an exclusive
  crystalline-bloom crown. Devotion across lives, not grinding, is the gate. (Target rarity
  <1%.)

## The Garden World

One contiguous, seamless garden with six anchor zones around a central hub: **The Old Tree**
(hub/spawn), **The Pond** (Grace), **The Meadow** (Vigor), **The Grove** (Wit), **The Burrow**
(Heart/rest), and the **Hollow Stump** (essence storage + the Pocket Glade sync stone). No
fail-states, no timers, no game-over — the word "lose" does not exist in-world.

The garden levels with you (**Verdancy 0–100**), raised only by care actions. Thresholds spawn
*persistent* growth (vines thicken, paths moss over, dead branches releaf) and unlock biomes:
Sprouting (20), Flourishing (45, opens the Marsh), Radiant (70, aurora nights + the Highland
Terrace), Everbloom-touched (90, opens the secret Moonwell). A ~24-real-minute day loop drives
the alignment axis; weather is soft and never punishing (light rain *boosts* blooming);
seasons shift palette and spawns.

## Stewardship: Gentle Stakes

The garden is divided into **Plots**, each with a hidden **Vitality** shown only as visual
state (lush → pale → dormant), never a number. Untended Vitality drifts down but **floors at
a dormant minimum — a plot can sleep but never dies.** Three slow, reversible, telegraphed
tensions: **Blight** (a soft desaturation cured by tending twice; it only dims a Bloomling's
Mote, never harms it), **Withering** (purely cosmetic, re-blooms within a day of watering),
and the **Invasive Bramble** (you don't fight it — you *coax* it into a permanent decorative
essence source; the threat converts into a gift). Bloomlings in a neglected garden don't flee
or sicken — they curl, dim their Mote, and wait by the gate. **Neglect reads as longing, never
punishment.**

## Pocket Glade

The offline-first companion layer. One Bloomling — the **Wayfarer** — travels with you; the
rest stay home. A small save-blob with a `last_tick` timestamp fast-forwards elapsed real time
on open and merges home on return.

- **30-second loop (widget):** Pet (capped), Offer Essence (at reduced potency — pocket is
  maintenance, home is real shaping), and **Gather** drifting motes-of-light into **Dewdrops**
  (the ring homage, earned by showing up, not twitch skill).
- **Long session (2–5 min):** a rotating no-fail ambient **Wayfarer Path** that banks a
  **Memory** keepsake displayed back home as garden decor.
- **No dark patterns:** no streaks, no red badges, no loss-framing. At most one gentle,
  user-scheduled nudge per day, framed as invitation. Return after a week to find the Wayfarer
  has *gathered small gifts* for you.

## Secrets & Discovery

Every secret is **deterministic but unguessable**, logged to a **Personal Almanac** shadowed
by a global **Glade Codex** ("0.3% of players found this"). Examples: the **Eclipse Bloom**
(balanced Solar/Lunar fed within minutes of the dawn/dusk flip), **Whisperthorn** (a full life
raised through gentleness), **Stormcoat** (presence through three weather events). **The
Hollow** (the Kindergarten analog) holds discoverable tutors, a **Mote-Reader** that hints at
your next morph and an undiscovered secret, a **Health Grove**, and a **Night Market** that
appears only on Lunar-peak nights. Discovery is ambient, never quest-marked.

## Art, Audio & Feel

- **Bloomling shape grammar:** one teardrop body path; every feature an additive z-ordered
  layer (root → body → fur/fins → petals → wings → horns → glow → Mote), each a stored
  `{type, hue, scale, angle, jitter}` record, never a sprite. New parts fade and scale in over
  ~1.2s. Idle motion is a gentle bob + sub-pixel breathing — it should look like it's *resting*.
- **The Mote:** a small orb with an additive bloom halo; color = alignment, shape/pulse = mood.
- **Palette:** all generated HSL, no assets. Solar warm-gold, Lunar cool-indigo, Verdant green.
  Background is a vertical gradient lerped across a clock-synced day cycle — dawn pastels,
  bright noon, violet dusk, luminous (never scary) night.
- **Audio (fully synthesized Web Audio):** a slow ambient bed of detuned sines + filtered wind
  keyed to alignment, a day/night layer that crossfades so dusk literally darkens the chord,
  and soft care stingers (feed, pet, graft, the Returning's long swell to a single bell,
  blight-heal's dissonance resolving to consonance). Nothing ever exceeds gentle.
- **UI calm:** no aggressive HUD; diegetic, low-contrast, roomy. No timers, no popups, no red.

---

# Part II — Build Spec (v0.1 prototype, [`index.html`](./index.html))

A single self-contained HTML file — Canvas 2D + Web Audio, vanilla JS, localStorage, fully
offline, no external assets, no build step. Goal: a thing that **feels alive between visits**.

## Scope (what's in / out for v0.1)

- **In:** one Bloomling; one screen; 8 essences; pet / feed / name / call; the Mote; wall-clock
  time passing with offline catch-up; growth + morphs + one blight beat + the Returning +
  Everbloom flag; save/load; synthesized ambient audio.
- **Deferred:** zone navigation, Pocket Glade sync, the Codex/Almanac, seasons/weather variety,
  races. The data model is kept forward-compatible so these slot in later.

## Data Model (`localStorage` key `glade.save.v1`)

```
G = {
  createdReal, lastReal,          // wall-clock anchors for offline catch-up
  creatureSeconds,                // total elapsed "creature time" (drives aging + sky)
  bloomling: {
    name, born, age, stage,       // egg | child | sprout | adult | elder
    stats:{grace,vigor,wit,heart}, soul,
    align:{solar,lunar,verdant}, alignment,
    traits:[{kind,hue,mag}],      // composed morphology
    mood, hunger,
    memory:{pets,feeds,fav,favCount,returns,everbloomSeed,lastSeen},
    everbloom,
    _fed:{essenceId: count},      // lifetime feed tallies (drives morphs + favorite)
  },
  garden:{ bloom, level, flowers[], blights[], tendCredit, season },
  settings:{ sound }, firstRun,
}
```

## Core systems implemented

- **Procedural rendering:** sky gradient lerped across a day/night loop with a travelling
  sun/moon + stars; pond with animated ripples; an Old Tree whose canopy fullness scales with
  garden bloom; spawning flowers; ambient particles (pollen by day, fireflies by night). The
  Bloomling is drawn from one teardrop body + z-ordered trait layers (crown, horns, ears,
  fins, moth/feather wings, tail, glow, freckles), tinted by alignment, with a mood-reading
  **Mote** above it (hungry droplet / joyful heart / dim orb / calm circle).
- **Care loop:** tap the creature to **pet** (raises mood + Heart, it leans toward your hand
  and remembers); select an **essence** and tap to **feed** (lowers hunger, shifts alignment,
  grows stats, and at the 3rd feed of a kind grafts a matching body part); **name** and
  **call** buttons; the egg must be **warmed** (tapped) to begin, then it hatches.
- **Evolution:** essence tallies set alignment (argmax) and, at each growth stage, compose new
  traits from the dominant essence; `crown/horn/wing/...` parts appear as the creature grows.
- **Stewardship:** untended gardens sprout a **blight**; tap it to clear it, which raises the
  garden's bloom and the Bloomling's mood — protection as an act of care.
- **The Returning:** an eligible elder (loved, content) can cocoon; the next life starts as a
  fresh egg carrying forward a fraction of **Soul**, its **name**, and a faint **echo trait** of
  its parent. Balanced devotion across Returnings unlocks the **Everbloom** (radiant, ageless).
- **Persistence / "it lived while you were gone":** state saves on every meaningful action,
  on tab-hide, and on a timer; on load (or tab-return) it advances aging, hunger, and mood by
  the real elapsed time on a gentle, **capped** curve — so returning is a reunion, never a
  punishment.

## Verification

The game's logic was exercised headless (stubbed DOM/Canvas) across the full lifecycle —
hatch → feed → evolve → clear blight → Returning → Everbloom, plus a day/night render sweep
and a save/reload round-trip — all passing. (See the harness approach in the commit notes.)

## Roadmap from here

The named **deferred** systems above, in priority order: Pocket Glade (the portability that
made the original sing), zone navigation + Verdancy biomes, the secrets/Almanac layer, and
seasons/weather. All fit the existing data model.
