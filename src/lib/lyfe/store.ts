// Lyfe's local memory. The tracker's pillar mapping is *derived* — a first-pass
// guess by the classifier. This is where the person's own judgment overrides it,
// and that judgment is the higher authority. Reveal, don't impose:
// Lyfe suggests, you decide, and your decision persists.
//
// Local-first (TransparentZ): nothing leaves the device. In the Mac build this
// will graduate from localStorage to a real file you can read, back up, and
// carry away.

import type { Pillar } from "./types";

const KEY = "lyfe.pillarOverrides.v1";

export type PillarOverrides = Record<string, Pillar>;

export function loadOverrides(): PillarOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PillarOverrides) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(next: PillarOverrides): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* a full or blocked store is not worth breaking the view over */
  }
}

/** Apply the person's re-sorts over the derived mapping. */
export function withOverrides<T extends { id: string; pillar: Pillar }>(
  projects: T[],
  overrides: PillarOverrides,
): T[] {
  if (!Object.keys(overrides).length) return projects;
  return projects.map((p) =>
    overrides[p.id] && overrides[p.id] !== p.pillar ? { ...p, pillar: overrides[p.id] } : p,
  );
}
