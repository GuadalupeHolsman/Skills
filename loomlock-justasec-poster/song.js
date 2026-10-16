// THE SONG — "Solo un segundito" v2: a minimal electronic bed; the clock tick is part of the groove.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const A = require('./loomaudio');
const sc = require('./score');
const { T, BEAT, DURATION, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), keys = bus(), pad = bus(), fx = bus(), verb = bus();

// 0-1 keys only, 2-3 build, 4-5 drive, 6-7 stop + rewind (sfx), 8-9 calm, 10-11 end chord
const plan = (b) => (b <= 1 ? 'keys' : b <= 3 ? 'build' : b <= 5 ? 'drive' : b <= 7 ? 'off' : b <= 9 ? 'calm' : b === 10 ? 'keys' : 'off');
const { kicks } = A.minimal(clock, 12, plan, { drums, bass, keys, pad, verb });

// the phone wakes up
fx.addMono(A.buzz(0.32, 1), ev.wake, 0.45, -0.2);
fx.addMono(A.chime(88), ev.wake + 0.02, 0.25);
// the clock: a dry tick on every hour change, a soft scroll whoosh on every swipe
for (const s of sc.steps) if (s.t > 0 && s.t < ev.stop) fx.addMono(A.tick(1.4), s.t, 0.4, -0.3);
for (const t of sc.swipes) fx.addMono(I.noiseSweep(0.12, 2500, 900, { q: 0.8, pink: true }), t, 0.12, 0.3);
// riser into the stop, then nothing
fx.addMono(I.noiseSweep(T(6) - T(4), 200, 6000, { q: 0.7, shape: (x) => x * x * x, pink: true }), T(4), 0.25);
fx.addMono(I.thud(60, 0.12), ev.stop, 0.7);
fx.addMono(A.tick(0.9), ev.stop, 0.6);
fx.addMono(A.lockClick(), ev.lock, 0.8);
fx.addMono(I.subBoom(1.4), ev.lock, 0.35);
// rewind: a tape squeal and ticks running backwards
fx.addMono(A.rewind(ev.morning - ev.rewind), ev.rewind, 0.3);
for (const s of sc.steps) if (s.t > ev.rewind && s.t < ev.morning) fx.addMono(A.tick(1.8), s.t, 0.3, 0.3);
fx.addMono(I.thud(70, 0.08), ev.morning, 0.5);
// end card
fx.addMono(I.noiseSweep(0.4, 300, 3000, { q: 0.7, pink: true }), ev.end - 0.05, 0.15);
fx.addMono(A.lockClick(), ev.click, 0.85);

MIX.sidechain([pad, bass], kicks, { depth: 0.5 });
const stems = { drums, bass, keys, pad, fx, verb: reverb(verb, { room: 0.82, damp: 0.5 }) };
const GAIN = { drums: 0.5, bass: 0.9, keys: 0.9, pad: 2.0, fx: 0.9, verb: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.gate(mix, ev.stop - BEAT / 4, ev.stop); // a breath before the stop
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
