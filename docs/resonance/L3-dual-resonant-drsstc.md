# L3 — The Dual-Resonant SSTC (the instrument)

> *Two circuits singing the same note, slammed hard enough to make the air sing back.*

> ## ☠☠ DANGER BANNER — READ THIS OR DON'T BUILD IT
> **Safety class: the most dangerous rung on the solid-state ladder. Lethal three ways at once.**
> A DRSSTC holds a **bus-capacitor bank** whose voltage depends on how you rectify the mains — **know yours before you build:**
> - **120 V wall, simple full-wave rectifier → ~165–190 V DC bus** (√2 × your variac setting; a 140 V variac peaks near 190 V).
> - **120 V wall + voltage-doubler → ~340 V DC bus.**
> - **240 V wall, full-wave → ~340 V DC bus; 240 V + doubler → ~675 V DC bus.**
>
> Any of these stores enough energy to **stop your heart**, and the bank **stays charged long after the wall plug is pulled.** ☠
> The **series-resonant primary** swings to **hundreds to thousands of peak amps**, and the ring-up voltage **across the MMC / primary tank** can reach **well over 1 kV** (note: that kilovolt-plus appears across the *tank capacitor and primary*, not across the IGBT collector–emitter, which see roughly the bus — but both will hurt you). The secondary terminal sits at **hundreds of kilovolts of RF**. ☠
> The streamer can be **two to eight feet long** depending on size, and will reach for *you*, your wiring, your phone, and your pets. **RF burns are painless going in and necrotic going out.** ⚠
> **Do not start here.** This guide assumes you have already built and survived L0 (slayer), L1 (SGTC), and L2 (SSTC), and that you can read a current waveform on a scope without being told which trace is which. **This is NOT a beginner build.**

---

## What this rung is / what it proves

The DRSSTC is the apex hobby coil: **both** the primary and the secondary are tuned resonant circuits, and a full bridge of stout IGBTs *slams* the series-resonant primary tank with current feedback so the bridge always drives at the true resonant frequency. A short interrupter burst lets the primary current ring up to enormous peaks while the secondary climbs to its terminal voltage — and a fast **over-current-detect (OCD)** circuit stands ready to kill the bridge before the IGBTs do their best impression of a hand grenade.

**What it proves:** the biggest, brightest, most *musical* sparks a hobbyist can make — feet-long arcs that play clean melodies. It is the first coil where the spark length, the resonant frequency, the peak primary current, and the note are all knobs you set and numbers you log. **Provenance tier of the claim: A — Measured.** (Resonant frequency `f = 1/(2π√(LC))`, primary peak current, burst length, and audible pitch are all instrument-readable Tier-A truth the Loom can hold.)

---

## TWO PARALLEL TRACKS

The two columns are the *same machine* at two sizes. BASE is the smallest DRSSTC a person should attempt — a modest IGBT bridge with the three things that keep it alive: **current feedback, OCD, and an interrupter.** DECKED-OUT is where coilers spend years: bigger bricks, a real bus bank, phase-lead compensation, and polyphonic MIDI. Build BASE first, *completely*, before you so much as price a brick.

> ⚠ **Reminder to the forgetful human:** "modest" here still means a half-kilowatt machine that throws two-foot lightning. There is no toy version of L3. The BASE column is the *floor*, not a safe sandbox.

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

> *Generic — reconcile with Tilbury (Tier B) once the source is readable.* This BASE track is the canonical "first DRSSTC" architecture as it appears in general public coiling knowledge (half-bridge or modest full-bridge, OneTesla/UD2-style driver lineage). The exact transformer/IGBT/MMC choices and tuning targets below are **generic engineering**, to be checked against the keeper's copy of Tilbury's *Ultimate Tesla Coil Design and Construction Guide* when it is readable — not copied from it.

**Target spec:** ~28–35 kHz secondary, ~24 cm × ~1000-turn secondary, ~10–14" toroid, ~2 ft streamers, ~300–500 W average off a 120 V variac. **Bus topology for BASE: simple full-wave rectifier (no doubler) → ~165–190 V DC bus.** Keep BASE on the low bus; the doubler belongs in the decked-out path.

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| IGBT bricks / TO-247 IGBTs | 600 V, ≥40 A, fast co-pack w/ anti-parallel diode (e.g. IRG4PC50UD, FGA40N60, IXGH40N60) | 4 | $24 | Full bridge. Match from same lot. Diode is **mandatory** for the resonant ring. **600 V is fine for the ~190 V BASE bus; if you ever add a doubler, step up to 1200 V devices.** |
| Gate-drive transformer (GDT) | wound on a ferrite toroid (FT-140-43 or similar), 1:1:1:1, trifilar | 1 | $8 | Keep leads <10 cm, twisted. |
| Bridge / interrupter driver | UD2.7-style or comparable logic driver board (current-feedback + OCD inputs) | 1 | $35 | The brain. Sets phase, gates the bridge, latches on OCD. |
| Current-feedback CT | ferrite toroid, ~50–100 turns secondary, primary = 1 turn of the primary lead | 1 | $5 | Feedback that always finds resonance. Burden resistor sized to driver. **Own core — do not share with the OCD CT.** |
| OCD current transformer | **separate core**, ~1:100+, burden + threshold set to a defined trip *current* below the IGBT safe peak | 1 | $5 | **Non-negotiable.** This is what saves the bridge. |
| Primary MMC tank cap | 942C/CDE 0.15 µF 2 kV polypropylene pulse caps, series-parallel to ~0.15–0.2 µF @ ≥4 kV **and rated for the peak RMS ripple current** | ~10–20 | $40 | Pulse-rated film only. Size for **both voltage and current** — pulse caps die on current too. **No** electrolytics, **no** ceramics here. Bleeders across the MMC. |
| Bus capacitor (DC link) | **≥450 V** (never 400 V), ≥680 µF electrolytic snap-in, low-ESR, ×2 in parallel + film bypass | 2+1 | $22 | The lethal reservoir. Add a 1 µF film cap right at the bridge. **Cap voltage rating must exceed peak bus with margin; if series-stacked, add balancing resistors.** |
| Bridge rectifier | 600 V / ≥25 A (e.g. GBPC2506) on heatsink | 1 | $4 | Rectifies the variac output to the bus (full-wave, no doubler for BASE). |
| Bleeder resistor | 22 kΩ / ≥5 W across the bus | 1 | $2 | ⚠ Drains the bus when off (~seconds on this small bank). **Verify it with a meter — do not trust it blind.** Confirm it does not overheat at your bus voltage. |
| Variac | 0–140 V, ≥5 A | 1 | $45 | **Mandatory** for bring-up. Never cold-start the bridge. |
| Mains protection | fused/breakered inlet + **GFCI/RCD** on the bench feed + inline E-stop | 1 | $25 | ⚠ Faults to chassis and inrush are real; protect the feed. |
| Secondary form | PVC/acrylic ~110 mm OD × ~50 cm | 1 | $12 | Sand, wipe, seal before winding. |
| Secondary wire | AWG 30–32 enamelled magnet wire, ~1000 turns | 1 | $18 | Single layer, no gaps, no overlaps. |
| Primary conductor | 1/4" soft copper tube or 8–10 AWG, flat or saucer, ~8–12 turns *tapped* | 1 | $20 | Heavy, low-loss, adjustable tap. |
| Toroid topload | aluminum dryer duct over plywood + pie pans, ~10–14" | 1 | $15 | Bigger toroid = longer streamers, raises breakout threshold. |
| RF ground rod | 4–8 ft copper-clad rod + heavy strap | 1 | $20 | ☠ **Separate from mains safety ground.** |
| 555 interrupter (or µC) | 555 astable + opto-isolated output, OR Arduino/STM32 | 1 | $10 | Sets burst length + rate. **Fiber-optic isolation strongly preferred.** |
| Enclosure / heatsink / fan | aluminum, finger-guarded | 1 | $30 | Bridge bolted to a real heatsink with a fan. |

**Tools needed (BASE):** oscilloscope (≥50 MHz, ×10 probes, *isolated* if you value your scope — and your life), function generator or the driver's own loop, true-RMS DMM, current probe or a CT you trust, soldering iron, signal generator/grid-dip meter or scope-and-pulse method for resonance, insulated screwdrivers, variac, a chunky **discharge stick** (a 10 kΩ resistor on an insulated rod with a grounded clip lead).

#### Build steps — BASE

1. **Wind and tune the secondary as a standalone resonator first.** Wind ~1000 clean turns of AWG 30, seal with polyurethane, fit the toroid. Measure its self-resonant frequency *with the topload on* (small antenna + scope, or ring it with a pulse). Write the number down — this is your Tier-A anchor `f`. Everything else gets tuned to *it*.
2. **Build the bus supply on the bench, unpowered.** Variac → bridge rectifier (full-wave) → bus caps (in parallel, ≥450 V) → bleeder → film bypass at the bridge. Fuse the mains inlet and put a **GFCI/RCD** on the feed. ☠ **Reminder: the moment this is powered even once, the bus caps are lethal and stay lethal after unplug. Add the bleeder NOW, not later — and the bleeder is a backup, not your trusted discharge.**
3. **Wind the GDT.** Trifilar, short leads, dotted ends tracked carefully — a mis-phased gate winding cross-conducts the bridge and detonates IGBTs on the first pulse. ⚠ **Check GDT phasing on the scope with the bridge OFF and a low-voltage source before you ever connect the bus.**
4. **Build the full bridge.** Four IGBTs, each with its gate resistor (e.g. ~10 Ω) and gate-clamp, anti-parallel diodes confirmed, bolted to the heatsink with thermal pad and **insulated** from each other where the tab is the collector. ☠ **The metal tab IS the collector and sits at bus potential when powered — it is a live, heart-stopping surface. Insulate or isolate every tab, and never assume "the heatsink is grounded" unless you bonded and verified it.**
5. **Wire current feedback.** Run one primary lead through the feedback CT (1 turn primary). Set the burden resistor so the driver sees a clean current waveform. This loop is what makes a DRSSTC self-tune to resonance.
6. **Wire OCD.** Separate CT on its own core, set the trip threshold *below* the IGBT's safe peak current. ☠ **OCD is not optional and not a "later." If the bridge sees a flashover or a too-long burst, OCD is the only thing between you and a bus-cap-fed explosion of silicon.**
7. **Build the interrupter.** 555 astable (or µC) → opto/fiber isolation → driver enable. Set initial burst ~50–100 µs, rate ~100 Hz. **Short bursts, slow rate, low bus — always — for first light.** ⚠ **The controller is NOT isolated from the live bridge unless the fiber/opto link is actually in place and proven — copper to a "logic" board is copper to the bus.**
8. **Mount the primary** as a flat/saucer coil under the secondary, ~8–12 turns, with an adjustable tap clip. Start tapped at ~6–8 turns; you will move it to tune.
9. **Establish the RF ground.** Strap the secondary base to its own driven rod. ☠ **Do NOT bond the secondary RF return to the mains green-wire ground — RF on the safety ground travels through every outlet in the house and back into your scope (and into you).**
10. **Cable management.** Twist gate leads, keep the bridge loop tiny (low inductance), separate signal from power grounds. Long, loopy bridge wiring is why beginners' bridges explode.

> ⚠ **Reminder to the forgetful human:** before *every* power-up from here on, **clip the discharge stick across the bus, watch the meter fall to 0 V, then leave it clipped while your hands are inside.** One-hand rule the instant the bus has ever been charged. The primary MMC holds charge too — discharge it as well.

#### First light / tuning / test — BASE

1. **Dry bridge test, no bus, no primary current path closed.** ⚠ **Physically disconnect the bus (don't just trust "variac at zero") — a mis-phased gate can still shoot-through on logic-level supply and cook devices.** Confirm clean, dead-time-correct gate drive on the scope across one IGBT pair. No shoot-through.
2. **Lowest variac, shortest burst, slowest rate.** Bring the variac up from 0 with the discharge stick removed *only* once you're clear. Watch bus current on the variac's meter / a clamp. ☠ **The instant the variac leaves zero, the bus is live and stays live after shutdown. One hand behind your back, body clear, every time.**
3. **Find resonance / tune the primary tap.** With current feedback engaged the bridge will *seek* resonance; tune by **moving the primary tap** until primary current peaks for a given bus voltage and streamers grow longest. The tank is "tuned" when the primary's series-resonant `f` matches the secondary's `f` you logged in step 1. ⚠ **Tune at low power; raise power only once the tune is set. Make tap changes with the machine OFF and the bus discharged — never reach over an energized primary or secondary.** ☠ **This is the step where streamers first appear and people lean in to look — RF burns are painless going in. Keep your whole body outside the strike radius, and anyone with a pacemaker/implant must already be out of the room.**
4. **Watch the OCD trip.** Deliberately verify OCD latches by setting a slightly-too-long burst at low bus — confirm it cuts the bridge. **If OCD does not trip on demand, stop. Fix it before raising power.**
5. **Ramp gently.** Increase bus voltage, then burst length, then rate — one variable at a time, watching IGBT case temperature and primary current peak. ⚠ **As run-time and streamer length climb, so do ozone (respiratory), UV (eyes), and noise (hearing) — ventilate, wear eye/ear protection, keep runs short.** ☠ **Never exceed your IGBTs' rated peak current; that is exactly the moment a brick lets go.**
6. **Measure and log:** secondary `f`, primary peak current (CT trace), burst length, rate, bus voltage, longest streamer. That table is your Tier-A record.

**What you've proven (BASE):** that two tuned circuits, driven at their common resonant frequency by a current-fed IGBT bridge under OCD protection, produce controllable feet-long streamers whose pitch you set with the interrupter. **Tier A — Measured** (frequency, current, burst, length all on instruments).

---

### ⚡ DECKED-OUT — the design we level it up to

Everything BASE is, made bigger, faster, safer-under-stress, and *polyphonic*. This is the instrument a keeper plays.

**Target spec:** ~50–90 cm secondary, ~18–30" toroid, 4–8 ft streamers, **phase-lead-compensated** bridge, **brick** IGBT modules, real low-inductance bus bank, fiber-optic everything, polyphonic MIDI front-end, and full telemetry to Jarvis. **Bus options: full-wave off 240 V (~340 V) or doubler — confirm your exact bus before choosing device and cap voltage.**

#### BOM — DECKED-OUT

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| IGBT half-bridge bricks | 1200 V, ≥300–600 A modules (e.g. CM300/CM600 "Powerex," Semikron SKM) | 2 | $120–300 | Two half-bridge bricks = full bridge. 1200 V gives margin over a ~340 V bus + turn-off transients. Massive surface area for cooling. |
| Brick baseplate heatsink + fans | finned aluminum, forced air (or water block) | 1 | $80 | Bricks dump real heat under MIDI. |
| Driver | UD2.7C / DRSSTC-II-class driver with **phase-lead** network + OCD + UVLO | 1 | $50 | Phase-lead pre-fires gates to beat propagation delay at high current. |
| Phase-lead trim | adjustable RC / delay-line on the feedback path | 1 | $10 | ⚠ Tuned on the scope; mis-set phase-lead = hard switching = dead bricks. |
| Bus capacitor bank | **≥450 V** (exceeding your actual peak bus with margin), multiple snap-in electrolytics → ~4000–10000 µF, **low-ESR**, + film bank; balancing resistors if series-stacked | bank | $120 | ☠ **Enormous stored energy.** Treat this bank like a charged car battery that bites at lightspeed. |
| Bus discharge relay + bleeder | auto-bleed contactor + 10 kΩ/50 W + indicator lamp | 1 | $30 | ⚠ Lamp/auto-bleed **can fail.** Lamp OUT is a *hint*, not proof — **always verify with a meter and a manual stick.** |
| Bridge rectifier + soft-start | 1200 V / ≥50 A + NTC/relay inrush limiter | 1 | $25 | Inrush into a big bank trips breakers / welds contacts without soft-start. |
| Primary MMC | 942C 0.15 µF 2 kV ×many, series-parallel to target ~0.2–0.4 µF @ ≥6 kV **and rated for peak ripple current** | ~30–60 | $120 | Higher voltage + current rating; bleeders across the MMC. |
| Feedback CT + OCD CT | ferrite, robust, with clamp diodes; **separate cores**; OCD threshold-set to brick peak current | 2 | $15 | OCD trip well under brick `I_C,peak`. |
| Secondary | acrylic ~6" OD × ~70–90 cm, AWG 30–34, ~1000–1500 turns, varnished | 1 | $50 | Bigger resonator, higher `Q`. |
| Toroid topload | spun aluminum / ducting, 18–30", smooth | 1 | $80 | Big smooth toroid raises breakout, lengthens streamers. |
| Primary | 3/8" copper tube, saucer, 8–12 turns, **strike rail** + tap | 1 | $60 | Strike rail protects the primary from streamer hits. |
| Fiber-optic link | TX/RX fiber pair (e.g. HFBR series) interrupter↔driver | 1 set | $25 | ☠ **Galvanic isolation between the controller (you touch it) and the live bridge.** |
| Polyphonic MIDI controller | STM32 / Teensy "polyphonic DRSSTC" interrupter firmware | 1 | $25 | Multiple notes = multiple interleaved burst trains; needs duty-cycle limiting. |
| Telemetry / logging µC | logs `f`, `I_peak`, bus V, burst, temp → Jarvis | 1 | $20 | Tier-A data out to the constellation. |
| RF ground system | multiple bonded rods + wide copper strap | 1 | $60 | ☠ Separate, low-inductance, dedicated. |
| Mains safety | fused/breakered inlet + **GFCI/RCD** + contactor | 1 | $30 | ⚠ Protect the feed; faults are lethal. |
| Faraday'd control desk / kill switch | big red mushroom E-stop + contactor on the mains | 1 | $40 | ⚠ One slap kills the whole machine. |

**Tools needed (DECKED-OUT):** everything from BASE, plus a **high-voltage differential probe** and a **Rogowski/clamp current probe** rated for hundreds of amps, an isolated scope or isolation strategy you trust, IR thermometer, MIDI source, and a logging host for Jarvis.

#### Build steps — DECKED-OUT

1. **Do all of BASE first, on a working coil.** The decked-out path is a *retrofit of competence*, not a from-scratch shortcut.
2. **Mount the bricks** on a serious heatsink, busbar the DC link with **minimum loop area** (laminated busbar or tight parallel plates) — bus inductance is what spikes voltage across the bricks at turn-off. ⚠ **High bus inductance + high current = over-voltage transient = dead 1200 V bricks. The brick tabs/baseplates can be live — verify the isolation rating of every module before you trust the baseplate.**
3. **Build the bus bank with soft-start.** Inrush limiter (NTC then bypass relay) before the bank. ☠ **This bank stores enough energy to be lethal for minutes after shutdown — the auto-bleed + lamp + a manual discharge stick are all required, not redundant. The bleeder can open and leave the bank fully charged with the lamp dark; the meter is the only truth.**
4. **Install phase-lead.** Set the lead network so gate drive *leads* the primary current enough to compensate switching delay at full current. ⚠ **Set this on the scope at progressively higher current — wrong phase-lead causes hard switching and detonates bricks; this is the single most expensive mistake on this rung.**
5. **OCD set to the brick's safe peak**, verified to latch on demand at low power *before* anything else.
6. **Fiber-optic the interrupter.** Controller TX → driver RX over fiber. ☠ **No copper between the thing your hands touch and the live bridge — verify there is genuinely no conductive path before first pulse.**
7. **Strike rail + grounded primary shield** so streamer strikes don't punch into the primary or the bridge.
8. **Polyphonic MIDI firmware** with **hard duty-cycle and burst-length clamps** in software *and* OCD in hardware. ⚠ **Polyphony stacks bursts — without a duty limiter you cook the bricks or melt the secondary while playing a chord.**
9. **Telemetry tap** to the logging µC → Jarvis.

> ☠ **Reminder to the forgetful human:** the bigger the machine, the longer the bus stays lethal and the farther the streamer reaches. At 4–8 ft, the arc can ground through *you* from across the bench. Keep your whole body outside the strike radius, every time, no exceptions, no "just a quick test."

#### First light / tuning / test — DECKED-OUT

1. **Bridge dry-test, phase-lead at minimum, bus physically disconnected.** Confirm gating, dead-time, no shoot-through.
2. **Soft-start + low variac, shortest burst, slowest rate.** Bring the bank up slowly; watch inrush. ☠ **Bank is lethal the instant it charges and for minutes after.**
3. **Tune the primary tap to the secondary `f`** (same method as BASE) at low power with current feedback seeking resonance. **Tap changes only with the machine off and the bus + MMC discharged.** ⚠ **Streamers appear here — RF burns are painless; stay outside the strike radius.** ☠ **Anyone with a pacemaker/implant is already out of the room.**
4. **Dial phase-lead at rising current**, scope on gate vs. primary current, until switching stays soft as current climbs. **Stop and back off at the first sign of hard switching.**
5. **Verify OCD trips** on a deliberately-too-long burst at low bus.
6. **Ramp bus, burst, rate, polyphony — one at a time**, logging temp and peak current at each step. ⚠ **Ozone/UV/noise rise with run-time — ventilate, eyes, ears.**
7. **Play it.** MIDI in, listen, log the note↔interrupter-frequency relationship.

**What you've proven (DECKED-OUT):** clean, phase-compensated, current-fed dual resonance at brick scale — multi-foot polyphonic streamers whose every parameter is measured and logged. **Tier A — Measured.**

---

## HAZARD TABLE — L3

| Hazard | Why it can hurt/kill you | Mitigation |
|---|---|---|
| ☠ Charged bus bank | ~165–675 V DC (depends on rectifier topology) at tens–hundreds of joules; stops the heart; **stays charged after unplug** | Bleeder + auto-bleed relay + indicator lamp; **manual discharge stick across the bus, verified with a meter, before hands enter**; one-hand rule |
| ☠ Live IGBT/brick tab | The metal tab is the collector at ~bus potential | Insulate/isolate every tab; verify heatsink bonding; never assume the sink is safe |
| ☠ Primary tank ring-up | Tank/MMC voltage >1 kV, peak current hundreds–thousands of A | MMC bleeders; never touch the primary energized; discharge MMC on shutdown; strike rail; insulated tools only |
| ☠ Secondary RF terminal | Hundreds of kV RF at the topload/streamer | Stay outside strike radius; RF ground established; never draw arcs to yourself |
| ⚠ RF burns | Painless entry, deep necrotic damage; you won't feel the warning | No body part within streamer reach; no metal jewelry; treat the whole topload zone as hot |
| ☠ Exploding IGBT/brick | Shoot-through or over-current detonates silicon, sprays shrapnel | Correct GDT phasing, OCD verified, phase-lead set on scope, enclosure/face protection |
| ⚠ Mains shock / inrush | 120/240 V wiring, big-bank inrush welds contacts/trips breakers | Soft-start, fused mains, E-stop contactor, GFCI/RCD on the bench feed |
| ⚠ RF on mains ground | RF travels the green wire into every outlet, frying electronics & creating shock paths | **Separate dedicated RF ground rod**, never bonded to mains safety ground for the RF return |
| ⚠ Ozone / UV / noise | Streamers make ozone (respiratory), UV (eyes), and loud reports (hearing) | Ventilate; eye/ear protection; limit run time |
| ☠ Pacemaker/implant disruption | Strong near-field RF can disrupt implanted devices — can be fatal | **Anyone with a pacemaker, ICD, pump, or implant stays well clear of the room** |
| ⚠ Fire / arc-over | Hot bridge, streamer strikes to flammables | Clear the bench, no flammables, extinguisher rated for electrical fire nearby |

---

## PRE-FLIGHT CHECKLIST (before power) — blunt, for the forgetful

- [ ] Am I alone? **If yes, stop.** A second person who can hit the E-stop and call for help is present.
- [ ] Bus discharge stick is **in reach** and the bleeder/auto-bleed verified working with a meter.
- [ ] I know my actual bus voltage (rectifier topology confirmed) and my cap/device ratings exceed it.
- [ ] OCD has been **tripped on demand** at low power this session — confirmed it latches.
- [ ] GDT phasing / gate drive confirmed clean on the scope, no shoot-through.
- [ ] (Decked-out) Phase-lead set at the last-used current; **not** cranked up blind.
- [ ] Primary tap set with the machine OFF and bus discharged; secondary `f` and target tune logged.
- [ ] RF ground strapped to its **own rod**, NOT to mains safety ground.
- [ ] Interrupter set to **shortest burst, slowest rate, lowest bus** for first pulse.
- [ ] Variac at **zero.** Soft-start armed.
- [ ] Fiber-optic isolation in place and proven (no copper from controller to live bridge).
- [ ] Strike radius clear — no body part, phone, scope lead, or pet within streamer reach.
- [ ] No flammables; ozone ventilation on; eyes and ears protected.
- [ ] **Anyone with a pacemaker/implant is out of the room.**
- [ ] Jewelry, rings, watch, lanyard removed. One hand stays free.
- [ ] GFCI/RCD and E-stop tested this session.

## SHUTDOWN / SAFE CHECKLIST (after power) — do it every single time

- [ ] Interrupter OFF first, then bus down via variac to zero, then mains OFF / E-stop.
- [ ] Wait for the auto-bleed lamp to go dark **and** count it down — do not trust the lamp alone.
- [ ] **Clip the manual discharge stick across the bus. Watch the meter read 0 V.** Leave it clipped.
- [ ] Short and ground the **primary MMC** with the stick — film caps hold charge too.
- [ ] Ground the secondary/topload to its RF ground before touching it.
- [ ] Wait, then **re-check both bus and MMC with the meter** — caps can recover a surface/dielectric-soak charge after the first discharge.
- [ ] One hand behind your back until everything reads zero, twice, on a meter you trust.
- [ ] Log this run: `f`, primary `I_peak`, burst, rate, bus V, max streamer, brick temp. (Tier-A, → the Loom / Jarvis.)
- [ ] Power down the scope/probes last; cool down anything warm with the fan.

> ⚠ **Reminder to the forgetful human:** "I only ran it for two seconds" does **not** drain a bus bank. The capacitor does not know how long you ran it — it only knows how much charge it holds. **Discharge stick. Meter. Zero. Every time. Then re-check.**

---

## Climb from here

This rung is the Resonance organ at full voice, and it does not stand alone:

- **Up the ladder → L4 (Magnifier / Extra Coil, the Wardenclyffe homage).** The DRSSTC becomes the *driver* for a third, free-standing extra coil. The phase-lead, OCD, and current feedback you mastered here are exactly what a magnifier driver needs. L3 is the engine; L4 is the cathedral you point it at.
- **→ The Loom (Tier-A data).** Every logged run — `f`, primary peak current, burst length, bus voltage, streamer length, brick temperature — is **hard, self-generated Tier-A measurement**, the first the repo produces rather than ingests. Feed the run table to the heartbeat so the engine holds your own electrical truth beside the world's.
- **→ Pyramid Temples (cymatics).** A polyphonic DRSSTC is a *sound source*. Drive a **Chladni plate** from its note (or, more safely, from the same MIDI/signal that drives the interrupter) and photograph the standing-wave figures. Frequency in, geometry out — the bridge from this organ to the sacred-geometry work.
- **→ Jarvis (control & logging).** The interrupter wants a brain: MIDI-in, software duty/burst clamps that back up the hardware OCD, safe ramp sequencing, and telemetry logging to the archive. For a keeper who plays lyre, guitar, bass, and speed drums, the DRSSTC is one more instrument — played, recorded, *and measured*.
- **Schumann, honestly.** This machine runs at tens of kHz; the Earth–ionosphere cavity rings at ~7.83 Hz. Playing "Earth's note" on a coil is a **Tier-C correspondence, not a Tier-A fact.** The honest way to touch 7.83 Hz is the separate Schumann-detector build, not this one. Do not let a beautiful machine talk you into a claim it can't measure.

---

## Reconcile with the book (Tier B)

The BASE track above is written from **general, public DRSSTC engineering** (the OneTesla / UD2-class driver lineage, standard MMC and brick practice, current-feedback + OCD + interrupter as the canonical safe trio). It is deliberately **generic and flagged for reconciliation** with Tilbury's *Ultimate Tesla Coil Design and Construction Guide* (Tier B) once the keeper's copy is readable — at which point check, specifically:

- the book's recommended secondary aspect ratio / turns-per-inch and `Q` targets,
- its primary-to-secondary coupling coefficient `k` guidance for DRSSTCs,
- its tank-cap value selection method (resonant vs. larger-than-resonant "LC" choice) and the resulting current,
- its OCD threshold and phase-lead setup procedure,
- its bus topology / voltage and bus-cap selection (so this guide's bus-voltage and rating figures are checked against the book's numbers),
- and its bus-energy and bring-up safety procedure, against the one above.

Nothing in this guide is taken from that book — it has **not** been read here. When the Tier-B source is in hand, treat any disagreement as the book winning on engineering specifics and this guide winning on nothing; update the numbers and remove this flag.

> *Build the spark before the tower. Measure the note before you claim the song. And on this rung above all others: assume every capacitor is charged, and prove it isn't — twice — before you trust your hands to it.*
