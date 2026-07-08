# Three.js build — logged deviations from the bible

Per the bible's comparability rule, any deviation from the shared spec is logged here (not silently
retuned), so the three engine builds stay honestly comparable.

## Rendering

- **Affine texture warp implemented via the 1/w trick, not `noperspective`.** The bible/engine doc
  specified the `noperspective` interpolation qualifier. **WebGL2 (GLSL ES 3.00) does not support
  `noperspective`** — it is a reserved word and fails to compile. Instead the vertex shader
  premultiplies UVs by clip-space `w` (`vUvW = uv * w`) and the fragment divides by interpolated `w`
  (`uv = vUvW / vW`); the perspective-correct interpolator then resolves to screen-linear UVs — the
  same visual result, portably. Files: `src/render/shaders/psx_world.{vert,frag}.glsl`.

## Physics / movement

- **M2 uses a custom kinematic controller without Rapier.** The bible specifies a custom kinematic
  Rapier character controller. For the first runnable greybox (flat ground) we ship a Rapier-free
  kinematic controller with circle-vs-AABB collision (`src/world/collision.ts`,
  `src/actors/CharacterController.ts`) to avoid WASM init in the first milestone. Movement is still
  frame-exact and deterministic. Rapier swept-capsule collision is the planned upgrade before slopes
  / the boss-pit kill volume (arena F) are needed.

## Combat (M3)

- **All combat numbers are loaded unmodified from `game/shared/design-data/`.** The one addition to
  the shared data is `flow.baseFpPerHit` (140): the bible's Flow section defines the rank thresholds,
  variety multipliers, decay, and `aeByRank`, but no explicit base FP granted per landed hit. 140 was
  added to `combat.json` (+ its type + schema) as the missing tuning constant rather than hard-coded in
  code — so the value stays in the shared contract and the other two engines read the same number.
- **Multi-hit move timing:** the schema gives a move one `active:[start,end]` window and a `hits[]`
  array. For multi-hit moves the active window is split into equal sub-windows (one hit each). This is
  a documented interpretation of the shared data, applied identically in all engines.
- **Deferred to a later pass (data + types already present, not yet wired):** launcher -> aerial-rave
  juggle chains, the dash-attack, and riposte's x3 multiplier. Parry currently negates + hard-staggers
  the attacker (its full punish), but does not yet arm the separate x3 riposte follow-up. `player-launcher`,
  `player-aerial-*`, `player-dash-thrust` exist in `moves.json` but are not bound to inputs yet.
- **Present cadence:** logic runs at a fixed 60 Hz (the determinism contract); the game currently also
  presents at 60 fps. The bible's 30-fps frame-doubled present (§4.8) is a one-constant toggle not yet
  applied — combat is frame-count based so it is purely cosmetic.

## Verification harness

- `playwright` (library only) is a devDependency for the headless screenshot/state check
  (`e2e/screenshot.mjs`). Browsers are the container's preinstalled Chromium
  (`executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome`); no browser download.
