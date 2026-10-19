// LOCKY Y LA LAVA (9:16, ~25s): Locky, un candadito dorado, cruza una cueva volcánica mirando el celular.
// Escalada cómica: se cae a la lava tres veces (cada vez peor), hasta que tiene una idea:
// agranda el celular, lo usa de puente y cruza mirando para adelante. Personaje original.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16'; // Reels / TikTok / Shorts
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 132, offset: 0.4 });
  const { T, BEAT } = clock;
  const DURATION = T(13) + 0.6;

  // the world: the left ledge ends at EDGE, the lava sits a bit lower, the phone-bridge spans the gap
  const GEO = { EDGE: 330, FLOOR: 1300, LAVA: 1360, RIGHT: 790, BRIDGE_TOP: 1235, BRIDGE_END: 890 };

  const ev = {
    off1: T(2), splash1: T(2, 1), launch1: T(2, 3), land1: T(3, 2),
    walk2: T(4), off2: T(4, 2), splash2: T(4, 3), launch2: T(5), peak2: T(5, 1.5), land2: T(5, 3),
    walk3: T(6), off3: T(6, 2), splash3: T(6, 3), scratch: T(7), crawl: T(7, 1), sit: T(7, 3), bwomp: T(7, 2),
    idea: T(8), grow: T(8, 2), tip: T(8, 3.25), bridge: T(9), cross: T(9, 1), win: T(11), end: T(12),
  };
  const S = {
    intro: [0, ev.off1], try1: [ev.off1, ev.walk2], try2: [ev.walk2, ev.walk3], try3: [ev.walk3, ev.idea],
    idea: [ev.idea, ev.bridge], cross: [ev.bridge, ev.win], win: [ev.win, ev.end], end: [ev.end, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' }, G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' },
    Am: { notes: ['E4', 'A4', 'C5'], bass: 'A1' }, F: { notes: ['F4', 'A4', 'C5'], bass: 'F1' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'], [5, 0, 4, 'G'], [6, 0, 4, 'Am'],
    [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 4, 'G'], [11, 0, 4, 'C'], [12, 0, 4, 'F'],
  ]);

  // footsteps while Locky walks (a tick per 8th note): [from, to]
  const walks = [[0, ev.off1], [ev.walk2, ev.off2], [ev.walk3, ev.off3], [ev.cross, ev.win]];
  const steps = [];
  for (const [a, b] of walks) for (let t = a; t < b - 0.05; t += BEAT / 2) steps.push(t);

  // the on-screen words (Spanish, rioplatense)
  const labels = [
    { t: T(0, 2), end: ev.land1, text: 'Intento 1' },
    { t: ev.land1 + BEAT, end: ev.land2, text: 'Intento 2' },
    { t: ev.land2 + BEAT, end: ev.idea, text: 'Intento 3...' },
  ];
  const shouts = [
    { t: ev.launch1, end: ev.land1 - 0.2, text: '¡AAAY!' },
    { t: ev.launch2, end: ev.land2 - 0.3, text: '¡AAAAAAY!' },
  ];
  const celebrate = [ev.win, T(11, 1), T(11, 2), T(11, 3)];

  const markers = {
    splash1: { t: ev.splash1, sync: 'av' }, land1: { t: ev.land1, sync: 'av' },
    splash2: { t: ev.splash2, sync: 'av' }, land2: { t: ev.land2, sync: 'av' },
    splash3: { t: ev.splash3, sync: 'av' }, idea: { t: ev.idea, sync: 'av' },
    bridge: { t: ev.bridge, sync: 'av' }, win: { t: ev.win, sync: 'av' }, end: ev.end,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, GEO, steps, labels, shouts, celebrate, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
