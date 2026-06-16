# ThirdThumb — What's *Really* Happening in the Code

The whole product rests on one fact:

> **A game only ever sees button *states*.** It does not know or care whether a human
> thumb, a script, a chip pretending to be a controller, or a servo arm produced them.

So "press A for me" means **injecting input at one of three layers**. That's the entire
design space. Each layer trades universality for complexity.

```
        YOU (the dashboard) decide WHAT to press and WHEN
                            │
        ┌───────────────────┼────────────────────┐
        ▼                    ▼                     ▼
  ① VIRTUAL (software)   ② ELECTRICAL (hybrid)   ③ MECHANICAL (hardware)
  inject into the OS /   a chip pretends to BE   a servo/solenoid physically
  emulator               a controller            pushes a real button
        │                    │                     │
  PC & emulators only   any console that      literally anything with
                        accepts that pad      a physical button
```

---

## Tier 1 — Virtual (software-only): *GhostHands app*

**What's happening:** you call the OS's input API on a timer. No hardware.

- **Emulator macros (easiest):** RetroArch, mGBA, Citra/Lime3DS, etc. let you bind keys
  and many have built-in turbo/macro. You're literally sending keystrokes.
- **OS input injection (real PC games):**
  - Windows: `SendInput` (keyboard/mouse) or a **virtual gamepad** via **ViGEmBus** /
    Python `vgamepad` (the game sees a real Xbox 360/DS4 pad).
  - macOS: `CGEventCreateKeyboardEvent` / `CGEventPost` (Quartz). Gamepad emulation is
    harder on macOS — keyboard/mouse is the practical path.
  - Linux: `uinput` / `evdev` — create a virtual input device the kernel treats as real.

```python
# the entire engine, conceptually — a timed press loop
while running:
    press("A");  sleep(jitter(1/a_rate))     # 3–5/s like a human, or faster
    if due("B"): tap("B")                    # so you don't switch Pokémon
    if move:     weave_dpad()                # wiggle in the grass
```

**Pros:** free, instant, no shipping. **Cons:** **cannot drive a sealed console**
(a real Switch/PS5 won't accept OS-injected input) — PC & emulators only. This is the
free funnel, not the whole product.

---

## Tier 2 — Electrical (hybrid): *ThirdThumb Link*  ← the hero

**What's happening:** a microcontroller enumerates over USB (or BLE) as a **standard
HID gamepad**. The console literally cannot tell it from a real controller. Your
dashboard tells the chip what to press over a serial link.

- **Boards:** RP2040 (Pi Pico, TinyUSB — cheap, modern), Arduino Pro Micro/Leonardo
  (ATmega32U4, the classic), Teensy; **ESP32** for a **BLE** gamepad (wireless).
- **This is exactly how the DIY Switch-automation scene works** (Pro Micro / RP2040 /
  ESP32 emulating a Switch Pro Controller). You're productizing a known-good method —
  **no console hacking / CFW required** for the controller-emulation route (that's the
  big selling point vs sys-botbase, which needs a modded Switch).
- **The bridge that makes it KISS: WebSerial.** The dashboard (HTML) talks to the board
  over `navigator.serial` — *the same code works in the browser and in the Tauri app.*

```
dashboard (HTML/Tauri) ──WebSerial JSON──► RP2040 firmware ──USB HID──► console
   {"a":1}  {"b":1}  {"dpad":"up"}            sets report bits        sees a controller
```

**Pros:** reliable, universal-ish (any console that takes that pad type), no CFW, small.
**Cons:** must build/flash a board; per-console HID quirks (Switch wants a Pro
Controller descriptor; Xbox uses proprietary XInput auth — PS/Switch/PC are friendlier).

---

## Tier 3 — Mechanical (hardware): *ThirdThumb Rig*  ← the halo / teach product

**What's happening:** zero protocol involvement. A **servo or solenoid** physically
depresses a button on a *real* controller. Works on *anything* — old handhelds, arcade
sticks, a phone, a controller with no documented protocol.

- **Actuators:** micro-servo (SG90, cheap, easy, ~PWM) for a "tap" arc, **or** a small
  push **solenoid** (linear, snappier — needs a transistor/MOSFET + flyback diode and
  more current) per the standard DIY recipe.
- **Frame:** a 3D-printed clamp that registers to the controller and holds actuators
  over A/B (+ a tiny pusher for the stick/d-pad if needed). This is your **MakerWorld /
  Printables** asset and the spine of the build course.
- **Brain:** same RP2040, now driving servo PWM / solenoid GPIO instead of HID.

See `assets/rig-diagram.svg` for the concept.

**Pros:** truly universal, zero protocol risk, the most "magic" demo, the best teaching
story. **Cons:** mechanical = finicky (alignment, drift, mispresses — the "demo curse"),
slower max rate, most COGS/support. Sell as premium + DIY-learn, not the volume SKU.

---

## The KISS abstraction that unifies all three: one action schema

Define actions once; each tier just *renders* them differently. This is what lets one
dashboard + one set of presets drive software, board, and rig.

```jsonc
// a profile = a target map + a timed program (this drives every tier)
{
  "name": "Pokémon shiny hunt",
  "target": "switch-pro",            // or "keyboard:mgba", "servo-rig"
  "map": { "A": {...}, "B": {...}, "DPAD": {...} },
  "program": [
    { "do": "mash", "btn": "A", "rate": 4, "jitter": 0.2 },
    { "do": "tap",  "btn": "B", "everySec": 2 },
    { "do": "weave","btns": ["LEFT","RIGHT"], "everyMs": 450 }
  ]
}
```

- **Universal-by-default:** generic logical buttons (`A,B,X,Y,DPAD,L,R,…`); only the
  per-target `map` changes. New controller = new small map, not new code.
- **Humanize:** apply ±jitter to every interval (already in the dashboard). Avoids
  missed inputs from games that debounce, and is gentler than perfectly robotic timing.
- **Timing reality:** humans ≈ 3–5 presses/s; hardware can do far more but games sample
  per frame (~60 Hz) and debounce, so *faster isn't always more presses registered* —
  match the game, don't max the motor.

---

## Bill of materials (rough, per unit)

| Tier | Parts | ~Cost |
|---|---|---|
| 1 | none (software) | $0 |
| 2 | RP2040 board + USB-C cable | **$6–12** |
| 3 | RP2040 + 2× SG90 servo (or solenoid+MOSFET+diode) + printed clamp + screws | **$14–22** |

---

## Build order (engineering)

1. **Tier-1 backend** behind the existing dashboard engine: swap the simulated `fire()`
   for real input (`vgamepad` on Win / `CGEvent` on Mac / `uinput` on Linux). Prove it
   on an emulator first.
2. **WebSerial layer:** dashboard ⇄ board JSON protocol; same code in browser + Tauri.
3. **RP2040 firmware:** USB-HID gamepad (Tier 2) and a servo/solenoid build (Tier 3),
   both speaking the same JSON.
4. **Tauri wrap:** this HTML → `.dmg` (you've shipped Tauri with Aether already), then
   win/linux. Add auto-update + onboarding.
5. **Publish STLs + the course.**

> Everything above is standard, legal hobby tech (turbo controllers, HID gamepads, and
> servo tappers are off-the-shelf). Keep it single-player/accessibility-first; never
> automate online ranked; never bundle games. See `docs/STRATEGY.md` §5.
