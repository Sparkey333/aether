# L1 — The Spark-Gap Tesla Coil (SGTC)

> *Two circuits singing the same note, until the air gives up and turns to lightning. This is the first rung that can kill you. Treat it that way every single time.*

---

> # ☠ DANGER BANNER — READ BEFORE YOU TOUCH ANYTHING ☠
>
> **This is the first LETHAL build on the ladder. Safety class: ☠ LETHAL.**
>
> - The transformer output (a neon-sign transformer at ~9 kV, or worse) **will stop your heart.** It does not take a "big" supply: tens of milliamps across the chest is lethal, and every transformer here delivers far more than that. ☠
> - The **tank capacitor stores a lethal charge after power is off** — it can hold a killing jolt for minutes to hours. A "dead" coil is not a safe coil. ☠
> - The streamers are **hot enough to set fire** to you and the room, and RF burns go deep and feel **painless until later.** ⚠
> - **Pacemaker / implanted-defibrillator / pump / cochlear-implant people must stay well clear** — the RF field can interfere with the device and stop or shock a heart. This includes YOU if you have one: do not build or operate this coil. ☠
> - **Never run this alone.** If it gets you, you cannot save yourself. You need a second person who is NOT in the strike/field zone, who knows where the breaker is, and who knows how to cut power and call for help **without grabbing you while you are still in contact.** ☠
> - **Ozone and nitrogen oxides** are produced by every spark. They are toxic in a closed room. Ventilate. ⚠
>
> If any line above feels like nagging, that is exactly the point. The coil does not care how experienced you feel. **Reminder to the forgetful human: the cap is charged. Assume it. Always.**

---

## What this rung is / what it proves

The Spark-Gap Tesla Coil is the canonical disruptive coil — a neon-sign transformer charges a tank capacitor; a spark gap fires and slams that energy into a tuned primary; the primary rings and pumps a loosely-coupled secondary that is tuned to the *same* resonant frequency. Voltage climbs on the secondary turn after turn (the **resonant rise**) until the topload can no longer hold it and the air breaks down into streamers you would honestly call lightning.

What it **proves** is the resonant rise at lethal scale, and the craft of **tuning** — moving the primary tap until the two circuits agree on a frequency and the spark length maxes out. Everything you can claim here — resonant frequency `f = 1/(2π√(LC))`, measured tune point, measured spark length — is **Tier A (Measured).** The legend that this is the road to free global power is kept on the map, but it is **Tier D**, and this rung does not touch it.

**Provenance tier of this rung's claims: A (Measured).**

`f = 1/(2π√(LC))` — this is the Tier-A anchor under every decision below. When in doubt, return to it.

---

## TWO PARALLEL TRACKS

Build the BASE first. Earn the DECKED-OUT version. They are the same physics; the decked-out track just moves more power and demands more discipline, which means more ways to die.

| | 🔰 BASE | ⚡ DECKED-OUT |
|---|---|---|
| Transformer | NST 9 kV / 30 mA (~270 VA) | Bigger NST (12 kV / 60 mA) **or** ballasted MOT bank **or** pole-pig + variac |
| Tank cap | MMC, ~10–20 nF film | MMC sized to RSG, more strings |
| Spark gap | Static multi-gap, fan-cooled | **Rotary spark gap (RSG)** |
| Primary | Flat spiral, tapped | Larger flat/helical, heavy tube, tapped |
| Secondary | ~1000 turns on 4" PVC | ~1000–1400 turns on larger form |
| Topload | Dryer-duct + pie-pan toroid | Larger spun/ducted toroid |
| Grounding | Dedicated RF ground rod | RF ground + interlocks + bonded frame |
| Spark length | ~10–25 cm streamers | ~30–90 cm+ streamers |
| Cost | ~$150–250 | ~$300–700+ |
| Danger | ☠ Lethal | ☠☠ Lethal, with more energy and more failure modes |

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

> **Tier-B flag:** this BASE track is the simplest canonical SGTC — the kind a book's intro project covers. It is written **generically from public Tesla-coil engineering knowledge. Reconcile every spec here against Tilbury's *Ultimate Tesla Coil Design and Construction Guide* (Tier B) once that source is readable** (see the Reconcile section at the end). Nothing here is taken from that book; the author has not read it. Until reconciled, treat these numbers as starting points, not gospel — verify on your own scope (Tier A).

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Neon-sign transformer (NST) | 9 kV, 30 mA, **non-GFCI / non-PFC / non-"electronic"** iron-core type | 1 | $60–120 | Used is fine **if** you test it. PFC/GFCI/electronic NSTs fight the tank and/or trip — get an old iron-core one. ☠ Output is instantly lethal; the "30 mA" rating is the supply's limit, NOT a safe current — it is roughly 10× the dose that can fibrillate a heart. |
| MMC film capacitors | **Pulse-rated polypropylene**, 0.15 µF, **2 kV DC** each (e.g. CDE 942C / WIMA FKP-class) | see math below (~14–28) | $1–3 ea | Build as series strings for voltage, paralleled for value. **String voltage rating must be ≥2× the NST peak.** **Never electrolytic. Never ceramic. Never general-purpose DC film** — only pulse-rated caps survive the tank's current. |
| Bleeder resistors (per cap) | 10 MΩ, ≥1 W (HV-rated), across **each** cap | = cap qty | $0.10 ea | Drains the MMC when off and equalizes string voltage. ☠ Without these the MMC stays charged and can kill — and the string can over-volt one cap and cascade. |
| Spark-gap electrodes | Copper pipe / tungsten / brass, 6–8 segments | 1 set | $10–20 | Multiple small gaps in series = a "static gap." |
| Muffin fan | 120 mm, mains or 12 V | 1 | $5–10 | Quenches the gap (cools/extinguishes the arc between fires). ⚠ Mount it so its wiring never crosses the HV path. |
| Secondary form | Schedule-40 PVC, 4" dia × ~24" | 1 | $10–15 | Dry, clean. Bake/seal before winding. |
| Magnet wire | Enamelled copper, ~24 AWG, ~1000 turns | ~1 lb | $20–30 | Tight single-layer winding, no gaps, no overlaps. |
| Primary conductor | Bare/insulated copper tube ¼" or 8–10 AWG wire | ~25 ft | $20–40 | Flat spiral, ~12–15 turns, **tapped** (alligator-clip take-off). |
| Toroid topload | Aluminium dryer duct + two aluminium pie pans | 1 | $10–20 | Smooth = higher breakout voltage; the classic cheap toroid. |
| Terry filter parts | Safety spark gap + 2× ~1 kΩ HV resistors + 2× ~1 nF doorknob caps (≥15 kV) | 1 set | $20–40 | Protects the NST from RF kickback. ⚠ Protects the transformer, NOT you. |
| RF ground rod | 6–8 ft copper-clad rod + heavy strap | 1 | $20–30 | **Separate from house/mains ground.** ☠ Using mains safety ground as RF ground can energize your house wiring and any appliance grounded to it. |
| Wood/HDPE base & standoffs | Non-conductive, dry | — | $10–20 | No metal frame around the cap if you can help it. |
| Insulated HV wire | Silicone, ≥20 kV rated | a few ft | $10 | NST → terry filter → gap → tank. ⚠ Underrated wire will track and arc through to your hand. |

> **MMC sizing math (do not skip — under-spec'd caps explode):**
> A 9 kV RMS NST has a peak of ≈ 9 kV × √2 ≈ **12.7 kV**. A ≥2× margin means each **series string** must be rated for **≥25 kV**. With 2 kV caps that is **at least 13 caps in series** (13 × 2 kV = 26 kV). A 13-cap string of 0.15 µF caps has a value of 0.15 µF ÷ 13 ≈ **0.0115 µF ≈ 11.5 nF** — already in the ~10–20 nF window. To raise capacitance toward ~20 nF, **parallel a second identical 13-cap string** (≈ 23 nF). So a real BASE MMC is roughly **14 caps (one string) to 26–28 caps (two strings)** — NOT a random 30–60. ⚠ A string built too short over-volts every cap and they fail short, dumping the bank; build the string for voltage FIRST, then parallel for value. Bleeder on **every** cap is what keeps the series voltage shared evenly.

#### Tools — BASE

- Variac **or** a current-limiting setup for bring-up (a series incandescent-bulb limiter at minimum). **Never cold-start a coil at full mains.** ☠
- Oscilloscope **or** an RF-frequency counter with a pickup loop (to measure resonance); a calibrated cheap one is fine for tuning. ⚠ Measure RF **inductively** with a loop — never by touching a probe to the live coil.
- DMM (with HV probe if you have one — but **do not** poke 9 kV with a stock DMM; a standard meter and its leads are rated for a fraction of that and will flash over into your hand). ☠
- A long **grounding stick** (a stout insulated rod with a grounded clip lead on the end) — your dedicated tool for discharging the cap. ☠ Build this **before** you build the coil.
- Soldering iron, drill, hot-glue/epoxy, hand tools, fire extinguisher (CO₂ or dry-chem — **never water on an energized electrical fire**) within reach. ⚠

#### Build steps — BASE

1. **Build the grounding/discharge stick first.** Insulated handle, a metal hook on the end wired through a 100–1000 Ω resistor to a heavy clip lead, clip to RF ground. This is the tool you'll use to make every "dead" circuit actually dead. ☠ *Reminder to the forgetful human: you will skip this step because you're excited. Do not. It is the tool that keeps the cap from killing you.*
2. **Drive the RF ground rod** 6–8 ft into earth, outside, away from gas/water lines and away from any buried mains/utility, **separate from your mains ground.** Run a short, heavy strap to where the coil will sit. ☠ Do **not** bond this to house wiring. ⚠ Call before you dig — striking a buried utility line is its own way to die.
3. **Wind the secondary.** Clean and dry the PVC, seal it, then wind ~1000 turns of 24 AWG in a single tight layer — no overlaps, no gaps. Anchor both ends. Seal the finished winding with 2–3 coats of polyurethane. A bottom turn goes to the RF ground; the top turn goes up to the topload. ⚠ A nicked enamel or a gap in the winding becomes a flashover point that punches through the coil and toward you in operation.
4. **Build the topload toroid** from dryer duct around the pie pans; smooth all seams (sharp points = premature breakout = shorter sparks). Mount it on a standoff above the secondary, electrically connected to the secondary's top turn. ⚠ Once powered, the topload is the highest-voltage point on the machine and the thing streamers leap *from* toward any ground — including you.
5. **Build the MMC tank cap.** Lay out caps as series strings sized for **≥2× the NST peak** (see the MMC sizing math above — for 9 kV that is ≥13 × 2 kV caps per string), then parallel strings to reach ~10–20 nF. **Solder a 10 MΩ bleeder across every single cap.** ☠ A cap without a bleeder is a loaded gun that loads itself — and an unbleeded series string also lets one cap hog the voltage and fail. Mount on HDPE/wood, label the terminals.
6. **Build the static spark gap.** Mount 6–8 short copper segments in a line so the arc jumps gap-to-gap-to-gap; aim the muffin fan across them. More small series gaps quench better than one big gap. ⚠ The gap emits intense UV, ozone, loud noise, and flying hot particles — never set it by eye up close while live; set gaps with power off.
7. **Build the terry filter** between the NST and the tank: series HV resistors, the small doorknob caps to ground, and a **safety gap** set to fire **before** the NST's insulation does. ⚠ This protects the transformer; it does **not** protect you, and a filter cap holds charge too — discharge it with the stick like any other cap. ☠
8. **Wind the flat primary** as a spiral of ~12–15 turns, leaving a take-off you can clip an alligator lead to **any** turn (your tune control). Keep it physically clear of the secondary base; the coupling is meant to be *loose*. ⚠ Too tight a coupling causes racing arcs up the secondary that destroy it and can flash to you.
9. **Wire the power section, UNPLUGGED and with the cap discharged and shorted:** mains → variac/current-limiter → NST primary. NST secondary → terry filter → spark gap **and** tank cap (gap and cap together form the primary tank with the primary coil). ☠ Every HV connection insulated, no sharp bare ends near you or the floor. *Reminder: confirm the plug is physically OUT before your hands enter the HV section — not just "switched off."*
10. **Walk away and re-check, sober.** Trace the whole HV path with the schematic in hand. Confirm bleeders present, ground separate, terry safety gap set, nothing within arc range of you. *Reminder: the mistakes that kill you are the ones you were sure you didn't make.*

#### First-light / tuning / test — BASE

> **Before power: run the PRE-FLIGHT CHECKLIST below. Every time. No exceptions.** ☠

1. **Measure secondary resonance with the coil OFF, UNPOWERED, and the cap discharged.** Use the scope/frequency counter with a pickup loop, or drive the secondary base with a **low-voltage** signal generator and find the peak. Record `f_secondary` (typically ~150–400 kHz for this size). This is a **Tier-A** measurement — log it. ⚠ This is a no-mains step on purpose; do it before anything lethal is energized.
2. **Estimate the primary tap** that makes the primary tank resonate at the **same** `f`. Start with the tap that calculation suggests, but plan to move it.
3. **Bring up on the variac/current-limiter — never full mains cold.** Inch the voltage up. Listen and watch from a safe distance, outside strike range. The gap should fire with a sharp crack and you should see breakout at the topload. ☠ Hands off; one-hand rule even on the variac; second person present and clear of the field; eye and ear protection on.
4. **Tune by moving the primary tap** — and for every move: **power off, UNPLUG, discharge the cap with your grounding stick (twice), leave it shorted, THEN** move the clip one turn, restore, re-run. When primary and secondary agree, streamers grow noticeably longer. Walk the tap until spark length **peaks**. ☠ *Reminder: discharge the cap with the stick before every tap move. The cap is charged. Assume it. The clip lead you are about to touch is bonded to that cap.*
5. **Optional bulb test** — hold a fluorescent tube on a **long insulated rod**, well back from the streamers and outside strike range, and watch it light untouched: near-field resonant coupling, the same effect as L0, now at scale. ⚠ Do not let your body, the tube, or the rod enter streamer reach — a streamer will jump to the nearest ground, and that includes you.
6. **Record:** `f_secondary`, best tap position, supply voltage, longest reliable streamer (cm). Photograph it — **from outside strike range, never reaching in while live.** ⚠
7. **Shut down on the SHUTDOWN/SAFE CHECKLIST below before you touch anything.** ☠

**What you've proven (Tier A):** that two `LC` circuits, tuned to the same `f = 1/(2π√(LC))`, produce a measurable resonant rise and a measurable spark length, and that **you can tune** the system to maximize it. Frequency, tune point, and spark length are all instrument-measurable. **Tier A.** (The free-energy dream is **not** touched here — that remains Tier D.)

---

### ⚡ DECKED-OUT — the design we level it up to

> Same physics, more power, more discipline. **Every extra watt you add is an extra way to die.** The decked-out track is for someone who built and tuned the BASE coil first and respected it. ☠☠

#### BOM — DECKED-OUT

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Transformer (choose one) | **(a)** NST 12 kV / 60 mA · **(b)** ballasted MOT bank · **(c)** pole-pig + variac | 1 | $120 / $40 / $150–400 | See the transformer warnings below. ☠☠ Pole-pig is the deep end — current-limited and ballasted only. |
| Ballast (for MOT/pig) | High-current inductive ballast or welder | 1 | $50–150 | ☠ A pole-pig or MOT bank **without** current-limiting ballast can draw a fault arc that kills, vaporizes metal, and starts fires. Mandatory, not optional. |
| Variac | 10–20 A, for controlled bring-up | 1 | $80–200 | **Non-negotiable for MOT/pig.** Never cold-start. ⚠ A variac is NOT an isolation transformer — it does not float you off mains; treat its output as live and lethal. ☠ |
| MMC tank cap | Sized for RSG break-rate; re-derive value AND voltage for the new transformer; more series caps per string for higher voltage | re-derive | $1–3 ea | A 12 kV NST peaks at ≈17 kV → ≥34 kV string → ≥17 × 2 kV caps per string; a pole-pig at 14.4 kV peaks at ≈20 kV → even longer strings. Bleeder on **every** cap. ☠ |
| Rotary spark gap (RSG) | Insulated disc (G10/phenolic), tungsten electrodes, isolated/synchronous motor | 1 | $80–200 | The headline upgrade — higher, controllable break-rate. ☠ A spinning disc throwing a thrown electrode is shrapnel that can blind or kill. Polycarbonate guard mandatory. |
| RSG motor | Synchronous (for sync gap) or stout induction motor | 1 | $40–120 | **Guard it.** Balance the disc. ⚠ Eye protection always near a spinning RSG; never near its plane of rotation while live. |
| Primary | Heavier copper tube (⅜"), more turns, tapped | 1 | $40–80 | More current = heavier conductor. |
| Secondary | ~1000–1400 turns on 6" form | 1 | $40–70 | Bigger form, same craft. |
| Toroid | Larger spun-aluminium or multi-duct toroid | 1 | $40–150 | Bigger toroid = higher breakout voltage = longer, cleaner streamers. |
| Heavy RF ground | Multiple bonded rods + wide strap | 1 | $50–80 | More power demands a real RF ground. ☠ Still separate from mains. |
| Interlocks | Mushroom E-stop, contactor, door/cage interlock, "live" beacon | 1 set | $40–100 | The coil should **not** energize unless the cage is closed and the E-stop is armed. ☠ Interlocks do NOT discharge the cap — the stick still rules. |
| Terry filter (uprated) | Higher-voltage safety gap + RC for the bigger transformer | 1 set | $40–80 | Re-rate for the new transformer. |
| Faraday/standoff cage or barrier | Grounded mesh barrier keeping people out of strike range | 1 | $50–150 | Streamers will reach for the nearest ground — including you. ⚠ Bond the cage to RF ground, not mains. |

> **Transformer reality check (☠☠):**
> - **NST 12 kV / 60 mA** — the safe-ish upgrade. More power, same handling rules. Re-size the MMC for 12 kV (longer strings — see BOM).
> - **Ballasted MOT bank** — microwave-oven transformers are cheap and brutal. They are **current-unlimited by nature** and have killed people. **Only** with proper inductive ballast, only series-stacked for voltage with care (each MOT case and one secondary lead are live — stacking floats cases to thousands of volts; insulate and cage them), only with a variac. ☠☠
> - **Pole-pig (distribution transformer)** — serious-tier. Genuinely deadly fault energy — enough to weld tools to your hand and arc-flash burn you. **Mandatory:** current-limiting ballast, variac bring-up, hard interlocks, an E-stop you can hit from the floor without reaching toward the coil, and experience. If reading "fault arc" or "arc flash" doesn't make you cautious, you are not ready for a pig. ☠☠

#### Tools — DECKED-OUT

- Everything in the BASE list, plus:
- Variac sized to the transformer (mandatory for MOT/pig).
- A proper **HV probe** for the scope (rated well above your supply) if you intend to measure HV directly — otherwise measure RF inductively, never by contact. ☠
- Tachometer/strobe to set RSG break-rate (and to balance the disc).
- Polycarbonate face shield + a fixed RSG guard. ⚠

#### Build steps — DECKED-OUT

1. **Build the cage/barrier and interlocks first.** Wire the contactor so the coil **cannot energize** unless: the cage door is closed, the E-stop is armed, and a "LIVE" beacon is wired to the output side. ☠ Build the guardrails before the thing that needs them. ⚠ Reminder: an interlock that *removes power* still leaves the cap charged — it is not a discharge.
2. **Build and *guard* the rotary spark gap.** Balance the disc, mount tungsten electrodes, enclose the spinning disc in a polycarbonate guard. ⚠ *Reminder to the forgetful human: a stationary RSG looks harmless. At speed it is a saw blade that can throw a metal electrode across the room and through a person. Never stand in its plane, never run it un-guarded, eyes protected.*
3. **Choose and prepare the transformer.** For NST: as BASE (re-size MMC for 12 kV). For MOT bank: build the ballast, series-stack carefully with insulated/caged floating cases, plan variac bring-up. For pole-pig: ballast + variac + interlocks are not optional. ☠☠
4. **Re-size the MMC** for the new transformer (longer series strings for the higher peak voltage — see BOM math) AND the RSG's break-rate (higher break-rate changes the tank/charging requirement). Bleeder on **every** cap, again. ☠
5. **Wind the larger secondary and build the bigger toroid** — same craft as BASE, more turns / larger form / smoother toroid for longer streamers.
6. **Wind the heavier primary** with room to tap; expect to re-tune from scratch.
7. **Install the heavy RF ground** (multiple bonded rods, wide strap) — still **separate** from mains ground; bond the cage to it. ☠
8. **Wire it all through the contactor and E-stop,** UNPLUGGED with the cap discharged and shorted, then re-check sober with the schematic. The variac is your only legitimate way to bring it up. ☠
9. **Dry-run the interlocks with the HV side disconnected:** confirm the contactor refuses to close with the cage open or the E-stop pressed. Prove the safety system works **before** there is anything lethal to protect you from. ⚠

#### First-light / tuning / test — DECKED-OUT

> **PRE-FLIGHT CHECKLIST first. Cage closed. E-stop within reach (without reaching toward the coil). Second person present and clear of the field. Variac at zero. Eye/ear protection on.** ☠☠

1. **Measure secondary `f` unpowered** (as BASE — low-voltage, no mains). Log it (Tier A).
2. **Set the RSG break-rate** to a sane starting value, disc balanced and guarded, motor up to speed **before** HV. ⚠ Never bring the motor up to speed with the guard open.
3. **Bring up slowly on the variac** from zero, watching current draw. Listen for the gap firing cleanly; watch breakout. Back off at the first sign of trouble (flashover, racing sparks up the secondary, smell of insulation, ground-fault buzz). ☠ Hit the E-stop, don't investigate live.
4. **Tune the primary tap** for peak spark length — **power off, UNPLUG, RSG fully stopped, cap discharged with the grounding stick (twice) and left shorted, every time** you move the tap. ☠ The decked-out cap stores more energy than the BASE cap. The rule is the same; the consequences are larger.
5. **Optionally tune the RSG break-rate** for the cleanest, longest streamers once the tap is set — power off and cap discharged before any adjustment near the gap. ⚠
6. **Record:** `f_secondary`, tap, break-rate, supply voltage/current, longest reliable streamer. Photograph from outside strike range. Feed the numbers to the archive (see Climb).
7. **Shut down on the SHUTDOWN/SAFE CHECKLIST.** ☠☠

**What you've proven (Tier A):** a higher-power resonant rise with a controllable break-rate; measured `f`, tune point, break-rate, and a longer measured spark length. **Tier A.** You have **not** proven anything about wireless power at distance — that stays Tier D, honestly labeled.

---

## HAZARD TABLE — L1

| Hazard | Why it can hurt/kill you | Mitigation |
|---|---|---|
| ☠ Transformer HV (NST/MOT/pig) | 9–14 kV across the heart is lethal instantly; even ~10–30 mA can fibrillate | One-hand rule; unplug before touching; never contact live HV; insulate everything; interlocks; never alone |
| ☠ Charged tank capacitor | Stores a lethal jolt **after** power off, for minutes+ | Bleeder on every cap; **discharge with grounding stick (twice) before every touch, leave shorted**; assume it's charged |
| ☠ Terry-filter / doorknob caps | Smaller, but still hold HV after shutdown | Bleed/discharge them with the stick too |
| ☠☠ MOT/pole-pig fault energy | Current-unlimited supplies can sustain a killing fault arc, arc-flash burn, & start fires | Inductive ballast + variac mandatory; current-limit; E-stop; experience first |
| ☠ Variac is not isolation | Output is mains-referenced and lethal; gives no shock protection | Treat variac output as live; one-hand rule; GFCI on the wall feed where possible |
| ⚠ RF burns | Deep, painless-at-first burns from streamers / hot HV | Never let streamers hit you; barrier/cage; stay outside strike range |
| ⚠ Fire | Streamers and arcs ignite materials | Clear flammables; CO₂/dry-chem extinguisher in reach (never water on live electrics); ventilate |
| ⚠ Ozone + NOx gases | Toxic gases from every spark; harmful in enclosed rooms | Ventilate well; limit run time; don't breathe the plume |
| ☠ Implant interference | RF can disrupt/stop pacemakers, ICDs, pumps, cochlear implants | **Keep implant/pacemaker people well clear, no exceptions; don't operate if YOU have one** |
| ⚠ Eyes/ears | UV/bright arc, loud crack (esp. RSG), ozone | UV-rated eye protection, hearing protection, ventilation |
| ⚠ RSG shrapnel | Spinning disc can throw an electrode at lethal speed | Balanced disc, polycarbonate guard, face shield, never stand in its plane |
| ☠ Wrong ground | RF on mains ground can energize house wiring & grounded appliances | Dedicated RF ground rod, **separate** from mains; call-before-you-dig |
| ⚠ Electronics damage | Dense RF fries phones, hearing aids, hearing-aid wearers, nearby gear | Keep electronics and people with hearing aids far back; isolate measurement gear |

---

## PRE-FLIGHT CHECKLIST (before power) — for the forgetful human

- [ ] **Second person present**, OUTSIDE the field/strike zone, knows where the breaker/E-stop is, knows how to cut power and call for help **without grabbing you while you're in contact.** ☠
- [ ] **No one with a pacemaker/ICD/implant/pump/cochlear implant in the area — including you.** ☠
- [ ] **Grounding/discharge stick built, tested, and within arm's reach.** ☠
- [ ] **RF ground rod connected, separate from mains ground.** ☠
- [ ] **Bleeder resistor confirmed across every MMC cap** (and the terry-filter caps). ☠
- [ ] **MMC string voltage rating confirmed ≥2× the transformer peak** (math done, not guessed). ⚠
- [ ] Terry filter / safety gap in place and set.
- [ ] **Variac/current-limiter at zero; bring-up plan is "slowly from zero," not cold-start.** ☠
- [ ] No flammables nearby; fire extinguisher (CO₂/dry-chem, NOT water) in reach.
- [ ] Eye and ear protection on; area ventilated for ozone/NOx.
- [ ] (Decked-out) Cage closed, interlocks proven, E-stop armed and reachable without leaning toward the coil, RSG guarded and balanced and up to speed. ☠☠
- [ ] Nothing — including you — within streamer strike range of the topload.
- [ ] You are **sober, rested, and not rushing.** *(The single most-skipped item that gets people hurt.)*

## SHUTDOWN / SAFE CHECKLIST (after power) — do not skip because "it's off"

- [ ] **Power off at the breaker / E-stop. Variac back to zero. UNPLUG from the wall** (switched-off is not unplugged). ☠
- [ ] **Assume the tank capacitor is still charged.** It is. ☠
- [ ] **Discharge the cap with the grounding stick** — touch each terminal to ground through the resistor, then again with a direct short, then leave a shorting clip across it. Do the terry-filter caps too. ☠
- [ ] Wait, then discharge **again** (caps can "recover" a surface charge after the first dump). ☠
- [ ] Confirm zero volts with a meter **only after** you've discharged by stick — never lead with the meter. ☠
- [ ] Leave the cap **shorted** while the coil is stored/idle.
- [ ] RSG fully stopped before reaching anywhere near it. ⚠
- [ ] Let things cool; check for hot spots / scorching before walking away. Vent the ozone before others enter. ⚠
- [ ] Log the run (frequency, tap, spark length) while it's fresh.

> **Reminder to the forgetful human:** the most dangerous moment is *after* a good run, when you're relaxed and proud and reach in to "just move the tap." That is when the charged cap gets you. **Unplug. Stick first. Twice. Every time.**

---

## Climb from here

This rung is the hinge of the whole Resonance ladder. Below it is **L0 — the Slayer Exciter** (the seed: wireless light in your hand, low energy, the rung you actually start on). Above it the same idea gets cleaner and more controllable: **L2 — the SSTC** (replace the gap with a transistor bridge; the streamer becomes a loudspeaker), then **L3 — the DRSSTC** (both circuits resonant; the apex musical coil), then **L4 — the Magnifier / extra coil** (the Wardenclyffe homage; honest near-field power transfer, never a claim of global free power).

And it plugs into the constellation:

- **→ The Loom (Tier-A data).** Every measured `f_secondary`, tune/tap point, break-rate, and spark length you log here is **hard, self-generated Tier-A data** — the first measurements the repo makes itself instead of ingesting from the world. Feed them to the archive so they live beside the satellite and ephemeris grids, under the same provenance law.
- **→ Pyramid Temples (cymatics).** L1's roar isn't musical yet, but once you climb to L2/L3 the coil becomes a sound source — drive its tone (or a plain signal generator) into a **Chladni plate** and photograph the standing-wave figures. Frequency in, sacred geometry out.
- **→ Jarvis (control & logging).** The decked-out interlocks, the E-stop, the break-rate, and the run-logging all want a brain. A microcontroller for safe ramp-up, over-current sense, and **logging frequency/current/spark-length to the archive** is the natural next limb — and the on-ramp to the microcontroller-driven interrupters of L2/L3. ⚠ Keep the controller and its wiring outside the HV/RF zone and optically isolated; dense RF will reset or destroy unshielded electronics.
- **Schumann, honestly.** This coil runs at hundreds of kHz; the Earth–ionosphere cavity rings at ~7.83 Hz. "Tuning the coil to Earth's note" is a **Tier-C correspondence, not a Tier-A fact.** Touching 7.83 Hz for real is a *separate* quiet rung (loop antenna + low-noise amp + ADC), not this machine.

---

## Reconcile with the book (Tier B)

> **This entire L1 guide is built from general, public Tesla-coil engineering knowledge. The author has NOT read Tilbury's *Ultimate Tesla Coil Design and Construction Guide* and has reproduced nothing from it.**
>
> Tilbury's book is the Tier-B source that **centers on exactly this rung** — the SGTC is its core project — which makes reconciliation here more important than anywhere else on the ladder. The BASE track above is flagged **"generic — reconcile with Tilbury (Tier B) once the source is readable."**
>
> When Drive access to the keeper's copy is granted, **digest it, do not reproduce it,** and fold its specifics back into this rung as **cited Tier-B notes**, specifically checking these decisions against the book's recommendations:
>
> - **Transformer choice** — its stance on NST vs. MOT vs. pole-pig, and its handling/ballast doctrine.
> - **MMC sizing** — its method for choosing tank capacitance (and any "resonant-size vs. larger-than-resonant / LTR" guidance) versus the generic ~10–20 nF starting point and the ≥2×-peak voltage rule used above.
> - **Static vs. rotary gap** — when it says to move from a static multi-gap to an RSG, and its quenching guidance.
> - **Secondary geometry** — its turns count, form diameter, and aspect-ratio (`h/d`) recommendations versus the generic ~1000 turns on 4–6" PVC used here.
> - **Toroid sizing** — how it relates topload size to breakout voltage and spark length.
> - **Tuning method** — its exact procedure for finding resonance and the tap point.
> - **Its own safety doctrine** — to cross-check (and strengthen, never weaken) the safety marking throughout this guide.
>
> Until then: **treat L1's specific numbers as generic starting points and verify against the book.** Where this guide and Tilbury disagree on a number, the **measured result on your own scope (Tier A) wins** — but the book's reasoning (Tier B) should be recorded beside it. **Note:** safety always reconciles upward — if the book is stricter, adopt the stricter rule; never relax a safety margin to match a book number.

> *Build the spark before the tower. Measure the note before you claim the song.*

See [[resonance]] · [[provenance]] · [[aether]] · [[aetherius]].
