// THE MIX — ElevenLabs music + ElevenLabs foley, every sound placed on an event from score.js.
const path = require('path');
const { SR, Bus } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { DURATION, ev, MODES } = sc;

const N = Math.ceil(DURATION * SR);
const f = (n) => path.join(__dirname, 'sfx', n + '.mp3');
const music = MIX.loadAudio(f('music'), { length: DURATION });
const fx = new Bus(N), hits = new Bus(N);
const put = (bus, name, at, gain = 1, maxLen) => {
  const b = MIX.loadAudio(f(name), { at: 0, length: 0 });
  const n = Math.min(b.n, maxLen ? Math.round(maxLen * SR) : b.n), fade = Math.round(0.05 * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { const g = i > n - fade ? (n - i) / fade : 1; L[i] = b.L[i] * g; R[i] = b.R[i] * g; }
  bus.addStereo(L, R, at, gain);
};

// HOOK: the city, a buzz, then the whip into the phone
put(fx, 'city', 0, 0.9);
put(fx, 'buzz', 0.35, 0.8);
put(fx, 'whoosh', ev.whip, 0.9);
// CHAOS: the swarm of notifications, building until time stops
put(fx, 'swarm', ev.cut3d, 0.75, ev.freeze - ev.cut3d + 0.05);
// FREEZE: the suck into silence
put(hits, 'freeze', ev.freeze - 0.05, 0.9);
// each TAP: card whoosh in, the slam (on the beat), shatter swirl, cubes assembling
for (const m of MODES) {
  put(fx, 'whoosh', m.tap - 0.62, m.i === 0 ? 0.8 : 0.4, 0.5);
  hits.addMono(I.tvClick(), m.tap, 0.6); // a sharp transient exactly on the frame of contact
  put(hits, 'tap', m.tap, 1.0);
  put(fx, 'shatter', m.tap + 0.02, 0.6, 1.2);
  put(fx, 'assemble', m.obj - 0.55, 0.55);
  put(fx, 'assemble', m.backStart, 0.35, 0.38);
}
put(fx, 'popcorn', MODES[0].obj - 0.1, 0.7, 1.1);
put(fx, 'clank', MODES[1].obj - 0.05, 0.8);
put(fx, 'sleep', MODES[3].obj - 0.2, 0.7);
// LOGO
hits.addMono(I.tvClick(), ev.logo, 0.4);
put(hits, 'logo', ev.logo, 1.0);
put(fx, 'shatter', ev.logo + 0.02, 0.45, 1.0);

// the music stops dead for the freeze, and sits a little under the foley
MIX.gate(music, ev.freeze, MODES[0].tap - 0.002);
for (const m of MODES.slice(1)) MIX.gate(music, m.tap - 0.08, m.tap - 0.002); // an air pocket before each slap
music.applyGain((t) => 0.8);
const stems = { music, fx, hits };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, { music: 1, fx: 0.9, hits: 1 }, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -12 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs !== undefined ? M.lufs.toFixed(1) + ' LUFS' : ''})`);
