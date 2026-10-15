// LOOMLOCK V2 — "Ruido, corte, silencio." Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM;
  const { ev, cuts } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const KEY = L.KEYS.dormir;
  const LOCKY = { x: W / 2, y: 1330, size: 980 }; // the same framing in act 1 (blue screen light) and act 3 (window light)

  const cutAt = (t) => { let c = cuts[0], i = 0; cuts.forEach((x, j) => { if (t >= x.t) { c = x; i = j; } }); return { c, i }; };

  // ---------- ACT 1 shots (all graphic: the screen is never "filmed") ----------
  function shotPhone(ctx, t, c, i) {
    ctx.fillStyle = '#0B0C1E'; ctx.fillRect(0, 0, W, H);
    const s = 1.0 + 0.25 * U.hash(c.seed, 1), rot = (U.hash(c.seed, 2) - 0.5) * 0.3;
    UI.phone(ctx, W / 2 + (U.hash(c.seed, 3) - 0.5) * 200, 980, 1500 * s, (cx, w, h, tt) => L.chaosScreen(cx, w, h, tt, 3 + i * 0.7 + (t - c.t) * 6, { shake: i / cuts.length }), t, { rot, dark: true, shadow: false });
  }
  function shotLocky(ctx, t, c, i) {
    ctx.fillStyle = '#04050C'; ctx.fillRect(0, 0, W, H);
    L.locky(ctx, LOCKY.x, LOCKY.y, LOCKY.size, {});
    ctx.fillStyle = 'rgba(3,5,22,0.72)'; ctx.fillRect(0, 0, W, H);
    // the only light: a phone held at the chest, flickering with each new thing
    const fl = 0.75 + 0.25 * Math.sin(t * 37 + c.seed);
    const g = ctx.createRadialGradient(W / 2, 1180, 20, W / 2, 1000, 760);
    g.addColorStop(0, `rgba(90,150,255,${0.55 * fl})`); g.addColorStop(1, 'rgba(90,150,255,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.translate(W / 2, 1200); ctx.rotate(-0.2);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(-70, -120, 140, 240, 22); ctx.fill();
    ctx.fillStyle = `rgba(150,200,255,${fl})`; ctx.beginPath(); ctx.roundRect(-60, -110, 120, 220, 16); ctx.fill(); ctx.restore();
  }
  function shotWall(ctx, t, c, i) {
    ctx.fillStyle = '#12132C'; ctx.fillRect(0, 0, W, H);
    const n = 9 + i;
    for (let j = 0; j < n; j++) {
      const y = 140 + j * 150 + (U.hash(c.seed, j) - 0.5) * 60, x = W / 2 + (U.hash(c.seed, j + 50) - 0.5) * 240;
      const a = clamp((t - c.t) * 45 - j * 0.9);
      if (a <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate((U.hash(c.seed, j + 9) - 0.5) * 0.18); ctx.globalAlpha = a; ctx.scale(2.1, 2.1);
      ctx.fillStyle = 'rgba(250,250,255,0.97)'; ctx.beginPath(); ctx.roundRect(-200, -38, 400, 76, 20); ctx.fill();
      ctx.fillStyle = ['#FF3B5C', '#25D366', '#1DA1F2', '#FFB000', '#E1306C', '#7B61FF'][(j + i) % 6]; ctx.beginPath(); ctx.roundRect(-184, -22, 44, 44, 11); ctx.fill();
      ctx.fillStyle = '#222'; ctx.fillRect(-124, -16, 150 + 90 * U.hash(c.seed, j + 3), 12); ctx.fillStyle = '#999'; ctx.fillRect(-124, 6, 210 * U.hash(c.seed, j + 4) + 40, 10);
      ctx.restore();
    }
  }
  function shotTable(ctx, t, c, i) {
    ctx.fillStyle = '#2A1C14'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3A281C'; ctx.beginPath(); ctx.ellipse(W / 2, H / 2, 620, 900, 0, 0, 7); ctx.fill();
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2 + 0.4, x = W / 2 + Math.cos(a) * 330, y = H / 2 + Math.sin(a) * 560;
      const on = U.hash(c.seed, j, Math.floor((t - c.t) * 8)) > 0.4;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2 + (U.hash(j, 5) - 0.5) * 0.4);
      ctx.fillStyle = '#0D0D10'; ctx.beginPath(); ctx.roundRect(-80, -160, 160, 320, 24); ctx.fill();
      ctx.fillStyle = on ? '#7FB2FF' : '#15161C'; ctx.beginPath(); ctx.roundRect(-70, -150, 140, 300, 18); ctx.fill();
      if (on) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 420); g.addColorStop(0, 'rgba(127,178,255,0.35)'); g.addColorStop(1, 'rgba(127,178,255,0)'); ctx.fillStyle = g; ctx.fillRect(-420, -420, 840, 840); }
      ctx.restore();
    }
  }
  function shotFeed(ctx, t, c, i) { // a thumb that never stops: the feed blurs past
    ctx.fillStyle = '#0E0E14'; ctx.fillRect(0, 0, W, H);
    const off = ((t - c.t) * 3200) % 700;
    for (let j = -1; j < 4; j++) {
      const y = j * 700 - off + 200;
      ctx.fillStyle = ['#E1306C', '#FFB000', '#1DA1F2', '#25D366', '#7B61FF'][(j + 10 + c.seed) % 5];
      ctx.beginPath(); ctx.roundRect(90, y, W - 180, 560, 36); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(90, y + 590, 520, 22); ctx.fillRect(90, y + 625, 340, 18);
    }
    // the thumb
    const ty = 1450 + Math.sin((t - c.t) * 30) * 90;
    ctx.fillStyle = '#E8B89A'; ctx.beginPath(); ctx.ellipse(W * 0.66, ty, 130, 210, -0.35, 0, 7); ctx.fill();
    ctx.fillStyle = '#F6D5C4'; ctx.beginPath(); ctx.ellipse(W * 0.64, ty - 110, 70, 80, -0.35, 0, 7); ctx.fill();
  }
  const SHOT = { phone: shotPhone, locky: shotLocky, wall: shotWall, table: shotTable, feed: shotFeed };

  function actRuido(ctx, t) {
    const { c, i } = cutAt(t);
    const shake = clamp(t / ev.black) ** 2;
    ctx.save(); ctx.translate((U.hash(Math.floor(t * 30), 1) - 0.5) * 30 * shake, (U.hash(Math.floor(t * 30), 2) - 0.5) * 30 * shake);
    ctx.translate(W / 2, H / 2); ctx.scale(1.06, 1.06); ctx.translate(-W / 2, -H / 2);
    SHOT[c.kind](ctx, t, c, i);
    ctx.restore();
    const fl = 0.35 * pulse(t, c.t, 18); if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- ACT 2: black, the key, ONE tap, the screen, the pocket ----------
  const PH = { x: W / 2, y: 1060, h: 1300 };
  function actCorte(ctx, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (t < ev.keyIn) return; // the frame of nothing
    ctx.fillStyle = '#0C0D16'; ctx.fillRect(0, 0, W, H);
    const pocket = ease.inCubic(clamp((t - (ev.pocket - 0.45)) / 0.45));
    const screen = (cx, w, h, tt) => { if (tt < ev.tap) { cx.fillStyle = '#050508'; cx.fillRect(0, 0, w, h); } else L.morph(cx, w, h, tt, ev.tap, (c2, w2, h2) => { c2.fillStyle = '#050508'; c2.fillRect(0, 0, w2, h2); }, (c2, w2, h2, t2) => L.modeScreen(c2, w2, h2, t2, KEY, ev.tap), { tx: w * 0.65, ty: 60, dur: 0.22 }); };
    UI.phone(ctx, PH.x, PH.y + pocket * 1900, PH.h, screen, t, { dark: true, rot: pocket * 0.1, time: '23:12' });
    // the key: slow, deliberate approach (120 fps feel), contact, separation
    const tapP = PH.y - PH.h / 2 + 140;
    if (t < ev.pocket - 0.5) {
      let y, rot;
      if (t < ev.tap) { const u = ease.outQuad(clamp((t - ev.keyIn) / (ev.tap - ev.keyIn))); y = lerp(-300, tapP - 60, u); rot = lerp(-0.25, -0.08, u); }
      else { const u = clamp((t - ev.tap) / 1.4); y = tapP - 60 - ease.inOutCubic(u) * 1200; rot = -0.08 - u * 0.2; }
      L.key(ctx, KEY, PH.x + 120, y, 520, { rot, glow: pulse(t, ev.tap, 3) });
      UI.tap(ctx, PH.x + 120, tapP, t, ev.tap, { color: 'rgba(255,255,255,0.9)', size: 300 });
    }
    const fl = t >= ev.tap ? 0.6 * Math.exp(-(t - ev.tap) * 14) : 0; // the screen wakes: a short flash on the tap
    if (fl > 0.01) { ctx.fillStyle = `rgba(200,205,255,${fl})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- ACT 3: window light. Same framing as the blue-light Locky. Nobody does anything. ----------
  function actSilencio(ctx, t) {
    const u = t - ev.pocket;
    const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#FFF1DC'); bg.addColorStop(1, '#F2D9C4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // window light on the wall: a soft parallelogram with the cross of the frame, drifting very slowly
    ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(-120 + u * 6, 0); ctx.transform(1, 0, -0.35, 1, 0, 0);
    ctx.fillStyle = '#FFFBF2';
    for (const [x, y] of [[420, 260], [720, 260], [420, 700], [720, 700]]) { ctx.beginPath(); ctx.roundRect(x, y, 270, 410, 8); ctx.fill(); }
    ctx.restore();
    const g = ctx.createRadialGradient(W * 0.75, 200, 30, W * 0.6, 500, 1300); g.addColorStop(0, 'rgba(255,236,200,0.6)'); g.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(160,110,80,0.12)'; ctx.beginPath(); ctx.ellipse(LOCKY.x, LOCKY.y + 10, 300, 40, 0, 0, 7); ctx.fill();
    const breathe = 1 + 0.018 * Math.sin(u * 1.4); // one slow breath
    const sh = 1 - 0.03 * ease.inOutCubic(clamp((u - 0.6) / 1.6)); // shoulders drop
    L.locky(ctx, LOCKY.x, LOCKY.y, LOCKY.size, { eyes: u > 1.0 && u < 4.2 ? 'closed' : 'happy', sy: breathe * sh, sx: 1 / breathe });
    // the single line of text
    const ta = UI.fadeIn(t, ev.text, 0.5) * (1 - UI.fadeIn(t, ev.textOut, 0.6));
    if (ta > 0) UI.text(ctx, 'un trabajo, y ya', W / 2, SAFE.y + 160, { size: 78, weight: 700, color: '#3B2A22', align: 'center', alpha: ta });
    const la = UI.fadeIn(t, ev.logo, 0.9);
    if (la > 0) L.logo(ctx, W / 2, SAFE.y + 170, 680, { alpha: la });
  }

  Studio.film({
    async init() { await L.load(); },
    draw(ctx, t) {
      if (t < ev.black) actRuido(ctx, t);
      else if (t < ev.pocket) actCorte(ctx, t);
      else actSilencio(ctx, t);
    },
    post: (t) => (t < ev.black ? { grain: 0.06, vignette: 0.3 } : t < ev.pocket ? { grain: 0.03, vignette: 0.25 } : { grain: 0.02, vignette: 0.1 }),
    fadeOut: 0.8,
  });
})();
