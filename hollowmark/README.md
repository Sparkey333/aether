# HOLLOWMARK — Ashes of the Warden Crown

A Jak 2-inspired action-platformer with an all-new world, story, and cast.
This folder is a self-contained **Unity 6 (URP)** project: the vertical-slice
codebase for movement, combat, the Hollow transformation, enemies, the Skiff
hoverboard, and the mission/checkpoint/save spine.

> Full design: [`docs/GDD.md`](docs/GDD.md) · Slice scope: [`docs/VERTICAL_SLICE.md`](docs/VERTICAL_SLICE.md) · Code rules: [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)

## Getting started

1. Install **Unity 6 LTS** (any `6000.0.x`) via Unity Hub.
2. In Unity Hub: **Add → Add project from disk** and pick this `hollowmark/` folder.
3. Open the project and let packages resolve (first import takes a few minutes).
4. Run the menu item **`Hollowmark → Bootstrap All`**. This will:
   - create and assign a URP pipeline asset tuned for the retro look (low render scale),
   - generate the four Splitfang gun-core assets,
   - build and open the greybox **Playground** scene (player, camera, arena,
     enemies, boss, skiff, sparks, checkpoints, HUD).
5. Press **Play**.

No paid assets, no manual scene wiring, no tag/layer setup required — everything
is primitives and code.

## Controls

| Action | Keyboard / Mouse | Gamepad |
|---|---|---|
| Move | WASD | Left stick |
| Camera | Mouse | Right stick |
| Jump / double jump | Space | South (A / Cross) |
| Dash | Left Shift | East (B / Circle) |
| Melee combo | F | West (X / Square) |
| Fire Splitfang | Left mouse | Right trigger |
| Swap gun core | E / Q | RB / LB |
| Hollow form | T | D-pad up |
| Interact | C | North (Y / Triangle) |
| Mount / dismount Skiff | X | D-pad down |

## Project layout

```
Assets/_Project/
  Code/
    Core/      shared contracts: input, health/damage, events, buffs
    Player/    motor, controller, orbit camera
    Combat/    Splitfang + gun cores, projectiles, melee
    Hollow/    Hollow form, meters, corruption, Hollow Lash
    Enemies/   Rend grunts/spitters, spawner, Vat-Thing boss
    Skiff/     hoverboard physics + mounting
    Systems/   game manager, checkpoints, sparks, save, missions
    UI/        runtime-built HUD
    Editor/    one-click bootstrap (URP, cores, playground scene)
  Levels/            generated scenes
  ScriptableObjects/ generated gun-core assets
```

## Notes

- The slice uses a hand-rolled **OrbitCamera** and **code-defined input
  actions** so it runs with zero editor configuration. Cinemachine and the
  Input System package are installed and ready for when you want to graduate
  to authored assets.
- Retro look: URP render scale ~0.5 + point filtering + primitives. Push it
  further with a PSX-style shader pack later.
