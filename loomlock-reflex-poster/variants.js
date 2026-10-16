// VARIANTS — the three looks a loomlock film can be rendered in. score.js sets VARIANT:
//   'collage' (A: the brand's illustrated world, stickers, chunky outlined type)
//   'dark'    (B: cinematic black, blue rim light, clean type)
//   'poster'  (C: brand blue, giant left-aligned type)
(function () {
  const U = globalThis.U, L = globalThis.Loom, S = globalThis.SCORE;
  const { clamp, ease } = U;
  const W = S.W, H = S.H, V0 = S.VARIANT || 'dark';
  const YEL = '#FFD43B', NAVY = '#151A4A';
  const cover = (ctx, im, x, y, w, h) => { if (!im) return; const k = Math.max(w / im.width, h / im.height); ctx.drawImage(im, x + (w - im.width * k) / 2, y + (h - im.height * k) / 2, im.width * k, im.height * k); };
  const appear = (t, t0) => clamp((t - t0) / 0.35);
  // shrink a line so it fits the frame (uppercase display lines run wide)
  const fit = (ctx, str, size, maxW = W - 150) => { ctx.save(); ctx.font = L.font(size, 800); const w = ctx.measureText(str).width; ctx.restore(); return Math.min(size, size * maxW / w); };
  function outlined(ctx, s, x, y, size, fill, { rot = 0, align = 'center', alpha = 1 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.font = L.font(size, 800); ctx.textAlign = align; ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = NAVY; ctx.strokeText(s, 0, 0); ctx.fillStyle = fill; ctx.fillText(s, 0, 0); ctx.restore();
  }

  const V = {
    name: V0,
    // background; night: 0 (day) .. 1 (late night); chaos 0..1 (how frantic the moment is)
    bg(ctx, t, { night = 0, chaos = 0 } = {}) {
      if (V0 === 'collage') {
        const pw = H * 800 / 505, dx = -(t * (20 + chaos * 120)) % pw;
        for (let x = dx; x < W; x += pw) ctx.drawImage(L.img('pattern'), x, 0, pw, H);
        ctx.fillStyle = `rgba(${Math.round(62 - 40 * night)},${Math.round(72 - 50 * night)},${Math.round(203 - 120 * night)},${0.55 + 0.25 * night})`; ctx.fillRect(0, 0, W, H);
      } else if (V0 === 'dark') {
        ctx.fillStyle = '#05060D'; ctx.fillRect(0, 0, W, H);
        const warm = 1 - night, g = ctx.createRadialGradient(W / 2, 1150, 40, W / 2, 1150, 950);
        g.addColorStop(0, `rgba(${Math.round(62 + 150 * warm * 0.6)},${Math.round(72 + 60 * warm * 0.4)},${Math.round(203 - 90 * warm * 0.5)},${0.45 + chaos * 0.2})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, L.mix('#3E48CB', '#141A5C', night)); g.addColorStop(1, L.mix('#202787', '#070A2A', night));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    },
    // a headline: one or two lines that land at t0 (second line 0.25s later)
    head(ctx, t, t0, l1, l2, { y = 360 } = {}) {
      const a = appear(t, t0), b = appear(t, t0 + 0.25), lift = (u) => 18 * (1 - ease.outCubic(u));
      if (a <= 0) return;
      if (V0 === 'collage') {
        outlined(ctx, l1.toUpperCase(), W / 2, y + lift(a), fit(ctx, l1.toUpperCase(), 104), YEL, { rot: -0.04, alpha: a });
        if (l2) outlined(ctx, l2.toUpperCase(), W / 2, y + 120 + lift(b), fit(ctx, l2.toUpperCase(), 80), '#FFFFFF', { rot: -0.04, alpha: b });
      } else if (V0 === 'dark') {
        L.text(ctx, l1, W / 2, y + lift(a), { size: 70, weight: 600, color: '#FFFFFF', align: 'center', alpha: a });
        if (l2) L.text(ctx, l2, W / 2, y + 80 + lift(b), { size: 46, weight: 400, color: '#9AA3D9', align: 'center', alpha: b });
      } else {
        L.text(ctx, l1.toUpperCase(), 70, y + lift(a), { size: fit(ctx, l1.toUpperCase(), 96, W - 140), weight: 800, color: '#FFFFFF', alpha: a, spacing: -3 });
        if (l2) L.text(ctx, l2.toUpperCase(), 70, y + 104 + lift(b), { size: fit(ctx, l2.toUpperCase(), 74, W - 140), weight: 800, color: YEL, alpha: b, spacing: -2 });
      }
    },
    // a big rolling number with a label under it (the clock, the unlock counter)
    big(ctx, prev, cur, u, label, { y = 360, alert = false, scale = 1 } = {}) {
      if (V0 === 'collage') {
        const k = ease.outBack(clamp(u * 1.4), 2.2);
        outlined(ctx, cur, W / 2, y + 30, 210 * scale * (0.85 + 0.15 * k), alert ? '#FF5A5F' : YEL, { rot: -0.04 });
        if (label) { L.rr(ctx, W / 2 - 250, y + 70, 500, 76, 38, NAVY); L.text(ctx, label, W / 2, y + 122, { size: 38, weight: 700, color: alert ? '#FF8A8D' : YEL, align: 'center' }); }
      } else if (V0 === 'dark') {
        L.roll(ctx, prev, cur, u, W / 2, y, { size: 200 * scale, weight: 300, color: alert ? '#FF5A5F' : '#FFFFFF' });
        if (label) L.text(ctx, label, W / 2, y + 80, { size: 38, weight: 400, color: alert ? '#FF8A8D' : '#9AA3D9', align: 'center', spacing: 2 });
      } else {
        L.roll(ctx, prev, cur, u, 60, y + 60, { size: 330 * scale, weight: 800, color: alert ? YEL : '#FFFFFF', align: 'left' });
        if (label) L.text(ctx, label.toUpperCase(), 76, y + 150, { size: 64, weight: 800, color: alert ? YEL : '#ECEDFF', spacing: -2 });
      }
    },
    // small supporting line
    note(ctx, t, t0, s, { y = 520, alert = false } = {}) {
      const a = appear(t, t0);
      if (a <= 0) return;
      const c = alert ? '#FF5A5F' : V0 === 'dark' ? '#9AA3D9' : '#ECEDFF';
      if (V0 === 'poster') L.text(ctx, s, 76, y, { size: 44, weight: 600, color: alert ? YEL : c, alpha: a });
      else if (V0 === 'collage') { L.rr(ctx, W / 2 - 300, y - 52, 600, 76, 38, NAVY, { alpha: a }); L.text(ctx, s, W / 2, y, { size: 38, weight: 700, color: alert ? '#FF8A8D' : '#FFFFFF', align: 'center', alpha: a }); }
      else L.text(ctx, s, W / 2, y, { size: 42, weight: 500, color: c, align: 'center', alpha: a });
    },
    // draws a phone with the variant's lighting around it
    phone(ctx, draw) {
      if (V0 === 'dark') { ctx.save(); ctx.shadowColor = 'rgba(90,110,255,0.75)'; ctx.shadowBlur = 110; draw(); ctx.restore(); }
      else draw();
    },
    // the key, dressed for the variant
    key(ctx, x, y, w, o) {
      if (V0 === 'dark') { ctx.save(); ctx.shadowColor = 'rgba(255,200,120,0.55)'; ctx.shadowBlur = 80; L.key(ctx, x, y, w, o); ctx.restore(); }
      else L.key(ctx, x, y, w, o);
    },
    // collage only: floating key stickers in the background for texture
    stickers(ctx, t) {
      if (V0 !== 'collage') return;
      const ST = [['planet', 150, 660, 300, -0.2], ['mascot', 960, 760, 260, 0.18], ['landscape', 980, 1700, 300, -0.12], ['ship', 110, 1720, 280, 0.15]];
      for (const [art, x, y, w, r] of ST) {
        ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3 + x) * 12); ctx.rotate(r + Math.sin(t + y) * 0.03);
        const h = w * 505 / 800; L.rr(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 24, '#fff', { shadow: 0.8 });
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 16); ctx.clip(); cover(ctx, L.img(art), -w / 2, -h / 2, w, h); ctx.restore();
      }
    },
    ink: V0 === 'dark' ? '#FFFFFF' : '#FFFFFF',
  };
  globalThis.V = V;
})();
