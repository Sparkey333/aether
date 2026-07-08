// Analytic hit-volume geometry. Hit resolution is done with capsule/sphere overlap computed FROM
// THE DATA (bible §2.14.5) — never engine mesh colliders — so a hit in Three.js resolves identically
// in Godot and Unity. A hitbox/hurtbox is a line segment (the capsule axis) plus a radius; a sphere
// is a zero-length segment. Overlap = closest distance between the two segments <= sum of radii.
import type { Hitbox } from '@/data/types';

/** A world-space volume: a capsule from `a` to `b` with `radius`. Sphere = a==b. */
export interface WorldVolume {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  radius: number;
}

/** Build a world volume for an attack hitbox attached to an actor at (x,y,z) facing `yaw`.
 *  The hitbox `offset` and capsule axis are in actor-local space (+Z = forward, +Y = up). */
export function attackVolume(
  hb: Hitbox,
  x: number,
  y: number,
  z: number,
  yaw: number,
): WorldVolume {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  // local forward axis half-length (capsule extends along local +Z; sphere has length 0)
  const half = hb.shape === 'capsule' ? (hb.length ?? 0) / 2 : 0;
  const [ox, oy, oz] = hb.offset;
  // two local endpoints along forward
  const a: [number, number, number] = [ox, oy, oz - half];
  const b: [number, number, number] = [ox, oy, oz + half];
  // rotate local (lx,ly,lz) by yaw about Y: world = ( lx*cos + lz*sin, ly, -lx*sin + lz*cos )
  const toWorld = (l: [number, number, number]): [number, number, number] => [
    x + l[0] * cos + l[2] * sin,
    y + l[1],
    z - l[0] * sin + l[2] * cos,
  ];
  const wa = toWorld(a);
  const wb = toWorld(b);
  return { ax: wa[0], ay: wa[1], az: wa[2], bx: wb[0], by: wb[1], bz: wb[2], radius: hb.radius };
}

/** Build a world volume for an actor's hurtbox: a vertical capsule from feet+radius to head-radius. */
export function hurtVolume(x: number, y: number, z: number, radius: number, height: number): WorldVolume {
  const r = Math.min(radius, height / 2);
  return { ax: x, ay: y + r, az: z, bx: x, by: y + height - r, bz: z, radius: r };
}

/** Squared closest distance between segment p1->q1 and segment p2->q2 (Ericson, Real-Time Collision). */
export function closestSegSegSq(
  p1x: number, p1y: number, p1z: number, q1x: number, q1y: number, q1z: number,
  p2x: number, p2y: number, p2z: number, q2x: number, q2y: number, q2z: number,
): number {
  const d1x = q1x - p1x, d1y = q1y - p1y, d1z = q1z - p1z; // dir of segment 1
  const d2x = q2x - p2x, d2y = q2y - p2y, d2z = q2z - p2z; // dir of segment 2
  const rx = p1x - p2x, ry = p1y - p2y, rz = p1z - p2z;
  const a = d1x * d1x + d1y * d1y + d1z * d1z; // squared length of seg 1
  const e = d2x * d2x + d2y * d2y + d2z * d2z; // squared length of seg 2
  const f = d2x * rx + d2y * ry + d2z * rz;
  const EPS = 1e-9;
  let s: number, t: number;
  if (a <= EPS && e <= EPS) {
    s = 0; t = 0; // both points
  } else if (a <= EPS) {
    s = 0;
    t = clamp01(f / e);
  } else {
    const c = d1x * rx + d1y * ry + d1z * rz;
    if (e <= EPS) {
      t = 0;
      s = clamp01(-c / a);
    } else {
      const b = d1x * d2x + d1y * d2y + d1z * d2z;
      const denom = a * e - b * b;
      s = denom > EPS ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp01(-c / a); }
      else if (t > 1) { t = 1; s = clamp01((b - c) / a); }
    }
  }
  const c1x = p1x + d1x * s, c1y = p1y + d1y * s, c1z = p1z + d1z * s;
  const c2x = p2x + d2x * t, c2y = p2y + d2y * t, c2z = p2z + d2z * t;
  const dx = c1x - c2x, dy = c1y - c2y, dz = c1z - c2z;
  return dx * dx + dy * dy + dz * dz;
}

/** Do two capsule volumes overlap? */
export function volumesOverlap(u: WorldVolume, v: WorldVolume): boolean {
  const d2 = closestSegSegSq(u.ax, u.ay, u.az, u.bx, u.by, u.bz, v.ax, v.ay, v.az, v.bx, v.by, v.bz);
  const r = u.radius + v.radius;
  return d2 <= r * r;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
