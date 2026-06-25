// Lightweight UI/run state mirrored once per step (HUD reads this, never the live actors).
import { create } from 'zustand';

export interface RunState {
  booted: boolean;
  error: string | null;
  inArena: boolean;
  // HUD snapshot (filled by combat in later milestones; defaults for now)
  hp: number;
  hpMax: number;
  stamina: number;
  staminaMax: number;
  aether: number;
  aetherMax: number;
  flowRank: string;
  zone: string;
  setBooted: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useRunStore = create<RunState>((set) => ({
  booted: false,
  error: null,
  inArena: false,
  hp: 1000,
  hpMax: 1000,
  stamina: 100,
  staminaMax: 100,
  aether: 0,
  aetherMax: 100,
  flowRank: 'D',
  zone: 'A — Threshold Hall',
  setBooted: (v) => set({ booted: v }),
  setError: (e) => set({ error: e }),
}));
