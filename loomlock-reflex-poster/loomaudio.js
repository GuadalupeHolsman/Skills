// Shared sound for the Circulito films: cartoon SFX + a bouncy coworking music bed.
// Required from each film's song.js as require('./loomaudio').
const { SR, Bus, Sine, SVF, OnePole, rng } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const { m } = require('./engine/music');

const buf = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)));
const norm = (out, pk = 0.9) => { let p = 0; for (const v of out) p = Math.max(p, Math.abs(v)); if (p > 0) for (let i = 0; i < out.length; i++) out[i] *= pk / p; return out; };

// phone vibrating on a wooden desk: a low motor buzz, amplitude-modulated, with desk rattle
function buzz(len = 0.42, seed = 1) {
  const out = buf(len), w = rng(seed), bp = new SVF();
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, u = i / out.length;
    ph += 165 / SR;
    const sq = (ph % 1) < 0.5 ? 1 : -1;
    const am = 0.55 + 0.45 * Math.sin(2 * Math.PI * 28 * t);
    const env = Math.min(1, t / 0.01) * Math.min(1, (1 - u) / 0.08);
    out[i] = (Math.tanh(sq * 0.8) * 0.7 + bp.bp(w(), 900, 2) * 0.6) * am * env;
  }
  return norm(out, 0.8);
}
// a crisp key click
function key(seed = 1) {
  const out = buf(0.045), w = rng(seed), hp = new OnePole();
  for (let i = 0; i < out.length; i++) { const u = i / out.length; out[i] = hp.hp(w(), 1800) * Math.exp(-u * 7); }
  return norm(out, 0.7);
}
// clock tick (bright wood)
const tick = (pitch = 1) => I.woodTick(pitch);
// light switch clack
function clack(seed = 3) {
  const a = I.tvClick(), b = I.thud(140, 0.05), out = buf(0.15);
  for (let i = 0; i < out.length; i++) out[i] = (a[i] || 0) * 0.8 + (b[i] || 0) * 0.6;
  return norm(out, 0.8);
}
// the Loomlock padlock: a metallic two-stage "cli-CLACK"
function lockClick() {
  // one decisive CLACK at t=0 (so it lands on the beat), a small rattle after
  const out = buf(0.5), w = rng(77), bp = new SVF(), bp2 = new SVF();
  const hit = (i0, f, g, dec) => { for (let i = 0; i < out.length - i0; i++) { const t = i / SR; const n = w(); out[i0 + i] += (bp.bp(n, f, 6) * 0.8 + Math.sin(2 * Math.PI * f * 1.51 * t) * 0.25) * g * Math.exp(-t / dec); } };
  hit(0, 2100, 1, 0.05);
  hit(Math.round(0.035 * SR), 3200, 0.25, 0.012);
  for (let i = 0; i < out.length; i++) { const t = i / SR; out[i] += bp2.bp(w(), 5200, 12) * 0.3 * Math.exp(-t / 0.16) * Math.min(1, t / 0.004); }
  return norm(out, 0.9);
}
// tape rewind: chirpy squeal rising
function rewind(len = 1.4) {
  const out = buf(len), w = rng(5), bp = new SVF();
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const u = i / out.length, t = i / SR;
    const f = 300 + 2600 * u * u + Math.sin(2 * Math.PI * 11 * t) * 120;
    ph += f / SR;
    out[i] = (Math.sin(2 * Math.PI * ph) * 0.4 + bp.bp(w(), f * 1.6, 3) * 0.5) * Math.min(1, u * 8) * Math.min(1, (1 - u) * 10);
  }
  return norm(out, 0.7);
}
// rubbery stretch: a wobbly rising whistle
function stretch(len = 0.8, f0 = 200, f1 = 700) {
  const out = buf(len);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const u = i / out.length, t = i / SR;
    const f = f0 * Math.pow(f1 / f0, u) * (1 + 0.04 * Math.sin(2 * Math.PI * 9 * t));
    ph += f / SR;
    const s = Math.sin(2 * Math.PI * ph) + 0.3 * Math.sin(4 * Math.PI * ph);
    out[i] = s * Math.min(1, u * 10) * Math.min(1, (1 - u) * 6);
  }
  return norm(out, 0.6);
}
// deflate: a balloon losing air, pitch falling
function deflate(len = 0.6, seed = 2) {
  const out = buf(len), w = rng(seed), bp = new SVF();
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const u = i / out.length, f = 900 * Math.pow(0.25, u);
    ph += f / SR;
    out[i] = (bp.bp(w(), f * 2, 4) * 0.7 + Math.sign(Math.sin(2 * Math.PI * ph)) * 0.15) * Math.min(1, u * 20) * (1 - u);
  }
  return norm(out, 0.7);
}
// a tiny cartoon giggle: quick vowel blips going down
function giggle(seed = 1) {
  const out = buf(0.7);
  const notes = [m('A5'), m('F5'), m('G5'), m('D5'), m('E5')];
  notes.forEach((n, k) => { const v = I.voice(n, 0.1, { syl: 'e', type: 'alto', seed: seed + k, vib: 0 }); const i0 = Math.round(k * 0.12 * SR); for (let i = 0; i < v.length && i0 + i < out.length; i++) out[i0 + i] += v[i]; });
  return norm(out, 0.6);
}
// cuckoo-ish "dong" for the hour
const dong = (midi = m('C6')) => I.bell(440 * Math.pow(2, (midi - 69) / 12), 1.2, 2.4, 1.4);

// ---------- the music bed ----------
// 140 BPM bouncy pizz + marimba + light kit, C major: C Am F G (one chord per bar).
// plan(bar) -> 'off' | 'light' | 'full' | 'tick' | 'dreamy' | 'hero'
const PROG = [['C', 48, [60, 64, 67]], ['Am', 45, [57, 60, 64]], ['F', 41, [57, 60, 65]], ['G', 43, [55, 59, 62]]];
const HOOK = [[72, 0, 1], [76, 1, 1], [79, 2, 1], [76, 3, 1], [77, 4, 2], [76, 6, 1], [74, 7, 1]];
const HOOK2 = [[72, 0, 2], [71, 2, 1], [72, 3, 1], [74, 4, 2], [67, 6, 2]];
function bed(clock, bars, plan, { drums, bass, keys, pad, verb }, opts = {}) {
  const { T, BEAT } = clock;
  const kicks = [];
  const K = I.kick({ punch: 0.8 }), CL = I.clap(), HC = I.hat(false, 11), SH = I.shaker(1, 15);
  for (let b = 0; b < bars; b++) {
    const mode = plan(b);
    if (mode === 'off') continue;
    const [, root, triad] = PROG[(b + (opts.shift || 0)) % 4];
    const tr = mode === 'dreamy' ? -0.35 : 0; // detuned, woozy
    for (let s = 0; s < 8; s++) {
      const t = T(b, s / 2);
      if (mode === 'tick') { if (s % 2 === 0) drums.addMono(I.woodTick(s % 4 === 0 ? 1.25 : 1), t, 0.35); continue; }
      // drums
      if (mode === 'full' || mode === 'hero') {
        if (s === 0 || s === 4 || (mode === 'hero' && s === 6)) { drums.addMono(K, t, 0.9); kicks.push(t); }
        if (s === 2 || s === 6) { drums.addMono(CL, t, 0.5); verb.addMono(CL, t, 0.2); }
        drums.addMono(s % 2 ? SH : HC, t, 0.16, s % 2 ? 0.3 : -0.3);
      } else if (mode === 'light') {
        if (s % 2 === 1) drums.addMono(SH, t, 0.12, 0.3);
      }
      // pizz bass on 8ths: root, fifth bounce
      if (mode !== 'dreamy' || s % 4 === 0) {
        const n = s % 4 === 0 ? root : s % 4 === 2 ? root + 7 : root + 12;
        if (s % 2 === 0 || mode === 'full' || mode === 'hero') bass.addMono(I.pizz(n + tr, { seed: s + 1 }), t, mode === 'light' ? 0.45 : 0.6);
      }
    }
    // hook on marimba (full/light) or brass (hero)
    const hook = b % 2 === 0 ? HOOK : HOOK2;
    for (const [n, st, d] of hook) {
      const t = T(b, st / 2);
      if (mode === 'hero') { const a = I.brassNote(n, d * BEAT / 2 * 0.95); keys.addStereo(a.L, a.R, t, 0.28); verb.addStereo(a.L, a.R, t, 0.1); }
      else if (mode === 'full' || mode === 'light') { const x = I.marimba(n, { thock: 0.2 }); keys.addMono(x, t, mode === 'light' ? 0.32 : 0.4, ((st % 4) - 1.5) * 0.25); verb.addMono(x, t, 0.12); }
      else if (mode === 'dreamy') { const x = I.musicBox(n + tr - 12); keys.addMono(x, t, 0.3); verb.addMono(x, t, 0.35); }
    }
    // pads
    if (mode === 'dreamy' || mode === 'hero' || mode === 'full') {
      for (const n of triad) { const { L, R } = I.padNote(n + tr, T(b + 1) - T(b), { cutoff: mode === 'dreamy' ? 900 : 1800, attack: mode === 'dreamy' ? 0.4 : 0.05, release: 0.3 }); pad.addStereo(L, R, T(b), mode === 'dreamy' ? 0.1 : 0.06); }
    }
  }
  return { kicks };
}

// ---------- minimal electronic bed (adult, understated) ----------
// F minor: Fm9 Dbmaj7 Abmaj7 Eb(add9), one chord per bar.
// plan(bar) -> 'off' | 'keys' | 'build' | 'drive' | 'calm'
const PROG2 = [[41, [56, 60, 63, 67]], [37, [56, 60, 65, 68]], [44, [55, 60, 63, 67]], [39, [55, 58, 63, 65]]];
function minimal(clock, bars, plan, { drums, bass, keys, pad, verb }) {
  const { T, BEAT } = clock;
  const kicks = [];
  const K = I.kick({ punch: 0.45, tail: 0.6 }), HC = [I.hat(false, 21), I.hat(false, 22)], HO = I.hat(true, 23), RIM = I.rim(1, 3);
  for (let b = 0; b < bars; b++) {
    const mode = plan(b);
    if (mode === 'off') continue;
    const [root, chord] = PROG2[b % 4];
    // e-piano: a held chord on 1, a short echo on the "and" of 2
    for (const [beat, dur, g] of [[0, BEAT * 1.6, 0.16], [1.5, BEAT * 0.5, 0.09]]) {
      if (mode === 'drive' && beat === 1.5) continue;
      for (const n of chord) { const x = I.epiano(n, dur, { index: 0.9, decay: 1.2 }); keys.addMono(x, T(b, beat), g, (n % 5 - 2) * 0.15); verb.addMono(x, T(b, beat), g * 0.5); }
    }
    // airy pad under everything but keys-only bars
    if (mode !== 'keys') for (const n of chord.slice(0, 3)) { const { L, R } = I.padNote(n - 12, T(b + 1) - T(b), { cutoff: 700, attack: 0.3, release: 0.4 }); pad.addStereo(L, R, T(b), 0.05); }
    if (mode === 'keys') continue;
    // sub bass
    for (const [beat, d] of [[0, 1.4], [2.5, 1.2]]) bass.addMono(I.bass(root, BEAT * d, { bright: 0.08, sub: 1 }), T(b, beat), 0.55);
    for (let s = 0; s < 16; s++) {
      const t = T(b, s / 4);
      if ((mode === 'build' || mode === 'drive') && s % 4 === 0) { drums.addMono(K, t, 0.8); kicks.push(t); }
      if ((mode === 'build' || mode === 'drive') && (s === 4 || s === 12)) drums.addMono(RIM, t, 0.35, 0.15);
      if (s % 4 === 2) drums.addMono(mode === 'drive' ? HO : HC[0], t, mode === 'calm' ? 0.12 : 0.16, 0.3);
      else if (mode === 'drive' && s % 2 === 1) drums.addMono(HC[s % 4 === 1 ? 0 : 1], t, 0.07 + 0.03 * (s % 4 === 3), -0.25);
    }
  }
  return { kicks };
}
// a soft modern notification chime (two sine partials)
function chime(midi = 84, len = 0.35) {
  const out = buf(len), f = 440 * Math.pow(2, (midi - 69) / 12);
  for (let i = 0; i < out.length; i++) { const t = i / SR; out[i] = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t / 0.09) * Math.min(1, t / 0.002); }
  return norm(out, 0.6);
}

module.exports = { buzz, key, tick, clack, lockClick, rewind, stretch, deflate, giggle, dong, bed, norm, buf, minimal, chime };
