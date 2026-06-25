// Post pass: nearest-sample the low-res target, quantize to RGB555 (5 bits/channel) with
// ordered Bayer 4x4 dithering aligned to source pixels. The PS1 banding-hider.
precision highp float;

in vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uTexSize;  // internal resolution (e.g. 320 x 240)
uniform float uLevels;  // 2^bits - 1 (bits=5 -> 31)
uniform float uDither;  // strength (0..1)

out vec4 fragColor;

float bayer4(vec2 p) {
  float m[16] = float[16](
    0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  );
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  return (m[x + y * 4] + 0.5) / 16.0 - 0.5;
}

void main() {
  vec3 c = texture(uTex, vUv).rgb;
  vec2 srcPx = floor(vUv * uTexSize); // dither pattern locked to chunky source pixels
  float d = bayer4(srcPx) * uDither / uLevels;
  vec3 q = floor(c * uLevels + 0.5 + d) / uLevels;
  fragColor = vec4(clamp(q, 0.0, 1.0), 1.0);
}
