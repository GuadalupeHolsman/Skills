// THE SONG — "El reflejo": the unlock click becomes the rhythm, then silence, then the key.
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

const plan = (b) => (b <= 1 ? 'keys' : b <= 3 ? 'build' : b <= 5 ? 'drive' : b === 6 ? 'off' : b === 7 ? 'keys' : b <= 9 ? 'calm' : b === 10 ? 'keys' : 'off');
const { kicks } = A.minimal(clock, 12, plan, { drums, bass, keys, pad, verb });

// picking up the phone
fx.addMono(I.noiseSweep(0.25, 400, 1800, { q: 0.8, pink: true }), ev.grab - 0.1, 0.12);
fx.addMono(A.tick(1.1), ev.grab, 0.35);
// every open: the unlock click, the tap on the app, a scroll swish
for (const o of sc.opens) {
  const g = o.i < 6 ? 1 : 0.7;
  fx.addMono(A.key(o.i + 3), o.t, 0.45 * g, -0.2);
  fx.addMono(I.pop(1.4), o.t + o.dur * 0.3, 0.12 * g, 0.2);
  fx.addMono(I.noiseSweep(0.12, 2600, 900, { q: 0.8, pink: true }), o.t + o.dur * 0.55, 0.1 * g, 0.3);
}
fx.addMono(I.noiseSweep(T(6) - T(4), 200, 7000, { q: 0.7, shape: (x) => x * x * x, pink: true }), T(4), 0.22);
// the stop, then the key
fx.addMono(I.thud(55, 0.14), ev.stop, 0.75);
fx.addMono(A.lockClick(), ev.tap, 0.85);
fx.addMono(I.subBoom(1.4), ev.tap, 0.35);
// the reflex hits a wall: a dull denied buzz
fx.addMono(I.pop(1.4), ev.test, 0.15);
fx.addMono(A.buzz(0.22, 4), ev.test + 0.04, 0.35);
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
MIX.gate(mix, ev.stop + 0.6, ev.tap - 0.01); // silence until the key
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
