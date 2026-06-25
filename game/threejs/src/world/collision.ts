// Minimal kinematic collision for the greybox: a rectangular arena bound plus axis-aligned box
// obstacles, resolved as circle-vs-AABB push-out in the XZ plane. (Rapier swept-capsule collision
// is the planned M-later upgrade; this is deterministic and sufficient for flat greybox traversal.)
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

class CollisionWorld {
  obstacles: AABB[] = [];
  bound: AABB = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };

  reset(): void {
    this.obstacles = [];
    this.bound = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
  }

  /** resolve a circle of radius r at (x,z); returns corrected [x,z] */
  resolve(x: number, z: number, r: number): [number, number] {
    // keep inside arena bound
    x = Math.max(this.bound.minX + r, Math.min(this.bound.maxX - r, x));
    z = Math.max(this.bound.minZ + r, Math.min(this.bound.maxZ - r, z));

    for (const o of this.obstacles) {
      // closest point on the AABB to the circle center
      const cx = Math.max(o.minX, Math.min(o.maxX, x));
      const cz = Math.max(o.minZ, Math.min(o.maxZ, z));
      const dx = x - cx;
      const dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2);
          x = cx + (dx / d) * r;
          z = cz + (dz / d) * r;
        } else {
          // center inside the box: push out along the shallowest axis
          const toLeft = x - o.minX;
          const toRight = o.maxX - x;
          const toBack = z - o.minZ;
          const toFront = o.maxZ - z;
          const m = Math.min(toLeft, toRight, toBack, toFront);
          if (m === toLeft) x = o.minX - r;
          else if (m === toRight) x = o.maxX + r;
          else if (m === toBack) z = o.minZ - r;
          else z = o.maxZ + r;
        }
      }
    }
    return [x, z];
  }
}

export const collision = new CollisionWorld();
