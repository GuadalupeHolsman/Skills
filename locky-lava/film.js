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
  // posed around its joint. Drawn mirrored, so the dark side panel is on screen-right (local -x = screen right). origin = between the feet. o: {x, y, s, rot, walk (phase) | null, eyes, burn 0..1,
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
  // ---- the 2.5D rig ----
  // The body is a box that turns on its vertical axis (o.turn, radians: 0 = facing the camera, + = turned toward
  // screen right, PI = back to the camera). Each frame the box corners are projected: the front and side faces
  // widen and narrow, the face slides across the front and foreshortens, the shackle goes edge-on, and the back
  // (with a keyhole) shows when he turns around. Arms and legs are the official vector parts, pinned to the
  // projected joints and drawn in front of or behind the body by depth. Units: the SVG's, origin between the feet.
  // eyes have no pupils: they act through shape and position only.
  // eyes: 'normal' | 'phone' (slid toward the phone) | 'wide' | 'closed' | 'happy' | 'sad' | 'spiral' (dizzy squiggles)
  const BOX = { W: 430, D: 300, top: -541, bot: -122 };
  const SHOULDER = -297, HIP = -169;
  function limb(ctx, k, fill, ax, ay, ang, sx = -1) { // an official arm/leg path, its joint pinned at (ax, ay); sx flips it
    const [jx, jy] = JOINT[k];
    ctx.save(); ctx.translate(ax, ay); ctx.scale(sx, 1); ctx.rotate(ang); ctx.translate(-jx, -jy);
    const p = pth(k); ctx.fillStyle = fill; ctx.fill(p);
    ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(p);
    ctx.restore();
  }
  function quadPath(ctx, q, r) { // a quad with rounded corners
    ctx.beginPath();
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.moveTo(...m(q[3], q[0]));
    for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; ctx.arcTo(a[0], a[1], b[0], b[1], r); }
    ctx.closePath();
  }
  function phoneProp(ctx, x, y, rot, t, notify) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.roundRect(-40, -96, 80, 192, 18); ctx.fillStyle = '#1C1C26'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-28, -80, 34, 160, 8); ctx.fillStyle = '#F37BC0'; ctx.fill();
    ctx.restore();
    if (!notify) return;
    // notifications popping off the screen: hearts and chat bubbles, rising and fading
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.1 + i / 3) % 1), k = ease.outBack(clamp(ph / 0.15), 2);
      ctx.save(); ctx.globalAlpha = clamp((1 - ph) * 1.6); ctx.translate(x + 30 + (i - 1) * 46 + Math.sin(ph * 6 + i) * 12, y - 120 - ph * 220); ctx.scale(k, k);
      if (i % 2 === 0) { // heart
        ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-34, -6, -18, -34, 0, -16); ctx.bezierCurveTo(18, -34, 34, -6, 0, 18);
        ctx.fillStyle = '#FF4F7A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke();
      } else { // chat bubble with dots
        ctx.beginPath(); ctx.roundRect(-34, -24, 68, 44, 16); ctx.moveTo(-12, 20); ctx.lineTo(-22, 34); ctx.lineTo(2, 20);
        ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke();
        for (let d = -1; d <= 1; d++) oval(ctx, d * 15, -2, 5, 5, OUT, 0);
      }
      ctx.restore();
    }
  }
  function locky(ctx, o) {
    const s = (o.s || 1) * 0.3, burn = o.burn || 0;
    const t = G.t;
    const ph = o.walk;
    const walking = ph != null;
    const dir = o.dir || 1;
    const th = o.turn == null ? 0.3 : o.turn, c = Math.cos(th), sn = Math.sin(th);
    // walk cycle: a lean into the step (and toward the phone), contact squash, a rise on the passing pose
    const swing = walking ? Math.sin(ph) * 0.36 * (o.stride || 1) : 0;
    const liftL = walking ? Math.max(0, Math.cos(ph)) * 34 : 0, liftR = walking ? Math.max(0, -Math.cos(ph)) * 34 : 0;
    const bob = walking ? -Math.abs(Math.cos(ph)) * 22 * (o.bounce || 1) : 0;
    const lean = (walking ? 0.07 + Math.sin(2 * ph) * 0.025 : 0) * dir + (o.hunch || 0);
    const stepSq = walking ? 0.06 * Math.max(0, -Math.cos(2 * ph)) : 0;
    const breathe = walking ? 0 : 0.025 * Math.sin(t * 3.1); // a moving hold: never fully still
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate((o.rot || 0) + lean);
    const sq = (o.squash || 0) + stepSq + breathe; ctx.scale(s * (1 + sq * 0.25), s * (1 - sq * 0.3));
    const b = (col, k) => (burn > 0 ? mix(col, k[0], burn * k[1]) : col);
    const blue = b('#3F49CC', ['#2E2A2C', 0.85]), sky = b('#9FD8FF', ['#55504E', 0.8]);
    const lav = b('#878EE5', ['#4A4458', 0.6]), glove = b('#FFFFFF', ['#8A8488', 0.6]);
    const side = b('#1E2366', ['#151214', 0.85]); // the dark side panel, navy so it reads as volume when he turns
    // projection of the box
    const P = (x, z) => [x * c + z * sn, -x * sn + z * c]; // -> [screen x, depth toward camera]
    const yC = (BOX.top + BOX.bot) / 2, hH = (BOX.bot - BOX.top) / 2;
    const hk = (Z) => 1 + 0.12 * Z / (BOX.D / 2);
    const W2 = BOX.W / 2, D2 = BOX.D / 2;
    const corner = { FL: P(-W2, D2), FR: P(W2, D2), BR: P(W2, -D2), BL: P(-W2, -D2) };
    const faceQuad = (a, b2) => [[a[0], yC - hH * hk(a[1])], [b2[0], yC - hH * hk(b2[1])], [b2[0], yC + hH * hk(b2[1])], [a[0], yC + hH * hk(a[1])]];
    // arm poses (angles at the shoulders; + = toward screen right)
    const arms = o.arms || 'down';
    const wave = Math.sin(t * 14);
    const type = o.typing ? 0.06 * Math.sin(t * 38) : 0; // a thumb tapping away
    const [aL, aR] = {
      down: [swing * 0.7 * (o.armSwing || 1), -swing * 0.7 * (o.armSwing || 1)],
      phone: [1.95 + type + (walking ? Math.sin(2 * ph) * 0.05 : 0), -swing * 0.5 - 0.5],
      sad: [-0.55 + 0.04 * Math.sin(t * 2.2), 0.55 - 0.04 * Math.sin(t * 2.2)],
      up: [2.75, -2.75],
      cheer: [2.25 + 0.22 * wave, -2.25 - 0.22 * Math.sin(t * 14 + 0.9)],
      flail: [2.0 + 0.6 * Math.sin(t * 34), -2.0 - 0.6 * Math.sin(t * 34 + 1.9)],
      reach: [2.6, -2.2],
      phoneUp: [2.95 + 0.08 * Math.sin(t * 9), -2.0 - 0.6 * Math.sin(t * 34 + 1.9)], // saving the phone from the lava
    }[arms];
    // joints, projected
    const [rX, rZ] = P(W2 - 14, 0), [lX, lZ] = P(-(W2 - 14), 0);
    const [hRX] = P(70, -40), [hLX] = P(-70, -40);
    // legs (always behind the body). The feet point the way he faces; the stride goes the way he walks.
    const fx = sn > 0.05 ? 1 : sn < -0.05 ? -1 : dir; // the SVG's feet point right when drawn unflipped
    const legA = (a) => -dir * fx * a;
    limb(ctx, 'legL', lav, hRX, HIP - liftL, legA(swing), fx);
    limb(ctx, 'legR', lav, hLX, HIP - liftR, legA(-swing), fx);
    ctx.save(); ctx.translate(0, bob);
    // the phone in the right hand
    const holding = o.phone && (arms === 'phone' || arms === 'phoneUp');
    const ca = Math.cos(aL), sa = Math.sin(aL);
    const handX = rX - (-21.5 * ca - 155 * sa), handY = SHOULDER + (-21.5 * sa + 155 * ca);
    const drawRight = () => {
      if (holding) phoneProp(ctx, handX + 16, handY - 54 + (walking ? Math.sin(2 * ph) * 6 : 0) + (o.typing ? Math.sin(t * 38) * 3 : 0), -0.1 + (arms === 'phoneUp' ? 0.15 * Math.sin(t * 9) : 0), t, o.notify);
      limb(ctx, 'armL', glove, rX, SHOULDER, aL);
    };
    const drawLeft = () => limb(ctx, 'armR', glove, lX, SHOULDER, aR);
    if (rZ < 0) drawRight();
    if (lZ < 0) drawLeft();
    // the shackle: a flat arch on top, edge-on when he is in profile; pops open when he's shocked
    const op = o.open || 0;
    const lag = walking ? 0.05 * Math.sin(2 * ph - 1.2) : 0;
    ctx.save(); ctx.translate(0, -op * 80 + (o.shY || 0)); ctx.scale(Math.max(0.16, Math.abs(c)), 1); ctx.translate(-498, -877);
    const [jx, jy] = JOINT.shackle; ctx.translate(jx, jy); ctx.rotate(-op * 0.55 + lag + (o.shLag || 0)); ctx.translate(-jx, -jy);
    ctx.fillStyle = sky; ctx.fill(pth('shackle')); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.stroke(pth('shackle'));
    ctx.restore();
    // the faces of the box
    const faces = [];
    if (c > 0.01) faces.push([faceQuad(corner.FL, corner.FR), blue, 'front']);
    if (c < -0.01) faces.push([faceQuad(corner.BR, corner.BL), blue, 'back']);
    if (sn < -0.01) faces.push([faceQuad(corner.FR, corner.BR), side, 'side']);
    if (sn > 0.01) faces.push([faceQuad(corner.BL, corner.FL), side, 'side']);
    for (const [q, fill] of faces) { quadPath(ctx, q, 28); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.stroke(); }
    const main = faces.find((f) => f[2] !== 'side');
    if (burn > 0.2 && main) { // soot smudges on the big face
      ctx.save(); quadPath(ctx, main[0], 28); ctx.clip();
      const x0 = main[0][0][0], x1 = main[0][1][0];
      for (let i = 0; i < 9; i++) { ctx.globalAlpha = burn * 0.6; oval(ctx, lerp(x0, x1, G.rnd(i, 21)), BOX.top + 30 + G.rnd(i, 22) * 360, (22 + G.rnd(i, 23) * 40) * Math.abs(c), 16 + G.rnd(i, 24) * 24, '#141012', 0); }
      ctx.restore();
    }
    // the light of the screen on his face
    if (o.eyes === 'phone' && main && main[2] === 'front') {
      ctx.save(); quadPath(ctx, main[0], 28); ctx.clip();
      const gx = main[0][1][0], g2 = ctx.createRadialGradient(gx, yC - 40, 10, gx, yC - 40, 260);
      g2.addColorStop(0, 'rgba(255,170,225,0.45)'); g2.addColorStop(1, 'rgba(255,170,225,0)');
      ctx.fillStyle = g2; ctx.fillRect(gx - 300, yC - 340, 600, 600); ctx.restore();
    }
    if (c < -0.12) { // the back: a keyhole
      ctx.save(); ctx.translate(-D2 * sn, yC - 20); ctx.scale(-c, 1);
      ctx.beginPath(); ctx.arc(0, -30, 34, 0, Math.PI * 2); ctx.moveTo(-16, -10); ctx.lineTo(-26, 70); ctx.lineTo(26, 70); ctx.lineTo(16, -10); ctx.closePath();
      ctx.fillStyle = '#1A1C40'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke(); ctx.restore();
    }
    // the face, painted on the front and turned with it (an affine map from the SVG's face coordinates)
    if (c > 0.12) {
      ctx.save(); ctx.translate(D2 * sn, yC); ctx.scale(c, hk(D2 * c)); ctx.translate(-546, -(877 + yC));
      let eyes = o.eyes || 'normal';
      const blink = ((t + (o.blinkOff || 0)) % 2.6) < 0.1;
      if (blink && (eyes === 'normal' || eyes === 'phone')) eyes = 'closed';
      const look = (o.eyes === 'phone') ? [26, -2] : [(o.lookX || 0) * 1.6, (o.lookY || 0) * 1.6];
      for (const [ex0, ey0] of EYES) {
        const ex = ex0 + look[0], ey = ey0 + look[1], left = ex0 < FACE[0];
        if (eyes === 'closed') { stroke(ctx, [[ex - 34, ey - 2], [ex, ey + 14], [ex + 34, ey - 2]], 8); continue; }
        if (eyes === 'happy') { stroke(ctx, [[ex - 34, ey + 12], [ex, ey - 30], [ex + 34, ey + 12]], 8); continue; }
        if (eyes === 'spiral') {
          ctx.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; ctx[i ? 'lineTo' : 'moveTo'](ex - 36 + 72 * u, ey + Math.sin(u * Math.PI * 3 + t * 18 * (left ? 1 : -1)) * 12); }
          ctx.lineWidth = 8; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(); continue;
        }
        const pop = o.eyeK || 1;
        const kx = (eyes === 'wide' ? 1.18 : 1) * pop, ky = (eyes === 'wide' ? 1.42 : eyes === 'phone' ? 0.82 : 1) * pop;
        ctx.save(); ctx.translate(ex, ey); ctx.scale(kx, ky);
        const e = pth('eye'); ctx.fillStyle = '#FFFFFF'; ctx.fill(e); ctx.lineWidth = 6 / Math.max(kx, ky); ctx.strokeStyle = OUT; ctx.stroke(e);
        ctx.restore();
        if (eyes === 'sad') {
          ctx.beginPath(); ctx.moveTo(ex - 50, ey - 50); ctx.lineTo(ex + 50, ey - 50);
          ctx.lineTo(ex + 50, ey + (left ? -18 : 4)); ctx.lineTo(ex - 50, ey + (left ? 4 : -18)); ctx.closePath(); // low on the outside: sad, not cross
          ctx.fillStyle = blue; ctx.fill();
          stroke(ctx, [[ex - 40, ey + (left ? 2 : -16)], [ex + 40, ey + (left ? -16 : 2)]], 6);
        }
      }
      const [mx, my] = [FACE[0] + look[0] * 0.6, FACE[1] + look[1] * 0.6];
      const mouth = o.mouth || 'smile';
      if (mouth === 'scream') {
        const open = 1 + 0.12 * Math.sin(t * 30);
        oval(ctx, mx, my + 34, 32, 40 * open, '#5A1E2E');
        oval(ctx, mx, my + 56 * open, 18, 11, '#F27BA0', 0);
      } else if (mouth === 'sad') {
        stroke(ctx, [[mx - 26, my + 26], [mx, my + 4], [mx + 26, my + 26]], 6);
      } else if (mouth === 'laugh') {
        ctx.beginPath(); ctx.moveTo(mx - 34, my); ctx.quadraticCurveTo(mx, my + 70, mx + 34, my); ctx.closePath();
        ctx.fillStyle = '#5A1E2E'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
        oval(ctx, mx, my + 26, 14, 8, '#F27BA0', 0);
      } else if (mouth === 'o') {
        oval(ctx, mx, my + 20, 14, 18, '#5A1E2E');
      } else {
        ctx.save(); ctx.translate(look[0] * 0.6, look[1] * 0.6);
        ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(pth('smile'));
        ctx.restore();
      }
      if (o.tears) for (const [ex0, ey0] of EYES) for (let k = 0; k < 2; k++) {
        const tp = ((t * 1.6 + k * 0.5 + (ex0 < FACE[0] ? 0.25 : 0)) % 1);
        ctx.save(); ctx.globalAlpha = 1 - tp;
        const tx = ex0 + look[0] + (ex0 < FACE[0] ? -10 : 10), ty = ey0 + 40 + tp * 140;
        ctx.beginPath(); ctx.moveTo(tx, ty - 22); ctx.quadraticCurveTo(tx + 14, ty, tx, ty + 10); ctx.quadraticCurveTo(tx - 14, ty, tx, ty - 22);
        ctx.fillStyle = '#BFE8FF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.restore();
      }
      if (o.blush) { ctx.save(); ctx.globalAlpha = 0.5; oval(ctx, 395, 566, 30, 16, '#F27BA0', 0); oval(ctx, 698, 566, 30, 16, '#F27BA0', 0); ctx.restore(); }
      ctx.restore();
    }
    if (rZ >= 0) drawRight();
    if (lZ >= 0) drawLeft();
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
  // damped spring: a value that kicks to `amp` at a0 and rings down (landings, pops)
  const ring = (a, amp, f = 26, d = 9) => (a < 0 ? 0 : amp * Math.exp(-a * d) * Math.cos(a * f));
  // walks off the edge still reading the phone, hangs in the air for a beat, realises, then drops (stretching)
  // the take: walks off the edge reading the phone, floats, looks down, eyes POP, then drops, phone held high
  function fall(t, off, splash, x0, w0) {
    const u = clamp((t - off) / (splash - off));
    if (u < 0.25) { const k = u / 0.25; return { x: lerp(x0, x0 + 110, k), y: FLOOR, walk: walkPhase(t, w0), eyes: 'phone', phone: true, arms: 'phone', turn: 0.55, typing: true, notify: true, hunch: 0.06 }; }
    if (u < 0.72) {
      const k = (u - 0.25) / 0.47, a = (u - 0.25) * (splash - off);
      if (k < 0.45) return { x: x0 + 110, y: FLOOR - 4 * Math.sin(Math.PI * k), eyes: 'normal', lookY: 12, mouth: 'smile', phone: true, arms: 'phone', turn: 0.55, hunch: 0.04 };
      const a2 = a - 0.45 * 0.47 * (splash - off);
      return { x: x0 + 110, y: FLOOR - 6, eyes: 'wide', eyeK: 1 + ring(a2, 0.35, 40, 12), mouth: 'o', phone: true, arms: 'phone', open: clamp(a2 / 0.05), squash: -0.12, shY: -40 * clamp(a2 / 0.05), turn: 0.55 * (1 - ease.outBack(clamp(a2 / 0.07), 2)) }; // snaps round to the camera
    }
    const k = (u - 0.72) / 0.28;
    return { x: x0 + 110 + 2 * k, y: lerp(FLOOR - 6, LAVA + 10, ease.inQuad(k)), eyes: 'wide', mouth: 'scream', arms: 'phoneUp', phone: true, open: 1, squash: -0.42 * k, rot: 0.08 * k, turn: 0 };
  }
  function sunk(t, splash, depth = SUNK) {
    const a = t - splash, k = ease.outCubic(clamp(a / 0.18));
    return { x: EDGE + 100 + Math.sin(a * 60) * 6 * clamp(1 - a), y: lerp(LAVA + 10, depth, k) + Math.sin(a * 22) * 6, eyes: 'wide', arms: 'phoneUp', open: 1, phone: true, mouth: 'scream', squash: ring(a, 0.5, 30, 10), turn: 0.18 * Math.sin(a * 9) };
  }
  function arc(t, t0, t1, p0, p1, peak) {
    const u = clamp((t - t0) / (t1 - t0));
    const y = lerp(p0[1], p1[1], u) - 4 * (peak) * u * (1 - u);
    return { x: lerp(p0[0], p1[0], u), y, u };
  }
  // landing: squash hard, ring back, dizzy wobble
  const landSq = (a) => ring(a, 0.75, 14, 10); // biggest on the hit frame, then a soft rebound
  function burnAt(t) { return t < ev.launch1 ? 0 : t < ev.launch2 ? 0.25 : t < ev.crawl ? 0.42 : 0.6; }
  function state(t) {
    const burn = burnAt(t);
    const base = { burn, eyes: 'normal', arms: 'down', phone: false, walk: null, open: 0, rot: 0 };
    // the distracted walk: head down in the phone, thumb going, notifications popping; on the first two tries he
    // stops dead halfway to type and laugh at something, then shuffles on
    const walkTo = (t0, t1, x0, x1, stops = true) => {
      const f = clamp((t - t0) / (t1 - t0)), P0 = 0.38, P1 = 0.64;
      const g = !stops ? f : f < P0 ? (f / P0) * 0.45 : f < P1 ? 0.45 : 0.45 + ((f - P1) / (1 - P1)) * 0.55;
      const d = { x: lerp(x0, x1, g), y: FLOOR, eyes: 'phone', mouth: 'smile', arms: 'phone', phone: true, typing: true, notify: true, turn: 0.55, hunch: 0.07 };
      if (stops && f >= P0 && f < P1) {
        const k = (f - P0) / (P1 - P0), lol = k > 0.45;
        return { ...d, walk: null, turn: 0.55 - 0.3 * ease.inOutQuad(clamp(k / 0.3)), eyes: lol ? 'happy' : 'phone', mouth: lol ? 'laugh' : 'smile', typing: !lol, squash: lol ? 0.07 * Math.sin(t * 40) : 0, hunch: lol ? -0.04 : 0.09 };
      }
      return { ...d, walk: walkPhase(t, stops && f >= P1 ? t0 + P1 * (t1 - t0) : t0), stride: 0.8 };
    };
    // try 1
    if (t < ev.off1) return { ...base, ...walkTo(0, ev.off1, -110, EDGE - 10) };
    if (t < ev.splash1) return { ...base, ...fall(t, ev.off1, ev.splash1, EDGE - 10, 0) };
    if (t < ev.launch1) return { ...base, ...sunk(t, ev.splash1) };
    if (t < ev.land1) { // shot out: stretched along the launch, spinning
      const a = arc(t, ev.launch1, ev.land1, [EDGE + 100, SUNK], [170, FLOOR], 520);
      return { ...base, x: a.x, y: a.y, rot: -0.35 * Math.sin(Math.PI * a.u), turn: Math.PI * 4 * ease.inOutQuad(a.u), eyes: 'wide', arms: 'phoneUp', phone: true, mouth: 'scream', open: 1, squash: -0.4 * (1 - a.u) * (1 - a.u), air: true };
    }
    if (t < ev.walk2) {
      // lands, checks the phone is fine, sighs with relief, carries on
      const a = t - ev.land1, shock = a < 0.35, relief = !shock && a < BEAT * 2.2;
      return { ...base, x: 170, y: FLOOR, squash: landSq(a), rot: shock ? 0.06 * Math.sin(a * 14) * Math.exp(-a * 3) : 0, eyes: shock ? 'wide' : relief ? 'happy' : 'phone', mouth: shock ? 'o' : 'smile', arms: 'phone', phone: true, open: clamp(1 - a / 0.4), shLag: ring(a, 0.25, 20, 6), shY: ring(a, 40, 22, 8), turn: 0.55 * ease.inOutQuad(clamp((a - 0.35) / 0.3)), typing: !shock && !relief, notify: !shock };
    }
    // try 2
    if (t < ev.off2) return { ...base, ...walkTo(ev.walk2, ev.off2, 170, EDGE - 10) };
    if (t < ev.splash2) return { ...base, ...fall(t, ev.off2, ev.splash2, EDGE - 10, ev.walk2) };
    if (t < ev.launch2) return { ...base, ...sunk(t, ev.splash2) };
    if (t < ev.land2) {
      if (t < ev.peak2) { const u = ease.outQuad(clamp((t - ev.launch2) / (ev.peak2 - ev.launch2))); return { ...base, x: lerp(EDGE + 100, 260, u), y: lerp(SUNK, -500, u), rot: u * 4, turn: Math.PI * 2 * u, eyes: 'spiral', arms: 'phoneUp', phone: true, mouth: 'scream', open: 1, squash: -0.45 * (1 - u), air: true }; }
      const u = ease.inQuad(clamp((t - ev.peak2) / (ev.land2 - ev.peak2))); return { ...base, x: lerp(260, 160, u), y: lerp(-500, FLOOR, u), rot: 4 + u * 2.283, turn: Math.PI * 2 * (1 + u), eyes: 'spiral', arms: 'phoneUp', phone: true, mouth: 'scream', open: 1, squash: -0.35 * u, air: true };
    }
    if (t < ev.walk3) {
      const a = t - ev.land2;
      return { ...base, x: 160, y: FLOOR, squash: landSq(a), rot: 0.12 * Math.sin(a * 9) * Math.exp(-a * 1.2), eyes: a < BEAT * 2.5 ? 'spiral' : 'phone', mouth: 'sad', arms: 'phone', phone: true, open: clamp(1 - a / 0.5), shLag: ring(a, 0.3, 18, 5), shY: ring(a, 50, 22, 8), turn: a < BEAT * 2.5 ? 0.7 * Math.sin(a * 6) * Math.exp(-a * 0.6) : 0.55, typing: a >= BEAT * 2.5, notify: a >= BEAT * 2.5 };
    }
    // try 3: he does it again, of course
    if (t < ev.off3) return { ...base, ...walkTo(ev.walk3, ev.off3, 160, EDGE - 10, false) };
    if (t < ev.splash3) return { ...base, ...fall(t, ev.off3, ev.splash3, EDGE - 10, ev.walk3) };
    if (t < ev.crawl) { const st = sunk(t, ev.splash3, LAVA + 150); return { ...base, ...st, arms: t > ev.scratch ? 'sad' : 'phoneUp', phone: t <= ev.scratch, mouth: t > ev.scratch ? 'sad' : 'scream', eyes: t > ev.scratch ? 'sad' : 'wide', tears: t > ev.scratch }; }
    if (t < ev.sit) { // drags himself out, heavy and slow
      const u = ease.inOutQuad(clamp((t - ev.crawl) / (ev.sit - ev.crawl)));
      return { ...base, x: lerp(EDGE + 100, 150, u), y: lerp(LAVA + 150, FLOOR, ease.outQuad(u)), walk: walkPhase(t, ev.crawl) * 0.5, bounce: 0.4, eyes: 'sad', mouth: 'sad', arms: 'sad', rot: -0.15 * (1 - u), tears: true, turn: lerp(-0.9, -0.45, u), dir: -1 };
    }
    // the sad beat, then the idea: a squash of anticipation and a pop
    if (t < ev.grow) {
      const a = t - ev.idea;
      if (t < ev.idea) {
        const pre = clamp((t - (ev.idea - 0.14)) / 0.14); // anticipation right before the pop
        const sob = Math.sin(t * 1.9) > 0.2 ? 0.07 * Math.max(0, Math.sin(t * 17)) : 0; // sobs in little bursts
        return { ...base, x: 150, y: FLOOR, eyes: pre > 0 ? 'closed' : 'sad', mouth: 'sad', arms: 'sad', squash: sob + 0.3 * pre, rot: -0.05 + 0.02 * Math.sin(t * 1.3), tears: pre === 0, turn: -0.45 };
      }
      return { ...base, x: 150, y: FLOOR - Math.max(0, Math.sin(Math.PI * clamp(a / 0.3))) * 40, eyes: 'wide', mouth: 'smile', arms: 'phone', phone: true, open: clamp(1 - a / 0.3) * 0.6, squash: a < 0.3 ? -0.3 * (1 - a / 0.3) : ring(a - 0.3, 0.2, 26, 9), turn: ring(a, -0.45, 30, 12) + 0.2 * ease.inOutQuad(clamp((a - 0.3) / 0.5)) }; // whips round to us
    }
    if (t < ev.cross) {
      const a = t - ev.bridge;
      return { ...base, x: 110, y: FLOOR - (a > 0.25 ? Math.max(0, Math.sin(Math.PI * clamp((a - 0.25) / 0.35))) * 40 : 0), eyes: t < ev.bridge ? 'wide' : 'happy', arms: t < ev.bridge ? 'reach' : 'cheer', mouth: 'smile', turn: 0.2, squash: t < ev.bridge ? 0 : a < 0.25 ? 0.3 * Math.exp(-a * 12) : ring(a - 0.25, -0.25, 14, 8) };
    }
    // crossing on the phone, eyes up, a happy bouncy walk
    if (t < ev.win) {
      const u = clamp((t - ev.cross) / (ev.win - ev.cross)), x = lerp(110, 860, u);
      const onBridge = clamp((x - 270) / 50) * clamp((GEO.BRIDGE_END + 30 - x) / 50);
      return { ...base, x, y: lerp(FLOOR, GEO.BRIDGE_TOP, onBridge), walk: walkPhase(t, ev.cross), bounce: 1.5, armSwing: 1.8, eyes: 'normal', lookX: 8, mouth: 'smile', arms: 'down', turn: 0.5 };
    }
    // the celebration: each hop = anticipation squash, stretch on the way up and down, squash on landing
    const hopK = S.celebrate.filter((c) => c <= t).pop(), u = (t - hopK) / BEAT;
    const air = clamp(u / 0.75);
    const hop = u < 0.75 ? Math.sin(Math.PI * air) * 110 : 0;
    const sqH = u < 0.75 ? -0.28 * Math.abs(Math.cos(Math.PI * air)) : 0.35 * Math.sin(Math.PI * clamp((u - 0.75) / 0.25));
    return { ...base, x: 860, y: FLOOR - hop, eyes: 'happy', arms: 'cheer', mouth: 'smile', blush: true, open: hop > 60 ? 0.4 : 0, squash: sqH, turn: S.celebrate.indexOf(hopK) === 2 ? Math.PI * 2 * ease.inOutQuad(air) : 0.15 * Math.sin(Math.PI * air) * (S.celebrate.indexOf(hopK) % 2 ? 1 : -1), rot: 0.06 * Math.sin(Math.PI * air) * (S.celebrate.indexOf(hopK) % 2 ? 1 : -1), mouth: hop > 50 ? 'laugh' : 'smile' };
  }

  // ---------- the set: a lava corridor seen from above, receding to a vanishing point ----------
  // Locky acts on one row (y = FLOOR); everything else is projected from that row. xa = x on the action row.
  const VP = [600, 880], FAR = 1000;
  const dep = (y) => (y - VP[1]) / (FLOOR - VP[1]);           // 1 on the action row, 0 at the vanishing point
  const px = (xa, y) => VP[0] + (xa - VP[0]) * dep(y);
  const LWALL = -250, RWALL = 1050, BOT = 1960;
  const edge = (xa, y0, y1, drop = 0) => [[px(xa, y0), y0 + drop * dep(y0)], [px(xa, y1), y1 + drop * dep(y1)]];
  // the look: a pale grey room drawn in thin black ink, lit only by the lava
  const WALL = '#C9C6CA', FLOORC = '#D9D7DA', CURB = '#B8B5B9';
  const ink = (ctx, pts, lw = 3.5, seed = 1, color = INK) => G.line(ctx, pts, { color, lw, seed, amp: 0.9 });
  function wallQuad(xa, y0, y1, h0, h1) { // a rectangle standing on a side wall, from depth y0 to y1, heights in action-row px
    return [[px(xa, y0), y0], [px(xa, y1), y1], [px(xa, y1), y1 - h1 * dep(y1)], [px(xa, y0), y0 - h0 * dep(y0)]];
  }
  function door(ctx, t, xa, y0, y1, h, seed, openK = 0) {
    const q = wallQuad(xa, y0, y1, h, h);
    // the opening (dark until it opens onto daylight)
    G.poly(ctx, q, { fill: openK > 0 ? mix('#8E8A90', '#FFF4D6', openK) : '#EDEBEE', lw: 4, seed, step: 30 });
    // arched top: a half-moon window above the frame
    const mx = (q[2][0] + q[3][0]) / 2, my = (q[2][1] + q[3][1]) / 2, rw = Math.abs(q[2][0] - q[3][0]) / 2;
    ctx.save(); ctx.translate(mx, my); ctx.transform(1, (q[2][1] - q[3][1]) / (q[2][0] - q[3][0] || 1), 0, 1, 0, 0);
    ctx.beginPath(); ctx.ellipse(0, 0, rw + 8, rw * 0.9, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#F2F0F3'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -6, rw * 0.62, rw * 0.5, 0, Math.PI, 0); ctx.closePath(); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    // the leaf: planks, a handle; swings into the room when it opens
    const sw = ease.outBack(clamp(openK), 1.4);
    const hinge = q[0], far = q[3];
    const lx = lerp(q[1][0], hinge[0] - (q[1][0] - hinge[0]) * 0.55, sw), ly = lerp(q[1][1], hinge[1] + 40, sw);
    const leaf = [hinge, [lx, ly], [lx, ly - (q[1][1] - q[2][1]) * lerp(1, 1.12, sw)], far];
    G.poly(ctx, leaf, { fill: '#F4F2F5', lw: 4, seed: seed + 1, step: 30 });
    for (let k = 1; k < 4; k++) ink(ctx, [[lerp(leaf[0][0], leaf[1][0], k / 4), lerp(leaf[0][1], leaf[1][1], k / 4)], [lerp(leaf[3][0], leaf[2][0], k / 4), lerp(leaf[3][1], leaf[2][1], k / 4)]], 2, seed + 2 + k);
    const hx = lerp(leaf[0][0], leaf[1][0], 0.85), hy = lerp(lerp(leaf[0][1], leaf[1][1], 0.85), lerp(leaf[3][1], leaf[2][1], 0.85), 0.5);
    G.rrect(ctx, hx - 5, hy - 22, 10, 44, 5, { fill: '#F4F2F5', lw: 3, seed: seed + 9 });
  }
  function box(ctx, x, y, w, h, d, seed) { // a cardboard box, line art, seen from the front-left and above
    const top = [[x, y - h], [x + w, y - h], [x + w + d * 0.6, y - h - d * 0.45], [x + d * 0.6, y - h - d * 0.45]];
    const side = [[x + w, y], [x + w + d * 0.6, y - d * 0.45], [x + w + d * 0.6, y - h - d * 0.45], [x + w, y - h]];
    G.poly(ctx, [[x, y], [x + w, y], [x + w, y - h], [x, y - h]], { fill: '#E4E1E4', lw: 3, seed, step: 30 });
    G.poly(ctx, side, { fill: '#CFCBCF', lw: 3, seed: seed + 1, step: 30 });
    G.poly(ctx, top, { fill: '#EFECEF', lw: 3, seed: seed + 2, step: 30 });
    ink(ctx, [[x + w * 0.5, y - h], [x + w * 0.5 + d * 0.3, y - h - d * 0.45]], 2, seed + 3);
    G.rrect(ctx, x + w * 0.45, y - h, w * 0.1, h * 0.3, 2, { fill: '#D8D4D8', lw: 2, seed: seed + 4 });
    G.rrect(ctx, x + w * 0.62, y - h * 0.32, w * 0.24, h * 0.16, 2, { fill: null, lw: 2, seed: seed + 5 });
  }
  function cave(ctx, t) {
    // walls and far wall: soft pale grey, slightly darker up high
    const g = ctx.createLinearGradient(0, -800, 0, FAR);
    g.addColorStop(0, '#AFACB0'); g.addColorStop(1, WALL);
    ctx.fillStyle = g; ctx.fillRect(-400, -1200, W + 800, H + 2400);
    // side walls, a touch darker than the far wall, with a skirting line along the floor
    for (const [xa, seed, shade] of [[LWALL, 110, '#BDBABE'], [RWALL, 120, '#C2BFC3']]) {
      G.poly(ctx, [[px(xa, FAR), FAR], [px(xa, FAR), -1400], [px(xa, BOT), -1400], [px(xa, BOT), BOT]], { fill: shade, lw: 0, seed, step: 60 });
      ink(ctx, [[px(xa, FAR), FAR], [px(xa, FAR), -1400]], 3, seed + 1);
      ink(ctx, [[px(xa, FAR), FAR - 30 * dep(FAR)], [px(xa, BOT), BOT - 30 * dep(BOT)]], 2.5, seed + 2);
      ink(ctx, [[px(xa, FAR), FAR], [px(xa, BOT), BOT]], 3.5, seed + 3);
    }
    // the far wall's glow from the lava
    ctx.save(); const gl = ctx.createRadialGradient(px(560, FAR), FAR, 10, px(560, FAR), FAR, 360);
    gl.addColorStop(0, 'rgba(255,140,40,0.35)'); gl.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = gl; ctx.fillRect(-400, FAR - 400, W + 800, 500); ctx.restore();
    // a door on the left wall (where he came from) and the exit on the right, which opens when he makes it
    door(ctx, t, LWALL, 1004, 1040, 520, 300);
    door(ctx, t, RWALL, 1060, 1150, 470, 190, clamp((t - ev.win - 0.1) / 0.5));
  }
  function lava(ctx, t) {
    const drop = LAVA - FLOOR;
    const L = edge(EDGE, FAR, BOT, drop), R = edge(GEO.RIGHT, FAR, BOT, drop);
    const quad = [L[0], R[0], R[1], L[1]];
    const g = ctx.createLinearGradient(0, FAR, 0, BOT); g.addColorStop(0, '#FF8A1C'); g.addColorStop(0.4, '#FF6A0C'); g.addColorStop(1, '#F85A08');
    ctx.save(); ctx.beginPath(); ctx.moveTo(...quad[0]); for (const q of quad.slice(1)) ctx.lineTo(...q); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.clip();
    // soft molten blobs: blurred, drifting toward the camera, scaled by depth
    ctx.filter = 'blur(10px)';
    for (let i = 0; i < 34; i++) {
      const y = FAR + ((G.rnd(i, 2) * 960 + t * (10 + (i % 5) * 4)) % 960), d = dep(y);
      const x = px(lerp(EDGE - 40, GEO.RIGHT + 40, G.rnd(i, 1)), y) + Math.sin(t * 0.8 + i) * 12 * d;
      ctx.globalAlpha = i % 4 ? 0.55 : 0.4; ctx.fillStyle = i % 4 ? '#FFA82A' : '#E9480A';
      ctx.beginPath(); ctx.ellipse(x, y + drop * d, (50 + G.rnd(i, 3) * 60) * d, (16 + G.rnd(i, 4) * 16) * d, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.filter = 'none'; ctx.globalAlpha = 1;
    // glints
    for (let i = 0; i < 10; i++) { const y = FAR + 40 + G.rnd(i, 12) * 800, d = dep(y), x = px(lerp(EDGE, GEO.RIGHT, G.rnd(i, 11)), y); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4 + i); oval(ctx, x, y + drop * d, 4 * d, 2.5 * d, '#FFF2C0', 0); }
    ctx.restore();
    ink(ctx, [L[0], L[1]], 4, 205); ink(ctx, [R[0], R[1]], 4, 206);
    // glossy dome bubbles that swell and pop, leaving a ring
    for (let i = 0; i < 7; i++) {
      const per = 1.6 + G.rnd(i, 5) * 1.2, ph = ((t + G.rnd(i, 6) * per) % per) / per;
      const y = FAR + 120 + G.rnd(i, 8) * 640, d = dep(y), x = px(lerp(EDGE + 40, GEO.RIGHT - 40, G.rnd(i, 7)), y), yy = y + drop * d;
      if (ph < 0.8) {
        const r = (8 + 26 * ease.outQuad(ph / 0.8)) * d;
        ctx.beginPath(); ctx.ellipse(x, yy, r, r * 0.85, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#FFC21E'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(160,60,0,0.6)'; ctx.stroke();
        oval(ctx, x - r * 0.35, yy - r * 0.5, r * 0.22, r * 0.14, '#FFF8D8', 0);
      } else { const k = (ph - 0.8) / 0.2; ctx.save(); ctx.globalAlpha = 1 - k; oval(ctx, x, yy, (20 + 60 * k) * d, (6 + 18 * k) * d, null, 0); ctx.lineWidth = 3; ctx.strokeStyle = '#FFD45A'; ctx.stroke(); ctx.restore(); }
    }
  }
  function ledges(ctx) {
    const drop = LAVA - FLOOR;
    // the walkways: pale stone slabs with ink seams
    for (const [a, b2, seed] of [[LWALL, EDGE, 250], [GEO.RIGHT, RWALL, 260]]) {
      G.poly(ctx, [[px(a, FAR), FAR], [px(b2, FAR), FAR], [px(b2, BOT), BOT], [px(a, BOT), BOT]], { fill: FLOORC, lw: 0, seed, step: 60 });
      for (const y of [1060, 1180, 1420, 1760]) ink(ctx, [[px(a, y), y], [px(b2, y), y]], 2, seed + y, 'rgba(26,22,24,0.55)');
    }
    // the curb faces down to the lava, a lip along the top, and the warm light on them
    for (const [xa, seed] of [[EDGE, 252], [GEO.RIGHT, 253]]) {
      const top = edge(xa, FAR, BOT), bot = edge(xa, FAR, BOT, drop);
      const cg = ctx.createLinearGradient(0, FLOOR, 0, LAVA); cg.addColorStop(0, CURB); cg.addColorStop(1, '#E2A27A');
      G.poly(ctx, [top[0], top[1], bot[1], bot[0]], { fill: cg, lw: 0, seed, step: 60 });
      ink(ctx, [top[0], top[1]], 4, seed + 1);
      const lip = edge(xa + (xa === EDGE ? -16 : 16), FAR, BOT);
      ink(ctx, [lip[0], lip[1]], 2.5, seed + 2);
      // a chipped corner every so often
      for (const y of [1120, 1500]) { const x0 = px(xa, y), d = dep(y); ink(ctx, [[x0, y], [x0 + (xa === EDGE ? -24 : 24) * d, y + 10 * d], [x0, y + drop * d * 0.8]], 2.5, seed + y); }
    }
    // boxes stacked on the right walkway, near the far wall
    const bx = px(GEO.RIGHT + 60, 1040), by = 1040, sc = dep(1040) * 1.25;
    box(ctx, bx, by, 120 * sc, 90 * sc, 70 * sc, 600);
    box(ctx, bx + 115 * sc, by, 110 * sc, 80 * sc, 70 * sc, 610);
    box(ctx, bx + 40 * sc, by - 90 * sc, 110 * sc, 85 * sc, 70 * sc, 620);
  }
  // soft contact shadow on whatever floor is under him
  function shadow(ctx, st, t) {
    const onBridge = t >= ev.bridge && st.x > 280 && st.x < GEO.BRIDGE_END + 20;
    const gy = onBridge ? GEO.BRIDGE_TOP : (st.x < EDGE + 20 || st.x > GEO.RIGHT - 20) ? FLOOR : null;
    if (gy == null || st.y > gy + 5) return;
    const h = clamp((gy - st.y) / 300), k = 1 - 0.6 * h;
    ctx.save(); ctx.globalAlpha = 0.28 * k; ctx.filter = 'blur(3px)';
    ctx.beginPath(); ctx.ellipse(st.x - 8, gy + 4, 92 * k, 16 * k, 0, 0, Math.PI * 2); ctx.fillStyle = '#2A2428'; ctx.fill();
    ctx.restore();
  }
  // splash: droplets + rings + a smoke column
  function splashFx(ctx, t, ts, size) {
    const a = t - ts; if (a < 0 || a > 3) return;
    const cx = EDGE + 100;
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
      G.ellipse(ctx, x + Math.sin(pa * 4 + i) * 30, y - pa * 260, 26 + pa * 40, 22 + pa * 34, { fill: '#55525A', lw: 0, seed: 340 + i });
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
    G.text(ctx, text, 0, 0, { size, align: 'center', fam: 'Fredoka', weight: 700, color, stroke: INK, strokeW: size * 0.16 });
    ctx.restore();
  }

  // ---------- the camera: shakes on the hits ----------
  function shake(t) {
    let x = 0, y = 0;
    for (const [t0, amp] of [[ev.splash1, 9], [ev.splash2, 12], [ev.splash3, 15], [ev.land1, 8], [ev.land2, 11], [ev.bridge, 14], [ev.win, 6]]) {
      const a = t - t0; if (a < 0 || a > 0.6) continue;
      const k = Math.exp(-a * 7) * amp; x += Math.cos(a * 40) * k; y += Math.cos(a * 33 + 0.6) * k; // the biggest jolt lands on the hit frame
    }
    return [x, y];
  }

  let YAY = null;
  Studio.film({
    async init() { await Studio.loadFont('Fredoka', 'assets/fonts/Fredoka-700.woff2', 700); YAY = await Studio.loadImage('assets/locky-yay.png'); },
    post: { vignette: 0.18, grain: 0.03, paper: 0.12 },
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
      shadow(ctx, st, t);
      // Locky, clipped at the lava surface when he is in it
      const inLava = st.y > LAVA - 5 && st.x > EDGE && st.x < GEO.RIGHT;
      ctx.save();
      if (inLava) { ctx.beginPath(); ctx.rect(-200, -2000, W + 400, LAVA + 2000 + 6); ctx.clip(); }
      locky(ctx, { ...st, s: 1.25 });
      ctx.restore();
      if (st.air) { // speed lines trailing the flight
        const p0 = state(t - 0.05), vx = st.x - p0.x, vy = st.y - p0.y, v = Math.hypot(vx, vy) || 1;
        for (let i = 0; i < 5; i++) {
          const off = (i - 2) * 34, nx = -vy / v, ny = vx / v, len = 60 + G.rnd(i, 3) * 60;
          const sx0 = st.x + nx * off - vx / v * 90, sy0 = st.y - 130 + ny * off - vy / v * 90;
          ctx.save(); ctx.globalAlpha = 0.7; G.line(ctx, [[sx0, sy0], [sx0 - vx / v * len, sy0 - vy / v * len]], { color: INK, lw: 4, seed: 700 + i }); ctx.restore();
        }
      }
      for (const [tl, n] of [[ev.land1, 6], [ev.land2, 8]]) { // impact: a burst of ink strokes and two dust puffs
        const a = t - tl; if (a < 0 || a > 0.3) continue;
        const k = ease.outCubic(a / 0.3);
        ctx.save(); ctx.globalAlpha = 1 - k;
        for (let i = 0; i < n; i++) { const ang = Math.PI + (i + 0.5) * Math.PI / n, r0 = 80 + 90 * k, r1 = r0 + 50 * (1 - k) + 14; G.line(ctx, [[st.x + Math.cos(ang) * r0 * 1.2, FLOOR - 40 + Math.sin(ang) * r0 * 0.7], [st.x + Math.cos(ang) * r1 * 1.2, FLOOR - 40 + Math.sin(ang) * r1 * 0.7]], { color: INK, lw: 6, seed: 720 + i }); }
        for (const sd of [-1, 1]) G.ellipse(ctx, st.x + sd * (70 + 80 * k), FLOOR - 10, 30 + 30 * k, 16 + 10 * k, { fill: '#E2E0E3', lw: 3, seed: 740 + sd });
        ctx.restore();
      }
      for (const [ts, sz] of [[ev.splash1, 0.8], [ev.splash2, 1], [ev.splash3, 1.25]]) splashFx(ctx, t, ts, sz);
      // smoke: off his head after each fall, and a big column after the third
      smoke(ctx, t, 170, FLOOR - 200, ev.land1, 5, 1.8);
      smoke(ctx, t, 160, FLOOR - 200, ev.land2, 7, 2.2);
      smoke(ctx, t, EDGE + 100, LAVA - 40, ev.splash3 + 0.2, 9, 2.6);
      smoke(ctx, t, 150, FLOOR - 210, ev.sit, 6, 2.2);
      // dust when the bridge lands
      if (t >= ev.bridge && t < ev.bridge + 1) { const a = t - ev.bridge; for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - a); G.ellipse(ctx, 330 + i * 110, GEO.BRIDGE_TOP - 10 - a * 60, 30 + a * 50, 20 + a * 30, { fill: '#D8C8B8', lw: 3, seed: 500 + i }); ctx.restore(); } }
      bulb(ctx, t, 150, FLOOR - 330);
      if (t >= ev.win) G.confetti(ctx, t, ev.win, { n: 110, seed: 4 });
      ctx.restore();

      // words
      for (const l of S.labels) if (t >= l.t && t < l.end) {
        const p = ease.outBack(clamp((t - l.t) / 0.25), 2);
        ctx.save(); ctx.translate(W / 2, SAFE.y + 260); ctx.scale(p, p);
        G.text(ctx, l.text, 0, 0, { size: 120, align: 'center', fam: 'Fredoka', weight: 700, color: '#FFFFFF', stroke: INK, strokeW: 18 });
        ctx.restore();
      }
      if (t >= ev.splash3 + 0.6 && t < ev.idea) G.text(ctx, '...', W / 2, 760, { size: 140, align: 'center', fam: 'Fredoka', weight: 700, color: '#FFFFFF', stroke: INK, strokeW: 18 });
      const st2 = state(t);
      for (const sh of S.shouts) if (t >= sh.t && t < sh.end) stamp(ctx, t, sh.t, sh.end, sh.text, clamp(540 + (st2.x - 515) * 1.15, 380, 680), clamp(1260 + (st2.y - 1300) * 1.15 - 400, SAFE.y + 260, 1050), 84, '#FFE06A');
      stamp(ctx, t, ev.idea, ev.bridge, 'IDEA!', 520, 760, 120, '#FFE06A');
      stamp(ctx, t, ev.bridge, ev.bridge + 0.9, 'BOOM!', 600, 1080, 100, '#FFFFFF', 0.05);
      stamp(ctx, t, ev.win, ev.end, 'MADE IT!', W / 2, 640, 120, '#FFFFFF');

      // white flashes on the idea and the win
      // a hot orange flash on the exact frame Locky hits the lava
      for (const tf of [ev.splash1, ev.splash2, ev.splash3]) { const a = t - tf; if (a >= 0 && a < 0.12) { ctx.save(); ctx.globalAlpha = 0.7 * (1 - a / 0.12); ctx.fillStyle = '#FFB040'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      for (const tf of [ev.idea, ev.win]) { const a = t - tf; if (a >= 0 && a < 0.2) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - a / 0.2); ctx.fillStyle = '#FFF6D8'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      // the end card
      const e = clamp((t - ev.end) / 0.4);
      if (e > 0) {
        ctx.save(); ctx.globalAlpha = e;
        ctx.fillStyle = 'rgba(214,211,215,0.94)'; ctx.fillRect(0, 0, W, H);
        const pop = ease.outBack(e, 2);
        ctx.translate(W / 2 - 50, 640); ctx.scale(pop, pop);
        G.text(ctx, 'LOCKY', 0, 0, { size: 210, align: 'center', fam: 'Fredoka', weight: 700, color: '#3F49CC', stroke: INK, strokeW: 22 });
        G.text(ctx, "Don't let it", 0, 170, { size: 84, align: 'center', fam: 'Fredoka', weight: 700, color: '#FFFFFF', stroke: INK, strokeW: 12 });
        G.text(ctx, 'consume you', 0, 270, { size: 84, align: 'center', fam: 'Fredoka', weight: 700, color: '#FFFFFF', stroke: INK, strokeW: 12 });
        if (YAY) { const w = 760, h = w * YAY.height / YAY.width; ctx.drawImage(YAY, -w / 2 + 40, 330, w, h); } else locky(ctx, { x: 0, y: 640, s: 1.3, eyes: 'happy', arms: 'cheer', blush: true });
        ctx.restore();
      }
    },
  });
})();
