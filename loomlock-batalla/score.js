// LOOMLOCK — "La batalla" (v2, editorial). Notifications pile up until they bury the work; Loomlock clears them.
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
  const clock = makeClock({ bpm: 112, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(12) + 0.4;

  const ev = { first: T(2, 0), stop: T(6, 0), lock: T(6, 2), blast: T(7, 0), end: T(10, 0), click: T(10, 2) };
  const MSGS = [
    { icon: 'M', app: 'Mamá', msg: '¿Llegaste bien?' },
    { icon: 'G', app: 'Grupo "Viernes"', msg: 'Facu: jajaja no puede ser' },
    { icon: 'O', app: 'Oferta flash', msg: '2x1 solo por hoy' },
    { icon: '@', app: 'Mail', msg: 'RE: RE: RE: urgente' },
    { icon: 'S', app: 'Historias', msg: 'Juli subió una historia' },
    { icon: 'L', app: 'En vivo', msg: 'Empezó un vivo que te puede gustar' },
    { icon: 'P', app: 'Pedido', msg: 'Tu pedido está en camino' },
    { icon: 'T', app: 'Recordatorio', msg: 'Tomar agua' },
    { icon: 'G', app: 'Grupo "Familia"', msg: 'Tía Marta envió un audio' },
    { icon: 'O', app: 'Te etiquetaron', msg: 'en 3 fotos nuevas' },
    { icon: '@', app: 'Mail', msg: 'Newsletter de la semana' },
    { icon: 'S', app: 'Sugerencias', msg: 'Personas que quizás conozcas' },
  ];
  // one per beat, then per 8th, then per 16th: 4 + 8 + 16 + 16
  const notes = [];
  [[2, 1], [3, 2], [4, 4], [5, 4]].forEach(([b, per]) => { for (let k = 0; k < 4 * per; k++) notes.push(T(b, k / per)); });
  const notifs = notes.map((t, i) => ({
    t, i, ...MSGS[i % MSGS.length],
    x: 160 + (U.hash(i, 1) - 0.5) * 110, y: 230 + (i % 10) * 128 + (U.hash(i, 2) - 0.5) * 40,
    rot: (U.hash(i, 3) - 0.5) * 0.12, midi: [84, 86, 89, 91, 93, 96][Math.floor(U.hash(i, 4) * 6)],
  }));
  // typing: a key per 8th in the calm bars
  const keys = [];
  for (const [b0, b1] of [[0, 2], [7, 10]]) for (let b = b0; b < b1; b++) for (let s = 0; s < 8; s++) if (!(b === 0 && s < 2)) keys.push(T(b, s / 2));

  const markers = {
    first: { t: ev.first, sync: 'a' },
    lock: { t: ev.lock, sync: 'av' },
    blast: { t: ev.blast, sync: 'av' },
    click: { t: ev.click, sync: 'a' },
  };
  const subtitles = [
    { t: T(0, 0.5), end: ev.first, text: '09:30 · Modo foco.' },
    { t: T(7, 1), end: ev.end, text: 'Que esperen.' },
  ];

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, STYLE, DURATION, clock, T, BEAT, m, ev, notifs, keys, markers, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
