// LOOMLOCK REEL V2 (9:16, 15 s): "Ruido, corte, silencio." — after Estudio Astora's brand brief.
// Act 1 RUIDO: cuts that accelerate until it's almost unbearable. Act 2 CORTE: a frame of nothing,
// the key, ONE dry tap, the screen does one job, the pocket. Act 3 SILENCIO: long, still, window light.
// The rhythm IS the message: Act 3 is twice as long as Act 1 with a quarter of its cuts.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0 }); // used for the noise act's grid only
  const { T, BEAT, BAR } = clock;
  const DURATION = 15.0;

  // ACT 1: cut lengths shrink geometrically from ~0.75 s to ~0.18 s, snapped to frames
  const SHOTS = ['phone', 'locky', 'wall', 'table', 'feed'];
  const cuts = [];
  { const r = U.mulberry32(11); let t = 0, d = 0.75, last = -1;
    while (t < 5.9) {
      let s; do { s = Math.floor(r() * SHOTS.length); } while (s === last); last = s;
      const ft = Math.round(t * FPS) / FPS;
      cuts.push({ t: ft, kind: SHOTS[s], seed: Math.floor(r() * 1000), midi: m(['C6', 'E6', 'G6', 'A5', 'D6', 'B5'][Math.floor(r() * 6)]) });
      t += d; d = Math.max(0.18, d * 0.86);
    } }
  cuts[0].kind = 'phone'; cuts[1].kind = 'locky';
  const ev = {
    black: 6.0,        // the frame of nothing: hard cut to black + silence
    keyIn: 6.4,        // the key enters, already close
    tap: 7.2,          // THE tap — the only time this sound happens
    pocket: 9.4,       // the screen did its job: into the pocket, hard cut
    text: 9.5,         // the one line of text, on the cut to calm
    textOut: 12.0,
    logo: 12.6,
  };
  const S = { ruido: [0, ev.black], corte: [ev.black, ev.pocket], silencio: [ev.pocket, DURATION] };

  const markers = {
    ruido2: 3.0,
    black: ev.black,
    tap: { t: ev.tap, sync: 'av' },
    pocket: ev.pocket, text: ev.text, logo: ev.logo,
  };
  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, cuts, ev, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
