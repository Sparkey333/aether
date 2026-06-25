// Factory for the PS1 world material (RawShaderMaterial, GLSL3). Snap + affine + vertex light + fog.
// All instances register here so the pipeline can refresh view-space light dir + fog once per frame.
import * as THREE from 'three';
import vert from '@/render/shaders/psx_world.vert.glsl';
import frag from '@/render/shaders/psx_world.frag.glsl';
import { hexToRgb01 } from '@/engine/math';

const registry = new Set<THREE.RawShaderMaterial>();

export interface PsxOptions {
  color?: string;
  map?: THREE.Texture | null;
  emissive?: number; // 0..1 self-lit
  snap?: [number, number];
  uvScale?: [number, number];
}

export function makePsxMaterial(opts: PsxOptions = {}): THREE.RawShaderMaterial {
  const [r, g, b] = hexToRgb01(opts.color ?? '#9aa3b2');
  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uSnap: { value: new THREE.Vector2(...(opts.snap ?? [160, 120])) },
      uUvScale: { value: new THREE.Vector2(...(opts.uvScale ?? [1, 1])) },
      uLightDirView: { value: new THREE.Vector3(0, 0, 1) },
      uLightColor: { value: new THREE.Color(1.0, 0.96, 0.86) },
      uAmbient: { value: new THREE.Color(0.28, 0.3, 0.4) },
      uMap: { value: opts.map ?? null },
      uUseMap: { value: !!opts.map },
      uColor: { value: new THREE.Vector3(r, g, b) },
      uFogColor: { value: new THREE.Vector3(0.102, 0.122, 0.18) },
      uFogStart: { value: 8 },
      uFogEnd: { value: 36 },
      uEmissive: { value: opts.emissive ?? 0 },
    },
  });
  registry.add(mat);
  return mat;
}

const _lightWorld = new THREE.Vector3(-0.4, -1.0, -0.5).normalize();
const _lightView = new THREE.Vector3();
const _nm = new THREE.Matrix3();

export interface FrameFog {
  color: [number, number, number];
  start: number;
  end: number;
}

/** call once per frame before rendering the world: transform light to view space, push fog. */
export function updatePsxFrame(camera: THREE.Camera, fog: FrameFog): void {
  _nm.getNormalMatrix(camera.matrixWorldInverse);
  _lightView.copy(_lightWorld).applyMatrix3(_nm).normalize().negate();
  for (const m of registry) {
    (m.uniforms.uLightDirView.value as THREE.Vector3).copy(_lightView);
    (m.uniforms.uFogColor.value as THREE.Vector3).set(...fog.color);
    m.uniforms.uFogStart.value = fog.start;
    m.uniforms.uFogEnd.value = fog.end;
  }
}

export function disposePsxRegistry(): void {
  for (const m of registry) m.dispose();
  registry.clear();
}
