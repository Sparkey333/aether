// Confidence: LOW — flagged deliberately, read before use.
//
// Higgsfield is primarily a consumer app (Soul photo styles, DoP camera-move
// video effects); its developer/API surface is newer and less consistently
// documented than Stability/Leonardo/Runway/Luma, and moves fast. The shape
// below is a best-effort guess at the common submit-job → poll → download
// pattern every one of these platforms uses — NOT a confirmed contract.
// Confirm the base URL, auth header, and field names at https://higgsfield.ai
// (developer/API section) before trusting this; if the guessed field names
// are wrong you'll get a clear error naming the raw response rather than a
// silent wrong result — patch the two `?.` lookups below once you know the
// real shape.
import { requireKey, fetchJson, pollUntilDone, downloadToFile } from './_shared.mjs';

const BASE = process.env.HIGGSFIELD_API_BASE || 'https://api.higgsfield.ai/v1';
const DOCS = 'https://higgsfield.ai';

export async function generateImage({ prompt, outPath }) {
  const key = requireKey('HIGGSFIELD_API_KEY', DOCS);
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${BASE}/images`, {
    method: 'POST', headers, body: JSON.stringify({ prompt }),
  });
  const id = submitted?.id || submitted?.job_id;
  if (!id)
    throw new Error(`Higgsfield response didn't match the guessed shape — confirm the current API at ${DOCS} and adjust providers/higgsfield.mjs. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/jobs/${id}`, { headers });
    if (poll.status === 'completed' || poll.status === 'succeeded') return poll;
    if (poll.status === 'failed') throw new Error('Higgsfield job failed.');
    return null;
  }, { label: 'Higgsfield job' });

  const url = result.output?.url || result.result?.url || result.url;
  if (!url)
    throw new Error(`Higgsfield job finished but no output URL was found in the expected fields — inspect and adjust providers/higgsfield.mjs. Raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(url, outPath);
  return { outPath, provider: 'higgsfield' };
}

export async function generateVideo({ prompt, outPath }) {
  const key = requireKey('HIGGSFIELD_API_KEY', DOCS);
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${BASE}/videos`, {
    method: 'POST', headers, body: JSON.stringify({ prompt }),
  });
  const id = submitted?.id || submitted?.job_id;
  if (!id)
    throw new Error(`Higgsfield response didn't match the guessed shape — confirm the current API at ${DOCS} and adjust providers/higgsfield.mjs. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/jobs/${id}`, { headers });
    if (poll.status === 'completed' || poll.status === 'succeeded') return poll;
    if (poll.status === 'failed') throw new Error('Higgsfield job failed.');
    return null;
  }, { intervalMs: 5000, timeoutMs: 300000, label: 'Higgsfield job' });

  const url = result.output?.url || result.result?.url || result.url;
  if (!url)
    throw new Error(`Higgsfield job finished but no output URL was found in the expected fields — inspect and adjust providers/higgsfield.mjs. Raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(url, outPath);
  return { outPath, provider: 'higgsfield' };
}
