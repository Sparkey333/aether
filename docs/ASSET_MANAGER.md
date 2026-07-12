# The Vault — Aether Asset Manager

One place for every asset in the DarkHearts ecosystem — spiritual, physical,
and virtual; 2D, 3D, vectors, backgrounds, audio, and video. The Vault
**touches every app and folder you point it at, pulls in copies** of the
assets they use and generate, and lets you **reuse, tweak, and regenerate**
them through **Higgsfield**, wired straight in.

Open it at **`/vault`** (third tab in the top nav).

## The three moving parts

| Part | File | What it does |
|---|---|---|
| **Source map** | [`aether.assets.config.json`](../aether.assets.config.json) | Declares every app/folder the Vault connects to — Aetheroscope, AetherPulse, AetherWorks, Tre Dee, Subconscious, Soverign, Pharos, TimelineZ, GameAssets, Higgsfield downloads, and this repo's own `public/assets/`. |
| **The sync** | [`scripts/asset-sync.mjs`](../scripts/asset-sync.mjs) | Walks each source, copies assets into `public/vault/store/<source>/` (content-hash deduped), classifies each by **kind** (2d / vector / 3d / video / audio), **realm** (spiritual / physical / virtual), and **role** (element / background / model / motion / audio), and writes the index: `public/vault/catalog.json`. |
| **The Forge** | [`src/lib/higgsfield.ts`](../src/lib/higgsfield.ts) + the Vault UI | Higgsfield, linked in. Generate new assets from a prompt, or select any Vault asset → **Use in Forge** → edit/animate it. Results save straight back into the Vault with full lineage (`parentId`, prompt, model). |

## Quickstart

```bash
npm run assets:sync          # pull copies in from every reachable source
npm run dev                  # open http://localhost:3000/vault
```

Sources whose folders aren't on this machine are **skipped, never fatal** —
their previously-synced assets stay catalogued and are flagged offline. So the
config can list every folder across all your machines.

To connect a new app or folder, add an entry to `aether.assets.config.json`:

```jsonc
{
  "id": "myapp",
  "label": "My App",
  "root": "~/MyApp",            // ~ and $ENV expand
  "include": ["public", "assets"],
  "realm": "virtual",            // default realm; path keywords can override
  "tags": ["myapp"]
}
```

and run `npm run assets:sync` (or press **⟳ Sync sources** in the UI — in web
dev mode it runs the script for you).

## Classification — keep every layer, label every layer

Same doctrine as the Codex. Nothing is filtered out; everything is tagged:

- **Kind** comes from the file extension (`extensions` map in the config).
- **Realm** comes from the source's default, overridden by path keywords —
  `sigil|tarot|chakra|temple|sacred|ley|…` → *spiritual*,
  `photo|scan|terrain|map|…` → *physical*,
  `sprite|ui|mesh|skybox|…` → *virtual*.
- **Role** flags backgrounds (`background|backdrop|skybox|arena|dojo|…`),
  models, motion, and audio so "all the backgrounds" is one click.
- **Origin** — the absolute path the copy came from — rides on every asset;
  click it in the inspector to copy.

## Higgsfield (the Forge)

**BYOK, always.** Paste your `KEY:SECRET` pair from
[platform.higgsfield.ai](https://platform.higgsfield.ai) into the Forge panel;
it lives in `localStorage` on that device only and is never bundled into a
build. The browser talks to Higgsfield's API directly (their CORS allows it —
verified against both web and `tauri://` origins), so the Forge works
identically in web dev and the shipped Mac app.

Wired models (registry in `src/lib/higgsfield.ts` — easy to extend):

| Model | Endpoint | Use for |
|---|---|---|
| **Higgsfield Soul** | `/v1/text2image/soul` | flagship text→image stills |
| **FLUX.1 Kontext Max** | `/flux-pro/kontext/max/text-to-image` | graphic elements, backgrounds |
| **Seedream v4** | `/bytedance/seedream/v4/text-to-image` | fast 2K stills |
| **Seedream v4 Edit** | `/bytedance/seedream/v4/edit` | **tweak an existing Vault asset** |
| **DoP Turbo** | `/v1/image2video/dop` | animate a still into video |

The tweak flow: select an asset → **Use in Forge** → the Vault uploads it to
Higgsfield's CDN (`/files/generate-upload-url`) to get a reference URL → the
edit/i2v model runs against it → **Save to Vault** writes the result to
`public/vault/generated/` with a `.meta.json` sidecar carrying the prompt,
model, and `parentId` — the full lineage from source asset to regen.

In the static Tauri build there's no local server to write files, so **Save to
Vault** falls back to opening the result for download — drop it in
`~/Downloads/higgsfield/` (already a configured source) and the next sync
vaults it.

## What's in git vs. what's local

`public/vault/catalog.json` (the index) is committed; the binary copies in
`public/vault/store/` and `public/vault/generated/` are gitignored and
re-pulled by the sync — same policy as the existing `assets:generate`
pipeline. Local-first: nothing leaves the machine except the prompts and
reference images you explicitly send to Higgsfield.
