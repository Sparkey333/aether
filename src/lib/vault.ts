// The Vault — Aether's asset manager domain. Every asset copied in from the
// ecosystem (or forged via Higgsfield) carries its origin, kind, and realm.
// Same doctrine as the Codex: keep every layer, label every layer.

export type AssetKind = "2d" | "vector" | "3d" | "video" | "audio";
export type AssetRealm = "spiritual" | "physical" | "virtual";
export type AssetRole = "element" | "background" | "model" | "motion" | "audio";

export interface VaultAsset {
  id: string;
  name: string;
  kind: AssetKind;
  realm: AssetRealm;
  role: AssetRole;
  /** source id from aether.assets.config.json ("forge" = generated here) */
  source: string;
  sourceLabel: string;
  /** where the original lives (absolute path, or repo-relative for internal files) */
  origin: string;
  /** served path under public/, or null when the copy isn't present on this machine */
  url: string | null;
  ext: string;
  bytes: number;
  mtime: number;
  hash: string;
  tags: string[];
  available: boolean;
  /** true when forged via Higgsfield from the Vault */
  generated?: boolean;
  prompt?: string;
  model?: string;
  /** the vault asset this one was tweaked/regenerated from */
  parentId?: string;
}

export interface VaultSource {
  id: string;
  label: string;
  root?: string;
  online: boolean | null;
  count: number;
  skipped?: boolean;
}

export interface VaultCatalog {
  version: number;
  syncedAt: string;
  sources: VaultSource[];
  counts: {
    total: number;
    byKind: Partial<Record<AssetKind, number>>;
    byRealm: Partial<Record<AssetRealm, number>>;
  };
  assets: VaultAsset[];
}

export const REALMS: { id: AssetRealm; label: string; hex: string; blurb: string }[] = [
  { id: "spiritual", label: "Spiritual", hex: "#ebbe5a", blurb: "sigils, sites, symbols — the sacred layer" },
  { id: "physical", label: "Physical", hex: "#7fd08a", blurb: "photos, scans, terrain — the measured world" },
  { id: "virtual", label: "Virtual", hex: "#8a7dff", blurb: "sprites, UI, meshes — the built worlds" },
];

export const KINDS: { id: AssetKind; label: string; icon: string }[] = [
  { id: "2d", label: "2D", icon: "▦" },
  { id: "vector", label: "Vector", icon: "◇" },
  { id: "3d", label: "3D", icon: "◆" },
  { id: "video", label: "Video", icon: "▶" },
  { id: "audio", label: "Audio", icon: "♪" },
];

export const realmHex = (r: AssetRealm) => REALMS.find((x) => x.id === r)?.hex ?? "#9aa0bd";

const EMPTY: VaultCatalog = {
  version: 1,
  syncedAt: "",
  sources: [],
  counts: { total: 0, byKind: {}, byRealm: {} },
  assets: [],
};

/** Load the catalog written by `npm run assets:sync` (static — works in web and Tauri). */
export async function loadCatalog(): Promise<VaultCatalog> {
  try {
    const r = await fetch("/vault/catalog.json", { cache: "no-store" });
    if (!r.ok) return EMPTY;
    return (await r.json()) as VaultCatalog;
  } catch {
    return EMPTY;
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
