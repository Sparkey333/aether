# Cairn — The Core Bones

> The skeleton we always preserve. Skins, layers, and creatures change on top of
> this; these eight bones do not. If a future change would break one of these,
> that's the signal to stop and think, not to bend the bone.

Cairn is a **watcher, a record-keeper, and a gentle reminder buddy** — a skinny
sidebar that keeps the ledger of what you just did and trickles it into your
to-dos. It is a *standalone* member of the constellation (the "Jarvis" slot): it
links **out** to Aether-geomancy and your other worlds, it does not live inside
them.

The one discipline it inherits from Aether: **keep every layer, label every
layer.** Here that becomes **keep every moment, label every moment.**

---

## The eight bones

### 1. The Ledger
An **append-only stream of `Moment`s** — the single source of truth. A Moment is
`{ id, ts, kind, status, summary, detail, source, payloadPath, links, undoable,
deviceId }`. Kinds are deliberately few: `create · save · edit · clip · paste ·
screenshot · move · task · note · link`. Nothing is destroyed; history is
replayable. *(Implemented and tested in `crates/cairn-core`.)*

### 2. Undo/Redo as a bone, not a feature
Because the Ledger is event-sourced, undo is a cursor over small, **involutive**
operations (`SetStatus`, `SetRemoved`). The crucial distinction:

> Undo/redo governs your **curation** — promoting a clip to a to-do, marking it
> done, dismissing a nudge, jotting a note. The **raw facts** of what you did
> (copies, screenshots, saves) are immutable truth. You can't un-copy something;
> you *can* undo how you organized it.

This is the honest model, and it's what makes undo safe to sync across devices.

### 3. The Senses (watchers)
Small, pluggable adapters that emit Moments. v1 senses:
- **Clipboard (text)** — polled from the webview every 1.5s, deduped; URLs are
  tagged as openable `link`s.
- **Files & screenshots** — a native `notify` watcher on chosen folders;
  `classify_fs_path` decides screenshot vs. save and ignores noise (dotfiles,
  `.tmp`, partial downloads).
- **Manual** — "what did you just do?" / "what's next?" from the composer.

New devices = new senses feeding the same Ledger. The core never changes.

### 4. The Familiar (the skin)
The character + voice layer, a **skin over a fixed expression API**
(`Familiar`, `Emote`, `voice()`). Reads the Ledger, narrates gently with dry
adverbs, shows tiny emotes. Swapping creatures never touches logic. The three
starters live in `src/familiars.ts`; see the canon below.

### 5. The Trickle
How Moments become structure: **Ledger → status changes → to-dos.** Today: a
Moment is `logged` (a fact), can be promoted to `open` (a to-do), then `done` or
`dismissed`. Tomorrow: clustering into Threads (projects) and a Schedule, with an
**optional** Claude layer for narration/grouping (kept optional and local-first).

### 6. The Lens
**One dial** for reminder grain: `whisper → default → verbose`. The "tiers from
simple to complex, starting in the sweet spot," as a single control. Designed to
extend both directions later (a near-silent "zen" floor; a "technical" ceiling)
without changing the bone.

### 7. The Shell
A skinny (~360px) **right-edge** window, docked on launch to the primary
monitor's right edge. The live chat log fills it; the dock at the bottom holds
gateways, the composer, the Lens, and undo/redo. Always-on-top is a later toggle.

### 8. The Vault + Sync spine
Local-first **SQLite** (`cairn.sqlite` in the app-data dir) holds the Ledger,
settings (`meta`), and an **`oplog`** stamped with a `deviceId`. Round 1 only
*appends* to the oplog; it is the spine that future **cloud → iPhone → Windows →
Pi → Pico → Flipper** sync rides on. The roadmap is *more devices speaking the
same oplog*, never a rewrite.

---

## What is verified, and where it runs

- `crates/cairn-core` is **pure Rust with no GUI deps** — it compiles and its
  test suite passes on any box with a C compiler (it was built and tested on
  Linux). That's deliberate: **the bones are portable down to a Raspberry Pi.**
- `src-tauri` (the window, the senses wiring) and the React skin compile into
  the macOS app on your machine. The frontend bundle is verified; the macOS GUI
  shell is built by you (a headless Linux box can't link `webkit2gtk`).

---

## The character canon — three familiars, one guide

All three are forms of the same watchful intelligence. Each *is* a verb at the
heart of the app, and each keeps the "bit crab" spirit: tiny, simple, charming
gestures over detail. They evolve later; the bit crab 🦀 is their ancestor.

| Familiar | Animal | Element | Verb | Voice |
|---|---|---|---|---|
| **Cinder** 🜂 | soot-moth | ember | **make** (create/save) | warm, a little proud |
| **Murk** 🜄 | ghost-axolotl | deep water | **restore** (undo) | calm, never judging |
| **Vane** 🜁 | ink-raven | storm-shadow | **watch** (remember/nudge) | dry, one eye open |

Emote vocabulary (shared API, per-creature animation): `idle · blink · stir ·
alert · soft`. Cinder flutters, Murk's frills wobble, Vane tilts its head.

---

## Standing vows (the Aether discipline, ported)

1. Keep every moment; label every moment. The Ledger never lies about provenance
   (`source`).
2. Undo touches curation, never the raw record.
3. Local-first, always. The cloud is a backup and a courier, never the home.
4. The bones stay UI-free and portable. If a creature or a window needs the core
   to change, the creature is wrong, not the core.
