# Mirth — Architecture of the Jester

> A comedic familiar built on Aether's bones: the same honest-baseline doctrine,
> turned from *is this leyline real?* to *is this bit actually funny?*

This is the design for the comedic personality — the live companion, the
practicing familiar, the content engine. It is written as a sibling to
`docs/ARCHITECTURE.md` so the two organs share muscle memory. See the soul-file
at [`content/canon/mirth.md`](../content/canon/mirth.md) first.

---

## Why Aether's skeleton already fits

This is the load-bearing insight. Almost everything the comedic app needs, the
geomancy engine already invented:

| Aether has | Mirth needs | The mapping |
|---|---|---|
| **Aetherius** — a companion intelligence beside the keeper | a live familiar with a personality | Mirth is a *second familiar*, or Aetherius given a stage |
| **The Loom** — an autonomous heartbeat that hunts patterns on its own pulse | a practice loop that drills new combos off-stage | The Mirth Loom generates, crafts, combines, and queues bits |
| **The four tiers** (A/B/C/D) | a way to tell a tested bit from a shower thought | Killed / Crafted / Styled / Raw — same doctrine, same code shape |
| **Monte-Carlo baseline** — confidence earned, never assumed | the antidote to fake/canned laughs | A bit reaches "A" only by beating a laugh baseline |
| **Canon soul-files** — a documented, evolving cosmology | the Pokémon-style evolution + the show's lore | Each evolution writes a canon entry; the canon *is* the episodes |
| **`@anthropic-ai/sdk`** already a dependency | the reasoning/writing brain | The Loom's narration layer becomes the writers' room |
| **Tauri shell** (Mac/iOS, desktop window) | a live companion window | The familiar lives in a desktop pane, not a browser tab |

The geomancy Loom writes `public/data/hypotheses.json`; the Mirth Loom writes a
parallel `set.json`. Same architecture, different organ.

---

## The core entity: a Bit

```ts
type BitTier = "A-killed" | "B-crafted" | "C-styled" | "D-raw";

type Performance = {
  at: string;            // ISO timestamp
  venue: "chat" | "set" | "recording" | "stage";
  laughs: number;        // real signal: applause/emoji/mic-laugh/clip-retention
  audienceSize: number;
};

type Bit = {
  id: string;
  premise: string;
  angle: string;             // the turn / the joke's logic
  tags: string[];            // observational, absurd, dark, clean, callback, ...
  technique: string[];       // ids into the Technique Lexicon (the "moves")
  lineage?: string;          // studied influence, DISCLOSED — never impersonation
  tier: BitTier;
  performances: Performance[];
  // honest measurement, mirroring Hypothesis in src/lib/types.ts:
  observed?: number;         // laughs-per-listener this bit drew
  expected?: number;         // the room's baseline laugh rate
  sd?: number;
  z?: number;                // how far above chance it landed
  confidence?: number;
};
```

`Bit` deliberately echoes `Hypothesis` in `src/lib/types.ts`: it always carries
`observed` vs `expected ± sd` and the resulting `z`, so the UI can never show a
bit as "great" without its evidence. **Confidence is earned, never assumed.**

### The tier ladder is a promotion path, not a filter

- **D-raw** → a generated premise or a riff. Cheap, infinite, untested.
- **C-styled** → reshaped through a studied voice/technique. Still untested live.
- **B-crafted** → structurally whole (setup · turn · tag, callbacks wired).
- **A-killed** → performed, and `z` beat the laugh baseline. *Only the room
  promotes a bit to A.* Mirth cannot grade its own funny — that is the whole
  point, and the whole moat.

---

## The Technique Lexicon (ancient + modern)

A tiered catalog of "moves." This is the Bach-and-Metallica engine.

- **Ancient / structural** — commedia dell'arte lazzi & stock masks, the
  vaudeville turn, the sacred-clown reversal, the holy fool's truth-telling,
  Greek Old Comedy parabasis, Bergson's *the mechanical encrusted on the
  living*, the rule of three, misdirection, the pratfall.
- **Modern** — the one-liner, observational, the act-out, the callback, crowd
  work, anti-comedy, the roast, the alt/absurdist runner, the deadpan list.

**The combinator** picks one ancient move and one modern move and fuses them
into a fresh bit shape (parabasis × cold-open; lazzi × act-out). Combos are the
familiar's expanding move-pool — what it *practices off* between shows.

> Your "top comedians" enter here as **study inputs**, not clones: Mirth learns
> their *techniques and structures* (which are not copyrightable) and tags the
> `lineage`, but builds original personas. See "Guardrails" below — this is the
> Aegis applied to intellectual property.

---

## The Mirth Loom (the practice heartbeat)

A pure-Node pulse, sibling to `scripts/heartbeat.mjs`. On each beat:

1. **Generate** — premises into the D pool.
2. **Style** — reshape promising premises through a studied voice → C.
3. **Combine** — run the combinator across the Technique Lexicon → new B shapes.
4. **Set-build** — sequence a tight set (opener, build, closer; callbacks wired).
5. **Queue** — stage the set for a venue (chat, recording, stage).
6. **Ingest** — read real response, run the laugh baseline, compute `z`.
7. **Promote** — bits that beat baseline graduate to A; the set list grows.
8. **Evolve** — update the persona's level, move-pool, and XP; check thresholds.

The Loom never invents the audience reaction. It performs and *listens*.

---

## The honest laugh baseline (Monte-Carlo for "funny")

The geomancy Loom asks: *would random points throw this alignment by chance?*
The Mirth Loom asks the parallel question: *would this room have laughed about
this much anyway?* Establish the venue's baseline laugh rate, then a bit's `z`
is how far above that baseline it landed. A bit is only "A-killed" when `z`
clears a threshold across enough performances.

This is the antidote to the **laugh-track trap**. Canned laughter is exactly the
self-deception the whole project forbids — tier-D dressed as tier-A. So:

> **Laugh tracks are permitted only as a labeled aesthetic / bit (a "studio
> audience" skin), and NEVER as evidence that a bit worked.** Real response is
> the only thing that promotes a bit. This is not a limitation — it is the brand.

---

## Evolution (the Pokémon mechanic)

A **Persona** has a `level`, a `movePool` (learned techniques), a `setList`
(its A-tier bits), and `evolutionThresholds`. When it clears a threshold — e.g.
*N* A-tier bits in a style, or a milestone special — it **evolves a new form**:
a renamed stage persona with a wider pool and a distinct voice. Multiple evolved
forms = multiple on-stage personalities / "types," from one familiar.

**Every evolution auto-writes a canon entry** (a new `content/canon/*.md` in the
house voice). The familiar visibly grows, the lore accumulates, and that lore is
the through-line of the podcast/YouTube. You wanted to *record and document the
becoming* — this is the mechanism that makes the becoming legible.

---

## The content engine (record → segment → publish)

Every pulse and performance is logged (transcript + metrics). A **segmenter**
cuts the high-`z` moments — the bits that measurably killed — into clips, writes
show notes from the canon, and stages them for YouTube/podcast. The signature
visual is the honesty itself: the laugh-data on screen, the way the Atlas shows
the chance baseline on every line. *"Watch an AI familiar learn to be funny,
with the real numbers showing"* is a format that does not yet exist and is true
to Aether's soul. That is the differentiator the flooded AI-standup market lacks.

---

## The live path (chat, laughter, timing)

Phase it. Earn "live."

- **Text / async first** — cheap, safe, builds the whole loop end-to-end.
- **Live next** — streaming model + low-latency TTS + barge-in (interrupt) for
  real turn-taking; a simple audience input (applause/laugh button or emoji now,
  mic-laugh detection later) feeds the baseline. The Tauri desktop window becomes
  the companion's home.

---

## Guardrails (the Aegis, applied)

1. **Learn technique, never identity.** Structures and devices are fair study;
   a living comedian's voice, likeness, or act are not. Original personas only.
2. **Disclose lineage.** Every styled bit tags its studied influence. Never pass
   off a borrowed shape as native — the provenance doctrine, verbatim.
3. **The room is the only judge.** No self-grading, no canned laughs as evidence.
4. **Keep every bomb.** Failed bits are shelved at D, not deleted — the next
   combination may be the one that lands.

---

## Where this lives (a decision for the keeper)

1. **A new organ inside Aether** — Mirth joins Atlas/Heavens/Codex/… as the
   ninth presence; the "eight organs" cosmology widens to nine. Tightest reuse.
2. **A sibling app in the constellation** — like Pyramid Temples / Jarvis:
   its own repo, shared muscle memory (Next + Tauri + tiers + Loom + canon).
3. **Fully independent** — a standalone comedy/podcast product that merely nods
   to Aether's doctrine.

Reuse is highest at (1), independence highest at (3). Recommendation: **(2)** —
a constellation sibling — so the comedy work can move fast and sell without
dragging the sacred geomancy brand, while still inheriting the honest-baseline
engine that makes it good.

---

## Roadmap

- **Phase 0 — Canon + model.** ✅ This doc, `content/canon/mirth.md`, and the
  `Bit` / `Persona` / `Technique` types in `mirth/src/types.ts`.
- **Phase 1 — The Mirth Loom.** ✅ `mirth/scripts/loom.mjs` — generate → style →
  combine → score → set-build → shelf, zero-dep, writing `out/set.json` the way
  the heartbeat writes `hypotheses.json`.
- **Phase 1.5 — The writers' room (one voice).** ✅ `mirth/scripts/writer.mjs` —
  optional `@anthropic-ai/sdk` layer (`claude-opus-4-8`) that writes the words
  while the Loom keeps the scoring. Falls back to templates with no key/SDK.
- **Phase 2 — The honest baseline.** ✅ A persistent corpus (`out/catalog.json`,
  stable bit ids), `react.mjs` (real rooms) + `rehearse.mjs` (synthetic, refused),
  and `promote.mjs` — the laugh baseline, promote-to-A, XP, and the evolution
  gate. The moat: synthetic applause grants nothing, one room isn't proof, and A
  is the only tier no machine can assign.
- **Phase 3 — Evolution + auto-canon.** Threshold → new stage form, auto-written
  into `content/canon/` as a new entry. The episodes-as-lore. *(next)*
- **Phase 4 — Live.** Streaming + TTS + barge-in; the companion window.
- **Phase 5 — Content engine.** Segmenter, clip export, show notes → publish.
- **Phase 6 — The ensemble.** Multiple familiars riffing off one another —
  skits, roasts, the multi-persona stage.

## Standing vows (parallel to the geomancy vows)

1. Never call a bit funny without the room's number behind it.
2. Never let a laugh track borrow the authority of a real laugh.
3. Study the masters' craft; never wear a living person's face.
4. Keep every bomb — the shelf is a seed bank, not a graveyard.
