// PS1 world fragment shader. Point-sampled texture (or flat color) * vertex light, then linear fog.
// Recovers the affine UV by dividing the w-premultiplied uv by w.
precision highp float;

in vec2 vUvW;
in float vW;
in float vFogDepth;
in vec3 vLight;

uniform sampler2D uMap;
uniform bool uUseMap;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogStart;
uniform float uFogEnd;
uniform float uEmissive; // 0 = lit, up to 1 = self-lit (guiding light, ignited circles)

out vec4 fragColor;

void main() {
  vec2 uv = vUvW / vW;
  vec3 base = uUseMap ? texture(uMap, uv).rgb : uColor;
  vec3 lit = mix(base * vLight, base, uEmissive);
  float fog = clamp((uFogEnd - vFogDepth) / (uFogEnd - uFogStart), 0.0, 1.0);
  vec3 col = mix(uFogColor, lit, fog);
  fragColor = vec4(col, 1.0);
}
