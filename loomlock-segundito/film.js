// THE FILM — "Solo un segundito" v2. Pure function of t.
(function () {
  const U = globalThis.U, UI = globalThis.UI, L = globalThis.Loom, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, steps, stepAt, swipes } = S;
  const { clamp, lerp, ease } = U;
  const W = S.W, H = S.H;

  const NOTE = { icon: 'G', app: 'Grupo "Viernes"', msg: '23 mensajes nuevos' };
  const hourAt = (t) => { const i = stepAt(t), s = steps[i], p = steps[Math.max(0, i - 1)]; return lerp(p.h, s.h, ease.outCubic(clamp((t - s.t) / 0.3))); };
  const scrollAt = (t) => swipes.reduce((a, ts) => a + 560 * ease.inOutCubic(clamp((t - ts) / 0.2)), 0);

  function clockRoll(ctx, t, y, size, color) {
    const i = stepAt(t), s = steps[i], p = steps[Math.max(0, i - 1)];
    L.roll(ctx, p.v, s.v, (t - s.t) / 0.2, W / 2, y, { size, color, weight: 800 });
  }

  // wide shot: the time, a line of copy, the phone on the table
  function wide(ctx, t) {
    const [c0, c1] = L.dayColors(9);
    L.bg(ctx, W, H, c0, c1);
    ctx.fillStyle = 'rgba(17,17,20,0.05)'; ctx.fillRect(0, 1290, W, H - 1290);
    const after = t >= ev.morning;
    clockRoll(ctx, t, 640, 300, L.C.ink);
    if (!after) {
      const a = t < ev.one ? clamp((t - S.T(0, 0.5)) / 0.4) : 1;
      L.text(ctx, t < ev.one ? 'Hoy sí. Modo foco.' : 'Solo un segundito.', W / 2, 760, { size: 50, weight: 500, color: '#4A4750', align: 'center', alpha: a });
    } else {
      const a = clamp((t - S.T(8, 1)) / 0.4), b = clamp((t - S.T(8, 2)) / 0.4);
      L.text(ctx, 'Con loomlock,', W / 2, 760, { size: 50, weight: 500, color: '#4A4750', align: 'center', alpha: a });
      L.text(ctx, 'un segundito es un segundito.', W / 2, 826, { size: 50, weight: 700, color: L.C.ink, align: 'center', alpha: b });
    }
    const buzz = t >= ev.wake && t < ev.wake + 0.35 ? Math.sin(t * 90) * 7 : 0;
    const screen = (c, w, h) => {
      if (after) return L.lockScreen(c, w, h, t, ev.morning, { line: 'Sesión activa · Focus' });
      c.fillStyle = '#050507'; c.fillRect(0, 0, w, h);
      if (t >= ev.wake) {
        const u = clamp((t - ev.wake) / 0.3);
        L.text(c, '9:01', w / 2, 190, { size: 92, weight: 700, color: '#fff', align: 'center', alpha: u });
        L.banner(c, 14, 250 - 30 * (1 - ease.outCubic(u)), 384, NOTE, { alpha: u, dark: true });
      }
    };
    screen.dark = true;
    UI.phone(ctx, W / 2 + buzz, 1260, 720, screen, t, { time: after ? '9:00' : '9:01', sketch: false, shadow: true, dark: true });
  }

  // close-up: the feed, the clock running away
  function close(ctx, t) {
    const hour = hourAt(t);
    const [c0, c1] = L.dayColors(hour);
    L.bg(ctx, W, H, c0, c1);
    const night = hour >= 19.5;
    const late = t >= ev.late && t < ev.morning && steps[stepAt(t)].v === '23:47';
    clockRoll(ctx, t, 420, 240, late && t >= ev.stop ? L.C.red : night ? '#FFFFFF' : L.C.ink);
    if (t >= ev.stop && t < ev.rewind) L.text(ctx, 'batería 2%', W / 2, 500, { size: 40, weight: 600, color: L.C.red, align: 'center', alpha: clamp((t - ev.stop) / 0.2) });
    if (t >= ev.rewind) L.text(ctx, 'rebobinando…', W / 2, 500, { size: 38, weight: 600, color: night ? '#B9B1FF' : L.C.violet, align: 'center', spacing: 4 });
    const z = 1 + 0.06 * clamp((t - ev.dive) / (ev.stop - ev.dive));
    ctx.save(); ctx.translate(W / 2, 1180); ctx.scale(z, z); ctx.translate(-W / 2, -1180);
    const frozen = t >= ev.stop ? ev.stop : t;
    const screen = (c, w, h) => {
      if (t >= ev.lock) return L.lockScreen(c, w, h, t, ev.lock, { line: 'Sesión activa · Focus' });
      L.feed(c, w, h, scrollAt(frozen));
    };
    screen.dark = true;
    UI.phone(ctx, W / 2, 1180, 1180, screen, t, { time: steps[stepAt(t)].v.replace(/^0/, ''), sketch: false, dark: true });
    ctx.restore();
    // the thumb: a soft swipe mark on every swipe
    const last = [...swipes].reverse().find((ts) => ts <= t && t < ev.stop);
    if (last !== undefined && t - last < 0.22) {
      const u = (t - last) / 0.22;
      ctx.save(); ctx.globalAlpha = 0.5 * (1 - u); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(640, lerp(1560, 1200, ease.outCubic(u)), 46, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // the loomlock key taps the phone
    const k = L.keyTap(t, ev.lock, [W + 320, 1700], [700, 1330]);
    if (k) L.key(ctx, k.x, k.y, 460, { rot: k.rot });
    L.nfc(ctx, 640, 1240, t, ev.lock, { color: '#FFFFFF' });
    // stop: a hard white flash
    const f = t >= ev.stop ? 0.6 * Math.exp(-(t - ev.stop) * 12) : 0;
    if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); }
  }

  Studio.film({
    draw(ctx, t) {
      if (t < ev.dive || t >= ev.morning) wide(ctx, t); else close(ctx, t);
      L.endCard(ctx, t, ev.end, ev.click, W, H, { tagline: 'Tocá la llave.', sub: 'Recuperá tu día.' });
    },
    init: () => L.loadBrand(Studio),
    post: { paper: 0, vignette: 0.12, grain: 0.015 },
    fadeOut: 0.5,
  });
})();
