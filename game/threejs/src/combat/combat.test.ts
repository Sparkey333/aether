import { describe, it, expect } from 'vitest';
import { loadDesignData } from '@/data/loadDesignData';
import { FIXED_DT } from '@/engine/math';
import { attackVolume, hurtVolume, volumesOverlap } from './geometry';
import { Flow } from './Flow';
import { Poise } from './Poise';
import { MoveRunner } from './MoveRunner';
import { HitResolution } from './HitResolution';
import { Health } from './Health';
import { Enemy } from './Enemy';
import type { CombatActor, DefenseState, Incoming, HitOutcome } from './actor';
import { PlayerController, type PlayerInput } from '@/actors/CharacterController';
import { collision } from '@/world/collision';

const data = loadDesignData();
const C = data.combat;

const NO_INPUT: PlayerInput = {
  move: [0, 0], sprint: false, dodge: false, light: false, heavy: false,
  block: false, parry: false, special1: false, special2: false, cauterize: false,
};

describe('geometry', () => {
  it('spheres overlap by distance vs radius sum', () => {
    const a = { ax: 0, ay: 1, az: 0, bx: 0, by: 1, bz: 0, radius: 0.5 };
    const b = { ax: 0.8, ay: 1, az: 0, bx: 0.8, by: 1, bz: 0, radius: 0.5 };
    const c = { ax: 2.0, ay: 1, az: 0, bx: 2.0, by: 1, bz: 0, radius: 0.5 };
    expect(volumesOverlap(a, b)).toBe(true); // 0.8 < 1.0
    expect(volumesOverlap(a, c)).toBe(false); // 2.0 > 1.0
  });

  it('places a forward attack hitbox ahead of the actor along its facing', () => {
    // yaw 0 => forward +Z; a capsule with z-offset should sit in +Z
    const v = attackVolume({ shape: 'capsule', radius: 0.6, length: 2, offset: [0, 1, 1.2] }, 0, 0, 0, 0);
    expect(v.az).toBeGreaterThan(0.1);
    expect(v.bz).toBeGreaterThan(v.az); // extends further forward
  });

  it('an attack in reach overlaps the target hurtbox', () => {
    const atk = attackVolume({ shape: 'capsule', radius: 0.6, length: 2, offset: [0, 1, 1.2] }, 0, 0, 0, 0);
    const hurt = hurtVolume(0, 0, 1.6, 0.45, 1.85);
    expect(volumesOverlap(atk, hurt)).toBe(true);
    const far = hurtVolume(0, 0, 6, 0.45, 1.85);
    expect(volumesOverlap(atk, far)).toBe(false);
  });
});

describe('Flow (Souls<->DMC coupling)', () => {
  it('rewards variety and punishes repetition', () => {
    const f = new Flow(C.flow);
    expect(f.varietyMultFor('a')).toBe(C.flow.varietyNovelMult); // nothing seen yet
    f.onHit('a');
    expect(f.varietyMultFor('a')).toBe(C.flow.varietyRepeatMult); // immediate repeat
    f.onHit('b');
    expect(f.varietyMultFor('a')).toBe(C.flow.varietyRecentMult); // seen but not last
  });

  it('collapses FP when the player takes damage', () => {
    const f = new Flow(C.flow);
    f.fp = 5000;
    f.onDamaged();
    expect(f.fp).toBeCloseTo(5000 * (1 - C.flow.damagePenaltyPct));
  });

  it('grants Aether by rank — none at D, more at S', () => {
    const f = new Flow(C.flow);
    expect(f.rankName()).toBe('D');
    expect(f.onHit('x')).toBe(C.flow.aeByRank[0]); // rank D => 0 AE
    f.fp = 9500;
    expect(f.rankName()).toBe('S');
    expect(f.onHit('y')).toBe(C.flow.aeByRank[4]); // rank S => max AE per hit
  });
});

describe('Poise', () => {
  it('breaks into a stagger when depleted and resets', () => {
    const p = new Poise(60, 30, 1.0);
    expect(p.damage(40)).toBe(false);
    expect(p.staggered).toBe(false);
    expect(p.damage(40)).toBe(true); // 80 > 60 -> break
    expect(p.staggered).toBe(true);
    expect(p.current).toBe(60); // reset
  });
});

describe('MoveRunner', () => {
  it('exposes active hits only during the active window', () => {
    const r = new MoveRunner(data.moves.get('player-light-1')!); // active [8,11]
    const at = () => r.activeHits(0, 0, 0, 0).length;
    while (r.frame < 8) r.step();
    expect(at()).toBe(1);
    while (r.frame <= 11) r.step();
    expect(at()).toBe(0); // past active window
  });
});

describe('HitResolution', () => {
  function actor(team: 'player' | 'enemy', x: number, hits: ReturnType<MoveRunner['activeHits']>): CombatActor & { freezes: number[] } {
    const health = new Health(1000);
    return {
      id: team, team, x, y: 0, z: 0, yaw: 0, hurtRadius: 0.5, hurtHeight: 1.8,
      health, poise: new Poise(1000, 10, 1),
      freezeFrames: 0, freezes: [],
      alive: () => !health.dead,
      defense: (): DefenseState => ({ iframe: false, hyperArmor: false, blocking: false, parry: false }),
      activeHits: () => hits,
      receiveHit: (inc: Incoming): HitOutcome => {
        health.damage(inc.hit.damage);
        return { connected: true, blocked: false, parried: false, staggered: false, damage: inc.hit.damage };
      },
      outgoingMult: () => 1,
      onLandHit: () => {},
      onParried: () => {},
      setFreeze(f: number) { this.freezeFrames = Math.max(this.freezeFrames, f); this.freezes.push(f); },
      applyKnockback: () => {},
    };
  }

  it('applies damage once per swing and freezes both actors (hitstop)', () => {
    const move = data.moves.get('player-light-1')!;
    const runner = new MoveRunner(move);
    while (runner.frame < 9) runner.step(); // into active window
    const hitsNow = runner.activeHits(0, 0, 0.6, 0); // overlapping the target at z~0.6
    const attacker = actor('player', 0, hitsNow);
    const target = actor('enemy', 0.6, []);
    target.z = 0.6;

    const hr = new HitResolution(C);
    hr.step([attacker, target]);
    const dmg1 = 1000 - target.health.current;
    expect(dmg1).toBe(move.hits[0].damage);
    expect(attacker.freezeFrames).toBe(move.hits[0].hitstop);
    expect(target.freezeFrames).toBe(move.hits[0].hitstop);

    // same swing next frame -> no second application (hit-once)
    hr.step([attacker, target]);
    expect(1000 - target.health.current).toBe(dmg1);
  });
});

describe('player integration', () => {
  it('dodge i-frames negate an incoming hit', () => {
    collision.reset();
    const p = new PlayerController(C, data.moves, data.weapons.get('geomancers-edge')!);
    // start a dodge and advance into the i-frame window (frames 5..17)
    p.step(FIXED_DT, { ...NO_INPUT, dodge: true }, Math.PI, null);
    for (let i = 0; i < 6; i++) p.step(FIXED_DT, NO_INPUT, Math.PI, null);
    expect(p.invulnerable).toBe(true);
    const hp0 = p.health.current;
    const inc: Incoming = {
      hit: data.moves.get('husk-overhead')!.hits[0], srcTeam: 'enemy',
      srcX: 0, srcZ: -1, srcYaw: 0, fromBehind: false, backstab: false, damageMult: 1,
    };
    const out = p.receiveHit(inc);
    expect(out.connected).toBe(false);
    expect(p.health.current).toBe(hp0);
  });

  it('mashing light chains the combo and kills an adjacent Husk', () => {
    collision.reset();
    collision.bound = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
    const p = new PlayerController(C, data.moves, data.weapons.get('geomancers-edge')!);
    p.x = 0; p.z = 0; p.yaw = Math.PI; // facing -Z
    const enemy = new Enemy('husk-1', data.enemies.get('husk')!, data.moves, C, 0, -1.4);
    const hr = new HitResolution(C);
    let landedHits = 0;
    for (let i = 0; i < 90 && enemy.alive(); i++) {
      p.step(FIXED_DT, { ...NO_INPUT, light: true }, Math.PI, { x: enemy.x, z: enemy.z });
      hr.step([p, enemy]);
      landedHits += hr.events.filter((e) => e.type === 'hit' && e.target === 'husk-1').length;
    }
    expect(landedHits).toBeGreaterThanOrEqual(2); // the combo chained (multiple distinct swings landed)
    expect(enemy.alive()).toBe(false);
    expect(p.flow.fp).toBeGreaterThan(0); // Flow built from landing hits
  });
});
