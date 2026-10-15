// LOOMLOCK V1 — "Una key, un trabajo." Every frame is a pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM;
  const { T, BEAT, BAR, ev, taps } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  UI.setTheme({ ink: '#0E0F1A', app: '#F3F5FF' });

  const PH = { x: W / 2, y: 1040, h: 1160 };
  const phoneW = PH.h * 0.47, phoneTop = PH.y - PH.h / 2;
  const TAP = { x: PH.x + phoneW * 0.18, y: phoneTop + 120 }; // where the key meets the phone (top, like NFC)
  const k = (id) => L.KEYS[id];

  // which key is active at t (-1 = chaos)
  const activeAt = (t) => { let a = -1; for (const tp of taps) if (t >= tp.t) a = tp.i; return a; };
  const notifN = (t) => { let n = 0; for (const p of S.pings) if (t >= p.t) n = Math.max(n, S.pings.indexOf(p) + clamp((t - p.t) / 0.15)); return n; };

  function phoneScreen(ctx, w, h, t) {
    const a = activeAt(Math.min(t, S.ev.recapHit + 99));
    const shake = t < S.breath[0] ? clamp((t - T(1)) / BAR) : 0;
    const chaos = (c, ww, hh, tt) => L.chaosScreen(c, ww, hh, tt, notifN(Math.min(tt, S.breath[0])), { shake });
    if (a < 0) return chaos(ctx, w, h, t);
    const cur = taps[a], prev = a > 0 ? taps[a - 1] : null;
    const drawPrev = prev ? (c, ww, hh, tt) => L.modeScreen(c, ww, hh, tt, k(prev.id), prev.t) : chaos;
    L.morph(ctx, w, h, t, cur.t, drawPrev, (c, ww, hh, tt) => L.modeScreen(c, ww, hh, tt, k(cur.id), cur.t), { tx: w * 0.68, ty: 60 });
  }

  // ---------- backgrounds ----------
  function bgChaos(ctx, t) {
    ctx.fillStyle = '#16173A'; ctx.fillRect(0, 0, W, H);
    // flickering colour blobs, one per ping, hard cuts (they ARE the notifications, bleeding out)
    S.pings.forEach((p, i) => {
      const a = pulse(t, p.t, 7) * (t < S.breath[0] ? 1 : 0); if (a < 0.02 || t < p.t) return;
      ctx.fillStyle = ['#FF3B5C', '#25D366', '#1DA1F2', '#FFB000', '#E1306C', '#7B61FF'][i % 6];
      ctx.globalAlpha = 0.35 * a; ctx.beginPath(); ctx.arc(U.hash(i, 1) * W, U.hash(i, 2) * H, 220 + 200 * U.hash(i, 3), 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    });
  }
  function bgKey(ctx, t, key) {
    ctx.fillStyle = key.bg; ctx.fillRect(0, 0, W, H);
    // a quiet wallpaper of the key's icon, drifting
    ctx.save(); ctx.globalAlpha = 0.12;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) {
      const x = c * 260 + (r % 2) * 130 - 40, y = r * 240 - 120 + ((t * 30) % 240);
      L.icon(ctx, key.id, x, y, 110, key.deep);
    }
    ctx.restore();
  }
  function background(ctx, t) {
    const a = activeAt(t);
    if (a < 0) return bgChaos(ctx, t);
    const cur = taps[a];
    const p = clamp((t - cur.t) / 0.38);
    if (p < 1) { if (a > 0) bgKey(ctx, t, k(taps[a - 1].id)); else bgChaos(ctx, t); }
    ctx.save(); ctx.beginPath(); ctx.arc(TAP.x, TAP.y, Math.hypot(W, H) * ease.inOutCubic(p), 0, 7); ctx.clip();
    bgKey(ctx, t, k(cur.id)); ctx.restore();
  }

  // ---------- the key coming in, tapping, flying out ----------
  function keyCard(ctx, t) {
    for (const tp of taps) {
      if (t < tp.tIn || t > tp.t + 0.6) continue;
      const key = k(tp.id), w = 420;
      let x, y, rot, sx = 1;
      if (t < tp.t) { // swing in from the bottom-right, decelerating into the tap
        const u = ease.outCubic(clamp((t - tp.tIn) / (tp.t - tp.tIn)));
        x = lerp(W + 300, TAP.x + 40, u); y = lerp(H * 0.8, TAP.y - 40, u); rot = lerp(0.6, -0.12, u);
      } else { // contact: squash, then lift away up-right
        const u = (t - tp.t) / 0.6;
        sx = 1 - 0.08 * pulse(t, tp.t, 14);
        x = TAP.x + 40 + ease.inCubic(u) * 700; y = TAP.y - 40 - ease.inCubic(u) * 500; rot = -0.12 + u * 0.5;
      }
      ctx.save(); ctx.translate(x, y); ctx.scale(sx, 2 - sx); L.key(ctx, key, 0, 0, w, { rot, glow: pulse(t, tp.t, 5) }); ctx.restore();
      // the tap itself: ripples + a flash ring
      UI.tap(ctx, TAP.x, TAP.y, t, tp.t, { color: 'rgba(255,255,255,0.95)', size: 260 });
      UI.tap(ctx, TAP.x, TAP.y, t, tp.t + 0.08, { color: 'rgba(255,255,255,0.6)', size: 420 });
    }
  }

  // ---------- captions (big, top, inside SAFE) ----------
  function caption(ctx, t) {
    for (const c of S.captions) {
      if (t < c.t || t > c.end + 0.15) continue;
      const pop = UI.pop(t, c.t, 0.3, 2.2), out = 1 - clamp((t - c.end) / 0.15);
      const dark = !c.id && t < T(2);
      const size = 66, tw = Math.min(UI.measure(ctx, c.text, size, 900), SAFE.w - 60) + 70;
      ctx.save(); ctx.globalAlpha = out; ctx.translate(W / 2 - 40, SAFE.y + 90); ctx.scale(pop, pop); ctx.rotate(-0.015);
      ctx.fillStyle = dark ? '#FFFFFF' : '#0E0F1A'; ctx.beginPath(); ctx.roundRect(-tw / 2, -62, tw, 124, 30); ctx.fill();
      UI.text(ctx, c.text, 0, 22, { size, weight: 900, color: dark ? '#0E0F1A' : '#FFFFFF', align: 'center', maxW: SAFE.w - 60 });
      ctx.restore();
    }
  }

  function shotMain(ctx, t) {
    background(ctx, t);
    const shake = t < S.breath[0] ? clamp((t - T(1)) / BAR) : 0;
    const a = activeAt(t), bump = a >= 0 ? pulse(t, taps[a].t, 9) : 0;
    const rot = 0.02 * shake * Math.sin(t * 61) + (t < T(1) ? 0.01 * Math.sin(t * 40) * clamp(t / 2) : 0);
    const enter = ease.outBack(clamp((t - 0.05) / 0.4), 1.4);
    ctx.save(); ctx.translate(PH.x, PH.y); ctx.scale(1 + 0.035 * bump, 1 + 0.035 * bump); ctx.translate(-PH.x, -PH.y);
    UI.phone(ctx, PH.x, lerp(H + 700, PH.y, enter), PH.h, phoneScreen, t, { rot, dark: true, time: '9:41' });
    ctx.restore();
    if (t >= S.breath[0] && t < S.breath[1]) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); }
    keyCard(ctx, t);
    caption(ctx, t);
    const fl = 0.55 * (a >= 0 ? Math.exp(-(t - taps[a].t) * 12) : 0);
    if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- recap: the four keys fan out over a smaller phone ----------
  function shotRecap(ctx, t) {
    ctx.fillStyle = L.B.blue; ctx.fillRect(0, 0, W, H);
    G.rays(ctx, W / 2, 1050, { n: 18, r0: 200, r1: 1500, color: '#FFFFFF', alpha: 0.07, spin: t * 0.15 });
    const shrink = ease.inOutCubic(clamp((t - T(6)) / 0.5));
    UI.phone(ctx, W / 2, lerp(PH.y, 1180, shrink), lerp(PH.h, 820, shrink), phoneScreen, t, { dark: true });
    for (const r of S.recap) {
      const p = UI.pop(t, r.t, 0.35, 2);
      if (p <= 0) continue;
      const ang = -Math.PI / 2 + (r.i - 1.5) * 0.36, R = 520;
      const x = W / 2 + Math.cos(ang) * R * p, y = 1180 + Math.sin(ang) * R * p - 120;
      L.key(ctx, k(r.id), x, y, 270 * clamp(p, 0, 1.2), { rot: (r.i - 1.5) * 0.18 });
    }
    caption(ctx, t);
  }

  // ---------- end card ----------
  function shotEnd(ctx, t) {
    ctx.fillStyle = L.B.paper; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 760, 800); g.addColorStop(0, 'rgba(159,216,255,0.75)'); g.addColorStop(1, 'rgba(159,216,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const lp = UI.pop(t, ev.logo, 0.45, 1.8);
    const hop = Math.max(0, Math.sin(Math.PI * S.clock.phase(t))) * (t > ev.logo + 0.5 ? 14 : 0);
    if (lp > 0) L.locky(ctx, W / 2, 960 - hop, 560 * lp, { eyes: t > ev.tagline + BEAT * 1.5 ? 'happy' : 'open' });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.3);
    L.logo(ctx, W / 2, 1080, 760, { alpha: wp });
    const words = ['Una key.', 'Un trabajo.', 'Y ya.'];
    const line = words.filter((_, i) => t >= ev.tagline + i * BEAT / 2).join(' ');
    if (line) UI.text(ctx, line, W / 2, 1270, { size: 62, weight: 800, color: L.B.ink, align: 'center' });
    const cp = UI.pop(t, ev.cta, 0.35, 2);
    if (cp > 0) {
      ctx.save(); ctx.translate(W / 2, 1390); ctx.scale(cp, cp);
      const label = 'Tap. Modo. Listo.', pw = UI.measure(ctx, label, 36, 800) + 80;
      UI.pill(ctx, -pw / 2, -38, label, { bg: L.B.blue, size: 36, h: 76, weight: 800 });
      ctx.restore();
    }
  }

  Studio.film({
    async init() { await L.load(); },
    draw(ctx, t) {
      if (t < ev.recapHit) shotMain(ctx, t);
      else if (t < ev.logo) shotRecap(ctx, t);
      else shotEnd(ctx, t);
      const lf = t >= ev.logo ? 0.8 * Math.exp(-(t - ev.logo) * 10) : 0; // hard cut + flash on the logo hit
      if (lf > 0.01) { ctx.fillStyle = `rgba(255,255,255,${lf})`; ctx.fillRect(0, 0, W, H); }
    },
    post: { paper: 0, vignette: 0.12, grain: 0.02 },
    fadeOut: 0.6,
  });
})();
