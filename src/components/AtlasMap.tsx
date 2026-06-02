"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer, PathLayer } from "@deck.gl/layers";
import { TIERS } from "@/lib/tiers";
import type { Leyline, POI } from "@/lib/types";
import type { PlanetaryGrid } from "@/lib/engine";
import type { LayerToggles } from "./AtlasShell";

interface Props {
  pois: POI[];
  leylines: Leyline[];
  grid: PlanetaryGrid;
  show: LayerToggles;
  onSelect: (p: POI) => void;
}

// No-key dark raster basemap (CARTO over OSM) — befits the Atlas, and keeps v1
// free of tokens. Swap for vector/PMTiles later (see ROADMAP).
const BASEMAP = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
} as const;

export default function AtlasMap({ pois, leylines, grid, show, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP as unknown as maplibregl.StyleSpecification,
      center: [5, 32],
      zoom: 1.6,
      attributionControl: { compact: true },
    });
    const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
    map.addControl(overlay as unknown as maplibregl.IControl);
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    mapRef.current = map;
    overlayRef.current = overlay;
    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const layers: Layer[] = [];

    if (show.grid) {
      const segs = grid.circles.flatMap((c) => c.segments.map((s) => ({ path: s })));
      layers.push(
        new PathLayer({
          id: "grid",
          data: segs,
          getPath: (d: { path: [number, number][] }) => d.path,
          getColor: [235, 190, 90, 70],
          getWidth: 1,
          widthUnits: "pixels",
        }),
      );
    }

    if (show.gridNodes) {
      layers.push(
        new ScatterplotLayer({
          id: "grid-nodes",
          data: grid.nodes,
          getPosition: (d: { position: [number, number] }) => d.position,
          getFillColor: [235, 190, 90, 170],
          getRadius: 3,
          radiusUnits: "pixels",
          radiusMinPixels: 2,
        }),
      );
    }

    if (show.leylines) {
      layers.push(
        new PathLayer({
          id: "leylines",
          data: leylines,
          getPath: (d: Leyline) => d.path,
          getColor: (d: Leyline) => [...TIERS[d.tier].rgb, 210] as [number, number, number, number],
          getWidth: 2,
          widthUnits: "pixels",
        }),
      );
    }

    if (show.pois) {
      layers.push(
        new ScatterplotLayer({
          id: "pois",
          data: pois,
          pickable: true,
          getPosition: (d: POI) => [d.lon, d.lat],
          getFillColor: (d: POI) => [...TIERS[d.tier].rgb, 235] as [number, number, number, number],
          getRadius: 6,
          radiusUnits: "pixels",
          radiusMinPixels: 4,
          stroked: true,
          getLineColor: [8, 10, 18, 220],
          lineWidthUnits: "pixels",
          getLineWidth: 1,
          onClick: (info: { object?: POI }) => {
            if (info.object) onSelect(info.object);
          },
        }),
      );
    }

    overlay.setProps({ layers });
  }, [pois, leylines, grid, show, onSelect]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
