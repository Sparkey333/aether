#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The Codex Binder — Aether's markdown → one honest page.
//
// Reads the whole written corpus (the canon soul-files, the design docs, and the
// Resonance Lab build ladder), resolves the internal cross-links, and binds it
// all into a SINGLE self-contained HTML file: no server, no network, no external
// assets. Opens in any browser, works offline, easy to hand to a human.
//
// What it handles, because the corpus needs it:
//   • [[wikilink]] cross-refs        → in-page anchors (resolved by frontmatter slug)
//   • relative .md links             → in-page anchors (resolved by file path)
//   • GFM tables (BOMs, base↔decked) → styled, horizontally scrollable
//   • danger blockquotes             → coloured banners keyed to ☠ (lethal) / ⚠ (warn)
//   • frontmatter (title/rung/tier)  → per-doc badges
//   • emoji + inline-code math       → preserved verbatim
//
// Dependency-light: markdown is rendered by a VENDORED copy of `marked`
// (scripts/vendor/marked.esm.js, MIT) so the build stays offline & deterministic.
// Frontmatter is parsed here (tiny YAML subset) — no other install required.
//
//   node ./scripts/build-html.mjs        # writes site/aether.html
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, posix } from "node:path";
import { Marked } from "./vendor/marked.esm.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── The manifest: what gets bound, in what order, under which section ──────────
const MANIFEST = [
  { group: "Home", files: ["README.md"] },
  {
    group: "Canon",
    files: [
      "content/canon/00-aether.md",
      "content/canon/aetherius.md",
      "content/canon/provenance.md",
      "content/canon/organs.md",
      "content/canon/resonance.md",
    ],
  },
  {
    group: "Docs",
    files: ["docs/ARCHITECTURE.md", "docs/ROADMAP.md", "docs/SOURCE_ATLAS.md"],
  },
  {
    group: "Resonance Lab",
    files: [
      "docs/resonance/README.md",
      "docs/resonance/00-safety-doctrine.md",
      "docs/resonance/L0-slayer-exciter.md",
      "docs/resonance/L1-spark-gap.md",
      "docs/resonance/L2-solid-state-sstc.md",
      "docs/resonance/L3-dual-resonant-drsstc.md",
      "docs/resonance/L4-magnifier.md",
      "docs/resonance/S1-schumann-detector.md",
    ],
  },
];

const warnings = [];

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-") || "x";

const sectionIdFor = (relPath) =>
  slugify(relPath.replace(/\.md$/i, "").replace(/\//g, " "));

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    data[kv[1]] = v;
  }
  return { data, body: raw.slice(m[0].length) };
}

// ── First pass: load, assign stable section ids, map slug→section ──────────────
const docs = [];
const fileToSection = new Map();
const slugToSection = new Map();

for (const grp of MANIFEST) {
  for (const rel of grp.files) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) {
      warnings.push(`MISSING FILE: ${rel} (skipped)`);
      continue;
    }
    const raw = readFileSync(abs, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const sectionId = sectionIdFor(rel);
    const title = (data.title || body.match(/^\s*#\s+(.+)$/m)?.[1] || rel).trim();
    docs.push({ rel, group: grp.group, sectionId, title, data, body, headings: [], html: "" });
    fileToSection.set(rel, sectionId);
    if (data.slug) slugToSection.set(String(data.slug).toLowerCase(), sectionId);
  }
}

// ── marked config + renderer overrides ─────────────────────────────────────────
const marked = new Marked({ gfm: true, breaks: false });

let CUR = null;
const usedIds = new Set();
const uniqueId = (base) => {
  let id = base || "h";
  let n = 2;
  while (usedIds.has(id)) id = `${base}-${n++}`;
  usedIds.add(id);
  return id;
};

function align(a) {
  return a ? ` style="text-align:${a}"` : "";
}

marked.use({
  extensions: [
    {
      name: "wikilink",
      level: "inline",
      start(src) {
        return src.indexOf("[[");
      },
      tokenizer(src) {
        const m = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(src);
        if (m)
          return {
            type: "wikilink",
            raw: m[0],
            target: m[1].trim(),
            label: (m[2] || m[1]).trim(),
          };
      },
      renderer(token) {
        const sid = slugToSection.get(token.target.toLowerCase());
        if (sid) return `<a href="#${sid}" class="xref wiki">${esc(token.label)}</a>`;
        warnings.push(`UNRESOLVED [[${token.target}]] in ${CUR?.rel}`);
        return `<span class="xref-missing" title="unresolved link">${esc(token.label)}</span>`;
      },
    },
  ],
  renderer: {
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      const plain = token.text.replace(/[#*`_]/g, "");
      const id = uniqueId(`${CUR.sectionId}--${slugify(plain)}`);
      if (token.depth === 2) CUR.headings.push({ id, text: plain });
      return (
        `<h${token.depth} id="${id}" class="doc-h doc-h${token.depth}">` +
        `<a class="anchor" href="#${id}" aria-hidden="true">#</a>${text}</h${token.depth}>\n`
      );
    },
    blockquote(token) {
      const body = this.parser.parse(token.tokens);
      const t = token.text || "";
      let cls = "q";
      if (t.includes("☠")) cls = "q q-lethal";
      else if (t.includes("⚠")) cls = "q q-warn";
      else if (/reminder to the forgetful/i.test(t)) cls = "q q-remind";
      return `<blockquote class="${cls}">${body}</blockquote>\n`;
    },
    table(token) {
      const header =
        "<thead>\n<tr>\n" +
        token.header
          .map((c) => `<th${align(c.align)}>${this.parser.parseInline(c.tokens)}</th>\n`)
          .join("") +
        "</tr>\n</thead>\n";
      const bodyRows = token.rows
        .map(
          (row) =>
            "<tr>\n" +
            row
              .map((c) => `<td${align(c.align)}>${this.parser.parseInline(c.tokens)}</td>\n`)
              .join("") +
            "</tr>\n"
        )
        .join("");
      return `<div class="table-wrap"><table>\n${header}<tbody>\n${bodyRows}</tbody>\n</table></div>\n`;
    },
    link(token) {
      const label = this.parser.parseInline(token.tokens);
      let href = token.href || "";
      if (/^https?:\/\//i.test(href))
        return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      if (href.startsWith("#")) return `<a href="${esc(href)}">${label}</a>`;
      if (href.startsWith("mailto:")) return `<a href="${esc(href)}">${label}</a>`;
      const path = href.split("#")[0];
      if (path.endsWith(".md")) {
        const fromDir = posix.dirname(CUR.rel);
        const target = posix.normalize(posix.join(fromDir, path));
        const sid = fileToSection.get(target);
        if (sid) return `<a href="#${sid}" class="xref">${label}</a>`;
        warnings.push(`UNRESOLVED md link "${href}" in ${CUR.rel}`);
        return `<span class="xref-missing" title="unresolved link">${label}</span>`;
      }
      return `<span class="xref-missing" title="external to this document">${label}</span>`;
    },
  },
});

// ── Second pass: render ────────────────────────────────────────────────────────
for (const doc of docs) {
  CUR = doc;
  doc.html = marked.parse(doc.body);
}

// ── Badges ─────────────────────────────────────────────────────────────────────
function tierChips(prov) {
  if (!prov) return "";
  const letters = String(prov).toUpperCase().match(/[ABCD]/g) || [];
  return letters.map((L) => `<span class="chip tier tier-${L}">Tier ${L}</span>`).join("");
}
function docBadges(d) {
  const bits = [];
  if (d.data.rung) bits.push(`<span class="chip rung">${esc(d.data.rung)}</span>`);
  bits.push(tierChips(d.data.provenance));
  if (d.data.kind) bits.push(`<span class="chip kind">${esc(d.data.kind)}</span>`);
  if (d.data.safety_class) bits.push(`<span class="chip safety">${esc(d.data.safety_class)}</span>`);
  const s = bits.filter(Boolean).join("");
  return s ? `<div class="doc-badges">${s}</div>` : "";
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function sidebar() {
  let out = "";
  for (const grp of MANIFEST) {
    const groupDocs = docs.filter((d) => d.group === grp.group);
    if (!groupDocs.length) continue;
    out += `<div class="nav-group"><div class="nav-group-title">${esc(grp.group)}</div>`;
    for (const d of groupDocs) {
      const rung = d.data.rung ? `<span class="nav-rung">${esc(d.data.rung)}</span>` : "";
      out += `<div class="nav-item"><a href="#${d.sectionId}" data-target="${d.sectionId}">${rung}<span class="nav-label">${esc(d.title)}</span></a>`;
      if (d.headings.length) {
        out += `<div class="nav-sub">`;
        for (const h of d.headings)
          out += `<a href="#${h.id}" data-target="${h.id}" class="nav-subitem">${esc(h.text)}</a>`;
        out += `</div>`;
      }
      out += `</div>`;
    }
    out += `</div>`;
  }
  return out;
}

// ── Sections ───────────────────────────────────────────────────────────────────
function sections() {
  return docs
    .map(
      (d) =>
        `<section id="${d.sectionId}" class="doc" data-group="${esc(d.group)}">\n` +
        docBadges(d) +
        d.html +
        `\n<div class="doc-end">↑ <a href="#top">back to top</a></div>\n</section>`
    )
    .join("\n");
}

const CSS = `
:root{
  --bg:#0b0d14; --bg2:#111624; --panel:#141a2b; --ink:#e7e9f2; --muted:#9aa3bd;
  --line:#242c44; --gold:#e8c15a; --link:#8fc9ff; --link2:#b7a5ff;
  --lethal:#ff5c6c; --lethal-bg:#2a1116; --warn:#ffbf47; --warn-bg:#2a2110;
  --remind:#7fe0c0; --remind-bg:#0f231d;
  --A:#5fd08a; --B:#7fb2ff; --C:#c39bff; --D:#ffce6b;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji",sans-serif;}
a{color:var(--link);text-decoration:none}
a:hover{text-decoration:underline}
.layout{display:flex;align-items:flex-start}
#sidebar{position:sticky;top:0;height:100vh;width:320px;flex:0 0 320px;overflow-y:auto;
  background:linear-gradient(180deg,#0c1020,#0b0d14);border-right:1px solid var(--line);padding:18px 14px 60px}
.brand{padding:6px 8px 14px;border-bottom:1px solid var(--line);margin-bottom:12px}
.brand .mark{font-size:22px;font-weight:800;letter-spacing:.5px;color:var(--gold)}
.brand .sub{font-size:12px;color:var(--muted);margin-top:2px}
.nav-group{margin:14px 0}
.nav-group-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);padding:4px 8px;font-weight:700}
.nav-item>a{display:flex;gap:7px;align-items:baseline;padding:5px 8px;border-radius:7px;color:var(--ink);font-size:13.5px}
.nav-item>a:hover{background:var(--panel);text-decoration:none}
.nav-item>a.active{background:#1b233c;color:#fff}
.nav-item>a.active .nav-label{color:#fff}
.nav-rung{flex:0 0 auto;font-size:10.5px;font-weight:800;color:#0b0d14;background:var(--gold);border-radius:5px;padding:1px 5px;line-height:1.5}
.nav-label{color:var(--ink)}
.nav-sub{margin:1px 0 6px 14px;border-left:1px solid var(--line);padding-left:6px;display:none}
.nav-item.open .nav-sub{display:block}
.nav-subitem{display:block;padding:2px 8px;font-size:12px;color:var(--muted);border-radius:6px}
.nav-subitem:hover{background:var(--panel);text-decoration:none}
.nav-subitem.active{color:var(--gold)}
main{flex:1 1 auto;min-width:0;max-width:920px;margin:0 auto;padding:0 34px 120px}
#top{height:1px}
.masthead{padding:44px 0 8px;border-bottom:1px solid var(--line);margin-bottom:8px}
.masthead h1{font-size:40px;margin:0 0 6px;color:var(--gold);letter-spacing:.5px}
.masthead p{color:var(--muted);margin:.2em 0;max-width:70ch}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 4px}
.built{color:var(--muted);font-size:12.5px;margin-top:10px}
.doc{padding:34px 0;border-bottom:1px solid var(--line);scroll-margin-top:12px}
.doc-h{scroll-margin-top:12px;line-height:1.25}
h1.doc-h{font-size:30px;color:#fff;margin:.2em 0 .5em;padding-bottom:.2em;border-bottom:1px solid var(--line)}
h2.doc-h{font-size:23px;color:var(--gold);margin:1.4em 0 .5em}
h3.doc-h{font-size:18.5px;color:#dfe6ff;margin:1.2em 0 .4em}
h4.doc-h{font-size:16px;color:var(--ink);margin:1.1em 0 .3em;text-transform:uppercase;letter-spacing:.5px}
.anchor{opacity:0;margin-left:-1.1em;padding-right:.35em;color:var(--muted);font-weight:400}
.doc-h:hover .anchor{opacity:.7;text-decoration:none}
.doc-badges{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 6px}
.chip{display:inline-block;font-size:11.5px;font-weight:700;border-radius:20px;padding:3px 10px;border:1px solid var(--line);background:var(--panel);color:var(--ink)}
.chip.rung{background:var(--gold);color:#0b0d14;border-color:var(--gold)}
.chip.kind{color:var(--muted);text-transform:lowercase}
.chip.safety{background:#241018;border-color:#3a1c26;color:#ffc2cb;font-weight:600;white-space:normal;max-width:70ch}
.chip.tier{color:#0b0d14}
.tier-A{background:var(--A)} .tier-B{background:var(--B)} .tier-C{background:var(--C)} .tier-D{background:var(--D)}
p{margin:.7em 0}
ul,ol{margin:.6em 0;padding-left:1.5em}
li{margin:.25em 0}
li>ul,li>ol{margin:.2em 0}
hr{border:0;border-top:1px solid var(--line);margin:1.8em 0}
strong{color:#fff}
code{font-family:"SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;font-size:.88em;background:#0e1424;border:1px solid var(--line);border-radius:5px;padding:1px 5px;color:#ffd9a8}
pre{background:#0e1424;border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-x:auto}
pre code{background:none;border:0;padding:0;color:#d7e2ff}
blockquote.q{margin:1.1em 0;padding:12px 16px;border-left:4px solid var(--line);background:var(--bg2);border-radius:0 8px 8px 0}
blockquote.q p:first-child{margin-top:0}
blockquote.q p:last-child{margin-bottom:0}
blockquote.q-lethal{border-left-color:var(--lethal);background:var(--lethal-bg);box-shadow:inset 0 0 0 1px rgba(255,92,108,.18)}
blockquote.q-lethal strong{color:#ffd0d5}
blockquote.q-warn{border-left-color:var(--warn);background:var(--warn-bg)}
blockquote.q-warn strong{color:#ffe6b0}
blockquote.q-remind{border-left-color:var(--remind);background:var(--remind-bg)}
.table-wrap{overflow-x:auto;margin:1.1em 0;border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border-bottom:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top}
th{background:#0e1424;color:var(--gold);font-size:12.5px;text-transform:uppercase;letter-spacing:.4px}
tbody tr:nth-child(2n){background:rgba(255,255,255,.02)}
td code{white-space:nowrap}
.xref.wiki{color:var(--link2);border-bottom:1px dotted rgba(183,165,255,.5)}
.xref-missing{color:var(--muted);border-bottom:1px dotted var(--line)}
.doc-end{margin-top:24px;font-size:13px;color:var(--muted)}
#menu-btn{display:none;position:fixed;top:12px;left:12px;z-index:30;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-size:15px;cursor:pointer}
@media(max-width:900px){
  #menu-btn{display:block}
  #sidebar{position:fixed;left:0;top:0;z-index:20;transform:translateX(-100%);transition:transform .22s;box-shadow:0 0 40px rgba(0,0,0,.6)}
  #sidebar.open{transform:translateX(0)}
  main{padding:0 18px 120px}
  .masthead{padding-top:64px}
  .masthead h1{font-size:32px}
}
`;

const JS = `
(function(){
  var btn=document.getElementById('menu-btn'), sb=document.getElementById('sidebar');
  if(btn) btn.onclick=function(){ sb.classList.toggle('open'); };
  sb.addEventListener('click',function(e){ var a=e.target.closest('a'); if(a && window.innerWidth<=900) sb.classList.remove('open'); });
  var links=[].slice.call(document.querySelectorAll('#sidebar a[data-target]'));
  var byId={}; links.forEach(function(a){ byId[a.getAttribute('data-target')]=a; });
  var targets=[].slice.call(document.querySelectorAll('section.doc, h2.doc-h'));
  var current=null;
  function activate(id){
    if(!id||id===current) return; current=id;
    links.forEach(function(a){ a.classList.remove('active'); });
    var a=byId[id]; if(!a) return; a.classList.add('active');
    var item=a.closest('.nav-item');
    document.querySelectorAll('.nav-item.open').forEach(function(n){ if(n!==item) n.classList.remove('open'); });
    if(item) item.classList.add('open');
    a.scrollIntoView({block:'nearest'});
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting) activate(en.target.id); });
  },{rootMargin:'-10% 0px -80% 0px',threshold:0});
  targets.forEach(function(t){ if(t.id) io.observe(t); });
})();
`;

const buildDate = new Date().toISOString().slice(0, 10);
const docCount = docs.length;

const LEGEND = `
<div class="legend">
  <span class="chip tier tier-A">Tier A — measured</span>
  <span class="chip tier tier-B">Tier B — scholarly</span>
  <span class="chip tier tier-C">Tier C — traditional</span>
  <span class="chip tier tier-D">Tier D — folklore</span>
  <span class="chip" style="background:var(--lethal-bg);border-color:#3a1c26;color:#ffd0d5">☠ lethal</span>
  <span class="chip" style="background:var(--warn-bg);border-color:#3a3016;color:#ffe6b0">⚠ warning</span>
  <span class="chip">🔰 base track</span>
  <span class="chip">⚡ decked-out track</span>
</div>`;

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aether — the bound corpus</title>
<style>${CSS}</style>
</head>
<body>
<button id="menu-btn" aria-label="menu">☰ Contents</button>
<div class="layout">
<nav id="sidebar">
  <div class="brand"><div class="mark">✦ AETHER</div><div class="sub">the bound corpus · ${docCount} documents</div></div>
  ${sidebar()}
</nav>
<main>
  <div id="top"></div>
  <header class="masthead">
    <h1>Aether</h1>
    <p>The written corpus, bound into one page — the canon soul-files, the design docs, and the Resonance Lab build ladder. Governed throughout by the four-tier provenance doctrine: the real stands on measured ground; the dream is kept, and labelled.</p>
    ${LEGEND}
    <p class="built">Generated ${buildDate} · ${docCount} documents · rebuild with <code>npm run html</code></p>
  </header>
  ${sections()}
</main>
</div>
<script>${JS}</script>
</body>
</html>
`;

const outDir = join(ROOT, "site");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "aether.html");
writeFileSync(outFile, HTML);

const bytes = Buffer.byteLength(HTML);
console.log(`✦ Bound ${docCount} documents → site/aether.html (${(bytes / 1024).toFixed(0)} KB)`);
for (const d of docs)
  console.log(`   · ${d.group.padEnd(14)} ${d.rel}  →  #${d.sectionId}  (${d.headings.length} sub-headings)`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`   - ${w}`);
} else {
  console.log(`\n✓ no unresolved links, no missing files.`);
}
