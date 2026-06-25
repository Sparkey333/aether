// Mirrored from /home/user/aether/src/lib/tiers.ts — the four provenance tiers.
// These hex values are a FROZEN cross-engine contract (Three.js / Godot / Unity all mirror them).
// A CI check asserts equality with the Atlas source of truth. Do not edit without updating all mirrors.
export type Tier = 'A' | 'B' | 'C' | 'D';

export const TIER_COLORS: Record<Tier, string> = {
  A: '#50c8ff', // A-measured   (cold blue)
  B: '#78e6a0', // B-scholarly  (green)
  C: '#ebbe5a', // C-traditional (gold — also the guiding-leyline color)
  D: '#e66e8c', // D-folklore   (rose — unsanctioned / secret intel)
};

export const GUIDING_LIGHT_COLOR = TIER_COLORS.C; // pale gold #ebbe5a
