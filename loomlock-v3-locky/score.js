// LOOMLOCK — "LOCKY" v3 (9:16, 19 s). The official Locky (Brandbook §4) as a 3D toy with a toon outline,
// acting to an ElevenLabs track beat-analysed into beats.js. Bar 4 (beat 16, 8.03 s) is the drop = first tap.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const A = node ? require('./beats.js') : globalThis.ANALYSIS;
  const FPS = 30, FORMAT = '9:16', STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ beats: A.beats, downbeat: 0, beatsPerBar: 4 });
  const { T, BEAT, BAR } = clock;
  const DURATION = 19.0;
  const ev = {
    walk: [0.05, T(0, 3)],                   // Locky walks in, four steps on the beats
    wave: T(0, 3),                           // and waves hello
    hello: T(0, 0.5),                        // "Él es Locky."
    drop: T(1, 0),                           // a giant phone lands next to him: BOOM
    startle: T(1, 0) + 0.06,                 // eyes wide, shackle pops OPEN
    bonks: [T(1, 1), T(1, 2.5), T(1, 3.5)],  // notifications bonk his head
    sighIn: T(2, 0), sighOut: T(2, 1.2),     // a deep breath...
    click: T(2, 2),                          // ...and the shackle clicks shut: a decision, not a restriction
    cardPop: T(2, 3),                        // the first key appears in his hand
    slowmo: T(3, 2),                         // the jump starts; time slows until the slap
    yawn: T(6, 1.5),                         // after the moon forms
    musicEnd: 16.05, logo: 16.35, tagline: 16.95,
  };
  const MODES = ['cine', 'gym', 'dormir'].map((id, i) => ({ id, i, tap: T(4 + i, 0) }));
  const PH = { explode: 0.75, holdEnd: 1.3, back: 0.45 };
  MODES.forEach((m) => {
    m.obj = m.tap + PH.explode; m.backStart = m.tap + PH.holdEnd; m.phone = m.tap + PH.holdEnd + PH.back;
    m.cardPop = m.i === 0 ? ev.cardPop : MODES[m.i - 1].tap + 1.0;
    m.jump = m.i === 0 ? ev.slowmo : m.tap - 0.42;
  });
  const S = { intro: [0, T(1)], phone: [T(1), T(2)], decide: [T(2), MODES[0].tap], drop: [MODES[0].tap, ev.musicEnd], sleep: [ev.musicEnd, DURATION] };
  const markers = {
    drop: { t: ev.drop, sync: 'v' }, click: ev.click, slowmo: ev.slowmo,
    cine: { t: MODES[0].tap, sync: 'av' }, gym: { t: MODES[1].tap, sync: 'av' }, dormir: { t: MODES[2].tap, sync: 'av' },
    yawn: ev.yawn, logo: ev.logo,
  };
  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, ev, MODES, PH, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
