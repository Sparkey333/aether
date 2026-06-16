# Serious Civil

> A beam does not care about your feelings. The load is the load.
> Tell the truth about the number first — and about each other right after.

**Serious Civil** is a civil-engineering bench for the engineer who is also the
metalhead, the anime kid, the one whose brain runs hot, literal, and deep. It
does first-order statics *honestly*, refuses to fake what it can't earn, and
turns rigor — not volume, not swagger — into a power level you can watch climb.

This is **Engi-Nerd Mode**: super-saiyan discipline bolted to a load path.

## Quickstart — zero install, runs off disk

```bash
open serious-civil/index.html      # macOS — just double-click it
# or: xdg-open serious-civil/index.html   (Linux)
```

No `npm install`, no build step, no server, no network. Open the file and the
bench is alive — pre-loaded with a worked steel beam that earns an honest
**OVER 9000**. Change a number and watch Gus and Marcus react in real time.

## What it does

- **Honest statics.** Reactions, max shear, max moment, max deflection, peak
  bending stress — Euler–Bernoulli, SI under the hood, every formula sourced in
  [`docs/FORMULAS.md`](docs/FORMULAS.md). Verified to the digit (a 4000 lbf load
  at 20 ft on a 4×10 gives exactly 20,000 lbf·ft and 3,600 psi).
- **Four load cases × five materials.** Simply-supported and cantilever, point
  and uniform loads. Steel, aluminum, titanium (metal as hell), wood — and
  reinforced concrete, which it *deliberately refuses* to fake.
- **Two honest checks.** Strength (utilization vs allowable) and serviceability
  (the L/240 deflection sniff test). Strength isn't stiffness.
- **The verdict, in two voices.** Gus tells you the truth that keeps the bridge
  up. Marcus tells you the truth that keeps *you* up.
- **The power level.** Rises only for things that are actually true — it stands
  up, it's efficient, it doesn't bounce. Overstress *tanks* it. The single tier
  above OVER 9000 is **TRUTH OVER GLORY**, earned by refusing to bluff a number.

## The refusal (the most important feature)

Ask it for reinforced-concrete bending stress and it will **not** hand you a
number. RC cracks in tension by design — `σ = M/S` treats it as a solid elastic
block, which is a confident lie. An honest answer needs ACI 318. So the engine
withholds the number and says exactly why. *That refusal is the feature.*

## Map of the folder

| Path | What lives there |
|---|---|
| `index.html` | The bench. Open it. |
| `assets/engine.js` | The honest core — statics, the verdict, the power level. No build. |
| `assets/app.js` | The cockpit — wiring, units, and the voices of Gus & Marcus. |
| `assets/styles.css` | Forged-metal + anime-surge aesthetic. Offline-first, system fonts. |
| `canon/` | Soul-files: the mandate, the two mentors, Engi-Nerd Mode. |
| `docs/FORMULAS.md` | The formula ledger — every number traced to a source. |

## The people inside

- **Gus "Rebar" Holloway, PE** — the grumpy mentor. 41 years, two in court. Yells
  at the number, never at you. His "…Fine." is the highest praise in the trade.
  See [`canon/gus-rebar-holloway.md`](canon/gus-rebar-holloway.md).
- **Marcus Vance** — the older brother. Office engineer, loves the N64 with his
  whole chest, loves too hard and got burned for it, refuses to turn to stone.
  See [`canon/marcus-vance.md`](canon/marcus-vance.md).

## Honesty about how this was built

Built in a cloud sandbox that could only see *this* repository — **not** a Mac,
its chats, or its logs (that access wasn't reachable from here, and saying so is
just the doctrine working). So the "spark from previous apps" was drawn from the
DNA already living in this constellation — Aether's soul-files, its provenance
discipline, its guide-character pattern, its no-install ethos — and aimed at a
new organ. If you want it wired into more (real steel-shape libraries, an
ACI-318 concrete module so the refusal becomes a real answer, a Tauri shell to
ship it like the Atlas), that's the next pour.

---

Forged in **white light, in truth and love**. Dark as burned. Not beaten. Far
from stone. Keep your units straight and your conscience straighter.
