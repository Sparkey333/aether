// Confidence: LOW — flagged deliberately, read before use.
//
// Pika Labs' developer API has historically trailed its Discord-bot/web
// product and gone through beta phases; confirm it's currently live and
// check the base URL/auth scheme at https://pika.art before trusting this.
// The shape below is a best-effort guess at the common submit-job → poll →
// download pattern, not a confirmed contract.
import { requireKey, fetchJson, pollUntilDone, downloadToFile } from './_shared.mjs';

const BASE = process.env.PIKA_API_BASE || 'https://api.pika.art/v1';
const DOCS = 'https://pika.art';

export async function generateVideo({ prompt, outPath }) {
  const key = requireKey('PIKA_API_KEY', DOCS);
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${BASE}/generate`, {
    method: 'POST', headers, body: JSON.stringify({ promptText: prompt }),
  });
  const id = submitted?.id || submitted?.job_id;
  if (!id)
    throw new Error(`Pika response didn't match the guessed shape — confirm against ${DOCS} and adjust providers/pika.mjs. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/jobs/${id}`, { headers });
    if (poll.status === 'finished' || poll.status === 'completed') return poll;
    if (poll.status === 'failed') throw new Error('Pika job failed.');
    return null;
  }, { intervalMs: 5000, timeoutMs: 300000, label: 'Pika job' });

  const url = result.video?.url || result.output?.url;
  if (!url)
    throw new Error(`Pika job finished but no output URL was found in the expected fields — inspect and adjust providers/pika.mjs. Raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(url, outPath);
  return { outPath, provider: 'pika' };
}

export async function generateImage() {
  throw new Error('Pika is a video-generation platform — no still-image endpoint here.');
}
