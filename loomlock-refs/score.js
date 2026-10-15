(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const FORMAT = '1:1', [W, H] = U.formatSize(FORMAT);
  const SCORE = { FPS: 30, FORMAT, STYLE: 'flat', W, H, SAFE: U.safeArea(W, H), DURATION: 7, clock: MU.makeClock({ bpm: 120 }), markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
