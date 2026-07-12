#!/usr/bin/env node
/**
 * Aether Asset Manager — the Vault sync.
 *
 * Walks every source in aether.assets.config.json (your other apps + folders),
 * pulls a COPY of each asset it finds into public/vault/store/<source>/, and
 * writes public/vault/catalog.json — the single index the Vault UI reads.
 *
 *   npm run assets:sync              # sync everything reachable
 *   npm run assets:sync -- --plan    # dry-run: report, copy nothing
 *   npm run assets:sync -- --source tredee   # one source only
 *
 * Design rules:
 *   · Missing roots are SKIPPED, never fatal — you can list every machine's
 *     folders; assets from an offline source stay catalogued, flagged offline.
 *   · Content-hash dedupe: the same file found twice is stored once.
 *   · Sources with "copy": false (this repo's own public/) are served in
 *     place, never duplicated.
 *   · Dependency-free (Node 18+). Local-first: nothing leaves the machine.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'aether.assets.config.json');

const argv = process.argv.slice(2);
const PLAN = argv.includes('--plan');
const only = (() => { const i = argv.indexOf('--source'); return i >= 0 ? argv[i + 1] : null; })();

const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const OUT = path.join(ROOT, cfg.output || 'public/vault');
const STORE = path.join(OUT, 'store');
const CATALOG = path.join(OUT, 'catalog.json');
const MAX_BYTES = (cfg.maxFileMB || 200) * 1024 * 1024;

const expand = (p) =>
  path.resolve(
    ROOT,
    p
      .replace(/^~(?=$|\/)/, os.homedir())
      .replace(/\$([A-Z_][A-Z0-9_]*)/gi, (_, v) => process.env[v] ?? ''),
  );

// extension -> kind lookup
const EXT_KIND = {};
for (const [kind, exts] of Object.entries(cfg.extensions || {}))
  for (const e of exts) EXT_KIND[e.toLowerCase()] = kind;

const IGNORE = new Set(cfg.ignoreDirs || []);

// ---------- classification ----------
const REALM_HINTS = [
  ['spiritual', /sigil|tarot|chakra|rune|sacred|temple|shrine|altar|ley|astral|spirit|occult|ritual|geomanc|zodiac|celestial|talisman|mandala|veve|glyph/i],
  ['physical', /photo|scan|terrain|satellite|map|site|real|document|paper|print|hardware|product/i],
  ['virtual', /sprite|ui|icon|hud|skybox|vr|game|mesh|rig|lowpoly|voxel|pixel|texture|material|shader/i],
];
const BG_HINT = /background|backdrop|\bbg\b|skybox|environment|location|stage|panorama|scene|wallpaper|arena|dojo/i;

function classifyRealm(rel, fallback) {
  for (const [realm, re] of REALM_HINTS) if (re.test(rel)) return realm;
  return fallback || 'virtual';
}
function classifyRole(rel, kind) {
  if (kind === '3d') return 'model';
  if (kind === 'audio') return 'audio';
  if (kind === 'video') return 'motion';
  return BG_HINT.test(rel) ? 'background' : 'element';
}
function tagsFrom(rel) {
  return [...new Set(
    rel.split(/[\\/]/).slice(0, -1)
      .map((s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''))
      .filter((s) => s && s !== 'public' && s !== 'assets' && s !== 'src' && s.length > 1),
  )];
}

// ---------- walking ----------
function* walk(dir, depth = 0) {
  if (depth > 8) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE.has(e.name)) yield* walk(full, depth + 1);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16);
// keep repo-internal origins portable across machines
const portable = (p) => {
  const rel = path.relative(ROOT, p);
  return rel.startsWith('..') ? p : rel.split(path.sep).join('/');
};

// ---------- previous catalog (keeps offline sources' entries) ----------
let prev = { assets: [] };
try { prev = JSON.parse(fs.readFileSync(CATALOG, 'utf8')); } catch { /* first run */ }

const assets = [];
const seenHash = new Set();
const sourcesReport = [];

for (const src of cfg.sources) {
  if (only && src.id !== only) {
    // keep whatever the previous sync knew about the skipped source
    const kept = (prev.assets || []).filter((a) => a.source === src.id);
    assets.push(...kept);
    if (kept.length) sourcesReport.push({ id: src.id, label: src.label, online: null, count: kept.length, skipped: true });
    continue;
  }

  const root = expand(src.root);
  const online = fs.existsSync(root);
  let count = 0;

  if (!online) {
    const kept = (prev.assets || []).filter((a) => a.source === src.id).map((a) => ({ ...a, available: a.url != null && fs.existsSync(path.join(ROOT, 'public', a.url.replace(/^\//, ''))) }));
    assets.push(...kept);
    sourcesReport.push({ id: src.id, label: src.label, root: src.root, online: false, count: kept.length });
    console.log(`✗ ${src.label} — root not found (${src.root}); kept ${kept.length} previously-synced asset(s)`);
    continue;
  }

  const includeDirs = (src.include || ['.']).map((d) => path.join(root, d)).filter((d) => fs.existsSync(d));
  for (const dir of includeDirs) {
    for (const file of walk(dir)) {
      const ext = path.extname(file).slice(1).toLowerCase();
      const kind = EXT_KIND[ext];
      if (!kind) continue;
      let stat;
      try { stat = fs.statSync(file); } catch { continue; }
      if (stat.size === 0 || stat.size > MAX_BYTES) continue;

      const rel = path.relative(root, file);
      const buf = fs.readFileSync(file);
      const hash = sha1(buf);
      if (seenHash.has(hash)) continue; // exact duplicate already vaulted
      seenHash.add(hash);

      const name = path.basename(file, path.extname(file));
      const realm = classifyRealm(`${src.id}/${rel}`, src.realm);
      const role = classifyRole(rel, kind);
      const tags = [...new Set([...(src.tags || []), ...tagsFrom(rel)])];

      let url = null;
      if (src.copy === false) {
        // serve in place — only valid for files already under this repo's public/
        const pubRel = path.relative(path.join(ROOT, 'public'), file);
        if (!pubRel.startsWith('..')) url = '/' + pubRel.split(path.sep).join('/');
      } else {
        const destName = `${hash}-${path.basename(file)}`;
        const dest = path.join(STORE, src.id, destName);
        if (!PLAN) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
        }
        url = `/vault/store/${src.id}/${destName}`;
      }

      assets.push({
        id: `${src.id}:${hash}`,
        name,
        kind,
        realm,
        role,
        source: src.id,
        sourceLabel: src.label,
        origin: portable(file),
        url,
        ext,
        bytes: stat.size,
        mtime: stat.mtimeMs,
        hash,
        tags,
        available: true,
      });
      count++;
    }
  }

  sourcesReport.push({ id: src.id, label: src.label, root: src.root, online: true, count });
  console.log(`✓ ${src.label} — ${count} asset(s)${PLAN ? ' (plan)' : ''}`);
}

// ---------- forge output (assets saved from the Higgsfield panel) ----------
const FORGE_DIR = path.join(OUT, 'generated');
if (fs.existsSync(FORGE_DIR)) {
  let count = 0;
  for (const file of walk(FORGE_DIR)) {
    if (file.endsWith('.meta.json')) continue;
    const ext = path.extname(file).slice(1).toLowerCase();
    const kind = EXT_KIND[ext];
    if (!kind) continue;
    const buf = fs.readFileSync(file);
    const hash = sha1(buf);
    if (seenHash.has(hash)) continue;
    seenHash.add(hash);
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(file.replace(/\.[^.]+$/, '.meta.json'), 'utf8')); } catch { /* none */ }
    const rel = path.relative(OUT, file).split(path.sep).join('/');
    assets.push({
      id: `forge:${hash}`,
      name: meta.name || path.basename(file, path.extname(file)),
      kind,
      realm: meta.realm || 'virtual',
      role: meta.role || 'element',
      source: 'forge',
      sourceLabel: 'Forge (Higgsfield)',
      origin: portable(file),
      url: `/vault/${rel}`,
      ext,
      bytes: buf.length,
      mtime: fs.statSync(file).mtimeMs,
      hash,
      tags: [...new Set(['higgsfield', 'generated', ...(meta.tags || [])])],
      available: true,
      generated: true,
      prompt: meta.prompt,
      model: meta.model,
      parentId: meta.parentId,
    });
    count++;
  }
  if (count) sourcesReport.push({ id: 'forge', label: 'Forge (Higgsfield)', online: true, count });
}

// ---------- write ----------
assets.sort((a, b) => b.mtime - a.mtime);
const catalog = {
  version: 1,
  syncedAt: new Date().toISOString(),
  sources: sourcesReport,
  counts: {
    total: assets.length,
    byKind: assets.reduce((m, a) => ((m[a.kind] = (m[a.kind] || 0) + 1), m), {}),
    byRealm: assets.reduce((m, a) => ((m[a.realm] = (m[a.realm] || 0) + 1), m), {}),
  },
  assets,
};

if (!PLAN) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
}
console.log(`\n${PLAN ? 'Plan' : 'Vault'}: ${assets.length} assets · ${Object.entries(catalog.counts.byKind).map(([k, n]) => `${n} ${k}`).join(' · ') || 'none'}`);
if (!PLAN) console.log(`Catalog → ${path.relative(ROOT, CATALOG)}`);
