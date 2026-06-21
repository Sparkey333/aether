#!/usr/bin/env node
/* ============================================================================
   imagine.mjs — the Grove's image-generation pipeline.

   Turns a text prompt into an image using top-of-the-line generators, picking
   the first provider you have a key for. Zero dependencies — pure Node (>=18,
   for global fetch). Keys live in .env.local (never committed).

   Usage:
     npm run imagine -- "a seed rooting into a glowing tree of AI tools"
     node scripts/imagine.mjs "prompt"  --model gemini-3-pro-image-preview
     node scripts/imagine.mjs --hero          # regenerate the Grove's own art
     node scripts/imagine.mjs "prompt" --dry  # show the plan, call nothing

   Provider priority (first key found wins; override with --provider):
     1. Nano Banana / Gemini  — GEMINI_API_KEY   (default, cheapest SOTA)
     2. OpenAI GPT Image      — OPENAI_API_KEY
     3. Stability AI          — STABILITY_API_KEY

   Env (in .env.local):
     GEMINI_API_KEY=...            # aka Nano Banana. GOOGLE_API_KEY also read.
     GROVE_IMAGE_MODEL=gemini-2.5-flash-image   # optional default override
     OPENAI_API_KEY=...
     STABILITY_API_KEY=...
============================================================================ */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const OUT = join(ROOT, "public", "grove", "assets");

/* ---- tiny .env.local loader (no dependency on dotenv) ---- */
function loadEnv() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv();

/* ---- args ---- */
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf("--" + n); return i >= 0 ? (argv[i + 1] || true) : null; };
const has = (n) => argv.includes("--" + n);
const dry = has("dry") || has("dry-run");
const wantProvider = flag("provider");
const modelOverride = flag("model");

const HERO_PROMPTS = [
  ["grove-hero", "A luminous cosmic tree of light on deep indigo-black, a glowing seed at the roots, branches rising into golden fruit and nectar, dark shadow-roots below; sacred-geometry constellation lines, violet and gold, ethereal, painterly, 16:9"],
  ["grove-orbs", "Seven glowing chakra orbs floating in a dark cosmic void, sized differently, each a different chakra color (red orange gold green blue indigo violet), soft bloom and inner light, minimal, elegant, 16:9"],
];

const prompts = has("hero")
  ? HERO_PROMPTS
  : [["grove-" + Date.now().toString(36), argv.filter((a) => !a.startsWith("--")).join(" ").trim()]];

if (!has("hero") && !prompts[0][1]) {
  console.error('Give me a prompt:  node scripts/imagine.mjs "your prompt"   (or --hero)');
  process.exit(1);
}

/* ---- provider detection ---- */
const GEMINI = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY;
const STABILITY = process.env.STABILITY_API_KEY;

function pickProvider() {
  if (wantProvider) return wantProvider;
  if (GEMINI) return "gemini";
  if (OPENAI) return "openai";
  if (STABILITY) return "stability";
  return null;
}

/* ---- providers (REST; no SDK install needed) ---- */
async function genGemini(prompt) {
  // Nano Banana family. Default model is the cheapest confirmed GA id.
  const model = modelOverride || process.env.GROVE_IMAGE_MODEL || "gemini-2.5-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 400)}`);
  const j = await r.json();
  const parts = j?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
  const b64 = img?.inlineData?.data || img?.inline_data?.data;
  if (!b64) throw new Error("Gemini returned no image (check model id supports image output): " + JSON.stringify(j).slice(0, 300));
  return Buffer.from(b64, "base64");
}

async function genOpenAI(prompt) {
  const model = modelOverride || "gpt-image-1";
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model, prompt, size: "1536x1024", n: 1 }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 400)}`);
  const j = await r.json();
  const b64 = j?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no b64 image");
  return Buffer.from(b64, "base64");
}

async function genStability(prompt) {
  // SD 3.5 core via the v2beta endpoint; returns image bytes directly.
  const fd = new FormData();
  fd.set("prompt", prompt);
  fd.set("output_format", "png");
  fd.set("aspect_ratio", "16:9");
  const r = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
    method: "POST",
    headers: { authorization: `Bearer ${STABILITY}`, accept: "image/*" },
    body: fd,
  });
  if (!r.ok) throw new Error(`Stability ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return Buffer.from(await r.arrayBuffer());
}

const GEN = { gemini: genGemini, openai: genOpenAI, stability: genStability };

/* ---- run ---- */
const provider = pickProvider();
console.log(`\n🌱 The Grove · imagine`);
if (!provider) {
  console.error(
    "\nNo image key found. Add one to .env.local and retry:\n" +
    "  GEMINI_API_KEY=...     # Nano Banana — https://aistudio.google.com/apikey\n" +
    "  OPENAI_API_KEY=...     # GPT Image\n" +
    "  STABILITY_API_KEY=...  # Stable Diffusion 3.5\n"
  );
  process.exit(1);
}
console.log(`provider: ${provider}${dry ? "  (dry run — nothing will be called)" : ""}`);

if (!dry) mkdirSync(OUT, { recursive: true });

for (const [slug, prompt] of prompts) {
  console.log(`\n· "${prompt}"`);
  if (dry) { console.log(`  → would call ${provider}, save ${join("public/grove/assets", slug + ".png")}`); continue; }
  try {
    const bytes = await GEN[provider](prompt);
    const file = join(OUT, slug + ".png");
    writeFileSync(file, bytes);
    console.log(`  ✓ saved ${file} (${(bytes.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
  }
}
console.log("");
