"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer, PathLayer, GeoJsonLayer } from "@deck.gl/layers";
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

// No-key dark raster basemap (CARTO over OSM).
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

// Measured substrate (Tier A). Validated live endpoints; see docs/SOURCE_ATLAS.md.
const MAGNETIC_TILES =
  "https://mrdata.usgs.gov/mapcache/wmts/1.0.0/magnetic/default/GoogleMapsCompatible/{z}/{y}/{x}.png";
const QUAKES_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";
const FAULTS_URL =
  "https://earthquake.usgs.gov/arcgis/rest/services/haz/Qfaults/MapServer/21/query?where=1%3D1&outFields=fault_name&f=geojson&resultRecordCount=2000";

type QuakeFeature = { properties?: { mag?: number } };

export default function AtlasMap({ pois, leylines, grid, show, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const showRef = useRef(show);
  showRef.current = show;

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

    // USGS magnetic-anomaly raster (tints the basemap; deck layers draw above it).
    map.on("load", () => {
      if (!map.getSource("usgs-magnetic")) {
        map.addSource("usgs-magnetic", {
          type: "raster",
          tiles: [MAGNETIC_TILES],
          tileSize: 256,
          attribution: "USGS — North American magnetic anomaly",
        });
        map.addLayer({
          id: "usgs-magnetic",
          type: "raster",
          source: "usgs-magnetic",
          paint: { "raster-opacity": 0.55 },
          layout: { visibility: showRef.current.magnetic ? "visible" : "none" },
        });
      }
    });

    mapRef.current = map;
    overlayRef.current = overlay;
    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // Toggle the magnetic raster.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("usgs-magnetic")) return;
    map.setLayoutProperty("usgs-magnetic", "visibility", show.magnetic ? "visible" : "none");
  }, [show.magnetic]);

  // Deck overlays.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const layers: Layer[] = [];

    if (show.faults) {
      layers.push(
        new GeoJsonLayer({
          id: "faults",
          data: FAULTS_URL,
          stroked: true,
          filled: false,
          getLineColor: [120, 230, 160, 150],
          getLineWidth: 1,
          lineWidthUnits: "pixels",
        }),
      );
    }

    if (show.quakes) {
      layers.push(
        new GeoJsonLayer({
          id: "quakes",
          data: QUAKES_URL,
          pointType: "circle",
          stroked: false,
          getPointRadius: (f: QuakeFeature) => Math.max(2, (f.properties?.mag ?? 1) * 1.4),
          pointRadiusUnits: "pixels",
          getFillColor: [80, 200, 255, 130],
        }),
      );
    }

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
          getRadius: 5,
          radiusUnits: "pixels",
          radiusMinPixels: 3,
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
