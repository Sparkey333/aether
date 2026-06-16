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

### Optional: open the writers' room (real voice)

The Loom writes joke-*shaped* objects on its own. To give the Foundling a real
voice, plug in the LLM writers' room — same pipeline, same scoring, real wit:

```bash
npm install                 # adds the official @anthropic-ai/sdk (optional dep)
cp .env.example .env        # then put your ANTHROPIC_API_KEY in it
set -a; . ./.env; set +a    # export it
npm run pulse               # now the room writes the bits (model: claude-opus-4-8)
```

Without the key or the install, the pulse still runs — it just narrates
`writers' room: templates` and uses the zero-dep engine. The room only changes
the **words**; the honest scoring and tiering are byte-for-byte identical.

## What a pulse does

1. **Generate** — subjects × frames → raw premises (tier **D**).
2. **Style** — shape each through a voice/delivery technique (tier **C**).
3. **Fuse** — the combinator pairs one **ancient** technique with one **modern**
   one (the *Bach-and-Metallica* engine) over a cross-domain pivot.
4. **Score** — measure the fusion's **structural surprise** (incongruity)
   against a **Monte-Carlo baseline** of random pivots. Beat it → tier **B**.
5. **Sequence** — build a tight set: opener → build → closer, callbacks wired.
6. **Shelf** — keep every near-miss (tier **C**). The shelf is a seed bank.

## The loop (pulse → perform → promote)

The Loom generates and structures; only a real room can call a bit funny. The
cycle:

```bash
npm run pulse                              # practice: write/fuse/score bits → out/catalog.json
node scripts/react.mjs --list              # see the corpus + bit ids
node scripts/react.mjs <bitId> 18 25 set   # log a REAL room: 18 of 25 laughed
npm run promote                            # run the laugh baseline → promote to A
```

`out/catalog.json` is the persistent corpus (the seed bank). `react.mjs` logs a
real room's response; `npm run promote` computes the **laugh baseline** and
promotes only the bits whose real laugh-`z` beats it across `≥2` rooms. Two
refusals are load-bearing and visible in the output:

- **Synthetic reactions never count.** `npm run rehearse` writes a fake laugh
  track (`synthetic:true`); the promoter records it but grants it nothing. A
  laugh track is tier-D cosplaying as tier-A.
- **One good night isn't proof.** A bit that beats the bar in a single room is
  held back until more rooms agree.

Each A-killed bit joins the persona's set list, earns XP, and moves it toward an
**evolution** — at the threshold, `readyToEvolve` flips (Phase 3 writes the new
stage form into canon).

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
- **The voice is pluggable:** the *wording* comes either from the zero-dep
  template engine (joke-shaped, deliberately rough) or, when you open the
  writers' room (`scripts/writer.mjs`), from `claude-opus-4-8`. Either way the
  Loom decides the tier from the *domains*, before any words exist — so the
  writers' room can never talk a bit into a higher tier. It writes; the room
  still judges.

## Map

| Path | What lives there |
|---|---|
| `scripts/loom.mjs` | the Mirth Loom — generate · fuse · score · sequence · shelf |
| `scripts/writer.mjs` | the writers' room — optional `@anthropic-ai/sdk` voice layer |
| `scripts/react.mjs` | log a **real** room's response (the only path to A) |
| `scripts/rehearse.mjs` | a **synthetic** room — recorded, but never promotes to A |
| `scripts/promote.mjs` | the laugh baseline → promote-to-A, XP, evolution gate |
| `scripts/store.mjs` | stable bit ids, the corpus, the honest math (shared) |
| `data/*.seed.json` | the Technique Lexicon, premises/pivots/domains, the persona |
| `src/types.ts` | `Bit` / `Persona` / `Technique` / `Performance` / `Catalog` types |
| `out/catalog.json` | the persistent corpus + persona state (gitignored) |
| `out/performances.jsonl` | the room log — real and synthetic reactions (gitignored) |
| `out/set.json` · `out/setlist.json` | per-pulse set · the A-killed set list (gitignored) |

## The vows

1. Never call a bit funny without the room's number behind it.
2. Never let a laugh track borrow the authority of a real laugh.
3. Study the masters' craft; never wear a living person's face.
4. Keep every bomb — the shelf is a seed bank, not a graveyard.

## Where it's going

Phase 2 is **built** — real audience input, the laugh baseline, and the
promote-to-A path that finally lets a bit reach the top tier (and refuses the
fakes). Phase 3 is next: clear the threshold of A-killed bits and the familiar
**evolves** a new stage form, auto-written into canon — the record that becomes
the show. Full roadmap in [`docs/MIRTH.md`](../docs/MIRTH.md).
