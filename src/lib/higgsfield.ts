// Higgsfield — the Vault's forge. Direct browser → platform.higgsfield.ai
// (their API sends permissive CORS, verified against web and tauri:// origins),
// so this works identically in web dev and the shipped Tauri app with NO
// server in between. BYOK: the key pair lives in localStorage on this device
// only and is never bundled into a build (DarkHearts standing rule).
//
// Two API flavors, both handled:
//   v1  — body {params}, headers hf-api-key/hf-secret, returns a JobSet,
//         polled at /v1/job-sets/{id}                (Soul, DoP image→video)
//   v2  — body = input, header `Authorization: Key K:S`, returns request_id,
//         polled at /requests/{id}/status            (FLUX Kontext, Seedream)

export const HF_BASE = "https://platform.higgsfield.ai";
export const HF_KEY_STORAGE = "aether.higgsfieldKey";

export interface HFResult {
  status: "queued" | "in_progress" | "completed" | "failed" | "nsfw" | "canceled";
  urls: { url: string; type: "image" | "video" }[];
  detail?: string;
}

export interface HFModel {
  id: string;
  label: string;
  api: "v1" | "v2";
  endpoint: string;
  /** none = text→image; optional/required = accepts/needs a source image */
  imageInput: "none" | "optional" | "required";
  output: "image" | "video";
  hint: string;
  buildBody: (p: { prompt: string; aspect: string; seed?: number; imageUrls?: string[] }) => Record<string, unknown>;
}

/** Soul's fixed resolution list (verified against the official SDK). */
const SOUL_SIZE: Record<string, string> = {
  "1:1": "1536x1536",
  "16:9": "2048x1152",
  "4:3": "2048x1536",
  "9:16": "1152x2048",
  "3:4": "1536x2048",
  "2:3": "1344x2016",
};

export const HF_MODELS: HFModel[] = [
  {
    id: "soul",
    label: "Higgsfield Soul — photoreal / stylized stills",
    api: "v1",
    endpoint: "/v1/text2image/soul",
    imageInput: "none",
    output: "image",
    hint: "Higgsfield's flagship text→image. Best for characters, places, moods.",
    buildBody: ({ prompt, aspect, seed }) => ({
      prompt,
      width_and_height: SOUL_SIZE[aspect] ?? SOUL_SIZE["1:1"],
      quality: "1080p",
      batch_size: 1,
      ...(seed != null ? { seed } : {}),
    }),
  },
  {
    id: "flux-kontext",
    label: "FLUX.1 Kontext Max — text→image",
    api: "v2",
    endpoint: "/flux-pro/kontext/max/text-to-image",
    imageInput: "none",
    output: "image",
    hint: "Strong prompt-following; good for graphic elements and backgrounds.",
    buildBody: ({ prompt, aspect, seed }) => ({
      prompt,
      aspect_ratio: aspect,
      safety_tolerance: 2,
      ...(seed != null ? { seed } : {}),
    }),
  },
  {
    id: "seedream-t2i",
    label: "Seedream v4 — text→image",
    api: "v2",
    endpoint: "/bytedance/seedream/v4/text-to-image",
    imageInput: "none",
    output: "image",
    hint: "Fast, high-res 2K stills.",
    buildBody: ({ prompt, aspect }) => ({
      prompt,
      resolution: "2K",
      aspect_ratio: aspect,
    }),
  },
  {
    id: "seedream-edit",
    label: "Seedream v4 Edit — tweak an existing asset",
    api: "v2",
    endpoint: "/bytedance/seedream/v4/edit",
    imageInput: "required",
    output: "image",
    hint: "Send a Vault asset + instructions: recolor, restyle, extend, remix.",
    buildBody: ({ prompt, imageUrls }) => ({
      prompt,
      image_urls: imageUrls ?? [],
      resolution: "2K",
    }),
  },
  {
    id: "dop-i2v",
    label: "DoP Turbo — animate an asset (image→video)",
    api: "v1",
    endpoint: "/v1/image2video/dop",
    imageInput: "required",
    output: "video",
    hint: "Turn a still asset into a cinematic motion loop.",
    buildBody: ({ prompt, imageUrls }) => ({
      model: "dop-turbo",
      prompt,
      input_images: (imageUrls ?? []).map((u) => ({ type: "image_url", image_url: u })),
    }),
  },
];

export function getStoredKey(): { key: string; secret: string } | null {
  try {
    const raw = localStorage.getItem(HF_KEY_STORAGE) ?? "";
    const [key, secret] = raw.split(":");
    if (key && secret) return { key, secret };
  } catch {
    /* no storage */
  }
  return null;
}

function headers(api: "v1" | "v2"): Record<string, string> {
  const k = getStoredKey();
  if (!k) throw new Error("No Higgsfield key — paste KEY:SECRET in the Forge settings.");
  return api === "v1"
    ? { "hf-api-key": k.key, "hf-secret": k.secret, "content-type": "application/json" }
    : { authorization: `Key ${k.key}:${k.secret}`, "content-type": "application/json" };
}

async function hfError(r: Response): Promise<string> {
  let detail = `${r.status}`;
  try {
    const j = await r.json();
    detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail ?? j).slice(0, 300);
  } catch {
    /* keep status */
  }
  if (r.status === 401) return `Invalid credentials (${detail})`;
  if (r.status === 403) return "Not enough Higgsfield credits";
  return detail;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type V1Job = { status: string; results?: { raw?: { url?: string; type?: string } } | null };

function fromV1(jobs: V1Job[]): HFResult {
  const done = ["completed", "failed", "nsfw", "canceled"];
  const status = (jobs.find((j) => done.includes(j.status))?.status ??
    jobs[0]?.status ??
    "queued") as HFResult["status"];
  return {
    status,
    urls: jobs
      .map((j) => j.results?.raw)
      .filter((x): x is { url: string; type: string } => Boolean(x?.url))
      .map((x) => ({ url: x.url, type: x.type === "video" ? "video" : "image" })),
  };
}

type V2Status = {
  status?: string;
  images?: { url: string }[];
  video?: { url: string };
};

function fromV2(d: V2Status): HFResult {
  const urls: HFResult["urls"] = [];
  for (const im of d.images ?? []) if (im.url) urls.push({ url: im.url, type: "image" });
  if (d.video?.url) urls.push({ url: d.video.url, type: "video" });
  return { status: (d.status ?? "queued") as HFResult["status"], urls };
}

/**
 * Submit a generation and poll to completion.
 * onUpdate fires with each intermediate status so the UI can breathe.
 */
export async function generate(
  model: HFModel,
  input: { prompt: string; aspect: string; seed?: number; imageUrls?: string[] },
  onUpdate?: (status: string) => void,
  maxPollMs = 300_000,
): Promise<HFResult> {
  const body =
    model.api === "v1" ? { params: model.buildBody(input) } : model.buildBody(input);
  const r = await fetch(`${HF_BASE}${model.endpoint}`, {
    method: "POST",
    headers: headers(model.api),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await hfError(r));
  const first = await r.json();

  const start = Date.now();
  const terminal = ["completed", "failed", "nsfw", "canceled"];

  if (model.api === "v1") {
    let jobs: V1Job[] = first.jobs ?? [];
    const id: string = first.id;
    let res = fromV1(jobs);
    while (!terminal.includes(res.status) && Date.now() - start < maxPollMs) {
      onUpdate?.(res.status);
      await sleep(2500);
      const p = await fetch(`${HF_BASE}/v1/job-sets/${id}`, { headers: headers("v1") });
      if (p.ok) {
        jobs = (await p.json()).jobs ?? jobs;
        res = fromV1(jobs);
      }
    }
    return res;
  }

  // v2: {request_id, status_url}
  const id: string = first.request_id;
  let res = fromV2(first);
  while (!terminal.includes(res.status) && Date.now() - start < maxPollMs) {
    onUpdate?.(res.status);
    await sleep(2500);
    const p = await fetch(`${HF_BASE}/requests/${id}/status`, { headers: headers("v2") });
    if (p.ok) res = fromV2(await p.json());
  }
  return res;
}

/**
 * Push a local/Vault image up to Higgsfield's CDN and get a public URL —
 * that's how a Vault asset becomes the reference for an edit or i2v job.
 */
export async function uploadToHiggsfield(blob: Blob): Promise<string> {
  const contentType = blob.type || "image/png";
  const link = await fetch(`${HF_BASE}/files/generate-upload-url`, {
    method: "POST",
    headers: headers("v1"),
    body: JSON.stringify({ content_type: contentType }),
  });
  if (!link.ok) throw new Error(`upload-url: ${await hfError(link)}`);
  const { upload_url, public_url } = await link.json();
  const put = await fetch(upload_url, {
    method: "PUT",
    headers: { "content-type": contentType },
    body: blob,
  });
  if (!put.ok) throw new Error(`CDN upload failed (${put.status})`);
  return public_url as string;
}
