// The Vacuum — Lyfe's safe-organize engine. It surfaces clutter (duplicates,
// fragmentation, stale backups, scatter) as a PLAN of reversible, backup-first
// actions. Read-only here; real file moves run only in the Mac build, behind
// explicit approval — never auto-delete. Mirrors the VACUUM-app spirit.
// See content/canon/lyfe.md (the Vacuum doctrine, TransparentZ).

export type VacuumKind = "duplicate" | "fragmented" | "stale-backup" | "scatter";

export interface VacuumItem {
  id: string;
  kind: VacuumKind;
  title: string;
  detail: string;
  /** human-readable location (a Drive folder / path) */
  where: string;
  /** the files / folders involved */
  members: string[];
  /** bytes freed if the safe action is taken (omit when it's about clarity, not space) */
  reclaimBytes?: number;
  /** the SAFE action — always backup-first, reversible, approve-to-run */
  safeAction: string;
}

export interface VacuumPlan {
  items: VacuumItem[];
  totalReclaim: number;
  byKind: Record<VacuumKind, number>;
}

export const VACUUM_KIND_META: Record<VacuumKind, { label: string; hex: string }> = {
  duplicate: { label: "Duplicate", hex: "#ebbe5a" },
  fragmented: { label: "Fragmented", hex: "#8a7dff" },
  "stale-backup": { label: "Stale backup", hex: "#50c8ff" },
  scatter: { label: "Scatter", hex: "#e66e8c" },
};

export function buildPlan(items: VacuumItem[]): VacuumPlan {
  const byKind = { duplicate: 0, fragmented: 0, "stale-backup": 0, scatter: 0 } as Record<
    VacuumKind,
    number
  >;
  let totalReclaim = 0;
  for (const it of items) {
    byKind[it.kind] += 1;
    totalReclaim += it.reclaimBytes ?? 0;
  }
  return { items, totalReclaim, byKind };
}

/** Compact byte formatter — 6826503 → "6.8 MB". */
export function formatBytes(n: number): string {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  return `${v >= 10 || u === 0 ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
}
