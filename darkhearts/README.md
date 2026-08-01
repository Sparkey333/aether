# DarkHearts — game library

The studio's catalog of playable builds, and a self-contained "cabinet" shelf
UI that lists and launches them. Built to be viewed directly, published as a
share-able page, **or** loaded onto a screen surface inside one of our VR
rooms (Amber Den, or any similar room build) — the cabinet has no
dependencies, makes no network calls after it loads, and works as a plain
`<iframe src="...">` target.

## What's here

| Path | What it is |
|---|---|
| `library.json` | The catalog — one entry per game, hand-maintained |
| `scripts/build-cabinet.mjs` | Reads the catalog, inlines poster art, emits the single-file shelf |
| `scripts/gen-jak-poster.mjs` | Zero-dep PNG generator for the jak-project bay art |
| `posters/` | Generated bay art for titles that live outside this repo |
| `dist/cabinet.html` | Build output (gitignored) — the file you actually deploy |

## Adding a game

1. Build the game to **one self-contained HTML file** with no external
   fetches — see [`../hollowmark-web/scripts/build-artifact.mjs`](../hollowmark-web/scripts/build-artifact.mjs)
   for the reference pattern (inline the engine, de-module the source, ship
   one file that opens with no server).
2. Add an entry to `library.json`: `id`, `title`, `tagline`, `blurb`,
   `status`, `poster` (path to a square PNG/SVG), `accent` (hex, used as the
   cartridge card's top rule), `build.script` / `build.output` (repo-relative),
   `demoUrl` (a published, reachable URL for the built file), `aspect`,
   `controls`, `controlsNote`, and `vrNote` — be honest in `vrNote` about
   what does and doesn't work with laser-pointer/gaze input.
3. Rebuild the cabinet: `npm run darkhearts:cabinet` from the repo root.

### Native titles

Titles that are desktop binaries rather than web pages (e.g. the studio's
[OpenGOAL jak-project fork](https://github.com/Sparkey333/jak-project)) get
`"type": "native"` plus `repoUrl`, `upstreamUrl`, and `buildNote` instead of
`demoUrl`/`build`/`controlsNote`. The cabinet renders repo links for them
instead of an inline launch — a browser can't run them, and the card
shouldn't pretend otherwise. The engine fork is cloned and built as a
**sibling checkout** (`../jak-project`), never merged into this repo:
OpenGOAL's code is open source, but in-game assets must be extracted from a
player's own legally-owned copy of the game, and none are stored here.
HOLLOWMARK remains the studio's original IP and evolves in parallel —
nothing from the fork's world crosses into it.

## Building

```bash
node darkhearts/scripts/build-cabinet.mjs            # launch → each game's demoUrl (portable, default)
node darkhearts/scripts/build-cabinet.mjs --local     # launch → local build output (relative paths)
```

Use `--local` when the cabinet will be served from this repo alongside the
game builds (e.g. a static host that also exposes `hollowmark-web/dist-artifact/`).
Use the default when the cabinet itself is going to be copied somewhere else
standalone — it always has a working launch target because `demoUrl` is a
real, already-hosted URL.

## Embedding in a VR room

Two patterns, pick per screen:

- **One screen, one game** — point the room surface's browser-texture
  straight at a game's URL (`demoUrl`, or the local build output). No
  cabinet involved. This is the right call for an arcade cabinet prop that's
  only ever going to run one title.
- **One screen, the whole shelf** — point a lobby/menu surface at
  `dist/cabinet.html`. Players browse cartridge cards and hit **Launch
  inline** to load a game into the same surface (or **Open ↗** to pop it out
  to a new tab/window, which is also the safe fallback anywhere iframing a
  cross-origin page is blocked, e.g. inside a published Claude Artifact).
- **Native titles on a screen** — run the binary on the host machine and
  mirror it onto a room surface with a desktop-capture/stream panel. A
  browser texture can't run a desktop app; don't wire one to a native bay.

**Input caveat, stated plainly:** games on this shelf that use pointer-lock
mouse-look (HOLLOWMARK does) need real relative-mouse-movement input to
drive the camera. A VR room's laser pointer or gaze cursor can click
everything in the cabinet UI and the game's own HUD buttons, but it will
not move the in-game camera unless the room bridges its controller input to
synthetic `mousemove` events, or the player has a physical mouse available
inside the room (e.g. a desktop-streaming panel). Don't promise "works in
VR" for a title without checking this first — put the real answer in that
game's `vrNote`.

## Why this isn't Next.js

Everything under `darkhearts/` and `hollowmark-web/` is deliberately outside
the main Aether Next.js app (`src/`) and has zero runtime dependencies once
built — a VR room integration should never need to stand up a Next.js
server just to show a game on a wall. Plain Node build scripts in, one HTML
file out.
