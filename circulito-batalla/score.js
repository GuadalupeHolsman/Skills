// CIRCULITO — "La batalla" (Loomlock). Notifications are little bugs; Loomlock is the shield.
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
  const DURATION = T(14) + 0.6;

  const ev = {
    buzz: T(2, 0),
    swarm: T(4, 0), tickle: T(5, 0), carry: T(6, 0),
    lounge: T(7, 0), // hard cut to the beanbag
    scratch: T(8, 0), lock: T(8, 2),
    shield: T(9, 0), back: T(10, 0),
    end: T(12, 0), click: T(12, 2),
  };
  const KINDS = ['heart', 'chat', 'fire', 'bell'];
  const bugs = [
    { t: T(2, 1), kind: 'heart', swat: T(2, 2.5) },
    { t: T(3, 0), kind: 'chat' },
    { t: T(3, 1), kind: 'fire', swat: T(3, 2) },
    ...Array.from({ length: 6 }, (_, k) => ({ t: T(4, k * 0.5), kind: KINDS[(k + 3) % 4] })),
  ].map((b, i) => ({ ...b, i }));
  const bounces = [T(10, 2), T(11, 0), T(11, 2.5)];
  const keys = [];
  for (const [b0, b1] of [[0, 2], [10, 12]]) for (let b = b0; b < b1; b++) for (let s = 0; s < 8; s++) if (!(b === 0 && s < 2)) keys.push({ t: T(b, s / 2), hand: s % 2 });

  const markers = {
    buzz: { t: ev.buzz, sync: 'a' },
    lounge: { t: ev.lounge, sync: 'av' },
    scratch: { t: ev.scratch, sync: 'av' },
    shield: { t: ev.shield, sync: 'av' },
    back: { t: ev.back, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };

  const captions = [
    { t: T(0, 1), end: T(1, 3.5), text: 'modo foco: ON', x: 220, y: 1300, rot: -0.03, size: 80 },
    { t: T(4, 0), end: T(5, 3.5), text: '¡son demasiadas!', x: 180, y: 1300, rot: 0.04, size: 76 },
    { t: T(7, 0.5), end: T(7, 3.8), text: '5 minutitos más…', x: 150, y: 820, rot: -0.03, size: 74 },
    { t: T(10, 1), end: T(11, 3.6), text: 'Loomlock: tu escudo', x: 120, y: 1260, rot: -0.02, size: 70 },
    { t: T(10, 2), end: T(11, 3.6), text: 'anti-notificaciones.', x: 170, y: 1365, rot: 0.03, size: 70 },
  ];
  const subtitles = captions.map((c) => ({ t: c.t, end: c.end, text: c.text }));

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, m, ev, bugs, bounces, keys, markers, captions, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
