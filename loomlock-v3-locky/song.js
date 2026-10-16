// THE MIX — ElevenLabs music + foley + Locky's little voice, every sound on an event from score.js.
const path = require('path');
const { SR, Bus } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { DURATION, ev, MODES } = sc;
const N = Math.ceil(DURATION * SR);
const f = (n) => path.join(__dirname, 'sfx', n + '.mp3');
const music = MIX.loadAudio(f('music'), { length: DURATION });
const fx = new Bus(N), hits = new Bus(N), voice = new Bus(N);
const put = (bus, name, at, gain = 1, maxLen) => {
  const b = MIX.loadAudio(f(name), { length: 0 });
  const n = Math.min(b.n, maxLen ? Math.round(maxLen * SR) : b.n), fade = Math.round(0.05 * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { const g = i > n - fade ? (n - i) / fade : 1; L[i] = b.L[i] * g; R[i] = b.R[i] * g; }
  bus.addStereo(L, R, at, gain);
};
put(fx, 'steps', ev.walk[0] + 0.1, 0.7);
put(fx, 'wave', ev.wave, 0.6);
put(hits, 'drop', ev.drop - 0.04, 1.0);
hits.addMono(I.thud(70, 0.12), ev.drop, 0.8);
put(fx, 'unlock', ev.startle, 0.8);
put(fx, 'swarm', ev.drop + 0.1, 0.4, ev.click - ev.drop);
put(voice, 'sigh', ev.sighIn, 0.85);
put(hits, 'lockclick', ev.click, 1.0);
put(voice, 'yawn', ev.yawn, 0.8);
put(voice, 'munch', MODES[0].obj + 0.65, 0.7);
for (const t of ev.bonks) put(fx, 'bonk', t, 0.8);
for (const m of MODES) {
  put(fx, 'pop', m.cardPop, 0.8);
  put(fx, 'whoosh', m.tap - 0.62, 0.45, 0.5);
  hits.addMono(I.tvClick(), m.tap, 0.9);
  hits.addMono(I.thud(110, 0.05), m.tap, 0.8);
  put(hits, 'tap', m.tap, 1.0);
  put(hits, 'slap', m.tap, 0.6);
  put(fx, 'shatter', m.tap + 0.18, 0.35, 1.0);
  put(fx, 'assemble', m.obj - 0.55, 0.5);
  if (m.i < 2) put(fx, 'assemble', m.backStart, 0.3, 0.6);
}
put(hits, 'freeze', ev.slowmo - 0.05, 0.5, 1.0); // the slow-motion jump
put(fx, 'popcorn', MODES[0].obj - 0.1, 0.65, 1.1);
put(voice, 'yay', MODES[0].obj + 0.1, 0.8);
put(fx, 'clank', MODES[1].obj - 0.05, 0.75);
put(voice, 'grunt', MODES[1].obj + 0.05, 0.75);
put(fx, 'sleep', MODES[2].obj - 0.2, 0.7);
put(voice, 'snore', ev.musicEnd + 0.15, 0.9);
put(voice, 'snore', ev.musicEnd + 2.3, 0.6, 0.6);
put(fx, 'sleep', ev.logo + 0.1, 0.4);
MIX.gate(music, ev.musicEnd, DURATION);
for (const m of MODES) MIX.gate(music, m.tap - 0.08, m.tap - 0.002); // an air pocket before each slap
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown({ music, fx, hits, voice }, { music: 0.85, fx: 0.9, hits: 1, voice: 1 }, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: -12 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
