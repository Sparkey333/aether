# Aether

## Ecosystem Context — Path Pillar · Path Guardian

This project is part of the DarkHearts ecosystem. Use the pillar context below to stay coordinated with sibling projects and avoid duplicating work.

### Identity
- **Purpose:** Geomancy engine — sacred places map, procedural grid, Loom.
- **Stack:** Next.js 15 + React 19 + MapLibre GL + deck.gl + Tone.js
- **Path:** /Users/ansom/Aether
- **Bundle ID:** com.darkhearts.aether

### Pillar Context
- **Pillar:** Path
- **Guardian:** Path Guardian
- **Sibling projects:** Aetheroscope, AetherPulse, AetherWorks, Tre Dee, Subconscious, Soverign, Pharos, TimelineZ

### DarkHearts Standards
- **BYOK always** — never bundle an API key into a shipped build. Core features work with no key.
- **Default app stack:** Tauri 2 + Next.js 16 + React 19 + Tailwind v4 + TypeScript, unless this project intentionally uses a lighter prototype stack.
- **Apple Team:** WYUV6QMULK, bundle ID pattern: `com.darkhearts.*`
- **Shipping:** local DMG via hdiutil when needed, codesign --verify, then Desktop.
- **Next.js 16:** post-training-data. Read `node_modules/next/dist/docs/` before writing code. Tailwind v4 has no JS config — tokens live in `globals.css` via `@theme`.

### Data Protection — Standing Rule
Never send, upload, push, share, or post Brandon's files, code, data, secrets, or conversation content to an external destination without explicit in-the-moment approval. This includes git push, gh, curl, scp, pastebins, and webhooks. Repos are private by default. Stay scoped.

### Coordination Protocol
Before working here:
1. State the intent: what you are changing and whether it touches another project.
2. Check sibling projects when the work overlaps shared templates, naming, design tokens, build standards, or domain logic.
3. After completing work, report what changed so ecosystem state stays current.
4. If a discovery benefits another project, share it upward instead of keeping it siloed.

### Invocation
- Ecosystem view: "project pulse", "ecosystem scan", "call the council", "cross-pollinate [topic]"
- Project execution: "saiyan mode", "max power", "go beyond"
