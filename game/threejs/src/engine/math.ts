// Frame/second helpers and small math utilities. The game thinks in FRAMES (@60), never seconds.
export const TICK_RATE = 60;
export const FIXED_DT = 1 / TICK_RATE;

export const framesToSec = (frames: number): number => frames / TICK_RATE;
export const secToFrames = (sec: number): number => Math.round(sec * TICK_RATE);

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const clamp01 = (v: number): number => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** angle wrap to [-PI, PI] */
export const wrapAngle = (a: number): number => {
  const t = (a + Math.PI) % (Math.PI * 2);
  return (t < 0 ? t + Math.PI * 2 : t) - Math.PI;
};

/** smooth approach toward target with a frame-rate-independent rate */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const hexToRgb01 = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
