// LOOMLOCK REEL V1 (9:16): "Una key, un trabajo." A musical explainer.
// The phone does EVERYTHING (notifications ping on 8ths) → each NFC key, tapped on a downbeat,
// transforms the phone into a single-job mode (Cine, Gym, Foco, Dormir) → recap fan → logo.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 108, offset: 0.25 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(9) + 1.6; // ≈ 21.6 s

  const KEY_ORDER = ['cine', 'gym', 'foco', 'dormir'];
  // bar 0-1: chaos. bars 2..5: one key per bar (tap on the downbeat). bar 6: breath + recap. bar 7-8: end.
  const taps = KEY_ORDER.map((id, i) => ({ id, i, t: T(2 + i), tIn: T(1 + i, 2.5) }));

  const S = { chaos: [0, T(2)], keys: [T(2), T(6)], recap: [T(6), T(7)], end: [T(7), DURATION] };

  const { chords, chordAt } = makeChords(clock, {
    Fm: { notes: ['F3', 'Ab3', 'C4'], bass: 'F1' }, Db: { notes: ['F3', 'Ab3', 'Db4'], bass: 'Db2' },
    Ab: { notes: ['Eb3', 'Ab3', 'C4'], bass: 'Ab1' }, Eb: { notes: ['Eb3', 'G3', 'Bb3'], bass: 'Eb2' },
    Bbm: { notes: ['F3', 'Bb3', 'Db4'], bass: 'Bb1' }, Absus: { notes: ['Eb3', 'Ab3', 'Db4'], bass: 'Ab1' },
    Abadd9: { notes: ['C4', 'Eb4', 'Ab4', 'Bb4'], bass: 'Ab1' },
  }, [
    [0, 0, 4, 'Fm'], [1, 0, 4, 'Db'],
    [2, 0, 4, 'Ab'], [3, 0, 4, 'Eb'], [4, 0, 4, 'Fm'], [5, 0, 4, 'Db'],
    [6, 0, 4, 'Bbm'], [7, 0, 2, 'Absus'], [7, 2, 2, 'Eb'], [8, 0, 4, 'Abadd9'],
  ]);

  // CHAOS: notification pings — 8ths in bar 0, 16ths in bar 1 (it gets worse), each one a new card
  const pings = [];
  { const r = U.mulberry32(7); const scale = ['C5', 'Eb5', 'F5', 'Ab5', 'Bb5', 'C6', 'Db6'];
    for (let s = 0; s < 8; s++) pings.push({ t: T(0, s / 2), midi: m(scale[Math.floor(r() * 7)]) });
    for (let s = 0; s < 14; s++) pings.push({ t: T(1, s / 4), midi: m(scale[Math.floor(r() * 7)]) }); }
  const breath = [T(1, 3.5), T(2)]; // an 8th of silence before the first tap

  // each key's motif (8th grid) — one melodic idea per mode, rising through the bars
  const MOTIF = {
    cine: [['Ab4', 0, 1], ['C5', 1, 1], ['Eb5', 2, 2], ['C5', 5, 1], ['Eb5', 6, 2]],
    gym: [['G4', 0, 1], ['Bb4', 1, 1], ['Eb5', 2, 1], ['G5', 3, 1], ['Eb5', 4, 1], ['Bb4', 5, 1], ['G5', 6, 2]],
    foco: [['F4', 0, 2], ['Ab4', 2, 2], ['C5', 4, 4]],
    dormir: [['Db5', 0, 2], ['C5', 2, 2], ['Ab4', 4, 4]],
  };
  const motifs = taps.flatMap((k) => placeBar(clock, MOTIF[k.id], 2 + k.i).map((n) => ({ ...n, id: k.id })));

  const recap = KEY_ORDER.map((id, i) => ({ id, i, t: T(6, i * 0.5 + 0.5) })); // keys fan out on 8ths
  const ev = { logo: T(7), tagline: T(7, 1), cta: T(7, 3), recapHit: T(6) };

  const captions = [
    { t: 0.12, end: T(1, 0), text: 'Tu teléfono hace TODO.' },
    { t: T(1, 0), end: T(1, 3.4), text: 'Todo. El. Tiempo.' },
    ...taps.map((k) => ({ t: k.t, end: k.t + BAR - 0.08, text: ['Key Cine: solo la peli.', 'Key Gym: solo tu rutina.', 'Key Foco: solo tu trabajo.', 'Key Dormir: solo la alarma.'][k.i], id: k.id })),
    { t: T(6, 0.5), end: T(7) - 0.1, text: 'Una key para cada momento.' },
  ];

  const markers = {
    chaos2: T(1),
    breath: breath[0],
    cine: { t: taps[0].t, sync: 'av' }, gym: { t: taps[1].t, sync: 'av' },
    foco: { t: taps[2].t, sync: 'av' }, dormir: { t: taps[3].t, sync: 'av' },
    recap: T(6, 0.5), logo: { t: ev.logo, sync: 'av' }, cta: ev.cta,
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, KEY_ORDER, taps, pings, breath, motifs, recap, ev, captions, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
