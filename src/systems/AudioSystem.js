/**
 * Procedural 70s disco soundtrack via Web Audio API.
 * No external audio files needed — works fully offline.
 */

let ctx = null;
let masterGain = null;
let schedulerHandle = null;
let isPlaying = false;

let bpm = 120;
let nextBeatTime = 0;
let beat = 0;

const LOOKAHEAD   = 0.1;   // seconds ahead to schedule
const SCHEDULE_HZ = 25.0;  // how often to call scheduler (ms)

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function scheduleKick(time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
  gain.gain.setValueAtTime(1.0, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  osc.start(time);
  osc.stop(time + 0.25);
}

function scheduleHihat(time, open) {
  const bufLen = ctx.sampleRate * 0.05;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filt = ctx.createBiquadFilter();

  src.buffer = buf;
  src.connect(filt); filt.connect(gain); gain.connect(masterGain);
  filt.type = 'highpass';
  filt.frequency.value = 7000;

  const dur = open ? 0.18 : 0.04;
  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.start(time);
  src.stop(time + dur);
}

function scheduleSnare(time) {
  // Noise layer
  const bufLen = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf;
  src.connect(gain); gain.connect(masterGain);
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  src.start(time);
  src.stop(time + 0.15);
}

function scheduleBass(time, note) {
  const freq = midiToHz(note);
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  osc.connect(filt); filt.connect(gain); gain.connect(masterGain);
  osc.type = 'sawtooth';
  filt.type = 'lowpass';
  filt.frequency.value = 500;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.55, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  osc.start(time);
  osc.stop(time + 0.18);
}

// BASS LINE: funky disco octave pattern
const BASS_PATTERN = [36, 36, 48, 36, 36, 36, 48, 36]; // C2 / C3 octave jumps

function scheduleBeat(time, beatIndex) {
  const b16 = beatIndex % 4;   // position within bar (0–3)
  const bar  = Math.floor(beatIndex / 4) % 8;

  // Four-on-the-floor kick
  scheduleKick(time);

  // Hi-hat: open on off-beats
  const hiOpen = (b16 === 1 || b16 === 3);
  scheduleHihat(time, hiOpen);
  scheduleHihat(time + secondsPerBeat() * 0.5, false);

  // Snare on 2 & 4
  if (b16 === 1 || b16 === 3) scheduleSnare(time);

  // Bass line
  const bassNote = BASS_PATTERN[(bar * 2 + Math.floor(b16 / 2)) % BASS_PATTERN.length];
  scheduleBass(time, bassNote);
}

function secondsPerBeat() {
  return 60.0 / bpm;
}

function midiToHz(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function scheduler() {
  while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
    scheduleBeat(nextBeatTime, beat);
    nextBeatTime += secondsPerBeat();
    beat++;
  }
}

export const AudioSystem = {
  startDiscoLoop() {
    try {
      getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (isPlaying) return;
      isPlaying = true;
      nextBeatTime = ctx.currentTime + 0.05;
      beat = 0;
      schedulerHandle = setInterval(scheduler, 1000 / SCHEDULE_HZ);
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  },

  stop() {
    clearInterval(schedulerHandle);
    isPlaying = false;
  },

  setVolume(v) {
    if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
  },

  setBPM(newBpm) {
    bpm = newBpm;
  },

  speedUp() {
    this.setBPM(Math.min(145, bpm + 5));
  },

  resume() {
    try {
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  },

  // ─── SFX ─────────────────────────────────────────────────────────────────────

  playStamp(approve) {
    try {
      const c = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(masterGain);
      osc.type = 'square';
      const t = c.currentTime;
      if (approve) {
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.05);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.12);
      } else {
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.18);
        // second thud
        const osc2 = c.createOscillator();
        const g2 = c.createGain();
        osc2.connect(g2); g2.connect(masterGain);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(100, t + 0.10);
        g2.gain.setValueAtTime(0.3, t + 0.10);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc2.start(t + 0.10); osc2.stop(t + 0.22);
      }
    } catch (e) {}
  },

  playCoins() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      [0, 0.06, 0.12].forEach((offset, i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(masterGain);
        osc.type = 'sine';
        const freq = 900 + i * 200 + Math.random() * 100;
        osc.frequency.setValueAtTime(freq, t + offset);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + offset + 0.08);
        g.gain.setValueAtTime(0.25, t + offset);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.09);
        osc.start(t + offset); osc.stop(t + offset + 0.09);
      });
    } catch (e) {}
  },

  playAlarm() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc  = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(masterGain);
        osc.type = 'sawtooth';
        const hiLo = i % 2 === 0 ? 880 : 660;
        osc.frequency.setValueAtTime(hiLo, t + i * 0.25);
        gain.gain.setValueAtTime(0.5, t + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.22);
        osc.start(t + i * 0.25); osc.stop(t + i * 0.25 + 0.22);
      }
    } catch (e) {}
  },
};
