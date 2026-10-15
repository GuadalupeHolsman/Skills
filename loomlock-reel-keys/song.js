// THE SONG — every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { mtof } = require('./engine/music');
const sc = require('./score');
const { T, BEAT, BAR, DURATION, m, ev, clock, taps, breath } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus(), noise = bus();
const verb = bus(), dly = bus();
const pan = (x) => Math.max(-1, Math.min(1, x));
const inBreath = (t) => t >= breath[0] && t < breath[1];

// ---------- CHAOS: a ping per notification, a phone buzz under it, a riser that gets ugly ----------
sc.pings.forEach((p, i) => {
  const tg = I.ting(p.midi);
  fx.addMono(tg, p.t, 0.22 + 0.1 * (i % 3 === 0), pan(Math.sin(i * 2.3) * 0.7));
  if (i % 4 === 1) fx.addMono(I.pop(1600 + 300 * (i % 5), 10 + i), p.t + BEAT / 4, 0.12, pan(-0.5 + (i % 3) * 0.5));
});
for (let b = 0; b < 2; b++) for (let k = 0; k < (b ? 4 : 2); k++) { // vibrate buzzes: twice, then four times
  const t0 = T(b, k * (b ? 1 : 2) + 0.25), buzz = I.pulse(m('A1'), BEAT * 0.45, { duty: 0.3, decay: 3 });
  noise.addMono(buzz, t0, 0.35, 0);
}
noise.addMono(I.noiseSweep(BAR - BEAT / 2, 400, 9000, { q: 1.4, shape: (x) => x * x, pink: true }), T(1), 0.4);
// a muffled kick pulse under the chaos so it already feels like the song
clock.eachStep(0, 2, 4, (t) => { if (!inBreath(t)) drums.addMono(I.kick({ tail: 0.18 }), t, 0.5); });

// ---------- KEYS: groove from bar 2 ----------
const K = I.kick({ tail: 0.24 }), CL = I.clap(), SN = I.snare(), HC = [I.hat(false, 11), I.hat(false, 12)], HO = I.hat(true, 14), CR = I.crash(18);
const kicks = [];
clock.eachStep(2, 9, 16, (t, b, s) => {
  if (b >= 8 && s > 0) return; // the end bar: one last hit, then it rings
  if (s % 4 === 0) { drums.addMono(K, t, 0.9); kicks.push(t); }
  if (s % 8 === 4) { drums.addMono(CL, t, 0.5); drums.addMono(SN, t, 0.18); verb.addMono(CL, t, 0.18); }
  if (b < 8) { drums.addMono(HC[s % 2], t, s % 2 ? 0.16 : 0.09, -0.3); if (s % 4 === 2) drums.addMono(HO, t, 0.09, 0.3); }
});
clock.eachStep(2, 8, 8, (t, b, s) => {
  const c = sc.chordAt(t); if (!c) return;
  const R = c.bass + 12;
  bass.addMono(I.bass(s % 2 ? R + 12 : R, BEAT / 2 * 0.85, { sub: 0.9, bright: 0.4 }), t, 0.5);
});
bass.addMono(I.bass(m('Ab1'), 2.2, { bright: 0.3, sub: 1 }), T(8), 0.55);
for (const c of sc.chords) {
  if (c.t0 < T(2)) { // chaos: a thin detuned pad, nervous
    for (const n of c.notes) { const { L, R } = I.padNote(n + 12, c.t1 - c.t0 - (c.t1 > breath[0] ? BEAT / 2 : 0), { cutoff: 1800, attack: 0.05, detune: 0.35 }); pad.addStereo(L, R, c.t0, 0.04); }
    continue;
  }
  for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= T(8) ? 1.4 : 0), { cutoff: 2200, attack: 0.03 }); pad.addStereo(L, R, c.t0, 0.075); }
}

// ---------- THE TAP: every key lands on a downbeat with a crisp "click-thunk" + chord bloom ----------
for (const k of taps) {
  fx.addMono(I.noiseSweep(0.28, 600, 5000, { q: 1, pink: true }), k.tIn, 0.16, 0.2); // card whooshes in
  fx.addMono(I.tvClick(), k.t, 0.55);
  fx.addMono(I.thud(120, 0.06), k.t, 0.5);
  fx.addMono(I.pop(2600, 5 + k.i), k.t, 0.22);
  drums.addMono(CR, k.t, k.i === 0 ? 0.4 : 0.22, k.i % 2 ? 0.25 : -0.25);
  const c = sc.chordAt(k.t + 0.01);
  for (const [j, n] of c.notes.entries()) keys.addMono(I.bell(mtof(n + 24), 1.2, 1.4, 3.5), k.t + j * 0.03, 0.05, pan(-0.3 + j * 0.3));
}
// each mode has its own instrument for its motif
for (const n of sc.motifs) {
  if (n.id === 'cine') { const a = I.brassNote(n.midi, n.dur * 0.9, { bright: 0.8 }); lead.addStereo(a.L, a.R, n.t, 0.3); verb.addStereo(a.L, a.R, n.t, 0.08); }
  if (n.id === 'gym') { const a = I.supersaw(n.midi, n.dur * 0.8, { cutoff: 3200, release: 0.08 }); lead.addStereo(a.L, a.R, n.t, 0.16); dly.addStereo(a.L, a.R, n.t, 0.05); }
  if (n.id === 'foco') { const e = I.epiano(n.midi, n.dur); lead.addMono(e, n.t, 0.5, -0.1); lead.addMono(I.epiano(n.midi - 12, n.dur), n.t, 0.25, -0.1); verb.addMono(e, n.t, 0.12); }
  if (n.id === 'dormir') { const mb = I.musicBox(n.midi, { decay: 1.8 }); lead.addMono(mb, n.t, 0.4, 0.1); verb.addMono(mb, n.t, 0.25); dly.addMono(mb, n.t, 0.08); }
}

// ---------- RECAP: the four keys fan out, one marimba note each ----------
for (const r of sc.recap) { const mr = I.marimba(m(['Ab4', 'C5', 'Eb5', 'Ab5'][r.i])); lead.addMono(mr, r.t, 0.5, pan(-0.45 + r.i * 0.3)); fx.addMono(I.paperFwip(1 + r.i * 0.15, 3 + r.i), r.t - 0.02, 0.12); }
fx.addMono(I.noiseSweep(BAR * 0.9, 300, 6000, { q: 0.8, shape: (x) => x * x, pink: true }), T(6, 0.3), 0.22);

// ---------- END: logo lands, bells, the tagline on music-box notes ----------
fx.addMono(I.subBoom(1.6), ev.logo, 0.55);
fx.addMono(I.thud(85, 0.08), ev.logo, 0.5);
drums.addMono(CR, ev.logo, 0.35, 0);
for (const [i, f] of ['Ab5', 'C6', 'Eb6', 'Ab6'].entries()) keys.addMono(I.bell(mtof(m(f)), 1.4, 1.6, 3.5), ev.logo + i * 0.06, 0.08, pan(-0.3 + i * 0.2));
for (const [i, f] of ['Eb6', 'C6', 'Ab5'].entries()) { const mb = I.musicBox(m(f)); keys.addMono(mb, ev.tagline + i * BEAT / 2, 0.16); verb.addMono(mb, ev.tagline + i * BEAT / 2, 0.12); }
fx.addMono(I.pop(1500, 90), ev.cta, 0.2);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks);
const stems = { drums, bass, pad, keys, lead, fx, noise, verb: reverb(verb, { room: 0.8, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.35, 3500) };
const GAIN = { drums: 0.45, bass: 0.7, pad: 2.2, keys: 1.0, lead: 2.2, fx: 0.9, noise: 0.6, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
MIX.gate(mix, breath[0], breath[1]);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -13 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs !== undefined ? M.lufs.toFixed(1) + ' LUFS' : ''})`);
