// LOOMLOCK 3D — "La key lo cambia todo". Three.js renders the 3D world into a WebGL canvas every frame;
// the 2D canvas composites the photoreal hook, the 3D frame, and the kinetic type. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM, BR = globalThis.BRAND, P = BR.P;
  const { ev, MODES, PH: TM } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const NC = 4200; // cubes
  const NP = 170;  // notification pills
  const SCR = { w: 600, h: 1300, pw: 1.33, ph: 2.88 }; // screen canvas px / world units
  const KEYS = L.KEYS;
  const BG = {
    chaos: ['#3A2A7A', '#07071A'], cine: ['#8A1426', '#120407'], gym: ['#4F7F12', '#060B02'],
    foco: ['#9A6C0E', '#120C02'], dormir: ['#3B3399', '#04041A'], logo: ['#2A3399', '#03051A'],
  };

  let X, renderer, composer, scene, camera, glCanvas, fooh, wordmark;
  let heroLock, backMesh, phone, screenCanvas, screenCtx, screenTex, cubes, pills, icons, badges, ring, flash, dust, backCanvas, backCtx, backTex;
  const cards = {};
  const SH = {};
  const tmpM = [], dummy = {};

  // ---------- small helpers ----------
  const h = (...a) => U.hash(...a);
  const ioc = ease.inOutCubic;
  const col = (hex) => { const c = new X.THREE.Color(hex); return [c.r, c.g, c.b]; };
  function sortShape(p, c) { // rank-match every shape the same way so cubes flow coherently
    const idx = [...Array(NC).keys()].sort((a, b) => (p[3 * a + 1] + 0.25 * p[3 * a]) - (p[3 * b + 1] + 0.25 * p[3 * b]));
    const P = new Float32Array(NC * 3), C = new Float32Array(NC * 3);
    idx.forEach((k, i) => { for (let j = 0; j < 3; j++) { P[3 * i + j] = p[3 * k + j]; C[3 * i + j] = c[3 * k + j]; } });
    return { p: P, c: C };
  }
  function build(fn, seed) {
    const r = U.mulberry32(seed), p = new Float32Array(NC * 3), c = new Float32Array(NC * 3);
    for (let i = 0; i < NC; i++) { const [x, y, z, cc] = fn(i, r); p[3 * i] = x; p[3 * i + 1] = y; p[3 * i + 2] = z; c[3 * i] = cc[0]; c[3 * i + 1] = cc[1]; c[3 * i + 2] = cc[2]; }
    return sortShape(p, c);
  }

  // ---------- the phone screen (a 2D canvas → texture) ----------
  function screenState(t) {
    if (t < MODES[0].tap) { const tt = Math.min(t, ev.freeze); return { kind: 'chaos', n: 1 + (tt - ev.cut3d) * 5, t: tt, shake: clamp((tt - ev.cut3d) / 3) }; }
    let m = MODES[0];
    for (const mm of MODES) if (t >= mm.tap) m = mm;
    return { kind: 'mode', id: m.id, t0: m.backStart, t };
  }
  function drawScreen(ctx, st) {
    const k = SCR.w / UI.PHONE_W, ph = SCR.h / k;
    ctx.save(); ctx.clearRect(0, 0, SCR.w, SCR.h);
    ctx.beginPath(); ctx.roundRect(0, 0, SCR.w, SCR.h, 74); ctx.clip();
    ctx.scale(k, k);
    if (st.kind === 'chaos') L.chaosScreen(ctx, UI.PHONE_W, ph, st.t, st.n, { shake: st.shake });
    else BR.appScreen(ctx, UI.PHONE_W, ph, st.t, st.id, st.t0);
    UI.text(ctx, '9:41', 34, 40, { size: 17, weight: 700, color: '#FFFFFF' });
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(150, 14, 112, 34, 17); ctx.fill();
    ctx.restore();
  }

  // ---------- shapes the cubes can become ----------
  function shapePhone(snap) {
    const body = col('#17171F'), edge = col('#2B2B36');
    return build((i, r) => {
      if (r() < 0.8) { // the screen: each cube carries the pixel it came from
        const u = r(), v = r(), px = Math.floor(u * (SCR.w - 1)), py = Math.floor(v * (SCR.h - 1)), o = 4 * (py * SCR.w + px);
        const a = snap.data[o + 3] / 255;
        const c = new X.THREE.Color().setRGB(snap.data[o] / 255, snap.data[o + 1] / 255, snap.data[o + 2] / 255, X.THREE.SRGBColorSpace);
        return [(u - 0.5) * SCR.pw, (0.5 - v) * SCR.ph, 0.08, a > 0.5 ? [c.r, c.g, c.b] : body];
      }
      const f = r(), s = r() * 2 - 1, q = r() * 2 - 1;
      if (f < 0.4) return [Math.sign(s) * 0.72, q * 1.48, (r() - 0.5) * 0.16, edge];
      if (f < 0.6) return [q * 0.72, Math.sign(s) * 1.5, (r() - 0.5) * 0.16, edge];
      return [q * 0.72, s * 1.48, -0.08, body];
    }, 11);
  }
  function shapePopcorn() {
    const red = col(P.red), white = col('#FFF8F0'), cream = col('#FFF1D2'), butter = col(P.yellow);
    const kern = []; { const r = U.mulberry32(5); for (let j = 0; j < 46; j++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.72; kern.push([Math.cos(a) * rr, 0.42 + r() * 0.55 * (1 - rr * 0.6), Math.sin(a) * rr]); } }
    return build((i, r) => {
      if (i < NC * 0.6) {
        const v = r(), a = r() * Math.PI * 2, rad = 0.46 + 0.3 * v, y = -1.4 + v * 1.8;
        const stripe = Math.floor((a / (Math.PI * 2)) * 12) % 2;
        return [Math.cos(a) * rad, y, Math.sin(a) * rad, v > 0.95 ? white : stripe ? red : white];
      }
      const kc = kern[i % kern.length], th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rr = 0.15 + 0.03 * Math.sin(th * 5);
      return [kc[0] + rr * Math.sin(ph) * Math.cos(th), kc[1] + rr * Math.cos(ph), kc[2] + rr * Math.sin(ph) * Math.sin(th), r() < 0.25 ? butter : cream];
    }, 21);
  }
  function shapeDumbbell() {
    const lime = col(P.green), dark = col(P.navy), steel = col('#C9CEDB');
    const tilt = 0.32, cs = Math.cos(tilt), sn = Math.sin(tilt);
    return build((i, r) => {
      let x, y, z, c;
      if (i < NC * 0.12) { x = (r() - 0.5) * 2.5; const a = r() * 6.283; y = Math.cos(a) * 0.075; z = Math.sin(a) * 0.075; c = steel; }
      else {
        const big = r() < 0.7, side = r() < 0.5 ? -1 : 1, R = big ? 0.66 : 0.46, th = big ? 0.22 : 0.15, cx = side * (big ? 0.72 : 1.0);
        const a = r() * 6.283, onFace = r() < 0.6, rr = onFace ? R * Math.sqrt(r()) : R;
        x = cx + (onFace ? (r() < 0.5 ? -th / 2 : th / 2) : (r() - 0.5) * th); y = Math.cos(a) * rr; z = Math.sin(a) * rr;
        c = big ? (rr > R * 0.86 ? dark : lime) : dark;
      }
      return [x * cs - y * sn, x * sn + y * cs, z, c];
    }, 31);
  }
  function shapeTarget() {
    const y1 = col(P.yellow), w = col('#FFFFFF'), d = col(P.navy), red = col(P.red), wood = col('#E6B477');
    const rot = -0.35, cs = Math.cos(rot), sn = Math.sin(rot);
    return build((i, r) => {
      let x, y, z, c;
      if (i < NC * 0.86) {
        const front = r() < 0.8, rr = front ? 1.22 * Math.sqrt(r()) : 1.22, a = r() * 6.283;
        x = Math.cos(a) * rr; y = Math.sin(a) * rr; z = front ? 0.12 : (r() - 0.5) * 0.24;
        const band = Math.floor(rr / 0.244); c = !front ? d : band === 0 ? red : band % 2 ? w : y1;
      } else { // the arrow, stuck dead centre
        const u = r(); x = u * 0.8; y = u * 0.62; z = 0.12 + u * 1.5;
        c = u > 0.82 ? red : wood; if (u > 0.82) { x += (r() - 0.5) * 0.14; y += (r() - 0.5) * 0.14; }
      }
      return [x * cs + z * sn, y, -x * sn + z * cs, c];
    }, 41);
  }
  function shapeMoon() {
    const a1 = new X.THREE.Color(P.lilac), a2 = new X.THREE.Color(P.lav), star = col(P.butter);
    return build((i, r) => {
      if (i < NC * 0.93) {
        for (let k = 0; k < 200; k++) {
          const x = (r() * 2 - 1) * 1.25, y = (r() * 2 - 1) * 1.25, z = (r() * 2 - 1) * 1.25 * 0.4;
          if (x * x + y * y > 1.25 * 1.25) continue;
          const dx = x - 0.62, dy = y - 0.38, dz = 0; if (dx * dx + dy * dy + dz * dz < 1.0 * 1.0) continue;
          const c = a1.clone().lerp(a2, clamp((y + 1.25) / 2.5)); return [x - 0.25, y, z, [c.r, c.g, c.b]];
        }
        return [0, 0, 0, star];
      }
      const j = i % 7, a = j * 0.9 + 0.4, R = 1.75 + 0.3 * h(j, 2);
      return [Math.cos(a) * R + (r() - 0.5) * 0.12, Math.sin(a) * R * 1.2 + (r() - 0.5) * 0.12, (r() - 0.5) * 0.3, star];
    }, 51);
  }
  function shapeLogo(img) {
    // rasterise the real Loomlock mark (the hex "L" glyph, x 55-225 / y 178-425 of the 792×612 artboard)
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    const s = 470 / 247; g.drawImage(img, -55 * s + (512 - 170 * s) / 2, -178 * s + 20, 792 * s, 612 * s);
    const d = g.getImageData(0, 0, 512, 512).data, px = [];
    for (let y = 0; y < 512; y += 2) for (let x = 0; x < 512; x += 2) if (x < 440 && d[4 * (y * 512 + x) + 3] > 120) px.push([x, y]);
    const blue = col('#3F49CC'), sky = col('#9FD8FF'), white = col('#FFFFFF');
    return build((i, r) => {
      const p = px[Math.floor(r() * px.length)] || [256, 256];
      const z = (r() - 0.5) * 0.3, k = r();
      return [(p[0] - 256) / 512 * 3.1 + (r() - 0.5) * 0.02, (256 - p[1]) / 512 * 3.1, z, k < 0.6 ? blue : k < 0.9 ? sky : white];
    }, 61);
  }

  function shapeLock(img) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 360; const g = c.getContext('2d');
    const s = 330 / 247; g.drawImage(img, -55 * s + (256 - 170 * s) / 2, -178 * s + 15, 792 * s, 612 * s);
    const d = g.getImageData(0, 0, 256, 360).data, onMark = (u, v) => d[4 * (Math.floor(v * 359) * 256 + Math.floor(u * 255)) + 3] > 110;
    const blue = col(P.blue), side = col(P.royal), white = col('#FFFFFF'), chrome = col('#DDE2EC'), chromeD = col('#8D96AA');
    const BW = 1.5, BH = 1.7, BD = 0.85, BY = -0.35;
    return build((i, r) => {
      const f = r();
      if (f < 0.42) { // front face, with the white hex mark
        const u = r(), v = r(), x = (u - 0.5) * BW, y = BY + (0.5 - v) * BH;
        const mu = (x + 0.42) / 0.84, mv = (BY + 0.62 - y) / 1.18, m = mu > 0 && mu < 1 && mv > 0 && mv < 1 && onMark(mu, mv);
        return [x, y, BD / 2, m ? white : blue];
      }
      if (f < 0.72) { const sd = r() < 0.5 ? -1 : 1, z = (r() - 0.5) * BD, y = BY + (r() - 0.5) * BH; return [sd * BW / 2, y, z, side]; }
      if (f < 0.8) { const x = (r() - 0.5) * BW, z = (r() - 0.5) * BD; return [x, BY + BH / 2, z, blue]; }
      // the chrome shackle: an arch plus two legs into the body
      const R0 = 0.5, tube = 0.11, legH = 0.32, top = BY + BH / 2;
      if (r() < 0.72) { const a = r() * Math.PI, b = r() * Math.PI * 2, cx = Math.cos(a) * R0, cy = top + legH + Math.sin(a) * R0;
        const nx = Math.cos(a) * Math.cos(b), nz = Math.sin(b); return [cx + nx * tube, cy + Math.sin(a) * Math.cos(b) * tube, nz * tube, nz > 0.2 || nx > 0 ? chrome : chromeD]; }
      const sd = r() < 0.5 ? -1 : 1, b = r() * Math.PI * 2; return [sd * R0 + Math.cos(b) * tube, top + r() * legH, Math.sin(b) * tube, Math.sin(b) > 0 ? chrome : chromeD];
    }, 71);
  }
  // ---------- cube state at t ----------
  function morph(A, B, t, t0, dur, burst, theta, i, out) {
    const d = h(i, 7) * 0.3 * dur, u = clamp((t - t0 - d) / (dur * 0.7)), e = ioc(u), s = Math.sin(Math.PI * u);
    const ct = Math.cos(theta), st = Math.sin(theta);
    const bx = B.p[3 * i] * ct + B.p[3 * i + 2] * st, by = B.p[3 * i + 1], bz = -B.p[3 * i] * st + B.p[3 * i + 2] * ct;
    const ax = A.p[3 * i], ay = A.p[3 * i + 1], az = A.p[3 * i + 2];
    let x = lerp(ax, bx, e), y = lerp(ay, by, e), z = lerp(az, bz, e);
    const rx = h(i, 1) - 0.5, ry = h(i, 2) - 0.5, rz = h(i, 3) - 0.5;
    x += s * burst * (ax * 1.1 + rx * 2.4); y += s * burst * (ay * 0.3 + ry * 2.0); z += s * burst * (1.3 + rz * 2.6);
    const sw = s * 1.6 * burst, cw = Math.cos(sw), swn = Math.sin(sw); // swirl round the vertical axis mid-flight
    out.x = x * cw + z * swn; out.y = y; out.z = -x * swn + z * cw;
    out.e = e; out.s = s;
    for (let j = 0; j < 3; j++) out.c[j] = lerp(A.c[3 * i + j], B.c[3 * i + j], e);
  }
  function cubeJob(t) { // which morph is running, or null when the phone itself is on screen
    if (t >= ev.logo) return { A: SH.phone_dormir, B: SH.lock, t0: ev.logo, dur: 1.15, burst: 1.1, theta: -0.45 + 0.25 * ioc(clamp((t - ev.logo) / 3)) };
    for (const m of MODES) {
      const prev = m.i === 0 ? SH.phone_chaos : SH['phone_' + MODES[m.i - 1].id];
      const spin = 0.55 * Math.sin(2 * Math.PI * clamp((t - m.tap) / TM.holdEnd));
      if (t >= m.tap && t < m.backStart) return { A: prev, B: SH[m.id], t0: m.tap, dur: TM.explode, burst: 1, theta: spin };
      if (t >= m.backStart && t < m.phone) return { A: SH[m.id], B: SH['phone_' + m.id], t0: m.backStart, dur: TM.back, burst: 0.35, theta: 0 };
    }
    return null;
  }
  const out = { c: [0, 0, 0] };
  function updateCubes(t) {
    const job = cubeJob(t);
    cubes.visible = !!job;
    if (!job) return false;
    const THREE = X.THREE, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), cc = new THREE.Color();
    for (let i = 0; i < NC; i++) {
      morph(job.A, job.B, t, job.t0, job.dur, job.burst, job.theta, i, out);
      const spin = out.s * 6;
      e3.set(spin * (h(i, 4) - 0.5), spin * (h(i, 5) - 0.5), spin * (h(i, 6) - 0.5)); q.setFromEuler(e3);
      const k = 1 - 0.25 * out.s; sc.set(k, k, k); v.set(out.x, out.y, out.z);
      m4.compose(v, q, sc); cubes.setMatrixAt(i, m4);
      cc.setRGB(out.c[0], out.c[1], out.c[2]); cubes.setColorAt(i, cc);
    }
    cubes.instanceMatrix.needsUpdate = true; cubes.instanceColor.needsUpdate = true;
    return true;
  }

  // ---------- notification pills erupting from the screen ----------
  function updatePills(t) {
    const THREE = X.THREE, tap = MODES[0].tap;
    const on = t >= ev.cut3d && t < tap + 0.4;
    pills.visible = icons.visible = badges.visible = on;
    if (!on) return;
    const te = Math.min(t, ev.freeze) + Math.max(0, t - ev.freeze) * 0.025; // time stops (barely drifts)
    const m4 = new THREE.Matrix4(), off = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    const shatter = clamp((t - tap) / 0.35);
    for (let i = 0; i < NP; i++) {
      const ts = ev.cut3d + 0.05 + (ev.freeze - ev.cut3d - 0.3) * Math.sqrt(h(i, 11)), age = te - ts;
      if (age < 0) { sc.set(0, 0, 0); m4.compose(v.set(0, 0, 0), q, sc); pills.setMatrixAt(i, m4); icons.setMatrixAt(i, m4); badges.setMatrixAt(i, m4); continue; }
      const ox = (h(i, 12) - 0.5) * 1.1, oy = (h(i, 13) - 0.5) * 2.6;
      let dx = ox * 1.3 + (h(i, 14) - 0.5) * 1.6, dy = oy * 0.45 + (h(i, 15) - 0.5) * 1.4, dz = 1 + h(i, 16) * 0.8;
      const n = Math.hypot(dx, dy, dz); dx /= n; dy /= n; dz /= n;
      const sp = 2.6 + 2.4 * h(i, 17), dist = sp * (1 - Math.exp(-age * 1.1)) / 1.1 + age * 0.25;
      let x = ox + dx * dist, y = oy + dy * dist, z = 0.1 + dz * dist;
      const orb = age * 0.4 * (h(i, 18) < 0.5 ? -1 : 1), co = Math.cos(orb), so = Math.sin(orb);
      [x, z] = [x * co + z * so, -x * so + z * co];
      if (shatter > 0) { x += dx * shatter * 3; y += dy * shatter * 3; z += dz * shatter * 3; }
      const pop = ease.outBack(clamp(age / 0.18), 2) * (1 - shatter);
      e3.set((h(i, 19) - 0.5) * 1.2 + age * (h(i, 20) - 0.5) * 2, (h(i, 21) - 0.5) * 1.4 + age * (h(i, 22) - 0.5) * 2, (h(i, 23) - 0.5) * 0.8);
      q.setFromEuler(e3); sc.set(pop, pop, pop); v.set(x, y, z);
      m4.compose(v, q, sc); pills.setMatrixAt(i, m4);
      off.makeTranslation(-0.28, 0, 0.03); icons.setMatrixAt(i, m4.clone().multiply(off));
      off.makeTranslation(0.36, 0.09, 0.04); badges.setMatrixAt(i, m4.clone().multiply(off));
    }
    pills.instanceMatrix.needsUpdate = icons.instanceMatrix.needsUpdate = badges.instanceMatrix.needsUpdate = true;
  }

  // ---------- the keys (3D cards) ----------
  function cardPose(m, t) {
    const C = [0.32, 0.92, 0.2];
    if (t < m.cardIn || t > m.tap + 0.75) return null;
    if (t < m.tap) {
      if (m.i === 0) { // floats in frozen time, then dives onto the phone on the drop
        const u = clamp((t - m.cardIn) / (m.tap - 0.32 - m.cardIn)), dive = ease.inCubic(clamp((t - (m.tap - 0.32)) / 0.32));
        const fx = lerp(0.05, 0.25, ioc(u)), fy = lerp(-0.8, -0.15, ioc(u)), fz = lerp(3.0, 2.3, ioc(u));
        return { p: [lerp(fx, C[0], dive), lerp(fy, C[1], dive), lerp(fz, C[2], dive)], r: [lerp(0.5 - u * 0.4, 0, dive), lerp(-0.8 + u * 0.7, 0, dive), lerp(0.25, -0.12, dive)], s: 1 };
      }
      const u = ease.inCubic(clamp((t - m.cardIn) / (m.tap - m.cardIn)));
      return { p: [lerp(3.4, C[0], u), lerp(3.6, C[1], u), lerp(3.2, C[2], u)], r: [(1 - u) * 2.2, (1 - u) * -3.0, lerp(0.6, -0.12, u)], s: 1 };
    }
    const k = ease.outCubic(clamp((t - m.tap) / 0.75));
    return { p: [C[0] + k * 2.6, C[1] + k * 2.2, C[2] + k * 3.4 + Math.sin(k * 3) * 0.2], r: [k * 2.5, k * 1.4, -0.12 + k * 1.8], s: 1 };
  }

  // ---------- backdrop + camera ----------
  function bgFor(t) {
    if (t >= ev.logo) return BG.logo;
    let id = 'chaos'; for (const m of MODES) if (t >= m.tap) id = m.id; return BG[id];
  }
  const backTexs = {};
  function paintBackdrop(t) {
    let id = 'chaos'; for (const m of MODES) if (t >= m.tap) id = m.id; if (t >= ev.logo) id = 'lock';
    if (!backTexs[id]) { backTexs[id] = new X.THREE.CanvasTexture(BR.backdrop(id)); backTexs[id].colorSpace = X.THREE.SRGBColorSpace; }
    backMesh.material.map = backTexs[id]; backMesh.material.needsUpdate = true;
  }
  function cameraAt(t) {
    let dist, yaw, py = 0;
    const firstTap = MODES[0].tap;
    if (t < ev.freeze) { const u = ease.outCubic(clamp((t - ev.cut3d) / 1.5)); dist = lerp(1.25, 8.6, u); yaw = lerp(0.0, 0.32, u) - 0.15 * clamp((t - ev.cut3d - 1.5) / 3); py = lerp(0.35, 0, u); }
    else if (t < firstTap) { const u = ioc(clamp((t - ev.freeze) / (firstTap - ev.freeze))); dist = lerp(8.6, 7.6, u); yaw = lerp(0.17, -0.1, u); }
    else if (t < ev.logo) {
      let m = MODES[0]; for (const mm of MODES) if (t >= mm.tap) m = mm;
      const u = (t - m.tap) / S.BAR, side = m.i % 2 ? -1 : 1;
      dist = 8.9 - 1.6 * pulse(t, m.tap, 5) - 0.6 * Math.sin(Math.PI * clamp(u));
      yaw = side * lerp(-0.25, 0.25, ioc(clamp(u))); py = 0.15 * Math.sin(u * 3);
    } else { const u = clamp((t - ev.logo) / 3); dist = lerp(15.5, 13.6, ease.outCubic(u)) - 0.6 * pulse(t, ev.logo, 5); yaw = 0.22 * (1 - ease.outCubic(u)); py = 0.55; }
    const shake = (t < ev.freeze ? 0.03 * clamp((t - ev.cut3d) / 3.5) : 0) + MODES.reduce((a, m) => a + 0.05 * pulse(t, m.tap, 9), 0) + 0.03 * pulse(t, ev.logo, 8);
    const sx = (U.noise1(t * 9, 1)) * shake, sy = (U.noise1(t * 9, 2)) * shake;
    camera.position.set(Math.sin(yaw) * dist + sx, py + sy, Math.cos(yaw) * dist);
    camera.lookAt(sx * 0.3, py * 0.6, 0);
    camera.rotation.z += (t < ev.freeze ? 0.03 * Math.sin(t * 1.3) : 0) + U.noise1(t * 5, 3) * shake * 0.4;
  }

  function render3d(t) {
    const THREE = X.THREE;
    // phone + its screen
    const st = screenState(t);
    drawScreen(screenCtx, st); screenTex.needsUpdate = true;
    let phoneOn = t >= ev.cut3d && t < ev.logo && !cubeJob(t);
    phone.visible = phoneOn;
    const vib = t < ev.freeze ? clamp((t - ev.cut3d) / 3) : 0;
    phone.rotation.set(0.04 * Math.sin(t * 0.7), -0.12 + 0.05 * Math.sin(t * 0.5), 0.025 * vib * Math.sin(t * 95));
    phone.position.set(0.012 * vib * Math.sin(t * 120), 0.05 * Math.sin(t * 1.1), 0);
    if (t >= MODES[0].tap) phone.rotation.set(0, 0, 0);
    updateCubes(t);
    updatePills(t);
    { const k = clamp((t - ev.logo - 1.05) / 0.35); heroLock.visible = k > 0; if (k > 0) { heroLock.scale.setScalar(0.96 + 0.04 * ease.outBack(k, 2)); heroLock.rotation.y = -0.45 + 0.25 * ioc(clamp((t - ev.logo) / 3)); heroLock.traverse((o) => { if (o.material && !o.userData.keepAlpha) { o.material.transparent = k < 1; o.material.opacity = k; } else if (o.material) o.material.opacity = k; }); }
      if (t > ev.logo + 1.45) cubes.visible = false; }
    // cards
    for (const m of MODES) {
      const pose = cardPose(m, t), c = cards[m.id];
      c.visible = !!pose; if (!pose) continue;
      c.position.set(...pose.p); c.rotation.set(...pose.r);
    }
    // shockwave + flash light at the contact point
    let ring_t = null, kc = '#FFFFFF';
    for (const m of MODES) if (t >= m.tap && t < m.tap + 0.5) { ring_t = (t - m.tap) / 0.5; kc = BR.KEY[m.id].accent; }
    if (t >= ev.logo && t < ev.logo + 0.6) { ring_t = (t - ev.logo) / 0.6; kc = '#9FD8FF'; }
    ring.visible = ring_t !== null;
    if (ring.visible) { const s = 0.3 + 6 * ease.outCubic(ring_t); ring.scale.set(s, s, s); ring.material.opacity = 1 - ring_t; ring.material.color.set(kc); ring.lookAt(camera.position); }
    flash.intensity = 0; for (const m of MODES) flash.intensity += 25 * pulse(t, m.tap, 9); flash.intensity += 20 * pulse(t, ev.logo, 8);
    flash.color.set(kc);
    // floating dust
    const pa = dust.geometry.attributes.position, base = dust.userData.base;
    for (let i = 0; i < pa.count; i++) { pa.setXYZ(i, base[3 * i] + Math.sin(t * 0.3 + i) * 0.2, ((base[3 * i + 1] + t * 0.15 * (0.5 + h(i, 9)) + 8) % 16) - 8, base[3 * i + 2]); }
    pa.needsUpdate = true;
    paintBackdrop(t);
    cameraAt(t);
    composer.render();
  }

  // ---------- 2D layers ----------
  function drawHook(ctx, t) {
    const iw = fooh.width, ih = fooh.height, cover = Math.max(W / iw, H / ih);
    const sx0 = 781, sy0 = 1216; // centre of the photo's phone screen (image px)
    const whip = ease.inCubic(clamp((t - ev.whip) / (ev.cut3d - ev.whip)));
    const push = 1 + 0.09 * clamp(t / ev.whip);
    const zoom = push * lerp(1, 3.35, whip);
    const shake = 6 * pulse(t, 0.35, 4) + 4 * pulse(t, 0.85, 4) + 14 * whip;
    const draw = (z, a) => {
      const k = cover * z, fx = lerp(iw / 2, sx0, clamp(whip * 1.4)), fy = lerp(ih / 2, sy0, clamp(whip * 1.4));
      ctx.globalAlpha = a;
      ctx.drawImage(fooh, W / 2 - fx * k + U.noise1(t * 20, 1) * shake, H / 2 - fy * k + U.noise1(t * 20, 2) * shake, iw * k, ih * k);
    };
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    draw(zoom, 1);
    if (whip > 0.05) for (let j = 1; j <= 4; j++) draw(zoom * (1 - 0.035 * j * whip), 0.18); // zoom blur
    ctx.globalAlpha = 1;
    // rain streaks
    ctx.save(); ctx.strokeStyle = 'rgba(220,230,255,0.22)'; ctx.lineWidth = 2;
    for (let i = 0; i < 70; i++) { const x = h(i, 1) * W, y = ((h(i, 2) * H + t * 1900 * (0.8 + h(i, 3) * 0.4)) % (H + 200)) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 60); ctx.stroke(); }
    ctx.restore();
    const fl = whip > 0.85 ? (whip - 0.85) / 0.15 : 0; if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
  }

  // brand type: Montserrat ExtraBold, white + lavender, a calm rise (not a slam)
  function say(ctx, str, y, size, t, t0, { color = P.white, end = Infinity, weight = 800 } = {}) {
    if (t < t0 || t > end + 0.2) return;
    const a = clamp((t - t0) / 0.16) * (1 - clamp((t - end) / 0.2)), u = ease.outBack(clamp((t - t0) / 0.35), 1.4);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 - 30, y + (1 - u) * 26);
    ctx.shadowColor = 'rgba(10,14,60,0.7)'; ctx.shadowBlur = 30;
    BR.text(ctx, str, 0, 0, { size, weight, color, align: 'center', maxW: SAFE.w - 40 });
    ctx.restore();
  }
  function tag(ctx, str, y, t, t0, { end = Infinity, size = 40, bg = P.navy, fg = P.white, italic = true, dot } = {}) {
    if (t < t0 || t > end + 0.2) return;
    const a = clamp((t - t0) / 0.16) * (1 - clamp((t - end) / 0.2)), u = ease.outBack(clamp((t - t0) / 0.3), 1.8);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 - 30, y); ctx.scale(0.85 + 0.15 * u, 0.85 + 0.15 * u);
    const w = BR.pill(ctx, str, 0, 0, { size, bg, fg, italic, weight: italic ? 700 : 800, padX: dot ? 64 : 40 });
    if (dot) { ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(-w / 2 + 34, 0, size * 0.28, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function overlays(ctx, t) {
    { const g = ctx.createLinearGradient(0, 0, 0, 860); g.addColorStop(0, 'rgba(18,28,102,0.72)'); g.addColorStop(0.55, 'rgba(18,28,102,0.38)'); g.addColorStop(1, 'rgba(18,28,102,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 860); }
    const [w0, w1] = ev.hookWords, y0 = SAFE.y + 140, y1 = SAFE.y + 262;
    say(ctx, 'Tu teléfono', y0, 100, t, w0, { end: ev.cut3d - 0.05 });
    say(ctx, 'lo quiere todo.', y1, 100, t, w1, { end: ev.cut3d - 0.05, color: P.yellow });
    const cw = ev.chaosWords;
    [['Notificaciones.', P.white], ['Pendientes.', P.white], ['Ruido.', P.lav]].forEach(([w, c], i) => say(ctx, w, y0 + i * 118, 90, t, cw[i], { end: ev.freeze - 0.03, color: c }));
    tag(ctx, 'Tomate una pausa.', SAFE.y + 100, t, ev.freeze + 0.05, { end: MODES[0].tap - 0.25 });
    say(ctx, '¿Y si hiciera', SAFE.y + 240, 88, t, ev.question + 0.35, { end: MODES[0].tap - 0.25 });
    say(ctx, 'una sola cosa?', SAFE.y + 340, 88, t, ev.question + 0.6, { end: MODES[0].tap - 0.25, color: P.lav });
    for (const m of MODES) {
      const end = m.i < 3 ? MODES[m.i + 1].tap - 0.12 : ev.logo - 0.05, k = BR.KEY[m.id];
      tag(ctx, 'KEY ' + k.name, SAFE.y + 100, t, m.tap, { end, italic: false, size: 42, dot: k.accent });
      say(ctx, k.line, SAFE.y + 250, 108, t, m.obj - 0.15, { end });
    }
    if (t >= ev.logo) {
      const a = UI.fadeIn(t, ev.logo + 1.3, 0.5), y = 1425;
      if (a > 0) { const ww = 560, hh = ww * (wordmark.height / wordmark.width); ctx.save(); ctx.globalAlpha = a; ctx.drawImage(wordmark, W / 2 - 30 - ww / 2, y - hh / 2 + (1 - a) * 14, ww, hh); ctx.restore(); }
      say(ctx, 'Una key.', y0, 100, t, ev.tagline);
      say(ctx, 'Un solo trabajo.', y1, 100, t, ev.tagline + 0.35, { color: P.lav });
      tag(ctx, 'No obliga. Invita.', SAFE.y + 370, t, ev.tagline2, { bg: P.yellow, fg: P.navy });
    }
    // brand sparkles drift over everything but the type
    if (t >= ev.cut3d) { ctx.save(); BR.sparkles(ctx, W, H, t, { n: 12, seed: 9, alpha: 0.7, top: 0.3, bottom: 0.85 }); ctx.restore(); }
  }

  Studio.film({
    async init() {
      X = await window.THREE_READY;
      await L.load(); await BR.loadFonts();
      fooh = await Studio.loadImage('assets/fooh-bogota.png');
      const THREE = X.THREE;
      // the wordmark, cropped from a big rasterisation of the real white logo
      { const big = document.createElement('canvas'); big.width = 3168; big.height = 2448; big.getContext('2d').drawImage(L.IMG.logoW, 0, 0, 3168, 2448);
        wordmark = document.createElement('canvas'); wordmark.width = 1960; wordmark.height = 360; wordmark.getContext('2d').drawImage(big, 1060, 1060, 1960, 360, 0, 0, 1960, 360); }
      glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
      renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(W, H, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new X.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
      scene.add(new THREE.AmbientLight('#8890ff', 0.25));
      const key = new THREE.DirectionalLight('#ffffff', 1.5); key.position.set(3, 5, 6); scene.add(key);
      const rim = new THREE.DirectionalLight('#6A7BFF', 3.5); rim.position.set(-5, 2, -4); scene.add(rim);
      flash = new THREE.PointLight('#ffffff', 0, 12, 1.5); flash.position.set(0.3, 1, 1.2); scene.add(flash);
      // backdrop
      backCanvas = document.createElement('canvas'); backCanvas.width = 256; backCanvas.height = 512; backCtx = backCanvas.getContext('2d');
      backTex = new THREE.CanvasTexture(backCanvas); backTex.colorSpace = THREE.SRGBColorSpace;
      const back = new THREE.Mesh(new THREE.PlaneGeometry(10.9, 19.3), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false })); backMesh = back; scene.add(back);
      camera.add(back); scene.add(camera); back.position.set(0, 0, -30);
      // phone
      phone = new THREE.Group();
      const body = new THREE.Mesh(new X.RoundedBoxGeometry(1.45, 3.0, 0.16, 6, 0.17), new THREE.MeshPhysicalMaterial({ color: '#15151C', metalness: 0.7, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }));
      screenCanvas = document.createElement('canvas'); screenCanvas.width = SCR.w; screenCanvas.height = SCR.h; screenCtx = screenCanvas.getContext('2d');
      screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCR.pw, SCR.ph), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false }));
      screen.position.z = 0.0815;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(SCR.pw, SCR.ph), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0, clearcoat: 1 }));
      glass.position.z = 0.083;
      for (const [y, hh] of [[0.65, 0.32], [0.2, 0.32], [-0.2, 0.2]]) { const btn = new THREE.Mesh(new THREE.BoxGeometry(0.04, hh, 0.06), body.material); btn.position.set(y > 0.6 ? -0.735 : 0.735, y, 0); phone.add(btn); }
      phone.add(body, screen); scene.add(phone);
      // the real Loomlock lock (Brandbook "Core Idea" render): glossy blue body, chrome shackle, white mark
      heroLock = new THREE.Group();
      { const body = new THREE.Mesh(new X.RoundedBoxGeometry(1.5, 1.7, 0.85, 8, 0.16), new THREE.MeshPhysicalMaterial({ color: P.blue, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }));
        body.position.y = -0.35; heroLock.add(body);
        const chrome = new THREE.MeshPhysicalMaterial({ color: '#E8ECF4', metalness: 1, roughness: 0.14 });
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 32, 72, Math.PI), chrome); arch.position.y = 0.5 + 0.32; heroLock.add(arch);
        for (const sd of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.4, 32), chrome); leg.position.set(sd * 0.5, 0.5 + 0.13, 0); heroLock.add(leg); }
        const mc = document.createElement('canvas'); mc.width = 512; mc.height = 744; const mg = mc.getContext('2d'); const ms = 744 / 247; mg.drawImage(L.IMG.logoW, -55 * ms + (512 - 170 * ms) / 2, -178 * ms, 792 * ms, 612 * ms);
        const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace; mt.anisotropy = 8;
        const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.9), new THREE.MeshBasicMaterial({ map: mt, transparent: true, toneMapped: false })); mark.position.set(0, -0.4, 0.426); mark.userData.keepAlpha = true; heroLock.add(mark);
      }
      heroLock.visible = false; scene.add(heroLock);
      // cubes
      cubes = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.062, 0.062, 0.062, 2, 0.018), new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.0 }), NC);
      cubes.setColorAt(0, new THREE.Color('#fff')); cubes.frustumCulled = false; scene.add(cubes);
      // notifications
      pills = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.86, 0.22, 0.05, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: '#E8EAFF', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }), NP);
      icons = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.15, 0.15, 0.04, 2, 0.04), new THREE.MeshStandardMaterial({ roughness: 0.3 }), NP);
      badges = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: '#FF2D3B', emissive: '#FF1020', emissiveIntensity: 0.6, roughness: 0.3 }), NP);
      const APPC = [P.red, P.green, P.locky, P.yellow, P.magenta, P.sky, P.coral, P.violet];
      for (let i = 0; i < NP; i++) icons.setColorAt(i, new THREE.Color(APPC[i % APPC.length]));
      for (const m of [pills, icons, badges]) { m.frustumCulled = false; scene.add(m); }
      // the four keys
      for (const m of MODES) {
        const k = BR.KEY[m.id], g = new THREE.Group();
        const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 646; const cx = cv.getContext('2d');
        cx.translate(512, 323); BR.keyCard(cx, m.id, 1000);
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        const bodyC = new THREE.Mesh(new X.RoundedBoxGeometry(1.3, 0.82, 0.03, 3, 0.012), new THREE.MeshPhysicalMaterial({ color: P.royal, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }));
        const face = new THREE.Mesh(new THREE.PlaneGeometry(1.33, 0.86), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3 }));
        face.position.z = 0.0165; g.add(bodyC, face); g.visible = false; scene.add(g); cards[m.id] = g;
      }
      ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 96), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      ring.position.set(0.32, 0.92, 0.3); scene.add(ring);
      { const n = 420, pos = new Float32Array(n * 3), r = U.mulberry32(77); for (let i = 0; i < n * 3; i += 3) { pos[i] = (r() - 0.5) * 12; pos[i + 1] = (r() - 0.5) * 16; pos[i + 2] = -6 + r() * 9; }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
        dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#cfd6ff', size: 0.035, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
        dust.userData.base = pos; scene.add(dust); }
      // shapes (screen snapshots carry the real pixels into the cubes)
      const snap = (st) => { drawScreen(screenCtx, st); return screenCtx.getImageData(0, 0, SCR.w, SCR.h); };
      SH.phone_chaos = shapePhone(snap(screenState(MODES[0].tap - 0.001)));
      for (const m of MODES) SH['phone_' + m.id] = shapePhone(snap({ kind: 'mode', id: m.id, t0: m.backStart, t: m.phone }));
      SH.cine = shapePopcorn(); SH.gym = shapeDumbbell(); SH.foco = shapeTarget(); SH.dormir = shapeMoon(); SH.lock = shapeLock(L.IMG.logo);
      // post
      composer = new X.EffectComposer(renderer);
      composer.addPass(new X.RenderPass(scene, camera));
      composer.addPass(new X.UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.32, 0.45, 0.92));
      composer.addPass(new X.OutputPass());
    },
    draw(ctx, t) {
      if (t < ev.cut3d) drawHook(ctx, t);
      else {
        render3d(t);
        ctx.drawImage(glCanvas, 0, 0, W, H);
        // tap: chromatic split for a few frames
        let ab = 0; for (const m of MODES) ab += pulse(t, m.tap, 14); ab += pulse(t, ev.logo, 12);
        if (false) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * ab; ctx.drawImage(glCanvas, -14 * ab, 0, W, H); ctx.drawImage(glCanvas, 14 * ab, 0, W, H); ctx.restore(); }
        // frozen time: a cold grade and a ripple when it stops
        if (t >= ev.freeze && t < MODES[0].tap) {
          const u = t - ev.freeze; ctx.fillStyle = `rgba(18,28,102,${0.3 * clamp(u / 0.2)})`; ctx.fillRect(0, 0, W, H);
          if (u < 0.6) { ctx.save(); ctx.strokeStyle = `rgba(200,220,255,${0.6 * (1 - u / 0.6)})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(W / 2, H / 2, 100 + u * 2400, 0, 7); ctx.stroke(); ctx.restore(); }
        }
        const fl = MODES.reduce((a, m) => a + 0.32 * Math.exp(-Math.max(0, t - m.tap) * 16) * (t >= m.tap ? 1 : 0), 0) + (t >= ev.logo ? 0.25 * Math.exp(-(t - ev.logo) * 12) : 0) + (t >= ev.cut3d ? 0.9 * Math.exp(-(t - ev.cut3d) * 10) : 0);
        if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; ctx.fillRect(0, 0, W, H); }
      }
      overlays(ctx, t);
    },
    post: { paper: 0, vignette: 0.28, grain: 0.035 },
    fadeOut: 0.6,
  });
})();
