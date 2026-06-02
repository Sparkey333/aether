"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import poiData from "@/data/poi.seed.json";
import leylineData from "@/data/leylines.seed.json";
import { planetaryGrid } from "@/lib/engine";
import { TIER_ORDER } from "@/lib/tiers";
import type { Hypothesis, Leyline, POI, Tier } from "@/lib/types";
import LayerPanel from "./LayerPanel";
import PoiInspector from "./PoiInspector";
import LoomFeed from "./LoomFeed";

// MapLibre touches `window`, so the Atlas is client-only.
const AtlasMap = dynamic(() => import("./AtlasMap"), { ssr: false });

const ALL_POIS = (poiData as unknown as { pois: POI[] }).pois;
const ALL_LEYS = (leylineData as unknown as { leylines: Leyline[] }).leylines;

export interface LayerToggles {
  pois: boolean;
  leylines: boolean;
  grid: boolean;
  gridNodes: boolean;
}

interface HypFile {
  generatedAt: string | null;
  hypotheses: Hypothesis[];
  baseline: unknown;
}

export default function AtlasShell() {
  const grid = useMemo(() => planetaryGrid(), []);
  const [show, setShow] = useState<LayerToggles>({
    pois: true,
    leylines: true,
    grid: true,
    gridNodes: false,
  });
  const [tiers, setTiers] = useState<Set<Tier>>(new Set(TIER_ORDER));
  const [selected, setSelected] = useState<POI | null>(null);
  const [hyp, setHyp] = useState<HypFile | null>(null);

  useEffect(() => {
    fetch("/data/hypotheses.json")
      .then((r) => r.json())
      .then(setHyp)
      .catch(() => setHyp(null));
  }, []);

  const pois = useMemo(() => ALL_POIS.filter((p) => tiers.has(p.tier)), [tiers]);
  const leylines = useMemo(() => ALL_LEYS.filter((l) => tiers.has(l.tier)), [tiers]);

  const toggleTier = useCallback((t: Tier) => {
    setTiers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  const onSelect = useCallback((p: POI) => setSelected(p), []);

  return (
    <div className="app">
      <LayerPanel
        show={show}
        setShow={setShow}
        tiers={tiers}
        toggleTier={toggleTier}
        poiCount={pois.length}
        nodeCount={grid.nodes.length}
      />
      <div className="map-wrap">
        <AtlasMap pois={pois} leylines={leylines} grid={grid} show={show} onSelect={onSelect} />
        {selected && <PoiInspector poi={selected} onClose={() => setSelected(null)} />}
      </div>
      <LoomFeed data={hyp} pois={ALL_POIS} />
    </div>
  );
}
