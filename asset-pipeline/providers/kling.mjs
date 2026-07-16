// Confidence: LOW — flagged deliberately, read before use.
//
// Kling AI (Kuaishou)'s official API is region-gated; most developers
// outside China reach it through a reseller/aggregator (fal.ai, piapi.ai,
// and others), each with its own request shape. There is no safe default
// endpoint to guess at, so KLING_API_BASE must be set explicitly — see
// .env.example. The request/response fields below are a best-effort guess
// at the common submit-job → poll → download pattern; confirm against
// whichever reseller's docs you're actually using and adjust as needed.
import { requireKey, fetchJson, pollUntilDone, downloadToFile, loadEnv } from './_shared.mjs';

loadEnv();
const DOCS = "https://klingai.com, or your chosen reseller's docs";

export async function generateVideo({ prompt, outPath, duration = 5 }) {
  const key = requireKey('KLING_API_KEY', DOCS);
  const base = process.env.KLING_API_BASE;
  if (!base)
    throw new Error('Set KLING_API_BASE to your reseller\'s actual endpoint in .env — there is no safe default to guess at (see .env.example).');

  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${base}/videos/text2video`, {
    method: 'POST', headers, body: JSON.stringify({ prompt, duration }),
  });
  const id = submitted?.id || submitted?.task_id;
  if (!id)
    throw new Error(`Response didn't match the guessed shape — confirm against ${DOCS} and adjust providers/kling.mjs. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${base}/videos/text2video/${id}`, { headers });
    if (poll.status === 'succeed' || poll.status === 'completed') return poll;
    if (poll.status === 'failed') throw new Error('Kling job failed.');
    return null;
  }, { intervalMs: 5000, timeoutMs: 300000, label: 'Kling job' });

  const url = result.video_url || result.output?.url;
  if (!url)
    throw new Error(`Job finished but no output URL was found in the expected fields — inspect and adjust providers/kling.mjs. Raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(url, outPath);
  return { outPath, provider: 'kling' };
}

export async function generateImage() {
  throw new Error('Kling is a video-generation platform — no still-image endpoint here.');
}
