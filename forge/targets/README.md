# Targets — one folder per project you clone or study

Each target holds the **intelligence** you accumulate about a project: its recon,
your plan, the running log, and the final eval. This is tracked in git because the
accumulated understanding is the real asset — the working clone in `clones/` is
disposable, this is not.

```
targets/<name>/
  target.yaml   # metadata: url, tier, status, scorecard
  RECON.md      # the map (step 1)
  PLAN.md       # the ordered build (step 2)
  LOG.md        # the honest running record (step 3)
  EVAL.md       # the scorecard + lessons (step 6+)
```

Scaffold one with:

```bash
forge clone https://github.com/owner/repo medium   # clone + scaffold together
# or, without cloning:
forge target my-target --tier small
```

`_TEMPLATE/` is the source the scaffolder copies — edit it to change the shape of
every future target.
