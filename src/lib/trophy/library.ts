// Trophy Hype — taxonomy + library helpers usable anywhere (server or client).

import disciplinesSeed from "@/data/trophy/disciplines.seed.json";
import opportunitiesSeed from "@/data/trophy/opportunities.seed.json";
import type { Arena, Discipline, Opportunity } from "./types";

export const DISCIPLINES = (disciplinesSeed as unknown as { disciplines: Discipline[] })
  .disciplines;

export const SEED_OPPORTUNITIES = (
  opportunitiesSeed as unknown as { opportunities: Opportunity[] }
).opportunities;

const BY_ID = new Map<string, Discipline>(DISCIPLINES.map((d) => [d.id, d]));

export function disciplineById(id: string): Discipline | undefined {
  return BY_ID.get(id);
}

export function glyphOf(id: string): string {
  return BY_ID.get(id)?.glyph ?? "•";
}

export function disciplineName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}

export const ARENA_LABEL: Record<Arena, string> = {
  field: "The Field",
  stage: "The Stage",
};

export const ARENA_BLURB: Record<Arena, string> = {
  field: "Physical athletics — races, peaks, water, grit.",
  stage: "Creative submissions — sound, screen, page, play, build.",
};

/** Disciplines grouped by arena → group, for filter menus. */
export function disciplinesByArena(arena: Arena): Discipline[] {
  return DISCIPLINES.filter((d) => d.arena === arena);
}
