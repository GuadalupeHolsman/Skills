// THE FILM: Locky (an original little golden padlock) vs. the lava. One wide shot of a volcanic cave,
// with camera shakes on every hit. Every frame is a pure function of t; every event comes from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { ev, GEO, T, BEAT } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const INK = '#2A1E1A';

  // ---------- Locky ----------
  // origin = between the feet. o: {x, y, s, rot, walk (phase) | null, eyes, burn 0..1, open 0..1 (shackle),
  // phone, arms: 'phone'|'down'|'up'|'cheer'|'flail', mouth: 'keyhole'|'scream'|'smile'|'sad', squash}
  function locky(ctx, o) {
    const s = o.s || 1, burn = o.burn || 0;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0);
    const sq = o.squash || 0; ctx.scale(s * (1 + sq * 0.25), s * (1 - sq * 0.3));
    const OUT = '#121218';
    const blue = burn > 0 ? mix('#3A5CFC', '#2C2730', burn * 0.85) : '#3A5CFC';
    const side = burn > 0 ? mix('#2338B4', '#1C181E', burn * 0.85) : '#2338B4';
    const sky = burn > 0 ? mix('#8ED6FF', '#4A4650', burn * 0.8) : '#8ED6FF';
    const lav = burn > 0 ? mix('#9C98EE', '#4A4458', burn * 0.6) : '#9C98EE';
    const glove = burn > 0 ? mix('#FFFFFF', '#8A8488', burn * 0.6) : '#FFFFFF';
    // legs: short lavender legs with rounded feet
    const ph = o.walk == null ? null : o.walk;
    const sw = ph == null ? 0 : Math.sin(ph) * 20, liftL = ph == null ? 0 : Math.max(0, Math.cos(ph)) * 10, liftR = ph == null ? 0 : Math.max(0, -Math.cos(ph)) * 10;
    for (const [lx, d, lift] of [[-30, sw, liftL], [30, -sw, liftR]]) {
      G.limb(ctx, [[lx, -44], [lx + d, -8 - lift]], { color: lav, lw: 22, outline: OUT });
      G.ellipse(ctx, lx + d + 6, -8 - lift, 20, 11, { fill: lav, lw: 5, seed: 3 + lx });
    }
    // the shackle (light blue, thick, black outline; pops open when Locky is shocked)
    const op = o.open || 0;
    ctx.save(); ctx.translate(40, -170 - op * 26); ctx.rotate(-op * 0.75);
    const arc = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (Math.PI * i) / 20; arc.push([-40 + 40 * Math.cos(a), -6 + 50 * Math.sin(a)]); }
    const sh = [[-80, 16], ...arc, [0, 16]];
    G.line(ctx, sh, { color: OUT, lw: 36, seed: 7, amp: 0.2 });
    G.line(ctx, sh, { color: sky, lw: 25, seed: 8, amp: 0.2 });
    ctx.save(); ctx.globalAlpha = 0.7 * (1 - burn); G.line(ctx, arc.slice(4, 9).map(([x, y]) => [x - 4, y + 4]), { color: '#E6F6FF', lw: 6, seed: 9 }); ctx.restore();
    ctx.restore();
    // arms: white noodles with round white hands
    const arms = o.arms || 'down';
    const armPts = {
      down: [[[-72, -100], [-96, -72], [-94, -48]], [[72, -100], [96, -72], [94, -48]]],
      phone: [[[-72, -100], [-60, -60], [10, -76]], [[72, -100], [112, -94], [106, -134]]],
      up: [[[-72, -110], [-110, -150], [-118, -196]], [[72, -110], [110, -150], [118, -196]]],
      cheer: [[[-72, -110], [-120, -150], [-140, -210]], [[72, -110], [120, -150], [140, -210]]],
      flail: [[[-72, -110], [-128, -126 + Math.sin(G.t * 40) * 20], [-150, -170 + Math.sin(G.t * 40) * 30]], [[72, -110], [128, -126 - Math.sin(G.t * 40) * 20], [150, -170 - Math.sin(G.t * 40) * 30]]],
      sad: [[[-72, -100], [-70, -56], [-22, -46]], [[72, -100], [70, -56], [22, -46]]],
    }[arms];
    // the body: a chunky blue block with a darker side face (the 3D look of the Loomlock art)
    G.rrect(ctx, -60, -170, 140, 134, 22, { fill: side, lw: 6, seed: 10 });
    G.rrect(ctx, -76, -176, 136, 136, 22, { fill: blue, lw: 6, seed: 11 });
    ctx.save(); ctx.globalAlpha = 0.25 * (1 - burn); G.rrect(ctx, -64, -164, 20, 60, 10, { fill: '#FFFFFF', lw: 0, seed: 12 }); ctx.restore();
    if (burn > 0.2) for (let i = 0; i < 7; i++) { // soot smudges
      ctx.save(); ctx.globalAlpha = burn * 0.7;
      G.ellipse(ctx, -60 + G.rnd(i, 21) * 100, -160 + G.rnd(i, 22) * 110, 8 + G.rnd(i, 23) * 14, 6 + G.rnd(i, 24) * 9, { fill: '#0E0C10', lw: 0, seed: 30 + i });
      ctx.restore();
    }
    for (const a of armPts) G.limb(ctx, a, { color: glove, lw: 14, outline: OUT });
    for (const a of armPts) G.ellipse(ctx, a[2][0], a[2][1], 17, 16, { fill: glove, lw: 5, seed: 40 + a[2][0] });
    // the phone in hand
    if (o.phone) {
      const [hx, hy] = armPts[1][2];
      ctx.save(); ctx.translate(hx - 8, hy + 6); ctx.rotate(-0.25);
      G.rrect(ctx, -22, -42, 44, 78, 9, { fill: '#1C1C26', lw: 5, seed: 50 });
      G.rrect(ctx, -16, -34, 32, 60, 5, { fill: '#F37BC0', lw: 0, seed: 51 });
      ctx.restore();
      G.ellipse(ctx, hx, hy, 17, 16, { fill: glove, lw: 5, seed: 52 });
    }
    // the face: white oval eyes, a tiny smile with a pink tongue
    const eyes = o.eyes || 'normal';
    const look = eyes === 'phone' ? [8, 5] : [o.lookX || 0, o.lookY || 0];
    const fx = -8; // face centre (the front face is shifted left of the side panel)
    for (const ex of [fx - 32, fx + 32]) {
      if (eyes === 'closed' || eyes === 'happy') {
        G.line(ctx, eyes === 'happy' ? [[ex - 15, -112], [ex, -124], [ex + 15, -112]] : [[ex - 15, -120], [ex, -110], [ex + 15, -120]], { color: OUT, lw: 6, seed: 60 + ex });
        continue;
      }
      const ry = eyes === 'wide' ? 24 : 14, rx = eyes === 'wide' ? 22 : 20;
      G.ellipse(ctx, ex, -118, rx, ry, { fill: '#FFFFFF', lw: 5, seed: 61 + ex });
      if (eyes === 'spiral') {
        const pts = []; for (let i = 0; i < 34; i++) { const a = i * 0.5 + G.t * 14 * (ex < fx ? 1 : -1), r = i * 0.5; pts.push([ex + r * Math.cos(a), -118 + r * 0.8 * Math.sin(a)]); }
        G.line(ctx, pts, { color: OUT, lw: 3.5, seed: 62 });
      } else if (eyes === 'phone' || eyes === 'wide' || o.lookX) {
        const pr = eyes === 'wide' ? 6 : 6;
        G.ellipse(ctx, ex + look[0], -118 + look[1], pr, pr, { fill: OUT, lw: 0, seed: 63 });
      }
      if (eyes === 'sad') { // droopy lids
        G.poly(ctx, [[ex - 22, -136], [ex + 22, -136], [ex + 22, ex < fx ? -114 : -122], [ex - 22, ex < fx ? -122 : -114]], { fill: blue, lw: 4, seed: 65 + ex });
      }
    }
    const mouth = o.mouth || 'smile';
    if (mouth === 'scream') {
      G.ellipse(ctx, fx, -76, 16, 20, { fill: '#5A1E2E', lw: 5, seed: 70 });
      G.ellipse(ctx, fx, -66, 9, 6, { fill: '#F27BA0', lw: 0, seed: 71 });
    } else if (mouth === 'sad') {
      G.line(ctx, [[fx - 12, -78], [fx, -86], [fx + 12, -78]], { color: OUT, lw: 5, seed: 72 });
    } else {
      G.ellipse(ctx, fx, -84, 8, 7, { fill: '#F27BA0', lw: 4, seed: 73 });
      G.line(ctx, [[fx - 14, -90], [fx - 7, -84], [fx, -90], [fx + 7, -84], [fx + 14, -90]], { color: OUT, lw: 5, seed: 74 });
    }
    if (o.blush) { ctx.save(); ctx.globalAlpha = 0.5; G.ellipse(ctx, fx - 52, -94, 12, 7, { fill: '#F27BA0', lw: 0, seed: 75 }); G.ellipse(ctx, fx + 52, -94, 12, 7, { fill: '#F27BA0', lw: 0, seed: 76 }); ctx.restore(); }
    ctx.restore();
  }
  function mix(a, b, k) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
  }
  globalThis.CAST = {};

  // ---------- where Locky is, what he looks like, at time t ----------
  const { EDGE, FLOOR, LAVA } = GEO;
  const SUNK = LAVA + 95;
  const walkPhase = (t, t0) => (t - t0) * Math.PI * 2 / BEAT;
  function fall(t, off, splash, x0) { // steps off the edge still looking at the phone
    const u = clamp((t - off) / (splash - off));
    return { x: lerp(x0, x0 + 70, u), y: lerp(FLOOR, LAVA + 10, ease.inQuad(u)), rot: 0.35 * u, eyes: u > 0.7 ? 'wide' : 'phone', phone: true, arms: 'phone', walk: null, open: u > 0.7 ? 1 : 0 };
  }
  function sunk(t, splash, depth = SUNK) {
    const a = t - splash, k = ease.outCubic(clamp(a / 0.18));
    return { x: EDGE + 70 + Math.sin(a * 60) * 6 * clamp(1 - a), y: lerp(LAVA + 10, depth, k), eyes: 'wide', arms: 'flail', open: 1, phone: false, mouth: 'scream' };
  }
  function arc(t, t0, t1, p0, p1, peak) {
    const u = clamp((t - t0) / (t1 - t0));
    const y = lerp(p0[1], p1[1], u) - 4 * (peak) * u * (1 - u);
    return { x: lerp(p0[0], p1[0], u), y, u };
  }
  function burnAt(t) { return t < ev.launch1 ? 0 : t < ev.launch2 ? 0.25 : t < ev.crawl ? 0.42 : 0.6; }
  function state(t) {
    const burn = burnAt(t);
    const base = { burn, eyes: 'normal', arms: 'down', phone: false, walk: null, open: 0, rot: 0 };
    // try 1
    if (t < ev.off1) return { ...base, x: lerp(-110, EDGE + 10, clamp(t / ev.off1)), y: FLOOR, walk: walkPhase(t, 0), eyes: 'phone', arms: 'phone', phone: true };
    if (t < ev.splash1) return { ...base, ...fall(t, ev.off1, ev.splash1, EDGE + 10) };
    if (t < ev.launch1) return { ...base, ...sunk(t, ev.splash1) };
    if (t < ev.land1) { const a = arc(t, ev.launch1, ev.land1, [EDGE + 70, SUNK], [170, FLOOR], 520); return { ...base, x: a.x, y: a.y, rot: -a.u * Math.PI * 2, eyes: 'wide', arms: 'flail', mouth: 'scream', open: 1 }; }
    if (t < ev.walk2) { const a = t - ev.land1; const sq = Math.max(0, Math.sin(Math.PI * clamp(a / 0.25))) * clamp(1 - a / 0.25); return { ...base, x: 170, y: FLOOR, squash: sq, eyes: a < BEAT * 1.5 ? 'wide' : 'phone', arms: a < BEAT * 1.5 ? 'down' : 'phone', phone: a >= BEAT * 1.5, open: clamp(1 - a / 0.4) }; }
    // try 2
    if (t < ev.off2) return { ...base, x: lerp(170, EDGE + 10, clamp((t - ev.walk2) / (ev.off2 - ev.walk2))), y: FLOOR, walk: walkPhase(t, ev.walk2), eyes: 'phone', arms: 'phone', phone: true };
    if (t < ev.splash2) return { ...base, ...fall(t, ev.off2, ev.splash2, EDGE + 10) };
    if (t < ev.launch2) return { ...base, ...sunk(t, ev.splash2) };
    if (t < ev.land2) {
      if (t < ev.peak2) { const u = ease.outQuad(clamp((t - ev.launch2) / (ev.peak2 - ev.launch2))); return { ...base, x: lerp(EDGE + 70, 260, u), y: lerp(SUNK, -500, u), rot: u * 4, eyes: 'spiral', arms: 'flail', mouth: 'scream', open: 1 }; }
      const u = ease.inQuad(clamp((t - ev.peak2) / (ev.land2 - ev.peak2))); return { ...base, x: lerp(260, 160, u), y: lerp(-500, FLOOR, u), rot: 4 + u * 2.283, eyes: 'spiral', arms: 'up', mouth: 'scream', open: 1 };
    }
    if (t < ev.walk3) { const a = t - ev.land2; const sq = Math.max(0, Math.sin(Math.PI * clamp(a / 0.25))) * clamp(1 - a / 0.25); return { ...base, x: 160, y: FLOOR, squash: sq, rot: 0.08 * Math.sin(a * 9), eyes: 'spiral', arms: 'down', open: clamp(1 - a / 0.5) }; }
    // try 3
    if (t < ev.off3) return { ...base, x: lerp(160, EDGE + 10, clamp((t - ev.walk3) / (ev.off3 - ev.walk3))), y: FLOOR, walk: walkPhase(t, ev.walk3), eyes: 'phone', arms: 'phone', phone: true };
    if (t < ev.splash3) return { ...base, ...fall(t, ev.off3, ev.splash3, EDGE + 10) };
    if (t < ev.crawl) { const st = sunk(t, ev.splash3, LAVA + 150); return { ...base, ...st, arms: 'down', mouth: t > ev.scratch ? 'sad' : 'scream', eyes: t > ev.scratch ? 'sad' : 'wide' }; }
    if (t < ev.sit) { const u = ease.inOutQuad(clamp((t - ev.crawl) / (ev.sit - ev.crawl))); return { ...base, x: lerp(EDGE + 70, 150, u), y: lerp(LAVA + 150, FLOOR, ease.outQuad(u)), walk: walkPhase(t, ev.crawl) * 0.5, eyes: 'sad', mouth: 'sad', arms: 'down', rot: -0.15 * (1 - u) }; }
    // the idea
    if (t < ev.grow) { const a = t - ev.idea; return { ...base, x: 150, y: FLOOR, eyes: t < ev.idea ? 'sad' : 'wide', mouth: t < ev.idea ? 'sad' : 'smile', arms: t < ev.idea ? 'sad' : 'phone', phone: t >= ev.idea, open: t >= ev.idea ? clamp(1 - a / 0.3) * 0.6 : 0, lookX: 8, lookY: 6 }; }
    if (t < ev.cross) return { ...base, x: 110, y: FLOOR, eyes: t < ev.bridge ? 'wide' : 'happy', arms: t < ev.bridge ? 'up' : 'cheer', mouth: 'smile', lookX: 10 };
    // crossing on the phone, eyes up
    if (t < ev.win) {
      const u = clamp((t - ev.cross) / (ev.win - ev.cross)), x = lerp(110, 860, u);
      const onBridge = clamp((x - 270) / 50) * clamp((GEO.BRIDGE_END + 30 - x) / 50);
      return { ...base, x, y: lerp(FLOOR, GEO.BRIDGE_TOP, onBridge), walk: walkPhase(t, ev.cross), eyes: 'normal', lookX: 8, mouth: 'smile', arms: 'down' };
    }
    const a = t - ev.win, hopK = S.celebrate.filter((c) => c <= t).pop();
    const hop = Math.max(0, Math.sin(Math.PI * clamp((t - hopK) / (BEAT * 0.9)))) * 90;
    return { ...base, x: 860, y: FLOOR - hop, eyes: 'happy', arms: 'cheer', mouth: 'smile', blush: true, open: hop > 40 ? 0.4 : 0 };
  }

  // ---------- the cave ----------
  function cave(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2B1B2E'); g.addColorStop(0.55, '#5A2A2A'); g.addColorStop(1, '#8A3A1E');
    ctx.fillStyle = g; ctx.fillRect(-200, -800, W + 400, H + 1600);
    // back-wall rocks with glowing cracks
    for (let i = 0; i < 9; i++) {
      const x = G.rnd(i, 1) * W, y = 300 + G.rnd(i, 2) * 800, r = 90 + G.rnd(i, 3) * 120;
      G.ellipse(ctx, x, y, r, r * 0.7, { fill: i % 2 ? '#47252F' : '#3A2030', lw: 4, seed: 100 + i, hatch: { color: 'rgba(0,0,0,0.12)', gap: 12 } });
    }
    for (let k = 0; k < 4; k++) {
      const x0 = 120 + k * 260, pts = [[x0, 380 + k * 90]];
      for (let i = 1; i < 6; i++) pts.push([x0 + (G.rnd(k, i) - 0.5) * 120, 380 + k * 90 + i * 60]);
      ctx.save(); ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 3 + k); G.line(ctx, pts, { color: '#FF8A3A', lw: 5, seed: 150 + k }); ctx.restore();
    }
    // stalactites
    for (let i = 0; i < 8; i++) { const x = 40 + i * 140 + G.rnd(i, 9) * 40, h = 120 + G.rnd(i, 8) * 160; G.poly(ctx, [[x - 50, -10], [x + 50, -10], [x + 4, h]], { fill: '#24161F', lw: 4, seed: 170 + i, step: 30 }); }
    // the exit on the right: a stone arch with daylight and a sign
    G.rrect(ctx, 840, 930, 210, 370, 100, { fill: '#BFE7FF', lw: 7, seed: 190 });
    ctx.save(); ctx.globalAlpha = 0.45; G.ellipse(ctx, 945, 1120, 90, 160, { fill: '#FFFFFF', lw: 0, seed: 191 }); ctx.restore();
    G.rrect(ctx, 850, 790, 180, 70, 10, { fill: '#3FA86B', lw: 5, seed: 192 });
    G.line(ctx, [[940, 860], [940, 930]], { color: INK, lw: 6, seed: 193 });
    G.text(ctx, 'SALIDA', 940, 838, { size: 40, align: 'center', fam: 'Bungee', weight: 400, color: '#FFFFFF' });
  }
  function lava(ctx, t) {
    const y0 = LAVA;
    const pts = [[GEO.EDGE - 20, H + 50]];
    for (let i = 0; i <= 24; i++) { const x = GEO.EDGE - 20 + (i / 24) * (GEO.RIGHT + 40 - GEO.EDGE); pts.push([x, y0 + 8 * Math.sin(x * 0.03 + t * 3)]); }
    pts.push([GEO.RIGHT + 20, H + 50]);
    const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, '#FFB52E'); g.addColorStop(0.3, '#FF6A1A'); g.addColorStop(1, '#C8321A');
    G.shape(ctx, pts, { fill: g, lw: 5, seed: 200, closed: true });
    for (let i = 0; i < 12; i++) { // blobs drifting
      const x = GEO.EDGE + 20 + ((G.rnd(i, 1) * 440 + t * (20 + i * 3)) % 440), y = y0 + 60 + G.rnd(i, 2) * 420;
      ctx.save(); ctx.globalAlpha = 0.55; G.ellipse(ctx, x, y, 34 + G.rnd(i, 3) * 30, 14 + G.rnd(i, 4) * 10, { fill: '#FFD45A', lw: 0, seed: 210 + i }); ctx.restore();
    }
    for (let i = 0; i < 5; i++) { // bubbles that pop
      const per = 1.3 + G.rnd(i, 5), ph = ((t + G.rnd(i, 6) * per) % per) / per;
      const x = GEO.EDGE + 40 + G.rnd(i, 7) * 400, r = 6 + 22 * Math.sin(Math.PI * ph);
      if (ph < 0.9) G.ellipse(ctx, x, y0 + 4 - r * 0.4, r, r * 0.8, { fill: '#FFC93C', lw: 3, seed: 230 + i });
    }
  }
  function ledges(ctx) {
    G.rrect(ctx, -40, FLOOR, GEO.EDGE + 40, H - FLOOR + 40, 8, { fill: '#6B5A5E', lw: 6, seed: 250, hatch: { color: 'rgba(0,0,0,0.18)', gap: 12 } });
    G.rrect(ctx, GEO.RIGHT, FLOOR, W - GEO.RIGHT + 40, H - FLOOR + 40, 8, { fill: '#6B5A5E', lw: 6, seed: 251, hatch: { color: 'rgba(0,0,0,0.18)', gap: 12 } });
    G.rrect(ctx, -40, FLOOR - 4, GEO.EDGE + 40, 26, 6, { fill: '#8E7C7E', lw: 5, seed: 252 });
    G.rrect(ctx, GEO.RIGHT, FLOOR - 4, W - GEO.RIGHT + 40, 26, 6, { fill: '#8E7C7E', lw: 5, seed: 253 });
    // the glow of the lava on the inner edges
    for (const x of [GEO.EDGE - 30, GEO.RIGHT]) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FF7A2A'; ctx.fillRect(x, FLOOR + 22, 30, H - FLOOR); ctx.restore(); }
  }
  // splash: droplets + rings + a smoke column
  function splashFx(ctx, t, ts, size) {
    const a = t - ts; if (a < 0 || a > 3) return;
    const cx = EDGE + 70;
    for (let i = 0; i < 14; i++) {
      const vx = (G.rnd(i, 1) - 0.5) * 700 * size, vy = -(400 + G.rnd(i, 2) * 600) * size;
      const x = cx + vx * a, y = LAVA + vy * a + 1600 * a * a;
      if (y > LAVA + 20) continue;
      G.ellipse(ctx, x, y, 12 * size, 16 * size, { fill: i % 3 ? '#FFB52E' : '#FFE06A', lw: 3, seed: 300 + i });
    }
    for (let r = 0; r < 2; r++) { const k = clamp((a - r * 0.15) / 0.8); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.globalAlpha = 1 - k; G.ellipse(ctx, cx, LAVA + 6, 40 + 200 * k * size, 12 + 34 * k * size, { fill: null, stroke: '#FFE06A', lw: 6, seed: 320 + r }); ctx.restore(); }
  }
  function smoke(ctx, t, x, y, t0, n = 6, dur = 2.2) {
    const a = t - t0; if (a < 0 || a > dur + 1) return;
    for (let i = 0; i < n; i++) {
      const pa = a - i * 0.12; if (pa < 0) continue;
      const k = pa / dur; if (k > 1) continue;
      ctx.save(); ctx.globalAlpha = 0.6 * (1 - k);
      G.ellipse(ctx, x + Math.sin(pa * 4 + i) * 30, y - pa * 260, 26 + pa * 40, 22 + pa * 34, { fill: '#5E5A60', lw: 3, seed: 340 + i });
      ctx.restore();
    }
  }
  // the phone: in his hand -> giant -> tips over into a bridge
  function bigPhone(ctx, t) {
    if (t < ev.grow) return;
    const g = ease.outBack(clamp((t - ev.grow) / (BEAT * 1.4)), 1.6);
    const tip = ease.inQuad(clamp((t - ev.tip) / (ev.bridge - ev.tip)));
    const w = 230, h = 580;
    ctx.save();
    ctx.translate(lerp(240, EDGE, g), FLOOR);
    ctx.rotate(tip * Math.PI / 2);
    ctx.scale(g * lerp(1, 0.3, tip), g);
    G.rrect(ctx, -w, -h, w, h, 34, { fill: '#D9DEE6', lw: 7, seed: 400 });
    G.rrect(ctx, -w + 16, -h + 60, w - 32, h - 120, 10, { fill: '#1C1C24', lw: 4, seed: 401 });
    ctx.save(); ctx.globalAlpha = 0.25; G.poly(ctx, [[-w + 30, -h + 80], [-w + 90, -h + 80], [-w + 30, -h + 260]], { fill: '#FFFFFF', lw: 0, seed: 402 }); ctx.restore();
    G.ellipse(ctx, -w / 2, -28, 18, 18, { fill: '#C2C8D0', lw: 4, seed: 403 });
    G.rrect(ctx, -w / 2 - 30, -h + 26, 60, 10, 5, { fill: '#2A2A30', lw: 0, seed: 404 });
    ctx.restore();
  }
  function bulb(ctx, t, x, y) {
    if (t < ev.idea || t > ev.bridge) return;
    const p = ease.outBack(clamp((t - ev.idea) / 0.1), 2.5);
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    G.rays(ctx, 0, 0, { n: 12, r0: 70, r1: 120, color: '#FFE06A', lw: 7, seed: 410, spin: t * 0.6 });
    G.ellipse(ctx, 0, 0, 48, 52, { fill: '#FFE06A', lw: 6, seed: 411 });
    G.rrect(ctx, -22, 44, 44, 34, 6, { fill: '#B8BEC6', lw: 5, seed: 412 });
    ctx.restore();
  }
  function stamp(ctx, t, t0, t1, text, x, y, size, color, rot = -0.06) {
    if (t < t0 || t > t1) return;
    const p = ease.outBack(clamp((t - t0) / 0.22), 2.5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(p, p);
    G.text(ctx, text, 0, 0, { size, align: 'center', fam: 'Bungee', weight: 400, color, stroke: INK, strokeW: size * 0.1 });
    ctx.restore();
  }

  // ---------- the camera: shakes on the hits ----------
  function shake(t) {
    let x = 0, y = 0;
    for (const [t0, amp] of [[ev.splash1, 14], [ev.splash2, 20], [ev.splash3, 26], [ev.land1, 10], [ev.land2, 16], [ev.bridge, 22], [ev.win, 8]]) {
      const a = t - t0; if (a < 0 || a > 0.6) continue;
      const k = Math.exp(-a * 7) * amp; x += Math.sin(a * 70) * k; y += Math.cos(a * 53) * k;
    }
    return [x, y];
  }

  let YAY = null;
  Studio.film({
    async init() { YAY = await Studio.loadImage('assets/locky-yay.png'); },
    post: { vignette: 0.3, grain: 0.05, paper: 0.25 },
    fadeOut: 0.6,
    draw(ctx, t) {
      const [sx, sy] = shake(t);
      // a slow push-in during the sad pause, released on the idea
      const z = 1.15 + 0.08 * ease.inOutQuad(clamp((t - ev.scratch) / (ev.idea - ev.scratch))) * (t < ev.idea + 0.4 ? 1 : clamp(1 - (t - ev.idea - 0.4) / 0.4));
      ctx.save(); ctx.translate(W / 2 + sx, FLOOR - 40 + sy); ctx.scale(z, z); ctx.translate(-W / 2 + 25, -FLOOR);
      cave(ctx, t);
      lava(ctx, t);
      ledges(ctx);
      bigPhone(ctx, t);
      const st = state(t);
      // Locky, clipped at the lava surface when he is in it
      const inLava = st.y > LAVA - 5 && st.x > EDGE && st.x < GEO.RIGHT;
      ctx.save();
      if (inLava) { ctx.beginPath(); ctx.rect(-200, -2000, W + 400, LAVA + 2000 + 6); ctx.clip(); }
      locky(ctx, { ...st, s: 1.25 });
      ctx.restore();
      for (const [ts, sz] of [[ev.splash1, 0.8], [ev.splash2, 1], [ev.splash3, 1.25]]) splashFx(ctx, t, ts, sz);
      // smoke: off his head after each fall, and a big column after the third
      smoke(ctx, t, 170, FLOOR - 200, ev.land1, 5, 1.8);
      smoke(ctx, t, 160, FLOOR - 200, ev.land2, 7, 2.2);
      smoke(ctx, t, EDGE + 70, LAVA - 40, ev.splash3 + 0.2, 9, 2.6);
      smoke(ctx, t, 150, FLOOR - 210, ev.sit, 6, 2.2);
      // dust when the bridge lands
      if (t >= ev.bridge && t < ev.bridge + 1) { const a = t - ev.bridge; for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - a); G.ellipse(ctx, 330 + i * 110, GEO.BRIDGE_TOP - 10 - a * 60, 30 + a * 50, 20 + a * 30, { fill: '#D8C8B8', lw: 3, seed: 500 + i }); ctx.restore(); } }
      bulb(ctx, t, 150, FLOOR - 330);
      if (t >= ev.win) G.confetti(ctx, t, ev.win, { n: 110, seed: 4 });
      ctx.restore();

      // words
      for (const l of S.labels) if (t >= l.t && t < l.end) {
        const p = ease.outBack(clamp((t - l.t) / 0.25), 2);
        ctx.save(); ctx.translate(SAFE.x + 40, SAFE.y + 70); ctx.scale(p, p);
        G.text(ctx, l.text, 0, 0, { size: 64, fam: 'Bungee', weight: 400, color: '#FFFFFF', stroke: INK, strokeW: 8 });
        ctx.restore();
      }
      if (t >= ev.splash3 + 0.6 && t < ev.idea) G.text(ctx, '...', W / 2, 760, { size: 120, align: 'center', fam: 'Bungee', weight: 400, color: '#FFFFFF', stroke: INK, strokeW: 10 });
      const st2 = state(t);
      for (const sh of S.shouts) if (t >= sh.t && t < sh.end) stamp(ctx, t, sh.t, sh.end, sh.text, clamp(540 + (st2.x - 515) * 1.15, 380, 680), clamp(1260 + (st2.y - 1300) * 1.15 - 400, SAFE.y + 260, 1050), 84, '#FFE06A');
      stamp(ctx, t, ev.idea, ev.bridge, '¡IDEA!', 520, 760, 110, '#FFE06A');
      stamp(ctx, t, ev.bridge, ev.bridge + 0.9, '¡PUM!', 600, 1080, 100, '#FFFFFF', 0.05);
      stamp(ctx, t, ev.win, ev.end, '¡LO LOGRÓ!', W / 2 - 40, 640, 110, '#7CF29A');

      // white flashes on the idea and the win
      for (const tf of [ev.idea, ev.win]) { const a = t - tf; if (a >= 0 && a < 0.2) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - a / 0.2); ctx.fillStyle = '#FFF6D8'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      // the end card
      const e = clamp((t - ev.end) / 0.4);
      if (e > 0) {
        ctx.save(); ctx.globalAlpha = e;
        ctx.fillStyle = 'rgba(30,16,24,0.82)'; ctx.fillRect(0, 0, W, H);
        const pop = ease.outBack(e, 2);
        ctx.translate(W / 2 - 50, 640); ctx.scale(pop, pop);
        G.text(ctx, 'LOCKY', 0, 0, { size: 190, align: 'center', fam: 'Bungee', weight: 400, color: '#F2B84B', stroke: INK, strokeW: 16 });
        G.text(ctx, 'Mirá por dónde', 0, 170, { size: 76, align: 'center', fam: 'Permanent Marker', weight: 400, color: '#FFFFFF' });
        G.text(ctx, 'caminás', 0, 260, { size: 76, align: 'center', fam: 'Permanent Marker', weight: 400, color: '#FFFFFF' });
        if (YAY) { const w = 760, h = w * YAY.height / YAY.width; ctx.drawImage(YAY, -w / 2 + 40, 330, w, h); } else locky(ctx, { x: 0, y: 640, s: 1.3, eyes: 'happy', arms: 'cheer', blush: true });
        ctx.restore();
      }
    },
  });
})();
