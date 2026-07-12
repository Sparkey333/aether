// POST /api/vault/save — pull a forged Higgsfield result into the Vault
// (web/dev mode only; the Tauri build excludes this file and the UI falls
// back to a browser download instead).
//
// Body: { url, name, prompt?, model?, realm?, role?, tags?, parentId? }
// Writes public/vault/generated/<name>.<ext> + a .meta.json sidecar, then
// re-runs the sync so the catalog picks it up immediately.
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, name, prompt, model, realm, role, tags, parentId } = body ?? {};
  if (typeof url !== "string" || !/^https:\/\//.test(url)) {
    return NextResponse.json({ ok: false, error: "url must be an https URL" }, { status: 400 });
  }

  const r = await fetch(url);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: `fetch ${r.status}` }, { status: 502 });
  }
  const buf = Buffer.from(await r.arrayBuffer());
  const mime = r.headers.get("content-type")?.split(";")[0] ?? "";
  const ext =
    EXT_BY_MIME[mime] ?? (url.match(/\.(png|jpe?g|webp|gif|mp4|webm)(\?|$)/i)?.[1] ?? "png");

  const safe = String(name || "forged")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "forged";
  const stamp = Date.now().toString(36);
  const dir = path.join(process.cwd(), "public", "vault", "generated");
  fs.mkdirSync(dir, { recursive: true });
  const base = `${safe}-${stamp}`;
  fs.writeFileSync(path.join(dir, `${base}.${ext}`), buf);
  fs.writeFileSync(
    path.join(dir, `${base}.meta.json`),
    JSON.stringify({ name: safe, prompt, model, realm, role, tags, parentId, sourceUrl: url, savedAt: new Date().toISOString() }, null, 2),
  );

  // refresh the catalog so the new asset shows up on the next load
  const script = path.join(process.cwd(), "scripts", "asset-sync.mjs");
  await new Promise<void>((resolve) => {
    execFile(process.execPath, [script], { timeout: 120_000 }, () => resolve());
  });

  return NextResponse.json({ ok: true, file: `/vault/generated/${base}.${ext}` });
}
