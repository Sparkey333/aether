// Confidence: HIGH — Stability AI's v2beta REST API is well-documented and
// stable. Docs: https://platform.stability.ai/docs/api-reference
import { requireKey } from './_shared.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DOCS = 'https://platform.stability.ai/docs/api-reference';

export async function generateImage({ prompt, outPath, aspectRatio = '1:1', negativePrompt }) {
  const key = requireKey('STABILITY_API_KEY', 'https://platform.stability.ai/account/keys');

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('aspect_ratio', aspectRatio);
  form.append('output_format', 'png');
  if (negativePrompt) form.append('negative_prompt', negativePrompt);

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, Accept: 'image/*' },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stability generate failed: ${res.status} ${res.statusText}: ${text.slice(0, 500)} — check ${DOCS} if the endpoint has moved.`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, buffer);
  return { outPath, provider: 'stability' };
}

export async function generateVideo() {
  throw new Error('This adapter only wires up Stable Image (stills). Stability also offers image-to-video on their platform — add it here if you need it.');
}
