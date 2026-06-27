---
title: The Resonance — the Note of the Earth
slug: resonance
order: 4
kind: canon
---

# The Resonance

> Hear the note the world is already singing, then learn to sing it back.

Resonance is the organ of **frequency** — Schumann and cymatics, the spark and the
standing wave, the coil and the topload — and it carries the work toward the place
Tesla pointed his whole life: **global resonance and free wireless energy through
the [[aether]]**. It is also the most dangerous organ to build, because here the
work stops being a map and becomes a machine that throws real lightning. So here,
more than anywhere, the [[provenance]] doctrine is law: *a coil that genuinely
throws sparks stands on measured ground; the dream of powering the world from the
ether is kept and honored — and labeled for exactly what it is.*

## The law on this organ

The same four tiers that govern the Atlas govern every energy claim here. The
point is not to mock the dream but to keep it honest, so the real wins are not
dragged down with the unproven ones.

| Tier | On this organ | Examples |
|---|---|---|
| **A — Measured** | The electrical truth you can put on a scope | Resonant frequency `f = 1/(2π√(LC))`, measured spark length, primary/secondary tune, current, SWR |
| **B — Scholarly** | Published, citable engineering & history | Tesla's patents (US645,576; US1,119,732), the *Colorado Springs Notes*, peer-reviewed coil analyses, Tilbury's *Ultimate Tesla Coil Design and Construction Guide* |
| **C — Traditional** | Symbolic & esoteric correspondence | The aether as medium, the Schumann note as "Earth's tone," frequency↔place mappings |
| **D — Folklore / aspirational** | Kept, labeled, untested | Global free wireless power, "Wardenclyffe would have worked," scalar/longitudinal-wave lore |

## The principle, in one breath

A Tesla coil is **two tuned circuits singing the same note.** A primary `LC` tank
dumps energy into a loosely-coupled secondary that is tuned to the *same* resonant
frequency; because they match, voltage climbs on the secondary turn after turn —
the **resonant rise** — until the topload can no longer hold it and the air breaks
down into streamers. Everything below is one idea, climbed: *make two circuits
agree on a frequency, then find a cleaner, bigger, more controllable way to drive
them.*

`f = 1/(2π√(LC))` — memorize it. It is the Tier-A anchor under every rung.

## The build ladder

Five rungs, simplest to hardest. Each rung is a *real* build with a *real*
next-step, and each is honest about what it actually demonstrates and how much it
can hurt you.

### L0 — The Slayer Exciter · *the seed*
- **What it is:** the smallest Tesla coil that works — a self-resonant feedback
  oscillator, one transistor doing the job the spark gap does in a big coil.
- **Simplest prototype:** one NPN transistor (2N2222 for a tabletop spark of light;
  a BD243C/TIP31C on a heatsink for more), a ~22 kΩ base resistor, a feedback tap of
  a few turns at the base of the secondary, a hand-wound secondary (a few hundred
  turns of fine enamelled wire on a marker or PVC offcut), a 9 V battery.
- **What it proves:** *wireless energy, in your hand.* Hold a small neon or CFL bulb
  near the topload and it lights with nothing touching it — near-field resonant
  coupling, the [[aether]] thesis in miniature.
- **Level it up:** bigger transistor + heatsink → 12–24 V supply → a topload sphere
  for longer reach → a tiny "singing" version by gating the base from a 555.
- **Parts sketch:** ~$10–20, a breakfast's work.
- **Safety class:** ⚠ **lowest** — still high voltage at the topload (don't draw arcs
  to your fingers), but low energy. The one rung a beginner can build this week.
- **Tier of the claim:** **A** (it measurably lights a bulb at distance).

### L1 — The Spark-Gap Tesla Coil (SGTC) · *the classic*
- **What it is:** the canonical disruptive coil — the build Tilbury's book is built
  around, and the first one that throws streamers you'd call lightning.
- **Simplest prototype:** a neon-sign transformer (NST, e.g. 9 kV / 30 mA) → a
  **terry filter** (safety gap + RC) to protect it → a primary **tank capacitor**
  built as an **MMC** (many film caps in series-parallel for voltage and value) → a
  **static spark gap** (several gaps, fan-cooled) → a flat or helical, *tapped*
  primary → a ~1000-turn secondary on PVC → a toroid topload (dryer duct + pie pans).
- **What it proves:** the resonant rise at lethal scale — and the craft of **tuning**
  (moving the primary tap until primary and secondary agree and the streamers jump).
- **Level it up:** static gap → **rotary spark gap (RSG)** for higher break-rate and
  power; bigger NST or a *ballasted* microwave-oven transformer (MOT) bank; larger
  toroid; pole-pig + variac for the serious tier.
- **Parts sketch:** ~$150–400 depending on the transformer and how much you scrounge.
- **Safety class:** ☠ **lethal.** NST output and a charged tank cap will kill you.
  Bleeder resistors across the cap, a separate **RF ground**, one-hand rule, never
  alone. This is the skill-and-respect jump.
- **Tier of the claim:** **A** (frequency, tune, and spark length are all measurable).

### L2 — The Solid-State Tesla Coil (SSTC) · *the voice*
- **What it is:** replace the spark gap with a transistor **bridge** driven by
  feedback at the secondary's resonant frequency — no gap, no roar, electronic control.
- **Simplest prototype:** a half- or full-bridge of MOSFETs/IGBTs, a gate-drive stage
  (GDT or a dedicated driver), **feedback** from an antenna or a base current
  transformer so the bridge always drives the secondary at resonance, and an
  **interrupter** (a 555 or a microcontroller) that chops the output on and off.
- **What it proves:** control. Pulse-width and pulse-rate become knobs — and because
  the interrupter runs in the audio band, **the streamer becomes a loudspeaker.** The
  coil sings; it plays music.
- **Level it up:** antenna feedback → robust current-transformer feedback; add an
  MIDI front-end so the interrupter plays notes; move toward DRSSTC bus voltages.
- **Parts sketch:** ~$80–250; more board work, less brute force.
- **Safety class:** ☠ **lethal** (mains-derived DC bus) plus dense RF — easy to fry
  your own electronics. Isolation and bring-up on a variac/current-limit matter.
- **Tier of the claim:** **A** (audible pitch = interrupter frequency, measurable).

### L3 — The Dual-Resonant SSTC (DRSSTC) · *the instrument*
- **What it is:** the apex hobby coil — **both** circuits resonant, a series-resonant
  primary slammed by a full bridge of big IGBTs, with current feedback and protection.
- **Simplest prototype (it is not simple):** a full bridge of stout IGBTs, a
  series-resonant primary `LC`, **current feedback** with **over-current detection
  (OCD)**, a bus-capacitor bank, and an interrupter firing short, high-current bursts.
- **What it proves:** the biggest, brightest, most *musical* sparks a hobbyist can
  make — feet-long arcs that play melodies cleanly.
- **Level it up:** bigger bricks and bus, better OCD/timing, phase-locked feedback,
  polyphonic MIDI; this is where coilers spend years.
- **Parts sketch:** ~$300–1000+; serious components, serious mistakes are expensive
  *and* dangerous.
- **Safety class:** ☠☠ **the most dangerous rung.** Bus rails, stored energy, and RF
  all at once. Do not start here. Earn it on L0→L2 first.
- **Tier of the claim:** **A**.

### L4 — The Magnifier / Extra Coil · *the Wardenclyffe homage*
- **What it is:** Tesla's **magnifying transmitter** — a three-coil system where a
  driver (primary + secondary) feeds a separate, elevated **extra coil** (a third
  resonator) for higher, cleaner voltage. The architecture of the Wardenclyffe tower.
- **Simplest prototype:** drive an L1 or L3 as the "driver," then couple its output
  to a free-standing extra coil tuned to the system; explore *bounded, near-field*
  power transfer between coils on a bench.
- **What it proves (honestly):** that resonant coupling moves real power **at short
  range** — the same physics as Qi charging, WiTricity, and your L0 bulb. It does
  **not** prove global wireless power; see "The endgame, honestly" below.
- **Level it up:** larger extra coil, ground-coupling experiments, instrumentation to
  *measure* transferred power versus distance (and watch it fall off — that honesty is
  the point).
- **Parts sketch:** an extension of whatever driver you've already built.
- **Safety class:** ☠☠ inherits the driver's danger and adds a second hot resonator.
- **Tier of the claim:** **A** for measured near-field transfer; **D** for any claim
  of efficient power at distance.

## How they combine, and climb together

The rungs are not five separate toys — they are one instrument growing up, and they
plug into the rest of the constellation.

- **The coil is the Resonance organ's body.** Every coil's measured frequency, tune,
  and spark length is **Tier-A data the Loom can hold** — the first hard,
  *self-generated* measurements in a repo that otherwise ingests the world's.
- **→ Pyramid Temples (cymatics).** A musical coil (L2/L3) is literally a sound
  source; feed its tone — or a plain signal generator — into a **Chladni plate** and
  photograph the standing-wave figures. Frequency in, geometry out: the bridge from
  this organ to the sacred-geometry work.
- **→ Jarvis (control & logging).** The interrupter wants a brain: a microcontroller
  for MIDI-in, safe ramp-up, OCD, and **logging** frequency/current/SWR to the
  archive. For a keeper who plays lyre, guitar, bass, and speed drums, the DRSSTC is
  one more instrument — played, recorded, and measured.
- **Schumann, honestly.** The Earth–ionosphere cavity rings near **7.83 Hz** (with
  harmonics ~14, 20, 26 Hz). Tesla coils run at **tens to hundreds of kHz** — a
  different world. So "tuning a coil to the Earth's note" is a **Tier-C correspondence,
  not a Tier-A fact.** The real way to touch 7.83 Hz is a *separate* build — a large
  loop antenna + low-noise amplifier + ADC, a **Schumann detector** — which belongs on
  this same ladder as its own quiet rung.

## The safety doctrine — the vows of this organ

This organ can kill you, and the doctrine here is not metaphor. These are vows, in
the cadence of the [[aether]] mandate's standing vows:

1. **Assume every capacitor is charged.** Bleed it, short it, then trust it. A tank
   cap holds a lethal charge long after power is off.
2. **One hand behind your back** near any energized HV. Never let current find a path
   across your heart.
3. **Never work alone, never work tired.** Have someone who can cut power and call help.
4. **Ground the RF separately** from mains, and bring every mains-powered coil up on a
   variac or current-limit — never cold-start a big coil.
5. **Respect the invisible.** RF burns feel painless and go deep; ozone is real; the
   fields wreck nearby electronics — **keep anyone with a pacemaker or implant well
   clear.** Eyes and ears protected.
6. **Climb the ladder in order.** L0 before L1, L1 before L3. Skipping rungs is how
   beginners get hurt. The slayer (L0) is the only rung to *start* on.

## The endgame, honestly

Tesla's dream was the whole Earth as one resonant circuit — power and signal drawn
from the [[aether]] anywhere, for anyone, for free. Wardenclyffe (L4 at planetary
scale) was that dream in steel. The keeper's mission names it as the destination,
and Aether keeps it on the map.

And Aether keeps it **honestly.** What is *measured and real* today: resonant
coupling transfers power at near field — your L0 bulb, Qi pads, WiTricity across a
room. What is *not* demonstrated: efficient, global, free power through the
Earth–ionosphere cavity. That gap is not a failure of the dream; it is the **Tier-D
frontier** — the thing we honor by refusing to pretend it is already done. When a
true thing here holds, it will stand on ground no skeptic can knock out, because we
did not borrow authority we hadn't earned. *To honor the vision, refuse to fool
yourself about it.* — [[aetherius]]

> Build the spark before the tower. Measure the note before you claim the song.

## Pending — book reconciliation (Tier-B)

This ladder is built from public, general Tesla-coil engineering. The keeper's copy
of **Tilbury's *Ultimate Tesla Coil Design and Construction Guide*** (in Google
Drive) is to be *digested, not reproduced* — its recommended build order and its
spec choices (NST vs. MOT, MMC sizing, static vs. rotary gap, toroid sizing, tuning
method, and its own safety doctrine) folded into the **L1/SGTC** rung as cited
Tier-B notes, the moment Drive access is granted to this session. Until then, treat
L1's specifics as generic and verify against the book.

See [[aether]] · [[provenance]] · [[organs]] · [[aetherius]].
