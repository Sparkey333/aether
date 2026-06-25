// TypeScript views over the shared design-data JSON. Mirrors game/shared/design-data/schema/*.
import type { Tier } from './tiers';

export type MoveKind = 'light' | 'heavy' | 'launcher' | 'aerial' | 'special' | 'grab' | 'critical';

export interface Hitbox {
  shape: 'sphere' | 'capsule';
  radius: number;
  length?: number;
  offset: [number, number, number];
}

export interface Hit {
  damage: number;
  poiseDamage: number;
  hitstop: number;
  knockback?: number;
  launch?: boolean;
  guardBreak?: boolean;
  unparryable?: boolean;
  projectile?: boolean;
  hardCounter?: string;
  hitbox: Hitbox;
}

export interface MoveFrames {
  total: number;
  startup?: number;
  active: [number, number];
  recovery?: number;
  iframes?: number[];
  hyperArmorFrom?: number;
}

export interface Move {
  id: string;
  name: string;
  kind: MoveKind;
  staminaCost?: number;
  aetherCost?: number;
  frames: MoveFrames;
  hits: Hit[];
  comboNext?: string[];
  flowMoveId?: string;
}

export interface AttackRef {
  moveRef: string;
  weight: number;
  minRangeM?: number;
  maxRangeM?: number;
  cooldownFrames?: number;
  punishRecoveryFrames?: number;
  hardCounter?: string;
}

export interface BossPhase {
  name: string;
  hpEnterPct: number;
  transitionInFrames?: number;
  moveSpeedMps?: number;
  igniteCircles?: boolean;
  rotatingCircles?: boolean;
  voiceLine?: string;
  attacks: AttackRef[];
}

export interface BossConfig {
  id: string;
  name: string;
  title?: string;
  tier?: Tier;
  hp: number;
  poise: number;
  poiseRegenPerSec?: number;
  launchable?: boolean;
  moveSpeedMps?: number;
  arena?: string;
  behavior?: string;
  phases: BossPhase[];
  onDeath?: Record<string, unknown>;
}

export interface EnemyConfig {
  id: string;
  name: string;
  tier?: Tier;
  hp: number;
  poise: number;
  poiseRegenPerSec?: number;
  launchable?: boolean;
  moveSpeedMps?: number;
  behavior?: string;
  attacks: AttackRef[];
}

export interface WeaponConfig {
  id: string;
  name: string;
  description?: string;
  lightCombo: string[];
  heavyCombo: string[];
  launcher?: string;
  aerialCombo?: string[];
  dashAttack?: string;
  damageScalar?: number;
  staminaPerSwing?: number;
  dodgeStaminaCost?: number;
}

export interface FogConfig {
  startM: number;
  endM: number;
  farClipM: number;
  colorGeneral: string;
  colorArena: string;
}

export interface RenderConfig {
  internalWidth: number;
  internalHeight: number;
  presentFps: number;
  vertexSnapGrid: [number, number];
  affineWarp: boolean;
  colorDepthBits: number;
  ditherStrength: number;
  fog: FogConfig;
}

export interface FlowRank {
  name: string;
  threshold: number;
}

export interface CombatConstants {
  version: string;
  tickRate: number;
  fixedTimestepSec: number;
  prngSeed: number;
  inputBufferFrames: number;
  comboLinkWindowFrames: number;
  tapHoldThresholdFrames: number;
  player: {
    hp: number;
    stamina: { max: number; regenPerSec: number; regenDelaySec: number; sprintDrainPerSec: number };
    aether: { max: number; startValue: number };
    poise: { max: number; regenPerSec: number; regenDelaySec: number; hyperArmorReductionPct: number };
    walkSpeedMps: number;
    sprintSpeedMps: number;
  };
  staminaCosts: Record<string, number>;
  dodge: { totalFrames: number; iframes: [number, number]; cancelWindow: [number, number]; distanceM: number };
  backstep: { totalFrames: number; iframes: [number, number]; distanceM: number };
  lockOn: {
    acquireRangeM: number; coneDeg: number; breakRangeM: number; breakLosSec: number;
    switchDeadzone: number; switchCooldownMs: number;
  };
  flask: { charges: number; healAmount: number; totalFrames: number; healFrame: number };
  block: { reductionPct: number };
  parry: { totalFrames: number; active: [number, number]; riposteArmSec: number };
  backstab: { rangeM: number; coneDeg: number; multiplier: number; iframes: number };
  riposte: { multiplier: number };
  flow: {
    maxFp: number; ranks: FlowRank[]; varietyWindow: number;
    varietyNovelMult: number; varietyRecentMult: number; varietyRepeatMult: number;
    decayPerSec: number; damagePenaltyPct: number; damageDecayMult: number; damageDecaySec: number;
    aeByRank: number[];
  };
  juggle: {
    launchHeightM: number; riseFrames: number; hangFrames: number; gravityMult: number;
    extraHangPerHitFrames: number; maxExtensions: number;
  };
  specials: {
    groundCurrent: { aetherCost: number; moveId: string };
    leylineLance: { aetherCost: number; moveId: string };
    cauterize: { aetherCost: number; durationFrames: number; damageBoostPct: number };
  };
  hitstopDefaults: { light: number; heavy: number; parry: number };
  render: RenderConfig;
  tierColors: Record<Tier, string>;
}

export interface DesignData {
  combat: CombatConstants;
  moves: Map<string, Move>;
  bosses: Map<string, BossConfig>;
  enemies: Map<string, EnemyConfig>;
  weapons: Map<string, WeaponConfig>;
}
