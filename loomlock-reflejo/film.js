// THE FILM — "El reflejo". Pure function of t.
(function () {
  const U = globalThis.U, UI = globalThis.UI, L = globalThis.Loom, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, opens, T } = S;
  const { clamp, lerp, ease } = U;
  const W = S.W, H = S.H;
  const CX = 540, CY = 1230, PH = 1080;

  // phone screen (412-pt space) -> frame coordinates
  function toFrame(px, py, cy = CY, ph = PH) {
    const b = ph * 0.016, sw = ph * 0.47 - 2 * b, sh = ph - 2 * b, k = sw / UI.PHONE_W;
    return [CX - sw / 2 + px * k, cy - sh / 2 + py * k];
  }
  const openAt = (t) => opens.find((o) => t >= o.t && t < o.t + o.dur);
  const countAt = (t) => { let c = 0, prev = 0, tc = -1; for (const o of opens) if (t >= o.t) { prev = c; c = o.count; tc = o.t; } return { c, prev, tc }; };

  function head(ctx, str, y, t0, { size = 64, weight = 700, color = L.C.ink } = {}) {
    const u = clamp((ctx.__t - t0) / 0.35);
    L.text(ctx, str, W / 2, y + 16 * (1 - ease.outCubic(u)), { size, weight, color, align: 'center', alpha: u });
  }

  Studio.film({
    init: () => L.loadBrand(Studio),
    draw(ctx, t) {
      ctx.__t = t;
      L.bg(ctx, W, H, '#F4F5FF', '#DADDF8');
      // where the phone is: on the table, picked up, put down again
      const up = ease.outCubic(clamp((t - ev.grab) / 0.35)) * (1 - ease.inOutCubic(clamp((t - ev.letgo) / 0.6)));
      const cy = CY + 260 * (1 - up), ph = lerp(900, PH, up), handY = 700 * (1 - up);
      const o = openAt(t);
      const rest = [CX + ph * 0.16, cy + ph * 0.34];
      let thumb = rest;
      const screen = (c, w, h) => {
        if (t < ev.loop) return L.lockPhone(c, w, h, '10:12', 'Sin notificaciones');
        if (o) {
          const u = (t - o.t) / o.dur;
          if (u < 0.32) return L.homeScreen(c, w, h, t, { tap: o.app });
          return L.reel(c, w, h, o.i, t, { app: L.APPS[o.app].name });
        }
        if (t < ev.tap) return L.lockPhone(c, w, h, '16:40', 'Sin notificaciones');
        if (t < T(7, 0) || t >= ev.letgo) return L.lockScreen(c, w, h, t, ev.tap, { line: 'Sesión activa · Focus' });
        return L.homeScreen(c, w, h, t, { locked: 1, tap: 0, shake: t >= ev.test && t < ev.test + 0.3 ? 1 : 0 });
      };
      screen.dark = true;
      // the thumb: tap the app, then flick the feed; later, the reflex hits the lock
      if (o) {
        const u = (t - o.t) / o.dur, icon = toFrame(...L.appPos(o.app), cy, ph);
        if (u < 0.32) thumb = [lerp(rest[0], icon[0], ease.outCubic(u / 0.32)), lerp(rest[1], icon[1], ease.outCubic(u / 0.32))];
        else { const s = clamp((u - 0.45) / 0.25); thumb = [CX + 60, lerp(cy + 260, cy - 60, ease.inOutCubic(s))]; if (u < 0.45) thumb = [lerp(icon[0], CX + 60, (u - 0.32) / 0.13), lerp(icon[1], cy + 260, (u - 0.32) / 0.13)]; }
      } else if (t >= T(7, 1) && t < ev.letgo) {
        const icon = toFrame(...L.appPos(0), cy, ph), u = clamp((t - T(7, 1)) / (ev.test - T(7, 1)));
        const back = clamp((t - ev.test - 0.35) / 0.3);
        thumb = [lerp(lerp(rest[0], icon[0], ease.outCubic(u)), rest[0], back), lerp(lerp(rest[1], icon[1], ease.outCubic(u)), rest[1], back)];
      }
      // phone in hand
      ctx.save(); ctx.translate(0, 0);
      if (up > 0.01) { ctx.save(); ctx.translate(0, handY); L.handBack(ctx, CX, cy, ph); ctx.restore(); }
      UI.phone(ctx, CX, cy, ph, screen, t, { time: t < ev.stop ? '10:12' : '16:40', sketch: false, dark: true, rot: up > 0.01 ? 0 : -0.04 });
      if (up > 0.01) { ctx.save(); ctx.translate(0, handY); L.handFront(ctx, CX, cy, ph, thumb); ctx.restore(); }
      ctx.restore();

      // the loomlock key taps the phone
      const k = L.keyTap(t, ev.tap, [W + 420, 1800], [600, 1420], 0.9);
      if (k) L.key(ctx, k.x, k.y, 640, { rot: k.rot, art: 'dragon', t });
      L.nfc(ctx, CX, cy - 60, t, ev.tap);

      // words
      if (t < ev.grab) head(ctx, 'Nadie te escribió.', 420, T(0, 0.5));
      else if (t < ev.loop) head(ctx, 'Igual lo agarraste.', 420, ev.grab);
      else if (t < ev.tap) {
        const { c, prev, tc } = countAt(t), red = t >= ev.stop;
        L.roll(ctx, `${prev}`, `${c}`, (t - tc) / 0.15, W / 2, 330, { size: 190, weight: 700, color: red ? L.C.red : L.C.ink });
        L.text(ctx, 'desbloqueos hoy', W / 2, 400, { size: 40, weight: 500, color: L.C.mute, align: 'center' });
        if (red) head(ctx, 'No es el celu. Es el impulso.', 540, ev.stop, { size: 54 });
      } else if (t < ev.letgo) head(ctx, 'Una llave. Un toque.', 420, T(6, 3.2));
      else {
        head(ctx, 'No resistas la tentación.', 380, T(8, 1), { size: 58, weight: 500, color: L.C.mute });
        head(ctx, 'Sacala del medio.', 460, T(8, 2), { size: 72 });
      }
      // flashes on the hits
      for (const [tf, a] of [[ev.loop, 0.35], [ev.stop, 0.7], [ev.tap, 0.7]]) { const f = t >= tf ? a * Math.exp(-(t - tf) * 12) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }
      L.endCard(ctx, t, ev.end, ev.click, W, H, { tagline: 'Herramientas contra el brainrot.', sub: 'Una llave. Un toque.' });
    },
    post: { paper: 0, vignette: 0.12, grain: 0.015 },
    fadeOut: 0.5,
  });
})();
