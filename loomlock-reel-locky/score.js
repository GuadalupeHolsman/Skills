// LOOMLOCK REEL V3 (9:16): "Locky tiene una key para todo." Comic escalation with the mascot.
// Three rounds, each bigger: pull a key → wind-up → SLAP it on the phone → the phone becomes that mode
// and Locky lives it (popcorn / squats). Round 3 (Dormir): record-scratch stop, the tap in silence,
// a lullaby — Locky falls asleep. Then the band comes back for the logo.
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
  const clock = makeClock({ bpm: 132, offset: 0.2 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(9) + 1.4; // ≈ 18 s

  const ROUNDS = ['cine', 'gym', 'dormir'].map((id, r) => ({
    id, r, pull: T(1 + 2 * r, 0), wind: T(1 + 2 * r, 2), tap: T(2 + 2 * r, 0), end: T(3 + 2 * r, 0),
  }));
  const ev = { wave: T(0, 0), scratch: T(5, 3.5), logo: T(8, 0), tagline: T(8, 1), cta: T(8, 3) };
  const S = { intro: [0, T(1)], r1: [T(1), T(3)], r2: [T(3), T(5)], r3: [T(5), T(8)], end: [T(8), DURATION] };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' },
    F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' }, Cadd9: { notes: ['E4', 'G4', 'C5', 'D5'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'Am'], [2, 0, 4, 'F'], [3, 0, 4, 'G'], [4, 0, 4, 'C'], [5, 0, 4, 'Am'],
    [6, 0, 4, 'Fmaj7'], [7, 0, 4, 'Fmaj7'], [8, 0, 4, 'Cadd9'],
  ]);

  // the bouncy hook on marimba: bar 0 (intro), round bars echo it a step higher each time
  const HOOK = [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['E5', 3, 1], ['A5', 4, 2], ['G5', 6, 2]];
  const hook = [0, 1, 3, 5].flatMap((b, i) => placeBar(clock, HOOK, b, [0, 0, 2, 4][i]));
  // after each tap: that mode's bar (r = 0 cine, 1 gym)
  const CINE = [['G5', 0, 1], ['G5', 1, 1], ['A5', 2, 2], ['C6', 4, 4]];
  const GYM = [['C5', 0, 1], ['C5', 1, 1], ['C5', 2, 1], ['G5', 3, 1], ['C5', 4, 1], ['C5', 5, 1], ['A5', 6, 2]];
  const modeBars = [...placeBar(clock, CINE, 2).map((n) => ({ ...n, id: 'cine' })), ...placeBar(clock, GYM, 4).map((n) => ({ ...n, id: 'gym' }))];
  // the lullaby (round 3, bars 6-7): music box, slow
  const LULL = [['E5', 0, 2], ['C5', 2, 2], ['A4', 4, 4]];
  const LULL2 = [['G4', 0, 2], ['A4', 2, 2], ['C5', 4, 4]];
  const lullaby = [...placeBar(clock, LULL, 6), ...placeBar(clock, LULL2, 7)];
  const squats = [0, 1, 2, 3].map((b) => T(4, b)); // gym: one squat per beat
  const zzz = [0, 1, 2, 3, 4].map((i) => T(6, 1.5 + i * 1.25));
  const popcorn = [];
  { const r = U.mulberry32(5); for (let i = 0; i < 40; i++) popcorn.push({ x: r(), d: r() * 1.2, s: 0.7 + r() * 0.6, spin: (r() - 0.5) * 8 }); }

  const captions = [
    { t: 0.15, end: T(1) - 0.05, text: 'Locky tiene una key para todo.' },
    { t: ROUNDS[0].tap, end: T(3) - 0.05, text: '¿Peli? Key Cine.' },
    { t: ROUNDS[1].tap, end: T(5) - 0.05, text: '¿Gym? Key Gym.' },
    { t: ROUNDS[2].tap, end: T(8) - 0.05, text: '¿Dormir? Key Dormir.' },
  ];

  const markers = {
    cine: { t: ROUNDS[0].tap, sync: 'av' }, gym: { t: ROUNDS[1].tap, sync: 'av' },
    scratch: ev.scratch, dormir: { t: ROUNDS[2].tap, sync: 'av' },
    logo: { t: ev.logo, sync: 'av' }, cta: ev.cta,
  };
  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ROUNDS, ev, hook, modeBars, lullaby, squats, zzz, popcorn, captions, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
