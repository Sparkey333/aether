# The Bunny

> Follow the rabbit. Through the looking-glass, the mirror, the stories, the
> water. Look *through* and *within*, and see. Perspectives, angles, views —
> nigh parallel. A guiding light, a chord of destiny — **but always with choice.**

The Bunny is a **guiding-light companion for stories you play** — beginning with
old SNES/GBA games (Pokémon Emerald first, then the original *Legend of Zelda*).
An easy on/off toggle drops a Guide into the game that shows where the main story
goes next and what side-paths are open now (or one or two steps away), at
escalating levels of help — up to the Guide *playing the Path for you* so the
session feels like watching the anime of the game.

It is, by design, a sibling of **Aether** in the same constellation: same bones
(Tauri + Next/React + local SQLite), same habit of *carrying a strong doctrine in
the data itself*. Where Aether tags every layer by **provenance**, the Bunny tags
every shared file by **rights** — and never lets guidance touch your score.

---

## The one-line doctrine

**Guidance never gates reward. Choice is never removed.**

You can run the whole game in **Dark** mode — no guide at all — and still earn
the maximum. The Guide is a light to follow, never a toll to pay. (This is also
what keeps it honest: the help is optional, so the achievement stays yours.)

---

## The Guide — five levels of light

| Level | The Guide gives | Feel |
|------:|-----------------|------|
| **Dark** | nothing | pure play; full points still possible |
| **Glimmer** | the next main-story beat | a nudge |
| **Path** | the chapter ahead + a side-path available now/soon | a map |
| **Chord** | foresight & multiple perspectives — "look through and within" | a mentor |
| **Hand** | the Guide walks the avatar, runs timed/recorded input patterns | "watch the anime" / stream / play-along |

The orb is the seed; the Guide is the orb extended into a chord of destiny that
threads the whole story — but every level has an off switch and every fork is
still yours to take. **The first build (the `emulator/` overlay) already reaches
the Hand level for Emerald.**

---

## The reward economy (the Loyalty ledger)

A point system that travels with you across retro games and modes:

- Points for **story progress**, for trying **different modes**, for
  **completion**, and a small trickle even for **repetition** (mastery is real).
- A **real-world ledger** alongside the game one: small-business expenses for
  write-offs/taxes, bulk orders of marketing materials and merch, loyalty earned
  the honest way — **genuine good deals, no deception anywhere.**
- Loyalty is *earned*, not extracted. The point of points is to make the good
  path the rewarding one.

---

## The Familiar (your Sprite)

A per-user companion — Sprite / Familiar / "Digimon-style" — that **learns from
your own play**, on **clearly consented, secured data used only for you**. It
grows a personal memory and, at peak, turns guide *into* co-author:

- It helps you build **original spin-offs** of the games it has walked with you —
  **incremental micro-IP transformation**: replace borrowed elements with your
  own, step by step, until the work is genuinely, *legally* your own creation.
- That process is also a **research thread**: across iterations of lines,
  processes, and seeded randomness — at what point does derivative become *true*
  creation? Where is the line between recombination and the **Flame of
  creation**? "Is there anything new under the sun?" — a paper worth writing.

---

## The Rights doctrine (and the one honest line)

The Bunny will let creators **sell and safely share files** — recorded on a
backend dashboard, shared only with **explicit, logged permission**, each file
carrying a **TransparentZ** layer (an embedded transparency/provenance/attribution
overlay, so ownership travels *with* the file and nothing is hidden).

For that to be a real business and not a liability, sharing is **rights-gated** —
every file carries a tier, the same way Aether tags provenance:

| Rights tier | Shareable? |
|---|---|
| **Owned-original** (your own games, art, books, spin-offs) | ✅ yes |
| **Public-domain** | ✅ yes |
| **Licensed** (you hold a license that permits it) | ✅ within the license |
| **Rights-unknown / third-party commercial** | ⛔ blocked from sharing |

**The honest line:** an overlay that guides *your own* copy of Emerald is fine.
A pipeline that *distributes* other people's commercial ROMs or books is not — no
permission you click grants you the right to redistribute Nintendo's game, and a
real storefront can't stand on that. So the marketplace sells what you actually
own — your originals, the micro-IP spin-offs the Familiar helps you make,
public-domain works, and properly licensed content. That keeps the whole dream,
and keeps it standing on firm ground. (Same spirit as Aether: *confidence —
here, the right to share — is earned, never assumed.*)

---

## Stack (shared muscle memory with Aether)

- **Emulator bridge** — Lua over BizHawk/mGBA: reads game state, paints the
  Guide, injects inputs. *(Built — `emulator/bunny_emerald.lua`.)*
- **Route graph** — per-game data: main-story spine + side-quest nodes +
  prerequisites ("one or two steps away"). Learned by walking, then shipped.
- **Desktop app** — Tauri + Next/React, local SQLite for the Loyalty ledger and
  the Familiar's memory. Local-first, like Aether.
- **The Familiar** — the learning/narration layer (Claude via `@anthropic-ai/sdk`,
  mirroring Aether's Loom).

---

## The road

1. **Guiding Light on Emerald** — overlay shows the next step; *Hand* mode walks
   the Path. **(v1 here — test it now.)**
2. **Calibrated route** — ship a pre-walked Emerald route; warp-aware navigation.
3. **Second game** — the original *Legend of Zelda* (same pattern, new spine).
4. **The Loyalty ledger** — points across games + the real-world business ledger.
5. **The Familiar** — per-user memory; the "anime"/stream/play-along recorder.
6. **Micro-IP studio + rights-gated marketplace** — make originals, sell what you
   own, every file wearing its TransparentZ layer.
7. **The paper** — iteration, randomness, and the Flame of creation.

## Standing vows

1. Guidance never gates reward; every level has an off switch.
2. Never modify or redistribute a ROM/book you don't own the rights to.
3. The Familiar learns only from consented, secured, user-owned data — for the user.
4. Every shared file carries its rights tier and its TransparentZ provenance.
