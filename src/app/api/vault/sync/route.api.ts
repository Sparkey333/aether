// POST /api/vault/sync — run the Vault harvester (web/dev mode only; the
// Tauri build excludes this file and syncs are run via `npm run assets:sync`).
import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import path from "node:path";

export async function POST() {
  const script = path.join(process.cwd(), "scripts", "asset-sync.mjs");
  const out = await new Promise<{ ok: boolean; log: string }>((resolve) => {
    execFile(process.execPath, [script], { timeout: 120_000 }, (err, stdout, stderr) => {
      resolve({ ok: !err, log: `${stdout}${stderr}`.trim() });
    });
  });
  return NextResponse.json(out, { status: out.ok ? 200 : 500 });
}
