// Confidence: HIGH for the general shape — Luma's Dream Machine API.
// Docs: https://docs.lumalabs.ai
import { requireKey, fetchJson, pollUntilDone, downloadToFile } from './_shared.mjs';

const BASE = 'https://api.lumalabs.ai/dream-machine/v1';
const DOCS = 'https://docs.lumalabs.ai';

export async function generateVideo({ prompt, outPath }) {
  const key = requireKey('LUMA_API_KEY', 'https://lumalabs.ai/dream-machine/api');
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${BASE}/generations`, {
    method: 'POST', headers, body: JSON.stringify({ prompt }),
  });
  const id = submitted?.id;
  if (!id)
    throw new Error(`Luma didn't return a generation id — check ${DOCS} if the response shape changed. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/generations/${id}`, { headers });
    if (poll.state === 'completed') return poll;
    if (poll.state === 'failed') throw new Error(`Luma generation failed: ${poll.failure_reason || 'unknown reason'}`);
    return null;
  }, { intervalMs: 5000, timeoutMs: 300000, label: 'Luma generation' });

  const videoUrl = result.assets?.video;
  if (!videoUrl) throw new Error(`Luma completed but returned no video URL — raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(videoUrl, outPath);
  return { outPath, provider: 'luma' };
}

export async function generateImage() {
  throw new Error("Luma's Dream Machine API is video-focused — no still-image endpoint wired up here.");
}
