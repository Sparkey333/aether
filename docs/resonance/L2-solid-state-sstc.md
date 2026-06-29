# L2 — The Solid-State Tesla Coil (SSTC) · *the voice*

> Tear out the spark gap and put a transistor in its place; now the lightning has a throat, and you have taught it to sing.

---

> ## ☠ DANGER BANNER — READ BEFORE YOU TOUCH A WIRE
> **This rung can kill you, and it can kill you in a way the previous rung could not.**
> The L1 spark-gap coil was driven by a transformer you could see and respect. This coil is driven by a **rectified mains DC bus** — typically **~170 V DC on 120 V mains, ~325 V DC on 230 V mains, smoothed across a bank of capacitors that stay lethal for minutes after you pull the plug.** There is no isolation transformer between the wall and your bridge unless you put one there. **A mistake here puts mains-referenced, capacitor-backed DC across your heart.** On top of that the secondary throws RF streamers at tens of kV.
> - ☠ **Lethal hazards:** rectified mains DC bus + bus capacitors (hold charge for *minutes* after power-off); secondary RF output; off-the-line (non-isolated) construction where chassis/heatsinks can sit at mains potential; the series DC-blocking cap in the primary (also stores charge).
> - ⚠ **Injury hazards:** RF burns (deep, painless at the instant), UV from streamers, ozone, hearing damage from the interrupter's audio-rate "voice," flying debris if a MOSFET fails violently.
> - ☠ **Pacemakers / implanted electronics / hearing aids: stay out of the room.** The dense RF field can interfere with or damage implanted devices. This is a no-exceptions rule — clear the room before bring-up.
> - **Safety class: ☠ LETHAL.** Same lethality tier as L1, plus a non-obvious new way to die (off-line DC) and a new way to destroy gear (dense RF frying your own electronics).
> **Do not build this as your first coil.** Earn L0 and L1 first. Read the whole [[resonance]] safety doctrine before powering up.

---

## What this rung is / what it proves

The SSTC replaces L1's roaring spark gap with a **transistor bridge** — a half- or full-bridge of MOSFETs (or IGBTs) switched at the secondary's resonant frequency. A **feedback** signal (an antenna sniffing the streamer, or a current transformer reading the secondary base current) tells the bridge exactly what note to drive, so the coil always pushes the secondary at resonance. An **interrupter** (a 555 timer, or a microcontroller) chops the whole output on and off many times a second.

What it proves is **control**. The spark gap was a wild animal; the bridge is an instrument. Because the interrupter runs in the **audio band (tens of Hz to a few kHz)**, the streamer's on/off pulses beat the air at those frequencies and **the spark becomes a loudspeaker — the coil sings, and with a MIDI front-end it plays music.** That audible pitch is a **Tier-A** claim: it equals the interrupter frequency, and you can measure both with a scope and your ears.

**Provenance tier of this rung: A (Measured).** Resonant frequency, drive frequency, interrupter rate, audible pitch, bus voltage, and bridge current are all on a scope. The dream this serves — global wireless power — remains **Tier-D** and is not touched here.

---

## TWO PARALLEL TRACKS

Build the same idea twice: the simplest version that actually sings, and the version we level it up to. Read them side by side so you can see exactly what each upgrade buys you.

| Aspect | 🔰 BASE | ⚡ DECKED-OUT |
|---|---|---|
| Bridge topology | **Half-bridge** (2 switches) | **Full bridge** (4 switches) |
| Switches | MOSFETs (e.g. IRFP260N / IRFP460) | MOSFETs or IGBTs, gate-driven hard |
| Feedback | **Antenna** (a wire near the coil) | **Current transformer (CT)** at secondary base |
| Interrupter | **555 timer**, hardwired knobs | **Fiber-optic / optical** interrupter, isolated |
| Protection | Fuse + variac bring-up | + **OCD** (over-current detect) |
| Control | A potentiometer | **MIDI input** → notes |
| Skill jump | Board work, first off-line bus | Robust feedback, isolation discipline |

> **Reminder to the forgetful human:** both tracks run off rectified mains. The "simple" track is not the "safe" track. There is no safe track. There is only the *respected* track.

> **Note on protection:** the fuse on **either** track protects your house wiring and stops a gross short from becoming a fire. It is **far too slow to save a MOSFET** — semiconductors die in microseconds, fuses in milliseconds. Saving the *switches* is the job of correct dead-time and (decked-out) **OCD**. Do not mistake "it's fused" for "the bridge is protected."

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

A half-bridge of two MOSFETs, an antenna for feedback, a 555 for the interrupter, a hand-wound secondary and a toroid. This is the canonical "my first SSTC" architecture you'd find in any introductory treatment.

> **⚠ Generic-design flag:** This BASE track is built from general, public Tesla-coil engineering knowledge — *not* from Tilbury's book, which has not been read here. Treat every spec below as a sane generic starting point and **reconcile with Tilbury (Tier B) once the source is readable** (his recommended bridge, gate-drive, feedback, and bring-up choices supersede these once cited).

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Power MOSFETs | N-channel, ≥500 V, low Rds(on) — e.g. IRFP460 / IRFP260N | 2 | $4–8 ea | The half-bridge switches. Buy matched/extras; assume you will kill some. |
| Gate-drive transformer (GDT) | Ferrite toroid, trifilar-wound | 1 | $3 | Provides isolated, symmetric gate drive **and** mains isolation for the gate signal. ☠ critical — see steps. Note: a GDT gives *no dead-time* by itself; dead-time must come from the driver/logic. |
| Gate driver IC | e.g. UCC27425 / TC4427 dual driver | 1 | $2 | Buffers the feedback signal into the GDT. |
| Bus rectifier | Bridge rectifier, ≥600 V, ≥8 A — e.g. GBPC2510 | 1 | $2 | Turns mains AC into the DC bus. Current rating must cover **peak cap-charging current**, not just average draw. ☠ output is lethal mains-referenced DC. |
| Bus capacitors | **120 V mains:** 2 × ~470 µF, **≥250 V** electrolytic, half-bridge split (don't run 200 V parts on high-line). **230 V mains:** 2 × ~470 µF, **≥250 V** each in series. | 2 | $3 ea | Form the half-bridge midpoint **and** store lethal charge. High-line 120 V mains can peak ~187 V; an imbalanced split can push one cap over a 200 V part — hence ≥250 V + balancing. ☠ |
| Balancing / bleeder resistors | 100–220 kΩ, 2 W, across **each** bus cap | 2 | $0.50 | ☠ Non-negotiable. They **balance** the series caps *and* drain them when off. With 470 µF this gives τ ≈ 47–100 s per cap → budget **~4–8 min to fully bleed (≥5τ)**. Verify with a meter anyway. |
| Bus snubber cap | 0.1–1 µF film, ≥630 V (e.g. CBB/MKP) | 1 | $2 | Across the bus, close to the bridge. |
| DC-blocking (primary) cap | Film, **≥630 V**, high pulse/ripple-current rating (MKP) | 1 | $3 | In series with the primary so bus DC never sits across it. ☠ stores charge and carries the full primary current — under-rate it and it fails short, dumping bus DC into the primary. |
| Antenna feedback wire | ~10–30 cm stiff wire + diode clamp + RC | 1 | $1 | Picks up the secondary's resonance to self-drive the bridge. |
| Schmitt / logic gate | 74HC14 (hex inverting Schmitt) | 1 | $0.50 | Squares up the antenna feedback into a clean drive clock. |
| 555 timer | NE555 / TLC555, astable | 1 | $0.50 | The interrupter. Pots set frequency and pulse width. |
| Interrupter pots | 1 MΩ (rate) + 100 kΩ (width), linear | 2 | $1 | Your two "voice" knobs. |
| Logic supply | Isolated 12–15 V (e.g. small mains adapter, **isolated**) | 1 | $6 | ☠ Must be isolated from the HV bus. Powers driver + 555. |
| Secondary form | PVC/acrylic pipe, ~50–110 mm dia × ~30–50 cm | 1 | $5 | The resonator body. |
| Secondary wire | 0.2–0.4 mm enamelled copper, ~800–1200 turns close-wound | 1 spool | $10 | Hand-wound. Patience. |
| Primary | 5–10 turns thick wire/tubing around base of secondary | 1 | $5 | The bridge drives this. |
| Topload | Toroid (dryer duct + pie pans) or sphere | 1 | $8 | Sets top capacitance; shapes streamers. |
| Heatsinks + fan | For both MOSFETs + airflow | 1 set | $8 | Switches run hot. Insulate tabs from each other and from a shared sink. ⚠ |
| Fuse | Mains-rated, fast, sized to draw (e.g. 5–8 A) | 1 | $1 | Protects house wiring / stops fires. **Will not save the MOSFETs.** |
| Mains-rated wire, terminals, perfboard, enclosure | — | — | $15 | Build it in a box. No bare mains. ☠ |
| **Variac** | 0–140 V (or 0–250 V), ≥5 A | 1 | $40–70 | ☠ **Bring-up tool. Do not cold-start.** Borrow one if you must. |

**Approx total: ~$120–200** (less if you scrounge; the variac dominates and is reusable forever).

#### Tools — BASE
- Multimeter (with a **working** ohms + DC volts range; you will bet your life on it).
- Oscilloscope (even a cheap one) — to see feedback and drive. Hard to tune blind.
- Insulated screwdrivers, a **grounded chisel/screwdriver on an insulated handle for shorting caps** (the "chicken stick").
- Soldering iron, side cutters, a winding jig (a drill makes secondary winding bearable).
- Variac (listed in BOM — it's a tool *and* a safety device).
- Earphone-style hearing protection; UV-blocking safety glasses.

#### Build steps — BASE

1. **Wind the secondary.** Close-wind ~800–1200 turns of fine enamelled wire onto the form, smooth and gap-free. Anchor both ends; seal with a thin clear coat. Measure its length and turns — you'll want them for the resonance estimate.
2. **Build the topload and primary.** Mount the toroid above the secondary. Wind 5–10 turns of thick wire as the primary around the secondary's *base*, spaced off the form. Keep primary and secondary windings physically separated — coupling is meant to be loose.
3. **Build the DC bus on its own board.** Mains → fuse → bridge rectifier → two series bus caps (their midpoint is the half-bridge return) with **balancing/bleeder resistors across each cap** and a film snubber across the whole bus.
   > ☠ **The instant you solder the rectifier output, treat that board as live-forever.** After any power-up, those caps hold lethal DC for **minutes** (τ ≈ 47–100 s; wait ~4–8 min, then verify). **Bleeders are not optional, and you still verify with a meter before touching anything.**
   > **Reminder to the forgetful human:** assume every capacitor is charged. Bleed it, short it with the chicken stick, *then* meter it, *then* trust it — in that order, every time. **Keep one hand behind your back even while metering** — if a probe slips, the current must not have a path through your chest.
4. **Build the half-bridge.** Two MOSFETs in series across the bus; their junction is the bridge output that feeds the primary **through the series DC-blocking cap** (so you don't dump bus DC into the primary). Mount both on heatsinks.
   > ☠ **The bridge midpoint, the MOSFET drains, and the DC-blocking cap all sit on the live, mains-referenced bus.** Everything from the rectifier to the primary tap is lethal whenever the bus is up — and the blocking cap holds charge after shutdown too. Bleed, short, and meter the *whole* power loop, not just the main bus caps.
   > ⚠ **A MOSFET's metal tab is usually its drain — it is electrically HOT.** Use insulating pads/bushings, or the heatsink becomes a mains-referenced deathtrap. **Never bond the two MOSFET sinks together or to the chassis** — that shorts the bus or energizes the case. Meter tab-to-heatsink and sink-to-chassis for isolation before power.
5. **Wind and wire the GDT.** Trifilar-wind a small ferrite toroid; one winding to the driver, one to each MOSFET gate (watch the dots/polarity so the two switches drive *anti-phase*, never both on at once).
   > ☠ **The GDT is your isolation barrier between low-voltage logic and the mains-referenced bridge. Wind it well, keep its insulation intact. If it ever shorts, mains voltage reaches your control board — and your hands.**
   > ☠ **Shoot-through:** if both half-bridge switches turn on together, they short the bus and explode. The GDT does **not** create dead-time — generate dead-time in the driver/logic. Confirm anti-phase *and* a clean non-overlap gap *on the scope, on the bench, before the bridge ever sees bus voltage.*
6. **Wire feedback.** Feedback antenna → diode clamp + RC → 74HC14 Schmitt → gate driver → GDT. This loop makes the bridge self-oscillate at whatever frequency the secondary "wants."
7. **Wire the 555 interrupter.** Astable 555 with rate + width pots, its output **enabling/disabling** the gate driver (gate the driver's enable pin, or AND it with the feedback clock). Power the 555 and driver from the **isolated** logic supply only.
   > ☠ **Never power your logic/555 from the HV bus through a dropper.** One failed part and your knobs are at mains potential. Isolated supply, always.
8. **Box it.** Everything mains-touching goes inside an enclosure. Strain-relief the cord. Bond exposed metal that *should* be earthed to mains earth — but route the **secondary's RF ground separately** (own rod/strap), not through the mains earth or your scope ground.
   > ⚠ **Reminder:** RF ground and safety ground are two different jobs. Tie the streamer's return to its own RF ground, or the RF will hunt for a path through your bench, your scope, and your nerves.

#### First-light / tuning — BASE

1. **Pre-flight checklist first (below). Every time. No exceptions.** ☠ **Confirm no pacemaker/implant/hearing-aid wearers are in the room.**
2. **Power the *logic only* first** (HV bus disconnected). On the scope, confirm: feedback loop oscillates cleanly, gates drive **anti-phase with visible dead-time**, 555 chops at an audible rate. Fix all of this with **no bus voltage present.**
3. **Bring up the bus on the variac, slowly, from zero**, current-limited if you can, watching for heat, smoke, or rising current that shouldn't be there.
   > ☠ **Never cold-start onto full mains.** A wiring fault at 0 V is a lesson; the same fault at full bus is an explosion and possibly a corpse. The variac is how you survive your own mistakes.
4. **Tune to resonance.** With a small, brief on-time, nudge the **drive frequency to the secondary's resonant frequency** (antenna feedback should find it automatically; if it locks onto a harmonic or won't start, adjust antenna length/position and the feedback RC). The streamer is longest and the bridge runs *coolest* when you're on resonance — off-tune means wasted current and hot switches.
5. **Find the voice.** Now turn the 555 rate pot: as you sweep it across the audio band, **the streamer changes pitch** — that hiss becomes a hum becomes a tone. Pulse-width sets loudness/length (and heat — keep duty low). Confirm: scope the interrupter frequency, match it to the pitch you hear. **That equality is your Tier-A result.**
   > ⚠ **Ozone reminder:** a coil that's been singing for a while fills a closed room with ozone. Ventilate, take breaks, don't marathon it in a sealed space.

> ⚠ **Reminder to the forgetful human:** the streamer is at full secondary voltage even while it's "just singing quietly." It will give you an **RF burn that you feel as nothing at the instant and as a deep, slow-healing wound afterward.** Never draw the arc to your skin. One hand behind your back. **Never bring a meter probe to a live secondary — kill the drive first; metering RF is how you get burned, not how you get a reading.**

#### What you've proven — BASE
You drove a resonant secondary with a transistor bridge instead of a spark, locked it to resonance with feedback, and **modulated the streamer into sound** — measured pitch = measured interrupter rate. **Tier A.** You also proved you can build and bring up an off-line (mains-derived) power stage without dying — the real graduation of this rung.

---

### ⚡ DECKED-OUT — the design we level it up to

Same physics, four upgrades that turn the toy into a reliable, controllable, *musical instrument*: **full bridge** for more power and symmetry, **current-transformer feedback** for a rock-solid lock, a **fiber-optic interrupter** for total isolation, **OCD** to save the bridge from itself, and a **MIDI input** so it plays actual notes.

> **⚠ Generic-design flag (still applies):** these are public-knowledge upgrades, not Tilbury's. Reconcile spec choices (CT turns ratio, OCD threshold, IGBT vs MOSFET, gate-drive currents) with Tilbury (Tier B) once readable.

#### BOM — DECKED-OUT (deltas + additions over BASE)

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Power switches | 4 × MOSFET (IRFP460) **or** IGBT bricks for more grunt | 4 | $4–15 ea | Full bridge = 2 legs, 4 switches. Symmetric drive across the primary. |
| Dedicated gate drivers | UCC27425/27322 per leg, or GDT with 2 secondaries | 2 | $2 ea | Full bridge needs two anti-phase legs driven hard, with dead-time. |
| Current transformer (CT) | Ferrite toroid, ~1:50–1:100, secondary-base current | 1 | $4 | **Feedback from real bridge/secondary current** — far more stable than antenna. |
| Feedback conditioning | Burden resistor + fast comparator (LM311/TLV3501) | 1 set | $2 | CT → burden → comparator → clean drive clock. ⚠ The burden must **never** be left open — an unburdened CT secondary develops dangerous high-voltage spikes and can destroy itself and your comparator. |
| OCD circuit | CT + comparator + latch (e.g. 74HC74) → shutdown | 1 set | $4 | **Over-current detect:** trips the bridge off before it self-destructs. ⚠ This — not the fuse — is what saves the switches. |
| Microcontroller | Any small MCU (e.g. ATmega/STM32/RP2040) | 1 | $4–8 | Runs the interrupter timing + MIDI parsing + safety logic. |
| MIDI input | 5-pin DIN or USB-MIDI + **6N137/PC817 optocoupler** | 1 | $4 | ☠ Opto-isolate MIDI in — your keyboard must never touch this bus. |
| Fiber-optic link | TX (e.g. SFH756) + RX (SFH551) + plastic fiber | 1 set | $8 | ☠ **The interrupter signal crosses an air/light gap — total galvanic isolation between your control box and the lethal bridge.** |
| Bus bank | Larger / paralleled caps + balancing resistors, **≥250–400 V per cap, rated for high-line + imbalance** | set | $15 | More stored energy (and ☠ more stored lethality — heavier bleeders, longer wait). |
| Inrush limiter | NTC thermistor + bypass relay | 1 | $3 | Limits the cold-start surge into the big bank. ☠ **Does not replace** the variac bring-up — it is *additional*. |
| Bus voltmeter | Panel meter / MCU ADC across bus (via isolated divider) | 1 | $5 | So you *know* the bus is dead before you reach in. ☠ |
| Separate RF ground kit | Ground rod + heavy strap | 1 | $15 | Streamer return goes here, not mains earth. |

**Approx total over BASE: +$120–250.**

#### Tools — DECKED-OUT (additions)
- Two-channel scope (you'll watch feedback vs. bridge current together — essential for OCD and CT tuning).
- Current probe or a known shunt, to set the OCD threshold honestly.
- A MIDI source (keyboard/laptop) for testing — kept **on the isolated, fiber side.**
- Logic analyzer optional but pleasant for MIDI/MCU debugging.
- For the big bank: a **discharge resistor on an insulated stick** (not just a bare short) — see step 6.

#### Build steps — DECKED-OUT

1. **Build the full bridge.** Two legs across the bus; the primary hangs between the two midpoints. Each leg is anti-phase to the other so the primary sees a full swing.
   > ☠ **Now you have *two* shoot-through pairs to get wrong.** Verify both legs anti-phase and dead-time-correct on the scope with zero bus voltage before you ever apply the bus.
2. **Wind and install the CT.** Thread the secondary-base (or bridge-output) lead through the CT toroid; burden resistor across the CT secondary; feed a fast comparator to recover the resonant clock from real current.
   > **Why this beats the antenna:** antenna feedback drifts with streamer load and can latch onto harmonics; CT feedback reads the actual tank current and stays locked. ⚠ Get the **CT phase right** — wrong polarity = positive feedback into chaos, dead switches. ⚠ **Never operate the CT with its burden disconnected.**
3. **Add OCD.** A second CT (or the same one, second comparator) watches peak bridge current; when it exceeds your threshold, a latch **kills the gate drive and stays latched until you reset.**
   > ⚠ **Set the OCD threshold below the switches' safe peak, with margin.** Test the trip *deliberately, at low bus on the variac,* before trusting it. An untested OCD is decoration. Remember: the fuse won't save the switches — the OCD will.
4. **Build the fiber-optic interrupter link.** MCU/555 timing on the **control side** drives a fiber TX; a fiber RX on the **bridge side** gates the drivers. The only thing crossing between your hands and the bus is **light.**
   > ☠ **This is the upgrade that most protects you and your gear.** With fiber, your control box, MIDI keyboard, and laptop share *no electrical connection* with the mains-referenced bridge. Honor it: never bridge the two sides with a stray ground wire "just to test."
5. **Wire MIDI in, opto-isolated.** Standard MIDI input optocoupler (6N137) into the MCU UART. MCU parses note-on/off, converts pitch to interrupter frequency, enforces a **maximum duty/on-time cap in firmware** so a stuck note can't weld the bridge on.
   > ☠ **Firmware is a safety device here.** Hard-limit on-time and break-rate in code; a held chord must never become 100% duty. A bug at this layer is a bridge fire.
6. **Inrush + bus bank.** NTC inrush limiter, larger balanced bus bank with heavier bleeders, isolated bus voltmeter on the panel.
   > ☠ **Bigger bank = more stored death and longer bleed time.** Watch the panel voltmeter read *zero*, **wait out the full bleed**, then discharge. For a large bank, **first discharge through a resistor on the stick, then short with the bare chicken stick** — a dead short into a big bank can rupture a cap or weld the stick. Then meter, *then* reach in.
7. **Grounding discipline.** Streamer/secondary return → dedicated **RF ground rod**. Mains earth bonds the chassis. Control side is isolated by fiber. These three never get casually tied together.

#### First-light / tuning — DECKED-OUT

1. **Pre-flight (below). Every single time.** ☠ **Room cleared of implants/pacemakers/hearing aids.**
2. **Control side alone, fiber unplugged from the bridge:** confirm MCU boots, parses MIDI, generates correct interrupter timing, and respects its on-time cap. No bus, no fiber to the bridge yet.
3. **Bridge side on the variac from zero,** with a **brief, deliberately over-threshold current event staged at low bus to confirm OCD trips and latches.** Reset, then proceed. ⚠ Prove your protection before you need it.
4. **Lock the CT feedback:** on the scope, bridge current should be a clean ring at the secondary's resonant frequency, in phase with drive. Adjust CT burden/comparator until lock is rock-solid as the streamer loads and unloads.
5. **Play it.** Connect the fiber, raise the bus on the variac, and play notes from the MIDI source. **Each note's pitch = its interrupter frequency = a tone in the streamer.** Sweep a scale; confirm pitch tracks note number. Watch OCD; keep duty modest; let the switches stay cool.
   > ⚠ **Reminder to the forgetful human:** the fiber link protects your *laptop*, not your *hands*. The bridge side is still mains-referenced and the secondary is still throwing kV. "Isolated control" is not "safe to touch."

> ⚠ **Reminder to the forgetful human:** "It's just playing music" lulls people into reaching toward a singing coil. **The voice is made of the same kV that throws streamers.** Hands away, ears protected, one hand behind your back, never alone.

#### What you've proven — DECKED-OUT
A full-bridge SSTC with current-transformer feedback that stays locked under load, OCD that protects the bridge, fiber/optical isolation that protects *you and your laptop*, and a MIDI front-end that turns the streamer into a polyphonic-ish musical instrument. **Tier A** throughout: every claim (resonant frequency, drive lock, trip threshold, note→pitch mapping) is on a scope or in your ears against a measured reference.

---

## ⚠☠ HAZARD TABLE — L2

| Hazard | Why it can hurt/kill you | Mitigation |
|---|---|---|
| ☠ Rectified mains DC bus | ~170 V (120 V mains) / ~325 V (230 V mains) of capacitor-backed DC; mains-referenced, no isolation by default | Variac bring-up from zero; never cold-start; build in an enclosure; never reach into a live bus |
| ☠ Bus / tank / blocking capacitors hold charge | Lethal voltage persists for **minutes** after power-off (τ ≈ 47–100 s; budget ~4–8 min) | Balancing/bleeder resistors across every cap; chicken-stick short (resistor-first on big banks); **meter to confirm zero** before contact; assume charged always |
| ☠ Off-line (non-isolated) chassis/heatsink | MOSFET tab = drain = HOT; heatsink/chassis can become mains-referenced | Insulate every device tab; never bond sinks together or to chassis; meter tab-to-sink and sink-to-chassis isolation; treat all internal metal as live |
| ☠ GDT / opto / isolation barrier failure | A shorted GDT/opto puts mains on your control board and hands | Wind GDT well, keep insulation intact; **fiber-optic isolation (decked-out)** removes the electrical path entirely |
| ☠ Shoot-through | Both switches in a leg on at once → bus short → violent failure | Verify anti-phase **and dead-time** on scope at zero bus; add OCD |
| ☠ MIDI/laptop tied to the bus | Your keyboard/computer becomes a mains-referenced hazard | Opto-isolate MIDI in; fiber the interrupter; never bridge control and bridge grounds |
| ☠ Pacemakers / implants / hearing aids | Dense RF can interfere with or damage implanted electronics | **Clear the room** before bring-up; enforce distance; no exceptions |
| ⚠ RF burns | Deep, painless at the instant, slow to heal | Never draw the arc to skin; one-hand rule; never meter a live secondary; keep distance |
| ⚠ Dense RF wrecks electronics | Phones, scopes, hearing aids | Separate RF ground; distance; ferrite/shield sensitive gear |
| ⚠ Hearing damage | The interrupter's audio-rate streamer is genuinely loud | Hearing protection; limit run time |
| ⚠ UV + ozone | Streamers emit UV; coronas make ozone | UV-rated glasses; ventilate; don't stare; short runs |
| ⚠ MOSFET/IGBT explosive failure | Failed switch can rupture and throw debris | Enclosure, fuse, OCD, eye protection, current-limited bring-up |
| ⚠ Fire | Hot switches, arcing, scorched insulation | Fan-cool, fuse correctly, never leave running unattended, extinguisher nearby |

---

## ✅ PRE-FLIGHT CHECKLIST — before power (be blunt, be paranoid)

- [ ] **Not alone, not tired.** Someone present who can cut power and call help.
- [ ] **No implants/pacemakers/hearing aids in the room.** Phones/sensitive gear clear. (Do this first — clearing people takes longer than you think.)
- [ ] **Variac at zero.** Bring-up always from zero. Current-limit ready if you have it.
- [ ] **Bus is dead from last time:** panel voltmeter reads 0, full bleed time waited, chicken-stick short performed, **meter confirms 0 V across the bus *and* the DC-blocking cap.** (Assume charged until proven dead.)
- [ ] **Balancing/bleeder resistors present and intact** across every bus/tank cap.
- [ ] **Enclosure closed.** No bare mains, no exposed bus.
- [ ] **MOSFET tabs insulated from heatsink, sinks not bonded together or to chassis** — metered for isolation.
- [ ] **Gate drive verified anti-phase + dead-time-correct on the scope at zero bus.** (Both legs, decked-out.)
- [ ] **Logic supply is isolated** from the HV bus. MIDI in opto-isolated; interrupter fibered (decked-out).
- [ ] **RF ground connected** and separate from mains earth and from your scope's ground.
- [ ] **OCD tested and armed** (decked-out): a low-bus trip test passed this session.
- [ ] **Firmware on-time/duty cap confirmed** (decked-out): a stuck note cannot reach full duty.
- [ ] **PPE on:** UV-rated glasses, hearing protection.
- [ ] **Fuse correct, cord strain-relieved, extinguisher within reach.**
- [ ] **One hand behind your back** is your default posture near anything live — including while metering.

## ✅ SHUTDOWN / SAFE CHECKLIST — after power

- [ ] **Interrupter off, then cut mains** (kill the drive before the bus).
- [ ] **Variac back to zero.**
- [ ] **Wait the full bleed time** — watch the panel voltmeter fall; the big bank takes minutes (≥5τ), longer than you think.
- [ ] **Discharge the bus** — large bank: resistor-on-a-stick first, then short with the chicken stick (insulated handle, one hand).
- [ ] **Meter the bus, every cap, and the DC-blocking cap: confirm 0 V.** Then, and only then, are they "safe."
- [ ] **Discharge the topload** to its RF ground with the grounded stick before handling.
- [ ] **Re-confirm 0 V before any rework.** Do not trust memory; meter it again.
- [ ] **Leave the chicken stick across the bus** while you work, as a standing reminder.
- [ ] **Air the room** (ozone). Let hot switches cool before you box it up.

> **Reminder to the forgetful human:** the most dangerous moment is *after* you think you're done, when the gear is "off" and your guard is down. The caps don't know the show is over. Meter before you touch. Every time.

---

## Climb from here

- **Up the ladder:** L2 is the bridge between the brute spark gap (**[[resonance]]** L1) and the apex hobby coil. Add a **series-resonant primary**, **heavy current feedback**, hardened **OCD**, and a **bus-cap bank** slammed in short high-current bursts and you have stepped onto **L3 — the DRSSTC**, where both circuits are resonant and the sparks grow feet long and play melodies cleanly. The CT-feedback, OCD, fiber-interrupter, and MIDI work you did here are *exactly* the skills L3 demands — which is the whole point of building them now, at lower energy.
- **→ The Loom (Tier-A data):** every measured number this coil produces — resonant frequency, drive-lock frequency, interrupter rate, audible pitch, bus voltage, bridge current, streamer length — is **self-generated Tier-A data the Loom can hold**, the first hard measurements in a repo that otherwise ingests the world's.
- **→ Pyramid Temples (cymatics):** an SSTC is, literally, a sound source. Feed its tone — or a clean signal generator at the same note — into a **Chladni plate** and photograph the standing-wave figures. Frequency in, geometry out: this rung is where the Resonance organ first speaks in a voice the sacred-geometry work can *see*.
- **→ Jarvis (control & logging):** the decked-out interrupter already *is* a microcontroller. Extend it: log frequency/current/duty/OCD-trips to the archive, enforce safe ramp-up in firmware, and accept MIDI so the coil joins the keeper's other instruments — played, recorded, and measured.
- **Schumann, honestly:** this coil runs at **tens to hundreds of kHz**; the Earth–ionosphere cavity rings near **7.83 Hz**. "Tuning the coil to the Earth's note" is a **Tier-C correspondence, not a Tier-A fact.** Touching 7.83 Hz is a *separate*, quiet build (loop antenna + low-noise amp + ADC) — its own rung, not this one.

---

## Reconcile with the book (Tier B)

This entire guide is built from **general, public Tesla-coil engineering knowledge**. Tilbury's *Ultimate Tesla Coil Design and Construction Guide* (Tier B) **has not been read here**, and nothing in it has been reproduced or paraphrased. The moment that source is readable, fold its specifics into this rung as **cited Tier-B notes** and let them supersede the generic choices above:

- **Bridge & switches:** Tilbury's recommended topology, device families, and gate-drive currents (MOSFET vs. IGBT, half vs. full) vs. the generic IRFP460-class half-bridge here.
- **Feedback:** his antenna-vs-CT guidance, turns ratios, and burden values vs. the generic 1:50–1:100 CT here.
- **Interrupter & isolation:** his stance on 555 vs. MCU, fiber-optic isolation, and OCD thresholds.
- **Bring-up & safety:** his bus-voltage choices, inrush/variac procedure, and his own safety doctrine, reconciled against the vows in [[resonance]].

Until then: **treat every spec in this guide as generic and verify against the book.** Where they disagree, the cited Tier-B source wins.

> Build the voice before you trust the instrument. Measure the note before you claim the song. — see [[aether]] · [[provenance]] · [[resonance]] · [[aetherius]].

---
