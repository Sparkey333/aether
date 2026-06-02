"use client";

import type { Tier } from "@/lib/types";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import type { LayerToggles } from "./AtlasShell";

interface Props {
  show: LayerToggles;
  setShow: (fn: (s: LayerToggles) => LayerToggles) => void;
  tiers: Set<Tier>;
  toggleTier: (t: Tier) => void;
  poiCount: number;
  nodeCount: number;
}

const LAYERS: [keyof LayerToggles, string][] = [
  ["pois", "Sites (POI)"],
  ["leylines", "Named leylines"],
  ["grid", "Planetary grid · 15 great circles"],
  ["gridNodes", "Grid nodes · 62"],
];

export default function LayerPanel({ show, setShow, tiers, toggleTier, poiCount, nodeCount }: Props) {
  return (
    <aside className="panel">
      <h1 className="brand">Aether</h1>
      <p className="brand-sub">read the land &amp; the heavens</p>

      <div className="section-title">Layers</div>
      {LAYERS.map(([key, label]) => (
        <label key={key} className="row">
          <input
            type="checkbox"
            checked={show[key]}
            onChange={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
          />
          <span>{label}</span>
        </label>
      ))}

      <div className="section-title">Provenance — keep all, label all</div>
      {TIER_ORDER.map((t) => (
        <div key={t}>
          <label className="row">
            <input type="checkbox" checked={tiers.has(t)} onChange={() => toggleTier(t)} />
            <span className="swatch" style={{ background: TIERS[t].hex }} />
            <span>{TIERS[t].label}</span>
          </label>
          <div className="tier-blurb">{TIERS[t].blurb}</div>
        </div>
      ))}

      <div className="legend-note">
        {poiCount} sites shown · {nodeCount} grid nodes.
        <br />
        <br />
        The grid is <em>synthesized</em> from the icosa-dodecahedron and anchored at Giza — no
        canonical ley dataset exists, so Aether generates its own. Tier C-traditional.
      </div>
    </aside>
  );
}
