// THE SONG — "La batalla". Every sound comes from an event in score.js.
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

const plan = (b) => (b === 0 ? 'light' : b === 1 ? 'full' : b <= 3 ? 'light' : b <= 6 ? 'full' : b === 7 ? 'dreamy' : b === 8 ? 'off' : b <= 13 ? 'hero' : 'off');
const { kicks } = A.bed(clock, 14, plan, { drums, bass, keys, pad, verb });

for (const k of sc.keys) fx.addMono(A.key(Math.round(k.t * 100)), k.t, 0.32, k.hand ? 0.35 : 0.1);
fx.addMono(A.buzz(0.38, 1), ev.buzz, 0.7, -0.4);
// each bug pops out of the phone with a rising pop; swats are thwacks
sc.bugs.forEach((b, i) => {
  fx.addMono(I.pop(0.8 + i * 0.09), b.t, 0.4, -0.3);
  if (b.swat) { fx.addMono(I.thwack(), b.swat, 0.6, 0.1); fx.addMono(I.noiseSweep(0.35, 600, 3000, { q: 1, pink: true }), b.swat + 0.05, 0.2, -0.5); }
});
// tickles
fx.addMono(A.giggle(3), ev.tickle, 0.5); fx.addMono(A.giggle(9), T(5, 2), 0.5);
// carried away: hup hup on each beat
for (let k = 0; k < 4; k++) fx.addMono(I.pop(0.6 + k * 0.05), T(6, k), 0.35, -0.2 - k * 0.15);
fx.addMono(I.thud(70, 0.1), ev.lounge, 0.5);
// snap out of it
fx.addMono(I.scratch(0.32), ev.scratch, 0.6);
fx.addMono(I.thud(90, 0.08), ev.scratch, 0.7);
fx.addMono(I.kick({ punch: 1 }), ev.scratch, 0.5);
fx.addMono(A.lockClick(), ev.lock, 0.85);
// the shield
fx.addMono(I.bwomp(), ev.shield + 0.08, 0.35);
fx.addMono(I.thud(80, 0.1), ev.shield, 0.8);
fx.addMono(I.kick({ punch: 1 }), ev.shield, 0.7);
fx.addMono(I.subBoom(1.2), ev.shield, 0.5);
fx.addMono(I.crash(18), ev.shield, 0.3);
for (let k = 0; k < 7; k++) fx.addMono(A.deflate(0.5, k + 1), ev.shield + 0.12 + k * BEAT / 2, 0.28, (k % 2 ? 0.4 : -0.4));
fx.addMono(I.thud(90, 0.06), ev.back, 0.5);
for (const t of sc.bounces) fx.addMono(I.boing(), t, 0.35, 0.3);
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
MIX.gate(mix, ev.scratch - BEAT / 2, ev.scratch); // a held breath before the snap
MIX.gate(mix, ev.shield - BEAT / 2, ev.shield); // and before the shield
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
