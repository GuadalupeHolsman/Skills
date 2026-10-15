// LOOMLOCK — "LA KEY LO CAMBIA TODO" (9:16, 20 s). 3D CGI + a photoreal FOOH hook.
// The music is a real ElevenLabs track (sfx/music.mp3), beat-analysed into beats.js: every event
// below is locked to ITS beats, so the drop of the song IS the first tap.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const A = node ? require('./beats.js') : globalThis.ANALYSIS;

  const FPS = 30;
  const FORMAT = '9:16';
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ beats: A.beats, downbeat: A.downbeat, beatsPerBar: A.meter });
  const { T, BEAT, BAR } = clock; // bar 0 = 0.778 s (the build starts); bar 4 = 8.777 s (THE DROP)
  const DURATION = 20.0;

  const ev = {
    hookWords: [T(0, 0), T(0, 1)],      // "TU TELÉFONO" / "HACE TODO."
    whip: T(1, 0) - 0.45,                // the whip-zoom into the photo's phone screen
    cut3d: T(1, 0),                      // match-cut into the 3D phone
    chaosWords: [T(2, 0), T(2, 1), T(2, 2)], // "TODO." "EL." "TIEMPO."
    freeze: T(3, 1),                     // time stops; the music is cut
    question: T(3, 1) + 0.25,            // "¿Y SI HICIERA UNA SOLA COSA?"
    logo: T(8, 0),                       // the phone becomes the Loomlock mark
    tagline: T(8, 1), tagline2: T(8, 2.5),
  };
  // one key per bar of the drop; the first tap IS the drop
  const MODES = ['cine', 'gym', 'foco', 'dormir'].map((id, i) => ({ id, i, tap: T(4 + i, 0) }));
  // per-mode cube timing (relative to the tap)
  const PH = { explode: 0.75, holdEnd: 1.3, back: 0.45 };
  MODES.forEach((m) => { m.obj = m.tap + PH.explode; m.backStart = m.tap + PH.holdEnd; m.phone = m.tap + PH.holdEnd + PH.back; m.cardIn = m.i === 0 ? ev.freeze + 0.1 : m.tap - 0.55; });

  const S = { hook: [0, ev.cut3d], chaos: [ev.cut3d, ev.freeze], freeze: [ev.freeze, MODES[0].tap], drop: [MODES[0].tap, ev.logo], logo: [ev.logo, DURATION] };

  const markers = {
    cut3d: { t: ev.cut3d, sync: 'v' },
    freeze: ev.freeze,
    cine: { t: MODES[0].tap, sync: 'av' }, gym: { t: MODES[1].tap, sync: 'av' },
    foco: { t: MODES[2].tap, sync: 'av' }, dormir: { t: MODES[3].tap, sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };
  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, ev, MODES, PH, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
