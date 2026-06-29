# S1 — The Schumann Detector (the honest Earth-note)

> *The coils scream in kilohertz. The planet hums at eight. To hear the planet, you must stop shouting and learn to listen.*

> ⚠ **DANGER BANNER — Safety Class: GREEN (intrinsically low-hazard) — but "green" is not "harmless."**
> This rung is **battery-powered, low-voltage (≤ ±12 V), milliwatt-scale**. There is **no high voltage, no RF, no spark** in the core build — that is the entire point of S1: it is the *honest, safe* way to actually touch ~7.83 Hz, instead of pretending the coils do it.
> The realistic worst cases are: a **lithium pack abused into thermal runaway** (the one genuinely dangerous part — see ☠ below), a **ruptured/leaking alkaline battery (caustic)**, a **soldering-iron burn / solder fume**, and a **mains-powered laptop or scope fault reaching you through the audio ground**. Treat it as a benign breadboard project — **with one wire that must never become a path to mains, and one battery chemistry that can catch fire.**
> ⚠ **Real electrical risk #1 — galvanic ground loops to mains gear.** If you connect this antenna chain to a wall-powered scope or desktop while *also* touching earth, plumbing, or a radiator, an internal PSU insulation fault could put **mains potential on your "signal ground."** Prefer a **laptop running on battery** or a **galvanic USB isolator** during capture, and use the **one-hand rule** (one hand behind your back) any time you touch a wall-powered instrument. (Covered in the hazard table.)
> ☠ **Real lethal-class risk — the lithium pack (DECKED-OUT only).** A shorted, punctured, or over-discharged lithium cell can **vent flame and burn down a room.** This is chemistry, not the Earth. Protected cells + BMS + fuse, never charge unattended. (See the ☠ in the DECKED-OUT build and the hazard table.)
> **Reminder to the forgetful human:** the gentleness of S1 is a trap if it makes you sloppy. The coil rungs in this project are **not** GREEN. Do not carry "eh, it's just a battery" habits into a rung where capacitors hold a lethal charge after power-off.

---

## What this rung is / what it proves

S1 builds a **DC-blocked ELF (extremely-low-frequency) receiver** for the band around **5–40 Hz**, the region where the **Schumann resonances** live — standing electromagnetic waves trapped in the cavity between Earth's surface and the ionosphere. The fundamental sits near **7.83 Hz**, with overtones near **14.3, 20.8, 27.3, 33.8 Hz**. You will capture a real signal, FFT it, and **see a peak at ~7.83 Hz rise out of the noise floor.**

**Provenance of what S1 produces:**
- The **measured ~7.83 Hz peak in your FFT** — **Tier A (Measured).** This is electrical truth you recorded on your own hardware.
- The **physics of the cavity resonance** (Schumann, 1952; ionospheric waveguide) — **Tier B (Scholarly).**
- **"The Earth's tone / the planet's heartbeat / the note of the world"** — **Tier C (Traditional).** A real correspondence in the lore, and a beautiful one, but it is *framing*, not measurement. We keep it, we love it, we **label it**.
- "7.83 Hz tunes your brain / heals / is the frequency of consciousness" — **Tier D (Folklore).** Untested here. Not claimed.

Why S1 belongs on the ladder: every other rung in this constellation runs at **kilohertz to megahertz** (the coils). If you want to claim kinship with "the Earth's note," you must show you can *actually detect* the Earth's note — directly, at single-digit hertz, with no spark and no self-deception. S1 is the honesty rung.

---

## TWO PARALLEL TRACKS

Both tracks detect the same physics. BASE is the canonical hobbyist ELF receiver — the kind a book's intro chapter would walk you through. DECKED-OUT hardens it into an instrument that logs unattended for days into the Aether archive.

> 🔰 **BASE is written generically from public ELF-receiver / op-amp engineering — reconcile with Tilbury (Tier B) once the source is readable.** (Tilbury's guide is coil-centric; a Schumann front-end is adjacent craft, so the reconciliation here is lighter than on the coil rungs — see the Tier-B note at the end.)

---

### 🔰 BASE — the simplest experiment (book-equivalent, generic; reconcile with Tilbury)

A magnetic **loop or ferrite-rod antenna** → low-noise **op-amp** preamp → **band-pass (~5–40 Hz)** → **50/60 Hz mains notch** → into a **sound card** → **FFT in software.** Runs off a 9 V battery (or two, for ±9 V). Buildable in an afternoon.

#### BOM — BASE

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Ferrite rod | Mn-Zn, ~10 mm × 100–200 mm (AM-radio type) | 1 | $4 | OR build an air loop (below). Ferrite = compact, lower output. |
| — *or* air loop former | wood/PVC frame, ~0.5–1 m square | 1 | $5 | Bigger area = more signal. Pick ferrite **or** loop, not both. |
| Magnet wire | enameled copper, 30–34 AWG | 1 spool | $10 | ~1000–10,000 turns. Loop: hundreds–thousands; ferrite: hundreds. |
| Low-noise op-amp | TL072 (cheap) or **OPA2134 / OPA2227** (better) | 1–2 | $1–6 | FET-input, low voltage-noise. **Rated ≥ ±12 V supply — well above our ±9 V; never run an op-amp past its absolute-max rail.** |
| Op-amp (filter stage) | TL072 / MCP6002 (rail-to-rail) | 1 | $1 | Second device for the active filter. Confirm its supply rating covers your rail. |
| Resistors | 1% metal film, assorted (10 kΩ–1 MΩ), ≥ ⅛ W | kit | $6 | Set the filter corners — see steps. (Power dissipation is trivial here, but use ≥ ⅛ W parts.) |
| Capacitors | film (1 nF–10 µF), a few electrolytics; **electrolytics rated ≥ 25 V** | kit | $8 | Film caps for the audio/filter path (low leakage, stable). Observe **electrolytic polarity** — reversed/under-rated electrolytics can bulge or vent. |
| 9 V battery + clip | alkaline | 1–2 | $4 | Two in series w/ center tap = ±9 V split supply. |
| Voltage divider / rail-splitter | 2× 10 kΩ + buffer, **or** TLE2426 | 1 | $2 | Makes a clean "virtual ground" mid-rail. |
| Breadboard + jumpers | — | 1 | $8 | Solderless is fine for BASE. |
| Audio cable | 3.5 mm TRS to your input | 1 | $3 | Shielded. Wire to **LINE-IN** of the sound card (not a powered/bias mic input — see step 7). |
| USB sound card | external, line input | 1 | $10 | **Use external, not the laptop's noisy internal codec.** Prefer one that is USB-isolated, or add an isolator (see hazards). |
| Shielded twisted pair | for the antenna lead | ~1 m | $3 | Keep the antenna-to-preamp run short and shielded. |

**Realistic total: ~$45–70.**

#### Tools — BASE
Soldering iron + solder, wire cutters/strippers, a **DMM (multimeter)**, a phone or PC for FFT software (Audacity, Spectrum Lab, or a Python script with `numpy`/`scipy`), painter's tape, patience. A **function generator or a phone tone app** is very helpful for calibration (even just to inject a known 10 Hz square via a series cap).

> ⚠ **Reminder to the forgetful human (before you pick up the iron):** soldering iron tips sit at ~350 °C and *look identical hot and cold*. Iron back in the holster every time you set it down, ventilate the solder fume, and never test tip temperature with a finger.

#### Build steps — BASE

1. **Wind the antenna.**
   - *Ferrite:* wind 300–800 turns of 30–34 AWG neatly along the rod, single layer where you can. More turns = more signal but more self-capacitance (and a lower self-resonance — keep it well above 40 Hz, which is trivially easy here; loop/ferrite self-resonance is typically in the kHz).
   - *Air loop:* wind several hundred to a few thousand turns around the frame. Bigger area and more turns both help. Label the two ends.
   - ⚠ *Reminder for the forgetful human:* magnet wire is **enameled** — that clear/red coating is insulation. You must **scrape or burn off the enamel** at the very ends before soldering, or you'll get zero signal and blame the physics. ⚠ If you *burn* the enamel off, do it ventilated — the fumes are nasty — and watch the hot wire tip.
   - ⚠ *Reminder:* taut wire under winding tension can whip or slice. Cap the cut ends, and wear eye protection while winding under tension.

2. **Mount it mechanically dead-still.** ELF antennas are **microphonic**: any wire that can swing in the Earth's static field, or vibrate, makes false signal. Pot the coil in hot glue / epoxy, or clamp it hard. ⚠ *Reminder:* a loose loop in a breeze will give you a gorgeous "signal" that is just the wind. Don't fool yourself — that's Tier-nothing. (Hot glue is ~190 °C — ⚠ it burns and *sticks while it burns*; glove up.)

3. **Build the rail-splitter (virtual ground).** Two 10 kΩ resistors from +9 V to 0 V, tap in the middle = +4.5 V "analog ground," buffered by a spare op-amp or a TLE2426. All your AC signals swing around this mid-rail. (For ±9 V split supply, your virtual ground is the battery center tap — cleaner.)

4. **Wire the preamp (first op-amp).** Non-inverting, gain ~100–1000 (e.g. Rf = 1 MΩ, Rg = 1 kΩ → gain ≈ 1001). Antenna across the input through a high resistance to virtual ground to set the DC bias. Keep input wires **short and shielded.** *(Sanity check: with gain ~1000 and a ±9 V supply, your output clips at roughly ±8 V, i.e. an input swing above ~8 mV saturates the stage — fine for ELF microvolt-to-millivolt signals, but if your FFT is flat-topped you are clipping; drop the gain.)*

5. **Add the band-pass, ~5–40 Hz.**
   - High-pass corner ~5 Hz (kills DC drift, body sway, thermal wander).
   - Low-pass corner ~40 Hz. **Accuracy note / fix:** a single low-pass corner anywhere near 40–50 Hz does **not** meaningfully attenuate 50 Hz mains — they are too close, and a 1-pole roll-off is only ~6 dB/octave. Do **not** rely on the low-pass to kill mains; that is the **notch's** job (next step). Set the low-pass to reject audio and supersonic junk and to anti-alias, not to fight the grid.
   - A simple multiple-feedback or Sallen-Key band-pass around the second op-amp does this. Use **film caps** here, not ceramics (Class-2 ceramics are microphonic and drift).

6. **Add the mains notch.** A twin-T or active notch at **50 Hz (most of the world) or 60 Hz (North America)** — *pick yours.* Mains hum will otherwise tower over 7.83 Hz by 40–60 dB. For a deep, repeatable null you generally need a tuned notch with adjustable Q, and you may need a **second notch at the first harmonic (100/120 Hz)** if it leaks in.
   - ⚠ *Reminder for the forgetful human:* **the dominant signal you will see is ALWAYS mains.** If your big peak is exactly at 50 or 60 Hz, that is **the power grid, not the planet.** Notch it, and look *below* it.

7. **Bring up the output to line level**, AC-couple through a film cap to the 3.5 mm jack, tip = signal, sleeve = virtual/analog ground. **Wire to LINE-IN**, not a microphone input — a mic input may carry **plug-in/phantom bias voltage** back into your output stage and skew the DC bias.

8. **First power-on:** insert the 9 V battery. Probe rails with the DMM — confirm +9 V and a stable +4.5 V mid-rail. No smoke, no hot chips. ⚠ *Reminder:* if a chip is too hot to keep a finger on, **power down immediately** — that is a wiring fault or a reversed/under-rated electrolytic, not a quirk. (There is no high voltage anywhere here — this is the easy part.)

#### First-light / tuning / test — BASE

1. **Sanity-inject a known tone.** Feed a ~10 Hz signal (function generator, or a phone tone app through a big series resistor/cap into the preamp input) and confirm it appears in the FFT at 10 Hz, with mains notched. This proves the *chain* works before you blame the *sky*. ⚠ If the tone source is a mains-powered function generator, AC-couple it through a capacitor and keep the **one-hand rule** while connecting it.
2. **Go to a quiet site.** Get **away from buildings, motors, fluorescent/LED drivers, switching supplies, and Wi-Fi power bricks.** A field, a park, a wooden cabin at 2 a.m. ⚠ *Reminder:* indoors near mains, you will mostly measure your house. The Earth-note is faint; the grid is loud. ⚠ *And the obvious one people forget:* do **not** ELF-hunt in an open field during a thunderstorm — a tall loop former is a lightning target, and the very storms that *make* the Schumann signal can kill you directly. **Never alone** at a remote 2 a.m. site; tell someone where you are.
3. **Orient the antenna.** A loop/ferrite is directional (it nulls along its axis). Rotate slowly; the Schumann field is broadly horizontal-magnetic, so try the rod horizontal and sweep azimuth.
4. **Record 60–300 seconds** into the sound card at 8 kHz or higher (huge overkill for ELF, but fine). Long records = finer FFT bins = a sharper 7.83 Hz line.
5. **FFT with a long window** (e.g. 30–120 s, Hann window, lots of averaging). Look for a bump at **~7.83 Hz** and, if you're lucky and quiet, a second near **14 Hz**.
6. **Confirm it's real, not artifact:** does the peak **track when you rotate the antenna** (deepens at the null)? Does it **survive site changes** (still ~7.83 Hz somewhere else)? Does it **vanish when you short the antenna input**? If yes to all three — you caught the planet.

**What you've proven — BASE:** a reproducible **~7.83 Hz spectral peak you recorded yourself = Tier A.** You have directly, honestly detected the Schumann fundamental. The label "Earth's tone" you may now *apply* — flagged **Tier C**.

---

### ⚡ DECKED-OUT — the design we level it up to

Same physics, turned into an **instrument**: an **instrumentation-amp front end**, real **shielding/grounding**, an **on-board ADC + RP2040/Arduino logger**, and **multi-day unattended capture** writing timestamped spectra straight into the Aether archive (for the Loom to ingest as Tier-A data).

> ☠ **Top-of-section reminder:** DECKED-OUT is where lithium enters S1. Everything else here is GREEN; the battery pack is **not**. Read the ☠ in step 8 and the hazard table before you wire a cell.

#### BOM — DECKED-OUT

| Part | Spec / rating | Qty | ~Price | Notes |
|---|---|---|---|---|
| Large air loop | 1–1.5 m, 1000–5000 turns, **electrostatically shielded** | 1 | $25 | Faraday shield (split, single-point grounded) rejects E-field/hand-capacitance. |
| Magnet wire | 32–36 AWG | spool | $15 | More turns; keep self-resonance ≫ 40 Hz. |
| **Instrumentation amp** | **INA128 / INA333 / AD620** (supply rating covers your ±rail) | 1 | $6–12 | True differential, high CMRR — kills common-mode mains pickup. |
| Precision op-amps | OPA2227 / OPA2188 (low offset/noise) | 2 | $8 | Filter + buffer stages. |
| Active filter ICs / passives | film caps, 0.1% resistors | kit | $20 | Band-pass 5–40 Hz + steep mains notch (twin-T or state-variable). |
| ADC | **ADS1115 (16-bit, easy)** or **ADS1256 (24-bit)** | 1 | $5–25 | Differential input; ADS1256 gives real ELF dynamic range. |
| MCU / logger | **RP2040 (Pico)** or Arduino w/ SD | 1 | $5 | RP2040 preferred: dual-core, USB, cheap, lots of RAM for FFT. |
| RTC module | DS3231 (temp-compensated) | 1 | $5 | **Timestamps make it archive-grade.** Without time, it's just a wiggle. |
| microSD + breakout | 8–32 GB | 1 | $8 | Multi-day raw + spectra storage. |
| Real ±supply | 2× 18650 (**protected**) + buck/boost to ±9–12 V, **or LiFePO4** | 1 | $20 | Battery only — see ☠ safety note. LiFePO4 is the safer chemistry. |
| Battery protection | **protected cells + BMS + in-line fuse** | 1 | $6 | ☠ Lithium **requires** protection. Non-negotiable. See hazards. |
| Shielded enclosure | diecast aluminum box for the electronics | 1 | $12 | Star-ground inside; antenna lead enters through one shielded gland. |
| Charger | dedicated Li-ion/LiFePO4 charger with correct chemistry/voltage | 1 | $10 | ☠ **Match charger to chemistry and cell count.** Never charge unattended. |
| Galvanic USB isolator | ADuM-based, rated ≥ 2.5–5 kV isolation | 1 | $25 | For when you *do* plug into a mains-powered PC. |
| Temp/humidity sensor | SHT31 (optional) | 1 | $5 | Correlate drift; provenance hygiene for the archive. |

**Realistic total: ~$170–240.**

#### Tools — DECKED-OUT
Everything from BASE, plus: a **dedicated current-limited charger matched to your cell chemistry** for the lithium pack, an **oscilloscope** (battery-powered, or via the galvanic USB isolator), a soldering station, and a host PC running the Aether logger/Jarvis ingest scripts.

#### Build steps — DECKED-OUT

1. **Wind & electrostatically shield the loop.** Wind the large loop, then wrap a **Faraday shield** (foil or a single layer of wire) around it — **split it once** so the shield is *not* a shorted turn (a closed conductive loop around your coil = a shorted secondary; it kills your signal). Ground the shield at **one point only.**
   - ⚠ *Reminder for the forgetful human:* a shield that accidentally forms a complete loop is a **shorted turn** — your antenna will go deaf and you'll chase a "broken" preamp for hours. Slit the shield. One ground point.

2. **Differential front end with the in-amp.** Drive both loop ends into the **INA128/INA333** differential inputs (referenced to mid-rail through bias resistors). High CMRR means mains and hand-capacitance arrive as common-mode and get rejected — far cleaner than the single-ended BASE preamp.

3. **Active band-pass + steep mains notch.** State-variable or twin-T, 5–40 Hz pass, deep null at your mains frequency *and* its first harmonic (100/120 Hz) if it leaks. 0.1% resistors and film caps for stable, repeatable corners.

4. **Anti-alias before the ADC.** A low-pass (~40–50 Hz, multi-pole) ahead of the ADC so nothing above Nyquist folds down onto 7.83 Hz. ⚠ *Reminder:* sample at e.g. 256–1000 Hz; without an adequate anti-alias filter, a higher-frequency interferer can **alias right onto the Earth-note** and produce a convincing lie. A 1-pole filter is **not** enough — use ≥ 2 poles so the band above Nyquist is genuinely down by tens of dB.

5. **ADC + RP2040.** Wire the ADS1115/ADS1256 differentially to the filter output. RP2040 reads samples at a fixed rate (RTC-disciplined), buffers, and either stores raw or does an on-board FFT.

6. **Add the RTC + SD.** Every record gets **UTC timestamp, sample rate, gain, site tag, temperature.** This is what turns a wiggle into **Tier-A archive data.**

7. **Star-ground inside a diecast box.** Single-point ground; antenna enters through one shielded gland; **signal ground kept separate from any earth/chassis ground tie** — a single-point-only discipline carried over from the coil rungs (where keeping RF/earth grounds separate is a life-safety habit) even though there's no RF here. Battery and protection inside or strapped on.

8. **Power from battery only.** Protected lithium pack or LiFePO4 → ±9–12 V via buck/boost. **No wall adapter in the signal chain during capture.** When you must offload to a mains PC, go through the **galvanic USB isolator**, and use the **one-hand rule** while connecting.
   - ☠ *Reminder for the forgetful human:* a cheap **unprotected** lithium cell — shorted across the terminals, over-discharged, punctured, or reverse-installed — can go into **thermal runaway and vent flame**, and a Li-ion fire is hard to extinguish and reignites. Use **protected cells, a BMS, and an in-line fuse**; **never charge unattended**; charge on a non-flammable surface; never lay metal across the terminals; store cool and partially charged. **This is the only genuinely lethal-class hazard in all of S1**, and it has nothing to do with the Earth — it's chemistry. ⚠ If a cell is hot, swollen, hissing, or smells sweet/solvent-like, get it outside away from anything flammable — **do not** put a venting Li-cell fire out with water on yourself in a confined space.

#### First-light / tuning / test — DECKED-OUT

1. **Bench-verify the chain** with an injected 7.8 Hz / 14.3 Hz tone through the **galvanic isolator**; confirm the FFT bins land where expected and the notch swallows mains. ⚠ One-hand rule while touching any mains-powered bench gear.
2. **Field deploy** at a quiet site, loop fixed and level, electronics in the grounded box, logging to SD. ⚠ Not during lightning — see BASE first-light step 2.
3. **Multi-day capture:** record continuously for **24–72+ hours.** Schumann amplitude has a **diurnal cycle** (it breathes with the global thunderstorm "hot spots" — Africa, Americas, Asia rotating under the Sun). Seeing **7.83 Hz wax and wane on a daily rhythm** is the gold-standard confirmation that it's the planet and not your bench. ☠ *Reminder:* "unattended for days" still means **never charging the lithium pack unattended** — deploy on a charged, fused, protected pack only.
4. **Stack the spectra:** average many windows; the line at 7.83 Hz sharpens and the overtones (14.3, 20.8, 27.3 Hz) emerge.
5. **Ingest to the archive:** push timestamped spectra to the Aether store; let **Jarvis** tag, version, and chart them.

**What you've proven — DECKED-OUT:** a **time-resolved, geolocated, diurnally-varying ~7.83 Hz record = strong Tier A**, with overtones — instrument-grade evidence of the Schumann cavity, archived and reproducible. The cavity physics is **Tier B**; "Earth's tone" remains **Tier C**; any "it affects X" claim stays **Tier D** unless a *separate* controlled experiment earns it.

---

## HAZARD TABLE — S1

| Hazard | Why it can hurt you / the data | Mitigation |
|---|---|---|
| ☠ **Lithium pack abuse (DECKED-OUT)** | Shorted/over-discharged/punctured/reverse-installed cells can vent, ignite, and reignite; a pack fire can be lethal in an enclosed space. | **Protected cells + BMS + in-line fuse**, chemistry-matched charger, **never charge unattended**, charge on non-flammable surface, no metal across terminals, store cool & partial; retire any swollen/hot cell outdoors. |
| ⚠ **Ground loop to mains PC/scope** | An internal PSU insulation fault could energize your "signal ground" while you touch earth/plumbing/radiator → shock. | Capture on a **battery laptop** or through a **galvanic USB isolator**; **one-hand rule** when probing anything wall-powered. |
| ⚠ **Soldering iron / hot glue** | ~350 °C tip and ~190 °C glue cause burns; solder fume is a respiratory irritant. | Stand, ventilate, tin carefully, "iron back in the holster" reflex; glove for hot glue. |
| ⚠ **Alkaline battery rupture / leak** | KOH electrolyte is caustic; a shorted 9 V gets hot. | Don't short clips; remove battery when storing; flush skin/eyes with water if electrolyte contacts you, then seek care for eyes. |
| ⚠ **Under-rated / reversed electrolytic cap** | Reverse-polarity or over-voltage electrolytics can bulge or vent hot electrolyte. | Observe polarity; rate electrolytics ≥ 25 V; power down if any cap runs warm. |
| ⚠ **Eye/hand from antenna former** | Sharp wire ends, taut frames under winding tension. | Cap wire ends, eye protection while winding under tension. |
| ⚠ **Lightning / remote-site exposure** | A tall loop in an open field is a strike target; the storms that make the signal can kill directly; remote 2 a.m. solo work. | Do not deploy in/near thunderstorms; **never work alone** at remote sites; tell someone your location. |
| (data) **Mains hum masquerading as signal** | 50/60 Hz dwarfs 7.83 Hz; you'll "find" a peak that's the grid. | Tuned notch (not just a low-pass) + look strictly below mains; confirm 7.83 Hz, not 50/60. |
| (data) **Microphonic / wind / motion artifact** | A swinging loop in Earth's static field fakes ELF signal. | Pot/clamp the coil dead-still; reject signals that change with mechanical disturbance. |
| (data) **Aliasing** | Out-of-band interferer folds onto 7.83 Hz → false peak. | Multi-pole anti-alias filter before ADC; verify peak survives site/orientation changes and shorting the input. |

> *Note for the forgetful human:* none of S1's electrical hazards are lethal **except the lithium pack** (and lightning, if you ignore the sky). Both are about **physics outside the circuit, not the planet's tone.** Do not let S1's gentleness make you sloppy on the **coil rungs**, where ☠ means exactly what it says: **capacitors hold a lethal charge after power-off (always short them to ground through a bleeder resistor before touching), RF burns feel painless until the tissue is cooked, and the one-hand rule and "never work alone" are not suggestions.** S1 is the calm before those rungs — stay in the habit.

---

## PRE-FLIGHT CHECKLIST (before power)

- [ ] Battery only in the signal chain — **no wall adapter** plugged into the analog side.
- [ ] (DECKED-OUT) Lithium pack **protected + BMS + fused**; **no swelling/heat/odor**; charger **disconnected** before deploy; charging was **attended**.
- [ ] Electrolytic caps correct polarity and rated ≥ 25 V; op-amp/in-amp supply rails within each part's absolute-max.
- [ ] Rails confirmed with DMM (+9 V and a clean mid-rail / ±9 V split) **before** trusting any reading; no hot chips.
- [ ] Antenna **mechanically locked down** — nothing that can swing or vibrate.
- [ ] Mains notch set to **your** region (50 vs 60 Hz) and verified on the injected-tone test — and you are **not** relying on the low-pass to kill mains.
- [ ] (DECKED-OUT) Faraday shield is **slit** (not a shorted turn) and grounded at **one** point; signal ground tied to chassis/earth at one point only.
- [ ] Multi-pole anti-alias filter in place; sample rate chosen and noted.
- [ ] RTC set to UTC; site tag, gain, and sample rate recorded for the archive.
- [ ] If touching a mains-powered PC/scope: **galvanic USB isolator inline**, **one hand behind your back**.
- [ ] No thunderstorm in the area; someone knows where you are if deploying remote/solo.
- [ ] Sanity tone injected and seen at the right bin — chain proven before blaming the sky.

## SHUTDOWN / SAFE CHECKLIST (after)

- [ ] Stop logging; confirm the SD/file actually flushed and closed (don't lose the day's data).
- [ ] Power down; **remove or disconnect the battery** for storage (no slow drain, no leak).
- [ ] (DECKED-OUT) Lithium pack to safe storage charge; **inspect for heat/swelling**; store cool, away from flammables.
- [ ] Coil ends capped; **iron unplugged and fully cooled** before packing.
- [ ] Back up the capture to the Aether archive **before** you reuse the card.
- [ ] Log the run: site, time, weather/temp, orientation, what you saw, what you doubt. (Honesty hygiene — Tier-A data needs Tier-A notes.)

---

## Climb from here

- **Up the ladder:** S1 is the **honesty anchor** for every coil rung. When a coil rung tempts you to say "it resonates with the Earth," S1 is where you go to *actually measure* the Earth's resonance directly — and discover it's at **7.83 Hz**, not the **tens-of-kHz** your coil runs at. That gap, measured and admitted, is the discipline of the whole project. ⚠ And remember: the next rungs up are **not GREEN** — bring the habits, leave the complacency.
- **To the Loom (Tier-A data):** the DECKED-OUT logger's timestamped spectra are exactly the kind of **measured stream** the Loom ingests, versions, and charts over time — multi-day Schumann amplitude becomes a first-class dataset.
- **To the Pyramid Temples (cymatics):** 7.83 Hz is below human hearing, but it's a clean low tone to **drive a cymatics plate / Chladni rig** (via an amp + transducer) — turning the Earth-note into *visible* standing-wave figures. ⚠ Note that rig has its **own** hazards (mains-powered amplifier, high SPL at audible drive tones, vibrating plate edges) — it is not GREEN; treat it on its own terms.
- **To Jarvis (control/logging):** Jarvis owns the **scheduling, ingest, tagging, and provenance-stamping** — kicking off multi-day captures, labeling each spectrum A/B/C/D, and refusing to let a 50 Hz grid artifact get filed as "the Earth's tone."

---

## Reconcile with the book (Tier B)

Tilbury's *Ultimate Tesla Coil Design and Construction Guide* is a **coil** text; a Schumann ELF front-end is **adjacent** craft, not its core, so the BASE design above is built **generically from public op-amp, instrumentation-amp, and ELF-receiver engineering** — **not** from the book, which has **not** been read. Nothing here reproduces or paraphrases that book.

**Open reconciliation items once the source is readable:**
- Whether Tilbury treats the Schumann / Earth-resonance question at all, and if so, how he frames the **7.83 Hz vs. kHz-coil** relationship (is it correspondence/Tier C, or does he make a measurable Tier-B claim?).
- Any grounding/shielding conventions in his text we should align with (so S1's star-ground habits match the coil rungs').
- His terminology for "Earth resonance" so our Tier labels map cleanly onto his language.

Until then: this rung's electrical results are **Tier A**, the cavity physics is **Tier B (Schumann 1952; ionospheric-waveguide literature)**, the "Earth's tone" framing is **Tier C**, and anything about 7.83 Hz *doing* something to *you* is **Tier D** — kept, labeled, untested.
