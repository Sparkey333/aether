// Third-person follow camera. Angles update on the fixed step (from look input); position is
// computed every render frame from the interpolated player target for smooth follow.
import { gameCamera } from '@/render/gameCamera';
import { clamp } from '@/engine/math';

export interface CamState {
  yaw: number;
  pitch: number;
}

const LOOK_SENS = 0.0022;
const DIST = 5.4;
const PITCH_MIN = -0.2;
const PITCH_MAX = 0.85;

export function applyLook(cam: CamState, dx: number, dy: number): void {
  cam.yaw -= dx * LOOK_SENS;
  cam.pitch = clamp(cam.pitch + dy * LOOK_SENS, PITCH_MIN, PITCH_MAX);
}

export function positionCamera(cam: CamState, tx: number, ty: number, tz: number): void {
  // "forward" (where W moves the player) is (sin(yaw), cos(yaw)); camera sits behind along -forward.
  const fx = Math.sin(cam.yaw);
  const fz = Math.cos(cam.yaw);
  const horiz = Math.cos(cam.pitch) * DIST;
  gameCamera.position.set(
    tx - fx * horiz,
    ty + 1.3 + Math.sin(cam.pitch) * DIST,
    tz - fz * horiz,
  );
  gameCamera.lookAt(tx, ty + 1.1, tz);
}
