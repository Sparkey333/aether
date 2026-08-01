// Builds the DarkHearts arcade cabinet: a single self-contained HTML shelf
// that catalogs every game in ../library.json and launches each one inline.
// No external fetches — posters are base64-inlined at build time — so the
// output drops into a VR room's browser-texture surface or a plain <iframe>
// with zero other files.
//
// Run: node darkhearts/scripts/build-cabinet.mjs [--local] [output-path]
//   --local   point "Launch" at each game's local build output (relative
//             path, for self-hosted/VR deployments served from this repo)
//             instead of its published demoUrl (the portable default).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(root);
const args = process.argv.slice(2);
const local = args.includes('--local');
const outPath = args.find((a) => !a.startsWith('--')) || path.join(root, 'dist/cabinet.html');

const library = JSON.parse(readFileSync(path.join(root, 'library.json'), 'utf8'));

const mimeByExt = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };

const games = library.games.map((game, i) => {
  const posterPath = path.join(root, game.poster);
  const posterData = readFileSync(posterPath);
  const posterMime = mimeByExt[path.extname(posterPath).toLowerCase()] || 'application/octet-stream';
  const poster = `data:${posterMime};base64,${posterData.toString('base64')}`;

  // Native titles (type: "native") are desktop binaries, not web pages —
  // they get repo links instead of an inline launch.
  const isNative = game.type === 'native';
  const launchSrc = isNative
    ? null
    : local
      ? path.relative(path.dirname(outPath), path.join(repoRoot, game.build.output)).split(path.sep).join('/')
      : game.demoUrl;

  return { slot: i + 1, ...game, poster, launchSrc, isNative };
});

const OPEN_SLOTS = 1;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const cartridgeCards = games.map((g) => {
  const midLine = g.isNative
    ? `<p class="cart-controls"><span class="label">build</span> ${esc(g.buildNote)}</p>`
    : `<p class="cart-controls"><span class="label">controls</span> ${esc(g.controlsNote)}</p>`;
  const actions = g.isNative
    ? `<a class="btn btn-launch" href="${esc(g.repoUrl)}" target="_blank" rel="noopener">Fork repo ↗</a>
            <a class="btn btn-open" href="${esc(g.upstreamUrl)}" target="_blank" rel="noopener">Upstream ↗</a>`
    : `<button class="btn btn-launch" data-launch="${esc(g.launchSrc)}" data-title="${esc(g.title)}">Launch inline</button>
            <a class="btn btn-open" href="${esc(g.launchSrc)}" target="_blank" rel="noopener">Open ↗</a>`;
  return `
      <article class="cart" style="--accent:${g.accent}">
        <div class="cart-poster"><img src="${g.poster}" alt="" width="96" height="96" /></div>
        <div class="cart-body">
          <div class="cart-top">
            <span class="slot">BAY ${String(g.slot).padStart(2, '0')}</span>
            <span class="chip">${esc(g.status.replace(/-/g, ' '))}</span>
          </div>
          <h2 class="cart-title">${esc(g.title)}</h2>
          <p class="cart-tagline">${esc(g.tagline)}</p>
          <p class="cart-blurb">${esc(g.blurb)}</p>
          ${midLine}
          <p class="cart-vr"><span class="label">vr note</span> ${esc(g.vrNote)}</p>
          <div class="cart-actions">
            ${actions}
          </div>
        </div>
      </article>`;
}).join('\n');

const openSlotCards = Array.from({ length: OPEN_SLOTS }, (_, i) => `
      <article class="cart cart-empty">
        <div class="cart-body cart-body-empty">
          <span class="slot">BAY ${String(games.length + i + 1).padStart(2, '0')}</span>
          <p class="empty-label">Open slot — next build fabricates here.</p>
        </div>
      </article>`).join('\n');

const html = `<title>DarkHearts — Game Library</title>
<style>
  /*
    DarkHearts vault: a curator's cartridge case, not a bright app store
    grid. One committed dark world, same call the games on this shelf make
    for their own HUDs — a vault door doesn't flip with the OS either.
  */
  :root {
    --void: #0b0a10;
    --iron: #1c1720;
    --iron-raised: #241d29;
    --bone: #e9e4d9;
    --bone-dim: #938f97;
    --hair: rgba(233, 228, 217, .12);
    --violet: #8c33d9;
    --violet-deep: #3a1660;
    --violet-text: #c39bf2;
    --teal: #35c9c2;

    --font-display: ui-sans-serif, "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
    --font-body: ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-data: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: var(--void); color: var(--bone); }
  body {
    font-family: var(--font-body); min-height: 100vh;
    background:
      radial-gradient(ellipse 900px 500px at 50% -8%, rgba(140, 51, 217, .16), transparent 60%),
      var(--void);
  }

  .wrap { max-width: 1080px; margin: 0 auto; padding: 40px 24px 64px; }

  header { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding-bottom: 36px; }
  .mark { display: flex; align-items: center; gap: 12px; }
  .mark img { width: 40px; height: 40px; display: block; }
  .wordmark {
    font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
    letter-spacing: .3em; font-size: 22px; color: var(--bone);
    text-shadow: 0 0 22px rgba(140, 51, 217, .4);
  }
  .mission { font-size: 13.5px; color: var(--bone-dim); max-width: 46ch; line-height: 1.6; }
  .status-line {
    font-family: var(--font-data); font-size: 11px; letter-spacing: .05em; color: var(--teal);
    display: flex; align-items: center; gap: 7px; margin-top: 4px;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 8px var(--teal); }

  .shelf {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px;
  }

  .cart {
    position: relative; background: var(--iron); border: 1px solid var(--hair);
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  }
  .cart::before {
    content: ""; position: absolute; inset: 0; clip-path: inherit; pointer-events: none;
    box-shadow: inset 0 0 0 1px var(--hair); border-top: 2px solid var(--accent, var(--violet));
  }
  .cart-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 8px; }
  .cart-poster { padding: 16px 20px 0; display: flex; justify-content: center; }
  .cart-poster img { border-radius: 6px; filter: drop-shadow(0 6px 18px rgba(0,0,0,.5)); }

  .cart-top { display: flex; align-items: center; justify-content: space-between; }
  .slot { font-family: var(--font-data); font-size: 10.5px; letter-spacing: .1em; color: var(--bone-dim); }
  .chip {
    font-family: var(--font-data); font-size: 10px; letter-spacing: .06em; text-transform: uppercase;
    color: var(--teal); border: 1px solid var(--hair); padding: 2px 7px;
  }
  .cart-title {
    font-family: var(--font-display); font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    font-size: 20px; color: var(--bone); margin-top: 2px;
  }
  .cart-tagline { font-size: 12.5px; color: var(--violet-text); font-style: italic; }
  .cart-blurb { font-size: 13px; color: var(--bone-dim); line-height: 1.55; }
  .cart-controls, .cart-vr { font-size: 11.5px; color: var(--bone-dim); line-height: 1.5; }
  .label {
    font-family: var(--font-data); font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--bone-dim); opacity: .8; margin-right: 5px;
  }

  .cart-actions { display: flex; gap: 8px; margin-top: 6px; }
  .btn {
    font-family: var(--font-data); font-size: 11.5px; letter-spacing: .06em; text-transform: uppercase;
    padding: 9px 14px; border: 1px solid var(--hair); background: var(--iron-raised); color: var(--bone);
    cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: border-color .15s, color .15s;
  }
  .btn:hover, .btn:focus-visible { border-color: var(--accent, var(--teal)); color: var(--accent, var(--teal)); outline: none; }
  .btn-launch { flex: 1; justify-content: center; }

  .cart-empty { opacity: .55; }
  .cart-body-empty { align-items: center; justify-content: center; text-align: center; min-height: 168px; gap: 10px; }
  .empty-label { font-size: 12px; color: var(--bone-dim); max-width: 24ch; }

  .vr-panel {
    margin-top: 40px; background: var(--iron); border: 1px solid var(--hair);
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    padding: 22px 26px;
  }
  .vr-panel h3 {
    font-family: var(--font-display); font-weight: 800; letter-spacing: .2em; text-transform: uppercase;
    font-size: 13px; color: var(--violet-text); margin-bottom: 12px;
  }
  .vr-panel ol { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .vr-panel li { font-size: 13px; color: var(--bone-dim); line-height: 1.6; padding-left: 26px; position: relative; }
  .vr-panel li b { color: var(--bone); font-weight: 600; }
  .vr-panel li::before {
    content: attr(data-n); position: absolute; left: 0; top: 0;
    font-family: var(--font-data); font-size: 11px; color: var(--teal);
  }

  footer { text-align: center; margin-top: 32px; font-family: var(--font-data); font-size: 10.5px; color: var(--bone-dim); opacity: .6; }

  /* ---------------------------------------------------------- launch overlay */
  #launch-overlay {
    position: fixed; inset: 0; background: rgba(6, 5, 10, .92); z-index: 20;
    display: none; align-items: center; justify-content: center; padding: 4vh 4vw;
  }
  #launch-overlay.on { display: flex; }
  #launch-frame-wrap { position: relative; width: 100%; height: 100%; max-width: 1400px; }
  #launch-frame { width: 100%; height: 100%; border: 1px solid var(--hair); background: var(--void); }
  #launch-bar {
    position: absolute; top: -38px; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between;
  }
  #launch-title {
    font-family: var(--font-data); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--bone-dim);
  }
  #launch-close {
    font-family: var(--font-data); font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    color: var(--bone); background: none; border: 1px solid var(--hair); padding: 6px 12px; cursor: pointer;
  }
  #launch-close:hover, #launch-close:focus-visible { border-color: var(--teal); color: var(--teal); outline: none; }

  @media (max-width: 560px) {
    .wordmark { font-size: 17px; letter-spacing: .22em; }
  }
</style>

<div class="wrap">
  <header>
    <div class="mark">
      <img src="${games[0]?.poster || ''}" alt="" />
      <span class="wordmark">DarkHearts</span>
    </div>
    <p class="mission">The studio's game library — playable builds, cataloged and ready to drop onto any screen, including the ones inside our own VR rooms.</p>
    <div class="status-line"><span class="status-dot"></span>${games.length} cataloged · ${OPEN_SLOTS} open bay${OPEN_SLOTS === 1 ? '' : 's'}</div>
  </header>

  <section class="shelf">${cartridgeCards}
${openSlotCards}
  </section>

  <section class="vr-panel">
    <h3>Embedding in a VR room</h3>
    <ol>
      <li data-n="A"><b>One screen, one game.</b> Point a room surface's browser-texture straight at a game's URL (see <code>launchSrc</code> in <code>library.json</code>) — no cabinet needed.</li>
      <li data-n="B"><b>One screen, the whole shelf.</b> Point a lobby surface at this cabinet file so players browse and launch any cataloged game in place.</li>
      <li data-n="C"><b>Input caveat.</b> Pointer-lock games need real mouse movement for camera look. A laser pointer or gaze cursor can hit this shelf's buttons, but can't drive an in-game camera unless the room bridges controller input to synthetic mouse events.</li>
      <li data-n="D"><b>Native titles.</b> Bays marked as native builds are desktop binaries, not web pages — they reach a room screen via a desktop-capture/stream panel on the host machine, never a browser texture.</li>
    </ol>
  </section>

  <footer>DarkHearts · self-contained · no network calls after load</footer>
</div>

<div id="launch-overlay">
  <div id="launch-frame-wrap">
    <div id="launch-bar">
      <span id="launch-title"></span>
      <button id="launch-close" type="button">Close ✕</button>
    </div>
    <iframe id="launch-frame" title="Game viewport" allow="pointer-lock; autoplay"></iframe>
  </div>
</div>

<script>
(function () {
  var overlay = document.getElementById('launch-overlay');
  var frame = document.getElementById('launch-frame');
  var title = document.getElementById('launch-title');
  document.querySelectorAll('[data-launch]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      frame.src = btn.getAttribute('data-launch');
      title.textContent = btn.getAttribute('data-title') + ' — Esc or Close to exit';
      overlay.classList.add('on');
    });
  });
  function close() { overlay.classList.remove('on'); frame.src = 'about:blank'; }
  document.getElementById('launch-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('on')) close(); });
})();
</script>
`;

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(`Built ${outPath} (${(html.length / 1024).toFixed(0)} KB) — ${games.length} game(s), launch mode: ${local ? 'local (relative paths)' : 'demoUrl (portable)'}`);
