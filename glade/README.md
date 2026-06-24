# 🌱 GLADE

> *A quiet garden, and one small life that grows into whoever you help it become.*

A spiritual successor to the **Chao Garden** of *Sonic Adventure 2: Battle* and the **Tiny
Chao Garden** of the GBA *Sonic Advance* games — but it takes the part that was once a side
mode (the creature you raised, the garden you raised it in) and makes it the **whole game**.
Calm, slow, safe. Nothing here can hurt you. The thing you love will remember you.

This folder is a **separate game** living inside the `aether` repo. It does not touch the
Aether app.

## Play it

It's a single self-contained file — no build, no install, works offline.

```bash
# just open it
open glade/index.html            # macOS
xdg-open glade/index.html        # Linux
# or serve it (any static server)
npx serve glade                  # then visit the printed URL
```

Then **"step into the glade."**

### How to play

- **Warm the seed** — tap your seed-egg a few times; it stirs, then hatches.
- **Pet** — tap your Bloomling. Its mood lifts, the **Mote** above its head brightens, and it
  remembers. The Mote is its whole face: color = its nature (Solar/Lunar/Verdant), shape =
  its mood.
- **Feed essences** — pick one from the basket and tap your Bloomling. Sunfruit and Emberbloom
  pull it toward the **Solar** sun; Moonberry and Dewlight toward the **Lunar** moon;
  Greenleaf and Deeproot keep it **Verdant**. *What* and *when* you feed shapes its stats, its
  alignment, and — visibly — its **body**: it grows petals, horns, wings, fins, a tail. No two
  are alike.
- **Name** and **call** it with the buttons.
- **Tend the garden** — if a purple **blight** appears, tap it to clear it. The garden blooms
  more the more you care for it.
- **The Returning** — when your Bloomling grows old and well-loved, a glowing *"the Returning"*
  button appears. Let it cocoon, and it is reborn — carrying its name, a deeper soul, and a
  faint echo of its old body into the next life. Stay devoted and balanced across lives to
  reach the secret, ageless **Everbloom**.

Everything is **saved to your device**, and it keeps growing while you're away — come back to
a creature that aged and missed you.

## What's here

| File | What it is |
|---|---|
| [`index.html`](./index.html) | The playable v0.1 prototype (one self-contained file) |
| [`DESIGN.md`](./DESIGN.md) | The full Game Design Document + the build spec |

## Status

**v0.1 — playable prototype.** Implemented: the Mote, the care loop (pet/feed/name/call),
procedural essence-driven evolution, the Solar/Lunar/Verdant alignment, a day/night garden
that blooms as you tend it, a gentle blight-tending beat, offline persistence with wall-clock
catch-up, the Returning, the Everbloom, and synthesized ambient audio.

**Next:** *Pocket Glade* (the portable companion layer — the thing the GBA link made magic),
multi-zone navigation, the secrets/Almanac layer, and seasons. See [`DESIGN.md`](./DESIGN.md).

*Original IP — no Sega assets or trademarks are used.*
