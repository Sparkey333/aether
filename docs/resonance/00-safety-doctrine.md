---
title: The Safety Doctrine (read this first, every time)
slug: 00-safety-doctrine
rung: "00"
order: 0
kind: build
organ: resonance
---

# 00 — The Safety Doctrine
### read this first, every time

> ☠ **DANGER — THESE MACHINES CAN KILL YOU IN ONE HEARTBEAT.** ☠
> A Tesla coil is not a toy that occasionally bites. It is a machine whose
> *normal operation* makes voltages and stored energies that stop hearts, cook
> nerves, and start fires. The capacitor that ran your coil an hour ago can still
> be holding a lethal charge right now, in a dark room, waiting for your hand.
> ☠ **And the mains in your wall — the boring 120/240 V you ignore every day — has
> killed more coilers than any exotic part on this bench.** You do not get to be
> casual here. Read this page before you touch **any** rung — L0, L1, L2, L3, L4,
> or even the quiet S1 detector — and read it **again** every time you forget you
> already read it. You will forget. That is who we are. This page exists for the
> forgetful human being, because the forgetful human being is the one who gets hurt.

This is the master safety doctrine for the entire build ladder of the **Resonance**
organ — [[resonance]] — governed, like everything in this work, by the
[[provenance]] doctrine. The physics is real (Tier A). The danger is real (Tier A).
Treat both with the same honesty.

> **BASE vs DECKED-OUT — a note on this whole ladder.** Throughout the build pages
> you will see a **BASE** track (the simplest canonical version of each rung — the
> kind a book's intro project covers) and a **DECKED-OUT** track (the upgrades).
> ⚠ **Every BASE build on this organ is *generic* — written from public, general
> Tesla-coil engineering knowledge and FLAGGED to be reconciled with Tilbury's
> *Ultimate Tesla Coil Design and Construction Guide* (Tier B) once that source is
> readable.** Where Tilbury (or any qualified source) is stricter on a spec, a
> rating, or a procedure, **the stricter source wins.** This safety page is the
> binding floor under *both* tracks, BASE and DECKED-OUT alike.

---

## Part I — The blunt opening: what kills you here, and how fast

Be clear about the enemy. There is more than one, and they kill differently.

- **☠ The capacitor charge (milliseconds to "you're already dead").** A primary
  tank capacitor or a DC bus bank stores energy that does not care whether the
  machine is on. A charged cap across your chest dumps its whole load through your
  heart in the time it takes the spark to cross your skin. **This is the number-one
  killer of coilers, and it kills *after* shutdown, in the cleanup, when you've
  relaxed.** ☠ **The danger floor is far lower than people assume: stored energy on
  the order of *one joule* delivered across the chest at high voltage can be lethal,
  and standards treat anything above roughly that as a hazard requiring discharge.**
  A coil's tank or bus stores *many times* that. Do not bargain with the number —
  discharge and short, period.
- **☠ The transformer / mains-derived supply (one grab).** A neon-sign transformer
  (NST), a microwave-oven transformer (MOT), or a pole-pig delivers current at
  voltages that arc *to* you and clamp your muscles *on* the conductor. You cannot
  let go. The grip that should save you is the grip that kills you. ☠ **A bare MOT
  is in a class of its own: it has essentially *no* internal current limiting, so it
  will dump as much current as the arc through you will draw. MOTs (and pole-pigs)
  are disproportionately lethal and are not beginner parts.** Mains itself — the
  wall — has killed more people than every exotic part on this list combined.
- **☠ Current across the heart (as little as ~50–100 mA is enough to kill).** It is
  not the volts on the label that stop your heart; it is **current through your
  chest.** As little as **~50–100 milliamps** across the heart for a fraction of a
  second can throw it into fibrillation — and currents well below that (tens of mA)
  can already lock your muscles so you *can't let go*. A path from one hand to the
  other runs straight through the heart. That is why the one-hand rule exists.
- **⚠ RF burns (instant, deep, and they don't hurt at first).** At the
  frequencies a coil runs (tens to hundreds of kHz), the current flows on the skin
  and the **nerves don't always scream.** You can take a deep, slow-to-heal burn
  to the bone and barely flinch in the moment — then discover the damage hours
  later. Painless does not mean safe. **A burn you didn't feel is still a hole in
  you.**
- **⚠ Fire (seconds).** Hot spark gaps, arcing, overheated components, and
  streamers that find something flammable. Coils have burned down benches and
  rooms. Keep a CO₂ or dry-powder extinguisher within arm's reach — ☠ **never water
  or foam on an energized electrical fire; kill power first if you safely can.**
- **⚠ Eyes and ears (cumulative and permanent).** A bright spark gap throws UV like
  a small arc welder — it sunburns your retinas (arc-eye). A running coil is
  genuinely *loud* (a rotary gap or a big DRSSTC can exceed safe noise limits) and
  can damage hearing over a single session.
- **☠ The invisible crowd (slow, and not always you).** Ozone and nitrogen oxides
  from the discharge are toxic to breathe in a closed room. The RF field reaches
  out and **can interfere with or stop a pacemaker, ICD, insulin pump, or other
  implant** — possibly in someone standing in the doorway who never touched
  anything. (Marked ☠ because for an implant wearer this hazard is potentially
  lethal, not merely an injury.)

If you remember nothing else from this section: **the machine that is "off" is the
one that kills you, and the burn that doesn't hurt is the one that's worst.**

---

## Part II — The VOWS

These are not tips. They are vows — the standing oaths of this organ, in the
cadence of the [[aether]] mandate. You say them, you mean them, you keep them
*every single time*, including the time you're tired and it's late and it
"worked fine yesterday."

### ☠ VOW 1 — Assume every capacitor is charged.
Every cap. Always. The dead-looking one. The one you bled last week. The one in a
circuit you "know" is discharged. **Bleed it, short it across with a grounding
stick, leave the short clipped on while you work, then — and only then — trust it.**
A capacitor can self-recharge after a single discharge through dielectric
absorption ("voltage recovery"). One short is not enough for a big cap; short it,
wait, short it again, and clamp it. ⚠ **Then *verify* with a meter rated for the
voltage** — a bleeder resistor can fail open and leave a "safe" cap fully charged.
Measure across the terminals; do not trust that the bleeder did its job.
*Treat the cap as a loaded gun whose safety does not exist.*

### ☠ VOW 2 — One hand behind your back.
Near anything that is or recently was energized at high voltage, **keep one hand
literally behind your back or in your pocket.** The reason is your heart. A
two-hand contact sends current hand-to-hand, straight across your chest. One hand
means the worst case is a path down one arm — survivable far more often. Make it a
physical habit so you do it without thinking, because thinking is exactly what
fails when you're startled. ⚠ **Never wear a wrist ESD/grounding strap near HV** —
an anti-static strap deliberately bonds you to ground and turns a survivable touch
into a lethal hand-to-ground path. ESD straps are for dead logic boards, never for
a live coil.

### ☠ VOW 3 — Never alone. Never tired.
**Work with a second person present who knows where the disconnect is, how to cut
power without becoming a second casualty, and how to call emergency services.**
They are your dead-man switch. And do not run high-energy rungs when you are tired,
rushed, rattled, or impaired — fatigue is when you skip the discharge ritual and
reach in with two hands. If you catch yourself wanting to do "just one more quick
test" alone at 1 a.m., **that is the doctrine telling you to stop.**

### ⚠ VOW 4 — Ground the RF separately.
Give the coil its own **RF ground** — a dedicated rod into the earth — and **bond
the base of the secondary to it.** ☠ **A secondary whose base is left floating, or
grounded only through the mains/driver, will strike *back* down into the primary,
the bridge, or you — keep the secondary base solidly on the RF ground.** Keep the
RF ground **separate from the mains safety (green-wire) ground.** Dumping coil RF
into the building ground pushes voltage onto every grounded thing in the house (and
into the neighbors), can shock someone at a faucet two rooms away, and destroys
electronics. ⚠ **The mains safety ground stays connected and does its job — the RF
ground is *in addition to* it, never a replacement for it.** And ⚠ **never run a
coil without a topload and, where applicable, a grounded strike rail/ring** — a
bare, unloaded secondary terminal throws streamers straight into the primary and
toward you.

### ☠ VOW 5 — Bring it up on a variac / current-limit — and know a variac is NOT isolation.
**Never cold-start a mains-powered coil at full power.** Bring every powered rung
up slowly on a **variac**, behind a **current limiter** (for a switching bridge, a
series incandescent bulb or proper current-limit; for an NST/MOT supply, an
*inductive* ballast — a series light bulb does little to limit an inductive
transformer), or a fused, breakered, fault-protected supply. You are watching for
the fault *before* it becomes a fireball: a shorted IGBT, a mistuned tank, a cap
arcing over. Slow bring-up turns a catastrophic failure into a dim bulb and a
puzzled frown. ☠ **A variac does NOT isolate you from the mains — its output is
electrically tied to the wall. It limits voltage, not lethality. Do not mistake "on
the variac" for "safe to touch."** Always include a **big, obvious, reachable
emergency disconnect** — a kill switch or unplug you can hit without leaning over
the machine.

### ⚠ VOW 6 — Respect the invisible.
You cannot see the worst hazards, so you must *believe in them*:
- **⚠ RF burns feel painless and go deep.** Never let a streamer or a
  high-frequency conductor touch skin. Do not draw arcs to your fingers "to feel
  it."
- **⚠ Ozone and NOₓ are real poisons.** Ventilate. Don't run a coil in a sealed
  room and breathe the sweet metallic smell — that smell is the damage.
- **⚠ EMI wrecks electronics.** Phones, hearing aids, watches, the logging laptop,
  the neighbor's Wi-Fi. Keep sensitive gear far away or shielded.
- **☠ Pacemakers and implants.** A coil's field can disrupt or stop a pacemaker,
  ICD, insulin pump, neurostimulator, or cochlear implant. **Anyone with an
  implant must stay well clear — out of the room, not just out of reach** — and you
  must *ask*, because they may not volunteer it. This vow can protect a bystander
  who never came near the machine.

### ⚠ VOW 7 — Climb the ladder in order.
**L0 → L1 → L2 → L3 → L4.** The slayer exciter (L0) is the only rung a beginner
starts on. Each rung teaches the discipline the next rung assumes you already have.
Skipping rungs — starting on a DRSSTC because the videos look amazing — is one of
the most reliable ways to get badly hurt. Earn the habits on low energy before you
hold lethal energy. (The S1 Schumann detector is low-voltage and can be built any
time, but it does **not** count as a rung of HV experience.)

### ⚠ VOW 8 — Eyes and ears.
**UV-rated eye protection** against arc light (a bright gap is a welding arc),
**hearing protection** against a running coil. Every session. Your retinas and
cochlea do not grow back.

---

## Part III — Per-rung RISK-CLASS table

Every rung carries the vows above. This table names the **dominant** hazard of
each — the one that bites *this* rung hardest — and the **one rule you must not
forget** for it. Mind: a lower class is not "safe," it is *less lethal*.

| Rung | What it is | Risk class | Dominant hazard | The one rule you must not forget |
|---|---|---|---|---|
| **S1** | Schumann detector (loop + amp + ADC) | ⚠ low | Mains-powered bench gear; soldering; it's *not* HV experience | Earth it and isolate it properly — but never mistake "I built S1" for "I can build a coil." |
| **L0** | Slayer exciter (1-transistor self-resonant) | ⚠ lowest of the coils | HV at the topload (don't draw arcs to fingers); transistor runs hot; battery-scale energy | Low energy ≠ no voltage — keep the streamer off your skin, and don't get cocky. |
| **L1** | Spark-gap coil (SGTC) | ☠ lethal | The **NST/MOT output and the charged tank capacitor** — kills after shutdown | Discharge ritual + meter-verify the tank cap, every time, before any hand goes near the primary. |
| **L2** | Solid-state coil (SSTC) | ☠ lethal | **Mains-derived DC bus** + dense RF that fries electronics and burns skin | Bring up on a variac/current-limit; bleed, short, and *meter-verify* the bus is dead before touching the bridge. |
| **L3** | Dual-resonant SSTC (DRSSTC) | ☠☠ most dangerous | **Bus rails + huge stored energy + RF all at once**; failures are violent and expensive | Do not start here. Earn L0→L2 first, and never reach into a bus bank you haven't shorted, clamped, and metered. |
| **L4** | Magnifier / extra coil | ☠☠ inherits driver + adds a 2nd hot resonator | Everything its driver carries, **plus a second free-standing live resonator** that's easy to forget | Two hot circuits means two discharge rituals — treat the extra coil as live until *both* are proven dead. |

---

## Part IV — Reminders to the forgetful human being

You are smart. You are also forgetful, sometimes reckless, and very capable of
talking yourself into "just this once." So we build a **checklist culture** — say
it out loud, point at the thing, do it the same way every time, so the habit
carries you when your attention doesn't. Print these. Tape them to the bench.

### ⚠ PRE-FLIGHT — before you energize anything
Walk it top to bottom. Out loud. Every session.

- [ ] **Second person here?** They know the kill switch and how to call for help. *(☠ VOW 3)*
- [ ] **Anyone with a pacemaker / ICD / implant clear of the room?** You *asked*. *(☠ VOW 6)*
- [ ] **Eyes (UV) and ears on.** *(⚠ VOW 8)*
- [ ] **Grounding stick within reach**, RF ground rod connected, **secondary base bonded to RF ground**, and RF ground **separate** from mains ground (mains safety ground still connected). *(⚠ VOW 4)*
- [ ] **Topload installed; strike rail/ring in place** where the build calls for one — no bare, unloaded secondary terminal. *(⚠ VOW 4)*
- [ ] **Variac / current-limiter in the supply line; emergency disconnect placed and reachable** without leaning over the coil. **(Remember: a variac is not isolation.)** *(☠ VOW 5)*
- [ ] **Bleeder resistors present and connected** across every tank/bus capacitor — and you know they can fail, so you will still meter.
- [ ] **No loose conductors, no jewelry, no rings/watch, no dangling sleeves, dry hands, dry floor**, nothing flammable in the spark zone. **No ESD wrist strap.** *(⚠ VOW 2)*
- [ ] **Fire extinguisher (CO₂ / dry powder) within arm's reach.**
- [ ] **Tune/wiring sane** — primary tap, MMC, gaps, bridge, feedback polarity all checked *while de-energized and discharged*.
- [ ] **One hand rule armed in your head:** the moment it's live, the off hand goes behind your back. *(☠ VOW 2)*

### ⚠ DURING — while it's live
- [ ] **Bring power up slowly on the variac.** Watch the current-limit indicator; a fault shows here first. *(☠ VOW 5)*
- [ ] **Hands stay out.** No adjustments to anything energized. To change a tap, a gap, a cap — **kill power and run the discharge ritual first.** No exceptions for "quick."
- [ ] **One hand behind your back** any time you must be near the machine. *(☠ VOW 2)*
- [ ] **Keep streamers off skin and off anything you care about.** RF burns don't announce themselves. *(⚠ VOW 6)*
- [ ] **Watch for the smell of ozone and the heat of components.** If it stinks, ventilate; if it smokes, kill it.
- [ ] **If anything is wrong — sound, smell, smoke, sparks where they shouldn't be — hit the disconnect first, ask questions after.**

### ⚠ SHUTDOWN / SAFE — the part that actually kills people
The danger does **not** end when you flip the switch. This sequence does. Do it in
order, every time, *especially* when you're done and relieved and want to walk away.

- [ ] **Variac to zero, then power off, then physically unplug / open the disconnect.** "Off" is not "unplugged"; "on the variac at zero" is not "dead." *(☠ VOW 5)*
- [ ] **Wait.** Give bleeders a moment to do their job — but never *trust* that they did.
- [ ] **Run the capacitor-discharge ritual** (below) on **every** tank and bus cap. *(☠ VOW 1)*
- [ ] **Meter every cap to confirm it reads near zero** with a probe rated for the voltage. *(☠ VOW 1)*
- [ ] **Leave a grounding strap / shorting clip clamped across each cap** while the machine sits. Walk away with the caps *shorted*, not merely "discharged."
- [ ] **Confirm the dead-man state:** nothing energized, caps clamped, RF ground still attached, disconnect open. *Now* you may relax.

### ☠ THE CAPACITOR-DISCHARGE RITUAL — with a grounding stick
This is the single most important physical habit in this whole work. Learn it
before you build L1. A **grounding stick** is a long insulated rod (HV-rated, dry)
with a metal hook on the end, wired through an appropriate **bleeder resistor**
(sized for the energy — high enough resistance to avoid a violent, weld-spattering
bang, with **enough power/voltage rating that it won't vaporize on the discharge**)
to your RF ground, plus a bare shorting clip for the final hard short.

1. **☠ VOW 2 — one hand behind your back.** Always, even now. *Especially* now.
2. **Power off and physically disconnected.** Verified with your eyes.
3. **Hold the stick by the insulated end only.** Stand to the side, footing dry,
   no wrist strap, no jewelry.
4. **Touch the resistor-loaded hook across the capacitor terminals** — both, one to
   each — and **hold for several seconds.** You may see a small arc and hear it
   bleed down. Do not flinch and pull away early.
5. **Repeat after a pause.** Caps recover charge after the first bleed. Bleed it,
   wait, bleed it again, and **do it once more than you think you need.**
6. **Apply the bare shorting clip and leave it clamped on.** The cap is only "safe"
   while it is shorted. A clamped short is your proof; "I'm pretty sure it's
   discharged" is how people die.
7. **Meter it.** ⚠ Confirm near-zero volts with a meter/probe rated for the
   working voltage. A bleeder or your ritual can fail silently; the meter is the
   second witness.
8. **Only with the short clamped and the meter confirming dead do you put a hand
   near the circuit** — and still keep the other hand behind your back.

> **Forgetful-human truth:** the cleanup is the most dangerous moment of the whole
> session, because the machine is "off" and you've stopped being afraid. The cap
> hasn't stopped being charged. *Fear the off machine.*

---

## Part V — First-aid reality, and when to NOT play hero

This is not a first-aid course. Take a real one (CPR/AED especially). But know
these truths before anything goes wrong:

- **☠ DO NOT TOUCH a person who is still in contact with a live conductor.** If you
  grab them, the current takes you too, and now there are two casualties and no one
  to call for help. **Kill the power first — hit the disconnect, unplug, throw the
  breaker.** Only when the source is dead do you touch the person. This is the
  single hardest rule to obey and the most important. *Cut power, then help.*
- **If you can't cut power instantly,** and only if you can do it without becoming
  a casualty, use a *dry, non-conductive* object to break their contact — never
  your bare hands, never anything damp or metal. But the disconnect is faster and
  safer; reach for it first.
- **☠ Don't forget the charged capacitor in a rescue.** Even with the source dead,
  a tank or bus cap can still be holding a lethal charge — the same trap that may
  have hurt the person can hurt the rescuer. Stay aware of where the stored energy
  is.
- **Call emergency services immediately** for any HV/mains contact across the body,
  any loss of consciousness, any burn that's more than trivial, or any chest
  pain / abnormal heartbeat. **☠ Electrical shock can throw the heart into a
  dangerous rhythm minutes to hours later** even if the person seems fine. A person
  who took a real shock goes to a hospital and gets monitored, *even if they insist
  they're okay.* That's not optional.
- **Start CPR / use an AED** if they're unresponsive and not breathing normally —
  only after you are certain they are clear of the live source.
- **Electrical burns are deeper than they look.** The entry/exit marks can be
  small while the tissue damage along the current's path through the body is severe.
  Treat any electrical burn as a reason for medical evaluation, not a bandage.
- **RF burns:** painless or mild at first, deep, slow to heal, prone to infection.
  Get them looked at; don't dismiss them because they didn't hurt.
- **Arc-eye (UV flash burn):** painful, gritty eyes hours after exposure. Usually
  heals, but get it checked, and *wear the glasses next time.*

> **When to NOT play hero:** when the source is still live; when "saving thirty
> seconds" means reaching in past a charged cap; when you're alone and tempted to
> push on anyway. The hero move is **cutting the power and calling for help.** A
> dead rescuer rescues no one.

---

## Part VI — The honest disclaimer (in this project's voice)

This page is written from general, public Tesla-coil engineering knowledge as part
of the [[resonance]] organ of Aether. It is offered in the spirit of the work — *be
reverent toward the craft, ruthless toward your own self-deception* — and it is not
a substitute for proper training, a qualified mentor, your local electrical and fire
codes, manufacturer documentation, or a real first-aid course.

**This is not legal, medical, or professional engineering advice.** Nothing here
licenses you, certifies your build, or makes anyone but you responsible for it. High
voltage and high-frequency power can maim and kill, and so can the mains in your
wall. If you build, energize, or stand near any rung of this ladder, **you assume
the risk — fully, knowingly, and alone in your accountability for it.** No author,
contributor, or this document bears liability for what you do with it. If you are
not willing to own that, do not plug it in.

> The dream is honored by refusing to fool yourself about it — and the same is true
> of the danger. Keep every layer, label every layer, and *fear the off machine.*
> — see [[aetherius]] · [[provenance]] · [[resonance]]

---

## Pending — book reconciliation (Tier B)

This doctrine is **generic — built from public, general Tesla-coil engineering
knowledge, and to be reconciled with Tilbury's *Ultimate Tesla Coil Design and
Construction Guide* (Tier B) once that source is readable.** Tilbury's own safety
chapter, his specific discharge and grounding practice, and his recommended bring-up
procedure should be folded in here as cited Tier-B notes the moment the book is
accessible to this work. Until then, treat this page as the binding floor, not the
last word — and where the book is stricter, **the book wins.** (Per the HARD
COPYRIGHT RULE, none of Tilbury's text is reproduced or paraphrased here; this page
stands on general public engineering knowledge only.)

---
