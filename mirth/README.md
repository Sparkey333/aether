# Mirth — the Jester

> A comedic familiar that practices on its own pulse — and never calls a bit
> funny without a real room.

Mirth is a standalone comedy engine built on the honest-baseline doctrine of
[Aether](../README.md): the same machine that refuses to draw a leyline without
its chance baseline, turned to refuse a *joke* the authority of a laugh it has
not earned. Soul-file: [`content/canon/mirth.md`](../content/canon/mirth.md).
Architecture: [`docs/MIRTH.md`](../docs/MIRTH.md).

## Quickstart

```bash
npm run pulse        # one beat of the Mirth Loom — no install required
```

Zero dependencies. It reads the seeds in `data/`, runs a pulse, and writes
`out/set.json` — the sibling of Aether's `public/data/hypotheses.json`.

## What a pulse does

1. **Generate** — subjects × frames → raw premises (tier **D**).
2. **Style** — shape each through a voice/delivery technique (tier **C**).
3. **Fuse** — the combinator pairs one **ancient** technique with one **modern**
   one (the *Bach-and-Metallica* engine) over a cross-domain pivot.
4. **Score** — measure the fusion's **structural surprise** (incongruity)
   against a **Monte-Carlo baseline** of random pivots. Beat it → tier **B**.
5. **Sequence** — build a tight set: opener → build → closer, callbacks wired.
6. **Shelf** — keep every near-miss (tier **C**). The shelf is a seed bank.

## The tier ladder

| Tier | Meaning | Who grants it |
|---|---|---|
| **D-raw** | a generated premise, untested | the Loom |
| **C-styled** | shaped to a voice; technique-informed | the Loom |
| **B-crafted** | structurally whole; beat the surprise baseline | the Loom |
| **A-killed** | performed, and measurably beat the laugh baseline | **only a real room** |

**The Loom can reach B. It can never assign A.** That refusal is the whole
point — and it is enforced in code (`scripts/loom.mjs` never emits `A-killed`).
Structural surprise is *necessary, not sufficient*, for funny; the room is the
only judge of the rest.

## What is honest here, and what is scaffold

- **Honest and real:** the pipeline, the era-fusion combinator, the
  Monte-Carlo surprise baseline, the tier promotion, the set sequencing, the
  kept shelf, the hard refusal to self-grade funny.
- **Scaffold-grade on purpose:** the *wording* of the bits. Phase 1 is the
  **engine**; the actual writing plugs in at `craftBit()` via an optional LLM
  writers'-room layer (Aether already ships `@anthropic-ai/sdk`). See
  `docs/MIRTH.md`, Phase 1.5 — the scoring and tiering stay identical.

## Map

| Path | What lives there |
|---|---|
| `scripts/loom.mjs` | the Mirth Loom — generate · fuse · score · sequence · shelf |
| `data/techniques.seed.json` | the Technique Lexicon (ancient + modern moves) |
| `data/premises.seed.json` | subjects, pivots, frames, the domain space |
| `data/persona.seed.json` | the familiar's stage-0 form and move-pool |
| `src/types.ts` | `Bit` / `Persona` / `Technique` / `MirthSet` types |
| `out/set.json` | the pulse output (gitignored; regenerated each beat) |

## The vows

1. Never call a bit funny without the room's number behind it.
2. Never let a laugh track borrow the authority of a real laugh.
3. Study the masters' craft; never wear a living person's face.
4. Keep every bomb — the shelf is a seed bank, not a graveyard.

## Where it's going

Phase 2 adds the real audience input and the laugh `z` that finally lets a bit
reach **A**. Phase 3 adds evolution: clear the threshold of A-killed bits and the
familiar evolves a new stage form, auto-written into canon — the record that
becomes the show. Full roadmap in [`docs/MIRTH.md`](../docs/MIRTH.md).
