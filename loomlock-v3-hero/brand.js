// LOOMLOCK BRAND KIT (from the Brandbook): palette, Montserrat/Baloo type, keys, app screens,
// brand backdrops (giant outline marks + 4-point sparkles). Loaded after loom.js. Pure draws of (args, t).
(function () {
  const U = globalThis.U, Studio = globalThis.Studio, L = globalThis.LOOM;
  const { clamp, lerp, ease } = U;

  const P = { // Brandbook §2 core + §2.1 accents + §4 Locky
    blue: '#3F49CC', lilac: '#878EE5', mid: '#5F68D7', royal: '#1D29C2', deep: '#121B95', navy: '#121C66', ink: '#141C62',
    lav: '#C0C8FF', mist: '#EEF0FF', white: '#FFFFFF', black: '#000000',
    yellow: '#FCCE21', butter: '#FFE799', sky: '#9FD8FF', locky: '#3B5CFF', pink: '#FF97D5',
    red: '#E83852', coral: '#FF5E48', green: '#68EE8F', mint: '#ABF4BE', emerald: '#1DB267', violet: '#7037CA', plum: '#400B93', magenta: '#D75FEF',
  };
  // each key: brand base + ONE accent ("accents add emotion, they never overwhelm structure")
  const KEY = {
    cine: { id: 'cine', name: 'CINE', accent: P.red, accent2: '#FF97D5', mode: 'Modo Cine', line: 'Solo la peli.', note: 'Todo lo demás, en pausa hasta que acabe la función.' },
    gym: { id: 'gym', name: 'GYM', accent: P.green, accent2: P.mint, mode: 'Modo Gym', line: 'Solo tu rutina.', note: 'Cronómetro y música. Nada más.' },
    foco: { id: 'foco', name: 'FOCO', accent: P.yellow, accent2: P.butter, mode: 'Modo Foco', line: 'Solo tu trabajo.', note: 'Un documento. Cero notificaciones.' },
    dormir: { id: 'dormir', name: 'DORMIR', accent: P.lav, accent2: P.lilac, mode: 'Modo Dormir', line: 'Solo descansar.', note: 'Mañana sigue. Hoy, a dormir.' },
  };

  async function loadFonts() {
    for (const [fam, file, extra] of [['Montserrat', 'fonts/Montserrat-VF.ttf', {}], ['Montserrat', 'fonts/Montserrat-Italic-VF.ttf', { style: 'italic' }], ['Baloo Bhaina 2', 'fonts/BalooBhaina2-VF.ttf', {}]]) {
      try { const f = new FontFace(fam, `url(${file})`, { weight: '100 900', ...extra }); document.fonts.add(f); await f.load(); } catch (e) { console.error('font', fam, String(e)); }
    }
  }
  const font = (size, weight = 800, { italic = false, fam = 'Montserrat' } = {}) => `${italic ? 'italic ' : ''}${weight} ${size}px "${fam}", system-ui, sans-serif`;
  function text(ctx, s, x, y, { size = 60, weight = 800, color = P.white, align = 'left', italic = false, fam, alpha = 1, spacing = 0, maxW } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font(size, weight, { italic, fam }); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
    if (spacing) ctx.letterSpacing = `${spacing}px`;
    if (maxW) { const w = ctx.measureText(s).width; if (w > maxW) { ctx.translate(x, y); ctx.scale(maxW / w, maxW / w); ctx.fillText(s, 0, 0); ctx.restore(); return; } }
    ctx.fillText(s, x, y); ctx.restore();
  }
  const measure = (ctx, s, size, weight = 800, o = {}) => { ctx.save(); ctx.font = font(size, weight, o); const w = ctx.measureText(s).width; ctx.restore(); return w; };
  // navy pill with italic copy (the "Core Idea" tagline device)
  function pill(ctx, s, cx, cy, { size = 40, bg = P.navy, fg = P.white, italic = true, weight = 700, padX = 40, h } = {}) {
    const w = measure(ctx, s, size, weight, { italic }) + padX * 2, hh = h || size * 1.75;
    ctx.save(); ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - hh / 2, w, hh, hh / 2); ctx.fill(); ctx.restore();
    text(ctx, s, cx, cy + size * 0.36, { size, weight, color: fg, align: 'center', italic });
    return w;
  }

  // ---------- the hex mark as an outline path (traced from the logo's grid: two interlocking "L" prisms) ----------
  // drawn from the real logo image so it is always exact
  function markOutline(ctx, cx, cy, h, { color = 'rgba(255,255,255,0.08)' } = {}) {
    const img = L.IMG.logoW; if (!img) return;
    // the mark occupies x 55-225 / y 178-425 of the 792×612 artboard
    const s = h / 247;
    ctx.save(); ctx.globalAlpha *= 1; ctx.filter = 'none';
    const c = markOutline.cache || (markOutline.cache = (() => {
      const cv = document.createElement('canvas'); cv.width = 680; cv.height = 990; const g = cv.getContext('2d');
      const k = 990 / 247; g.drawImage(img, -55 * k, -178 * k, 792 * k, 612 * k); return cv;
    })());
    ctx.globalAlpha = 1;
    const tmp = markOutline.tint || (markOutline.tint = document.createElement('canvas'));
    tmp.width = c.width; tmp.height = c.height; const tg = tmp.getContext('2d');
    tg.drawImage(c, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = color; tg.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(tmp, cx - 170 * s / 2, cy - h / 2, 170 * s, h);
    ctx.restore();
  }
  // brand 4-point sparkle
  function sparkle(ctx, x, y, r, color = P.white, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.quadraticCurveTo(Math.cos(a + Math.PI / 4) * r * 0.18, Math.sin(a + Math.PI / 4) * r * 0.18, Math.cos(a + Math.PI / 2) * r, Math.sin(a + Math.PI / 2) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function sparkles(ctx, W, H, t, { n = 14, seed = 3, color = P.white, alpha = 0.8, top = 0, bottom = 1 } = {}) {
    for (let i = 0; i < n; i++) {
      const x = U.hash(i, seed) * W, y = (top + U.hash(i, seed + 1) * (bottom - top)) * H + Math.sin(t * 0.6 + i) * 8;
      const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + U.hash(i, seed + 2) * 2) + i * 2);
      ctx.save(); ctx.globalAlpha = alpha * tw; sparkle(ctx, x, y, 10 + 18 * U.hash(i, seed + 3), i % 5 === 0 ? P.yellow : color, t * 0.2 + i); ctx.restore();
    }
  }
  // a brand backdrop canvas (cached per variant): gradient + two giant outline marks bleeding off the frame
  const BACK = {
    chaos: ['#2A2F9E', '#0B0F4A', 'rgba(192,200,255,0.10)'], cine: ['#3F49CC', '#121B95', 'rgba(255,255,255,0.09)'],
    gym: ['#3F49CC', '#121C66', 'rgba(255,255,255,0.09)'], foco: ['#5F68D7', '#1D29C2', 'rgba(255,255,255,0.10)'],
    dormir: ['#2B1B8F', '#0A0B3D', 'rgba(192,200,255,0.10)'], lock: ['#3F49CC', '#1D29C2', 'rgba(255,255,255,0.10)'], studio: ['#4A55D6', '#1D29C2', 'rgba(255,255,255,0.10)'],
  };
  const backCache = {};
  function backdrop(id, w = 1080, h = 1920) {
    const key = id + w; if (backCache[key]) return backCache[key];
    const [c0, c1, line] = BACK[id] || BACK.lock, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    const gr = g.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.5, h * 0.75); gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    markOutline(g, w * 0.08, h * 0.18, h * 0.62, { color: line });
    markOutline(g, w * 0.98, h * 0.86, h * 0.7, { color: line });
    backCache[key] = cv; return cv;
  }

  // ---------- mode icons (rounded, organic) ----------
  const ICON = {
    cine(g, c) { g.fillStyle = '#FFF4D6'; for (const [x, y, r] of [[-26, -30, 18], [0, -40, 20], [26, -30, 18], [-12, -50, 14], [14, -52, 14]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(-40, -22); g.lineTo(40, -22); g.lineTo(30, 48); g.quadraticCurveTo(0, 54, -30, 48); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill();
      g.save(); g.clip(); g.fillStyle = c; for (let i = -3; i <= 3; i += 2) g.fillRect(i * 12 - 6, -24, 12, 80); g.restore(); },
    gym(g, c) { g.fillStyle = c; g.beginPath(); g.roundRect(-30, -7, 60, 14, 7); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s > 0 ? 28 : -44, -32, 16, 64, 8); g.fill(); g.beginPath(); g.roundRect(s > 0 ? 46 : -56, -20, 10, 40, 5); g.fill(); } },
    foco(g, c) { for (const [r, f] of [[46, c], [33, '#FFFFFF'], [20, c], [8, '#FFFFFF']]) { g.fillStyle = f; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); } },
    dormir(g, c) { g.save(); g.beginPath(); g.rect(-60, -60, 120, 120); g.arc(16, -14, 34, 0, 7); g.clip('evenodd'); g.fillStyle = c; g.beginPath(); g.arc(-4, 0, 40, 0, 7); g.fill(); g.restore(); sparkle(g, 32, 26, 14, c); },
  };
  const icon = (g, id, x, y, s, c) => { g.save(); g.translate(x, y); g.scale(s / 100, s / 100); ICON[id](g, c); g.restore(); };

  // ---------- the KEY card (brand edition): royal-blue card, giant outline mark, accent tab ----------
  function keyCard(g, id, w) {
    const k = KEY[id], h = w / 1.586, r = w * 0.075;
    g.save(); g.translate(-w / 2, -h / 2);
    g.save(); g.beginPath(); g.roundRect(0, 0, w, h, r); g.clip();
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, P.blue); gr.addColorStop(1, P.royal); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    markOutline(g, w * 0.86, h * 0.62, h * 1.5, { color: 'rgba(255,255,255,0.13)' });
    g.fillStyle = k.accent; g.fillRect(0, h * 0.78, w, h * 0.22); // accent band
    const sh = g.createLinearGradient(0, 0, w * 0.6, h); sh.addColorStop(0, 'rgba(255,255,255,0.22)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
    g.restore();
    // logo, top-left
    if (L.IMG.logoW) { const lw = w * 0.42, lh = lw * 612 / 792; g.drawImage(L.IMG.logoW, w * 0.035, -lh * 0.28, lw, lh); }
    // contactless waves
    g.strokeStyle = P.white; g.lineWidth = w * 0.016; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w * 0.86, h * 0.2, w * (0.025 + i * 0.03), -0.8, 0.8); g.stroke(); }
    // icon in an accent disc
    g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.arc(w * 0.8, h * 0.5, h * 0.2, 0, 7); g.fill();
    icon(g, id, w * 0.8, h * 0.52, h * 0.3, id === 'cine' ? k.accent : k.accent);
    text(g, 'KEY', w * 0.075, h * 0.46, { size: h * 0.09, weight: 700, color: P.lav, spacing: h * 0.02 });
    text(g, k.name, w * 0.07, h * 0.66, { size: h * 0.2, weight: 800, color: P.white, maxW: w * 0.6 });
    text(g, k.line.toUpperCase(), w * 0.075, h * 0.915, { size: h * 0.075, weight: 800, color: id === 'dormir' || id === 'foco' || id === 'gym' ? P.navy : P.white, spacing: h * 0.008 });
    g.restore();
  }

  // ---------- the app (as in the Brandbook UI page: calm lavender, brand-blue buttons) ----------
  function appScreen(g, w, h, t, id, t0) {
    const k = KEY[id], u = Math.max(0, t - t0);
    g.fillStyle = P.mist; g.fillRect(0, 0, w, h);
    // header
    if (L.IMG.logo) { const lw = 120, lh = lw * 612 / 792; g.drawImage(L.IMG.logo, w / 2 - lw / 2 - 30, 62, lw, lh); }
    text(g, 'Sesión activa', w / 2, 168, { size: 15, weight: 600, color: P.mid, align: 'center' });
    // hero card
    const pop = U.ease.outBack(clamp(u / 0.4), 1.6);
    g.save(); g.translate(w / 2, 420); g.scale(pop, pop);
    g.fillStyle = P.white; g.beginPath(); g.roundRect(-176, -210, 352, 420, 34); g.fill();
    g.strokeStyle = 'rgba(63,73,204,0.12)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = k.accent; g.beginPath(); g.arc(0, -82, 82, 0, 7); g.fill();
    icon(g, id, 0, -78, 108, id === 'cine' ? P.red : P.navy);
    text(g, k.mode, 0, 52, { size: 34, weight: 800, color: P.navy, align: 'center' });
    // a calm progress ring / time
    const prog = clamp(u / 6);
    g.lineWidth = 10; g.lineCap = 'round'; g.strokeStyle = P.lav; g.beginPath(); g.arc(0, 128, 38, 0, 7); g.stroke();
    g.strokeStyle = P.blue; g.beginPath(); g.arc(0, 128, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.08 + prog * 0.5)); g.stroke();
    text(g, id === 'dormir' ? '6:30' : id === 'gym' ? '0:45' : id === 'foco' ? '25:00' : '2h', 0, 136, { size: 20, weight: 800, color: P.navy, align: 'center' });
    g.restore();
    text(g, k.note, w / 2, 690, { size: 15, weight: 500, color: P.ink, align: 'center', maxW: w - 70, alpha: clamp((u - 0.25) / 0.3) });
    // locked apps, calm
    const a = clamp((u - 0.35) / 0.3);
    for (let i = 0; i < 5; i++) {
      const cx = w / 2 + (i - 2) * 64, cy = 760;
      g.save(); g.globalAlpha = a; g.fillStyle = P.lav; g.beginPath(); g.roundRect(cx - 24, cy - 24, 48, 48, 14); g.fill();
      L.lockGlyph(g, cx, cy + 2, 18, P.mid); g.restore();
    }
    // brand button
    g.save(); g.globalAlpha = a; g.fillStyle = P.blue; g.beginPath(); g.roundRect(w / 2 - 120, h - 150, 240, 52, 26); g.fill(); g.restore();
    text(g, 'Terminar sesión', w / 2, h - 117, { size: 17, weight: 700, color: P.white, align: 'center', alpha: a });
  }

  globalThis.BRAND = { P, KEY, loadFonts, font, text, measure, pill, markOutline, sparkle, sparkles, backdrop, icon, keyCard, appScreen };
})();
