// Greybox of Area A — Threshold Hall: floor, walls, organ-pipe pillars, the Attunement Stone, and the
// guiding leyline light. Also builds the player (with a swing "blade") and the M3 enemy encounter
// meshes, registering them with actorView so the GameRunner can interpolate them each render frame.
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { makePsxMaterial } from '@/render/materials/psxMaterial';
import { makeChecker, makeNoise } from '@/render/textures';
import { collision, type AABB } from '@/world/collision';
import { actorView } from '@/render/actorView';
import { GUIDING_LIGHT_COLOR } from '@/data/tiers';
import { game } from '@/engine/game';

const PILLARS: [number, number][] = [
  [-8, -6], [8, -6], [-8, 2], [8, 2], [0, -12],
];

const ENEMY_COLOR: Record<string, string> = {
  husk: '#6a4550',
  'sundered-acolyte': '#5a4a6a',
  'stone-sentinel': '#6a6658',
};

export function Scene() {
  const { group, playerGroup } = useMemo(() => {
    const group = new THREE.Group();

    const checker = makeChecker(16, '#2a3242', '#1c2330');
    const noise = makeNoise(32, '#3a3344');

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1, 40),
      makePsxMaterial({ color: '#26303f', map: checker, uvScale: [20, 20] }),
    );
    floor.position.y = -0.5;
    group.add(floor);

    const wallMat = () => makePsxMaterial({ color: '#3a3550', map: noise, uvScale: [10, 2] });
    const wallDefs: [number, number, number, number][] = [
      [0, -18, 38, 1], [0, 18, 38, 1], [-18, 0, 1, 38], [18, 0, 1, 38],
    ];
    for (const [x, z, sx, sz] of wallDefs) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(sx, 6, sz), wallMat());
      w.position.set(x, 3, z);
      group.add(w);
    }

    const obstacles: AABB[] = [];
    for (const [px, pz] of PILLARS) {
      const h = 5 + ((px + pz) % 3);
      const p = new THREE.Mesh(new THREE.BoxGeometry(2, h, 2), makePsxMaterial({ color: '#4a4258', map: noise, uvScale: [2, h / 2] }));
      p.position.set(px, h / 2, pz);
      group.add(p);
      obstacles.push({ minX: px - 1, maxX: px + 1, minZ: pz - 1, maxZ: pz + 1 });
    }

    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 3, 0.8),
      makePsxMaterial({ color: GUIDING_LIGHT_COLOR, emissive: 0.85 }),
    );
    stone.position.set(11, 1.5, 11);
    group.add(stone);
    obstacles.push({ minX: 10.5, maxX: 11.5, minZ: 10.5, maxZ: 11.5 });

    const litMat = makePsxMaterial({ color: GUIDING_LIGHT_COLOR, emissive: 1.0 });
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.9), litMat);
      seg.position.set(THREE.MathUtils.lerp(9, 0, t), 0.04, THREE.MathUtils.lerp(9, -16, t));
      group.add(seg);
    }

    collision.reset();
    collision.bound = { minX: -17, maxX: 17, minZ: -17, maxZ: 17 };
    collision.obstacles = obstacles;

    // ---- player ----
    const playerGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 1.0, 4, 8),
      makePsxMaterial({ color: '#c8d2e6' }),
    );
    body.position.y = 0.9;
    playerGroup.add(body);
    const nub = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.5),
      makePsxMaterial({ color: '#ebbe5a', emissive: 0.6 }),
    );
    nub.position.set(0, 1.1, 0.45);
    playerGroup.add(nub);
    // the swing "blade" — visible only during an attack's active frames
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 2.3),
      makePsxMaterial({ color: '#ebbe5a', emissive: 1.0 }),
    );
    blade.position.set(0, 1.0, 1.5);
    blade.visible = false;
    playerGroup.add(blade);
    playerGroup.position.set(0, 0, 6);

    // ---- enemies ----
    for (const e of game.enemies) {
      const g = new THREE.Group();
      const bodyColor = ENEMY_COLOR[e.displayName === 'Husk' ? 'husk' : e.displayName === 'Stone Sentinel' ? 'stone-sentinel' : 'sundered-acolyte'] ?? '#6a4550';
      const cap = new THREE.Mesh(
        new THREE.CapsuleGeometry(e.hurtRadius, Math.max(0.2, e.hurtHeight - e.hurtRadius * 2), 4, 8),
        makePsxMaterial({ color: bodyColor }),
      );
      cap.position.y = e.hurtHeight / 2;
      g.add(cap);
      const enub = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.4), makePsxMaterial({ color: '#12121a' }));
      enub.position.set(0, e.hurtHeight * 0.62, e.hurtRadius + 0.15);
      g.add(enub);
      g.position.set(e.x, 0, e.z);
      group.add(g);
      actorView.enemies.set(e.id, g);
    }

    actorView.blade = blade;
    return { group, playerGroup };
  }, []);

  useEffect(() => {
    actorView.playerMesh = playerGroup;
    return () => {
      actorView.playerMesh = null;
      actorView.blade = null;
      actorView.enemies.clear();
    };
  }, [playerGroup]);

  return (
    <>
      <primitive object={group} />
      <primitive object={playerGroup} />
    </>
  );
}
