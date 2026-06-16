# Cairn

> A cairn is a stack of trail-stones — it marks where you've walked and points
> the way on. This one keeps the ledger of what you just did, gently, and
> trickles it into what's next.

Cairn is a small **watcher / record-keeper / reminder buddy**: a skinny sidebar
that pins to the right edge of your screen, logs your copies, screenshots,
file-saves, and notes, and lets you curate them into to-dos — with **built-in
undo/redo** and a **familiar** (Cinder, Murk, or Vane) narrating along the way.
It's local-first, and it links **out** to your other worlds (Aether-geomancy,
folders, projects).

`> Cairn` is a working name — rename it freely (it's one find-replace away).

## Anatomy

```
cairn/
├── crates/cairn-core/   the bones — Ledger, Vault (SQLite), undo/redo, sense
│                        classification. Pure Rust, fully unit-tested, portable.
├── src-tauri/           the shell — the window, the file/clipboard senses, the
│                        handful of commands. Tauri 2; builds the .app + .dmg.
├── src/                 the skin — Vite + React sidebar: starter-select, the
│                        live chat log, the Lens dial, gateways.
└── docs/CORE_BONES.md   the invariant design + the character canon.
```

See **[`docs/CORE_BONES.md`](docs/CORE_BONES.md)** for the design that never changes.

## Prerequisites (on your Mac)

- **Xcode Command Line Tools** — `xcode-select --install`
- **Rust** — `curl https://sh.rustup.rs -sSf | sh`
- **Node 18+** — `node -v`

## Run it

```bash
cd cairn
npm install

# the bones, verified for real (no GUI needed):
npm run core:test

# the live app — first launch shows the starter-select:
npm run tauri:dev

# the deliverable — produces the DMG:
npm run tauri:build
# → src-tauri/target/release/bundle/dmg/Cairn_0.1.0_<arch>.dmg
```

`npm run dev` alone (no Tauri) opens a **browser preview** of the skin with mock
data — handy for fiddling with the look; the real senses only run inside the app.

## Honest status

- ✅ **Core verified** — `cairn-core`'s 8 tests pass (built/tested on Linux). The
  Ledger, undo/redo round-trips, and the sense-classifier are real.
- ✅ **Frontend verified** — strict TypeScript + Vite bundle succeed.
- ⚠️ **macOS shell unbuilt here** — a headless Linux box can't link
  `webkit2gtk`, so the `.app`/`.dmg` is compiled on **your** machine. You're the
  first to open it. If the first `tauri:build` snags, it'll almost certainly be a
  toolchain/permission detail — send me the error and I'll chase it.

## First-launch notes

- The window docks to the **right edge**; default watched folder is `~/Desktop`
  (where macOS drops screenshots). Add folders later via settings (next round).
- macOS may prompt for permission the first time Cairn reads the clipboard or
  watches a folder — that's expected for a watcher.
- Your data lives at `~/Library/Application Support/com.darkhearts.cairn/cairn.sqlite`.

## Lifting Cairn into its own repo (when ready)

It's built self-contained so it extracts cleanly:

```bash
# from the aether repo root, preserving history for the cairn/ subtree:
git subtree split --prefix=cairn -b cairn-only
# then push that branch to a fresh repo, or simply:
cp -r cairn /path/to/new/cairn-repo && cd /path/to/new/cairn-repo && git init
```
