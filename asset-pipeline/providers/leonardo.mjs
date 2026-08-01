// Confidence: HIGH — Leonardo AI's REST API is well-documented and stable.
// Docs: https://docs.leonardo.ai/reference
import { requireKey, fetchJson, pollUntilDone, downloadToFile } from './_shared.mjs';

const BASE = 'https://cloud.leonardo.ai/api/rest/v1';
const DOCS = 'https://docs.leonardo.ai/reference';

export async function generateImage({ prompt, outPath, width = 512, height = 512 }) {
  const key = requireKey('LEONARDO_API_KEY', 'https://app.leonardo.ai/api-access');
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const submitted = await fetchJson(`${BASE}/generations`, {
    method: 'POST', headers,
    body: JSON.stringify({ prompt, width, height, num_images: 1 }),
  });
  const generationId = submitted?.sdGenerationJob?.generationId;
  if (!generationId)
    throw new Error(`Leonardo didn't return a generationId — check ${DOCS} if the response shape changed. Raw: ${JSON.stringify(submitted).slice(0, 300)}`);

  const result = await pollUntilDone(async () => {
    const poll = await fetchJson(`${BASE}/generations/${generationId}`, { headers });
    const gen = poll?.generations_by_pk;
    if (gen?.status === 'COMPLETE') return gen;
    if (gen?.status === 'FAILED') throw new Error('Leonardo generation failed.');
    return null;
  }, { label: 'Leonardo generation' });

  const imageUrl = result.generated_images?.[0]?.url;
  if (!imageUrl) throw new Error(`Leonardo completed but returned no image URL — raw: ${JSON.stringify(result).slice(0, 300)}`);
  await downloadToFile(imageUrl, outPath);
  return { outPath, provider: 'leonardo' };
}

export async function generateVideo() {
  throw new Error('This adapter only wires up Leonardo\'s image generation. Leonardo also offers Motion (image-to-video) — add it here if you need it.');
}
