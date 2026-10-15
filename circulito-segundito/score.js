// CIRCULITO — "Solo un segundito" (Loomlock). The single source of truth for music AND picture.
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
  const clock = makeClock({ bpm: 140, offset: 0.3 }); // 1 beat = 0.43s, 1 bar = 1.71s
  const { T, BEAT } = clock;
  const DURATION = T(13) + 0.6;

  const ev = {
    buzz: T(2, 0), buzz2: T(2, 1), grab: T(2, 2),
    lapse: T(3, 0), // hours start jumping, one per beat
    lampL: T(6, 0), lampR: T(6, 1), late: T(6, 2),
    scratch: T(7, 0), // "¿23:47?"
    lock: T(8, 0), // Loomlock slams onto the phone
    rewind0: T(8, 1), morning: T(9, 0),
    end: T(11, 0), click: T(11, 2),
  };
  // the hour on the wall clock: one hour per beat during the time-lapse
  const LAPSE_BEATS = 12; // 10:00 ... 21:00
  const hourTicks = Array.from({ length: LAPSE_BEATS }, (_, k) => ({ t: ev.lapse + k * BEAT, hour: 10 + k }));
  function hourAt(t) {
    if (t < ev.lapse) return 9 + (t - 0) / 3600 * 60; // a minute or so of real time
    if (t < ev.late) { let h = 9; for (const k of hourTicks) if (t >= k.t) h = k.hour; return h; }
    if (t < ev.rewind0) return 23 + 47 / 60;
    if (t < ev.morning) { const u = (t - ev.rewind0) / (ev.morning - ev.rewind0); return 23.783 - (23.783 - 9) * U.ease.inOutCubic(u); }
    return 9 + (t - ev.morning) / 3600 * 60;
  }
  // typing: a key per 8th note while working
  const keys = [];
  for (const [b0, b1] of [[0, 2], [9, 11]]) for (let b = b0; b < b1; b++) for (let s = 0; s < 8; s++) if (!(b === 0 && s < 2)) keys.push({ t: T(b, s / 2), hand: s % 2 });

  // coworkers come and go with the hours
  const crew = [
    { shape: 'square', color: '#7CC4A4', x: 150, arrive: 10, leave: 17 },
    { shape: 'triangle', color: '#E8718D', x: 935, arrive: 11, leave: 18 },
  ];

  const markers = {
    buzz: { t: ev.buzz, sync: 'a' },
    lapse: { t: ev.lapse, sync: 'a' },
    scratch: { t: ev.scratch, sync: 'av' },
    lock: { t: ev.lock, sync: 'av' },
    morning: { t: ev.morning, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };

  const captions = [
    { t: T(0, 1), end: T(1, 3.5), text: '9:00 · hoy sí: modo foco.', x: 90, y: 1300, rot: -0.03, size: 70 },
    { t: T(2, 2.5), end: T(3, 3.5), text: 'un segundito nomás…', x: 120, y: 1300, rot: 0.03, size: 74 },
    { t: T(9, 1), end: T(10, 3.6), text: 'con Loomlock, un segundito', x: 70, y: 1260, rot: -0.02, size: 66 },
    { t: T(9, 2), end: T(10, 3.6), text: 'es un segundito.', x: 260, y: 1370, rot: 0.03, size: 74 },
  ];
  const subtitles = captions.map((c) => ({ t: c.t, end: c.end, text: c.text }));

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, m, ev, hourAt, hourTicks, keys, crew, markers, captions, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
