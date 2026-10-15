// V2 SOUND: saturated → one dry hit → clean ambience. No music in the silence act (brief rule).
const path = require('path');
const { SR, Bus, reverb, Pink, OnePole } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { DURATION, m, ev, cuts } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const pings = bus(), buzz = bus(), riser = bus(), hit = bus(), amb = bus(), verb = bus();

// ---------- RUIDO: every cut is a notification; layers pile up and pan around ----------
cuts.forEach((c, i) => {
  const tg = I.ting(c.midi);
  pings.addMono(tg, c.t, 0.28, Math.sin(i * 1.7) * 0.8);
  verb.addMono(tg, c.t, 0.06);
  if (i % 2) pings.addMono(I.pop(1400 + (i % 5) * 350, i), c.t + 0.06, 0.12, -Math.sin(i) * 0.6);
  if (i > 6) pings.addMono(I.ting(c.midi - 5), c.t + 0.09, 0.16, Math.cos(i) * 0.7); // doubled: it gets denser
  if (i % 3 === 0) buzz.addMono(I.pulse(m('A1'), 0.32, { duty: 0.3, decay: 2 }), c.t, 0.32);
});
riser.addMono(I.noiseSweep(4.0, 300, 9000, { q: 1.6, shape: (x) => x * x * x, pink: true }), ev.black - 4.0, 0.5);
// a low drone that tightens under the chaos
{ const d = I.padNote(m('C2'), ev.black, { cutoff: 900, attack: 0.5, detune: 0.5 }); buzz.addStereo(d.L, d.R, 0, 0.12); }

// ---------- CORTE: a frame of nothing, then ONE dry sound for the tap (no reverb) ----------
hit.addMono(I.noiseSweep(0.5, 2000, 400, { q: 0.7, pink: true }), ev.keyIn, 0.05); // the key, barely heard
hit.addMono(I.tvClick(), ev.tap, 0.7);
hit.addMono(I.thud(95, 0.05), ev.tap, 0.7);
hit.addMono(I.woodTick(0.8), ev.tap, 0.3);

// ---------- SILENCIO: room tone only — soft pink noise, low-passed, breathing very slowly ----------
{ const p = new Pink(4), lp = new OnePole(), lp2 = new OnePole(), t0 = ev.pocket, n = Math.ceil((DURATION - t0) * SR);
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; const env = Math.min(1, t / 1.2) * (0.8 + 0.2 * Math.sin(t * 0.9)); L[i] = lp2.lp(lp.lp(p.next(), 700), 900) * env; }
  amb.addMono(L, t0, 0.5); }
// also a whisper of room under the tap act, so the "silence" before the tap is real silence and after it, air
{ const p = new Pink(9), lp = new OnePole(), n = Math.ceil((ev.pocket - ev.tap) * SR), L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = lp.lp(p.next(), 500) * Math.min(1, i / (SR * 0.4));
  amb.addMono(L, ev.tap + 0.05, 0.25); }

const stems = { pings, buzz, riser, hit, amb, verb: reverb(verb, { room: 0.7, damp: 0.4 }) };
const GAIN = { pings: 1.0, buzz: 0.8, riser: 0.6, hit: 1.3, amb: 0.9, verb: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 30);
MIX.gate(mix, ev.black, ev.tap - 0.001); // true silence from the black frame until the tap (the key whoosh is cut too)
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -14 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs !== undefined ? M.lufs.toFixed(1) + ' LUFS' : ''})`);
