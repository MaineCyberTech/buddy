let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.1) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch { /* silent fail */ }
}

export const SoundEngine = {
  hatch() { playTone(523, 0.15, 'square', 0.08); setTimeout(() => playTone(659, 0.15, 'square', 0.08), 100); setTimeout(() => playTone(784, 0.3, 'square', 0.08), 200); },
  evolve() { playTone(392, 0.2, 'triangle', 0.1); setTimeout(() => playTone(523, 0.2, 'triangle', 0.1), 150); setTimeout(() => playTone(659, 0.2, 'triangle', 0.1), 300); setTimeout(() => playTone(784, 0.4, 'triangle', 0.1), 450); },
  feed() { playTone(440, 0.08, 'square', 0.06); },
  play() { playTone(660, 0.1, 'triangle', 0.07); setTimeout(() => playTone(880, 0.1, 'triangle', 0.07), 80); },
  wash() { playTone(300, 0.15, 'sawtooth', 0.04); setTimeout(() => playTone(250, 0.2, 'sawtooth', 0.04), 100); },
  rest() { playTone(200, 0.3, 'sine', 0.05); },
  talk() { playTone(500, 0.1, 'square', 0.05); setTimeout(() => playTone(600, 0.1, 'square', 0.05), 120); setTimeout(() => playTone(700, 0.1, 'square', 0.05), 240); },
  train() { playTone(180, 0.2, 'square', 0.08); setTimeout(() => playTone(220, 0.15, 'square', 0.08), 150); },
  heal() { playTone(520, 0.2, 'sine', 0.07); setTimeout(() => playTone(660, 0.3, 'sine', 0.07), 200); },
  coin() { playTone(880, 0.06, 'square', 0.06); setTimeout(() => playTone(1100, 0.08, 'square', 0.06), 60); },
  achievement() { playTone(523, 0.1, 'triangle', 0.08); setTimeout(() => playTone(659, 0.1, 'triangle', 0.08), 100); setTimeout(() => playTone(784, 0.1, 'triangle', 0.08), 200); setTimeout(() => playTone(1047, 0.3, 'triangle', 0.08), 300); },
  click() { playTone(400, 0.04, 'square', 0.04); },
  adventure() { playTone(350, 0.15, 'triangle', 0.07); setTimeout(() => playTone(440, 0.15, 'triangle', 0.07), 150); setTimeout(() => playTone(550, 0.25, 'triangle', 0.07), 300); },
};
