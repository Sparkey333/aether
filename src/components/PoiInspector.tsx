"use client";

import type { POI } from "@/lib/types";
import { TIERS } from "@/lib/tiers";

export default function PoiInspector({ poi, onClose }: { poi: POI; onClose: () => void }) {
  const t = TIERS[poi.tier];
  return (
    <div className="inspector">
      <span className="close" onClick={onClose}>
        ✕
      </span>
      <h3>{poi.name}</h3>
      <span className="pill" style={{ color: t.hex }}>
        {t.label}
      </span>
      <p className="meta" style={{ marginTop: 8 }}>
        {poi.category}
        {poi.tradition ? ` · ${poi.tradition}` : ""}
      </p>
      <p className="meta">
        {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
      </p>
      {poi.source && <p className="meta">source: {poi.source}</p>}
      {poi.description && <p>{poi.description}</p>}
      {poi.tags && poi.tags.length > 0 && (
        <div className="tags">
          {poi.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
