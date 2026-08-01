// Zero-dependency, zero-API-key placeholder generator. Produces a
// deterministic abstract PNG tile (color/pattern seeded from the prompt
// text) plus a sidecar .txt with the literal prompt — NOT real generative
// art. Its only job is to let the pipeline's plumbing (CLI, prompt
// library, batch mode, file layout) be exercised end-to-end before any
// paid provider key exists.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import path from 'node:path';

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildPng(prompt, size) {
  const seed = hash(prompt);
  const hueA = seed % 360;
  const hueB = (hueA + 120 + (seed >>> 8) % 90) % 360;

  const hsl = (h, s, l) => {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  };
  const [ar, ag, ab] = hsl(hueA, 55, 14); // dark ground, low saturation
  const [br, bg, bb] = hsl(hueB, 70, 45); // accent

  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const cx = x - size / 2, cy = y - size / 2;
      const angle = Math.atan2(cy, cx) + Math.sin((seed % 97) / 10);
      const radius = Math.hypot(cx, cy) / (size / 2);
      const band = (Math.sin(angle * (3 + (seed % 5)) + radius * 8) + 1) / 2;
      const t = Math.max(0, Math.min(1, band * (1 - radius * 0.6)));
      const r = ar + (br - ar) * t, g = ag + (bg - ag) * t, b = ab + (bb - ab) * t;
      const off = row + 1 + x * 4;
      raw.writeUInt8(r | 0, off); raw.writeUInt8(g | 0, off + 1);
      raw.writeUInt8(b | 0, off + 2); raw.writeUInt8(255, off + 3);
    }
  }

  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export async function generateImage({ prompt, outPath, size = 512 }) {
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, buildPng(prompt, size));
  writeFileSync(outPath.replace(/\.png$/, '.prompt.txt'), prompt);
  console.log('  [mock] placeholder tile only — not real generative art. Add a provider key for the real thing.');
  return { outPath, provider: 'mock' };
}

export async function generateVideo() {
  throw new Error('Mock provider only produces placeholder images — video generation needs a real provider key (Runway, Luma, Kling, Pika, or Higgsfield).');
}
