// The single gameplay camera. Aspect is locked to the internal 4:3 target (320/240) regardless of
// window size — the RetroPipeline renders the world through this camera into the low-res target.
import * as THREE from 'three';

export const gameCamera = new THREE.PerspectiveCamera(60, 320 / 240, 0.1, 38);
gameCamera.position.set(0, 4, 8);
gameCamera.lookAt(0, 1, 0);
