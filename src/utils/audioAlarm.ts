// Web Audio API Tactical VPN Alarm & Handshake Sound Synthesizer
// 100% offline, zero network requests, instant playback on user click

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Tactical VPN Siren Alarm Sound
 * Plays a loud, distinctive alternating tactical alarm siren (high-low warble)
 * triggered when the user taps CONNECT.
 */
export function playVpnAlarmSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
    masterGain.gain.setValueAtTime(0.35, now + 0.85);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    masterGain.connect(ctx.destination);

    // Filter to give that authentic tactical radio/siren presence
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(3.2, now);
    filter.connect(masterGain);

    // Oscillator 1: Main High-Pitch Alert Siren Sweep
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';

    // Alarm frequency pattern: Sweep 1 (880Hz -> 1320Hz), Sweep 2 (880Hz -> 1480Hz)
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.linearRampToValueAtTime(1320, now + 0.22);
    osc1.frequency.setValueAtTime(850, now + 0.26);
    osc1.frequency.linearRampToValueAtTime(1440, now + 0.52);
    osc1.frequency.setValueAtTime(900, now + 0.56);
    osc1.frequency.linearRampToValueAtTime(1560, now + 0.85);
    osc1.connect(filter);

    // Oscillator 2: Sub-Harmonic Square Wave for alarm body/buzz
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.linearRampToValueAtTime(660, now + 0.22);
    osc2.frequency.setValueAtTime(440, now + 0.26);
    osc2.frequency.linearRampToValueAtTime(720, now + 0.52);
    osc2.frequency.setValueAtTime(440, now + 0.56);
    osc2.frequency.linearRampToValueAtTime(780, now + 0.85);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, now);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);

    // Pulse LFO for alarm warble
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, now); // 14 Hz rapid warble
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(60, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    // Start all nodes
    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    // Stop after alarm finishes
    osc1.stop(now + 1.15);
    osc2.stop(now + 1.15);
    lfo.stop(now + 1.15);

    // Haptic vibration feedback for mobile devices (alarm buzz pattern)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 60, 120, 60, 200]);
    }
  } catch (err) {
    console.warn('Alarm sound playback error:', err);
  }
}

/**
 * Handshake Connected Success Chime (Key 🔑 Established)
 */
export function playHandshakeSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.35);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 50, 80]);
    }
  } catch (err) {
    // Ignored
  }
}
