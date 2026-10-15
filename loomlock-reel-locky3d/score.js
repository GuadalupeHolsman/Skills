// LOOMLOCK — "LOCKY TIENE UNA KEY" (9:16, 19 s). Locky as a 3D vinyl toy + an ElevenLabs track,
// beat-analysed into beats.js. The drop of the song (beat 16) is the first slap.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const A = node ? require('./beats.js') : globalThis.ANALYSIS;
  const FPS = 30, FORMAT = '9:16', STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ beats: A.beats, downbeat: 0, beatsPerBar: 4 }); // bar 0 = 0.03 s, bar 4 = THE DROP
  const { T, BEAT, BAR } = clock;
  const DURATION = 19.0;
  const ev = {
    words: [T(0, 0.5), T(1, 0), T(2, 0)],   // ESTE ES LOCKY / Y SU TELÉFONO NO PARA / PERO LOCKY TIENE KEYS
    bonks: [T(1, 1), T(1, 2.5), T(1, 3.5)], // notifications bonk Locky on the head
    cardPop: T(2, 1),                        // the first key appears in his hand
    slowmo: T(3, 2),                         // the jump starts; time slows until the slap
    musicEnd: 16.05, logo: 16.3, tagline: 16.9,
  };
  const MODES = ['cine', 'gym', 'dormir'].map((id, i) => ({ id, i, tap: T(4 + i, 0) }));
  const PH = { explode: 0.75, holdEnd: 1.3, back: 0.45 };
  MODES.forEach((m) => {
    m.obj = m.tap + PH.explode; m.backStart = m.tap + PH.holdEnd; m.phone = m.tap + PH.holdEnd + PH.back;
    m.cardPop = m.i === 0 ? ev.cardPop : MODES[m.i - 1].tap + 1.0;
    m.jump = m.i === 0 ? ev.slowmo : m.tap - 0.42;
  });
  const S = { intro: [0, T(2)], keys: [T(2), MODES[0].tap], drop: [MODES[0].tap, ev.musicEnd], sleep: [ev.musicEnd, DURATION] };
  const markers = {
    pop: ev.cardPop, slowmo: ev.slowmo,
    cine: { t: MODES[0].tap, sync: 'av' }, gym: { t: MODES[1].tap, sync: 'av' }, dormir: { t: MODES[2].tap, sync: 'av' },
    moon: T(6, 2), logo: ev.logo,
  };
  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, ev, MODES, PH, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
