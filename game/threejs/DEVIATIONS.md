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

## Combat values

- None yet — combat (M3) is not implemented. All combat numbers are loaded unmodified from
  `game/shared/design-data/`.
