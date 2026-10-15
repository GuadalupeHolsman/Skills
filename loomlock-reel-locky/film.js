// LOOMLOCK V3 — "Locky tiene una key para todo." Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM;
  const { T, BEAT, BAR, ev, ROUNDS } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const KK = (id) => L.KEYS[id];

  const FLOOR = 1500;
  const PH = { x: 770, y: 1060, h: 900 };
  const TAPPT = { x: PH.x, y: PH.y - PH.h / 2 + 130 };
  const LK = { x: 320, size: 740 };
  const hand = (x, y, size, side) => { const k = size / 1024; return side > 0 ? [x + 248 * k, y - 180 * k] : [x - 228 * k, y - 140 * k]; };

  const roundAt = (t) => { let a = -1; for (const r of ROUNDS) if (t >= r.tap) a = r.r; return a; };
  const asleep = (t) => t >= ROUNDS[2].tap + BEAT && t < ev.logo;

  function phoneScreen(ctx, w, h, t) {
    const a = roundAt(t);
    if (a < 0) return L.chaosScreen(ctx, w, h, t, 2 + t * 2, { shake: 0.2 });
    const cur = ROUNDS[a], prev = a > 0 ? ROUNDS[a - 1] : null;
    const drawPrev = prev ? (c, ww, hh, tt) => L.modeScreen(c, ww, hh, tt, KK(prev.id), prev.tap) : (c, ww, hh, tt) => L.chaosScreen(c, ww, hh, tt, 2 + tt * 2);
    L.morph(ctx, w, h, t, cur.tap, drawPrev, (c, ww, hh, tt) => L.modeScreen(c, ww, hh, tt, KK(cur.id), cur.tap), { tx: w / 2, ty: 90 });
  }

  function room(ctx, t) {
    const a = roundAt(t);
    const base = '#EEF0FF';
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    if (a >= 0) { // the wall takes the key's colour, wiping out from the phone
      const r = ROUNDS[a], p = ease.outCubic(clamp((t - r.tap) / 0.45));
      if (p < 1 && a > 0) { ctx.fillStyle = KK(ROUNDS[a - 1].id).bg; ctx.fillRect(0, 0, W, H); }
      ctx.save(); ctx.beginPath(); ctx.arc(TAPPT.x, TAPPT.y, 2400 * p, 0, 7); ctx.clip();
      ctx.fillStyle = KK(r.id).bg; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.14; for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) L.icon(ctx, r.id, i * 220 + (j % 2) * 110, j * 220 - 60, 90, KK(r.id).deep);
      ctx.restore();
      if (r.r < 2) G.rays(ctx, TAPPT.x, TAPPT.y, { n: 16, r0: 120, r1: 1800, color: '#FFFFFF', alpha: 0.12 * (1 + r.r) * clamp(1 - (t - r.tap) / BAR), spin: t * 0.3 });
    }
    ctx.fillStyle = 'rgba(20,20,60,0.10)'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = 'rgba(20,20,60,0.18)'; ctx.fillRect(0, FLOOR, W, 6);
  }

  // Locky's position/pose at t
  function lockyPose(t) {
    let x = LK.x, y = FLOOR + 10, rot = 0, sx = 1, sy = 1, eyes = 'open';
    const hopAmt = t < ev.scratch ? 18 : 0;
    y -= Math.max(0, Math.sin(Math.PI * S.clock.phase(t))) * hopAmt;
    for (const r of ROUNDS) {
      if (t >= r.wind && t < r.tap) { // wind-up: lean back, then lunge
        const u = (t - r.wind) / (r.tap - r.wind);
        if (u < 0.75) { const w = ease.outCubic(u / 0.75); rot = -0.18 * w; x -= 30 * w; sy = 1 - 0.06 * w; }
        else { const l = ease.inCubic((u - 0.75) / 0.25); rot = lerp(-0.18, 0.22, l); x = lerp(LK.x - 30, LK.x + 110, l); }
      }
      if (t >= r.tap && t < r.tap + 0.5) { const u = ease.outBack(clamp((t - r.tap) / 0.5), 1.6); rot = lerp(0.22, 0, u); x = lerp(LK.x + 110, LK.x, u); const sq = pulse(t, r.tap, 10); sy = 1 - 0.12 * sq; sx = 1 + 0.1 * sq; }
    }
    // gym squats on every beat of the gym bar
    if (t >= ROUNDS[1].tap + 0.3 && t < T(5)) { const ph = S.clock.phase(t); sy *= 1 - 0.14 * Math.sin(Math.PI * ph); sx *= 1 + 0.06 * Math.sin(Math.PI * ph); }
    if (roundAt(t) >= 0 && roundAt(t) < 2 && t >= ROUNDS[roundAt(t)].tap + 0.25) eyes = 'happy';
    if (asleep(t)) { eyes = 'closed'; rot = 0.08 * ease.inOutCubic(clamp((t - ROUNDS[2].tap - BEAT) / 1.5)); sy = 1 + 0.02 * Math.sin(t * 2.2); }
    if (t >= ev.scratch && t < ROUNDS[2].tap) eyes = 'open';
    return { x, y, rot, sx, sy, eyes };
  }

  function drawLocky(ctx, t) {
    const p = lockyPose(t);
    ctx.fillStyle = 'rgba(20,20,60,0.15)'; ctx.beginPath(); ctx.ellipse(p.x, FLOOR + 14, 190, 26, 0, 0, 7); ctx.fill();
    L.locky(ctx, p.x, p.y, LK.size, p);
    const a = roundAt(t);
    const [hx, hy] = hand(p.x, p.y, LK.size * p.sy, 1);
    if (a === 0) { // popcorn bucket in the other hand
      const [px, py] = hand(p.x, p.y, LK.size * p.sy, -1);
      L.icon(ctx, 'cine', px - 10, py - 60, 150, '#E63946');
    }
    if (a === 1 && t >= ROUNDS[1].tap + 0.2) L.icon(ctx, 'gym', hx + 30, hy - 10, 150, '#10170A');
    if (a === 1) for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i / 3) % 1); ctx.fillStyle = `rgba(80,160,255,${1 - u})`; ctx.beginPath(); ctx.ellipse(p.x - 120 + i * 120, p.y - 640 + u * 120, 10, 16, 0, 0, 7); ctx.fill(); }
    return { hx, hy };
  }

  // the key in play: pops above Locky's hand on `pull`, flies to the phone on the lunge, falls after the slap
  function drawKey(ctx, t, hx, hy) {
    for (const r of ROUNDS) {
      if (t < r.pull || t > r.tap + 0.7) continue;
      const k = KK(r.id), w = 300 + r.r * 40;
      let x, y, rot, alpha = 1;
      const held = [LK.x + 230, 800];
      if (t < r.tap - BEAT * 0.5) { const p = UI.pop(t, r.pull, 0.35, 2.4); x = held[0]; y = held[1] - 20 * Math.sin(t * 6); rot = -0.2 + 0.05 * Math.sin(t * 5); ctx.save(); ctx.translate(x, y); ctx.scale(p, p); L.key(ctx, k, 0, 0, w, { rot, glow: 0.4 + 0.3 * Math.sin(t * 8) }); ctx.restore(); continue; }
      if (t < r.tap) { const u = ease.inCubic((t - (r.tap - BEAT * 0.5)) / (BEAT * 0.5)); x = lerp(held[0], TAPPT.x, u); y = lerp(held[1], TAPPT.y, u); rot = lerp(-0.2, 0.1, u); }
      else { const u = (t - r.tap) / 0.7; x = TAPPT.x + u * 200; y = TAPPT.y + ease.inQuad(u) * 900; rot = 0.1 + u * 2; alpha = 1 - clamp((u - 0.6) / 0.4); }
      L.key(ctx, k, x, y, w, { rot, alpha, glow: pulse(t, r.tap, 4) });
      UI.tap(ctx, TAPPT.x, TAPPT.y, t, r.tap, { color: 'rgba(255,255,255,0.95)', size: 300 + r.r * 120 });
    }
  }

  function popcornRain(ctx, t) {
    const r = ROUNDS[0]; if (t < r.tap || t > r.end + 0.4) return;
    for (const p of S.popcorn) {
      const u = t - r.tap - p.d * 1.2; if (u < 0) continue;
      const x = p.x * W, y = -60 + u * 900;
      ctx.save(); ctx.translate(x, y); ctx.rotate(u * p.spin); ctx.scale(p.s, p.s);
      ctx.fillStyle = '#FFF4D6'; ctx.strokeStyle = '#C9A66B'; ctx.lineWidth = 3;
      for (const [dx, dy, rr] of [[-10, 0, 14], [10, -4, 13], [0, 10, 12]]) { ctx.beginPath(); ctx.arc(dx, dy, rr, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
  }

  function caption(ctx, t) {
    for (const c of S.captions) {
      if (t < c.t || t > c.end + 0.15) continue;
      const pop = UI.pop(t, c.t, 0.3, 2.2), out = 1 - clamp((t - c.end) / 0.15);
      const size = 64, tw = Math.min(UI.measure(ctx, c.text, size, 900), SAFE.w - 60) + 70;
      ctx.save(); ctx.globalAlpha = out; ctx.translate(W / 2 - 40, SAFE.y + 90); ctx.scale(pop, pop); ctx.rotate(-0.015);
      ctx.fillStyle = '#0E0F1A'; ctx.beginPath(); ctx.roundRect(-tw / 2, -62, tw, 124, 30); ctx.fill();
      UI.text(ctx, c.text, 0, 22, { size, weight: 900, color: '#FFFFFF', align: 'center', maxW: SAFE.w - 60 });
      ctx.restore();
    }
  }

  function shotStage(ctx, t) {
    const a = roundAt(t), zoom = 1 + (a >= 0 && a < 2 ? 0.05 * (1 + a) * pulse(t, ROUNDS[a].tap, 6) : 0);
    // the scratch: freeze-frame tilt
    const frz = t >= ev.scratch && t < ROUNDS[2].tap;
    const tt = frz ? ev.scratch : t;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); if (frz) ctx.rotate(-0.03); ctx.translate(-W / 2, -H / 2);
    room(ctx, tt);
    UI.phone(ctx, PH.x, PH.y, PH.h, phoneScreen, tt, { dark: true, time: asleep(t) ? '23:30' : '9:41' });
    const { hx, hy } = drawLocky(ctx, tt);
    drawKey(ctx, tt, hx, hy);
    popcornRain(ctx, tt);
    ctx.restore();
    if (frz) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H); UI.text(ctx, '...', LK.x + 40, 860, { size: 120, weight: 900, color: '#0E0F1A', align: 'center' }); }
    // lights out for round 3 — only the phone glows
    if (t >= ROUNDS[2].tap) {
      const d = 0.62 * ease.inOutCubic(clamp((t - ROUNDS[2].tap - 0.2) / 0.8));
      ctx.fillStyle = `rgba(8,8,40,${d})`; ctx.fillRect(0, 0, W, H);
      for (const z of S.zzz) {
        const u = t - z; if (u < 0 || u > 2.2) continue;
        UI.text(ctx, 'z', LK.x + 140 + u * 60 + Math.sin(u * 3) * 20, 820 - u * 260, { size: 70 + u * 30, weight: 900, color: '#FFFFFF', alpha: 1 - u / 2.2, align: 'center' });
      }
    }
    caption(ctx, t);
    if (a >= 0 && a < 2) { const fl = 0.5 * Math.exp(-(t - ROUNDS[a].tap) * 12); if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); } }
  }

  function shotEnd(ctx, t) {
    ctx.fillStyle = L.B.paper; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 760, 800); g.addColorStop(0, 'rgba(159,216,255,0.75)'); g.addColorStop(1, 'rgba(159,216,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the four keys orbit Locky
    ['cine', 'gym', 'foco', 'dormir'].forEach((id, i) => {
      const p = UI.pop(t, ev.logo + 0.1 + i * 0.08, 0.35, 2); if (p <= 0) return;
      const ang = -Math.PI / 2 + (i - 1.5) * 0.55 + Math.sin(t * 1.5 + i) * 0.03;
      L.key(ctx, KK(id), W / 2 + Math.cos(ang) * 420 * p, 720 + Math.sin(ang) * 300 * p, 230, { rot: (i - 1.5) * 0.25 });
    });
    const lp = UI.pop(t, ev.logo, 0.45, 1.8);
    const hop = Math.max(0, Math.sin(Math.PI * S.clock.phase(t))) * 14;
    if (lp > 0) L.locky(ctx, W / 2, 1000 - hop, 520 * lp, { eyes: 'happy' });
    L.logo(ctx, W / 2, 1110, 700, { alpha: UI.fadeIn(t, ev.logo + 0.15, 0.3) });
    const line = ['Una key', 'para cada', 'momento.'].filter((_, i) => t >= ev.tagline + i * BEAT / 2).join(' ');
    if (line) UI.text(ctx, line, W / 2, 1290, { size: 60, weight: 800, color: L.B.ink, align: 'center' });
    const cp = UI.pop(t, ev.cta, 0.35, 2);
    if (cp > 0) { ctx.save(); ctx.translate(W / 2, 1400); ctx.scale(cp, cp); const label = 'Tap. Modo. Listo.', pw = UI.measure(ctx, label, 36, 800) + 80; UI.pill(ctx, -pw / 2, -38, label, { bg: L.B.blue, size: 36, h: 76, weight: 800 }); ctx.restore(); }
    const lf = 0.8 * Math.exp(-(t - ev.logo) * 10); if (lf > 0.01) { ctx.fillStyle = `rgba(255,255,255,${lf})`; ctx.fillRect(0, 0, W, H); }
  }

  Studio.film({
    async init() { await L.load(); },
    draw(ctx, t) { if (t < ev.logo) shotStage(ctx, t); else shotEnd(ctx, t); },
    post: { paper: 0, vignette: 0.1, grain: 0.02 },
    fadeOut: 0.6,
  });
})();
