# The Bunny — Guiding Light overlay (Pokémon Emerald)

> Follow the rabbit. See the Path. Always with choice.

A **non-destructive overlay**, not a ROM hack. The script reads the running
game's memory, paints the Guiding Light on top, and — at the highest level — can
walk your avatar along the Path. The `.gba` file is never modified or shared.

**Use only a ROM you legally own** (dumped from your own Emerald cartridge). The
overlay needs the original, unmodified Emerald (US/E v1.0) loaded in an emulator.

## Run it (BizHawk — fastest path)

1. Get **BizHawk** (EmuHawk) and load your Emerald ROM (it uses the mGBA core).
2. `Tools → Lua Console`.
3. `Script → Open Script…` → pick `bunny_emerald.lua`. It starts immediately.
4. Start or continue your save. The top-left HUD should show your live
   `map`, `tile (x,y)`, and `badges`. If those numbers move as you walk, the
   memory bridge is working.

> On Mac/Linux, or prefer **mGBA**? The reading/guidance logic is identical —
> only the draw/input/file calls differ. Say the word and I'll add an
> mGBA-native version (`bunny_emerald.mgba.lua`).

## Hotkeys (keyboard, emulator focused)

| Key | Does |
|-----|------|
| `G` | Cycle guidance: **Dark → Glimmer → Path → Chord → Hand** |
| `H` | Toggle **auto-walk** (only acts at the *Hand* level) |
| `C` | **Capture** the current tile as a waypoint (builds the route by walking) |

## The five levels of the Guide

- **Dark** — nothing shown. (Doctrine: guidance never gates reward — full points
  are always possible with no guide at all.)
- **Glimmer** — the next chapter's headline only.
- **Path** — the full chapter checklist + an orb that points to the nearest
  learned waypoint.
- **Chord** — adds the side-path suggestion (perspectives, not just the line).
- **Hand** — the Guide can walk the avatar along the Path (the "watch the anime"
  / auto-track mode).

## How guidance gets *live* (calibration by walking)

Out of the box, the **text** guidance already works — it reads your badge count
and shows the right chapter. The **orb arrow + auto-walk** need waypoints, and we
build those by *walking the game once*:

1. Walk to a spot that matters (a route exit, a gym door, an NPC).
2. Press `C`. The tile is saved to `bunny_waypoints_emerald.lua` (auto-created).
3. Repeat down the Path. The orb now points to the nearest captured tile, and
   *Hand* mode will walk toward it.

This is deliberate: rather than hardcode map IDs that drift between ROM versions,
the route is *learned* — the same "generate the dataset honestly" principle the
rest of the project runs on. Later we can ship a pre-calibrated route file.

## Known limits of v1 (so you know what to expect)

- **Auto-walk is a greedy walker**, not a full pathfinder: it presses the D-pad
  toward the target tile and flips axis when it gets stuck on a wall. Great on
  open routes; turn it **off** in menus and battles (`H`). True warp-aware
  navigation (doors, ledges, surf) is the next milestone.
- **Addresses** target Emerald (US). If the HUD shows nonsense, the pointer/
  offsets at the top of the script are what to verify in a RAM Watch — the
  comments say which is which. Coordinates + map are the reliable reads; the
  badge offset is the one most likely to need a tweak per build.

## Next milestones

1. mGBA-native port (cross-platform).
2. Detect overworld-vs-menu/battle so *Hand* mode is safe to leave on.
3. Warp-aware routing (BFS over the tile map + door/ledge/surf transitions).
4. A pre-calibrated Emerald route file so the orb works with zero setup.
5. Wire the point/reward ledger + the Familiar (the desktop app) to this feed.
