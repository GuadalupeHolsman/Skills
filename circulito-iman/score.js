// CIRCULITO — "El imán" (Loomlock). The phone pulls him like a magnet; Loomlock switches it off.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 140, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(12) + 0.6;

  const ev = {
    peek1: T(0, 3), peek2: T(1, 2), // eyes drift to the phone and snap back
    buzz: T(2, 0), // the magnet switches on
    stretch1: T(3, 0), stretch2: T(4, 0),
    huh: T(4, 0.5), fine: T(4, 2.5),
    slips: [T(5, 0), T(5, 1), T(5, 2)], fly: T(5, 3),
    lock: T(6, 0), // Loomlock: magnet off, BOING back to the chair
    calm: T(7, 0),
    end: T(10, 0), click: T(10, 2),
  };
  const keys = [];
  for (const [b0, b1] of [[0, 2], [7, 10]]) for (let b = b0; b < b1; b++) for (let s = 0; s < 8; s++) if (!(b === 0 && s < 2) && !(b < 2 && Math.abs(T(b, s / 2) - ev.peek1) < 0.3) && !(b < 2 && Math.abs(T(b, s / 2) - ev.peek2) < 0.3)) keys.push({ t: T(b, s / 2), hand: s % 2 });

  const markers = {
    buzz: { t: ev.buzz, sync: 'a' },
    fly: { t: ev.fly, sync: 'a' },
    lock: { t: ev.lock, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };

  const captions = [
    { t: T(0, 1), end: T(1, 3.5), text: 'yo tengo fuerza de voluntad.', x: 70, y: 1300, rot: -0.03, size: 66 },
    { t: T(7, 1), end: T(9, 3.6), text: 'tu fuerza de voluntad,', x: 130, y: 1260, rot: -0.02, size: 70 },
    { t: T(7, 2.5), end: T(9, 3.6), text: 'ahora con refuerzo.', x: 220, y: 1365, rot: 0.03, size: 70 },
  ];
  const subtitles = captions.map((c) => ({ t: c.t, end: c.end, text: c.text }));

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, m, ev, keys, markers, captions, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
