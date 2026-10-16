// LOOMLOCK — "The reflex". Nobody wrote to you; you open the phone anyway. Again and again.
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
  const STYLE = 'flat';
  const VARIANT = 'poster'; // 'collage' | 'dark' | 'poster' (set per render folder)
  const clock = makeClock({ bpm: 112, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(12) + 0.4;

  const ev = {
    grab: T(1, 2), // the hand takes the phone, unprompted
    loop: T(2, 0), // the reflex loop starts
    stop: T(6, 0), // "No es el celu. Es el impulso."
    tap: T(6, 2), // the loomlock key
    test: T(7, 2), // the thumb goes for Instagram again: locked
    letgo: T(8, 0), // the hand puts the phone down
    end: T(10, 0), click: T(10, 2),
  };
  // the reflex: unlock -> tap an app -> scroll -> home, faster and faster (2 + 4 + 16 opens)
  const ORDER = [0, 1, 0, 2, 1, 0, 3, 1, 0, 1, 2, 0, 1, 0, 3, 1, 0, 1, 0, 2, 1, 0];
  const COUNT = [1, 2, 3, 4, 5, 6, 9, 13, 18, 24, 31, 38, 45, 52, 59, 65, 70, 75, 79, 83, 86, 87];
  const opens = [];
  [[2, 2], [3, 1], [4, 0.5], [5, 0.5]].forEach(([b, len]) => { for (let x = 0; x < 4; x += len) opens.push({ t: T(b, x), dur: len * BEAT }); });
  opens.forEach((o, i) => { o.app = ORDER[i]; o.count = COUNT[i]; o.i = i; });

  const markers = {
    grab: { t: ev.grab, sync: 'a' },
    loop: { t: ev.loop, sync: 'av' },
    stop: { t: ev.stop, sync: 'av' },
    tap: { t: ev.tap, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };
  const subtitles = [
    { t: T(0, 0.5), end: ev.grab, text: 'Nobody texted you.' },
    { t: ev.grab, end: ev.loop, text: 'You picked it up anyway.' },
    { t: ev.stop, end: T(7, 1), text: "It's not the phone. It's the impulse." },
    { t: T(8, 1), end: ev.end, text: "Don't resist temptation. Remove it." },
  ];

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, STYLE, VARIANT, DURATION, clock, T, BEAT, m, ev, opens, markers, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
