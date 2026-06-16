# The Formula Ledger

Every number Serious Civil produces traces to a line in this file. If it isn't
here, the engine doesn't claim it. (This is the same discipline as the family's
Source Atlas: keep every layer, label every layer, let nothing borrow authority
it hasn't earned.)

All formulas below are standard linear-elastic **Euler–Bernoulli beam theory**
for a prismatic member with a doubly-symmetric (here: rectangular) cross-section.
They are textbook results — *Roark's Formulas for Stress and Strain*, Hibbeler's
*Mechanics of Materials*, the AISC/AWC beam diagrams. Internal units are strict
SI: newtons (N), meters (m), pascals (Pa).

## Section properties — rectangle (b × h)

| Quantity | Formula |
|---|---|
| Second moment of area, `I` | `I = b·h³ / 12` |
| Section modulus, `S` | `S = b·h² / 6`  (= `I / c`, with `c = h/2`) |
| Extreme-fiber distance, `c` | `c = h / 2` |

## Beam cases (span / length `L`)

Reactions `R`, max shear `V`, max moment `M`, max deflection `δ`.

### Simply supported, central point load `P`
- `R = P/2`
- `V = P/2`
- `M = P·L / 4`            (at midspan)
- `δ = P·L³ / (48·E·I)`    (at midspan)

### Simply supported, uniform load `w` (force/length)
- `R = w·L / 2`
- `V = w·L / 2`
- `M = w·L² / 8`           (at midspan)
- `δ = 5·w·L⁴ / (384·E·I)` (at midspan)

### Cantilever, point load `P` at the free end
- `R = P`
- `V = P`
- `M = P·L`                (at the fixed support)
- `δ = P·L³ / (3·E·I)`     (at the free end)

### Cantilever, uniform load `w`
- `R = w·L`
- `V = w·L`
- `M = w·L² / 2`           (at the fixed support)
- `δ = w·L⁴ / (8·E·I)`     (at the free end)

## Bending stress and the checks

- Peak bending stress (extreme fiber): `σ = M / S`
- **Strength check:** `utilization = σ / Fb`. `> 1.0` fails; `> 0.9` is the
  no-margin "edge"; otherwise it passes on strength.
- **Serviceability check:** stiffness ratio `L / δ` compared against `L/240`
  (conservative total-load limit). Below it: strong but it bounces.

## Material constants

E = elastic modulus, Fy = yield, Fb = allowable bending stress (ASD-flavored,
deliberately conservative). These are representative textbook values for
intuition, **not** project-specific certified properties.

| Material | E | Fy | Fb (allowable) | Basis |
|---|---|---|---|---|
| Steel ASTM A36 | 200 GPa | 250 MPa | 165 MPa | Fb ≈ 0.66·Fy (classic ASD) |
| Aluminum 6061-T6 | 69 GPa | 240 MPa | 145 MPa | Fb ≈ 0.6·Fy (rough) |
| Titanium Ti-6Al-4V | 114 GPa | 880 MPa | 528 MPa | Fb ≈ 0.6·Fy |
| Wood Douglas Fir-Larch | 11 GPa | — | 6.9 MPa | ≈ 1000 psi typical Fb |

## The refusal — reinforced concrete

Reinforced concrete is **deliberately present and deliberately refused** for the
`σ = M/S` check. RC cracks in tension by design: concrete takes compression,
steel rebar takes tension. Modeling it as one homogeneous elastic block gives a
confident, *wrong* number. An honest answer requires **ACI 318** — rebar area and
placement, concrete cover, φ strength-reduction factors, cracked-section /
transformed-section analysis. So the engine withholds the stress number and says
so. The deflection sketch (gross `E·I`) is shown only as a rough order of
magnitude, also caveated.

This refusal is not a missing feature. It is the feature.

## What this does NOT cover (on purpose)

Buckling (local or lateral-torsional), shear stress distribution, torsion,
combined/biaxial bending, axial–bending interaction, fatigue, connection design,
bearing, dynamic/seismic/wind load combinations, load factors and code
combinations (ASD vs LRFD), creep, and your jurisdiction's building code.

**A licensed PE who stamps the drawing owns the result. This bench never does.**
