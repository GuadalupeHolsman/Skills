// THE SONG — "Solo un segundito". Every sound comes from an event in score.js.
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

// bars 0-1 light office groove, 2 hushed, 3-5 frantic time-lapse, 6-8 silence + sfx, 9-10 happy, 11-12 end card hero
const plan = (b) => (b === 0 ? 'light' : b === 1 ? 'full' : b === 2 ? 'light' : b <= 5 ? 'full' : b <= 8 ? 'off' : b <= 10 ? 'full' : b <= 12 ? 'hero' : 'off');
const { kicks } = A.bed(clock, 13, plan, { drums, bass, keys, pad, verb });

// typing
for (const k of sc.keys) fx.addMono(A.key(Math.round(k.t * 100)), k.t, 0.32, k.hand ? 0.35 : 0.1);
// the phone
fx.addMono(A.buzz(0.38, 1), ev.buzz, 0.7, -0.4);
fx.addMono(A.buzz(0.38, 2), ev.buzz2, 0.7, -0.4);
fx.addMono(I.pop(1.2), ev.grab, 0.4, -0.2);
// time-lapse: a clock tick on every hour, a bell at 18:00
for (const h of sc.hourTicks) { fx.addMono(A.tick(1.3), h.t, 0.55, -0.5); if (h.hour === 18) { const d = A.dong(m('G5')); fx.addMono(d, h.t, 0.22, -0.3); verb.addMono(d, h.t, 0.2); } }
for (const c of sc.crew) {
  const tin = sc.hourTicks.find((h) => h.hour === c.arrive).t, tout = sc.hourTicks.find((h) => h.hour === c.leave).t;
  fx.addMono(I.pop(c.x < 500 ? 0.9 : 1.1), tin, 0.3, c.x < 500 ? -0.6 : 0.6);
  fx.addMono(I.noiseSweep(0.3, 800, 3000, { q: 1, pink: true }), tout, 0.25, c.x < 500 ? -0.6 : 0.6);
}
// lights out, then the late hour
fx.addMono(A.clack(), ev.lampL, 0.8, -0.6);
fx.addMono(A.clack(), ev.lampR, 0.8, 0.6);
fx.addMono(A.tick(0.8), ev.late, 0.6, -0.5);
fx.addMono(I.whistle(0.9), ev.late + 0.15, 0.06); // crickets-ish lonely whistle
// the realization
fx.addMono(I.scratch(0.32), ev.scratch, 0.75);
fx.addMono(I.thud(90, 0.08), ev.scratch, 0.5);
// Loomlock
fx.addMono(A.lockClick(), ev.lock, 0.85);
fx.addMono(I.subBoom(1.0), ev.lock, 0.45);
fx.addMono(A.rewind(ev.morning - ev.rewind0), ev.rewind0, 0.45);
fx.addMono(I.crash(18), ev.morning, 0.3);
fx.addMono(I.boing(), ev.morning, 0.3);
// end card: whoosh up, padlock click
fx.addMono(I.noiseSweep(0.35, 400, 5000, { q: 1, pink: true }), ev.end, 0.35);
fx.addMono(I.whistle(0.4), ev.click - 0.45, 0.08);
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
