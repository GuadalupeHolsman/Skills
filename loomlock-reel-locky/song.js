// V3 SONG — bouncy 132 BPM, cartoon SFX; the band stops dead for round 3 and comes back for the logo.
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { mtof } = require('./engine/music');
const sc = require('./score');
const { T, BEAT, BAR, DURATION, m, ev, clock, ROUNDS } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus(), verb = bus(), dly = bus();
const pan = (x) => Math.max(-1, Math.min(1, x));
const bandOn = (t) => t < ev.scratch || t >= ev.logo; // round 3 = no band

const K = I.kick({ tail: 0.2 }), CL = I.clap(), HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18);
const kicks = [];
clock.eachStep(0, 9, 8, (t, b, s) => {
  if (!bandOn(t) || (b >= 8 && s > 0)) return;
  if (s % 2 === 0) { drums.addMono(K, t, b === 0 ? 0.6 : 0.85); kicks.push(t); }
  if (s % 4 === 2 && b > 0) { drums.addMono(CL, t, 0.45); verb.addMono(CL, t, 0.15); }
  drums.addMono(HC[s % 2], t, s % 2 ? 0.14 : 0.08, 0.3);
});
clock.eachStep(0, 9, 8, (t, b, s) => {
  if (!bandOn(t) || (b >= 8 && s > 0)) return;
  const c = sc.chordAt(t); if (!c) return;
  if (s % 2 === 0 || s === 7) lead.addMono(I.pizz(c.bass + 24 + (s === 4 ? 7 : 0)), t, 0.3, -0.15); // bouncy pizz bass
  if (s % 2 === 0) bass.addMono(I.bass(c.bass + 12, BEAT * 0.45, { sub: 0.8 }), t, 0.45);
});
bass.addMono(I.bass(m('C2'), 2.0, { sub: 1 }), ev.logo, 0.5);
for (const c of sc.chords) {
  const t1 = c.t0 < ev.scratch && c.t1 > ev.scratch ? ev.scratch : c.t1;
  const lull = c.t0 >= ROUNDS[2].tap && c.t0 < ev.logo;
  for (const n of c.notes) { const { L, R } = I.padNote(n, t1 - c.t0 + (c.t0 >= T(8) ? 1.3 : 0), lull ? { cutoff: 900, attack: 0.6, release: 1.2 } : { cutoff: 1800, attack: 0.04 }); pad.addStereo(L, R, c.t0, lull ? 0.06 : 0.05); }
}
for (const n of sc.hook) if (bandOn(n.t)) { const mr = I.marimba(n.midi); lead.addMono(mr, n.t, 0.55, 0.15); dly.addMono(mr, n.t, 0.06); }
for (const n of sc.modeBars) {
  if (n.id === 'cine') { const a = I.brassNote(n.midi, n.dur * 0.9, { stab: n.dur < 0.3 }); lead.addStereo(a.L, a.R, n.t, 0.28); verb.addStereo(a.L, a.R, n.t, 0.06); }
  else { const a = I.supersaw(n.midi, n.dur * 0.7, { cutoff: 3000, release: 0.06 }); lead.addStereo(a.L, a.R, n.t, 0.15); }
}

// ---------- the rounds: pull (paper fwip + pop), wind-up (rising whistle), SLAP ----------
for (const r of ROUNDS) {
  fx.addMono(I.paperFwip(1.1 + r.r * 0.1, 3 + r.r), r.pull, 0.25, -0.2);
  fx.addMono(I.pop(1300 + r.r * 300, 20 + r.r), r.pull + 0.03, 0.25, -0.2);
  fx.addMono(I.whistle(r.tap - r.wind - 0.05), r.wind, 0.1 + r.r * 0.04, 0.1);
  fx.addMono(I.thwack(), r.tap, 0.55 + r.r * 0.1);
  fx.addMono(I.tvClick(), r.tap, 0.45);
  if (r.r < 2) { drums.addMono(CR, r.tap, 0.3 + r.r * 0.1, 0); fx.addMono(I.subBoom(0.9 + r.r * 0.5), r.tap, 0.3 + r.r * 0.15); }
  else for (const [j, f] of ['C6', 'E6', 'G6'].entries()) keys.addMono(I.bell(mtof(m(f)), 1.4, 1.2, 3.5), r.tap + j * 0.05, 0.06, pan(-0.3 + j * 0.3)); // round 3: soft chime, no boom
}
// round 1: popcorn pops; round 2: a boing per squat
for (const p of sc.popcorn.slice(0, 14)) fx.addMono(I.pop(1600 + p.s * 900, Math.floor(p.d * 100)), ROUNDS[0].tap + 0.1 + p.d * 1.3, 0.09, pan(p.x * 2 - 1));
for (const [i, t] of sc.squats.entries()) fx.addMono(I.boing(), t, 0.14, pan(-0.2 + i * 0.13));
// round 3: the record scratch, then a lullaby and snores
fx.addMono(I.scratch ? I.scratch() : I.noiseSweep(0.3, 3000, 300, { q: 2 }), ev.scratch, 0.5);
for (const n of sc.lullaby) { const mb = I.musicBox(n.midi, { decay: 2 }); keys.addMono(mb, n.t, 0.3, 0.1); verb.addMono(mb, n.t, 0.3); }
for (const z of sc.zzz) fx.addMono(I.bwomp(), z, 0.08, 0.2);
// the logo: the band comes back
fx.addMono(I.subBoom(1.6), ev.logo, 0.55);
drums.addMono(CR, ev.logo, 0.4, 0);
for (const [i, f] of ['C6', 'E6', 'G6', 'C7'].entries()) keys.addMono(I.bell(mtof(m(f)), 1.3, 1.5, 3.5), ev.logo + i * 0.06, 0.07, pan(-0.3 + i * 0.2));
for (const [i, f] of ['G5', 'A5', 'C6'].entries()) { const mr = I.marimba(m(f)); lead.addMono(mr, ev.tagline + i * BEAT / 2, 0.5); }
fx.addMono(I.pop(1500, 90), ev.cta, 0.2);

MIX.sidechain([pad, bass], kicks, { depth: 0.4 });
const stems = { drums, bass, pad, keys, lead, fx, verb: reverb(verb, { room: 0.8, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3500) };
const GAIN = { drums: 0.42, bass: 0.6, pad: 2.0, keys: 1.0, lead: 1.5, fx: 0.9, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
MIX.fadeOut(mix, DURATION - 1.0, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -13 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs !== undefined ? M.lufs.toFixed(1) + ' LUFS' : ''})`);
