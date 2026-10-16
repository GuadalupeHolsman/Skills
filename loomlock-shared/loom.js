// LOOM — shared look for the loomlock films: brand blue, Lexend type, the real mark, app UI. Pure functions.
(function () {
  const U = globalThis.U;
  const { clamp, lerp, ease } = U;
  const FONT = 'Lexend, Inter, system-ui, sans-serif';
  const C = {
    // loomlock brand (sampled from the App Store screenshots): blue gradient, lavender cards, white
    ink: '#151A4A', paper: '#F4F5FF', mute: '#7D82A8', line: 'rgba(21,26,74,0.08)',
    violet: '#3E48CB', violetDeep: '#202787', violetLight: '#ECEDFF', red: '#FF4D4F', white: '#FFFFFF',
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
  const DAY = [[9, '#F4F5FF', '#E4E6FB'], [13, '#EAF0F4', '#D7E4EC'], [17, '#F6D9B8', '#EDB98A'], [19.5, '#C9707A', '#5B3D6E'], [21.5, '#1B1A33', '#0E0D1C'], [24, '#0B0A16', '#06050D']];
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

  // brand assets, loaded once in Studio.film init
  let LOGO = null, PATTERN = null;
  const ART = {};
  async function loadBrand(Studio) {
    await Studio.loadFont('Lexend', 'assets/Lexend.woff2', '100 900');
    LOGO = await Studio.loadImage('assets/loomlock-logo.png');
    PATTERN = await Studio.loadImage('assets/pattern.webp');
    for (const k of ['dragon', 'ship', 'planet', 'landscape', 'mascot']) ART[k] = await Studio.loadImage(`assets/key-${k}.webp`);
  }
  // the loomlock mark (white, transparent PNG cropped from the brand's own artwork)
  function logo(ctx, x, y, size, { alpha = 1 } = {}) {
    if (!LOGO) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(LOGO, x - size / 2, y - size / 2, size, size); ctx.restore();
  }
  function brandBg(ctx, x, y, w, h) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, C.violet); g.addColorStop(1, C.violetDeep); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  // a loomlock key: the brand's real illustrated NFC card (art from loomlock.com), centred at x,y
  function key(ctx, x, y, w, { rot = 0, alpha = 1, art = 'dragon', t = 0 } = {}) {
    const h = w * 505 / 800, r = w * 0.055;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(10,12,60,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.clip();
    if (ART[art]) ctx.drawImage(ART[art], -w / 2, -h / 2, w, h);
    // a glossy sheen that slides across as the card moves
    const sx = -w + ((t * 0.9) % 1) * w * 3;
    const g = ctx.createLinearGradient(sx - w * 0.3, -h / 2, sx + w * 0.3, h / 2);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = w * 0.012; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.stroke();
    ctx.restore();
  }
  // NFC tap: rings spreading from the point of contact
  function nfc(ctx, x, y, t, t0, { color = C.violet } = {}) {
    for (let k = 0; k < 3; k++) {
      const u = (t - t0 - k * 0.12) / 0.7;
      if (u < 0 || u > 1) continue;
      ctx.save(); ctx.globalAlpha = 0.7 * (1 - u); ctx.strokeStyle = color; ctx.lineWidth = 10 * (1 - u) + 2;
      ctx.beginPath(); ctx.arc(x, y, 40 + 420 * ease.outCubic(u), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  // where the key is during a tap: slides in, touches the phone at tTap, slides out
  function keyTap(t, tTap, from, to, hold = 0.35) {
    const a = clamp((t - (tTap - 0.45)) / 0.45), b = clamp((t - (tTap + hold)) / 0.4);
    if (a <= 0 || b >= 1) return null;
    const p = b > 0 ? lerp(1, 0, ease.inCubic(b)) : ease.outCubic(a);
    return { x: lerp(from[0], to[0], p), y: lerp(from[1], to[1], p), rot: lerp(0.35, -0.08, p) };
  }

  // phone screen once a loomlock session is on
  function lockScreen(ctx, w, h, t, t0, { line = 'Session on · Focus' } = {}) {
    brandBg(ctx, 0, 0, w, h);
    const u = clamp((t - t0) / 0.3);
    const s = 0.85 + 0.15 * ease.outBack(u, 2.5);
    logo(ctx, w / 2, h * 0.4, 150 * s, { alpha: u });
    text(ctx, 'loomlock', w / 2, h * 0.4 + 140, { size: 40, weight: 600, color: '#fff', align: 'center', alpha: u });
    text(ctx, line, w / 2, h * 0.4 + 186, { size: 21, weight: 400, color: C.violetLight, align: 'center', alpha: u });
  }

  // end card: brand gradient, the mark lands at tClick, lowercase wordmark, tagline
  function endCard(ctx, t, t0, tClick, W, H, { tagline = '', sub = '' } = {}) {
    const u = clamp((t - t0) / 0.4);
    if (u <= 0) return;
    ctx.save();
    ctx.globalAlpha = ease.outCubic(u); brandBg(ctx, 0, 0, W, H);
    if (PATTERN) { // the brand's illustrated pattern, slowly drifting, under a blue veil
      const pw = H * 800 / 505, dx = -((t - t0) * 25) % pw;
      ctx.globalAlpha = 0.35 * ease.outCubic(u);
      for (let x = dx; x < W; x += pw) ctx.drawImage(PATTERN, x, 0, pw, H);
    }
    ctx.globalAlpha = 1;
    const veil = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, 900); veil.addColorStop(0, 'rgba(32,39,135,0.92)'); veil.addColorStop(1, 'rgba(32,39,135,0.55)');
    ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
    const k = clamp((t - tClick + 0.25) / 0.25);
    const kick = t >= tClick ? U.springKick(t, tClick, 5, 8) * 0.1 : 0;
    logo(ctx, W / 2, H * 0.4 + 40 * (1 - ease.outCubic(k)), 300 * (0.8 + 0.2 * k) * (1 + kick), { alpha: k });
    const w2 = clamp((t - tClick) / 0.35);
    text(ctx, 'loomlock', W / 2, H * 0.4 + 280 + 20 * (1 - ease.outCubic(w2)), { size: 128, weight: 600, color: '#fff', align: 'center', alpha: w2, spacing: -3 });
    const tg = clamp((t - tClick - 0.45) / 0.4);
    if (tagline) text(ctx, tagline, W / 2, H * 0.4 + 370, { size: 46, weight: 500, color: '#fff', align: 'center', alpha: tg });
    if (sub) text(ctx, sub, W / 2, H * 0.4 + 430, { size: 34, weight: 400, color: C.violetLight, align: 'center', alpha: tg * 0.85 });
    ctx.restore();
  }

  // a stylised hand holding a phone (phone centre cx,cy, height ph); thumb = [x,y] in frame coords or null
  const SKIN = '#E7B08F', SKIN_D = '#C98E6E';
  function handBack(ctx, cx, cy, ph) {
    const pw = ph * 0.47;
    ctx.save(); ctx.fillStyle = SKIN;
    ctx.beginPath(); ctx.ellipse(cx - pw * 0.05, cy + ph * 0.5, pw * 0.62, ph * 0.3, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - pw * 0.55, cy + ph * 0.5, pw * 1.05, ph * 0.6);
    ctx.restore();
  }
  function handFront(ctx, cx, cy, ph, thumb) {
    const pw = ph * 0.47;
    ctx.save(); ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;
    // four fingertips wrapping the right edge
    for (let k = 0; k < 4; k++) { const y = cy + ph * (0.06 + k * 0.085); ctx.beginPath(); ctx.roundRect(cx + pw * 0.45, y, pw * 0.12, ph * 0.07, ph * 0.035); ctx.fill(); ctx.stroke(); }
    // thumb from the base of the palm to the tip
    if (thumb) {
      const bx = cx - pw * 0.42, by = cy + ph * 0.46, tw = pw * 0.17;
      const ang = Math.atan2(thumb[1] - by, thumb[0] - bx), len = Math.hypot(thumb[0] - bx, thumb[1] - by);
      ctx.translate(bx, by); ctx.rotate(ang);
      ctx.beginPath(); ctx.roundRect(-tw * 0.3, -tw / 2, len + tw * 0.3, tw, tw / 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(len - tw * 0.35, 0, tw * 0.22, tw * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // a full-screen vertical video post (reels style), seeded by i; w = 412
  function reel(ctx, w, h, i, t, { app = 'reels' } = {}) {
    const hue = Math.floor(U.hash(i, 3) * 360), hue2 = (hue + 60 + U.hash(i, 4) * 120) % 360;
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, `hsl(${hue},75%,58%)`); g.addColorStop(1, `hsl(${hue2},70%,32%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // moving content: blobs bouncing
    for (let k = 0; k < 3; k++) {
      const r = 70 + U.hash(i, k) * 90, x = w * (0.2 + 0.6 * U.hash(i, k + 5)) + Math.sin(t * (1.5 + k) + k) * 40, y = h * (0.25 + 0.4 * U.hash(i, k + 9)) + Math.cos(t * (1.2 + k)) * 50;
      ctx.fillStyle = `hsla(${(hue + k * 70) % 360},90%,${70 - k * 8}%,0.55)`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // big caption text in the video
    const caps = ['you won’t believe this', 'POV: it’s Monday', '3 tricks nobody tells you', 'wait for the end', 'part 2', 'ok but this…', 'morning routine', 'storytime'];
    text(ctx, caps[Math.floor(U.hash(i, 6) * caps.length)], w / 2, h * 0.42, { size: 30, weight: 700, color: '#fff', align: 'center' });
    // right rail
    const likes = ['12.4K', '873', '45.1K', '2.3K', '128K', '9,871'];
    for (let k = 0; k < 3; k++) { const y = h * 0.58 + k * 78; ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(w - 40, y, 18, 0, Math.PI * 2); ctx.fill(); text(ctx, k === 0 ? likes[Math.floor(U.hash(i, 7) * likes.length)] : `${Math.floor(U.hash(i, 8 + k) * 900 + 10)}`, w - 40, y + 38, { size: 14, weight: 600, color: '#fff', align: 'center' }); }
    // handle + progress
    ctx.fillStyle = `hsl(${hue2},60%,75%)`; ctx.beginPath(); ctx.arc(34, h - 150, 17, 0, Math.PI * 2); ctx.fill();
    text(ctx, `@${['juli.ok', 'mike_mp', 'daily.tips', 'the.real.one', 'memes.daily', 'cami_r'][Math.floor(U.hash(i, 10) * 6)]}`, 60, h - 144, { size: 18, weight: 700, color: '#fff' });
    rr(ctx, 20, h - 118, 250, 10, 5, 'rgba(255,255,255,0.6)'); rr(ctx, 20, h - 98, 170, 10, 5, 'rgba(255,255,255,0.4)');
    rr(ctx, 0, h - 60, w, 4, 0, 'rgba(255,255,255,0.3)'); rr(ctx, 0, h - 60, w * ((t * 0.4 + U.hash(i, 11)) % 1), 4, 0, '#fff');
    text(ctx, app, 24, 120, { size: 22, weight: 700, color: '#fff' });
  }

  // home screen with app icons; locked = true greys them out with a padlock
  const APPS = [
    { name: 'Instagram', c0: '#F58529', c1: '#DD2A7B' }, { name: 'TikTok', c0: '#111111', c1: '#333333' },
    { name: 'YouTube', c0: '#FF3B30', c1: '#C4161C' }, { name: 'X', c0: '#000000', c1: '#222222' },
    { name: 'Mail', c0: '#3B82F6', c1: '#1D4ED8' }, { name: 'Notes', c0: '#FCD34D', c1: '#F59E0B' },
    { name: 'Maps', c0: '#34D399', c1: '#059669' }, { name: 'Photos', c0: '#F472B6', c1: '#A78BFA' },
  ];
  const appPos = (k) => [60 + (k % 4) * 98, 540 + Math.floor(k / 4) * 120]; // low on the screen, where the thumb lives
  function homeScreen(ctx, w, h, t, { locked = 0, tap = -1, shake = 0 } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A2F6E'); g.addColorStop(1, '#14173D'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    APPS.forEach((a, k) => {
      const [x, y] = appPos(k), dist = k < 4 ? locked : 0;
      ctx.save(); if (k === tap && shake) ctx.translate(Math.sin(t * 80) * 6 * shake, 0);
      const gg = ctx.createLinearGradient(x - 32, y - 32, x + 32, y + 32); gg.addColorStop(0, a.c0); gg.addColorStop(1, a.c1);
      ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(x - 32, y - 32, 64, 64, 16); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
      if (dist > 0) { ctx.fillStyle = `rgba(20,24,70,${0.7 * dist})`; ctx.beginPath(); ctx.roundRect(x - 32, y - 32, 64, 64, 16); ctx.fill(); lock(ctx, x, y - 4, 0.3 * dist, 1, { lw: 9 }); }
      text(ctx, a.name, x, y + 52, { size: 14, weight: 500, color: '#fff', align: 'center' });
      ctx.restore();
    });
  }
  // a phone lock screen: big time, a line under it
  function lockPhone(ctx, w, h, time, line) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A2F6E'); g.addColorStop(1, '#14173D'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    text(ctx, time, w / 2, 210, { size: 96, weight: 600, color: '#fff', align: 'center' });
    if (line) text(ctx, line, w / 2, 262, { size: 20, weight: 400, color: 'rgba(255,255,255,0.7)', align: 'center' });
  }

  globalThis.Loom = { C, FONT, font, text, rr, mix, dayColors, bg, roll, banner, feed, lock, lockScreen, endCard, loadBrand, logo, brandBg, key, nfc, keyTap, handBack, handFront, reel, homeScreen, appPos, APPS, lockPhone, img: (k) => (k === "pattern" ? PATTERN : k === "logo" ? LOGO : ART[k]) };
})();
