// LOOMLOCK — "Just a sec". One hour per beat while the feed eats the day.
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
  const VARIANT = 'collage'; // 'collage' | 'dark' | 'poster' (set per render folder)
  const clock = makeClock({ bpm: 112, offset: 0.3 }); // 1 beat = 0.54s, 1 bar = 2.14s
  const { T, BEAT } = clock;
  const DURATION = T(12) + 0.4;

  const ev = {
    wake: T(1, 0), // the phone lights up
    one: T(1, 2), // "solo un segundito."
    dive: T(2, 0), // cut into the feed
    late: T(5, 2), // 23:47
    stop: T(6, 0), // everything stops
    lock: T(6, 2), // Loomlock
    rewind: T(7, 0), morning: T(8, 0),
    end: T(10, 0), click: T(10, 2),
  };
  // the clock: one hour per beat from the dive, then 23:47, then rewound in 8ths
  const steps = [{ t: 0, v: '09:00', h: 9 }];
  for (let k = 0; k < 14; k++) steps.push({ t: ev.dive + k * BEAT, v: `${String(10 + k).padStart(2, '0')}:00`, h: 10 + k });
  steps.push({ t: ev.late, v: '23:47', h: 23.8 });
  [21, 19, 17, 15, 13, 11, 10].forEach((h, k) => steps.push({ t: ev.rewind + (k + 1) * BEAT / 2, v: `${h}:00`, h }));
  steps.push({ t: ev.morning, v: '09:00', h: 9 });
  const stepAt = (t) => { let i = 0; while (i < steps.length - 1 && t >= steps[i + 1].t) i++; return i; };
  // swipes through the feed: one per beat, then one per 8th when it gets bad
  const swipes = [];
  for (let b = 2; b < 6; b++) for (let s = 0; s < (b >= 4 ? 8 : 4); s++) { const t = T(b, b >= 4 ? s / 2 : s); if (t < ev.late) swipes.push(t); }

  const markers = {
    wake: { t: ev.wake, sync: 'a' },
    dive: { t: ev.dive, sync: 'av' },
    stop: { t: ev.stop, sync: 'av' },
    lock: { t: ev.lock, sync: 'av' },
    morning: { t: ev.morning, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };
  const subtitles = [
    { t: T(0, 0.5), end: ev.one, text: 'Today I focus.' },
    { t: ev.one, end: ev.dive, text: 'Just one second.' },
    { t: T(8, 1), end: ev.end, text: 'With loomlock, one second is one second.' },
  ];

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, STYLE, VARIANT, DURATION, clock, T, BEAT, m, ev, steps, stepAt, swipes, markers, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
