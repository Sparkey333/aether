#!/usr/bin/env node
/**
 * Aether Fight — AI asset generator.
 *
 *   node scripts/generate-assets.mjs --plan                 # dry-run: print the plan, call nothing (no key needed)
 *   node scripts/generate-assets.mjs --only weapons         # generate just one category
 *   GEMINI_API_KEY=... node scripts/generate-assets.mjs     # render everything with Gemini
 *
 * Flags: --plan | --only <category> | --limit <n> | --provider <name> | --id <assetId>
 * Keys are read from the environment (see .env.assets.example). Nothing is sent anywhere
 * unless a matching key is present; otherwise the item falls back to a printed plan.
 *
 * Dependency-free (Node 18+ global fetch). Images land in public/assets/generated/<category>/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'public/assets/manifest.json');
const OUTDIR = path.join(ROOT, 'public/assets/generated');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const PLAN = flag('plan');
const ONLY = opt('only');
const LIMIT = Number(opt('limit', Infinity));
const ONE = opt('id');
const PROVIDER_OVERRIDE = opt('provider', process.env.ASSET_PROVIDER);

const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const STYLE = m.artDirection, NEG = m.negative, D = m.defaults || {};

const KEYS = {
  gemini: process.env.GEMINI_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  replicate: process.env.REPLICATE_API_TOKEN,
  stability: process.env.STABILITY_API_KEY,
  recraft: process.env.RECRAFT_API_KEY,
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fullPrompt = (p, transparent) =>
  `${p}. ${STYLE}${transparent ? '. isolated subject on a fully transparent background' : ''}. Avoid: ${NEG}.`;

// ---------- providers (image) ----------
async function genGemini(prompt, { aspect }) {
  const key = KEYS.gemini;
  const model = PROVIDER_OVERRIDE && PROVIDER_OVERRIDE.startsWith('imagen') ? PROVIDER_OVERRIDE
    : (process.env.GEMINI_MODEL || D.model);
  if (model.startsWith('imagen')) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${key}`;
    const body = { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: aspect || '1:1' } };
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`Imagen ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    return { buf: Buffer.from(j.predictions[0].bytesBase64Encoded, 'base64'), ext: 'png' };
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data);
  if (!part) throw new Error('Gemini returned no image part');
  return { buf: Buffer.from(part.inlineData.data, 'base64'), ext: (part.inlineData.mimeType || 'image/png').split('/')[1] };
}

async function genOpenAI(prompt, { size, transparent }) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${KEYS.openai}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: size || '1024x1024', n: 1, ...(transparent ? { background: 'transparent' } : {}) }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  return { buf: Buffer.from(j.data[0].b64_json, 'base64'), ext: 'png' };
}

async function genReplicateFlux(prompt, { aspect }) {
  const create = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST', headers: { authorization: `Bearer ${KEYS.replicate}`, 'content-type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify({ input: { prompt, aspect_ratio: aspect || '1:1', output_format: 'png' } }),
  });
  if (!create.ok) throw new Error(`Replicate ${create.status}: ${(await create.text()).slice(0, 300)}`);
  let pred = await create.json();
  while (pred.status === 'starting' || pred.status === 'processing') {
    await sleep(1500);
    pred = await (await fetch(pred.urls.get, { headers: { authorization: `Bearer ${KEYS.replicate}` } })).json();
  }
  if (pred.status !== 'succeeded') throw new Error(`Replicate ${pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  return { buf: Buffer.from(await (await fetch(out)).arrayBuffer()), ext: 'png' };
}

const IMAGE_PROVIDERS = { gemini: genGemini, openai: genOpenAI, replicate: genReplicateFlux };

function pickProvider(catProvider) {
  const want = PROVIDER_OVERRIDE && !PROVIDER_OVERRIDE.startsWith('imagen') ? PROVIDER_OVERRIDE : (catProvider || D.provider);
  if (want === 'gemini' && KEYS.gemini) return 'gemini';
  for (const p of [want, 'gemini', 'openai', 'replicate']) if (KEYS[p]) return p;
  return null; // no key -> plan only
}

// ---------- run ----------
let made = 0, planned = 0;
const index = [];
for (const [cat, c] of Object.entries(m.categories)) {
  if (ONLY && ONLY !== cat) continue;
  const items = c.items.filter((it) => !ONE || it.id === ONE).slice(0, LIMIT);
  if (!items.length) continue;
  console.log(`\n# ${cat}  (${items.length} item${items.length > 1 ? 's' : ''})`);

  for (const it of items) {
    const prompt = fullPrompt(it.prompt, c.transparent);
    if (c.type === 'video') {
      console.log(`  ~ ${it.id}: VIDEO — feed image '${it.from}' + prompt to Runway/Luma/Kling (image→video). See docs/ASSET_PIPELINE.md.`);
      planned++; continue;
    }
    const provider = PLAN ? null : pickProvider(c.provider);
    const rel = `generated/${cat}/${it.id}.png`;
    if (!provider) {
      console.log(`  · ${it.id}  [PLAN] ${provider === null && !PLAN ? '(no API key — add one to render)' : ''}\n      → ${prompt}`);
      planned++; index.push({ cat, id: it.id, status: 'planned', linkedStyle: it.linkedStyle, prompt });
      continue;
    }
    try {
      process.stdout.write(`  • ${it.id}  [${provider}] … `);
      const { buf, ext } = await IMAGE_PROVIDERS[provider](prompt, { aspect: c.aspect, size: c.size, transparent: c.transparent });
      const outPath = path.join(OUTDIR, cat, `${it.id}.${ext}`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buf);
      console.log(`saved ${(buf.length / 1024).toFixed(0)}kb → public/assets/${cat}/../${path.basename(outPath)}`);
      made++; index.push({ cat, id: it.id, status: 'rendered', provider, file: `generated/${cat}/${it.id}.${ext}`, linkedStyle: it.linkedStyle });
      await sleep(600);
    } catch (e) {
      console.log(`FAILED — ${e.message}`);
      index.push({ cat, id: it.id, status: 'error', error: e.message });
    }
  }
}

if (index.length) {
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, 'index.json'), JSON.stringify({ generatedAt: null, made, planned, items: index }, null, 2));
}
console.log(`\n${PLAN ? 'Planned' : 'Done'}: ${made} rendered, ${planned} planned.` +
  (made === 0 && !PLAN ? '  (no API keys found — copy .env.assets.example, add a key, and re-run; or use `--plan`.)' : ''));
