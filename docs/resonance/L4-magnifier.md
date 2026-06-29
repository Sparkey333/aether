# L4 — The Magnifier / Extra Coil

> *The tower in miniature. Build the spark before the tower; measure the note before you claim the song.*

> ## ☠ DANGER BANNER — READ BEFORE YOU TOUCH ANYTHING ☠
>
> **This rung can kill you, and it can kill you twice.** You are running a full Tesla-coil **driver** (an L1 spark-gap coil or an L3 DRSSTC — both already in the **lethal** class) **and** you are adding a second, free-standing, fully-energized **extra coil** that throws its own high-voltage streamers. Two hot resonators on one bench. Two things that can arc to you. Two charge stores that stay deadly after the power is off.
>
> - ☠ **Lethal HV** at both the driver's secondary topload **and** the extra coil's top terminal.
> - ☠ **Lethal stored charge** in the driver's tank cap / MMC or DC bus — *holds a killing charge minutes after shutdown, even on a spark-gap coil that has no "bus."*
> - ⚠ **RF burns** — deep, painless at the instant, slow to heal — from streamers you "barely" touched.
> - ⚠ **The extra coil is a surprise.** People respect the big loud driver and forget the quiet third coil is live and throwing its own streamers. Do not be that person.
>
> **No glove, mat, or "HV-rated" anything makes a live Tesla coil safe to touch.** The only real protection is: power off, discharge, verify dead, one hand behind your back, and distance. Gloves are for handling *de-energized* hardware — never trust them against a hot node.
>
> **Safety class: ☠☠ — inherits the driver's danger and adds a second hot resonator.** This is **not** a starter project. If you have not built and safely operated **L0 → L1 (or L3)** with your own hands, stop here and climb the ladder in order.

---

## What this rung is / what it proves

L4 is Tesla's **magnifying transmitter** brought to the bench: a **three-coil** system where a complete coil (primary + secondary = the *driver*) feeds energy into a separate, free-standing **extra coil** — a third resonator, usually elevated, tuned to the system — to push voltage higher and cleaner at the top terminal. It is the literal architecture of the **Wardenclyffe** tower, scaled down to where you can measure it.

What it proves, **honestly**: that **resonant coupling moves real power across a gap** — the same physics as your L0 bulb, as Qi charging, as WiTricity across a room. That is **Tier A**: measured, on a meter, repeatable. What it does **not** prove — and what we refuse to let it borrow authority for — is efficient, global, free wireless power. **That is Tier D**, the frontier, kept and labeled, not yet earned. The whole point of this rung is to watch near-field transfer **fall off with distance** and to write down the numbers anyway. *Honesty is the experiment.*

**Provenance tier of this rung:** **A** for measured near-field transfer; **D** for any claim of efficient power at distance. Architecture and history are **B** (Tesla US1,119,732; the *Colorado Springs Notes*); the aether-as-medium framing is **C**.

---

## TWO PARALLEL TRACKS

The two tracks answer the same question — *how much power crosses the gap, and how fast does it die with distance?* — at two scales. Build BASE first. It is the honest, cheap, do-it-this-weekend version. DECKED-OUT makes the extra coil real, adds ground coupling, and instruments the fall-off so you have **Tier-A data**, not a vibe.

| | 🔰 BASE | ⚡ DECKED-OUT |
|---|---|---|
| Driver | your existing L1 SGTC (or L0 for a totally-safe dry run) | your existing L3 DRSSTC (or a stout L1) |
| Extra coil | small free-standing helical resonator on PVC | large extra coil on acrylic/HDPE form, raised on a strain insulator |
| Goal | *see* transfer; *watch* it fall off | *measure* transfer vs. distance; try ground coupling |
| Instrumentation | a single CFL/neon "field probe" + a ruler | RF field probe + scope, receiver coil + rectifier + DMM, logged |
| Claim earned | A (qualitative near-field transfer) | A (quantified P vs. d curve), D (anything global) |

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

> **Generic build — reconcile with Tilbury (Tier B) once the source is readable.** Specs below are from public, general Tesla-coil engineering, not from any book. Verify dimensions, wire gauge, and tune against your driver and against Tilbury's recommended practice when Drive access is granted. **Measured Tier-A numbers on your own bench override every spec here, his or ours.**

**The idea:** Stand a small, separately-tuned helical coil (the *extra coil*) a short distance from your existing driver's topload. Tune it to the driver's frequency. Use a humble fluorescent/neon bulb as a **field probe** and map, by eye and ruler, how brightly it lights at increasing distances. You will *see* the resonant transfer, and you will *see* it die fast. That dying is the deliverable.

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Existing driver | a working, tuned **L1 SGTC** (example floor: 9 kV / 30 mA NST class) | 1 | (already built) | Modest average power, but **the instantaneous HV is lethal** — treat it as a killer regardless of the nameplate. Or use an **L0 slayer** for a fully low-energy dry run — strongly recommended for your first try |
| Extra-coil form | PVC pipe, 50–75 mm (2–3 in) OD, ~300–450 mm long | 1 | $5–10 | Clean, dry, deburred. Schedule-40 is fine |
| Magnet wire | enamelled copper, ~26–30 AWG | ~150 m | $15–25 | Aim ~600–1000 close-wound turns; single layer |
| Top terminal | small metal sphere or a smooth nut/ball, 25–50 mm | 1 | $2–8 | Smooth = fewer premature breakouts |
| Base / stand | wood or acrylic disc + dowel feet | 1 | $5 | **Non-conductive.** No metal in the base |
| Field-probe bulb | CFL or small straight fluorescent tube, or a neon lamp | 1–2 | $2–6 | The "is power crossing the gap?" sensor — held on an **insulated handle**, never bare-handed near the terminal |
| Ruler / tape | 1 m, non-metallic preferred | 1 | $3 | Distance is your independent variable |
| RF ground wire | heavy copper, short run to a dedicated ground rod | as needed | $10 | **Separate from mains ground** (see hazard table) |

#### Tools — BASE
- Cordless drill or a hand-wind jig (lathe-of-the-poor) for an even, close-wound coil
- Heat-shrink / kapton tape; fine sandpaper or a wire-strip tool (or a thermal stripper) to **scrape/sand** the enamel at the taps — *do not score it off with a knife blade; a knife nicks the copper and seeds a hidden break*
- Multimeter (continuity + AC volts) and, if you have one, an **oscilloscope** (with a proper high-V / differential probe) to read the driver's frequency — ☠ *never put a plain ×1 probe on a hot node*
- Insulated **chicken stick** (a properly grounded discharge rod, with a bleed resistor in series, on a long insulating handle) for discharging caps and terminals
- Insulated gloves and an insulating mat **for handling de-energized hardware only** — ☠ *they are NOT rated for this coil's HV/RF and will not save you from a live node*
- Safety glasses, ear protection, a fire extinguisher (CO₂ or dry-chem) within reach

#### Build steps — BASE
1. **Wind the extra coil.** Close-wind ~600–1000 turns of magnet wire in a single, even layer on the PVC form. Anchor both ends through small drilled holes; leave ~150 mm pigtails. ⚠ *Reminder to the forgetful human: deburr the holes and **scrape**, don't knife, the enamel at any tap — a sharp edge or a nicked strand makes a hidden inter-turn short that ruins tuning and runs hot.*
2. **Seal it (optional but nice).** A couple of light coats of polyurethane lock the turns and resist moisture. Let it cure fully — *a damp coil arcs to itself.*
3. **Fit the top terminal** to the upper pigtail; smooth all solder joints. Sharp points break out early and steal the show before you've measured anything.
4. **Mount on the non-conductive stand.** ⚠ **No metal anywhere in the base or stand.** Metal near the bottom of a resonator detunes it and becomes an unexpected arc target near your hand.
5. **Lower pigtail to RF ground.** Run the bottom of the extra coil to your **dedicated RF ground rod** — ☠ **not** to the wall outlet's ground (see hazard table; RF on mains ground is how you energize things you never meant to). ⚠ *Reminder: do this wiring with the driver OFF, unplugged, and discharged. Any capacitor in the system is assumed charged until you've shorted it with the chicken stick — and you work with one hand behind your back even when you're "sure" it's dead.*
6. **Place it.** Stand the extra coil **base-to-base** with the driver, top terminals roughly level, starting ~10–20 cm of clear air between the driver topload and the extra coil. ⚠ *Keep yourself, your face, and anyone watching well outside the longest streamer the driver can throw — assume it reaches farther than you think.*
7. **Do the BASE dry-run with the L0 slayer first if at all possible.** Same geometry, no lethal energy. Confirm the bulb lights and dims with distance. Only then graduate to the L1 driver.

#### First-light / tuning / test — BASE
1. **Pre-flight checklist (below) — do it, don't skim it.** ☠ *Anyone with a pacemaker, ICD, insulin pump, cochlear implant, or any implanted device leaves the room and the doorway now — strong RF can disrupt these devices. No exceptions.*
2. **Bring the driver up gently.** L1 on a **variac AND a series current limiter** (a ballast / light-bulb limiter / inrush limiter) — *a variac alone only lowers the voltage; it does not limit current.* If you have no variac, use short, deliberate runs at lowest workable energy. ⚠ *One hand behind your back. Never reach across the bench while it's hot. Move your phone, watch, hearing aids, and car key fob well away — the field will scramble or fry them.* ⚠ *Crack a window or run ventilation; arcs make ozone and you'll smell it before it bothers your lungs.*
3. **Tune the extra coil's note to the driver's note (this is frequency, not gap).** You want both singing the same frequency `f = 1/(2π√(LC))`. With the driver running at low power, change the **extra coil's resonance** — add/remove a few turns, move a tap, or trim the top-terminal size — until its top terminal produces the **longest, brightest streamer**. *That peak is the resonant match.* ☠ *Reminder: kill power, unplug, and discharge both the tank cap/MMC and the terminal with the chicken stick BEFORE you touch a tap or change a turn. People die adjusting a "quick tap" on a coil they forgot was still charged.* **Gap distance is a separate knob:** it sets how tightly the two coils couple (and how much transfers), not the frequency — tune the note first, then optimize the gap.
4. **Map the fall-off — the actual experiment.** Hold the **CFL/neon probe on its insulated handle** a fixed small distance from the extra coil's terminal. Note brightness. Now step the **driver↔extra-coil gap** outward in fixed increments (e.g. 5 cm steps) and record, at each step, how bright the probe glows and whether the extra coil still breaks out. ⚠ *RF burns are deep and feel painless at the instant — never let a streamer touch skin, and never hold the probe by the metal end. Use the insulated chicken stick or a long dry wooden dowel to move things — never your hand near the hot zone.*
5. **You will see it die.** Brightness collapses far faster than distance grows. Write that down. **That curve is the truth of this rung.** ⚠ *Don't chase a brighter glow by creeping your hand in — the field that lights the bulb will burn you the same way.*

#### What you've proven — BASE
- **Resonant near-field coupling is real and transfers usable power across a gap.** A separate, untouched coil lit a bulb. **Tier A** (you saw it, repeatably, and it scaled with tune).
- **The transfer falls off steeply with distance.** **Tier A** (qualitative, by eye/ruler).
- You have **not** shown efficient power at distance, and you must not imply it. **Tier D** stays Tier D.

---

### ⚡ DECKED-OUT — the design we level it up to

**The idea:** A real, larger **extra coil** raised on an insulator, fed by your strongest driver, with **calibrated instrumentation** so the fall-off becomes a **numbered curve** (power vs. distance), plus a **ground-coupling experiment** to test — and honestly bound — the Wardenclyffe idea that the Earth itself can be a return path. Everything gets logged. This is where L4 produces **Tier-A data the Loom can hold.**

#### BOM — DECKED-OUT

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Existing driver | a working **L3 DRSSTC** (or stout L1 w/ RSG) | 1 | (already built) | The hotter the driver, the more careful you are |
| Extra-coil form | acrylic or HDPE tube, 100–160 mm OD, 600–900 mm long | 1 | $40–90 | Low-loss dielectric beats PVC at higher power |
| Magnet wire | enamelled copper, 22–26 AWG | ~400 m | $60–120 | ~800–1500 turns; even single layer is gospel |
| Top terminal | spun-metal toroid or large smooth sphere, 150–250 mm | 1 | $30–80 | Sized so it breaks out near the system's tuned point |
| Strain insulator / standoff | ceramic or HDPE, rated for the voltage | 1 | $15–40 | Raises the extra coil; keeps the base field clean |
| RF field probe | small loop antenna + diode detector, or commercial RF probe | 1 | $20–60 | Reads *relative* field strength into the scope |
| Receiver coil | small tuned pickup coil + fast rectifier + smoothing cap + known load resistor | 1 set | $15–40 | Turns "transferred power" into a **measurable DC** across a known load (a *relative/bounded* power estimate unless you calibrate it) |
| Oscilloscope | ≥ 100 MHz, 10×/high-V probe, **HV differential probe** for direct reads | 1 | (lab) | ☠ Never put a plain ×1 probe on a hot node |
| Current transformer | clip-on CT for primary/feed current logging | 1 | $20–50 | Pair input current with output to estimate efficiency |
| Dedicated ground system | proper RF ground rod(s), heavy strap, optional counterpoise/radial wires | 1 | $30–80 | For the ground-coupling experiment |
| Microcontroller + ADC | for logging f / current / probe voltage (the **Jarvis** hook) | 1 | $15–40 | Timestamps + CSV to the archive |
| Variac **+ separate current limiter** | for bring-up | 1 set | $80–150 | ☠ Mandatory for a big driver. **A variac is not a current limiter** — pair it with a ballast/light-bulb/inrush limiter. Never cold-start |

#### Tools — DECKED-OUT
- Lathe or geared coil-winder for clean high-turn-count winding
- Function generator + the scope to **bench-characterize the extra coil's self-resonance** *before* it ever sees the driver (find f with a few volts, not with lightning)
- Soldering station, heat gun, heavy crimps for the ground strap
- Insulated chicken stick (grounded discharge rod, bleed resistor in series, long insulating handle), mat, and gloves **for de-energized handling only** — ☠ *no PPE makes a live node safe; de-energize and discharge first*
- **A second person who can hit the kill switch** and knows the discharge ritual
- Logging laptop for the microcontroller stream
- The full PPE kit: glasses, ear pro, and distance

#### Build steps — DECKED-OUT
1. **Wind the large extra coil** on the low-loss form: even, single-layer, ~800–1500 turns. Anchor and seal. ⚠ *A bigger coil stores and releases more energy — every "small" mistake here is a bigger burn.*
2. **Bench-find its self-resonance with a signal generator + scope** before any driver. Drive it with a few volts, sweep frequency, find the peak. **Now you know f without risking your life.** *(This is `f = 1/(2π√(LC))` measured directly — the Tier-A anchor.)*
3. **Mount it elevated** on the strain insulator/standoff, top terminal fitted and polished. ⚠ Keep the elevated terminal **well clear of the ceiling, sprinklers, and anything grounded** — an arc to a fire sprinkler ends your evening and maybe your building.
4. **Build the receiver instrument:** the small tuned pickup coil → fast diode rectifier → smoothing cap → **known load resistor** → DMM/ADC. This converts "power crossed the gap" into **volts across a known resistance** — i.e. a *bounded* power estimate (the diode + cap read a peak-ish, quasi-DC value; calibrate against a known source before calling it true watts). *This is the thing that turns a light show into data.*
5. **Wire the logging chain:** clip the CT on the driver feed; route the RF field probe and the receiver DC into the microcontroller ADC; stream timestamped CSV. ⚠ *Galvanically isolate your logging electronics or the RF will murder them — opto-isolate, fiber, or battery-power the logger, and keep it out of the near field.*
6. **Establish the dedicated RF ground / counterpoise** for the ground-coupling test: heavy strap to ground rod(s), optionally several radial wires laid out as a counterpoise. ☠ **This ground is RF-only and separate from mains safety ground** — bonded wrong, you put RF onto every grounded surface in the room. Verify the bond and the separation before power.
7. **Set the geometry:** driver and extra coil base-aligned, terminals near level, on a non-conductive bench, with a measured, marked distance scale on the bench so every run is repeatable.

#### First-light / tuning / test — DECKED-OUT
1. **Pre-flight checklist — every item, out loud, with your second person.** ☠ *No one with a pacemaker, ICD, pump, cochlear implant, or any implant in the room or doorway — confirm it before power.*
2. **Bring the driver up on the variac + current limiter, slowly.** Watch input current on the CT. ☠ *Never cold-start a big driver. A variac only sets voltage — the series current limiter is what saves the hardware (and you) on a fault. If anything smells, buzzes wrong, or arcs where it shouldn't — kill it.* ⚠ *Phones, watches, hearing aids, key fobs, and your second person's devices: away from the bench. Ventilate for ozone.*
3. **Tune to the system resonance (frequency first).** With low power, adjust the driver's primary tap (and/or trim the extra coil) until primary, secondary, and extra coil all agree on **one frequency** — confirm against the f you measured on the bench in step 2. ☠ *Kill power, unplug, and discharge the tank/MMC/bus and both terminals with the chicken stick before touching any tap.* Only after the note is matched do you **optimize the gap** for best transfer — *the gap sets coupling, not frequency.* *Three coils on one note is the magnifier working.*
4. **Run the fall-off experiment — quantified.** At each marked distance: log input current (CT), RF field-probe voltage (scope/ADC), and **receiver DC across the known load** (→ bounded watts). Step the distance out in fixed increments. **Repeat each point** so you have error bars, not anecdotes. ⚠ *Move things with the insulated stick between runs; never reach into the hot zone for a "quick adjustment."*
5. **Plot P_received vs. distance.** It will fall off steeply — near-field reactive coupling drops fast, and the exact exponent depends on your geometry and coupling regime, so report what you *measured* rather than a textbook law. **Estimate efficiency** = P_received / P_input at each distance (label it an estimate; it depends on your receiver calibration). *Be brutal in the write-up: report the small numbers proudly.*
6. **Ground-coupling experiment (the Wardenclyffe test, honestly).** Tie the extra coil's base to the dedicated ground/counterpoise. Place the **receiver also referenced to that ground** at distance. See whether ground return improves transfer at range. ⚠☠ *Now the earth around your setup can carry RF and step-potential. Keep bystanders, pets, and bare feet well clear of the ground field. Do not run this in wet grass or on a wet floor. Bond to the RF ground only — never to mains ground.*
7. **Log everything to the archive** via the microcontroller (the Jarvis hook). Each run: f, input current, probe field, receiver watts, distance, ground config, timestamp.

#### What you've proven — DECKED-OUT
- **A numbered power-vs-distance curve** for resonant near-field transfer, with an **efficiency estimate**. **Tier A** — this is real, self-generated measurement, the kind the Loom can hold.
- **Whether (and how little) a ground/counterpoise return helps at range.** **Tier A** for whatever you measured, in your specific bounded setup.
- **You have still not demonstrated efficient, global, free wireless power.** Ground coupling helping a little across a bench is *not* Wardenclyffe working. **Tier D stays Tier D** — and now you have the honest data that shows exactly how far the dream still has to go. *That gap is the frontier, not a failure.*

---

## HAZARD TABLE — L4

| Hazard | Why it can hurt/kill you | Mitigation |
|---|---|---|
| ☠ Lethal HV at **two** terminals | Driver topload *and* extra-coil terminal are both live; people forget the second one | Treat both as lethal at all times; rope off both; never reach between them |
| ☠ Stored charge after shutdown | Tank cap / MMC / DC bus holds a killing charge minutes after power off — *true even on an SGTC that has no "bus"* | **Assume every capacitor is charged.** Bleeder resistors where applicable; **always** short with a grounded chicken stick (bleed resistor in series) before touching anything; verify with a meter |
| ☠ Current across the heart | Two hands on two energized points = path through the chest | **One hand behind your back**, always, near anything hot |
| ⚠ RF burns | Deep, slow-healing; **feel painless** at the instant of contact | Never let streamers touch skin; move things with the insulated stick, not fingers; hold probes by the insulated handle only |
| ⚠ False security from PPE | "HV gloves"/mats are **not** rated for this coil's HV/RF and breed recklessness | De-energize + discharge + verify first; PPE is for handling **dead** hardware, never as permission to touch a live node |
| ☠ RF on mains ground | Bonding RF ground to wall ground energizes grounded surfaces room-wide | **Dedicated RF ground rod, separate from mains.** Verify the bond and the separation |
| ⚠☠ Ground step-potential | Counterpoise/ground-coupling puts RF into the earth around you | Keep bystanders/pets/bare feet clear of the ground field; never on wet ground |
| ⚠ Fried electronics / your logger | Dense RF couples into anything nearby | Isolate/opto/battery the logger; keep sensitive gear, phones, watches, hearing aids, key fobs away |
| ☠ Pacemaker / implant interference | Strong RF/EM fields can disrupt implanted devices | **Anyone with a pacemaker, ICD, pump, cochlear implant, or any implant stays well clear — no exceptions** |
| ⚠ Eyes & ears | UV from arcs; loud crack from spark gaps | Safety glasses; ear protection; don't stare at the arc |
| ⚠ Ozone / fumes | Arcs make ozone and can scorch insulation | Ventilate; don't run long sessions in a sealed room |
| ⚠ Fire | Stray arc to anything flammable or to sprinklers | Clear flammables; keep the extra coil's terminal clear of the ceiling; extinguisher within reach |
| ⚠ Working alone / tired | No one to cut power or call help when it goes wrong | **Never alone, never tired.** Second person knows the kill switch and the discharge ritual |

---

## PRE-FLIGHT CHECKLIST (before power)

*Blunt, for the forgetful human. Do not skip a line because you "did it last time."*

- [ ] I have **built and safely run L0 → L1 (or L3)** before this. I did not skip rungs.
- [ ] **A second person is here**, knows where the **kill switch / unplug point** is, and knows the **discharge ritual**.
- [ ] The driver comes up on a **variac AND a series current limiter** — no cold start. (*A variac alone does not limit current.*)
- [ ] **Both** the driver topload and the **extra-coil terminal** are roped/marked as lethal.
- [ ] **RF ground is dedicated and separate** from mains ground. I verified the bond and the separation.
- [ ] **No metal** in the extra coil's base/stand. Nothing grounded near the bottom of either coil.
- [ ] Terminals are **clear of ceiling, sprinklers, walls, and anything grounded or flammable**.
- [ ] **Bleeder resistors** present across tank cap / bus where applicable; I know how I'll discharge them, and I will short manually regardless.
- [ ] **Chicken stick** (grounded discharge rod, bleed resistor in series, insulated handle) is within arm's reach.
- [ ] **PPE on:** safety glasses, ear protection. Gloves/mat for de-energized handling — *not* trusted against a live node.
- [ ] **Logger/electronics isolated** (opto/fiber/battery). Phones, watch, hearing aids, key fob, and loose gear moved away.
- [ ] **No one with a pacemaker/implant** in the room or doorway.
- [ ] **Children, pets, and onlookers behind the rope** before power — and they know the quiet extra coil is live too.
- [ ] Distance markings on the bench are set; I know my run plan.
- [ ] Ventilation is on (ozone). Fire extinguisher within reach. Exit path clear.
- [ ] I am **not tired, not rushing, not alone.**

## SHUTDOWN / SAFE CHECKLIST (after power)

- [ ] **Cut power at the switch, then unplug.** Confirm the driver is off, not just idle.
- [ ] **Wait, then discharge.** Assume the tank cap / MMC / bus is **still charged** — *an SGTC has no DC bus but its tank cap still holds a lethal charge.* Use the grounded chicken stick to short it — **even though you're "sure" it's dead.**
- [ ] **Discharge the extra coil's terminal** to the same ground reference with the stick too — it can hold residual charge.
- [ ] **Verify with a meter** before any bare-hand contact. *Assume charged until measured dead.* One hand behind your back until verified.
- [ ] Leave bleeders to do their job; don't trust them alone — short manually.
- [ ] Power down and disconnect the logger; save the CSV to the archive.
- [ ] Coil down the ground strap/counterpoise so no one trips on a "live-looking" wire.
- [ ] Log the run: f, currents, receiver watts, distances, ground config, anomalies.
- [ ] **One last look:** nothing warm that shouldn't be, no smell of scorched enamel.
- [ ] Lock out the bench if others share the space. The next person doesn't know it was hot.

---

## Climb from here

- **Down the ladder:** L4 *is* the top of the coil ladder — it sits on **L1 (SGTC)** or **L3 (DRSSTC)** as its driver. If L4 misbehaves, the fix is almost always back down the rungs: a clean, well-tuned driver makes a clean magnifier. The honest near-field transfer you see here is the same physics as your very first **L0** bulb — this rung is L0's truth, grown up and measured.
- **→ The Loom (Tier-A data):** the power-vs-distance curve, the efficiency numbers, the measured resonant frequencies — these are **self-generated Tier-A measurements**, the first hard data the repo makes instead of ingests. Feed them in tagged, dated, and bounded. *Never let the Tier-D dream borrow their authority.*
- **→ Pyramid Temples (cymatics):** a magnifier driven from a musical L3 is a tuned tone source; pipe that tone (or a clean signal generator) to a **Chladni plate** and photograph the standing-wave figures. Frequency in, geometry out — the bridge from this organ to the sacred-geometry work.
- **→ Jarvis (control & logging):** the logging chain here *is* the Jarvis hook — microcontroller + ADC streaming f / current / field / received power to the archive, with safe ramp-up and over-current watch. For a keeper who already plays instruments, the magnifier is one more, played and recorded and **measured**.
- **→ Schumann, honestly:** L4 runs at tens-to-hundreds of kHz — nowhere near the Earth–ionosphere cavity's **7.83 Hz**. "Tuning the magnifier to the Earth's note" is a **Tier-C correspondence, not a Tier-A fact.** Touching 7.83 Hz for real is a *separate, quiet* build (large loop antenna + low-noise amp + ADC). Keep the two from contaminating each other.
- **The endgame, honestly:** Wardenclyffe was L4 at planetary scale — the whole Earth as one resonant circuit. We keep that dream **on the map and labeled Tier-D.** What you measured today is real and near-field; what you measured today is also *not* the tower working. Both statements are true, and keeping them apart is the whole discipline. *To honor the vision, refuse to fool yourself about it.*

---

## Reconcile with the book (Tier B)

This entire guide is built from **general, public Tesla-coil engineering** — no text, dimension, tuning recipe, or safety wording is drawn from **Tilbury's *Ultimate Tesla Coil Design and Construction Guide***, which has **not** been read. Tilbury is the project's primary **Tier-B** source for the coil ladder; the deepest reconciliation work belongs on **L1 (SGTC)**, the rung his book is built around. For L4 specifically, once Drive access is granted, reconcile and cite: (1) his treatment of magnifiers / extra coils, if any, and the **driver↔extra-coil coupling and tune** method he prefers; (2) extra-coil **form material, length-to-diameter ratio, and turn count** vs. the generic ranges used above; (3) **top-terminal sizing** relative to system resonance; (4) his **grounding** practice for multi-coil systems; and (5) any of his **safety doctrine** that sharpens the hazard table here. Until then: **treat every spec on this rung as generic and verify against the book and against your own bench measurements.** The measured numbers (Tier A) always win over any spec, his or ours.

> Build the spark before the tower. Measure the note before you claim the song.

See [[resonance]] · [[provenance]] · [[aether]] · [[aetherius]].
