// THE SONG — "El imán". Every sound comes from an event in score.js.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const A = require('./loomaudio');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), keys = bus(), pad = bus(), fx = bus(), verb = bus();

const plan = (b) => (b === 0 ? 'light' : b === 1 ? 'full' : b === 2 ? 'light' : b <= 4 ? 'full' : b === 5 ? 'tick' : b === 6 ? 'off' : b <= 9 ? 'full' : b <= 11 ? 'hero' : 'off');
const { kicks } = A.bed(clock, 12, plan, { drums, bass, keys, pad, verb });

for (const k of sc.keys) fx.addMono(A.key(Math.round(k.t * 100)), k.t, 0.32, k.hand ? 0.35 : 0.1);
for (const t of [ev.peek1, ev.peek2]) { fx.addMono(I.whistle(0.25), t, 0.06, -0.3); fx.addMono(I.woodTick(1.6), t + 0.22, 0.4); }
// the magnet: buzz, then a low hum that grows, and rubbery stretches
fx.addMono(A.buzz(0.38, 1), ev.buzz, 0.7, -0.5);
fx.addMono(A.buzz(0.38, 2), ev.buzz + BEAT, 0.7, -0.5);
fx.addMono(A.stretch(ev.lock - ev.buzz, 70, 160), ev.buzz, 0.22, -0.3);
fx.addMono(A.stretch(T(4) - T(3), 180, 520), ev.stretch1, 0.35, -0.2);
fx.addMono(A.stretch(T(5) - T(4), 260, 900), ev.stretch2, 0.35, -0.2);
fx.addMono(I.pop(0.9), ev.huh, 0.3, 0.6);
fx.addMono(I.pop(1.3), ev.fine, 0.3, -0.2);
// fingers slip, one by one, then he flies
for (const t of ev.slips) fx.addMono(I.woodTick(0.9), t, 0.55, 0.4);
fx.addMono(I.noiseSweep(BEAT, 400, 4000, { q: 1.2, pink: true }), ev.fly, 0.35, -0.3);
// Loomlock: click, the magnet dies, BOING back
fx.addMono(A.lockClick(), ev.lock, 0.9);
fx.addMono(I.subBoom(0.8), ev.lock, 0.4);
fx.addMono(I.boing(), ev.lock + 0.03, 0.6);
fx.addMono(I.boing(), ev.lock + 0.45, 0.3);
fx.addMono(I.boing(), ev.lock + 0.8, 0.15);
// end card
fx.addMono(I.noiseSweep(0.35, 400, 5000, { q: 1, pink: true }), ev.end, 0.35);
fx.addMono(A.lockClick(), ev.click, 0.9);
for (const c of sc.captions) fx.addMono(I.paperFwip(1, Math.round(c.t * 10)), c.t - 0.03, 0.2);

MIX.sidechain([pad, bass], kicks);
const stems = { drums, bass, keys, pad, fx, verb: reverb(verb, { room: 0.7, damp: 0.4 }) };
const GAIN = { drums: 0.45, bass: 0.75, keys: 0.95, pad: 2.2, fx: 0.9, verb: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
