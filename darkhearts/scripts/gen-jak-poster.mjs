// Generates posters/jak-fork.png (512x512) with zero dependencies, same
// raw-PNG technique as hollowmark-web/scripts/gen-icon.mjs: a Precursor-amber
// ring around a green eco spark on a warm dark field — the studio's bay art
// for the OpenGOAL engine fork. Run: node darkhearts/scripts/gen-jak-poster.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const SIZE = 512;

function pixel(x, y) {
  const cx = x - SIZE / 2, cy = y - SIZE / 2;
  const r = Math.hypot(cx, cy);

  // warm dark field with a faint amber radial glow
  const glow = Math.max(0, 1 - r / (SIZE * 0.7));
  let [red, green, blue] = [16 + 44 * glow, 11 + 26 * glow, 8 + 10 * glow];

  // Precursor-amber ring
  if (r > 150 && r < 200) {
    const t = 1 - Math.abs(r - 175) / 25;
    red = red * (1 - t) + 255 * t;
    green = green * (1 - t) + 176 * t;
    blue = blue * (1 - t) + 46 * t;
  }
  // green eco spark diamond at center
  const diamond = Math.abs(cx) + Math.abs(cy);
  if (diamond < 90) {
    const t = 1 - diamond / 90;
    red = red * (1 - t) + 78 * t;
    green = green * (1 - t) + 130 * t * 1.6;
    blue = blue * (1 - t) + 52 * t;
  }
  return [Math.min(255, red) | 0, Math.min(255, green) | 0, Math.min(255, blue) | 0, 255];
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  const row = y * (SIZE * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < SIZE; x++) {
    const [r, g, b, a] = pixel(x, y);
    raw.writeUInt8(r, row + 1 + x * 4);
    raw.writeUInt8(g, row + 2 + x * 4);
    raw.writeUInt8(b, row + 3 + x * 4);
    raw.writeUInt8(a, row + 4 + x * 4);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(new URL('../posters/', import.meta.url), { recursive: true });
writeFileSync(new URL('../posters/jak-fork.png', import.meta.url), png);
console.log('posters/jak-fork.png written (512x512).');
