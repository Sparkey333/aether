// PS1 world vertex shader (GLSL ES 3.00, used via RawShaderMaterial + GLSL3).
// - Vertex snapping: quantize post-projection NDC.xy to a low-res grid -> the characteristic wobble.
// - Affine UVs WITHOUT `noperspective` (unsupported in WebGL2): premultiply uv by clip.w here and
//   divide by w in the fragment, so the perspective-correct interpolator resolves to screen-linear.
// - Vertex lighting only (1 directional + ambient). No per-pixel light, no normal maps.
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform vec2 uSnap;          // vertex-snap grid, e.g. (160, 120)
uniform vec2 uUvScale;       // tiling factor for the (point-sampled) texture
uniform vec3 uLightDirView;  // directional light dir in VIEW space (normalized)
uniform vec3 uLightColor;
uniform vec3 uAmbient;

out vec2 vUvW;   // uv * w  (affine trick)
out float vW;    // w
out float vFogDepth;
out vec3 vLight;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;

  vec4 clip = projectionMatrix * mv;

  // PS1 vertex snapping — quantize NDC.xy, preserve w so perspective survives.
  vec3 ndc = clip.xyz / clip.w;
  ndc.xy = floor(ndc.xy * uSnap + 0.5) / uSnap;
  clip.xy = ndc.xy * clip.w;
  gl_Position = clip;

  vec3 n = normalize(normalMatrix * normal);
  float ndl = max(dot(n, uLightDirView), 0.0);
  vLight = uAmbient + uLightColor * ndl;

  // affine texture warp: cancel perspective correction
  vUvW = uv * uUvScale * clip.w;
  vW = clip.w;
}
