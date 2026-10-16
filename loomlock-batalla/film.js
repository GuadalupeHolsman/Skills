// THE FILM — "La batalla" v2. Pure function of t.
(function () {
  const U = globalThis.U, L = globalThis.Loom, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, notifs, keys, T } = S;
  const { clamp, lerp, ease } = U;
  const W = S.W, H = S.H;
  const DOC = { x: 90, y: 430, w: 900, h: 1000 };

  // the document being written: lines grow with every key
  function doc(ctx, t) {
    L.rr(ctx, DOC.x, DOC.y, DOC.w, DOC.h, 30, '#FFFFFF', { shadow: 1 });
    L.text(ctx, 'Propuesta Q4', DOC.x + 70, DOC.y + 120, { size: 54, weight: 800 });
    L.text(ctx, 'Borrador · final_final_v3', DOC.x + 70, DOC.y + 170, { size: 28, weight: 500, color: L.C.mute });
    const typed = keys.filter((k) => k <= t).length;
    let chars = typed * 46, y = DOC.y + 260;
    const widths = [760, 700, 740, 520, 0, 760, 690, 730, 610, 0, 750, 720, 400];
    for (const w of widths) {
      if (y > DOC.y + DOC.h - 60) break;
      if (w === 0) { y += 40; continue; }
      const draw = Math.min(w, Math.max(0, chars));
      L.rr(ctx, DOC.x + 70, y, w, 18, 9, '#EFEDF2');
      if (draw > 0) L.rr(ctx, DOC.x + 70, y, draw, 18, 9, '#C9C6D1');
      if (chars > 0 && chars < w) { if (Math.floor(t * 2.4) % 2 === 0) L.rr(ctx, DOC.x + 70 + draw + 8, y - 12, 5, 42, 2, L.C.violet); }
      chars -= w; y += 56;
    }
  }

  function notif(ctx, t, n) {
    if (t < n.t) return;
    const u = clamp((t - n.t) / 0.2);
    let x = n.x, y = lerp(-220, n.y, ease.outBack(u, 1.3)), rot = n.rot, a = 1;
    if (t >= ev.blast) {
      // blown away from the centre, then gravity
      const d = t - ev.blast, dx = n.x + 380 - W / 2, dy = n.y + 66 - 900;
      const k = 3.2 + U.hash(n.i, 9) * 1.5;
      x = n.x + dx * k * d * 1.4; y = n.y + dy * k * d - 900 * d + 2600 * d * d;
      rot = n.rot + (U.hash(n.i, 8) - 0.5) * 9 * d;
      a = 1 - clamp(d / 1.2);
    }
    if (a <= 0) return;
    L.banner(ctx, x, y, 760, n, { scale: 1.25, rot, alpha: a });
  }

  Studio.film({
    draw(ctx, t) {
      L.bg(ctx, W, H, '#F4F5FF', '#E4E6FB');
      // headline
      if (t < ev.blast) L.text(ctx, '09:30 · Modo foco.', W / 2, 330, { size: 52, weight: 700, align: 'center', alpha: clamp((t - T(0, 0.5)) / 0.4) });
      else {
        const u = clamp((t - T(7, 1)) / 0.35);
        L.text(ctx, 'Que esperen.', W / 2, 340 + 20 * (1 - ease.outCubic(u)), { size: 96, weight: 800, align: 'center', alpha: u, spacing: -2 });
      }
      doc(ctx, t);
      // the pile
      const live = t < ev.blast + 1.3;
      if (live) for (const n of notifs) notif(ctx, t, n);
      // counter while it piles up
      const count = notifs.filter((n) => n.t <= t).length;
      if (t >= ev.first && t < ev.blast) {
        L.rr(ctx, W - 250, 150, 190, 74, 37, L.C.red, { shadow: 0.6 });
        L.text(ctx, `${count}`, W - 155, 203, { size: 46, weight: 800, color: '#fff', align: 'center' });
      }
      // the loomlock key taps through the pile
      const k = L.keyTap(t, ev.lock, [W + 340, 1650], [560, 930]);
      if (k && t < ev.blast) L.key(ctx, k.x, k.y, 520, { rot: k.rot });
      L.nfc(ctx, 540, 900, t, ev.lock);
      // a flash on the lock
      if (t >= ev.lock && t < ev.lock + 0.4) { ctx.fillStyle = `rgba(255,255,255,${0.75 * Math.exp(-(t - ev.lock) * 12)})`; ctx.fillRect(0, 0, W, H); }
      // shockwave + flash on the blast
      if (t >= ev.blast && t < ev.blast + 0.6) {
        const d = (t - ev.blast) / 0.6;
        ctx.save(); ctx.strokeStyle = `rgba(91,75,219,${0.6 * (1 - d)})`; ctx.lineWidth = 40 * (1 - d); ctx.beginPath(); ctx.arc(W / 2, 900, 100 + 1400 * ease.outCubic(d), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        const f = Math.exp(-(t - ev.blast) * 12); ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H);
      }
      // the toast
      if (t >= T(7, 2)) {
        const u = ease.outBack(clamp((t - T(7, 2)) / 0.35), 1.6);
        const y = lerp(H + 50, 1470, u);
        L.rr(ctx, 110, y, 860, 96, 48, L.C.violet, { shadow: 1 });
        L.logo(ctx, 172, y + 48, 58);
        L.text(ctx, `loomlock · ${notifs.length} notificaciones bloqueadas`, 218, y + 60, { size: 32, weight: 500, color: '#fff' });
      }
      L.endCard(ctx, t, ev.end, ev.click, W, H, { tagline: 'Que las notificaciones esperen.', sub: 'Tocá la llave. Enfocate.' });
    },
    init: () => L.loadBrand(Studio),
    post: { paper: 0, vignette: 0.12, grain: 0.015 },
    fadeOut: 0.5,
  });
})();
