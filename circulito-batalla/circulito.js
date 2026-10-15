// CIRCULITO — shared character, coworking set and Loomlock end card for the three films.
// Every function is pure: same arguments -> same drawing (randomness only via seeds).
(function () {
  const U = globalThis.U, G = globalThis.G;
  const { clamp, lerp, ease } = U;
  const INK = '#2A2320';
  const C = {
    body: '#FFC94A', bodyDark: '#E3A52B', blush: '#F28B82',
    wall: '#F3E6D0', wallDark: '#E6D3B5', floor: '#C9A27A',
    desk: '#B97A4E', deskDark: '#8E5A37', deskTop: '#D39463',
    laptop: '#C9CED6', laptopDark: '#9DA4AF',
    phone: '#2D3142', glow: '#7FD3FF',
    lock: '#5B4BDB', lockDark: '#3E31A8', lockLight: '#8E82FF',
    plant: '#4E9A57', plantDark: '#3E8549', pot: '#E0703E',
    mug: '#E8718D', coffee: '#6B4226',
  };

  // ---------- CIRCULITO ----------
  // o: {x, y (contact point at the bottom), r, sx, sy, rot, eyes, look, lookY, mouth, brows, blush, sweat,
  //     messy (0..1 hair), glow (0..1 phone light on the face), color, feet}
  function body(ctx, o) {
    const r = o.r || 170, sx = o.sx || 1, sy = o.sy || 1;
    const rx = r * sx, ry = r * sy;
    const cx = o.x, cy = o.y - ry;
    ctx.save();
    ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.translate(-o.x, -o.y);
    if (o.feet) {
      G.ellipse(ctx, cx - rx * 0.4, o.y - 6, r * 0.24, r * 0.12, { fill: C.bodyDark, seed: 41 });
      G.ellipse(ctx, cx + rx * 0.4, o.y - 6, r * 0.24, r * 0.12, { fill: C.bodyDark, seed: 42 });
    }
    // hair curl on top (gets messy)
    const m = o.messy || 0, top = cy - ry;
    const tufts = m > 0.2 ? [[-0.35, -0.5], [0, 0], [0.4, 0.45], [-0.15, -0.9], [0.2, 0.8]] : [[0, 0]];
    tufts.forEach(([dx, lean], i) => {
      const bx = cx + dx * r * 0.5, h = r * (0.3 + 0.12 * m);
      G.line(ctx, [[bx, top + 8], [bx + lean * 30 * m + 8, top - h * 0.6], [bx + lean * 50 * m + 22, top - h], [bx + lean * 50 * m + 34, top - h * 0.78]], { lw: 7, seed: 50 + i });
    });
    G.ellipse(ctx, cx, cy, rx, ry, { fill: o.color || C.body, seed: 7, lw: 6, hatch: { color: 'rgba(160,100,20,0.18)', gap: 11, angle: -0.6 } });
    // soft highlight
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF4C9';
    ctx.beginPath(); ctx.ellipse(cx - rx * 0.4, cy - ry * 0.45, rx * 0.22, ry * 0.14, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // phone glow on the face
    if (o.glow > 0) {
      const g = ctx.createRadialGradient(cx, cy + ry * 0.2, 0, cx, cy + ry * 0.2, rx * 1.1);
      g.addColorStop(0, `rgba(127,211,255,${0.55 * o.glow})`); g.addColorStop(1, 'rgba(127,211,255,0)');
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2); ctx.restore();
    }
    face(ctx, cx, cy, rx, ry, r, o);
    ctx.restore();
    return { cx, cy, rx, ry };
  }

  function face(ctx, cx, cy, rx, ry, r, o) {
    const look = clamp(o.look || 0, -1, 1), lookY = clamp(o.lookY || 0, -1, 1);
    const eyes = o.eyes || 'normal';
    const ex = rx * 0.34, ey = cy - ry * 0.12, er = r * 0.2 * (o.eyeScale || 1);
    const off = look * rx * 0.12;
    for (const s of [-1, 1]) {
      const x = cx + s * ex + off, y = ey + lookY * ry * 0.06;
      if (eyes === 'happy') { G.line(ctx, [[x - er * 0.8, y + er * 0.3], [x, y - er * 0.5], [x + er * 0.8, y + er * 0.3]], { lw: 8, seed: 60 + s }); continue; }
      if (eyes === 'closed') { G.line(ctx, [[x - er * 0.8, y], [x, y + er * 0.45], [x + er * 0.8, y]], { lw: 7, seed: 62 + s }); continue; }
      const wide = eyes === 'wide' ? 1.25 : 1;
      G.ellipse(ctx, x, y, er * 0.82 * wide, er * wide, { fill: '#FFFFFF', seed: 64 + s, lw: 5 });
      if (eyes === 'spiral') {
        const pts = []; const spin = (o.t || 0) * 9 * s;
        for (let a = 0; a < Math.PI * 6; a += 0.25) { const rr = (a / (Math.PI * 6)) * er * 0.78; pts.push([x + Math.cos(a + spin) * rr, y + Math.sin(a + spin) * rr]); }
        G.line(ctx, pts, { lw: 4, seed: 66 + s, amp: 0.3, step: 6 });
        continue;
      }
      const pr = eyes === 'wide' ? er * 0.3 : er * 0.46;
      const px = x + look * er * 0.32, py = y + lookY * er * 0.35;
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, Math.PI * 2); ctx.fill();
      // lids
      const lid = eyes === 'focus' ? 0.42 : eyes === 'tired' ? 0.55 : (o.blink || 0);
      if (lid > 0) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, er * 0.82 * wide + 3, er * wide + 3, 0, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = o.color || C.body; ctx.fillRect(x - er, y - er * 1.3, er * 2, er * 2.3 * lid);
        ctx.restore();
        G.line(ctx, [[x - er * 0.85, y - er * 1.0 + er * 2.3 * lid - 3], [x + er * 0.85, y - er * 1.0 + er * 2.3 * lid - 3]], { lw: 6, seed: 68 + s });
      }
    }
    // brows
    const b = o.brows;
    if (b) for (const s of [-1, 1]) {
      const x = cx + s * ex + off, y = ey - er * 1.45;
      const tilt = b === 'determined' ? 0.3 * s : b === 'worried' ? -0.3 * s : 0;
      const lift = b === 'up' ? -er * 0.35 : 0;
      G.line(ctx, [[x - er * 0.7, y + lift - tilt * er * 0.8], [x + er * 0.7, y + lift + tilt * er * 0.8]], { lw: 8, seed: 70 + s });
    }
    // blush
    const bl = o.blush ?? 0.35;
    if (bl > 0) { ctx.save(); ctx.globalAlpha = bl * 0.7; ctx.fillStyle = C.blush; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * rx * 0.58 + off, ey + er * 1.15, er * 0.6, er * 0.32, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    // mouth
    const mx = cx + off * 0.8, my = cy + ry * 0.3, mw = r * 0.2;
    const mouth = o.mouth || 'smile';
    if (mouth === 'smile') G.line(ctx, [[mx - mw, my - 4], [mx - mw * 0.4, my + mw * 0.45], [mx + mw * 0.4, my + mw * 0.45], [mx + mw, my - 4]], { lw: 7, seed: 80, step: 8 });
    else if (mouth === 'flat') G.line(ctx, [[mx - mw * 0.7, my + 6], [mx + mw * 0.7, my + 6]], { lw: 7, seed: 81 });
    else if (mouth === 'wavy') G.line(ctx, [[mx - mw, my + 6], [mx - mw * 0.5, my - 2], [mx, my + 8], [mx + mw * 0.5, my - 2], [mx + mw, my + 6]], { lw: 6, seed: 82, step: 6 });
    else if (mouth === 'frown') G.line(ctx, [[mx - mw * 0.8, my + mw * 0.4], [mx, my - 2], [mx + mw * 0.8, my + mw * 0.4]], { lw: 7, seed: 83, step: 8 });
    else if (mouth === 'o') G.ellipse(ctx, mx, my + 8, mw * 0.42, mw * 0.55, { fill: '#7A2E2E', seed: 84, lw: 5 });
    else if (mouth === 'grin' || mouth === 'open') {
      const h = mouth === 'open' ? mw * 1.1 : mw * 0.75;
      G.shape(ctx, [[mx - mw, my - 4], [mx + mw, my - 4], [mx + mw * 0.6, my + h * 0.7], [mx, my + h], [mx - mw * 0.6, my + h * 0.7]], { fill: '#7A2E2E', seed: 85, lw: 6 });
      ctx.fillStyle = '#F28B82'; ctx.beginPath(); ctx.ellipse(mx, my + h * 0.72, mw * 0.4, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    // sweat drop
    if (o.sweat) {
      const sx = cx + rx * 0.82, sy = cy - ry * 0.55 + (o.sweatY || 0);
      G.shape(ctx, [[sx, sy - 26], [sx + 14, sy], [sx, sy + 12], [sx - 14, sy]], { fill: '#9ED8F5', seed: 86, lw: 4 });
    }
  }

  // arms: noodles from the shoulders to the hands (absolute hand targets)
  function arms(ctx, o, hands) {
    const r = o.r || 170, sx = o.sx || 1, sy = o.sy || 1;
    const rx = r * sx, ry = r * sy, cx = o.x, cy = o.y - ry;
    for (const s of [-1, 1]) {
      const h = s < 0 ? hands.L : hands.R;
      if (!h) continue;
      const sh = [cx + s * rx * 0.86, cy + ry * 0.2];
      const mid = [(sh[0] + h[0]) / 2 + s * 30, (sh[1] + h[1]) / 2 + 20];
      G.limb(ctx, [sh, mid, h], { color: o.color || C.body, lw: 24, seed: 90 + s });
      G.ellipse(ctx, h[0], h[1], 21, 19, { fill: o.color || C.body, seed: 92 + s, lw: 5 });
    }
  }

  // ---------- coworkers: geometric friends ----------
  function buddy(ctx, o) {
    const { x, y, s = 0.55, shape = 'square', color = '#7CC4A4', eyes = 'normal', look = 0, mouth = 'smile', alpha = 1 } = o;
    ctx.save(); ctx.globalAlpha *= alpha;
    const h = 260 * s, w = 240 * s;
    if (shape === 'square') G.rrect(ctx, x - w / 2, y - h, w, h, 26 * s, { fill: color, seed: 101, lw: 5 });
    else G.poly(ctx, [[x, y - h * 1.15], [x + w * 0.6, y], [x - w * 0.6, y]], { fill: color, seed: 102, lw: 5 });
    const ey = y - h * (shape === 'square' ? 0.62 : 0.42);
    for (const sd of [-1, 1]) {
      const ex = x + sd * w * 0.18 + look * 8;
      if (eyes === 'closed' || eyes === 'happy') { G.line(ctx, [[ex - 12, ey], [ex, ey + (eyes === 'happy' ? -8 : 6)], [ex + 12, ey]], { lw: 5, seed: 103 + sd }); continue; }
      const er = eyes === 'wide' ? 20 : 15;
      G.ellipse(ctx, ex, ey, er * 0.85, er, { fill: '#fff', seed: 104 + sd, lw: 4 });
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + look * 5, ey, eyes === 'wide' ? 5 : 7, 0, Math.PI * 2); ctx.fill();
    }
    const my = ey + 34 * s * 1.6;
    if (mouth === 'flat') G.line(ctx, [[x - 14, my], [x + 14, my]], { lw: 5, seed: 106 });
    else if (mouth === 'o') G.ellipse(ctx, x, my, 8, 11, { fill: '#7A2E2E', seed: 107, lw: 4 });
    else G.line(ctx, [[x - 16, my - 3], [x, my + 7], [x + 16, my - 3]], { lw: 5, seed: 108 });
    ctx.restore();
  }

  // ---------- the set ----------
  const SKY = {
    morning: ['#9FD8F2', '#DFF3FA'], noon: ['#7FC8EE', '#CFEFFB'], afternoon: ['#F6C27A', '#FBE3B4'],
    sunset: ['#F08A5D', '#F9C784'], night: ['#1E2350', '#3B3F78'],
  };
  function skyAt(hour) {
    const k = [[9, 'morning'], [12, 'noon'], [16, 'afternoon'], [18.5, 'sunset'], [20.5, 'night']];
    let a = k[0], b = k[0];
    for (let i = 0; i < k.length; i++) { if (hour >= k[i][0]) { a = k[i]; b = k[Math.min(i + 1, k.length - 1)]; } }
    const u = b === a ? 0 : clamp((hour - a[0]) / (b[0] - a[0]));
    const mix = (c1, c2) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(c1), B = p(c2); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; };
    return [mix(SKY[a[1]][0], SKY[b[1]][0]), mix(SKY[a[1]][1], SKY[b[1]][1])];
  }

  // room: wall, window with sky + city, pendant lamps. light 0..1 dims the room.
  function room(ctx, { hour = 9, lamps = [1, 1], W = G.W, H = G.H } = {}) {
    ctx.fillStyle = C.wall; ctx.fillRect(0, 0, W, H);
    // wainscot
    ctx.fillStyle = C.wallDark; ctx.fillRect(0, 760, W, 440);
    G.line(ctx, [[0, 760], [W, 760]], { lw: 5, seed: 120 });
    // window
    const wx = 420, wy = 250, ww = 600, wh = 440;
    const [s0, s1] = skyAt(hour);
    const g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, s0); g.addColorStop(1, s1);
    ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    // sun / moon
    const night = hour >= 19.5;
    const arc = clamp((hour - 8) / 11);
    const sunX = wx + 60 + arc * (ww - 120), sunY = wy + wh - 60 - Math.sin(arc * Math.PI) * (wh - 160);
    if (!night) { ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); G.ellipse(ctx, sunX, sunY, 46, 46, { fill: hour > 17 ? '#F26B3A' : '#FFD95A', seed: 121, lw: 4 }); ctx.restore(); }
    else { G.ellipse(ctx, wx + ww - 130, wy + 110, 40, 40, { fill: '#F6F0D2', seed: 122, lw: 4 }); for (let i = 0; i < 9; i++) G.star(ctx, wx + 40 + U.hash(i, 5) * (ww - 80), wy + 30 + U.hash(i, 6) * 180, 7, { fill: '#FFF1D2', seed: 130 + i }); }
    // city
    const city = []; let x = wx;
    for (let i = 0; x < wx + ww; i++) { const bw = 60 + U.hash(i, 1) * 60, bh = 80 + U.hash(i, 2) * 170; city.push([x, bw, bh]); x += bw; }
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    city.forEach(([bx, bw, bh], i) => {
      G.rrect(ctx, bx, wy + wh - bh, bw - 6, bh + 10, 4, { fill: night ? '#2C305E' : '#8DA7C4', seed: 140 + i, lw: 3 });
      if (night) for (let k = 0; k < 6; k++) if (U.hash(i, k) > 0.45) { ctx.fillStyle = '#FFD95A'; ctx.fillRect(bx + 10 + (k % 2) * 22, wy + wh - bh + 18 + Math.floor(k / 2) * 34, 12, 16); }
    });
    ctx.restore();
    G.rrect(ctx, wx, wy, ww, wh, 6, { stroke: INK, lw: 9, seed: 150 });
    G.line(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { lw: 8, seed: 151 });
    G.line(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], { lw: 8, seed: 152 });
    // pendant lamps
    [[230, lamps[0]], [930, lamps[1]]].forEach(([lx, on], i) => {
      G.line(ctx, [[lx, 0], [lx, 160]], { lw: 4, seed: 160 + i });
      if (on > 0) {
        const lg = ctx.createRadialGradient(lx, 200, 10, lx, 200, 420);
        lg.addColorStop(0, `rgba(255,226,150,${0.45 * on})`); lg.addColorStop(1, 'rgba(255,226,150,0)');
        ctx.fillStyle = lg; ctx.fillRect(lx - 420, 0, 840, 640);
      }
      G.poly(ctx, [[lx - 70, 230], [lx - 30, 160], [lx + 30, 160], [lx + 70, 230]], { fill: on > 0 ? '#F2B84B' : '#9C8456', seed: 162 + i, lw: 5 });
      G.ellipse(ctx, lx, 232, 26, 12, { fill: on > 0 ? '#FFF4C9' : '#6F6450', seed: 164 + i, lw: 4 });
    });
  }

  function clock(ctx, x, y, R, hour) {
    G.ellipse(ctx, x, y, R, R, { fill: '#FFFDF6', seed: 170, lw: 7 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; G.line(ctx, [[x + Math.sin(a) * R * 0.78, y - Math.cos(a) * R * 0.78], [x + Math.sin(a) * R * 0.9, y - Math.cos(a) * R * 0.9]], { lw: i % 3 ? 3 : 6, seed: 171 + i, amp: 0.4 }); }
    const hA = ((hour % 12) / 12) * Math.PI * 2, mA = (hour % 1) * Math.PI * 2;
    G.line(ctx, [[x, y], [x + Math.sin(hA) * R * 0.5, y - Math.cos(hA) * R * 0.5]], { lw: 9, seed: 185, amp: 0.4 });
    G.line(ctx, [[x, y], [x + Math.sin(mA) * R * 0.75, y - Math.cos(mA) * R * 0.75]], { lw: 6, seed: 186, amp: 0.4 });
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
  }

  // a digital-looking label under the clock: "09:00"
  function hhmm(hour) { const h = Math.floor(hour) % 24, m = Math.floor((hour % 1) * 60 + 1e-6); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }

  const DESK_Y = 1180;
  function deskTop(ctx, W = G.W) {
    G.rrect(ctx, -20, DESK_Y - 22, W + 40, 44, 10, { fill: C.deskTop, seed: 200, lw: 6 });
  }
  function deskFront(ctx, W = G.W, H = G.H) {
    G.rrect(ctx, -20, DESK_Y + 18, W + 40, H - DESK_Y, 0, { fill: C.desk, seed: 201, lw: 6, hatch: { color: 'rgba(80,40,10,0.18)', gap: 14, angle: 0.2 } });
    for (let i = 0; i < 3; i++) G.line(ctx, [[60, 1330 + i * 150], [W - 60, 1326 + i * 150]], { lw: 3, seed: 202 + i, alpha: 0.4 });
  }
  function chair(ctx, x) {
    G.rrect(ctx, x - 190, 820, 380, 400, 60, { fill: '#5C6BC0', seed: 210, lw: 6, hatch: { color: 'rgba(0,0,0,0.12)', gap: 12 } });
  }
  function laptop(ctx, x, { glow = 0.4, sticker = true } = {}) {
    // seen from behind: the lid
    G.rrect(ctx, x - 160, DESK_Y - 225, 320, 215, 16, { fill: C.laptop, seed: 220, lw: 6, hatch: { color: 'rgba(0,0,0,0.08)', gap: 10 } });
    G.rrect(ctx, x - 175, DESK_Y - 20, 350, 18, 6, { fill: C.laptopDark, seed: 221, lw: 5 });
    if (sticker) G.star(ctx, x, DESK_Y - 120, 28, { fill: '#FFC94A', seed: 222 });
    if (glow > 0) { ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = 'rgba(160,220,255,0.35)'; ctx.beginPath(); ctx.ellipse(x, DESK_Y - 235, 150, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  // phone: lying flat on the desk (seen at an angle) or held (cx,cy center, rot)
  function phone(ctx, cx, cy, { s = 1, rot = 0, screen = 'off', faceDown = false, buzz = 0, t = 0, lock = 0 } = {}) {
    ctx.save();
    const jx = buzz > 0 ? Math.sin(t * 90) * 7 * buzz : 0;
    ctx.translate(cx + jx, cy); ctx.rotate(rot + (buzz > 0 ? Math.sin(t * 70) * 0.06 * buzz : 0)); ctx.scale(s, s);
    const w = 110, h = 200;
    G.rrect(ctx, -w / 2, -h / 2, w, h, 20, { fill: C.phone, seed: 230, lw: 6 });
    if (!faceDown) {
      const lit = screen !== 'off';
      ctx.fillStyle = lit ? (lock > 0 ? '#EDEBFF' : '#BFE7FF') : '#3F4458';
      ctx.beginPath(); ctx.roundRect(-w / 2 + 10, -h / 2 + 14, w - 20, h - 28, 12); ctx.fill();
      if (lit && lock <= 0) {
        // notification pills
        const cols = ['#E8718D', '#4E9A57', '#F2B84B'];
        for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.roundRect(-w / 2 + 18, -h / 2 + 30 + i * 42, w - 36, 30, 10); ctx.fill(); }
      }
      if (lock > 0) padlock(ctx, 0, 6, 0.55 * U.ease.outBack(clamp(lock), 2.5), 1);
    } else {
      ctx.fillStyle = '#4A4F66'; ctx.beginPath(); ctx.arc(-w / 2 + 28, -h / 2 + 30, 13, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (buzz > 0) {
      for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) {
        const ox = cx + sd * (w * s * 0.5 + 18 + k * 18);
        G.line(ctx, [[ox, cy - 30 + k * 8], [ox + sd * 8, cy], [ox, cy + 30 - k * 8]], { lw: 4, seed: 240 + k + sd * 3, alpha: buzz });
      }
    }
  }
  function mug(ctx, x, y, { t = 0, steam = 1, frozen = 0 } = {}) {
    G.rrect(ctx, x - 50, y - 110, 100, 110, 14, { fill: frozen > 0.5 ? '#BFE3F5' : C.mug, seed: 250, lw: 6 });
    G.line(ctx, [[x + 50, y - 90], [x + 82, y - 82], [x + 82, y - 40], [x + 50, y - 30]], { lw: 8, seed: 251 });
    if (steam > 0 && frozen < 0.5) for (let i = 0; i < 3; i++) {
      const pts = []; for (let k = 0; k < 6; k++) pts.push([x - 25 + i * 25 + Math.sin(t * 4 + k * 0.9 + i) * 8, y - 125 - k * 16]);
      G.line(ctx, pts, { lw: 4, seed: 252 + i, alpha: 0.55 * steam });
    }
    if (frozen > 0) {
      ctx.save(); ctx.globalAlpha = frozen;
      for (let i = 0; i < 5; i++) G.poly(ctx, [[x - 46 + i * 22, y - 110], [x - 36 + i * 22, y - 110], [x - 41 + i * 22, y - 80 + (i % 2) * 12]], { fill: '#E9F7FF', seed: 255 + i, lw: 3 });
      G.ellipse(ctx, x, y - 112, 50, 14, { fill: '#E9F7FF', seed: 260, lw: 4 });
      ctx.restore();
    }
  }
  function plant(ctx, x, y, { wilt = 0 } = {}) {
    const leafC = wilt > 0.6 ? '#9C8456' : C.plant;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.42 + wilt * (i - 2) * 0.35;
      const droop = wilt * 90;
      const L = 120 - Math.abs(i - 2) * 14;
      const tip = [x + Math.cos(a) * L, y - 80 + Math.sin(a) * L + droop * (1 - Math.abs(Math.sin(a)) * 0.2)];
      G.shape(ctx, [[x, y - 80], [lerp(x, tip[0], 0.5) + 16, lerp(y - 80, tip[1], 0.5)], tip, [lerp(x, tip[0], 0.5) - 16, lerp(y - 80, tip[1], 0.5)]], { fill: leafC, seed: 270 + i, lw: 4 });
    }
    G.poly(ctx, [[x - 55, y - 90], [x + 55, y - 90], [x + 42, y], [x - 42, y]], { fill: C.pot, seed: 280, lw: 5 });
  }

  // ---------- Loomlock ----------
  // padlock icon (shackle closes as `shut` goes 0 -> 1)
  function padlock(ctx, x, y, s, shut = 1, { color = C.lock, dark = C.lockDark } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const lift = (1 - shut) * 46;
    ctx.lineCap = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(-42, -10); ctx.lineTo(-42, -60 - lift); ctx.arc(0, -60 - lift, 42, Math.PI, 0); ctx.lineTo(42, -10 - lift * 1.2); ctx.stroke();
    ctx.lineWidth = 12; ctx.strokeStyle = '#B8BCCB';
    ctx.beginPath(); ctx.moveTo(-42, -10); ctx.lineTo(-42, -60 - lift); ctx.arc(0, -60 - lift, 42, Math.PI, 0); ctx.lineTo(42, -10 - lift * 1.2); ctx.stroke();
    G.rrect(ctx, -70, -20, 140, 120, 22, { fill: color, seed: 300, lw: 7 });
    G.ellipse(ctx, 0, 30, 14, 14, { fill: dark, seed: 301, lw: 4 });
    G.rrect(ctx, -6, 34, 12, 34, 5, { fill: dark, seed: 302, lw: 3 });
    ctx.restore();
  }

  // end card: purple background, lock drops in and clicks shut at tClick, wordmark, tagline
  function endCard(ctx, t, t0, tClick, { tagline = 'Bloqueá distracciones. Recuperá tu foco.', W = G.W, H = G.H, circ = true } = {}) {
    const u = clamp((t - t0) / 0.35);
    if (u <= 0) return;
    // wipe up
    ctx.save();
    const top = H * (1 - ease.outCubic(u));
    ctx.fillStyle = C.lock; ctx.fillRect(0, top, W, H);
    if (u < 1) { ctx.restore(); return; }
    // rays
    G.rays(ctx, W / 2, 700, { n: 18, r0: 160, r1: 1400, color: 'rgba(255,255,255,0.08)', lw: 50, spin: (t - t0) * 0.15 });
    // lock falls in and clicks
    const fall = clamp((t - (tClick - 0.45)) / 0.45);
    const ly = lerp(-200, 700, ease.inQuad(fall));
    const shut = t >= tClick ? 1 : 0;
    const bounce = t >= tClick ? U.springKick(t, tClick, 4, 7) * 0.12 : 0;
    padlock(ctx, W / 2, ly, 2.2 * (1 + bounce), shut, { color: '#FFC94A', dark: '#B9822A' });
    if (t >= tClick) {
      const f = clamp((t - tClick) / 0.4);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const r0 = 260 + f * 120, r1 = r0 + 60 * (1 - f); G.line(ctx, [[W / 2 + Math.cos(a) * r0, 700 + Math.sin(a) * r0], [W / 2 + Math.cos(a) * r1, 700 + Math.sin(a) * r1]], { color: '#FFF4C9', lw: 10, seed: 310 + i, alpha: 1 - f }); }
      const w = clamp((t - tClick - 0.15) / 0.35);
      const sc = 0.6 + 0.4 * ease.outBack(w, 2.4);
      ctx.save(); ctx.translate(W / 2, 1070); ctx.scale(sc, sc); ctx.globalAlpha *= w;
      G.text(ctx, 'Loomlock', 0, 0, { size: 150, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0.3 });
      ctx.restore();
      const tg = clamp((t - tClick - 0.7) / 0.4);
      if (tg > 0) G.text(ctx, tagline, W / 2, 1180, { size: 50, fam: 'Patrick Hand', weight: 400, color: '#EDEBFF', align: 'center', alpha: tg });
      if (circ) {
        const c = clamp((t - tClick - 1.0) / 0.4);
        if (c > 0) {
          const hop = Math.abs(Math.sin((t - tClick) * 5)) * 30 * c;
          body(ctx, { x: W / 2, y: 1460 - hop, r: 95, eyes: 'happy', mouth: 'grin', blush: 0.7, feet: true });
        }
      }
    }
    ctx.restore();
  }

  globalThis.Circ = { C, INK, body, arms, buddy, room, clock, hhmm, skyAt, DESK_Y, deskTop, deskFront, chair, laptop, phone, mug, plant, padlock, endCard };
})();
