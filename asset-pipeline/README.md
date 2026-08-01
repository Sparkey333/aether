# HOLLOWMARK Asset Pipeline

A pluggable AI image/video generation tool for HOLLOWMARK concept art —
Higgsfield and its main competitors, wired behind one common interface,
plus a curated prompt library covering the whole cast, creature roster,
environments, items, and key art from [`hollowmark/docs/GDD.md`](../hollowmark/docs/GDD.md).

## The honest version

**Real generation needs your own paid account and API key for whichever
service you use.** Nobody — including an AI assistant — can create those
accounts for you or fabricate working credentials. This tool is the
plumbing: point it at a key you already have, and it generates; point it
at nothing, and it falls back to a keyless placeholder so you can still
exercise the whole pipeline (CLI, prompt library, batch mode, file layout)
today.

**Never paste real API keys into a chat with an AI assistant.** Put them in
`.env` (gitignored, read only by the adapter that needs it) — that's the
one place they're actually safe.

```bash
cd asset-pipeline
cp .env.example .env      # then fill in only the providers you have accounts for
node cli.mjs --list                                  # providers + every prompt key
node cli.mjs --provider mock --promptKey rook         # works right now, zero keys
node cli.mjs --provider stability --promptKey rook    # real generation, needs STABILITY_API_KEY
node cli.mjs --provider mock --all                    # batch the whole roster
```

## Providers

| Provider | Kind | Confidence |
|---|---|---|
| `mock` | image | Always available — a deterministic placeholder tile, **not** real generative art. Proves the pipeline works before any key exists. |
| `stability` (Stability AI) | image | High — stable, well-documented public REST API. |
| `leonardo` (Leonardo AI) | image | High — stable, well-documented public REST API. |
| `runway` (Runway ML) | video | High confidence in the general shape. Image-to-video, not text-to-video — pass `imageUrl` for a starting frame (e.g. one you just made with Stability/Leonardo). |
| `luma` (Luma Dream Machine) | video | High confidence in the general shape. Text-to-video. |
| `higgsfield` | image + video | **Low.** Primarily a consumer app; its developer API surface is newer and moves fast. The adapter is a best-effort submit/poll/download skeleton — confirm the endpoint at higgsfield.ai before trusting it, and expect to patch a couple of field names. |
| `kling` (Kling AI) | video | **Low.** Kuaishou's official API is region-gated; most people reach it through a reseller (fal.ai, piapi.ai, etc.). You must set `KLING_API_BASE` yourself — there's no safe default to guess at. |
| `pika` (Pika Labs) | video | **Low.** Developer API has historically trailed the consumer product; confirm it's live before relying on it. |

Every adapter fails **loudly** when something doesn't match — a missing key
names the exact env var and where to get one; an unexpected response shape
dumps the raw response so you can see what actually came back and patch the
one or two lines that assume otherwise. Nothing here silently pretends to
succeed.

## Adding a provider

Copy `providers/mock.mjs` or one of the "high confidence" adapters as a
template, implement `generateImage`/`generateVideo`, and register it in
`index.mjs`. The shared plumbing (`.env` loading, key checks, HTTP error
surfacing, submit-then-poll) lives in `providers/_shared.mjs` — reuse it
rather than re-inventing it.

## The prompt library

[`prompts/hollowmark-prompts.mjs`](prompts/hollowmark-prompts.mjs) holds
~27 ready-to-fire prompts sharing one style suffix so a batch run reads as
one coherent art direction: the full cast (Rook, Pip, Marrow, Sable, Wren,
Cleave, Vex, Corvayne, the Pale Warden, the Spark), the Rend roster (grunt,
spitter, the Vat-Thing, the Brood-Mother), six environments, the four
Splitfang cores plus the Skiff, both Hollow/Halo transformation states, and
one title-key-art prompt. Add your own entries the same way — `{ kind,
prompt }` — and they show up automatically in `--list` and `--all`.

## What's generated so far

A first original key-art poster was generated with Canva's design AI
(no key needed — see the session that built this) rather than through this
pipeline, since none of the providers above had a key configured yet. Once
you add one, `node cli.mjs --provider <name> --promptKey titlePoster` makes
a matching piece through whichever service you choose.
