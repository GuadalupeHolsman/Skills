// THE SONG: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems, LUFS=-14 sets loudness)
// A bouncy chiptune stroll, a splash + sizzle + scream on every fall (each one bigger), dead silence
// and a sad trombone after the third, a ding for the idea, a THUNK for the bridge, a fanfare for the win.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), voice = bus(), verb = bus();
const rng = U.mulberry32(9);
const buses = { drums, bass, pad, keys };

// ---------- the groove: the stroll (bars 0-6), back after the idea ----------
Genre.play('chiptune', { clock, from: 0, to: 2, chordAt, buses, gain: 0.7 });
Genre.play('chiptune', { clock, from: 2, to: 7, chordAt, buses, gain: 0.85 });
Genre.play('chiptune', { clock, from: 9, to: 11, chordAt, buses, gain: 0.95 });
Genre.play('chiptune', { clock, from: 11, to: 13, chordAt, buses, gain: 1.1 });

// footsteps
for (const t of sc.steps) fx.addMono(I.woodTick(1.4 + rng() * 0.2), t, 0.1, (rng() - 0.5) * 0.4);

// ---------- the falls ----------
function splash(t, size) {
  fx.addMono(I.noiseSweep(0.22, 2500, 300, { q: 0.8 }), t - 0.22, 0.12 * size); // the drop
  fx.addMono(I.thud(70, 0.5), t, 0.9 * size);
  fx.addMono(I.subBoom(0.7, 90, 35), t, 0.45 * size);
  fx.addMono(I.pop(0.6), t, 0.4 * size);
  fx.addMono(I.noiseSweep(1.2, 7000, 3500, { q: 0.5 }), t + 0.05, 0.07 * size); // the sizzle
  verb.addMono(I.thud(70, 0.5), t, 0.3 * size);
}
function scream(t, dur, from, glide) {
  voice.addMono(I.voice(m(from), dur, { syl: 'a', type: 'alto', glide, shout: 1.5, vib: 0.4, seed: 3 }), t, 0.4);
  verb.addMono(I.voice(m(from), dur, { syl: 'a', type: 'alto', glide, shout: 1.5, vib: 0.4, seed: 3 }), t, 0.12);
}
function land(t) { fx.addMono(I.thud(110, 0.25), t, 0.8); drums.addMono(I.kick({ punch: 1.2 }), t, 0.5); }

splash(ev.splash1, 0.8);
scream(ev.launch1, 0.9, 'E5', 3);
fx.addMono(I.boing(), ev.launch1, 0.35);
land(ev.land1);

splash(ev.splash2, 1);
fx.addMono(I.launchWhistle(ev.peak2 - ev.launch2), ev.launch2, 0.3);
scream(ev.launch2, ev.land2 - ev.launch2 - 0.15, 'A5', -12);
land(ev.land2);
drums.addMono(I.crash(2), ev.land2, 0.25);

splash(ev.splash3, 1.2);
fx.addMono(I.scratch(0.34), ev.scratch, 0.5);
for (let i = 0; i < 6; i++) fx.addMono(I.pop(0.3 + rng() * 0.3), ev.splash3 + 0.4 + i * 0.12 + rng() * 0.05, 0.18); // glub glub
fx.addMono(I.bwomp(), ev.bwomp, 0.5);

// ---------- the idea ----------
fx.addMono(I.bell(1318.5, 1.6, 2, 3.5), ev.idea, 0.35);
fx.addMono(I.bell(1760, 1.4, 2, 3.5), ev.idea + BEAT / 2, 0.25);
fx.addMono(I.noiseSweep(ev.tip - ev.grow, 300, 5000, { q: 1.2, pink: true, shape: (x) => x * x }), ev.grow, 0.14);
for (let i = 0; i < 6; i++) keys.addMono(I.pulse(m('C5') + [0, 4, 7, 12, 16, 19][i], BEAT / 4, { duty: 0.25, decay: 0.12 }), ev.grow + i * BEAT / 4, 0.12);
fx.addMono(I.paperFwip(0.6), ev.tip, 0.3);
// ---------- the bridge: THUNK ----------
fx.addMono(I.thud(55, 0.6), ev.bridge, 1);
fx.addMono(I.subBoom(1, 70, 30), ev.bridge, 0.6);
drums.addMono(I.crash(4), ev.bridge, 0.35);
// ---------- the win: fanfare ----------
for (const [beat, ch] of [[0, ['C4', 'E4', 'G4', 'C5']], [1.5, ['D4', 'F4', 'A4', 'D5']], [2, ['E4', 'G4', 'C5', 'E5']]]) {
  for (const n of ch) { const { L, R } = I.brassNote(m(n), BEAT * (beat === 2 ? 1.6 : 0.45), { stab: beat !== 2, bright: 1.2, seed: m(n) + beat }); brass.addStereo(L, R, T(11, beat), 0.09); }
}
drums.addMono(I.crash(1), ev.win, 0.45);
for (let i = 0; i < 8; i++) fx.addMono(I.pop(0.8 + rng() * 0.6), ev.win + 0.05 + rng() * 1.6, 0.12); // confetti pops
drums.addMono(I.clap({ spread: 1.4 }), T(13), 0.5);

// ---------- mix ----------
const music = [drums, bass, pad, keys, brass];
for (const b of music) MIX.gate(b, ev.splash3 + 0.02, ev.idea, 0.01); // the silence after the third fall
for (const b of [drums, bass, pad]) MIX.gate(b, ev.idea, ev.bridge, 0.01); // only the idea sounds until the THUNK
const room = reverb(verb, { room: 0.55, damp: 0.4 });
const stems = { drums, bass, pad, keys, brass, fx, voice, verb: room };
const GAIN = { drums: 0.9, bass: 0.7, pad: 0.8, keys: 0.9, brass: 2.2, fx: 1.2, voice: 1.3, verb: 0.4 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
