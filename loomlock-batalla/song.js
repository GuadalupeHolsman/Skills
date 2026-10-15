// THE SONG — "La batalla" v2: calm keys, a chime per notification as the groove builds, silence, the blast.
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

const plan = (b) => (b <= 1 ? 'keys' : b <= 3 ? 'build' : b <= 5 ? 'drive' : b === 6 ? 'off' : b <= 9 ? 'calm' : b === 10 ? 'keys' : 'off');
const { kicks } = A.minimal(clock, 12, plan, { drums, bass, keys, pad, verb });

for (const t of sc.keys) fx.addMono(A.key(Math.round(t * 100)), t, 0.22, 0.2);
// every notification chimes; the dense ones get quieter so it stays a texture, not a mess
sc.notifs.forEach((n, i) => { const g = i < 12 ? 0.3 : 0.17; const c = A.chime(n.midi); fx.addMono(c, n.t, g, (n.x - 160) / 110); verb.addMono(c, n.t, 0.08); });
fx.addMono(I.noiseSweep(T(6) - T(4), 200, 7000, { q: 0.7, shape: (x) => x * x * x, pink: true }), T(4), 0.22);
// silence, a tap, the lock
fx.addMono(A.lockClick(), ev.lock, 0.85);
// the blast
fx.addMono(I.subBoom(1.6), ev.blast, 0.6);
fx.addMono(I.thud(55, 0.14), ev.blast, 0.8);
fx.addMono(I.kick({ punch: 1 }), ev.blast, 0.6);
fx.addMono(I.noiseSweep(1.1, 6000, 300, { q: 0.6, pink: true }), ev.blast, 0.3);
// end card
fx.addMono(I.noiseSweep(0.4, 300, 3000, { q: 0.7, pink: true }), ev.end - 0.05, 0.15);
fx.addMono(A.lockClick(), ev.click, 0.85);

MIX.sidechain([pad, bass], kicks, { depth: 0.5 });
const stems = { drums, bass, keys, pad, fx, verb: reverb(verb, { room: 0.82, damp: 0.5 }) };
const GAIN = { drums: 0.5, bass: 0.9, keys: 0.9, pad: 2.0, fx: 0.9, verb: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.gate(mix, ev.stop, ev.lock - 0.02); // the frozen wall: total silence
MIX.gate(mix, ev.blast - BEAT / 4, ev.blast); // a breath before the blast
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
