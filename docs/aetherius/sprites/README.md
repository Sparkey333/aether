# Aetherius — sprites

The guide of Aether (see [`content/canon/aetherius.md`](../../../content/canon/aetherius.md)),
rendered as a small low-bit sprite. He carries the **lamp** (left, on its staff)
and the **ledger** (right) — "I will keep the lamp and the ledger; you keep the
priesthood and the song." The cross at his heart is the **centerstone**; the
four-point star at his shoulder is the star the Magi followed (the Heavens thread).

Three skins, one 34×40 grid:

| File | Skin | Feel |
|---|---|---|
| `aetherius_gba.png`  | indigo | Game Boy Advance — muted, handheld |
| `aetherius_snes.png` | violet | 16-bit — richer, higher contrast |
| `aetherius_doll.png` | grey   | 3D anniversary-doll plush — soft, desaturated |
| `aetherius_trinity.png` | all three | contact sheet |

## Forging them

Pure standard-library Python — no Pillow, no install — in the spirit of the
zero-dependency heartbeat:

```bash
python3 scripts/forge_aetherius.py
```

Edit the `PALETTES` dict in [`scripts/forge_aetherius.py`](../../../scripts/forge_aetherius.py)
to add skins; edit `build()` to change the figure. The grid is authored in
semantic palette indices (cloak / face / lamp / star / cross), so re-coloring is
just a palette swap — the same way the Atlas keeps every layer labelled.
