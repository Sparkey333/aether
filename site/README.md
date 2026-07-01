# site/ — the bound corpus (generated)

`aether.html` is a **single, self-contained, offline** HTML rendering of the entire
written corpus — the canon soul-files (`content/canon/`), the design docs (`docs/`),
and the Resonance Lab build ladder (`docs/resonance/`). No server, no network, no
external assets: open the file in any browser and read.

It is a **build artifact** — do not edit `aether.html` by hand. Edit the markdown
sources, then regenerate:

```
npm run html          # = node ./scripts/build-html.mjs
```

The renderer (`scripts/build-html.mjs`) resolves `[[wikilinks]]` and relative `.md`
links into in-page anchors, colours the ☠/⚠ danger banners, and builds the sidebar
table of contents. Markdown is converted by a **vendored** copy of `marked`
(`scripts/vendor/marked.esm.js`, MIT) so the build stays offline and deterministic —
no install step required.
