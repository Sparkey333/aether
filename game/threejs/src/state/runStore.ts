// Lightweight UI/run state, pushed once per render frame from the sim (HUD reads this, never the
// live actors). Combat (M3) fills the live values + the target/enemy bar + lock-on reticle.
import { create } from 'zustand';

export interface RunState {
  booted: boolean;
  error: string | null;
  inArena: boolean;
  // player HUD snapshot
  hp: number;
  hpMax: number;
  stamina: number;
  staminaMax: number;
  aether: number;
  aetherMax: number;
  poise: number;
  poiseMax: number;
  flowRank: string;
  flowFp: number;
  flowMax: number;
  cauterized: boolean;
  // target / enemy bar
  lockedOn: boolean;
  targetName: string | null;
  targetHpPct: number;
  targetIsBoss: boolean;
  // lock-on reticle (screen %, 0..100)
  reticleVisible: boolean;
  reticleX: number;
  reticleY: number;
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
  poise: 60,
  poiseMax: 60,
  flowRank: 'D',
  flowFp: 0,
  flowMax: 10000,
  cauterized: false,
  lockedOn: false,
  targetName: null,
  targetHpPct: 0,
  targetIsBoss: false,
  reticleVisible: false,
  reticleX: 50,
  reticleY: 50,
  zone: 'A — Threshold Hall',
  setBooted: (v) => set({ booted: v }),
  setError: (e) => set({ error: e }),
}));
