// The authoritative hit-resolution system. Once per fixed step it tests every active attack volume
// against every opposing hurtbox (analytic capsule overlap from data), enforces hit-once-per-target,
// and applies damage/poise/hitstop/knockback + attacker Flow/AE. Frozen (hitstop) attackers are
// skipped so both actors truly pause on impact. Order over `actors` is part of the determinism contract.
import type { CombatActor, Incoming } from './actor';
import { isBehind } from './actor';
import { hurtVolume, volumesOverlap } from './geometry';
import type { CombatConstants } from '@/data/types';

export type CombatEventType = 'hit' | 'block' | 'parry' | 'stagger' | 'death';

export interface CombatEvent {
  type: CombatEventType;
  attacker: string;
  target: string;
  damage: number;
  x: number; y: number; z: number;
}

export class HitResolution {
  private consumed = new Set<string>();
  events: CombatEvent[] = [];

  constructor(private c: CombatConstants) {}

  step(actors: CombatActor[]): void {
    this.events.length = 0;
    for (const attacker of actors) {
      if (!attacker.alive() || attacker.freezeFrames > 0) continue;
      const hits = attacker.activeHits();
      if (hits.length === 0) continue;
      for (const target of actors) {
        if (target === attacker || target.team === attacker.team || !target.alive()) continue;
        const hv = hurtVolume(target.x, target.y, target.z, target.hurtRadius, target.hurtHeight);
        for (const ah of hits) {
          const key = `${attacker.id}:${ah.instanceId}:${ah.hitIndex}:${target.id}`;
          if (this.consumed.has(key)) continue;
          if (!volumesOverlap(ah.vol, hv)) continue;
          this.consumed.add(key);

          const fromBehind = isBehind(target.x, target.z, target.yaw, attacker.x, attacker.z, 180);
          const backstab = attacker.team === 'player'
            && isBehind(target.x, target.z, target.yaw, attacker.x, attacker.z, this.c.backstab.coneDeg)
            && (attacker.x - target.x) ** 2 + (attacker.z - target.z) ** 2 <= this.c.backstab.rangeM ** 2;

          const inc: Incoming = {
            hit: ah.hit,
            srcTeam: attacker.team,
            srcX: attacker.x, srcZ: attacker.z, srcYaw: attacker.yaw,
            fromBehind,
            backstab,
            damageMult: attacker.outgoingMult(ah.hit),
          };
          const out = target.receiveHit(inc);

          if (out.parried) {
            attacker.onParried();
            attacker.setFreeze(this.c.hitstopDefaults.parry);
            this.push('parry', attacker.id, target.id, 0, target);
          } else if (out.connected) {
            attacker.setFreeze(ah.hit.hitstop);
            target.setFreeze(ah.hit.hitstop);
            attacker.onLandHit(target, ah.hit);
            this.push(out.blocked ? 'block' : 'hit', attacker.id, target.id, out.damage, target);
            if (out.staggered) this.push('stagger', attacker.id, target.id, 0, target);
            if (!target.alive()) this.push('death', attacker.id, target.id, 0, target);
          }
        }
      }
    }
  }

  private push(type: CombatEventType, attacker: string, target: string, damage: number, at: { x: number; y: number; z: number }): void {
    this.events.push({ type, attacker, target, damage, x: at.x, y: at.y + 1.0, z: at.z });
  }

  /** clear the hit-once ledger between encounters to bound memory. */
  clear(): void {
    this.consumed.clear();
  }
}
