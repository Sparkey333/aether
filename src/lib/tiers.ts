import type { Tier } from "./types";

/** Visual + semantic metadata for the four provenance tiers. */
export const TIERS: Record<
  Tier,
  { label: string; rgb: [number, number, number]; hex: string; blurb: string }
> = {
  "A-measured": {
    label: "A · Measured",
    rgb: [80, 200, 255],
    hex: "#50c8ff",
    blurb: "Hard scientific data & instrument output — terrain, ephemeris, magnetic/seismic grids.",
  },
  "B-scholarly": {
    label: "B · Scholarly",
    rgb: [120, 230, 160],
    hex: "#78e6a0",
    blurb: "Peer-reviewed, academic & archaeological — gazetteers, heritage registers, official archives.",
  },
  "C-traditional": {
    label: "C · Traditional",
    rgb: [235, 190, 90],
    hex: "#ebbe5a",
    blurb: "Established esoteric & symbolic tradition — leys, grids, astrology, gematria, sacred sites.",
  },
  "D-folklore": {
    label: "D · Folklore",
    rgb: [230, 110, 140],
    hex: "#e66e8c",
    blurb: "Reports, conspiracy lore & fiction — sightings, hauntings, layout claims, fictional motifs.",
  },
};

export const TIER_ORDER: Tier[] = [
  "A-measured",
  "B-scholarly",
  "C-traditional",
  "D-folklore",
];
