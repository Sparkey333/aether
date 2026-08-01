# Release, Notarize & Publish — Runbook

How Aether gets from this repo to a Mac someone can actually open, and the
honest timeline for charging money for it.

---

## 1. The one-command build (your Mac)

```bash
npm install
npm run tauri:build
# → src-tauri/target/release/bundle/dmg/Aether_0.1.0_aarch64.dmg
```

Unsigned builds work fine for **you** — macOS just needs right-click → **Open**
the first time. Signing/notarization is only required so *other people* don't
hit a Gatekeeper wall.

## 2. The automated build (CI) — recommended

[`.github/workflows/release-mac.yml`](../.github/workflows/release-mac.yml) builds
on a `macos-14` (Apple-silicon) runner, signs, notarizes, staples, verifies, and
publishes the `.dmg` to a GitHub Release.

- **Tag push** → `git tag v0.1.1 && git push origin v0.1.1` → versioned release.
- **Manual** → Actions → *Release macOS* → **Run workflow** → rolling `mac-latest`.

It degrades gracefully: **with no Apple secrets set it still produces an
unsigned, downloadable `.dmg`** (with a warning), so you can test today and add
signing later.

### Required repo secrets (Settings → Secrets → Actions)

| Secret | What it is |
|---|---|
| `APPLE_CERTIFICATE` | Your **Developer ID Application** `.p12`, base64'd: `base64 -i cert.p12 \| pbcopy` |
| `APPLE_CERTIFICATE_PASSWORD` | Password you set when exporting the `.p12` |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (WYUV6QMULK)` |
| `APPLE_TEAM_ID` | `WYUV6QMULK` |
| **Notarization — pick one path** | |
| `APPLE_API_KEY` + `APPLE_API_ISSUER` + `APPLE_API_KEY_CONTENT` | App Store Connect API key (**preferred** — no 2FA friction) |
| `APPLE_ID` + `APPLE_PASSWORD` | Apple ID + an **app-specific password** (not your real one) |

### Getting the certificate
1. Enrol in the **Apple Developer Program** ($99/yr) — *this is the long pole,
   approval commonly takes 24–48h and can take longer.*
2. Xcode → Settings → Accounts → Manage Certificates → **+** → *Developer ID
   Application*.
3. Keychain Access → right-click the cert → **Export** → `.p12` → set a password.

### Manual notarization (if you ever bypass CI)
```bash
xcrun notarytool submit Aether_0.1.0_aarch64.dmg \
  --apple-id "$APPLE_ID" --team-id WYUV6QMULK --password "$APPLE_PASSWORD" --wait
xcrun stapler staple Aether_0.1.0_aarch64.dmg
xcrun stapler validate Aether_0.1.0_aarch64.dmg   # must say "worked"
spctl --assess --type execute -vv /Applications/Aether.app
```
Notarization itself is **fast — usually 2–15 minutes.**

## 3. Camera entitlements (Clone Studio)

Notarized apps run under **Hardened Runtime**, which blocks the camera unless
declared. Already wired:
- [`src-tauri/entitlements.plist`](../src-tauri/entitlements.plist) — `com.apple.security.device.camera`, audio-input, JIT, network client.
- [`src-tauri/Info.plist`](../src-tauri/Info.plist) — `NSCameraUsageDescription` (the text in the macOS permission prompt).

If the camera prompt never appears: System Settings → Privacy & Security →
Camera → enable Aether → relaunch.

---

## 4. Honest timeline — what "making money" actually looks like

I'd be doing you a disservice to pretend a paid Mac app can be earning by
tomorrow. Here's the real sequencing:

| Path | Earliest realistic revenue | Gate |
|---|---|---|
| **Digital product** (sell the Martial Codex as a PDF/web bundle on Gumroad, Lemon Squeezy, Ko-fi) | **Today / tomorrow** | None. No Apple, no review. |
| **Direct-download Mac app** (notarized `.dmg` sold from your own page) | **~2–4 days** | Apple Developer enrolment (24–48h) → notarize (minutes) |
| **Mac App Store** | **~4–10 days** | Enrolment + App Store review (1–3 days, often more on first submission) |
| **iOS App Store** | **1–2 weeks+** | Same + stricter first review |

**So the fastest legitimate path to revenue tomorrow is not the app.** It's the
thing that's already finished and differentiated: the **134-style Martial
Codex**. The free playable Arena is the top of funnel; the Codex is the product;
the Mac app follows once Apple clears you.

Recommended ordering:
1. **Today** — put the free Arena somewhere public (itch.io / GitHub Pages) as the hook.
2. **Today** — list the Codex as a paid digital download; price it $9–19.
3. **Now** — start Apple Developer enrolment (it's the blocker; begin the clock).
4. **Day 2–4** — notarized `.dmg` sold direct, and/or free with a paid tier.
5. **Later** — App Store, once there's proof anyone wants it.

> Ship free things fast to learn whether the paid thing has an audience. The
> Codex's research depth is the moat — not the prototype game.

## 5. Distribution checklist

- [ ] Apple Developer enrolment started
- [ ] Secrets added to GitHub → run *Release macOS*
- [ ] `stapler validate` passes on the produced `.dmg`
- [ ] Tested on a **second** Mac (proves signing works for other people)
- [ ] Landing page with the free Arena embedded
- [ ] Paid product live (Codex bundle)
- [ ] Public repo README links the release
