(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const FPS = 30, FORMAT = U.pickFormat('9:16'), [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ bpm: 112, offset: 0 });
  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE: false, STYLE: 'flat', DURATION: 3, clock, T: clock.T, BEAT: clock.BEAT, markers: {}, subtitles: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
