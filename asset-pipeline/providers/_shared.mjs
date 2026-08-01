// Shared plumbing for every provider adapter: .env loading (no dependency),
// loud-failure key lookup, a fetch wrapper that surfaces real HTTP errors
// instead of swallowing them, and a generic submit-then-poll helper since
// Runway/Luma/Leonardo/Kling all generate asynchronously.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let envLoaded = false;
export function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;
  const envPath = path.join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

/** Throws a specific, actionable error naming the env var and where to get it — never proceeds with a missing key. */
export function requireKey(varName, helpUrl) {
  loadEnv();
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `Missing ${varName}. Get a key at ${helpUrl}, then add ` +
      `${varName}=... to asset-pipeline/.env (copy .env.example first). ` +
      `Or pass --mock to generate a local placeholder instead.`
    );
  }
  return value;
}

export async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${url} → ${res.status} ${res.statusText}: ${JSON.stringify(body).slice(0, 500)}`);
  }
  return body;
}

/** Repeatedly calls `check()` until it returns a truthy result or timeoutMs elapses. */
export async function pollUntilDone(check, { intervalMs = 3000, timeoutMs = 180000, label = 'job' } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${label} to finish.`);
}

export async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Downloading result asset failed: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  mkdirSync(path.dirname(destPath), { recursive: true });
  writeFileSync(destPath, buffer);
  return destPath;
}

export function saveBase64(base64, destPath) {
  mkdirSync(path.dirname(destPath), { recursive: true });
  writeFileSync(destPath, Buffer.from(base64, 'base64'));
  return destPath;
}

export { root };
