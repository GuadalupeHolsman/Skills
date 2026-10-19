// THE FILM: Locky (Loomlock's mascot, rigged from the official vector) vs. the lava. One wide shot of a volcanic cave,
// with camera shakes on every hit. Every frame is a pure function of t; every event comes from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { ev, GEO, T, BEAT } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const INK = '#2A1E1A';

  // ---------- Locky ----------
  // Rigged from the official vector (assets/BASIC_LOCKY.svg, 1024 viewBox): each body part is its own path,
  // posed around its joint. origin = between the feet. o: {x, y, s, rot, walk (phase) | null, eyes, burn 0..1,
  // open 0..1 (shackle), phone, arms: 'phone'|'down'|'up'|'cheer'|'flail'|'sad', mouth: 'smile'|'scream'|'sad', squash}
  const SVG = {
    armR: 'M740.61,579.84l10.51,60.38,2.48,14.24,6.79,39.02c12.16,6.54,21.21,18.52,23.35,33.23,3.59,24.67-13.5,47.59-38.17,51.18-24.67,3.59-47.59-13.5-51.18-38.17-2.14-14.72,3.11-28.77,12.9-38.51l-4.51-38.41-1.86-15.82-7.08-60.33c-2.36-16.2,44.42-23.01,46.78-6.81Z',
    legR: 'M578.99,697.48v134.69h22.77c11.33,0,20.52,9.19,20.52,20.52h0c0,11.33-9.19,20.52-20.52,20.52h-61.9c-11.33,0-20.52-9.19-20.52-20.52v-155.21h59.64Z',
    legL: 'M467.18,704.11v134.69h22.77c11.33,0,20.52,9.19,20.52,20.52h0c0,11.33-9.19,20.52-20.52,20.52h-61.9c-11.33,0-20.52-9.19-20.52-20.52v-155.21h59.64Z',
    shackle: 'M498.16,144.77h0c-83.37,0-150.96,67.59-150.96,150.96v54.08h83.22v-54.44c0-37.42,30.33-67.75,67.75-67.75h0c37.41,0,67.75,30.33,67.75,67.75v54.44h83.22v-54.08c0-83.37-67.59-150.96-150.96-150.96Z',
    side: 'M377.95,758.06l-86.2-5.43c-16.65.11-30.2-13.35-30.2-30l-2.26-343.96c0-14.99,11.07-27.68,25.92-29.72l90.48-12.43,2.26,421.53Z',
    front: 'M715.4,749.57l-337.45,8.49c-16.86.42-30.75-13.13-30.75-29.99v-361.54c0-16.57,13.43-30,30-30h337.45c16.57,0,30,13.43,30,30v353.05c0,16.27-12.98,29.58-29.25,29.99Z',
    eye: 'M41.78,0c.79,54.21-84.36,54.21-83.56,0-.79-54.21,84.36-54.21,83.56,0Z', // centred on (0,0)
    smile: 'M570.81,501.9c.47,32.3-50.27,32.3-49.79,0',
    armL: 'M284.21,591.45s-5.99,34.42-10.51,60.38-9.27,53.26-9.27,53.26c-12.16,6.54-21.21,18.52-23.35,33.23-3.59,24.67,13.5,47.59,38.17,51.18,24.67,3.59,47.59-13.5,51.18-38.17,2.14-14.72-3.11-28.77-12.9-38.51,0,0,3.56-30.3,6.37-54.23,2.81-23.94,7.08-60.33,7.08-60.33,2.36-16.2-44.42-23.01-46.78-6.81Z',
  };
  const PATH = {};
  const pth = (k) => PATH[k] || (PATH[k] = new Path2D(SVG[k]));
  const OUT = '#000000';
  const JOINT = { armL: [307, 590], armR: [717, 578], legL: [437, 712], legR: [549, 705], shackle: [608, 350] };
  const ORIGIN = [511, 877], EYES = [[439.9, 501.9], [652, 501.9]], FACE = [546, 510];
  function part(ctx, k, fill, ang = 0, dx = 0, dy = 0) {
    ctx.save(); ctx.translate(dx, dy);
    if (ang) { const [jx, jy] = JOINT[k]; ctx.translate(jx, jy); ctx.rotate(ang); ctx.translate(-jx, -jy); }
    const p = pth(k);
    if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
    ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(p);
    ctx.restore();
  }
  function oval(ctx, x, y, rx, ry, fill, lw = 6) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.stroke(); }
  }
  function stroke(ctx, pts, lw = 7) {
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    if (pts.length === 3) ctx.quadraticCurveTo(...pts[1], ...pts[2]); else for (const p of pts.slice(1)) ctx.lineTo(...p);
    ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function locky(ctx, o) {
    const s = (o.s || 1) * 0.3, burn = o.burn || 0;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0);
    const sq = o.squash || 0; ctx.scale(s * (1 + sq * 0.25), s * (1 - sq * 0.3));
    ctx.translate(-ORIGIN[0], -ORIGIN[1]);
    const b = (c, k) => (burn > 0 ? mix(c, k[0], burn * k[1]) : c);
    const blue = b('#3F49CC', ['#2C2730', 0.85]), sky = b('#9FD8FF', ['#4A4650', 0.8]);
    const lav = b('#878EE5', ['#4A4458', 0.6]), glove = b('#FFFFFF', ['#8A8488', 0.6]);
    const t = G.t;
    // walk cycle: legs swing from the hips, the body bobs on the passing pose
    const ph = o.walk;
    const swing = ph == null ? 0 : Math.sin(ph) * 0.38;
    const liftL = ph == null ? 0 : Math.max(0, Math.cos(ph)) * 26, liftR = ph == null ? 0 : Math.max(0, -Math.cos(ph)) * 26;
    const bob = ph == null ? 0 : -Math.abs(Math.cos(ph)) * 16;
    // arm angles around the shoulders (0 = hanging); the right arm comes in front of the body when it is posed
    const fl = Math.sin(t * 40);
    const arms = o.arms || 'down';
    const [aL, aR] = {
      down: [swing * 0.6, -swing * 0.6], phone: [-1.05, 1.05], sad: [-0.62, 0.62],
      up: [2.8, -2.8], cheer: [2.35 + 0.1 * Math.sin(t * 12), -2.35 - 0.1 * Math.sin(t * 12)],
      flail: [2.1 + 0.55 * fl, -2.1 - 0.55 * Math.sin(t * 40 + 1.3)],
    }[arms];
    part(ctx, 'legR', lav, -swing, 0, -liftR);
    part(ctx, 'legL', lav, swing, 0, -liftL);
    ctx.save(); ctx.translate(0, bob);
    if (arms === 'down') part(ctx, 'armR', glove, aR);
    // the shackle pops open when Locky is shocked
    const op = o.open || 0;
    part(ctx, 'shackle', sky, -op * 0.55, 0, -op * 80);
    part(ctx, 'side', b('#000000', ['#000000', 0]));
    part(ctx, 'front', blue);
    if (burn > 0.2) { // soot smudges, kept on the body
      ctx.save(); ctx.clip(pth('front'));
      for (let i = 0; i < 7; i++) { ctx.globalAlpha = burn * 0.7; oval(ctx, 400 + G.rnd(i, 21) * 300, 360 + G.rnd(i, 22) * 360, 22 + G.rnd(i, 23) * 36, 16 + G.rnd(i, 24) * 22, '#0E0C10', 0); }
      ctx.restore();
    }
    // the face: plain white oval eyes, a small smile
    const eyes = o.eyes || 'normal';
    const look = eyes === 'phone' ? [6, 22] : [(o.lookX || 0) * 1.6, (o.lookY || 0) * 1.6];
    for (const [ex0, ey0] of EYES) {
      const ex = ex0 + look[0], ey = ey0 + look[1], left = ex0 < FACE[0];
      if (eyes === 'closed') { stroke(ctx, [[ex - 34, ey - 6], [ex, ey + 22], [ex + 34, ey - 6]], 8); continue; }
      if (eyes === 'happy') { stroke(ctx, [[ex - 34, ey + 12], [ex, ey - 30], [ex + 34, ey + 12]], 8); continue; }
      const k = eyes === 'wide' ? 1.3 : 1;
      ctx.save(); ctx.translate(ex, ey); ctx.scale(k, k);
      const e = pth('eye'); ctx.fillStyle = '#FFFFFF'; ctx.fill(e); ctx.lineWidth = 6 / k; ctx.strokeStyle = OUT; ctx.stroke(e);
      ctx.restore();
      if (eyes === 'wide') oval(ctx, ex + (o.lookX || 0), ey + 4, 10, 10, OUT, 0);
      if (eyes === 'spiral') {
        ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 0.5 + t * 14 * (left ? 1 : -1), r = i * 0.85; ctx[i ? 'lineTo' : 'moveTo'](ex + r * Math.cos(a), ey + r * 0.9 * Math.sin(a)); }
        ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke();
      }
      if (eyes === 'sad') { // droopy lids, sloping down to the outside
        ctx.beginPath(); ctx.moveTo(ex - 50, ey - 50); ctx.lineTo(ex + 50, ey - 50);
        ctx.lineTo(ex + 50, ey + (left ? -18 : 4)); ctx.lineTo(ex - 50, ey + (left ? 4 : -18)); ctx.closePath();
        ctx.fillStyle = blue; ctx.fill();
        stroke(ctx, [[ex - 40, ey + (left ? 2 : -16)], [ex + 40, ey + (left ? -16 : 2)]], 6);
      }
    }
    const [mx, my] = [FACE[0] + look[0] * 0.6, FACE[1] + look[1] * 0.6];
    const mouth = o.mouth || 'smile';
    if (mouth === 'scream') {
      oval(ctx, mx, my + 34, 32, 40, '#5A1E2E');
      oval(ctx, mx, my + 56, 18, 11, '#F27BA0', 0);
    } else if (mouth === 'sad') {
      stroke(ctx, [[mx - 26, my + 26], [mx, my + 4], [mx + 26, my + 26]], 6);
    } else {
      ctx.save(); ctx.translate(look[0] * 0.6, look[1] * 0.6);
      ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(pth('smile'));
      ctx.restore();
    }
    if (o.blush) { ctx.save(); ctx.globalAlpha = 0.5; oval(ctx, 395, 566, 30, 16, '#F27BA0', 0); oval(ctx, 698, 566, 30, 16, '#F27BA0', 0); ctx.restore(); }
    // the phone, held in both hands in front of the body
    if (o.phone) {
      ctx.save(); ctx.translate(FACE[0] - 30, 650); ctx.rotate(-0.12);
      ctx.beginPath(); ctx.roundRect(-62, -96, 124, 192, 22); ctx.fillStyle = '#1C1C26'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.roundRect(-48, -80, 96, 158, 12); ctx.fillStyle = '#F37BC0'; ctx.fill();
      ctx.restore();
    }
    if (arms !== 'down') part(ctx, 'armR', glove, aR);
    part(ctx, 'armL', glove, aL);
    ctx.restore();
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
