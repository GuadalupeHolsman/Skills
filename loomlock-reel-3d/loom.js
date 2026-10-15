// LOOMLOCK shared kit: keys (NFC cards), mode screens, the "chaos" phone, Locky and the logo.
// Loaded after engine/video/boot.js and before film.js. Every draw is a pure function of its args + t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;

  // brand palette (from Locky / logo files in Drive)
  const B = { blue: '#3F49CC', sky: '#9FD8FF', lilac: '#878EE5', ink: '#0E0F1A', paper: '#F3F5FF', white: '#FFFFFF' };

  const IMG = { locky: null, logo: null, logoW: null };
  async function load() {
    try { IMG.locky = await Studio.loadImage('assets/locky.svg'); } catch (e) { console.error(String(e)); }
    try { IMG.logo = await Studio.loadImage('assets/logo.svg'); } catch (e) { console.error(String(e)); }
    try { IMG.logoW = await Studio.loadImage('assets/logo-white.svg'); } catch (e) { console.error(String(e)); }
  }

  // ---------- icons (drawn in a 100×100 box centred at 0,0) ----------
  const ICON = {
    cine(ctx, c) { // popcorn bucket
      ctx.fillStyle = '#FFF4D6';
      for (const [x, y, r] of [[-26, -30, 18], [0, -40, 20], [26, -30, 18], [-12, -50, 14], [14, -52, 14]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-40, -22); ctx.lineTo(40, -22); ctx.lineTo(30, 48); ctx.lineTo(-30, 48); ctx.closePath();
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = c; for (let i = -3; i <= 3; i += 2) ctx.fillRect(i * 12 - 6, -24, 12, 80); ctx.restore();
    },
    gym(ctx, c) { // dumbbell
      ctx.fillStyle = c;
      ctx.fillRect(-30, -6, 60, 12);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s * 30 - (s > 0 ? 0 : 16), -30, 16, 60, 5); ctx.fill(); ctx.beginPath(); ctx.roundRect(s * 48 - (s > 0 ? 0 : 10), -20, 10, 40, 4); ctx.fill(); }
    },
    foco(ctx, c) { // target
      for (const [r, f] of [[46, c], [33, '#FFFFFF'], [20, c], [8, '#FFFFFF']]) { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); }
    },
    dormir(ctx, c) { // crescent moon + star
      ctx.save(); ctx.beginPath(); ctx.rect(-60, -60, 120, 120); ctx.arc(16, -14, 34, 0, 7); ctx.clip('evenodd');
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(-4, 0, 40, 0, 7); ctx.fill(); ctx.restore();
      G.star(ctx, 30, 26, 10, { fill: c });
    },
    fiesta(ctx, c) { // music note
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(-18, 30, 16, 12, -0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(26, 20, 16, 12, -0.4, 0, 7); ctx.fill();
      ctx.fillRect(-4, -40, 8, 70); ctx.fillRect(40, -50, 8, 70);
      ctx.beginPath(); ctx.moveTo(-4, -40); ctx.lineTo(48, -50); ctx.lineTo(48, -34); ctx.lineTo(-4, -24); ctx.fill();
    },
  };
  function icon(ctx, kind, x, y, size, color) { ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, size / 100); ICON[kind](ctx, color); ctx.restore(); }

  // ---------- the keys ----------
  const KEYS = {
    cine: { id: 'cine', name: 'CINE', mode: 'Modo Cine', line: 'Solo la peli.', bg: '#E63946', deep: '#1A0B10', fg: '#FFFFFF', text: 'Todo en pausa hasta que acabe la función' },
    gym: { id: 'gym', name: 'GYM', mode: 'Modo Gym', line: 'Solo tu rutina.', bg: '#B8F35A', deep: '#10170A', fg: '#10170A', text: 'Cronómetro y playlist. Nada más.' },
    foco: { id: 'foco', name: 'FOCO', mode: 'Modo Foco', line: 'Solo tu trabajo.', bg: '#FFC93C', deep: '#1C1606', fg: '#1C1606', text: 'Un documento. Cero notificaciones.' },
    dormir: { id: 'dormir', name: 'DORMIR', mode: 'Modo Dormir', line: 'Solo la alarma.', bg: '#7B74FF', deep: '#0B0B26', fg: '#FFFFFF', text: 'Buenas noches. Mañana seguimos.' },
    fiesta: { id: 'fiesta', name: 'FIESTA', mode: 'Modo Fiesta', line: 'Solo la música.', bg: '#FF5FB8', deep: '#1A0714', fg: '#FFFFFF', text: 'Cámara y música. El resto, mañana.' },
  };

  // an NFC key card centred at (x, y), w wide (credit-card ratio)
  function key(ctx, k, x, y, w, { rot = 0, alpha = 1, glow = 0 } = {}) {
    const h = w / 1.586, r = w * 0.07;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
    ctx.fillStyle = 'rgba(10,10,30,0.25)'; ctx.beginPath(); ctx.roundRect(-w / 2 + w * 0.02, -h / 2 + w * 0.035, w, h, r); ctx.fill();
    if (glow > 0.01) { ctx.save(); ctx.shadowColor = k.bg; ctx.shadowBlur = 80 * glow; ctx.fillStyle = k.bg; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = k.bg; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill();
    // sheen
    ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = w * 0.012; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.stroke();
    // logo mark top-left
    const L = k.fg === '#FFFFFF' ? IMG.logoW : IMG.logo;
    if (L) { const lw = w * 0.42, lh = lw * 612 / 792; ctx.drawImage(L, -w / 2 + w * 0.0, -h / 2 - lh * 0.33, lw, lh); }
    // contactless waves top-right
    ctx.strokeStyle = k.fg; ctx.lineWidth = w * 0.018; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(w * 0.30, -h * 0.30, w * (0.03 + i * 0.035), -0.8, 0.8); ctx.stroke(); }
    // mode icon + name
    icon(ctx, k.id, w * 0.32, h * 0.10, w * 0.24, k.fg === '#FFFFFF' ? '#FFFFFF' : k.deep);
    UI.text(ctx, k.name, -w / 2 + w * 0.08, h * 0.36, { size: w * 0.15, weight: 900, color: k.fg, spacing: w * 0.004, maxW: w * 0.6 });
    UI.text(ctx, 'KEY', -w / 2 + w * 0.08, h * 0.14, { size: w * 0.06, weight: 800, color: k.fg, spacing: w * 0.01, alpha: 0.7 });
    ctx.restore();
  }

  // ---------- the chaos screen: app grid + notifications piling up ----------
  const APPS = ['#FF3B5C', '#25D366', '#1DA1F2', '#FF0050', '#FFB000', '#7B61FF', '#00C2FF', '#FF7A00', '#E1306C', '#34C759', '#5865F2', '#FF2D55', '#0A84FF', '#FFD60A', '#BF5AF2', '#30D158', '#FF9F0A', '#64D2FF', '#FF453A', '#AC8E68'];
  const NOTES = [
    ['Grupo Familia', '47 mensajes nuevos'], ['Oferta flash', '¡Solo por hoy! 70% OFF'], ['Ana', 'mira este video jajaja'],
    ['Trabajo', 'Reunión movida a las 7am'], ['Te etiquetaron', 'en 3 fotos'], ['Noticias', 'Última hora: ...'],
    ['Juego', 'Tus vidas están llenas'], ['Banco', 'Movimiento en tu cuenta'], ['Live', 'Alguien que sigues está en vivo'],
    ['Correo', '128 sin leer'], ['Delivery', 'Tu pedido va en camino'], ['Grupo U', '@todos urgente'],
  ];
  // n = how many notifications are visible (fractional = the newest slides in); shake 0..1
  function chaosScreen(ctx, w, h, t, n, { shake = 0 } = {}) {
    const bg = ctx.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#2B2F6B'); bg.addColorStop(1, '#5A2B6B');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const sx = shake * 4 * Math.sin(t * 90), sy = shake * 3 * Math.cos(t * 77);
    ctx.save(); ctx.translate(sx, sy);
    for (let i = 0; i < 20; i++) {
      const cx = 52 + (i % 4) * 103, cy = 120 + Math.floor(i / 4) * 112;
      ctx.fillStyle = APPS[i]; ctx.beginPath(); ctx.roundRect(cx - 34, cy - 34, 68, 68, 17); ctx.fill();
      const badge = Math.floor(U.hash(i, 3) * 99) + 1;
      if (U.hash(i, 9) < 0.65) {
        ctx.fillStyle = '#FF3B30'; ctx.beginPath(); ctx.arc(cx + 30, cy - 30, 14, 0, 7); ctx.fill();
        UI.text(ctx, String(badge), cx + 30, cy - 24, { size: 14, weight: 800, color: '#FFFFFF', align: 'center' });
      }
    }
    // notifications stack from the top
    const shown = Math.ceil(n);
    for (let j = 0; j < shown; j++) {
      const idx = j % NOTES.length, frac = j === shown - 1 ? clamp(n - j) : 1;
      const slot = shown - 1 - j; // newest on top
      const y = 66 + Math.min(slot, 7) * 26 - (1 - ease.outCubic(frac)) * 90, sc = 1 - Math.min(slot, 7) * 0.035;
      ctx.save(); ctx.globalAlpha = clamp(frac * 3) * (slot > 7 ? 0 : 1); ctx.translate(w / 2, y + 40); ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(250,250,255,0.96)'; ctx.beginPath(); ctx.roundRect(-188, -40, 376, 84, 22); ctx.fill();
      ctx.fillStyle = APPS[(j * 7) % APPS.length]; ctx.beginPath(); ctx.roundRect(-172, -22, 44, 44, 11); ctx.fill();
      UI.text(ctx, NOTES[idx][0], -114, -6, { size: 17, weight: 800, color: '#111' });
      UI.text(ctx, NOTES[idx][1], -114, 18, { size: 15, weight: 500, color: '#555', maxW: 290 });
      UI.text(ctx, 'ahora', 172, -6, { size: 13, weight: 500, color: '#888', align: 'right' });
      ctx.restore();
    }
    ctx.restore();
  }
  chaosScreen.dark = true;

  // ---------- one mode screen per key (t0 = when the mode turned on) ----------
  function modeScreen(ctx, w, h, t, k, t0) {
    const u = t - t0;
    ctx.fillStyle = k.deep; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h * 0.36, 10, w / 2, h * 0.36, w * 0.9);
    g.addColorStop(0, k.bg + '66'); g.addColorStop(1, k.bg + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const ip = UI.pop(t, t0 + 0.08, 0.35, 2);
    // mode-specific hero
    ctx.save(); ctx.translate(w / 2, h * 0.34); ctx.scale(ip, ip);
    if (k.id === 'gym' || k.id === 'foco') {
      const total = k.id === 'gym' ? 45 : 25 * 60, el = Math.max(0, u) * (k.id === 'gym' ? 1 : 3);
      UI.ring(ctx, 0, 0, 120, 1 - (el % total) / total, { color: k.bg, track: 'rgba(255,255,255,0.12)', lw: 18 });
      const s = Math.max(0, Math.floor(total - el));
      UI.text(ctx, `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, 0, 22, { size: 64, weight: 800, color: '#FFFFFF', align: 'center' });
      icon(ctx, k.id, 0, -64, 46, k.bg);
    } else if (k.id === 'dormir') {
      for (let i = 0; i < 14; i++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(u * 2 + i)); ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`; ctx.beginPath(); ctx.arc((U.hash(i, 1) - 0.5) * 380, (U.hash(i, 2) - 0.5) * 300, 2 + U.hash(i, 4) * 3, 0, 7); ctx.fill(); }
      icon(ctx, 'dormir', 0, -30, 170, k.bg);
      UI.text(ctx, '6:30', 0, 140, { size: 72, weight: 800, color: '#FFFFFF', align: 'center' });
      UI.text(ctx, 'ALARMA', 0, 172, { size: 15, weight: 800, color: k.bg, align: 'center', spacing: 3 });
    } else {
      ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill();
      icon(ctx, k.id, 0, 6, 150, k.id === 'cine' ? k.deep : '#FFFFFF');
    }
    ctx.restore();
    const tp = UI.fadeIn(t, t0 + 0.2, 0.3);
    UI.text(ctx, k.mode, w / 2, h * 0.62, { size: 40, weight: 900, color: '#FFFFFF', align: 'center', alpha: tp });
    UI.text(ctx, k.text, w / 2, h * 0.62 + 40, { size: 17, weight: 500, color: 'rgba(255,255,255,0.75)', align: 'center', alpha: tp, maxW: w - 60 });
    // the rest of the apps: asleep in a row, greyed, with a tiny lock
    const ap = UI.fadeIn(t, t0 + 0.35, 0.3);
    for (let i = 0; i < 5; i++) {
      const cx = w / 2 + (i - 2) * 66, cy = h * 0.80;
      ctx.save(); ctx.globalAlpha = ap * 0.35; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(cx - 24, cy - 24, 48, 48, 12); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = ap; lockGlyph(ctx, cx, cy + 2, 18, k.deep); ctx.restore();
    }
    UI.text(ctx, 'todo lo demás, en pausa', w / 2, h * 0.80 + 54, { size: 14, weight: 600, color: 'rgba(255,255,255,0.55)', align: 'center', alpha: ap });
  }
  function lockGlyph(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = s * 0.18;
    ctx.beginPath(); ctx.arc(0, -s * 0.15, s * 0.32, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-s * 0.45, -s * 0.15, s * 0.9, s * 0.7, s * 0.12); ctx.fill(); ctx.restore();
  }

  // a screen that morphs: prev screen, then the new one revealed by a circle growing from (tx, ty)
  function morph(ctx, w, h, t, t0, drawPrev, drawNext, { tx = w / 2, ty = 80, dur = 0.38 } = {}) {
    const p = clamp((t - t0) / dur);
    if (p < 1) drawPrev(ctx, w, h, t);
    if (p <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.arc(tx, ty, Math.hypot(w, h) * ease.inOutCubic(p), 0, 7); ctx.clip();
    drawNext(ctx, w, h, t); ctx.restore();
  }

  // ---------- Locky (the mascot). (x, y) = feet, size = drawn height of the 1024 artboard ----------
  // eyes: 'open' | 'closed' | 'happy' ; prop drawn by the caller
  function locky(ctx, x, y, size, { eyes = 'open', rot = 0, sx = 1, sy = 1, flip = false } = {}) {
    if (!IMG.locky) return;
    const k = size / 1024;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx * (flip ? -1 : 1), sy); ctx.scale(k, k); ctx.translate(-512, -880);
    ctx.drawImage(IMG.locky, 0, 0, 1024, 1024);
    if (eyes !== 'open') {
      for (const ex of [440, 652]) {
        ctx.fillStyle = B.blue; ctx.beginPath(); ctx.arc(ex, 502, 46, 0, 7); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
        if (eyes === 'closed') ctx.arc(ex, 490, 30, 0.25 * Math.PI, 0.75 * Math.PI); else ctx.arc(ex, 520, 30, 1.25 * Math.PI, 1.75 * Math.PI);
        ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
      }
    }
    ctx.restore();
  }

  // the full logo (mark + wordmark), centred at (x, y), w wide
  function logo(ctx, x, y, w, { white = false, alpha = 1 } = {}) {
    const img = white ? IMG.logoW : IMG.logo; if (!img) return;
    const h = w * 612 / 792; ctx.save(); ctx.globalAlpha *= alpha;
    // the artwork sits in the middle band of its 792×612 box (y 180..420): centre on that band
    ctx.drawImage(img, x - w / 2, y - h * (300 / 612), w, h); ctx.restore();
  }

  globalThis.LOOM = { B, KEYS, IMG, load, icon, key, chaosScreen, modeScreen, morph, locky, logo, lockGlyph };
})();
