#!/usr/bin/env python3
"""
forge_aetherius.py — a dependency-free pixel forge for Aetherius, the guide.

In the spirit of scripts/heartbeat.mjs (zero deps), this writes PNGs with nothing
but the standard library (zlib + struct). It renders one sprite — Aetherius, the
cartographer-watchman who "keeps the lamp and the ledger" — in three palettes:

  1. gba   — handheld, muted indigo robe, warm lamp  (Game Boy Advance feel)
  2. snes  — richer violet/teal, higher contrast      (16-bit feel)
  3. doll  — desaturated grey plush, soft contrast     (3D anniversary-doll feel,
             same pixel grid, "converted" look)

Run:  python3 scripts/forge_aetherius.py
Out:  docs/aetherius/sprites/*.png
"""
import os
import zlib
import struct

W, H = 34, 40          # source pixel grid
SCALE = 14             # nearest-neighbour upscale for the individual sprites
OUTDIR = os.path.join("docs", "aetherius", "sprites")

# ---- palette indices (semantic) -------------------------------------------
# 0 transparent · 1 outline · 2 cloak-shadow · 3 cloak-mid · 4 cloak-light
# 5 face-shadow · 6 hand/skin · 7 eye-glow · 8 lamp-core · 9 lamp-halo
# 10 gold/metal · 11 star/white · 12 parchment

PALETTES = {
    "gba": {
        0: (0, 0, 0, 0),       1: (20, 18, 28, 255),   2: (38, 46, 78, 255),
        3: (58, 72, 120, 255), 4: (96, 120, 176, 255), 5: (28, 26, 44, 255),
        6: (224, 176, 128, 255), 7: (120, 232, 232, 255), 8: (255, 224, 140, 255),
        9: (240, 170, 70, 255), 10: (228, 188, 92, 255), 11: (248, 244, 210, 255),
        12: (224, 206, 160, 255),
    },
    "snes": {
        0: (0, 0, 0, 0),        1: (16, 14, 26, 255),    2: (40, 30, 70, 255),
        3: (74, 58, 128, 255),  4: (126, 108, 196, 255), 5: (22, 18, 36, 255),
        6: (240, 196, 150, 255), 7: (150, 255, 242, 255), 8: (255, 238, 170, 255),
        9: (255, 176, 64, 255), 10: (245, 206, 104, 255), 11: (255, 252, 232, 255),
        12: (236, 220, 176, 255),
    },
    "doll": {
        0: (0, 0, 0, 0),         1: (60, 58, 66, 255),    2: (120, 120, 132, 255),
        3: (158, 158, 170, 255), 4: (196, 196, 206, 255), 5: (96, 96, 108, 255),
        6: (214, 196, 180, 255), 7: (150, 210, 214, 255), 8: (250, 232, 196, 255),
        9: (230, 196, 150, 255), 10: (206, 190, 150, 255), 11: (244, 242, 238, 255),
        12: (220, 212, 198, 255),
    },
}

# half-width of the bell-shaped cloak, by row
HW = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 7, 10: 8, 11: 8, 12: 9,
    13: 10, 14: 11, 15: 11, 16: 11, 17: 11, 18: 11, 19: 11, 20: 11, 21: 11,
    22: 12, 23: 12, 24: 12, 25: 12, 26: 12, 27: 13, 28: 13, 29: 13, 30: 13,
    31: 14, 32: 14, 33: 14, 34: 14, 35: 14,
}
# half-width of the face opening within the hood, by row
FW = {7: 2, 8: 3, 9: 4, 10: 4, 11: 3, 12: 2}


def new_grid():
    return [[0] * W for _ in range(H)]


def put(g, x, y, i):
    if 0 <= x < W and 0 <= y < H:
        g[y][x] = i


def span(hw):
    return range(16 - hw + 1, 16 + hw + 1)  # symmetric about x = 16.5


def build():
    g = new_grid()

    # 1) cloak body with cylinder shading
    for y, hw in HW.items():
        xs = list(span(hw))
        n = len(xs)
        for k, x in enumerate(xs):
            t = 0.5 if n <= 1 else k / (n - 1)
            put(g, x, y, 4 if t < 0.28 else (2 if t > 0.70 else 3))

    # 2) face opening + hood rim + eyes + forehead spark
    for y, fw in FW.items():
        for x in range(16 - fw + 1, 16 + fw + 1):
            put(g, x, y, 5)
        # hood rim light framing the face
        put(g, 16 - fw, y, 4)
        put(g, 17 + fw, y, 4)
    for x in range(13, 21):     # top brow of the hood opening
        if g[7][x] in (3, 4, 5):
            put(g, x, 7, 4)
    # eyes (glowing, two tall)
    for ey in (9, 10):
        put(g, 14, ey, 7)
        put(g, 19, ey, 7)
    put(g, 16, 7, 11)           # forehead spark / the centerstone glint

    # 3) chest cross — Christ the centerstone
    for y in range(19, 23):
        put(g, 16, y, 11)
    for x in range(15, 18):
        put(g, x, 20, 11)

    # 4) the lamp on its staff (viewer-left): "keep the lamp"
    for y in range(12, 30):     # staff
        put(g, 4, y, 10)
    put(g, 4, 7, 10)            # lantern cap
    for y in range(8, 12):      # lantern frame box
        for x in range(3, 6):
            put(g, x, y, 10)
    put(g, 4, 9, 8); put(g, 4, 10, 8)         # lantern core glow
    put(g, 3, 9, 9); put(g, 5, 9, 9)          # lantern halo
    put(g, 3, 10, 9); put(g, 5, 10, 9)
    put(g, 4, 8, 8)
    put(g, 3, 7, 11); put(g, 5, 7, 11)        # spark glints
    # hand gripping the staff
    put(g, 5, 18, 6); put(g, 5, 19, 6); put(g, 6, 19, 6)

    # 5) the ledger (viewer-right): "keep the ledger"
    for y in range(21, 28):
        for x in range(27, 31):
            put(g, x, y, 12)
    for x in range(27, 31):     # rolled top edge
        put(g, x, 21, 10)
    for ly in (23, 25):         # lines of writing
        for x in range(28, 30):
            put(g, x, ly, 1)

    # 6) the guiding star (the Magi star), upper-right
    cx, cy = 26, 5
    for (dx, dy) in [(0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)]:
        put(g, cx + dx, cy + dy, 11)
    for (dx, dy) in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        put(g, cx + dx, cy + dy, 9)

    # 7) outline pass — wrap the silhouette in dark, classic sticker look
    outlined = [row[:] for row in g]
    for y in range(H):
        for x in range(W):
            if g[y][x] != 0:
                continue
            touch = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and g[ny][nx] not in (0, 1):
                    touch = True
                    break
            if touch:
                outlined[y][x] = 1
    return outlined


# ---- PNG writer (pure stdlib) ---------------------------------------------
def write_png(path, w, h, rgba):
    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data +
                struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff))
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)
        raw.extend(rgba[y * stride:(y + 1) * stride])
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        f.write(chunk(b"IEND", b""))


def render(grid, palette, scale):
    w, h = W * scale, H * scale
    buf = bytearray(w * h * 4)
    for Y in range(h):
        sy = Y // scale
        for X in range(w):
            sx = X // scale
            r, gr, b, a = palette[grid[sy][sx]]
            o = (Y * w + X) * 4
            buf[o] = r; buf[o + 1] = gr; buf[o + 2] = b; buf[o + 3] = a
        return_row = None  # noop, keep linters calm
    return w, h, bytes(buf)


def contact_sheet(grid, scale, gap, bg):
    names = ["gba", "snes", "doll"]
    sw, sh = W * scale, H * scale
    w = gap + len(names) * (sw + gap)
    h = gap * 2 + sh
    buf = bytearray()
    for _ in range(w * h):
        buf.extend(bg)
    def blit(px, py, sub_w, sub_h, sub):
        for y in range(sub_h):
            for x in range(sub_w):
                r, g, b, a = (sub[(y * sub_w + x) * 4 + i] for i in range(4))
                if a == 0:
                    continue
                o = ((py + y) * w + (px + x)) * 4
                buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = 255
    for idx, name in enumerate(names):
        sub_w, sub_h, sub = render(grid, PALETTES[name], scale)
        blit(gap + idx * (sw + gap), gap, sub_w, sub_h, sub)
    return w, h, bytes(buf)


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    grid = build()
    for name, palette in PALETTES.items():
        w, h, rgba = render(grid, palette, SCALE)
        path = os.path.join(OUTDIR, f"aetherius_{name}.png")
        write_png(path, w, h, rgba)
        print(f"  wrote {path}  ({w}x{h})")
    w, h, rgba = contact_sheet(grid, 10, 20, (17, 19, 26, 255))
    sheet = os.path.join(OUTDIR, "aetherius_trinity.png")
    write_png(sheet, w, h, rgba)
    print(f"  wrote {sheet}  ({w}x{h})")


if __name__ == "__main__":
    main()
