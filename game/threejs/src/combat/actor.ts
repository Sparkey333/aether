// The CombatActor contract that HitResolution / LockOn operate on, plus the shared incoming-hit
// resolver both the player and enemies use (i-frames, parry, block, backstab, hyper-armor, knockback).
import type { Hit, CombatConstants } from '@/data/types';
import type { Health } from './Health';
import type { Poise } from './Poise';
import type { ActiveHit } from './MoveRunner';

export type Team = 'player' | 'enemy';

export interface DefenseState {
  iframe: boolean; // dodge i-frames — negate all damage & reactions
  hyperArmor: boolean; // no flinch; halve incoming poise damage
  blocking: boolean; // holding block
  parry: boolean; // parry active window
}

export interface Incoming {
  hit: Hit;
  srcTeam: Team;
  srcX: number; srcZ: number; srcYaw: number;
  fromBehind: boolean;
  backstab: boolean;
  damageMult: number; // attacker-side multipliers (cauterize boost, etc.)
}

export interface HitOutcome {
  connected: boolean; // false if fully negated (i-frames)
  blocked: boolean;
  parried: boolean;
  staggered: boolean;
  damage: number;
}

export interface CombatActor {
  id: string;
  team: Team;
  x: number; y: number; z: number; yaw: number;
  hurtRadius: number;
  hurtHeight: number;
  health: Health;
  poise: Poise;
  freezeFrames: number; // hitstop
  alive(): boolean;
  defense(): DefenseState;
  activeHits(): ActiveHit[];
  receiveHit(inc: Incoming): HitOutcome;
  outgoingMult(hit: Hit): number; // attacker: cauterize damage boost etc.
  onLandHit(target: CombatActor, hit: Hit): void; // attacker: flow/AE
  onParried(): void; // attacker: got parried -> stagger
  setFreeze(frames: number): void;
  applyKnockback(dx: number, dz: number, force: number): void;
}

/** Is `srcX,srcZ` behind `target` within a rear half-cone of `coneDeg`? */
export function isBehind(tx: number, tz: number, tyaw: number, srcX: number, srcZ: number, coneDeg: number): boolean {
  const dx = srcX - tx;
  const dz = srcZ - tz;
  const len = Math.hypot(dx, dz) || 1;
  const fwdx = Math.sin(tyaw);
  const fwdz = Math.cos(tyaw);
  const dot = (dx / len) * fwdx + (dz / len) * fwdz; // >0 in front, <0 behind
  return dot < -Math.cos((coneDeg * Math.PI) / 180 / 2);
}

/** Is the attacker in the front hemisphere of `target` (for block validity)? */
export function isFrontal(tx: number, tz: number, tyaw: number, srcX: number, srcZ: number): boolean {
  const dx = srcX - tx;
  const dz = srcZ - tz;
  const fwdx = Math.sin(tyaw);
  const fwdz = Math.cos(tyaw);
  return dx * fwdx + dz * fwdz > 0;
}

export interface Resolvable {
  x: number; z: number; yaw: number;
  health: Health;
  poise: Poise;
  applyKnockback(dx: number, dz: number, force: number): void;
  onDamaged?(): void; // player: flow penalty
}

/** Shared incoming-hit math used by both the player and enemies. */
export function resolveIncoming(self: Resolvable, def: DefenseState, inc: Incoming, c: CombatConstants): HitOutcome {
  if (def.iframe) {
    return { connected: false, blocked: false, parried: false, staggered: false, damage: 0 };
  }
  if (def.parry && !inc.hit.unparryable) {
    return { connected: false, blocked: false, parried: true, staggered: false, damage: 0 };
  }

  const frontal = isFrontal(self.x, self.z, self.yaw, inc.srcX, inc.srcZ);
  const dirx = self.x - inc.srcX;
  const dirz = self.z - inc.srcZ;
  const len = Math.hypot(dirx, dirz) || 1;
  const kdx = dirx / len;
  const kdz = dirz / len;

  let damage = inc.hit.damage * inc.damageMult;
  if (inc.backstab) damage *= c.backstab.multiplier;

  // block: frontal, non-guard-break
  if (def.blocking && frontal && !inc.hit.guardBreak && !inc.hit.unparryable) {
    damage *= 1 - c.block.reductionPct;
    self.health.damage(Math.round(damage));
    const staggered = self.poise.damage(inc.hit.poiseDamage * 0.5);
    self.applyKnockback(kdx, kdz, (inc.hit.knockback ?? 0) * 0.4);
    return { connected: true, blocked: true, parried: false, staggered, damage: Math.round(damage) };
  }

  const poiseDmg = inc.hit.poiseDamage * (def.hyperArmor ? 1 - c.player.poise.hyperArmorReductionPct : 1);
  const staggered = def.hyperArmor ? false : self.poise.damage(poiseDmg);
  self.health.damage(Math.round(damage));
  self.applyKnockback(kdx, kdz, inc.hit.knockback ?? 0);
  self.onDamaged?.();
  return { connected: true, blocked: false, parried: false, staggered, damage: Math.round(damage) };
}
