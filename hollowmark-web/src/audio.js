// Synthesized SFX via the Web Audio API — no audio files. Another lesson
// learned: total silence made hits and kills feel weightless. Everything
// here is oscillators + filtered noise, composed per event. Must be
// resumed from a user gesture (the overlay click does this).

export function createAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return silent();

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  // Reusable white-noise buffer.
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

  const now = () => ctx.currentTime;

  function tone(freq, dur, { type = 'sawtooth', gain = 0.3, glideTo, delay = 0, filter } = {}) {
    const t = now() + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t + dur);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (filter) {
      const biquad = ctx.createBiquadFilter();
      biquad.type = filter.type || 'lowpass';
      biquad.frequency.value = filter.freq || 1200;
      osc.connect(biquad); node = biquad;
    }
    node.connect(env); env.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(dur, { gain = 0.3, type = 'bandpass', freq = 1400, q = 0.7, delay = 0 } = {}) {
    const t = now() + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const biquad = ctx.createBiquadFilter();
    biquad.type = type; biquad.frequency.value = freq; biquad.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(biquad); biquad.connect(env); env.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  const api = {
    resume() { if (ctx.state === 'suspended') ctx.resume(); },
    shoot(core) {
      if (core === 'MAW') { noise(0.16, { gain: 0.35, type: 'lowpass', freq: 1800 }); tone(140, 0.14, { type: 'square', gain: 0.18, glideTo: 70 }); }
      else if (core === 'LANCE') { tone(880, 0.12, { type: 'sawtooth', gain: 0.22, glideTo: 300, filter: { freq: 2600 } }); }
      else if (core === 'SWARM') { noise(0.05, { gain: 0.16, type: 'highpass', freq: 2200 }); tone(320, 0.05, { type: 'square', gain: 0.1 }); }
      else if (core === 'SUNDER') { tone(70, 0.5, { type: 'sawtooth', gain: 0.34, glideTo: 420, filter: { freq: 1800 } }); noise(0.5, { gain: 0.18, type: 'bandpass', freq: 900 }); }
    },
    charge() { tone(120, 1.1, { type: 'sawtooth', gain: 0.14, glideTo: 900, filter: { freq: 1400 } }); },
    hit() { noise(0.08, { gain: 0.28, type: 'bandpass', freq: 2000, q: 1.2 }); tone(300, 0.07, { type: 'square', gain: 0.12, glideTo: 160 }); },
    kill() { tone(200, 0.28, { type: 'sawtooth', gain: 0.26, glideTo: 60 }); noise(0.26, { gain: 0.22, type: 'lowpass', freq: 1000 }); },
    bossHit() { noise(0.1, { gain: 0.3, type: 'bandpass', freq: 700, q: 1.5 }); tone(90, 0.12, { type: 'square', gain: 0.16 }); },
    jump() { tone(300, 0.14, { type: 'square', gain: 0.14, glideTo: 620 }); },
    doubleJump() { tone(480, 0.14, { type: 'square', gain: 0.14, glideTo: 880 }); },
    dash() { noise(0.16, { gain: 0.24, type: 'highpass', freq: 1400 }); tone(600, 0.12, { type: 'sawtooth', gain: 0.1, glideTo: 200 }); },
    hurt() { tone(180, 0.22, { type: 'sawtooth', gain: 0.3, glideTo: 60 }); noise(0.2, { gain: 0.2, type: 'lowpass', freq: 700 }); },
    hollowOn() { tone(60, 0.7, { type: 'sawtooth', gain: 0.32, glideTo: 240, filter: { freq: 900 } }); tone(90, 0.7, { type: 'square', gain: 0.14, glideTo: 180, delay: 0.02 }); },
    hollowOff() { tone(300, 0.4, { type: 'sawtooth', gain: 0.2, glideTo: 60 }); },
    lash() { tone(120, 0.35, { type: 'sawtooth', gain: 0.34, glideTo: 700, filter: { freq: 1600 } }); noise(0.35, { gain: 0.26, type: 'bandpass', freq: 500 }); },
    spark() { tone(1200, 0.09, { type: 'sine', gain: 0.14, glideTo: 2000 }); },
    checkpoint() { tone(440, 0.16, { type: 'sine', gain: 0.2 }); tone(660, 0.2, { type: 'sine', gain: 0.18, delay: 0.12 }); },
    lostControl() { tone(240, 0.6, { type: 'sawtooth', gain: 0.3, glideTo: 40, filter: { freq: 600 } }); },
  };
  return api;
}

// No-op fallback if Web Audio is unavailable, so callers never guard.
function silent() {
  return new Proxy({}, { get: () => () => {} });
}
