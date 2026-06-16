# Working inside The Forge

The Forge is the workshop organ: a cloning lab + masterclass + preference vault.
If you're an agent operating here, follow these rules.

## The doctrine (non-negotiable)
- **Measure, don't vibe.** Score clones against the target; don't call work done
  on a feeling. Provenance applied to our own output.
- **Protect the irreplaceable.** `profiles/`, `config/`, `presets/`, `doctrine/`
  and target/experiment notes are sensitive — backed up ≥5 generations deep.
  Never overwrite something you didn't create without flagging it. `forge backup`
  before risky edits; `forge restore <file>` to roll back.
- **One change at a time** when refining the technique — that's what an experiment
  is. Three changes at once teaches nothing.
- **Honesty about fidelity.** Distinguish what was reproduced and verified from
  what merely looks similar. Flag licensing, native deps, and domain-correctness
  risks rather than papering over them.

## The loop
Recon → Plan → Setup → Build → Verify → Eval → Refine → Promote.
Full text: `doctrine/METHOD.md`. The ladder: `doctrine/CLONING_LADDER.md`.

## The tools
- `scripts/forge.sh` (alias `forge`) — backup, restore, clone, target, experiment,
  status, doctor.
- Scaffolders copy from `_TEMPLATE/` dirs — edit those to reshape future items.
- Presets to set agents on their way: `presets/`.

## Where things go
- Study notes per project → `targets/<name>/` (tracked).
- Working clones → `clones/` (git-ignored, disposable).
- Technique changes → `experiments/<date-slug>/` (hypothesis before, result after).
- Your trained preferences → `profiles/` (the thing that compounds).

## House style
Match the constellation's voice in docs: plain, exact, a little reverent. Lead
with the answer. Reference files as `path:line`. Keep the craft in service.
