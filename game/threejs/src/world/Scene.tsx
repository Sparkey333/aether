// Greybox of Area A — Threshold Hall (M1/M2): floor, walls, organ-pipe pillars, the Attunement
// Stone, and the guiding leyline light. All primitives with the PS1 material. Sets up collision.
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { makePsxMaterial } from '@/render/materials/psxMaterial';
import { makeChecker, makeNoise } from '@/render/textures';
import { collision, type AABB } from '@/world/collision';
import { actorView } from '@/render/actorView';
import { GUIDING_LIGHT_COLOR } from '@/data/tiers';

const PILLARS: [number, number][] = [
  [-8, -6], [8, -6], [-8, 2], [8, 2], [0, -12],
];

export function Scene() {
  const { group, playerGroup } = useMemo(() => {
    const group = new THREE.Group();

    const checker = makeChecker(16, '#2a3242', '#1c2330');
    const noise = makeNoise(32, '#3a3344');

    // floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1, 40),
      makePsxMaterial({ color: '#26303f', map: checker, uvScale: [20, 20] }),
    );
    floor.position.y = -0.5;
    group.add(floor);

    // outer walls (interior ~36 across)
    const wallMat = () => makePsxMaterial({ color: '#3a3550', map: noise, uvScale: [10, 2] });
    const wallDefs: [number, number, number, number, number][] = [
      // x, z, sizeX, sizeZ, (height implied)
      [0, -18, 38, 1, 0],
      [0, 18, 38, 1, 0],
      [-18, 0, 1, 38, 0],
      [18, 0, 1, 38, 0],
    ];
    for (const [x, z, sx, sz] of wallDefs) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(sx, 6, sz), wallMat());
      w.position.set(x, 3, z);
      group.add(w);
    }

    // organ-pipe pillars (also collision obstacles)
    const obstacles: AABB[] = [];
    for (const [px, pz] of PILLARS) {
      const h = 5 + ((px + pz) % 3);
      const p = new THREE.Mesh(new THREE.BoxGeometry(2, h, 2), makePsxMaterial({ color: '#4a4258', map: noise, uvScale: [2, h / 2] }));
      p.position.set(px, h / 2, pz);
      group.add(p);
      obstacles.push({ minX: px - 1, maxX: px + 1, minZ: pz - 1, maxZ: pz + 1 });
    }

    // Attunement Stone (the only checkpoint) — gold, self-lit
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 3, 0.8),
      makePsxMaterial({ color: GUIDING_LIGHT_COLOR, emissive: 0.85 }),
    );
    stone.position.set(11, 1.5, 11);
    group.add(stone);
    obstacles.push({ minX: 10.5, maxX: 11.5, minZ: 10.5, maxZ: 11.5 });

    // guiding leyline light — a dotted gold thread along the critical path toward the north exit
    const litMat = makePsxMaterial({ color: GUIDING_LIGHT_COLOR, emissive: 1.0 });
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.9), litMat);
      seg.position.set(
        THREE.MathUtils.lerp(9, 0, t),
        0.04,
        THREE.MathUtils.lerp(9, -16, t),
      );
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
    // facing nub (so rotation is readable in the greybox)
    const nub = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.5),
      makePsxMaterial({ color: '#ebbe5a', emissive: 0.6 }),
    );
    nub.position.set(0, 1.1, 0.45);
    playerGroup.add(nub);
    playerGroup.position.set(0, 0, 6);

    return { group, playerGroup };
  }, []);

  useEffect(() => {
    actorView.playerMesh = playerGroup;
    return () => {
      actorView.playerMesh = null;
    };
  }, [playerGroup]);

  return (
    <>
      <primitive object={group} />
      <primitive object={playerGroup} />
    </>
  );
}
