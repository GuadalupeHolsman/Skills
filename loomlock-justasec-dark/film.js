// THE FILM — "Just a sec". One hour per beat while the feed eats the day. Pure function of t; the look comes from V.
(function () {
  const U = globalThis.U, UI = globalThis.UI, L = globalThis.Loom, V = globalThis.V, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, steps, stepAt, swipes, T } = S;
  const { clamp, lerp, ease } = U;
  const W = S.W, H = S.H;

  const NOTE = { icon: 'G', app: 'Friday group', msg: '23 new messages' };
  const hourAt = (t) => { const i = stepAt(t), s = steps[i], p = steps[Math.max(0, i - 1)]; return lerp(p.h, s.h, ease.outCubic(clamp((t - s.t) / 0.3))); };
  const nightAt = (h) => clamp((h - 16.5) / 5);
  const scrollAt = (t) => swipes.reduce((a, ts) => a + 560 * ease.inOutCubic(clamp((t - ts) / 0.2)), 0);
  function clock(ctx, t, y, opts) { const i = stepAt(t), s = steps[i], p = steps[Math.max(0, i - 1)]; V.big(ctx, p.v, s.v, (t - s.t) / 0.2, null, { y, ...opts }); }

  // wide: the time, a line, the phone on the table (and the key beside it at the end)
  function wide(ctx, t) {
    V.bg(ctx, t, { night: 0 });
    V.stickers(ctx, t);
    const after = t >= ev.morning;
    clock(ctx, t, 400, { scale: V.name === 'poster' ? 0.82 : 1.3 });
    if (!after) V.note(ctx, t, t < ev.one ? T(0, 0.5) : ev.one, t < ev.one ? 'Today I focus.' : 'Just one second.', { y: 600 });
    else { V.note(ctx, t, T(8, 1), 'With loomlock,', { y: 580 }); V.note(ctx, t, T(8, 2), 'one second is one second.', { y: 670 }); }
    const buzz = t >= ev.wake && t < ev.wake + 0.35 ? Math.sin(t * 90) * 7 : 0;
    const screen = (c, w, h) => {
      if (after) return L.lockScreen(c, w, h, t, ev.morning, { line: 'Session on · Focus' });
      c.fillStyle = '#050507'; c.fillRect(0, 0, w, h);
      if (t >= ev.wake) {
        const u = clamp((t - ev.wake) / 0.3);
        L.text(c, '9:01', w / 2, 190, { size: 92, weight: 700, color: '#fff', align: 'center', alpha: u });
        L.banner(c, 14, 250 - 30 * (1 - ease.outCubic(u)), 384, NOTE, { alpha: u, dark: true });
      }
    };
    screen.dark = true;
    V.phone(ctx, () => UI.phone(ctx, W / 2 + buzz, 1280, 720, screen, t, { time: after ? '9:00' : '9:01', sketch: false, shadow: true, dark: true }));
    if (after) V.key(ctx, 790, 1580, 420, { rot: 0.18, art: 'ship', t });
  }

  // close-up: phone in hand, the feed, the clock running away
  function close(ctx, t) {
    const hour = hourAt(t), night = nightAt(hour);
    const frantic = clamp((t - T(4)) / (ev.stop - T(4))) * (t < ev.stop ? 1 : 0);
    V.bg(ctx, t, { night, chaos: frantic });
    V.stickers(ctx, t);
    const late = t >= ev.stop && t < ev.morning && steps[stepAt(t)].v === '23:47';
    clock(ctx, t, 330, { alert: late, scale: V.name === 'poster' ? 0.82 : 1.1 });
    if (t >= ev.stop && t < ev.rewind) V.note(ctx, t, ev.stop, 'battery 2%', { y: 540, alert: true });
    if (t >= ev.rewind) V.note(ctx, t, ev.rewind, 'rewinding…', { y: 540 });
    const z = 1 + 0.06 * clamp((t - ev.dive) / (ev.stop - ev.dive));
    const PH = 1120, PCY = 1220;
    ctx.save(); ctx.translate(W / 2, PCY); ctx.scale(z, z); ctx.translate(-W / 2, -PCY);
    const frozen = t >= ev.stop ? ev.stop : t;
    const page = scrollAt(frozen) / 560, idx = Math.floor(page), frac = page - idx;
    const APP = ['Instagram', 'TikTok'];
    const screen = (c, w, h) => {
      if (t >= ev.lock) return L.lockScreen(c, w, h, t, ev.lock, { line: 'Session on · Focus' });
      c.save(); c.translate(0, -frac * h); L.reel(c, w, h, idx, t, { app: APP[Math.floor(idx / 6) % 2] }); c.translate(0, h); L.reel(c, w, h, idx + 1, t, { app: APP[Math.floor((idx + 1) / 6) % 2] }); c.restore();
    };
    screen.dark = true;
    const last = [...swipes].reverse().find((ts) => ts <= t && t < ev.stop);
    const u = last !== undefined ? clamp((t - last) / 0.22) : 1;
    const thumb = [W / 2 + 70, lerp(PCY + 330, PCY + 60, Math.sin(Math.PI * u))];
    L.handBack(ctx, W / 2, PCY, PH);
    V.phone(ctx, () => UI.phone(ctx, W / 2, PCY, PH, screen, t, { time: steps[stepAt(t)].v.replace(/^0/, ''), sketch: false, dark: true }));
    L.handFront(ctx, W / 2, PCY, PH, t < ev.lock ? thumb : [W / 2 + 140, PCY + 380]);
    ctx.restore();
    const k = L.keyTap(t, ev.lock, [W + 420, 1800], [600, 1420], 0.8);
    if (k) V.key(ctx, k.x, k.y, 640, { rot: k.rot, art: 'ship', t });
    L.nfc(ctx, W / 2, PCY - 80, t, ev.lock, { color: '#FFFFFF' });
    const f = Math.max(t >= ev.stop ? 0.6 * Math.exp(-(t - ev.stop) * 12) : 0, t >= ev.lock ? 0.8 * Math.exp(-(t - ev.lock) * 12) : 0);
    if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); }
  }

  Studio.film({
    init: () => L.loadBrand(Studio),
    draw(ctx, t) {
      if (t < ev.dive || t >= ev.morning) wide(ctx, t); else close(ctx, t);
      L.endCard(ctx, t, ev.end, ev.click, W, H, { tagline: 'Tap your key.', sub: 'Get your day back.' });
    },
    post: { paper: 0, vignette: 0.12, grain: 0.02 },
    fadeOut: 0.5,
  });
})();
