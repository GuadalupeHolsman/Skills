// THE FILM — "The reflex". Nobody texted you; you open the phone anyway. Pure function of t; the look comes from V.
(function () {
  const U = globalThis.U, UI = globalThis.UI, L = globalThis.Loom, V = globalThis.V, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, opens, T } = S;
  const { clamp, lerp, ease } = U;
  const W = S.W, H = S.H;
  const CX = 540, CY = 1260, PH = 1060;

  function toFrame(px, py, cy, ph) {
    const b = ph * 0.016, sw = ph * 0.47 - 2 * b, sh = ph - 2 * b, k = sw / UI.PHONE_W;
    return [CX - sw / 2 + px * k, cy - sh / 2 + py * k];
  }
  const openAt = (t) => opens.find((o) => t >= o.t && t < o.t + o.dur);
  const countAt = (t) => { let c = 0, prev = 0, tc = -1; for (const o of opens) if (t >= o.t) { prev = c; c = o.count; tc = o.t; } return { c, prev, tc }; };

  Studio.film({
    init: () => L.loadBrand(Studio),
    draw(ctx, t) {
      const frantic = clamp((t - T(4)) / (ev.stop - T(4))) * (t >= ev.loop && t < ev.stop ? 1 : 0);
      V.bg(ctx, t, { night: t >= ev.stop && t < ev.tap ? 0.6 : 0, chaos: frantic });
      V.stickers(ctx, t);
      const up = ease.outCubic(clamp((t - ev.grab) / 0.35)) * (1 - ease.inOutCubic(clamp((t - ev.letgo) / 0.6)));
      const cy = CY + 260 * (1 - up), ph = lerp(880, PH, up);
      const o = openAt(t);
      const rest = [CX + ph * 0.16, cy + ph * 0.34];
      let thumb = rest;
      const screen = (c, w, h) => {
        if (t < ev.loop) return L.lockPhone(c, w, h, '10:12', 'No notifications');
        if (o) { const u = (t - o.t) / o.dur; return u < 0.32 ? L.homeScreen(c, w, h, t, { tap: o.app }) : L.reel(c, w, h, o.i, t, { app: L.APPS[o.app].name }); }
        if (t < ev.tap) return L.lockPhone(c, w, h, '4:40', 'No notifications');
        if (t < T(7, 0) || t >= ev.letgo) return L.lockScreen(c, w, h, t, ev.tap, { line: 'Session on · Focus' });
        return L.homeScreen(c, w, h, t, { locked: 1, tap: 0, shake: t >= ev.test && t < ev.test + 0.3 ? 1 : 0 });
      };
      screen.dark = true;
      if (o) {
        const u = (t - o.t) / o.dur, icon = toFrame(...L.appPos(o.app), cy, ph);
        if (u < 0.32) thumb = [lerp(rest[0], icon[0], ease.outCubic(u / 0.32)), lerp(rest[1], icon[1], ease.outCubic(u / 0.32))];
        else if (u < 0.45) thumb = [lerp(icon[0], CX + 60, (u - 0.32) / 0.13), lerp(icon[1], cy + 260, (u - 0.32) / 0.13)];
        else thumb = [CX + 60, lerp(cy + 260, cy - 60, ease.inOutCubic(clamp((u - 0.45) / 0.25)))];
      } else if (t >= T(7, 1) && t < ev.letgo) {
        const icon = toFrame(...L.appPos(0), cy, ph), u = clamp((t - T(7, 1)) / (ev.test - T(7, 1))), back = clamp((t - ev.test - 0.35) / 0.3);
        thumb = [lerp(lerp(rest[0], icon[0], ease.outCubic(u)), rest[0], back), lerp(lerp(rest[1], icon[1], ease.outCubic(u)), rest[1], back)];
      }
      V.phone(ctx, () => UI.phone(ctx, CX, cy, ph, screen, t, { time: t < ev.stop ? '10:12' : '4:40', sketch: false, dark: true, rot: up > 0.01 ? 0 : -0.04 }));
      // where the finger touches: the app tap, the flick, the blocked tap
      let press = 0;
      if (o) { const u = (t - o.t) / o.dur; press = Math.max(clamp(1 - Math.abs(u - 0.3) / 0.08), u > 0.45 && u < 0.7 ? 1 : 0); }
      else if (t >= T(7, 1) && t < ev.letgo) press = clamp(1 - Math.abs(t - ev.test) / 0.2);
      L.touch(ctx, thumb[0], thumb[1], press);
      const k = L.keyTap(t, ev.tap, [W + 420, 1800], [600, 1440], 0.9);
      if (k) V.key(ctx, k.x, k.y, 640, { rot: k.rot, art: 'dragon', t });
      L.nfc(ctx, CX, cy - 60, t, ev.tap, { color: V.name === 'dark' ? '#8E9BFF' : '#FFFFFF' });

      // words
      if (t < ev.grab) V.head(ctx, t, T(0, 0.5), 'Nobody texted you.');
      else if (t < ev.loop) V.head(ctx, t, T(0, 0.5), 'Nobody texted you.', 'You picked it up anyway.');
      else if (t < ev.tap) {
        const { c, prev, tc } = countAt(t);
        V.big(ctx, `${prev}`, `${c}`, (t - tc) / 0.15, 'unlocks today', { y: 300, alert: t >= ev.stop });
        if (t >= ev.stop) { V.note(ctx, t, ev.stop, "It's not the phone.", { y: 560 }); V.note(ctx, t, ev.stop + 0.3, "It's the impulse.", { y: 650, alert: true }); }
      } else if (t < ev.letgo) V.head(ctx, t, T(6, 3.2), 'One key.', 'One tap.');
      else V.head(ctx, t, T(8, 1), "Don't resist temptation.", 'Remove it.', { y: 340 });
      for (const [tf, a] of [[ev.loop, 0.35], [ev.stop, 0.7], [ev.tap, 0.7]]) { const f = t >= tf ? a * Math.exp(-(t - tf) * 12) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }
      L.endCard(ctx, t, ev.end, ev.click, W, H, { tagline: 'Tools to fight brainrot.', sub: 'One key. One tap.' });
    },
    post: { paper: 0, vignette: 0.12, grain: 0.02 },
    fadeOut: 0.5,
  });
})();
