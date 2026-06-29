---
title: "L0 — The Slayer Exciter (the seed)"
slug: L0-slayer-exciter
rung: L0
organ: resonance
order: 0
kind: build-guide
safety_class: "⚠ lowest (low stored energy) — but REAL high-voltage RF at the topload, and a genuine ☠ for anyone with a medical implant"
provenance: A
---

# L0 — The Slayer Exciter · *the seed*

> *The smallest Tesla coil that works. One transistor doing the spark gap's job. Light a bulb out of the empty air, and you have held the whole thesis in your hand.*

> ☠/⚠ **DANGER BANNER — read before you touch a tool.**
> This is the **lowest** safety class on the ladder — **low stored energy, no mains, no charged tank capacitor waiting to stop your heart.** That is the truth, and it is why this is the one rung a beginner starts on.
> **It is not "safe."** The DECKED-OUT version runs off a 12–24 V supply, and its transistor will reach **burn-you temperatures in seconds** with no spark to show for it (⚠ thermal). The topload sits at **tens of thousands of volts of RF** — draw an arc to a bare finger and you get a **deep, painless RF burn** that you won't feel until later (⚠ RF burn). The invisible field is **brutal to electronics and to medical implants** — a slayer exciter can disrupt a **pacemaker, ICD, insulin pump, or cochlear implant** from across a small room (☠ for the wrong person).
> **Anyone with an implant stays out of the room — this is the one genuinely lethal risk on this rung. Phones, hearing aids, laptops, and your good multimeter stay several feet back, powered off.**
> **One-hand rule from the very first power-up:** when a coil is energized, keep one hand behind your back. Never let your body become the path from the topload to ground. Learn it here where it costs a transistor, so it's automatic on L1 where it saves your life.
> Worst realistic outcomes on this rung: a **finger/lip RF burn**, a **fried transistor or phone**, a **scorched fingertip on a hot device**, a **vented/hot battery on a dead-short fault**, and — for an implant wearer — a **medical emergency**. Build it respectfully and none of that happens.

---

## What this rung is / what it proves

A slayer exciter is a **self-resonant feedback oscillator** — the simplest circuit that behaves like a Tesla coil. There is no spark gap and no tuning capacitor: a single transistor switches the bottom of a tall, fine-wound **secondary** coil on and off, and a tiny **feedback coil** at the base tells the transistor *exactly when* to switch by sensing the secondary's own ringing. The transistor ends up driving the secondary at **its own resonant frequency**, automatically — the resonant rise climbs, and the topload lights the air.

**What it proves:** *wireless energy, in your hand.* Hold a small neon bulb or a CFL tube near the top of the coil with **nothing touching it** and it glows — near-field resonant coupling, the [[aether]] thesis in miniature, and a result you can **measure** (it lights or it doesn't; you can read the frequency on a scope).

**Provenance tier of the claim: A — Measured.** The coil's resonant frequency `f = 1/(2π√(LC))` is real and scope-readable, and "a bulb lit across a gap" is an observable, repeatable fact. (The dream of *global* free wireless power that this gestures at remains **Tier D** — kept, honored, untested. See [[resonance]] and "Climb from here.")

> **Reminder to the forgetful human:** this rung is where you build *habits*, not just a coil. The one-hand rule, the "assume it's energized" reflex, the never-alone vow — practice them here, where a mistake costs a transistor, so they're automatic on L1 where a mistake costs your life.

---

## TWO PARALLEL TRACKS

Build the BASE first — it's a breakfast's work and it will light a neon bulb. Then graduate to DECKED-OUT, which adds power, reach, protection, an indicator, and a "singing" mode. They share the same coil-winding craft, so the BASE coil can often be reused.

| | 🔰 BASE | ⚡ DECKED-OUT |
|---|---|---|
| Switch | one NPN transistor (2N2222) | power transistor or N-MOSFET on a heatsink |
| Supply | 9 V battery | 12–24 V bench supply, fused |
| Topload | bare wire tip | smooth sphere / small toroid |
| Extras | none | fuse, power LED, 555 "singing" interrupter option |
| Spark/reach | tiny corona, lights a neon at ~1–3 cm | visible streamers, lights a CFL across a wider gap |
| Cost | ~$8–15 | ~$20–40 |
| Build time | one sitting | an afternoon |

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

> **Tier-B note:** this BASE track is the **generic, canonical** single-transistor slayer that any intro coil resource would cover. It is written from public Tesla-coil engineering knowledge. **Generic — reconcile with Tilbury (Tier B)** once that source is readable; the book's exact recommended first-project values may differ and should supersede these once cited.

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| NPN transistor | 2N2222 (TO-92) or 2N3904 | 1 | $0.30 | The classic. 2N2222 takes more abuse. Heats up — see ⚠ below. |
| Base-bias resistor | 22 kΩ, ¼ W (or 10–47 kΩ) | 1 | $0.10 | From **+** to the **base** — this is the **startup bias** that kicks the oscillator alive. Start at 22 kΩ. |
| Base clamp diode | 1N4148 (optional but advised) | 1 | $0.10 | Protects base on the negative feedback swing. |
| Magnet wire (secondary) | 30–34 AWG enamelled copper | ~50 m | $4 | Finer = more turns = **higher inductance = lower resonant freq**. 30 AWG is forgiving for a first wind. |
| Hookup wire (primary/feedback) | 22 AWG insulated | ~1 m | $0.50 | For the 2–4 turn feedback/primary coil. |
| Coil form (secondary) | PVC or cardboard tube, ~20–32 mm OD, ~10–15 cm long | 1 | $1 | A fat marker, a pill bottle, or PVC offcut. |
| Battery | 9 V alkaline (or 9 V "wall wart") | 1 | $2 | A fresh battery throws a brighter glow. ⚠ **Do NOT substitute a high-current Li pack** on the breadboard BASE — a fault could dump tens of amps. |
| Battery clip / switch | 9 V snap + slide switch | 1 | $1 | A switch you can flip fast matters (⚠). |
| Breadboard or perfboard | half-size | 1 | $3 | Breadboard is fine at this power. |
| Neon test lamp | NE-2 neon bulb or small CFL | 1 | $1 | **The payoff** — lights wirelessly near the top. |

#### Tools — BASE

- Soldering iron + solder (only if you go perfboard; breadboard needs none).
- Wire strippers / side cutters.
- ⚠ Fine sandpaper or a scraper to strip enamel off magnet-wire ends. (A lighter works but means open flame + enamel fumes near skin — prefer sandpaper.)
- **Multimeter** (continuity + DC volts). Keep it **2+ feet back** when the coil is live (⚠ RF can confuse and even damage cheap meters).
- A non-conductive winding jig helps — even a pencil through the tube ends.

#### Build steps — BASE

1. **Wind the secondary (the tall coil).** Leave a 15 cm tail, then wind 30–34 AWG magnet wire **tightly, in a single neat layer, all turns the same direction**, covering most of the tube — aim for **300–800 turns**. No overlaps, no gaps. Leave another 15 cm tail at the top. Anchor both ends with a dab of tape or glue.
   - **Reminder to the forgetful human:** *count your direction, not your turns.* The single thing that makes a slayer refuse to oscillate is a feedback coil wound the **wrong way** relative to the secondary — and the fix is just "flip the two feedback wires." Don't agonize over an exact turn count.
2. **Strip and tin the secondary ends.** Magnet wire has clear enamel insulation that *looks* like bare copper but isn't. **Scrape ~1 cm of enamel off each end** until bright copper shows, then tin with solder. A multimeter continuity beep end-to-end confirms the whole winding is one unbroken wire.
3. **Wind the feedback/primary coil.** Around the **bottom** of the secondary (over it or just below it), wind **2–4 turns** of 22 AWG insulated hookup wire. This is the primary *and* the feedback pickup in one. Leave two leads.
4. **Wire the oscillator** (the heart of the slayer — collector / emitter / base):
   - **Emitter** → battery **negative (−)**.
   - **Collector** → **bottom end of the secondary**. The **top end of the secondary** is your topload — it goes nowhere yet (just a bare tip).
   - **Base-bias (startup) resistor:** **22 kΩ from battery positive (+) → base.** This trickle of current through the resistor is what *starts* the oscillator (it nudges the transistor on so the secondary can begin to ring).
   - **Feedback drive:** one lead of the **feedback coil** → **base** (joining the resistor at the base node). The **other lead of the feedback coil** → battery **positive (+)**. The feedback coil now provides the AC drive that keeps the transistor switching at the secondary's resonant frequency.
   - Optional **1N4148** from base to emitter (stripe/cathode toward the **+ side**, i.e. so it clamps the negative base swing) protects the base.
   - *(If it won't start, the usual cure is to swap the two feedback-coil leads — see tuning. The resistor stays from + to base.)*
5. **Double-check the loop is not a dead short — BEFORE the battery goes on.** **Ohm the collector-to-emitter path** with the meter — you should *not* read a near-zero short. A direct short across the battery through the transistor means a miswire.
   - ⚠ **A miswired slayer dumps the battery straight through the transistor — the transistor gets hot enough to burn skin in seconds, may pop, and can heat/vent the battery.** Verify before you power up. **Keep the battery disconnected until this check passes.**
6. **Power up — finger on the off switch, one hand behind your back.** Connect the 9 V. The transistor may start oscillating instantly (you'll often hear a faint hiss/whine and see a tiny corona at the tip in a dark room).
   - ☠ **Implant check first:** no pacemaker / ICD / insulin pump / cochlear-implant wearer anywhere in the room before you energize. The field appears the instant power is on.
   - ⚠ **Touch the transistor every few seconds.** *Warm = fine. Too-hot-to-hold = kill power NOW.* A non-oscillating slayer turns all the battery's energy into transistor heat. **It will burn your fingertip, can heat the battery, and will destroy itself if you leave it.**
   - **Reminder to the forgetful human:** never walk away from a powered board — not even the BASE, not even "for a second." A coil that didn't start is a heater on your bench.

#### First-light / tuning / test — BASE

1. **Dark room, one hand behind your back.** Turn off the lights. Bring an **NE-2 neon bulb** slowly toward the **top tip** of the secondary. Within a few centimetres it should **flicker, then glow steadily** with nothing touching it. *That is wireless power. That is the whole rung.*
   - ⚠ **Don't put your eye right at the tip** — even this tiny corona is bright in the dark and makes a little UV up close. And don't touch the bare top tip while it's lit (⚠ RF burn, even on the BASE).
2. **If nothing happens (the #1 beginner result):** the feedback is backwards. **Swap the two feedback-coil leads** (the one on the base side and the one on the + side). Re-test. This single swap fixes the large majority of dead slayers.
3. **Still nothing:** check (a) magnet-wire ends are actually *stripped* to copper (the #2 cause), (b) battery is fresh, (c) transistor isn't already cooked from a long no-oscillation run, (d) try lowering the base-bias resistor toward 10 kΩ for more startup drive.
4. **Tuning to resonance — the honest part.** A slayer **finds its own resonance automatically** through feedback; you don't tune an LC. But you *can* see it: bring a small wire antenna near the top and probe with an **oscilloscope** (ground clip on battery −, probe on the **antenna**).
   - ⚠☠ **NEVER put the scope probe on the topload or the bare top tip.** The scope chassis is referenced to mains earth through its power cord; touching the probe to tens of kV of RF doesn't just kill the scope — it can drive RF/fault current down the scope's earth and turn the bench into a shock path. Probe only a *separate, nearby antenna wire*, never the coil itself.
   - You'll see a clean sine on the antenna; read its frequency. Typical first slayers ring around **0.5–3 MHz**. That number is your **Tier-A measurement** for this build — **write it down.**
   - **Reminder to the forgetful human:** the frequency *is* the data. A coil with no recorded frequency is a toy; a coil with a logged `f`, supply voltage, and "lit an NE-2 at 2.5 cm" is the first hard, self-generated datum on this whole ladder (see "Climb from here").

> **What you've proven (BASE):** that a single transistor and a hand-wound coil produce a resonant rise large enough to light a gas-discharge bulb through the air at short range, at a measurable frequency. **Tier A — Measured.**

---

### ⚡ DECKED-OUT — the design we level it up to

Same idea, more honesty and more reach: a real **power switch** that can take the heat, a **stiffer 12–24 V supply**, a **fuse** so a fault doesn't become a fire, a **power-on LED** so you never walk away from a live coil thinking it's off, a **smooth topload** that lets the field reach farther without spitting destructive arcs back into the transistor, and an optional **555 "interrupter"** that chops the oscillator at an audible rate so the coil **sings**.

#### BOM — DECKED-OUT

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Power switch | N-MOSFET IRFZ44N **or** BJT BD243C / TIP31C | 1 | $1 | MOSFET runs cooler and is the recommended upgrade. ⚠ The IRFZ44N is **not** a true logic-level part (Vgs(th) ~2–4 V, wants ~10 V for full turn-on) — it works fine here only because the feedback swing is large. A true logic-level MOSFET is fine too but not required. |
| Heatsink | TO-220 clip-on, with thermal pad | 1 | $1 | **Non-negotiable** — see ⚠ thermal. |
| Gate/base resistor | MOSFET: 100–470 Ω gate; BJT: 1–10 kΩ base | 1 | $0.10 | |
| Gate pulldown (MOSFET) | 10 kΩ gate-to-source | 1 | $0.10 | Keeps gate off when undriven. |
| Gate clamp (MOSFET) | back-to-back ~**12 V** zeners gate-to-source (or a TVS), **not** 18 V | 1–2 | $0.20 | ⚠ Vgs(max) is typically ±20 V; an 18 V clamp leaves almost no margin and a punched-through gate can fail **shorted** → continuous conduction → thermal runaway/fire. Clamp at ~12 V (15 V max). |
| Secondary coil | 30–34 AWG, 400–1000 turns on 25–40 mm form | 1 | $5 | Same craft as BASE; a bit taller/finer helps. More turns ⇒ more inductance ⇒ **rings lower**. |
| Primary/feedback | 22–18 AWG, 3–5 turns at the base | 1 | $0.50 | |
| Topload | smooth metal sphere or small toroid (e.g. 2 stacked SS salad bowls, or a cabinet knob) | 1 | $3 | **Smooth = good.** Any sharp point bleeds off and shortens reach. |
| DC supply | 12–24 V, current-limited bench supply preferred | 1 | $0 (own) / $25 | A current-limited lab supply is the single best safety upgrade here. |
| Inline fuse | fuse holder + 1–2 A fast-blow; **fuse VOLTAGE rating ≥ supply voltage** | 1 | $1 | The 1–2 A is the **blow current** (just above normal draw); the **voltage rating** must meet or exceed your 12–24 V supply. First line against fire on a fault. |
| Power-on LED | 5 mm LED + series resistor sized for the LED (e.g. ~1 kΩ @ 12 V, ~2.2 kΩ @ 24 V → ~10 mA) | 1 | $0.20 | **Forgetful-human insurance** — lit = HOT. Size the resistor for the LED's Vf so it isn't over-driven. |
| 555 timer (optional) | NE555 + 2 resistors + cap (e.g. 10 kΩ/100 kΩ + 10 nF) | 1 | $0.50 | "Singing" interrupter. Gates the oscillator at audio rate. |
| Perfboard + standoffs | — | 1 | $3 | At 12–24 V, move off the breadboard onto soldered perfboard. |
| CFL tube / fluorescent | small CFL or short tube | 1 | $2 | **The payoff** — lights from a wider gap than a neon. |

#### Tools — DECKED-OUT

- Soldering iron, solder, flux.
- Wire strippers, cutters, small screwdriver.
- **Multimeter**, kept **back from the coil** when live (⚠).
- **Oscilloscope** (for the Tier-A frequency reading) — probe a **separate antenna** only. ⚠☠ **Never the topload or top tip** (mains-earth-referenced chassis → dead scope AND a shock/fault path; see tuning).
- **Current-limited DC bench supply** if you have one (strongly preferred over a battery here).
- A **grounded screwdriver for the reach test**, grounded to a **separate local RF ground** (see step below) — never mains earth.
- Safety glasses; this is where flying-fault debris and bright corona start to matter (⚠ eyes).

#### Build steps — DECKED-OUT

1. **Wind a taller secondary** (400–1000 turns, single neat layer, one direction) and a **3–5 turn primary/feedback** at the base, exactly as in BASE steps 1–3. Strip and tin all ends; confirm continuity.
2. **Mount the switch on a heatsink before wiring it.** Bolt the MOSFET/BJT to the TO-220 heatsink with a thermal pad.
   - ⚠ **THERMAL — the defining hazard of this rung.** A power MOSFET/BJT with no heatsink, run while *not* oscillating, will reach **scorch-your-skin temperature in under 10 seconds** and can fail. **Heatsink first, then power.** Keep a finger near the switch temperature and a finger near the off button, always.
3. **Wire the oscillator** (MOSFET version):
   - **Source** → supply **−**.
   - **Drain** → **bottom of the secondary**; **top of the secondary** → **topload**.
   - **Gate drive:** one **feedback-coil** lead → **gate** through the **100–470 Ω** gate resistor; the other feedback lead → supply **+** (this also provides startup bias for the gate). For the MOSFET you generally don't need a separate big bias resistor — the feedback swing drives the gate — but a **10 kΩ gate-to-source pulldown** keeps it cleanly off when undriven.
   - **10 kΩ** gate-to-source pulldown (as above).
   - **Gate clamp:** back-to-back **~12 V** zeners (or a TVS) gate-to-source to bound the feedback swing.
   - ⚠ **MOSFET gates are static-sensitive and over-voltage-fragile.** Touch ground before handling; do not skip the clamp — an unclamped gate gets punched through by the feedback swing and the part dies silently, often **shorted**, which leaves the coil conducting continuously (heater/fire). **Clamp at ~12 V, not 18 V** — Vgs(max) ≈ ±20 V and you want real margin.
4. **Add the fuse and the power LED in the supply line.** Inline fuse on **+** right at the supply entry (voltage rating ≥ supply, current 1–2 A fast-blow). Power LED (with its series resistor) across the **switched** supply so it lights **only when the coil is powered**.
   - **Reminder to the forgetful human:** that LED exists because *you will, at least once, walk away from a coil you think is off.* If the LED is lit, the coil is **HOT** — treat the topload as live HV (⚠ RF burn) until the LED is dark.
5. **Fit the topload.** Connect the **top secondary lead** to the **smooth sphere/toroid**. Smooth and rounded = the field reaches farther and the discharge is gentle; **any sharp edge or point becomes a hot spitting arc** that can punch back into and kill the transistor (⚠).
6. **Bring it up gently — current-limit, don't cold-start. One hand behind your back.** If you have a current-limited bench supply, **set the current limit low (~0.3–0.5 A) and the voltage to 12 V first.** Power on, confirm oscillation (LED on, faint whine, corona at the topload in the dark), watch the current and the switch temperature, *then* raise voltage toward 24 V slowly.
   - ☠ **Implant check before power:** nobody with a pacemaker/ICD/pump/implant in the room. The field is strongest and the reach is greatest on this rung — this is the lethal one.
   - ⚠ **Never cold-start at full 24 V into an unverified circuit.** Bringing it up on a current limit is the bench-scale version of the **variac bring-up** vow you'll live by on L1 ([[resonance]] safety doctrine). Learn the habit now.
   - ⚠ **If current pegs the limit and there's no corona, it's not oscillating — it's a heater.** Kill power, swap the feedback leads, check the gate clamp. Do not let it sit hot.
7. **(Optional) Add the 555 "singing" interrupter.** Wire an NE555 as an astable oscillator at an **audible rate (~100 Hz–2 kHz)** and use its output to **gate the slayer on and off** (e.g. drive a small signal transistor that interrupts the gate drive, or gate the supply to the oscillator stage). The coil now switches its corona on/off at that rate — and **the corona becomes a loudspeaker.** Change the 555's resistor/cap to change the pitch.
   - ⚠ **The 555 line is harmless; the coil it's gating is not.** Keep your hands on the 555 side, never on the topload side. One hand behind your back stays in force.

#### First-light / tuning / test — DECKED-OUT

1. **Dark room, current-limited bring-up** (step 6), one hand behind your back. Confirm the **power LED**, listen for the whine, look for the corona brush at the topload.
2. **The wireless payoff — across the gap.** Bring a **CFL tube** toward the topload. At a wider distance than the BASE neon managed, it should **light** — and slide it around to find the brightest spot (the near field is shaped). **Light a bulb from across the gap: that's the demo, that's the seed of Wardenclyffe at desk scale.**
   - ⚠ **Light the bulb by holding the bulb's glass, not by holding it near your face.** Keep the topload away from your eyes (UV/bright corona, ⚠) and never let the *arc* reach your fingers — hold the bulb's glass, let the bulb be the thing in the field.
3. **Reach test (do it safely).** Use a **screwdriver held only by its insulated handle**, with its shaft tied to a **separate local RF ground** (a ground rod / counterpoise / dedicated RF return — **never the mains safety earth**, or you'll inject RF into the house wiring). Draw a small arc *from the topload to the screwdriver tip* to gauge reach.
   - ☠/⚠ **Never your finger, and never an ungrounded ("floating") tool.** A floating conductor in the field charges up and will give *you* the RF burn or shock the instant you grip it near the metal. Hold the insulated handle only. RF burns are **deep, painless, and slow to heal** — you won't feel it bite.
   - **Why a SEPARATE RF ground:** RF must not return through your building's safety earth (EMI into the house + a shock path for everyone else on that ground). Keep the RF return local and isolated.
4. **Tuning / resonance read.** As with BASE, the slayer self-tunes. **Measure** `f` by probing a **nearby antenna** with the scope (ground clip to supply −).
   - ⚠☠ **Never probe the topload or top tip.** The scope is mains-earth-referenced — direct contact destroys the input *and* opens a fault/shock path to earth. Antenna only.
   - Expect a **lower** frequency than the BASE coil if you wound more turns. Adding the topload **lowers `f`** (it adds top capacitance) and **lengthens reach** — watch both change as you swap toploads. Log: `f`, supply V, current, topload, "lit a CFL at __ cm." **That table is your Tier-A record.**
5. **Singing check (if you built the 555):** sweep the 555's frequency control and listen to the corona change pitch. The audible note **equals the interrupter frequency** — itself a clean **Tier-A** measurement (pitch in = pitch out), and a direct preview of the L2 SSTC "voice."
   - ⚠ **Hearing:** a singing topload near your ear is loud. Keep distance.

> **What you've proven (DECKED-OUT):** that a properly switched, fused, indicated resonant oscillator transfers enough near-field power to light a CFL across a visible gap, at a frequency you set by your winding and shifted measurably with the topload — and, optionally, that the corona's on/off rate is an audible, controllable tone. **Tier A — Measured.** (Wider, "powers my whole desk" claims would be **Tier D** — not demonstrated here.)

---

## HAZARD TABLE — L0

| Hazard | Why | Mitigation |
|---|---|---|
| ⚠ **RF burn at the topload** | Tens of kV of RF; the burn is **deep and painless**, so you don't pull back in time, and it heals slowly — treat a deep RF burn as a real injury and seek medical care | Never touch the topload or draw arcs to skin; use an insulated, **separately-grounded** screwdriver to test reach; one hand behind your back; treat topload as live whenever the power LED is on |
| ⚠ **Floating-conductor shock/burn** | An ungrounded tool/object in the field charges up and bites when you grip it | Only grip insulated handles; ground the reach-test tool to a separate RF ground, never let a bare conductor float in the field |
| ⚠ **Transistor/MOSFET thermal burn + failure** | A non-oscillating slayer converts all supply power into device heat; a punched-through MOSFET gate can fail **shorted** → continuous conduction | Heatsink on DECKED-OUT; finger-check temperature; **12 V gate clamp** (not 18 V); current-limit on bring-up; kill power the instant it's hot-with-no-corona; never leave a powered board unattended |
| ☠ **Medical-implant disruption** | Strong near-field RF can interfere with **pacemakers, ICDs, insulin pumps, cochlear implants** across a small room | **No implant wearers in the room, period.** This is the one genuinely lethal risk on an otherwise low rung — check before *every* power-up |
| ⚠☠ **Scope/instrument on the topload** | Scope chassis is mains-earth-referenced; touching the probe to HV RF kills the input AND opens a fault/shock path to earth | Probe only a separate antenna; ground clip to supply −; never the coil/topload |
| ⚠ **Fried electronics** | The field couples into phones, hearing aids, laptops, USB drives, your good meter/scope | Keep all electronics several feet back and powered off; probe only an antenna with the scope, never the topload |
| ⚠ **Eyes — bright corona / UV / arc flash** | Sustained corona and arcs are bright and produce some UV (even the small BASE corona, close up) | Safety glasses on DECKED-OUT; don't stare into the corona; keep the topload away from your face/eyes |
| ⚠ **Ozone** | Corona makes ozone; a closed room gets a sharp smell and irritated airways | Ventilate; don't run long sessions in a sealed space |
| ⚠ **Battery fault / fire** | A dead-short fault can overheat wiring/battery; a 9 V can vent and a Li pack can do far worse | Continuity-check before power; inline fuse (DECKED-OUT); never substitute a high-current Li pack on the BASE; **never run unattended** |
| ⚠ **EMI / RF into house wiring** | Grounding the coil to mains earth injects RF into the building | Use a separate local RF ground for reach tests; keep RF return local and isolated |
| ⚠ **Hearing (555 mode)** | Loud corona at audio rate near the ear | Keep distance; don't put your ear to a singing topload |

---

## PRE-FLIGHT CHECKLIST (before power) — blunt, for the forgetful

- [ ] **Am I alone? Don't be.** Even on the low rung, someone should know you're running it. (Never-alone vow, [[resonance]].)
- [ ] **Anyone with a pacemaker/implant in the room? Get them out.** ☠ This is the real danger here — check *every* time.
- [ ] **One-hand rule loaded:** I will keep one hand behind my back whenever the coil is energized.
- [ ] **Electronics back and off** — phone, watch, hearing aids, laptop, the good scope/meter except the antenna probe you're using.
- [ ] **Heatsink fitted** (DECKED-OUT) and switch bolted down tight.
- [ ] **Continuity checked:** secondary is one unbroken wire; ends actually stripped to copper; no collector/drain-to-emitter/source dead short.
- [ ] **Gate clamp (~12 V) in place** (DECKED-OUT MOSFET) and gate pulldown present.
- [ ] **Fuse installed, voltage-rated ≥ supply, current 1–2 A** (DECKED-OUT).
- [ ] **Topload is smooth** — no sharp burrs that will spit arcs back into the switch.
- [ ] **Reach-test tool grounded to a SEPARATE RF ground**, not mains earth (DECKED-OUT).
- [ ] **Current limit set low** on the bench supply (DECKED-OUT), voltage at the *low* end to start.
- [ ] **Off switch within instant reach of my hand** — and I know which way is OFF.
- [ ] **Safety glasses on** (DECKED-OUT). **Room ventilated** for ozone.
- [ ] **Notebook open** to log `f`, supply V, current, topload, and the bulb-distance result. (No log, no Tier-A.)

## SHUTDOWN / SAFE CHECKLIST (after) — blunt, for the forgetful

- [ ] **Power OFF and confirm the power LED is DARK.** Lit LED = still HOT. (Don't trust the whine being gone.)
- [ ] **Disconnect the battery / supply.** On the supply, drop voltage to zero *and* switch it off.
- [ ] **One hand behind your back until power is confirmed off** — old reflex, small coil, exact reflex that saves your life on L1.
- [ ] **Wait, then touch the switch device — expect it warm; if it's hot, note it** (a hot device after shutdown means it was struggling — investigate the feedback/gate clamp before next run).
- [ ] **Treat the topload as live until power is off and confirmed.** Exactly the reflex that saves you on L1's charged tank cap. Build it now.
- [ ] **Discharge nothing dramatic here** — but say the words anyway: *"assume it's charged."* That habit is the point of this rung.
- [ ] **Nothing left powered and unattended** — no live board on the bench, no battery left snapped on, supply off.
- [ ] **Log the run** before you forget: what worked, what got hot, the measured `f`, the bulb distance.

---

## Climb from here

This is the **seed** — every higher rung is this same idea, made bigger, cleaner, and more controllable. ([[resonance]] holds the full ladder.)

- **Up the ladder → L1 (Spark-Gap Tesla Coil).** The slayer's transistor *is* the spark gap, miniaturized. On L1 you replace it with a real disruptive gap and a charged tank capacitor driven by a neon-sign transformer — and the safety class jumps from ⚠ to **☠ lethal.** The habits you drilled here (one-hand reflex, "assume it's energized," never alone, gentle bring-up, log the frequency) are the **only reason you're allowed to climb.** *Do not skip to L1 until you've lit a bulb on L0.*
- **Up the ladder → L2 (SSTC, "the voice").** Your optional 555 "singing" mode is L2 in embryo: an interrupter gating a transistor-driven secondary. L2 makes that robust and musical.
- **→ The Loom (Jarvis / Tier-A data).** Your logged `f`, supply V, current, and "lit a CFL at __ cm" are the **first hard, self-generated measurements** in a repo that otherwise ingests the world's data. Feed them in as a Tier-A entry on the Resonance organ — provenance practiced, not just preached. A microcontroller on the 555's job (control + logging) is the natural bridge to **Jarvis**.
- **→ Pyramid Temples (cymatics).** A singing coil — or just the plain 555 tone driving a small speaker — is a **frequency source.** Point it at a **Chladni plate** and photograph the standing-wave figures: frequency in, sacred geometry out. The L0 555 is the cheapest possible on-ramp to that bridge.
- **The honest endgame.** Your lit bulb is the *real, measured* face of Tesla's dream — near-field resonant power transfer, the same physics as Qi pads and WiTricity. It is **not** proof of global free wireless power; that stays the **Tier-D frontier**, kept and honored, never dressed up as done. *Build the spark before the tower. Measure the note before you claim the song.*

---

## Reconcile with the book (Tier B)

The BASE track here is the **generic, public-knowledge** single-transistor slayer — the kind an intro project would cover — and is explicitly **flagged generic**. It was built **without reading Tilbury's *Ultimate Tesla Coil Design and Construction Guide*** (no quotation, no paraphrase-to-disguise; HARD COPYRIGHT RULE observed). When that **Tier-B** source becomes readable in this workspace, reconcile and supersede where it differs: the book's recommended *first* transistor and bias values, its winding turn-count / wire-gauge guidance, its topload sizing, and — above all — **its own safety doctrine**, folded in as **cited** Tier-B notes. Until then, every specific value above is **generic and to be verified against the book.** The deeper book reconciliation lives on the **L1/SGTC** rung, where Tilbury's build order and spec choices are the spine. See [[resonance]] · [[provenance]] · [[aether]].

---
