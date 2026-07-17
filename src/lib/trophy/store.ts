// Trophy Hype — client store.
//
// Persists the profile, Trophy Case, and pursuits to localStorage, hydrating
// from the starter seed on first run. Every write recomputes XP and re-derives
// each proof tier from its evidence, so the numbers on screen can never drift
// from what actually backs them — the integrity spine holds even in storage.

import starter from "@/data/trophy/starter.seed.json";
import { deriveTier } from "./proof";
import { trophyXp } from "./gamify";
import type { Profile, Pursuit, Trophy } from "./types";

const K = {
  profile: "trophyhype.v1.profile",
  trophies: "trophyhype.v1.trophies",
  pursuits: "trophyhype.v1.pursuits",
  seeded: "trophyhype.v1.seeded",
};

const hasWindow = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Normalize a trophy: re-derive its proof tier and recompute XP from scratch. */
export function normalizeTrophy(t: Trophy): Trophy {
  const tier = deriveTier(t.proof.evidence);
  const proof = { ...t.proof, tier };
  return { ...t, proof, xp: trophyXp({ kind: t.kind, difficulty: t.difficulty, proof }) };
}

/** Seed the store from the starter data the first time only. */
export function hydrate(): void {
  if (!hasWindow()) return;
  if (localStorage.getItem(K.seeded)) return;
  write(K.profile, starter.profile as unknown as Profile);
  write(K.trophies, (starter.trophies as unknown as Trophy[]).map(normalizeTrophy));
  write(K.pursuits, starter.pursuits as unknown as Pursuit[]);
  localStorage.setItem(K.seeded, "1");
}

export function loadProfile(): Profile {
  return read<Profile>(K.profile, starter.profile as unknown as Profile);
}
export function saveProfile(p: Profile): void {
  write(K.profile, p);
}

export function loadTrophies(): Trophy[] {
  return read<Trophy[]>(K.trophies, []).map(normalizeTrophy);
}
export function saveTrophies(list: Trophy[]): void {
  write(K.trophies, list.map(normalizeTrophy));
}
export function addTrophy(t: Trophy): Trophy[] {
  const next = [normalizeTrophy(t), ...loadTrophies()];
  saveTrophies(next);
  return next;
}
export function removeTrophy(id: string): Trophy[] {
  const next = loadTrophies().filter((t) => t.id !== id);
  saveTrophies(next);
  return next;
}

export function loadPursuits(): Pursuit[] {
  return read<Pursuit[]>(K.pursuits, []);
}
export function savePursuits(list: Pursuit[]): void {
  write(K.pursuits, list);
}
export function upsertPursuit(p: Pursuit): Pursuit[] {
  const list = loadPursuits();
  const i = list.findIndex((x) => x.id === p.id || x.opportunityId === p.opportunityId);
  if (i >= 0) list[i] = p;
  else list.unshift(p);
  savePursuits(list);
  return list;
}
export function removePursuit(id: string): Pursuit[] {
  const next = loadPursuits().filter((p) => p.id !== id);
  savePursuits(next);
  return next;
}

/** Wipe the store back to empty (keeps the seeded flag so it doesn't re-seed). */
export function clearAll(): void {
  write(K.profile, loadProfile());
  write(K.trophies, []);
  write(K.pursuits, []);
}

/** A short id helper for new records. */
export function newId(prefix: string): string {
  const rand = Math.floor(performance.now() % 1e6).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
