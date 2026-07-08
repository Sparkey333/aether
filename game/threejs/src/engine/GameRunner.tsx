// Drives the fixed-step loop each render frame, then interpolates the rendered actors + camera toward
// the latest step. Also toggles the swing blade, flashes enemies on hitstop, projects the lock-on
// reticle, and pushes the HUD snapshot to the store. Runs at priority 1 (before the RetroPipeline).
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { game } from '@/engine/game';
import { actorView } from '@/render/actorView';
import { positionCamera } from '@/render/camera/ThirdPersonCamera';
import { gameCamera } from '@/render/gameCamera';
import { useRunStore } from '@/state/runStore';
import { lerp } from '@/engine/math';

function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

const _proj = new THREE.Vector3();

function setEmissive(mesh: THREE.Object3D | undefined, value: number): void {
  const cap = mesh?.children?.[0] as THREE.Mesh | undefined;
  const mat = cap?.material as THREE.RawShaderMaterial | undefined;
  if (mat?.uniforms?.uEmissive) mat.uniforms.uEmissive.value = value;
}

export function GameRunner() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement;
    el.tabIndex = 0;
    game.input.attach(el);
    (window as unknown as { __aether?: unknown }).__aether = {
      game,
      get frame() {
        return game.loop.frame;
      },
      get player() {
        const p = game.player;
        return p ? { x: p.x, z: p.z, yaw: p.yaw, hp: p.health.current, stamina: p.stamina, aether: p.aether.current, flow: p.flow.rankName(), state: p.state } : null;
      },
      get enemies() {
        return game.enemies.map((e) => ({ id: e.id, hp: e.health.current, x: e.x, z: e.z, state: e.state }));
      },
    };
    return () => game.input.dispose();
  }, [gl]);

  useFrame((_, delta) => {
    game.loop.advance(delta);
    const p = game.player;
    if (!p) return;
    const a = game.loop.alpha;

    // ---- player ----
    const ix = lerp(p.prevX, p.x, a);
    const iz = lerp(p.prevZ, p.z, a);
    const iyaw = lerpAngle(p.prevYaw, p.yaw, a);
    if (actorView.playerMesh) {
      actorView.playerMesh.position.set(ix, p.y, iz);
      actorView.playerMesh.rotation.y = iyaw;
    }
    if (actorView.blade) actorView.blade.visible = p.activeHits().length > 0;
    positionCamera(game.cam, ix, p.y, iz);

    // ---- enemies ----
    for (const e of game.enemies) {
      const mesh = actorView.enemies.get(e.id);
      if (!mesh) continue;
      const ex = lerp(e.prevX, e.x, a);
      const ez = lerp(e.prevZ, e.z, a);
      mesh.position.set(ex, e.y, ez);
      mesh.rotation.y = lerpAngle(e.prevYaw, e.yaw, a);
      if (!e.alive()) {
        mesh.rotation.x = Math.min(Math.PI / 2, e.deadFrames * 0.05);
      }
      // white flash while in hitstop (i.e. just took a hit)
      setEmissive(mesh, e.freezeFrames > 0 ? 0.8 : 0);
    }

    // ---- lock-on reticle ----
    const t = game.lockOn?.active ? game.lockOn.target : null;
    let reticleVisible = false;
    let reticleX = 50;
    let reticleY = 50;
    if (t) {
      _proj.set(t.x, t.y + 1.0, t.z).project(gameCamera);
      if (_proj.z < 1) {
        reticleVisible = true;
        reticleX = (_proj.x * 0.5 + 0.5) * 100;
        reticleY = (-_proj.y * 0.5 + 0.5) * 100;
      }
    }

    useRunStore.setState({ ...game.hudSnapshot(), reticleVisible, reticleX, reticleY });
  }, 1);

  return null;
}
