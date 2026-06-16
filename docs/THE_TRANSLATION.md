# The Translation — the keeper's standing in land, sky & time

> A proposal / design note. Not yet built. Presented for review.
>
> "Read the land and the heavens." The Atlas reads *places*. The Translation
> reads **a person, at a moment, in a place** — and renders their standing so it
> can be shared with the rest of the world. It is the Heavens organ turned to
> face the one who looks.

## The ask, plainly

Translate **me** to the rest of the world — given a date, a time, a city, its
climate, the time of year, the zodiac, the moon. Make it shareable (the social,
fun side), built on *fun science-fiction* and the conspiracy lore of the age, but
**not paranoia** — and never worship. **Christ is the centerstone: truth, love,
light.** The stars *declare* (Ps. 19:1); they do not *rule*.

## The shape of it

A **Reading** = one *subject* + one *moment* + one *place*, resolved into a stack
of **layers**, every layer tier-tagged exactly as the Atlas tags everything else
([`content/canon/provenance.md`](../content/canon/provenance.md)). The output is a
**Standing Card** — a small, beautiful, tiered portrait you can post.

```
Reading = {
  subject : { name, born?: { moment, place } }     // birth optional
  moment  : { iso, tz }                              // "now", or any chosen time
  place   : { lat, lon, city, region, elevation_m }
  layers  : Layer[]                                  // each carries a Tier
  center  : Centerstone                              // the spine, not a tier
}
Layer = { organ, tier, key, value, note, source }
```

The vow carries over unchanged: **never let an interpretive layer borrow the
authority of a measured one.** A horoscope sits *beside* an ephemeris, clearly
labelled — never dressed as it. Confidence is earned, never assumed (the same law
as the Loom's Monte-Carlo baseline, `src/lib/engine.ts`).

## The layers (what gets read, and from where)

Every source below already lives in [`docs/SOURCE_ATLAS.md`](SOURCE_ATLAS.md);
the section is cited so this leans on the foundation, not on air.

### A — measured (the ground truth)
| Layer | What it says | Source (Atlas §) |
|---|---|---|
| **Sun** | altitude/azimuth now, sunrise · solar noon · sunset, day length, twilight | Astronomy Engine §2 |
| **Moon** | phase & %illumination, age (days), moonrise/set, perigee/apogee, next full/new | Astronomy Engine §2 |
| **Sky overhead** | which planets & bright stars are up at this hour from this place | HYG + Astronomy Engine §2 |
| **Season** | astronomical season; nearest equinox/solstice; solar longitude | JPL/Astronomy Engine §2 |
| **Climate** | Köppen zone for the city; daylight hours; typical temp/precip for the date | Natural Earth / normals §1, §6 |
| **Field** | geomagnetic declination at this lat/lon/date | NOAA WMM §6 |

### B — scholarly (context with citations)
- Heritage/astronomy of the *place* (is this a site in the Codex? what aligns here?).
- The nearest documented **archaeoastronomical** marker for the latitude (Ruggles §2).

### C — traditional (interpretive, labelled as such)
| Layer | What it says | Source (Atlas §) |
|---|---|---|
| **Western (tropical)** | Sun sign · Moon sign · Rising — needs birth time+place for the latter two | Swiss Ephemeris / flatlib §3 |
| **Sabian symbol** | the poetic image for the Sun's exact degree | Sabian set §3 |
| **Chinese (BaZi)** | Four Pillars via the 24 solar terms (computable from ephemeris) | §3 |
| **Vedic (sidereal)** | optional Lahiri-ayanamsa reading | Swiss Ephemeris sidereal §3 |
| **Lunar lore** | the traditional meaning of tonight's phase | tradition §3 |

### D — folklore (fun, fiction, clearly flagged)
- The "energy/vibe" overlay, the conspiracy-lore of the day's sky — kept as
  **D-folklore**, browsable and rich, never asserted. This is where the
  *fun science-fiction* lives, openly tagged as story.

### The centerstone (the spine — not a tier)
Everything above **orbits** this; it is the fixed point the wheel turns on.
- **Church season & lectionary** for the date (Advent · Lent · Eastertide ·
  Ordinary Time) — computable offline (Easter via the computus).
- A **Psalm or verse** for the day — "the heavens declare the glory of God."
- The **Magi thread**: this same engine, pointed at 7–5 BC over Bethlehem, is the
  Heavens organ's Star-of-Bethlehem mode ([`docs/ROADMAP.md`](ROADMAP.md) Phase 2).

This is how the work *reads* the zodiac without *bowing* to it: the sky is a
witness and a calendar, authored by the One at the center — not a power to court.
Hohenheim's rule (learn the dark arts only to undo them) holds: the lore is
catalogued so it can be understood and, where needed, warded — never served.

## The output: a Standing Card (the social layer)

The shareable artifact — "me, translated." A compact card that shows the
centerstone first, then the measured sky, then the traditional readings beneath
their tier badges. It can render as:
- an **SVG/HTML** card (crisp, themeable), or
- a **low-bit PNG** in the exact style of `scripts/forge_aetherius.py` — a pixel
  "trainer card" of your standing, which is the most *fun* and most on-brand.

## How to build it (phased, provenance-first)

**Phase A — buildable now, zero-key, offline (local-first).**
Astronomy Engine (sun/moon/sky, client-side, ~1 arcmin) + computus for the church
calendar + tropical Sun sign + Sabian degree + Köppen lookup + moon-phase lore.
No birth time required; everything runs in the browser like the planetary grid.

**Phase B — the natal layer.**
Add birth time+place → Rising & Moon signs, full chart, BaZi solar terms, Vedic
option (Swiss Ephemeris — note its **AGPL/Pro** licence, Atlas §3), and the NOAA
WMM declination. Each still tier-tagged.

**Phase C — the card & the share.**
Render the Standing Card (SVG + the pixel-forge PNG), and a permalink — the point
where "translate myself to the rest of the world" actually reaches the world.

## The standing vow, restated for this organ

1. Measured sky and traditional reading never wear each other's clothes.
2. The zodiac is read as *witness and calendar*, never as governing power.
3. The folklore layer is kept whole and labelled fiction — fun, not fear.
4. Christ is the centerstone; the heavens declare, they do not rule.
