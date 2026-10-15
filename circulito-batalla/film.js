// THE FILM — "La batalla". Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Circ = globalThis.Circ, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, DY = Circ.DESK_Y, INK = Circ.INK;
  const CX = 470, HEAD = [CX, 1040];
  const PHONE = [250, DY - 40];
  const BAG = [540, 1420]; // the beanbag in the lounge shot
  const COL = { heart: '#E5484D', chat: '#3FB37F', fire: '#F28C28', bell: '#F2B84B' };

  // ---------- a notification bug ----------
  function bug(ctx, x, y, kind, { s = 1, t = 0, i = 0, rot = 0, flat = 0, alpha = 1 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (1 + flat * 0.6), s * (1 - flat * 0.75));
    // wings
    const flap = Math.sin(t * 40 + i) * 0.5;
    for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * (0.5 + flap * 0.4)); G.ellipse(ctx, sd * 38, -30, 26, 14, { fill: 'rgba(230,245,255,0.85)', seed: 500 + sd, lw: 3 }); ctx.restore(); }
    const c = COL[kind];
    if (kind === 'heart') G.shape(ctx, [[0, 34], [-44, -4], [-40, -30], [-20, -40], [0, -24], [20, -40], [40, -30], [44, -4]], { fill: c, seed: 510, lw: 5 });
    else if (kind === 'chat') { G.rrect(ctx, -44, -36, 88, 64, 26, { fill: c, seed: 511, lw: 5 }); G.poly(ctx, [[-20, 24], [-34, 44], [-2, 26]], { fill: c, seed: 512, lw: 4 }); }
    else if (kind === 'fire') G.shape(ctx, [[0, 36], [-36, 10], [-30, -18], [-14, -6], [-10, -40], [8, -18], [18, -46], [36, -6], [34, 16]], { fill: c, seed: 513, lw: 5 });
    else { G.shape(ctx, [[-38, 22], [-28, -14], [-14, -34], [14, -34], [28, -14], [38, 22]], { fill: c, seed: 514, lw: 5 }); G.ellipse(ctx, 0, 30, 9, 9, { fill: c, seed: 515, lw: 4 }); }
    // cheeky face
    for (const sd of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(sd * 14, -6, 10, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sd * 14 + 2, -4, 5, 0, Math.PI * 2); ctx.fill(); }
    G.line(ctx, [[-12, 12], [0, 20], [12, 12]], { lw: 4, seed: 516, step: 6 });
    // red badge
    if (flat < 0.5) { G.ellipse(ctx, 34, -34, 13, 13, { fill: '#FF3B30', seed: 517, lw: 3 }); G.text(ctx, '1', 34, -26, { size: 22, fam: 'Inter', weight: 800, color: '#fff', align: 'center', boil: 0 }); }
    ctx.restore();
  }

  // where bug b is at time t (center = who it orbits)
  function bugPos(b, t, center) {
    const age = t - b.t;
    if (age < 0) return null;
    const ang = b.i * 0.9 + t * 1.7 + (t >= ev.tickle ? t * 1.2 : 0);
    const rad = 250 + 40 * Math.sin(t * 3 + b.i) - (t >= ev.tickle && t < ev.carry ? 70 : 0);
    let ox = center[0] + Math.cos(ang) * rad, oy = center[1] + Math.sin(ang) * rad * 0.8;
    const k = ease.outCubic(clamp(age / 0.35));
    let x = lerp(PHONE[0], ox, k), y = lerp(PHONE[1] - 60, oy, k) - Math.sin(Math.PI * k) * 120;
    let rot = Math.sin(t * 6 + b.i) * 0.2, s = 1.15 * ease.outBack(clamp(age / 0.2), 2.5);
    if (b.swat && t >= b.swat) { const u = t - b.swat; x += -1400 * u; y += -900 * u + 600 * u * u; rot += u * 20; }
    return { x, y, rot, s };
  }

  function circ(ctx, t) {
    const o = { x: CX, y: DY + 40, r: 170, eyes: 'focus', mouth: 'smile', brows: 'determined', t };
    const hands = { L: [CX + 110, DY - 25], R: [700, DY - 25] };
    const typingKey = [...S.keys].reverse().find((k) => k.t <= t);
    if (t < ev.buzz || (t >= ev.back && t < ev.end)) {
      const down = (h) => (typingKey && typingKey.hand === h && t - typingKey.t < 0.1 ? 14 : 0);
      hands.L[1] += down(0); hands.R[1] += down(1);
      if (t >= ev.back) { o.eyes = 'happy'; o.brows = null; o.mouth = 'grin'; }
    } else if (t < ev.swarm) {
      o.eyes = 'normal'; o.mouth = 'frown'; o.look = -0.5;
      // swats: the right hand flies to the bug
      const sw = S.bugs.find((b) => b.swat && t >= b.swat - 0.2 && t < b.swat + 0.25);
      if (sw) { const p = bugPos(sw, sw.swat, HEAD); const u = clamp((t - (sw.swat - 0.2)) / 0.2); hands.R = [lerp(700, p.x, ease.outCubic(u)), lerp(DY - 25, p.y, ease.outCubic(u))]; o.mouth = 'grin'; }
    } else if (t < ev.tickle) {
      o.eyes = 'wide'; o.brows = 'worried'; o.mouth = 'o'; o.sweat = true;
      hands.L = [CX - 120 + Math.sin(t * 20) * 30, 900]; hands.R = [CX + 120 - Math.sin(t * 20) * 30, 900];
    } else if (t < ev.carry) {
      o.eyes = 'happy'; o.brows = null; o.mouth = 'open'; o.blush = 0.9; o.rot = Math.sin(t * 24) * 0.08;
      o.sx = 1 + 0.05 * Math.sin(t * 30); o.sy = 1 - 0.05 * Math.sin(t * 30);
      hands.L = [CX - 200, 1000 + Math.sin(t * 25) * 20]; hands.R = [CX + 200, 1000 - Math.sin(t * 25) * 20];
    } else {
      // carried off to the left, hop per beat
      const u = clamp((t - ev.carry) / (ev.lounge - ev.carry));
      const hop = Math.sin(Math.PI * clock.phase(t)) * 50;
      o.x = CX - 700 * ease.inQuad(u); o.y = DY - 180 - hop; o.eyes = 'happy'; o.brows = null; o.mouth = 'open'; o.blush = 0.9; o.rot = -0.25;
      hands.L = [o.x - 230, o.y - 300]; hands.R = [o.x + 200, o.y - 300];
    }
    return { o, hands };
  }

  function deskShot(ctx, t) {
    Circ.room(ctx, { hour: 10.5 });
    G.rrect(ctx, -20, 895, 330, 26, 6, { fill: Circ.C.deskTop, seed: 401, lw: 5 });
    G.rrect(ctx, 780, 895, 330, 26, 6, { fill: Circ.C.deskTop, seed: 402, lw: 5 });
    Circ.buddy(ctx, { x: 935, y: 900, s: 0.5, shape: 'triangle', color: '#E8718D', look: -1, eyes: t >= ev.tickle && t < ev.lounge ? 'wide' : 'normal', mouth: t >= ev.tickle && t < ev.lounge ? 'o' : 'smile' });
    const back = t >= ev.back;
    const { o, hands } = circ(ctx, t);
    Circ.chair(ctx, CX);
    const center = [o.x, o.y - 170];
    // during the carry the bugs hold him from below
    const carrying = t >= ev.carry && t < ev.lounge;
    const live = S.bugs.filter((b) => !b.swat || t < b.swat + 1.2);
    if (!back && !carrying) for (const b of live) { const p = bugPos(b, t, center); if (p && p.y < center[1]) bug(ctx, p.x, p.y, b.kind, { s: p.s, t, i: b.i, rot: p.rot }); }
    if (back) {
      // the shield stays up while he works
      shield(ctx, HEAD[0], HEAD[1], 290, t, 1);
    }
    Circ.body(ctx, o);
    Circ.deskTop(ctx);
    Circ.mug(ctx, 95, DY - 10, { t });
    Circ.laptop(ctx, 760);
    const ph = !carrying ? { s: 0.62, rot: -0.12, screen: back ? 'on' : t >= ev.buzz ? 'on' : 'off', faceDown: !back && t < ev.buzz, lock: back ? 1 : 0, buzz: t >= ev.buzz && t < ev.buzz + 0.4 ? 1 : 0 } : null;
    if (ph) Circ.phone(ctx, PHONE[0], PHONE[1], { ...ph, t });
    Circ.arms(ctx, o, hands);
    if (carrying) S.bugs.filter((b) => !b.swat).forEach((b, k) => { const n = 7; const x = o.x - 180 + (k / (n - 1)) * 360; bug(ctx, x, o.y + 10 + Math.sin(t * 12 + k) * 8, b.kind, { s: 0.8, t, i: b.i, rot: Math.sin(t * 9 + k) * 0.2 }); });
    if (!back && !carrying) for (const b of live) { const p = bugPos(b, t, center); if (p && p.y >= center[1]) bug(ctx, p.x, p.y, b.kind, { s: p.s, t, i: b.i, rot: p.rot }); }
    if (back) S.bounces.forEach((tb, k) => {
      const u = (t - (tb - 0.4)) / 1.2;
      if (u < 0 || u > 1) return;
      const sx = k % 2 ? 1150 : -100, ang = k % 2 ? -0.3 : Math.PI + 0.3;
      const hx = HEAD[0] + Math.cos(ang) * 300, hy = HEAD[1] + Math.sin(ang) * 260;
      const p = u < 1 / 3 ? [lerp(sx, hx, u * 3), lerp(HEAD[1] - 200, hy, u * 3)] : [lerp(hx, sx, (u - 1 / 3) * 1.5), hy - 400 * (u - 1 / 3) + 600 * (u - 1 / 3) ** 2];
      bug(ctx, p[0], p[1], ['fire', 'chat', 'heart'][k], { s: 0.8, t, i: k, rot: u > 1 / 3 ? (u - 1 / 3) * 12 : 0, flat: u > 1 / 3 && u < 0.45 ? 0.4 : 0 });
    });
    Circ.deskFront(ctx);
  }

  function shield(ctx, x, y, R, t, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(x, y, R * 0.5, x, y, R);
    g.addColorStop(0, 'rgba(142,130,255,0.05)'); g.addColorStop(0.85, 'rgba(142,130,255,0.25)'); g.addColorStop(1, 'rgba(91,75,219,0.55)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    G.ellipse(ctx, x, y, R, R, { stroke: '#5B4BDB', lw: 7, seed: 600 });
    // hex shimmer
    for (let k = 0; k < 6; k++) { const a0 = t * 0.8 + k; G.line(ctx, [[x + Math.cos(a0) * R * 0.92, y + Math.sin(a0) * R * 0.92], [x + Math.cos(a0 + 0.25) * R * 0.92, y + Math.sin(a0 + 0.25) * R * 0.92]], { color: '#FFFFFF', lw: 5, seed: 601 + k, alpha: 0.7 }); }
    Circ.padlock(ctx, x + R * 0.72, y - R * 0.72, 0.4, 1);
    ctx.restore();
  }

  function loungeShot(ctx, t) {
    Circ.room(ctx, { hour: 11 });
    // floor + rug
    G.rrect(ctx, -20, 1180, W + 40, H, 0, { fill: Circ.C.floor, seed: 700, lw: 6, hatch: { color: 'rgba(80,40,10,0.12)', gap: 16, angle: 0.1 } });
    G.ellipse(ctx, 540, 1470, 470, 90, { fill: '#7CC4A4', seed: 701, lw: 5 });
    // beanbag
    G.shape(ctx, [[180, 1480], [210, 1300], [330, 1210], [540, 1190], [750, 1210], [870, 1300], [900, 1480], [540, 1530]], { fill: '#8E82FF', seed: 702, lw: 6, hatch: { color: 'rgba(40,20,120,0.15)', gap: 12 } });
    const center = [BAG[0], BAG[1] - 250];
    const shieldOn = t >= ev.shield;
    const st = { x: BAG[0], y: BAG[1] - 40, r: 170, sx: 1.12, sy: 0.88, eyes: 'spiral', mouth: 'smile', glow: 1, messy: 0.6, t, blush: 0.5 };
    let phone = { x: BAG[0], y: BAG[1] - 150, s: 0.8, faceDown: true };
    if (t >= ev.scratch) { st.eyes = 'normal'; st.brows = 'determined'; st.mouth = 'flat'; st.glow = 0; st.sy = 1; st.sx = 1; }
    if (t >= ev.lock) { phone = { x: BAG[0], y: BAG[1] - 170, s: 0.95, screen: 'on', lock: clamp((t - ev.lock) / 0.25) }; }
    if (shieldOn) { st.eyes = 'happy'; st.mouth = 'grin'; st.brows = null; }
    const bugsLive = S.bugs.filter((b) => !b.swat);
    const drawBugs = (front) => bugsLive.forEach((b, k) => {
      let p = bugPos(b, t, center);
      if (!p) return;
      let flat = 0, rot = p.rot, alpha = 1;
      if (shieldOn) {
        const u = t - ev.shield, ang = Math.atan2(p.y - center[1], p.x - center[0]);
        const out = 300 + 900 * u;
        const fall = Math.max(0, u - 0.25) ** 2 * 1800;
        p = { x: center[0] + Math.cos(ang + k * 0.2) * out, y: center[1] + Math.sin(ang) * out * 0.6 + fall, s: p.s * Math.max(0.3, 1 - u * 0.8) };
        flat = clamp(u * 2); rot += u * 8;
      }
      if ((p.y >= center[1]) === front) bug(ctx, p.x, p.y, b.kind, { s: p.s, t, i: b.i, rot, flat, alpha });
    });
    drawBugs(false);
    const shake = t >= ev.scratch && t < ev.scratch + 0.4 ? 14 * Math.exp(-(t - ev.scratch) * 9) : 0;
    st.x += U.noise1(t * 50, 3) * shake;
    Circ.body(ctx, st);
    Circ.phone(ctx, phone.x, phone.y, { s: phone.s, faceDown: phone.faceDown, screen: phone.screen || 'off', lock: phone.lock || 0, t });
    Circ.arms(ctx, st, { L: [phone.x - 50 * phone.s - 8, phone.y + 30], R: [phone.x + 50 * phone.s + 8, phone.y + 30] });
    drawBugs(true);
    if (shieldOn) {
      const u = clamp((t - ev.shield) / 0.35);
      shield(ctx, BAG[0], BAG[1] - 200, 80 + 300 * ease.outBack(u, 1.8), t, 1);
    }
  }

  Studio.film({
    draw(ctx, t) {
      ctx.save();
      if (t >= ev.lounge && t < ev.back) loungeShot(ctx, t);
      else deskShot(ctx, t);
      ctx.restore();
      for (const [tf, a] of [[ev.scratch, 0.5], [ev.shield, 0.85], [ev.back, 0.5]]) { const f = t >= tf ? a * Math.exp(-(t - tf) * 10) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,252,240,${f})`; ctx.fillRect(0, 0, W, H); } }
      if (t >= ev.lock - 0.01 && t < ev.shield + 0.7) G.bubble(ctx, '¡Loomlock!', 560, 470, 540, 900, t, ev.lock, ev.shield + 0.5, { size: 70 });
      for (const c of S.captions) G.caption(ctx, c, t);
      Circ.endCard(ctx, t, ev.end, ev.click, { tagline: 'Que las notificaciones esperen.' });
    },
    post: { paper: 0.35, vignette: 0.25, grain: 0.04 },
    fadeOut: 0.6,
  });
})();
