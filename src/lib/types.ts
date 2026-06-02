// Aether domain types. Everything carries a provenance Tier — the doctrine of
// the Source Atlas: keep every layer, label every layer. The tier is metadata,
// never a delete key. See content/canon/provenance.md.

export type Tier = "A-measured" | "B-scholarly" | "C-traditional" | "D-folklore";

export interface Source {
  id: string;
  name: string;
  tier: Tier;
  url?: string;
}

/** A point of interest: holy / ancient / anomalous site, obelisk, peak, node. */
export interface POI {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** e.g. pyramid, megalith, vortex, mountain, obelisk, temple, anomaly, tower */
  category: string;
  tier: Tier;
  /** the tradition or lens this site is read through (Egyptian, Ute, Vedic, Masonic…) */
  tradition?: string;
  /** id/name of the catalog it came from (see docs/SOURCE_ATLAS.md) */
  source?: string;
  description?: string;
  tags?: string[];
}

/** A named or detected line across the land. */
export interface Leyline {
  id: string;
  name: string;
  tier: Tier;
  /** POI ids the line is anchored to */
  anchors: string[];
  /** rendered polyline, [lon, lat] pairs */
  path: [number, number][];
  note?: string;
}

/** A hypothesis surfaced by the Loom — always reported against a chance baseline. */
export interface Hypothesis {
  id: string;
  kind: "alignment" | "nexus";
  createdAt: string;
  /** POI / node ids that compose the pattern */
  memberIds: string[];
  tier: Tier;
  /** 0..1, derived from the z-score vs the Monte-Carlo null baseline */
  confidence: number;
  observed: number;
  expected: number;
  sd: number;
  z: number;
  note: string;
}
