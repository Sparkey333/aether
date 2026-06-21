# ThirdThumb Rig — Bill of Materials (Tier 3)

The 3D-printed, universal "presses a real controller" build. Parametric model:
[`clamp.scad`](clamp.scad). Render an STL with `openscad -o clamp.stl clamp.scad`,
then tune `button_spacing`, `shell_thickness`, and `reach` to your controller.

## Parts (per unit)

| # | Part | Qty | ~Cost | Notes |
|---|---|---|---|---|
| 1 | Printed clamp (`clamp.scad`) | 1 | ~$0.40 filament | PLA/PETG, 0.2mm, 3 perimeters, 20% infill |
| 2 | SG90 micro-servo | 2 | $2–4 | one per face button (A, B); horn taps the button |
| 3 | Raspberry Pi Pico (RP2040) | 1 | $4–6 | the brain; USB-C to the dashboard |
| 4 | M2 × 8mm screws | 4 | $0.20 | servo mounting |
| 5 | Jumper wires / 3-pin servo leads | 1 set | $0.50 | servo → Pico GPIO + 5V + GND |
| 6 | USB-C cable | 1 | $1–2 | Pico ↔ computer |
| **—** | **Total** | | **~$14–22** | matches `docs/STRATEGY.md` SKU table |

> **Solenoid variant:** swap each SG90 for a small push-solenoid + an
> N-channel MOSFET (e.g. 2N7000/IRLZ44N) and a flyback diode (1N4148) per
> coil. Snappier and more "tap-like" than a servo arc, but needs more current
> and a transistor circuit — the standard DIY auto-clicker recipe.

## Wiring (servo build)

```
Pico GP15 ──► servo A signal      Pico GP14 ──► servo B signal
Pico VBUS (5V) ──► both servo V+  Pico GND ──► both servo GND
Pico USB-C ──► computer (dashboard sends commands over serial)
```

## Firmware note

Same RP2040 used for the Tier-2 Link board, in a different mode: instead of
enumerating as a USB-HID gamepad, it parses the dashboard's JSON over serial and
drives servo PWM (or solenoid GPIO). One protocol, two outputs — see
[`docs/TECH.md`](../docs/TECH.md).

## Tuning checklist

1. Measure your controller's thickness → set `shell_thickness`.
2. Measure A↔B button centres → set `button_spacing`.
3. Print, clamp on, attach servos, set horn rest angle just above each button.
4. In the dashboard, lower the A-rate until every press registers (servos have a
   mechanical ceiling — match the game, don't max the motor).
