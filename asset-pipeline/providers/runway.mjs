// Confidence: HIGH for the general shape — Runway's dev API is documented
// at https://docs.dev.runwayml.com, though it's image-to-video, not
// text-to-video: you must supply a starting frame (e.g. from Stability,
// Leonardo, or the mock provider). Bump X-Runway-Version below if calls
// start failing with a version-mismatch error.
import { requireKey, fetchJson, pollUntilDone, downloadToFile } from './_shared.mjs';

const BASE = 'https://api.runwayml.com/v1';
const DOCS = 'https://docs.dev.runwayml.com';

export async function generateVideo({ prompt, imageUrl, outPath, duration = 5, model = 'gen4_turbo' }) {
  const key = requireKey('RUNWAY_API_KEY', 'https://dev.runwayml.com');
  if (!imageUrl)
    throw new Error("Runway's API animates a starting frame — pass imageUrl (a publicly reachable URL of a still, e.g. one you just generated with Stability/Leonardo) alongside the prompt.");

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'X-Runway-Version': '2024-11-06',
  };

  const submitted = await fetchJson(`${BASE}/image_to_video`, {
    method: 'POST', headers,
    body: JSON.stringify({ model, promptImage: imageUrl, promptText: prompt, duration }),
  });
  const taskId = submitted?.id;
  if (!taskId)
    throw new Error(`Runway didn't return a task id — check ${DOCS} if the response shape changed. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/tasks/${taskId}`, { headers });
    if (poll.status === 'SUCCEEDED') return poll;
    if (poll.status === 'FAILED') throw new Error(`Runway task failed: ${poll.failure || 'unknown reason'}`);
    return null;
  }, { intervalMs: 5000, timeoutMs: 300000, label: 'Runway video task' });

  const videoUrl = result.output?.[0];
  if (!videoUrl) throw new Error(`Runway task succeeded but returned no output URL — raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(videoUrl, outPath);
  return { outPath, provider: 'runway' };
}

export async function generateImage() {
  throw new Error("Runway's public API is video-focused — use Stability or Leonardo for stills, then feed the result to Runway's image_to_video as the starting frame.");
}
