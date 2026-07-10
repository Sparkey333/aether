# HOLLOWMARK — Vertical Slice

**Goal:** prove the pillars in one greybox playground. If running, jumping,
shooting, and going Hollow are fun in an empty arena, the game is fun.

## What this code drop contains

1. **Player motor** — CharacterController movement: accel/decel, air control,
   variable-height jump, double jump, coyote time, jump buffering, dash with
   cooldown, knockback impulses, camera-relative movement.
2. **Orbit camera** — hand-rolled third-person follow with collision pull-in
   (Cinemachine installed for later; the slice needs zero editor setup).
3. **Combat** — melee 3-hit combo with launcher; the **Splitfang** with four
   swappable **GunCoreDefinition** ScriptableObjects (Maw shotgun, Lance
   hitscan, Swarm auto, Sunder charge-and-chain), projectiles, tracers, ammo.
4. **Hollow form** — kill-fed meter, transform with stat buffs and visual
   corruption, a corruption sub-meter that punishes overuse with lost
   control, and the Hollow Lash shockwave.
5. **Enemies** — Rend grunt (chase/attack state machine), Rend spitter
   (ranged), wave spawner, and the **Vat-Thing** two-phase boss.
6. **Skiff** — rigidbody hoverboard: 4-point hover springs, thrust, steer,
   boost, jump, mount/dismount.
7. **Systems** — GameManager respawn loop, checkpoints, Warden Spark pickups
   + wallet, JSON save, lean mission tracker.
8. **HUD** — built entirely at runtime: health, Hollow + corruption meters,
   core name + ammo, sparks, boss bar, announcements, death fade.
9. **Editor bootstrap** — `Hollowmark → Bootstrap All` menu: URP retro
   config, gun-core assets, and the full greybox Playground scene.

## Build order for what comes next

Movement feel → combat feel → Hollow loop → one district streaming →
mission framework content → Skiff race mode → Drifter traffic → Act I
missions. Tune the jump arc before anything else. Always.

## The fun test

Spawn → sprint the platform gauntlet → dash-jump into the arena → clear two
waves swapping cores mid-fight → go Hollow on the boss → ride the skiff loop
→ bank sparks at the checkpoint. If that 3-minute loop makes you grin,
green-light the next system.
