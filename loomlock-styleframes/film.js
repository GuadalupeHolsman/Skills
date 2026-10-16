// STYLE FRAMES — the same moment (the reflex + the key) in three looks. t in [0,1) A, [1,2) B, [2,3) C.
(function () {
  const U = globalThis.U, UI = globalThis.UI, L = globalThis.Loom, Studio = globalThis.Studio, S = globalThis.SCORE;
  const W = S.W, H = S.H;
  const cover = (ctx, im, x, y, w, h) => { if (!im) return; const k = Math.max(w / im.width, h / im.height); ctx.drawImage(im, x + (w - im.width * k) / 2, y + (h - im.height * k) / 2, im.width * k, im.height * k); };
  const outlined = (ctx, s, x, y, size, fill, stroke, rot = 0, align = 'center') => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = L.font(size, 800); ctx.textAlign = align; ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(s, 0, 0); ctx.fillStyle = fill; ctx.fillText(s, 0, 0); ctx.restore();
  };
  const sticker = (ctx, art, x, y, w, rot) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = w * 505 / 800; L.rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 28, '#fff', { shadow: 1 }); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.clip(); cover(ctx, L.img(art), -w / 2, -h / 2, w, h); ctx.restore(); };
  const reelScreen = (t) => { const f = (c, w, h) => L.reel(c, w, h, 4, t, { app: 'Instagram' }); f.dark = true; return f; };

  // A — "brainrot collage": the brand's own illustrated world, loud stickers and chunky type
  function A(ctx, t) {
    cover(ctx, L.img('pattern'), 0, 0, W, H);
    ctx.fillStyle = 'rgba(62,72,203,0.55)'; ctx.fillRect(0, 0, W, H);
    sticker(ctx, 'planet', 230, 560, 380, -0.16);
    sticker(ctx, 'landscape', 860, 1420, 360, 0.14);
    sticker(ctx, 'mascot', 170, 1460, 300, 0.1);
    UI.phone(ctx, 560, 1080, 900, reelScreen(t), t, { time: '16:40', sketch: false, dark: true, rot: 0.06 });
    L.key(ctx, 740, 1330, 520, { rot: -0.18, art: 'dragon', t: 0.3 });
    outlined(ctx, 'NOBODY', W / 2, 330, 150, '#FFD43B', '#151A4A', -0.05);
    outlined(ctx, 'TEXTED YOU.', W / 2, 470, 120, '#FFFFFF', '#151A4A', -0.05);
    L.rr(ctx, 120, 1560, 840, 120, 60, '#151A4A');
    L.text(ctx, '87 unlocks · 0 notifications', W / 2, 1636, { size: 46, weight: 700, color: '#FFD43B', align: 'center' });
  }

  // B — "dark premium": cinematic black, blue rim light, the key as a lit hero object
  function B(ctx, t) {
    ctx.fillStyle = '#05060D'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, 1050, 50, W / 2, 1050, 900); g.addColorStop(0, 'rgba(62,72,203,0.55)'); g.addColorStop(0.5, 'rgba(32,39,135,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = 'rgba(90,110,255,0.8)'; ctx.shadowBlur = 120;
    const scr = (c, w, h) => L.lockScreen(c, w, h, 1, 0, { line: 'Session on · Focus' }); scr.dark = true;
    UI.phone(ctx, W / 2, 1060, 980, scr, t, { time: '16:40', sketch: false, dark: true });
    ctx.restore();
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.globalAlpha = 0.5 - k * 0.15; ctx.strokeStyle = '#8E9BFF'; ctx.lineWidth = 6 - k * 1.5; ctx.beginPath(); ctx.arc(W / 2, 1000, 330 + k * 110, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.shadowColor = 'rgba(255,200,120,0.5)'; ctx.shadowBlur = 80; L.key(ctx, 640, 1330, 600, { rot: -0.12, art: 'dragon', t: 0.45 }); ctx.restore();
    L.text(ctx, 'Nobody texted you.', W / 2, 330, { size: 70, weight: 600, color: '#FFFFFF', align: 'center' });
    L.text(ctx, 'You picked it up anyway.', W / 2, 410, { size: 46, weight: 400, color: '#9AA3D9', align: 'center' });
  }

  // C — "bold poster": giant Swiss-style type on brand blue, the phone as a small object
  function C(ctx, t) {
    L.brandBg(ctx, 0, 0, W, H);
    L.text(ctx, '87', 70, 560, { size: 420, weight: 800, color: '#FFFFFF', spacing: -20 });
    L.text(ctx, 'UNLOCKS', 80, 680, { size: 120, weight: 800, color: '#FFFFFF', spacing: -4 });
    L.text(ctx, '0', 70, 1050, { size: 420, weight: 800, color: '#FFD43B', spacing: -20 });
    L.text(ctx, 'NOTIFICATIONS', 80, 1170, { size: 104, weight: 800, color: '#FFD43B', spacing: -4 });
    UI.phone(ctx, 810, 1560, 440, reelScreen(t), t, { time: '16:40', sketch: false, dark: true, rot: 0.12 });
    L.key(ctx, 370, 1560, 480, { rot: -0.1, art: 'ship', t: 0.2 });
    L.text(ctx, "It's not the phone. It's the impulse.", W / 2, 1310, { size: 46, weight: 600, color: '#ECEDFF', align: 'center' });
  }

  Studio.film({
    init: () => L.loadBrand(Studio),
    draw(ctx, t) { if (t < 1) A(ctx, t); else if (t < 2) B(ctx, t); else C(ctx, t); },
    post: { paper: 0, vignette: 0.1, grain: 0.02 },
    fadeOut: 0,
  });
})();
