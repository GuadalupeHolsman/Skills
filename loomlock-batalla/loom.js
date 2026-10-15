// LOOM — shared flat/editorial look for the Loomlock films: crisp shapes, Inter type, app UI. Pure functions.
(function () {
  const U = globalThis.U;
  const { clamp, lerp, ease } = U;
  const FONT = 'Inter, system-ui, sans-serif';
  const C = {
    ink: '#111114', paper: '#F2EEE8', mute: '#8A8790', line: 'rgba(17,17,20,0.08)',
    violet: '#5B4BDB', violetDeep: '#2A2170', violetLight: '#B9B1FF', red: '#FF4D4F', white: '#FFFFFF',
  };

  const font = (size, weight = 700) => `${weight} ${size}px ${FONT}`;
  function text(ctx, s, x, y, { size = 40, weight = 700, color = C.ink, align = 'left', alpha = 1, spacing = 0, base = 'alphabetic' } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font(size, weight); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    if (spacing) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(s, x, y); ctx.restore();
  }
  function rr(ctx, x, y, w, h, r, fill, { shadow = 0, alpha = 1 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha;
    if (shadow) { ctx.shadowColor = `rgba(10,10,30,${0.18 * shadow})`; ctx.shadowBlur = 40 * shadow; ctx.shadowOffsetY = 14 * shadow; }
    ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore();
  }
  const mix = (a, b, u) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; };
  // background through the day: warm morning -> bright noon -> amber -> dusk -> night
  const DAY = [[9, '#F2EEE8', '#E9E1D5'], [13, '#EAF0F4', '#D7E4EC'], [17, '#F6D9B8', '#EDB98A'], [19.5, '#C9707A', '#5B3D6E'], [21.5, '#1B1A33', '#0E0D1C'], [24, '#0B0A16', '#06050D']];
  function dayColors(h) {
    let i = 0; while (i < DAY.length - 2 && h >= DAY[i + 1][0]) i++;
    const a = DAY[i], b = DAY[i + 1], u = clamp((h - a[0]) / (b[0] - a[0]));
    return [mix(a[1], b[1], u), mix(a[2], b[2], u)];
  }
  function bg(ctx, W, H, c0, c1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

  // a value that rolls like a split-flap when it changes: prev slides up, cur comes from below
  function roll(ctx, prev, cur, u, x, y, { size = 200, weight = 800, color = C.ink, align = 'center' } = {}) {
    const k = ease.outCubic(clamp(u));
    ctx.save();
    ctx.beginPath(); ctx.rect(-5000, y - size * 0.95, 10000, size * 1.15); ctx.clip();
    if (k < 1 && prev !== cur) text(ctx, prev, x, y - size * k, { size, weight, color, align, alpha: 1 - k });
    text(ctx, cur, x, y + size * (1 - k), { size, weight, color, align, alpha: prev === cur ? 1 : k });
    ctx.restore();
  }

  // ---------- app UI (412-pt phone coordinates) ----------
  const ICONS = { M: '#FF7A59', G: '#25D366', O: '#FF4D8D', S: '#7B61FF', '@': '#3B82F6', L: '#111114', P: '#F59E0B', T: '#06B6D4' };
  // notification banner, iOS-like
  function banner(ctx, x, y, w, n, { alpha = 1, scale = 1, rot = 0, dark = false } = {}) {
    const h = 132;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.scale(scale, scale); ctx.translate(-w / 2, -h / 2);
    rr(ctx, 0, 0, w, h, 34, dark ? 'rgba(40,40,48,0.96)' : 'rgba(255,255,255,0.97)', { shadow: 1 });
    rr(ctx, 22, 26, 62, 62, 16, ICONS[n.icon] || C.violet);
    text(ctx, n.icon, 53, 70, { size: 30, weight: 800, color: '#fff', align: 'center' });
    const fg = dark ? '#fff' : C.ink;
    text(ctx, n.app, 104, 50, { size: 24, weight: 700, color: fg });
    text(ctx, 'ahora', w - 24, 50, { size: 21, weight: 500, color: C.mute, align: 'right' });
    text(ctx, n.msg, 104, 90, { size: 25, weight: 500, color: fg });
    ctx.restore();
    return h;
  }

  // infinite feed for the phone screen (w = 412). scroll in points.
  function feed(ctx, w, h, scroll, { seed = 1 } = {}) {
    ctx.fillStyle = '#0E0E12'; ctx.fillRect(0, 0, w, h);
    const ch = 560, i0 = Math.floor(scroll / ch);
    for (let i = i0; i < i0 + 3; i++) {
      const y = 64 + i * ch - scroll;
      const hue = Math.floor(U.hash(i, seed) * 360), hue2 = (hue + 40 + U.hash(i, seed + 1) * 80) % 360;
      const g = ctx.createLinearGradient(0, y, w, y + ch); g.addColorStop(0, `hsl(${hue},70%,62%)`); g.addColorStop(1, `hsl(${hue2},65%,42%)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(10, y + 60, w - 20, ch - 150, 18); ctx.fill();
      // a soft shape "photo" content
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(w * (0.3 + 0.4 * U.hash(i, 7)), y + 60 + (ch - 150) * 0.55, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsl(${hue2},60%,70%)`; ctx.beginPath(); ctx.arc(34, y + 28, 18, 0, Math.PI * 2); ctx.fill();
      rr(ctx, 62, y + 18, 120, 12, 6, 'rgba(255,255,255,0.75)'); rr(ctx, 62, y + 36, 70, 10, 5, 'rgba(255,255,255,0.35)');
      // action row
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(30 + k * 44, y + ch - 66, 12, 0, Math.PI * 2); ctx.stroke(); }
      rr(ctx, 14, y + ch - 36, 200, 10, 5, 'rgba(255,255,255,0.45)');
    }
  }

  // padlock, line-art (open 0 -> 1 shut)
  function lock(ctx, x, y, s, shut = 1, { color = '#fff', lw = 10 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lift = (1 - shut) * 34;
    ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-34, -46 - lift); ctx.arc(0, -46 - lift, 34, Math.PI, 0); ctx.lineTo(34, -6 - lift * 1.3); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-58, -8, 116, 92, 22); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 30, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // phone lock screen when Loomlock is on
  function lockScreen(ctx, w, h, t, t0, { line = 'Modo foco activo' } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3A2EA8'); g.addColorStop(1, '#17123F');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const u = clamp((t - t0) / 0.25);
    lock(ctx, w / 2, h * 0.42, 0.9 + 0.1 * ease.outBack(u, 3), t >= t0 + 0.08 ? 1 : 0, { lw: 9 });
    text(ctx, 'Loomlock', w / 2, h * 0.42 + 150, { size: 40, weight: 800, color: '#fff', align: 'center', alpha: u });
    text(ctx, line, w / 2, h * 0.42 + 196, { size: 22, weight: 500, color: C.violetLight, align: 'center', alpha: u });
  }

  // end card: near-black, line lock that clicks shut at tClick, wordmark, tagline
  function endCard(ctx, t, t0, tClick, W, H, { tagline = '', sub = '' } = {}) {
    const u = clamp((t - t0) / 0.4);
    if (u <= 0) return;
    ctx.save();
    ctx.fillStyle = C.ink; ctx.globalAlpha = ease.outCubic(u); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 700);
    glow.addColorStop(0, `rgba(91,75,219,${0.35 * u})`); glow.addColorStop(1, 'rgba(91,75,219,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    const a = clamp((t - t0 - 0.2) / 0.4);
    const shut = clamp((t - tClick + 0.12) / 0.12);
    const kick = t >= tClick ? U.springKick(t, tClick, 5, 8) * 0.08 : 0;
    lock(ctx, W / 2, H * 0.42 - 40, 1.6 * (1 + kick), shut, { color: '#fff', lw: 9 });
    ctx.globalAlpha = a;
    const w2 = clamp((t - tClick) / 0.35);
    text(ctx, 'Loomlock', W / 2, H * 0.42 + 250 + 20 * (1 - ease.outCubic(w2)), { size: 128, weight: 800, color: '#fff', align: 'center', alpha: w2, spacing: -4 });
    const tg = clamp((t - tClick - 0.45) / 0.4);
    if (tagline) text(ctx, tagline, W / 2, H * 0.42 + 340, { size: 44, weight: 500, color: C.violetLight, align: 'center', alpha: tg });
    if (sub) text(ctx, sub, W / 2, H * 0.42 + 400, { size: 34, weight: 500, color: C.mute, align: 'center', alpha: tg });
    ctx.restore();
  }

  globalThis.Loom = { C, FONT, font, text, rr, mix, dayColors, bg, roll, banner, feed, lock, lockScreen, endCard };
})();
