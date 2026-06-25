// Drives the fixed-step loop each render frame, then interpolates the rendered actors + camera
// toward the latest step. Runs at priority 1 (before the RetroPipeline render at priority 2).
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { game } from '@/engine/game';
import { actorView } from '@/render/actorView';
import { positionCamera } from '@/render/camera/ThirdPersonCamera';
import { lerp } from '@/engine/math';

function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export function GameRunner() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement;
    el.tabIndex = 0;
    game.input.attach(el);
    // Debug/verification hook (also the seed of the deterministic replay harness, M-later).
    (window as unknown as { __aether?: unknown }).__aether = {
      game,
      get frame() {
        return game.loop.frame;
      },
      get player() {
        return game.player ? { x: game.player.x, z: game.player.z, yaw: game.player.yaw, stamina: game.player.stamina, state: game.player.state } : null;
      },
    };
    return () => game.input.dispose();
  }, [gl]);

  useFrame((_, delta) => {
    game.loop.advance(delta);

    const p = game.player;
    if (!p) return;
    const a = game.loop.alpha;
    const ix = lerp(p.prevX, p.x, a);
    const iz = lerp(p.prevZ, p.z, a);
    const iyaw = lerpAngle(p.prevYaw, p.yaw, a);

    if (actorView.playerMesh) {
      actorView.playerMesh.position.set(ix, p.y, iz);
      actorView.playerMesh.rotation.y = iyaw;
    }
    positionCamera(game.cam, ix, p.y, iz);
  }, 1);

  return null;
}
