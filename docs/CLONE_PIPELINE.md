# Clone Pipeline — from your camera to a fighter in the Arena

The program behind the **[Clone](../src/app/clone/page.tsx)** tab: capture
yourself, turn it into a game-ready fighter, and drop it into the roster. Built
so every stage works with *placeholders* today and upgrades in place as
generation providers come online.

```
CAPTURE ─→ CHARACTER SHEET ─→ 3D MESH ─→ RIG ─→ MOTION ─→ IN-GAME
(Clone tab)   (multi-view)     (image→3D)  (auto)  (mocap)   (Arena/Construct)
```

---

## Stage 1 · CAPTURE — the Clone tab (built, works now)

Open **Clone** in the app (or `/clone` on web over https/localhost).

- **Camera picker** lists every video input. On macOS an **iPhone (17 or
  otherwise) appears automatically via Continuity Camera** — unlocked, nearby,
  same Apple ID. No cable, no companion app. It is the better sensor: use it.
- **Turnaround** — 4 stills with a 3-second timer: front, left ¾, right ¾, back.
  Even lighting, plain background, same distance, arms relaxed.
- **Motion clip** — 5–10s of one clean technique (a shot, a sprawl, a jab).
- Everything stays **local in the browser** until you hit *download*. Nothing
  uploads on its own.

Save exports to `public/assets/clone/` as `clone-front.png`, `clone-left.png`,
`clone-right.png`, `clone-back.png`, `clone-motion.webm`.

> macOS will prompt for camera access on first use — that's
> `NSCameraUsageDescription` in [`src-tauri/Info.plist`](../src-tauri/Info.plist),
> with the matching entitlement for notarized builds.

## Stage 2 · CHARACTER SHEET — consistent multi-view

Feed the 4 stills in as reference to produce a clean, consistent model sheet in
the Aether art direction (indigo/gold, stylized, game-readable).

- **Higgsfield** — the `character-sheet` workflow (`get_workflow_instructions`
  → `{workflow: "character-sheet"}`), then `generate_image` with your turnaround
  as reference elements. Best consistency across views.
- **Gemini 2.5 Flash Image** — alternative; strong character consistency and
  conversational editing ("same fighter, now guard stance").

Output → `public/assets/generated/hero/` (see `manifest.json` → `hero`).

## Stage 3 · 3D MESH — image to model

- **Higgsfield** `generate_3d` (image → GLB) — fastest path from the sheet.
- Alternatives: Meshy.ai, Tripo3D, Rodin.

Keep the mesh under ~30k tris for real-time use.

## Stage 4 · RIG — make it move

- **Adobe Mixamo** — free auto-rigger; upload the GLB/FBX, get a skeleton plus
  a library of stock animations. Fastest legitimate route.
- Cascadeur for hand-keyed physics-accurate action.

## Stage 5 · MOTION — your real technique, retargeted

This is the highest-leverage step for a *martial arts* game, and the reason
Stage 1 records video at all:

- **Video → 3D mocap**: DeepMotion, Plask, or Rokoko Video. Upload
  `clone-motion.webm`; get an animation clip; retarget onto the rig.
- **Higgsfield** `motion_control` (recast / puppeteer / motion transfer) for
   2D-video motion restyling.

Film the real thing rather than prompting for it — a wrestler's actual shot
looks nothing like a text-to-motion guess.

## Stage 6 · IN-GAME

- **2D path (working today):** export sprite frames from the sheet and swap them
  for the vector silhouettes in `public/play/index.html`. The manifest's
  `sprites` category already lists the 10 action frames (idle, shot, sprawl,
  clinch, throw, pass, armbar, RNC, tap, victory).
- **3D path (later):** load the rigged GLB in the Construct tab.

Track status on the **Construct** tab's *Asset pipeline* board — every row shows
`placeholder → queued → generated`.

---

## Provider wiring

| Need | Primary | Status |
|---|---|---|
| Stills / character sheet | Higgsfield `generate_image`, Gemini | Gemini wired in `scripts/generate-assets.mjs`; Higgsfield via MCP |
| Video / animation loops | Higgsfield `generate_video`, Runway, Luma | manifest `animations` category |
| 3D mesh | Higgsfield `generate_3d`, Meshy, Tripo | manual for now |
| Motion transfer | Higgsfield `motion_control`, DeepMotion | manual for now |
| Voice / announcer | Higgsfield `create_voice`, ElevenLabs | not wired |

**Current caveat:** the Higgsfield MCP server connects and disconnects between
sessions. When it's connected, generation can be driven directly from chat; when
it isn't, use `npm run assets:generate` with a Gemini key, or the Higgsfield web
app, and drop results into `public/assets/generated/`. Either way the manifest
and the Construct board stay the source of truth.

## Privacy

Your likeness is personal data. The Clone tab is deliberately local-only and
uploads nothing automatically. Sending captures to a third-party generator is an
explicit, manual step — do it knowingly, and check the provider's terms on
training and retention before uploading your face.
