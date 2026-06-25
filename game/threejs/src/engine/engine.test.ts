import { describe, it, expect } from 'vitest';
import { Rng } from '@/engine/Rng';
import { GameLoop } from '@/engine/GameLoop';
import { framesToSec, secToFrames, clamp, FIXED_DT } from '@/engine/math';

const AETH = 0x41455448;

describe('Rng determinism (cross-engine contract)', () => {
  it('two instances with the same seed produce identical sequences', () => {
    const a = new Rng(AETH);
    const b = new Rng(AETH);
    const seqA = Array.from({ length: 64 }, () => a.nextUint());
    const seqB = Array.from({ length: 64 }, () => b.nextUint());
    expect(seqA).toEqual(seqB);
  });

  it('different seeds diverge', () => {
    const a = new Rng(AETH);
    const b = new Rng(AETH + 1);
    expect(a.nextUint()).not.toBe(b.nextUint());
  });

  it('weightedPick is deterministic and respects weights', () => {
    const r = new Rng(AETH);
    const counts = [0, 0, 0];
    for (let i = 0; i < 6000; i++) counts[r.weightedPick([1, 2, 3])]++;
    // index 2 (weight 3) should be picked far more than index 0 (weight 1)
    expect(counts[2]).toBeGreaterThan(counts[0]);
    // re-seeded run is identical
    const r2 = new Rng(AETH);
    const first = Array.from({ length: 20 }, () => r.weightedPick([1, 1, 1, 1]));
    const first2 = Array.from({ length: 6000 + 20 }, () => r2.weightedPick([1, 1, 1, 1])).slice(6000);
    expect(first).toEqual(first2);
  });

  it('state snapshot/restore reproduces the stream', () => {
    const r = new Rng(AETH);
    r.nextUint();
    const s = r.getState();
    const a = [r.nextUint(), r.nextUint(), r.nextUint()];
    r.setState(s);
    const b = [r.nextUint(), r.nextUint(), r.nextUint()];
    expect(a).toEqual(b);
  });
});

describe('GameLoop fixed timestep', () => {
  it('runs exactly one step per 1/60s and advances the frame counter', () => {
    const loop = new GameLoop();
    let steps = 0;
    loop.addSystem(() => steps++);
    // feed 1 second of real time in 30fps-sized chunks
    for (let i = 0; i < 30; i++) loop.advance(1 / 30);
    expect(steps).toBe(60);
    expect(loop.frame).toBe(60);
  });

  it('clamps a huge delta to avoid the spiral of death', () => {
    const loop = new GameLoop();
    let steps = 0;
    loop.addSystem(() => steps++);
    loop.advance(10); // 10 real seconds at once
    expect(steps).toBeLessThanOrEqual(Math.ceil(0.25 / FIXED_DT));
  });
});

describe('frame/second helpers', () => {
  it('round-trips frames<->seconds', () => {
    expect(framesToSec(30)).toBeCloseTo(0.5);
    expect(secToFrames(0.5)).toBe(30);
  });
  it('clamp bounds values', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});
