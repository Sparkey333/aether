// Owns rendering: world -> 320x240 nearest target (through gameCamera), then a fullscreen
// posterize+dither pass upscales it to the canvas. Having a priority>0 useFrame disables R3F's
// automatic render, so this component is the sole renderer.
import { useThree, useFrame } from '@react-three/fiber';
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

import fsVert from '@/render/shaders/fullscreen.vert.glsl';
import postFrag from '@/render/shaders/posterize_dither.frag.glsl';
import { gameCamera } from '@/render/gameCamera';
import { updatePsxFrame } from '@/render/materials/psxMaterial';
import { loadDesignData } from '@/data/loadDesignData';
import { hexToRgb01 } from '@/engine/math';
import { useRunStore } from '@/state/runStore';

export function RetroPipeline() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const render = loadDesignData().combat.render;

  const { target, postScene, postCamera, postMat } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(render.internalWidth, render.internalHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
      generateMipmaps: false,
    });
    const postMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: fsVert,
      fragmentShader: postFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTex: { value: target.texture },
        uTexSize: { value: new THREE.Vector2(render.internalWidth, render.internalHeight) },
        uLevels: { value: Math.pow(2, render.colorDepthBits) - 1 },
        uDither: { value: render.ditherStrength },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    quad.frustumCulled = false;
    const postScene = new THREE.Scene();
    postScene.add(quad);
    const postCamera = new THREE.Camera();
    return { target, postScene, postCamera, postMat };
  }, [render]);

  useEffect(() => {
    gl.setClearColor(new THREE.Color(...hexToRgb01(render.fog.colorGeneral)), 1);
    return () => {
      target.dispose();
      postMat.dispose();
    };
  }, [gl, target, postMat, render]);

  useFrame(() => {
    const inArena = useRunStore.getState().inArena;
    const fogHex = inArena ? render.fog.colorArena : render.fog.colorGeneral;
    const fogColor = hexToRgb01(fogHex);

    updatePsxFrame(gameCamera, { color: fogColor, start: render.fog.startM, end: render.fog.endM });

    gl.setRenderTarget(target);
    gl.setClearColor(new THREE.Color(...fogColor), 1);
    gl.clear(true, true, true);
    gl.render(scene, gameCamera);

    gl.setRenderTarget(null);
    gl.clear(true, true, true);
    gl.render(postScene, postCamera);
  }, 2);

  return null;
}
