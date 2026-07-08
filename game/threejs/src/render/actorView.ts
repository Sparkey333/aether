// Bridge between simulation state and the rendered scene graph. The Scene registers its meshes here;
// the GameRunner interpolates them toward the latest fixed-step transform each render frame.
import type { Object3D } from 'three';

export const actorView: {
  playerMesh: Object3D | null;
  blade: Object3D | null;
  enemies: Map<string, Object3D>;
} = {
  playerMesh: null,
  blade: null,
  enemies: new Map(),
};
