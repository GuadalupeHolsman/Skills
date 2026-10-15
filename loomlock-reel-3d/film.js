// LOOMLOCK 3D — "La key lo cambia todo". Three.js renders the 3D world into a WebGL canvas every frame;
// the 2D canvas composites the photoreal hook, the 3D frame, and the kinetic type. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM;
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
  let phone, screenCanvas, screenCtx, screenTex, cubes, pills, icons, badges, ring, flash, dust, backCanvas, backCtx, backTex;
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
    else L.modeScreen(ctx, UI.PHONE_W, ph, st.t, KEYS[st.id], st.t0);
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
    const red = col('#E63946'), white = col('#FFF8F0'), cream = col('#FFEFC2'), butter = col('#F6CF5B');
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
    const lime = col('#B8F35A'), dark = col('#20262B'), steel = col('#B9C2CC');
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
    const y1 = col('#FFC93C'), w = col('#FFFFFF'), d = col('#1C1606'), red = col('#E63946'), wood = col('#C98A4B');
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
    const a1 = new X.THREE.Color('#7B74FF'), a2 = new X.THREE.Color('#D6D3FF'), star = col('#FFF6C8');
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
    if (t >= ev.logo) return { A: SH.phone_dormir, B: SH.logo, t0: ev.logo, dur: 1.15, burst: 1.3, theta: 0.35 * Math.sin((t - ev.logo) * 0.9) };
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
  function paintBackdrop(t) {
    const [c0, c1] = bgFor(t), g = backCtx.createRadialGradient(128, 230, 10, 128, 256, 300);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    backCtx.fillStyle = g; backCtx.fillRect(0, 0, 256, 512); backTex.needsUpdate = true;
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
    } else { const u = clamp((t - ev.logo) / 3); dist = lerp(9.6, 8.4, ease.outCubic(u)) - 1.4 * pulse(t, ev.logo, 5); yaw = 0.3 * (1 - ease.outCubic(u)) - 0.08 * u; }
    const shake = (t < ev.freeze ? 0.03 * clamp((t - ev.cut3d) / 3.5) : 0) + MODES.reduce((a, m) => a + 0.09 * pulse(t, m.tap, 9), 0) + 0.12 * pulse(t, ev.logo, 8);
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
    // cards
    for (const m of MODES) {
      const pose = cardPose(m, t), c = cards[m.id];
      c.visible = !!pose; if (!pose) continue;
      c.position.set(...pose.p); c.rotation.set(...pose.r);
    }
    // shockwave + flash light at the contact point
    let ring_t = null, kc = '#FFFFFF';
    for (const m of MODES) if (t >= m.tap && t < m.tap + 0.5) { ring_t = (t - m.tap) / 0.5; kc = KEYS[m.id].bg; }
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

  function slam(ctx, text, y, size, t, t0, { color = '#FFFFFF', end = Infinity, stroke = 'rgba(0,0,0,0.55)' } = {}) {
    if (t < t0 || t > end + 0.12) return;
    const a = clamp((t - t0) / 0.06) * (1 - clamp((t - end) / 0.12));
    const s = 1 + 0.55 * Math.exp(-(t - t0) * 22);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 - 30, y); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
    G.text(ctx, text, 0, 0, { size, fam: 'Inter', weight: 800, color, align: 'center', boil: 0, stroke, strokeW: size * 0.06 });
    ctx.restore();
  }
  function overlays(ctx, t) {
    const [w0, w1] = ev.hookWords;
    slam(ctx, 'TU TELÉFONO', SAFE.y + 150, 104, t, w0, { end: ev.cut3d - 0.05 });
    slam(ctx, 'HACE TODO.', SAFE.y + 290, 150, t, w1, { end: ev.cut3d - 0.05, color: '#FFE45C' });
    const cw = ev.chaosWords;
    ['TODO.', 'EL.', 'TIEMPO.'].forEach((w, i) => slam(ctx, w, SAFE.y + 150 + i * 150, 150, t, cw[i], { end: ev.freeze - 0.03 }));
    if (t >= ev.question && t < MODES[0].tap) {
      const a = clamp((t - ev.question) / 0.4) * (1 - clamp((t - (MODES[0].tap - 0.25)) / 0.2));
      ctx.save(); ctx.globalAlpha = a;
      G.text(ctx, '¿Y SI HICIERA', W / 2 - 30, SAFE.y + 150, { size: 74, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0 });
      G.text(ctx, 'UNA SOLA COSA?', W / 2 - 30, SAFE.y + 245, { size: 74, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0 });
      ctx.restore();
    }
    const SUB = { cine: 'SOLO LA PELI.', gym: 'SOLO TU RUTINA.', foco: 'SOLO TU TRABAJO.', dormir: 'SOLO LA ALARMA.' };
    for (const m of MODES) {
      const end = m.i < 3 ? MODES[m.i + 1].tap - 0.1 : ev.logo - 0.05;
      slam(ctx, 'KEY ' + KEYS[m.id].name, SAFE.y + 170, 150, t, m.tap, { end, color: KEYS[m.id].bg, stroke: 'rgba(255,255,255,0.9)' });
      slam(ctx, SUB[m.id], SAFE.y + 270, 66, t, m.obj - 0.1, { end });
    }
    if (t >= ev.logo) {
      const a = UI.fadeIn(t, ev.logo + 0.7, 0.35), y = 1440;
      if (a > 0) { const ww = 760, hh = ww * (wordmark.height / wordmark.width); ctx.save(); ctx.globalAlpha = a; ctx.drawImage(wordmark, W / 2 - 30 - ww / 2, y - hh / 2 + (1 - a) * 20, ww, hh); ctx.restore(); }
      slam(ctx, 'UNA KEY. UN TRABAJO.', SAFE.y + 170, 82, t, ev.tagline);
      slam(ctx, 'Y YA.', SAFE.y + 290, 120, t, ev.tagline2, { color: '#9FD8FF' });
    }
  }

  Studio.film({
    async init() {
      X = await window.THREE_READY;
      await L.load();
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
      const back = new THREE.Mesh(new THREE.PlaneGeometry(46, 82), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false })); back.position.z = -14; scene.add(back);
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
      // cubes
      cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.058, 0.058), new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.0 }), NC);
      cubes.setColorAt(0, new THREE.Color('#fff')); cubes.frustumCulled = false; scene.add(cubes);
      // notifications
      pills = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.86, 0.22, 0.05, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: '#D9DCEA', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }), NP);
      icons = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.15, 0.15, 0.04, 2, 0.04), new THREE.MeshStandardMaterial({ roughness: 0.3 }), NP);
      badges = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: '#FF2D3B', emissive: '#FF1020', emissiveIntensity: 0.6, roughness: 0.3 }), NP);
      const APPC = ['#FF3B5C', '#25D366', '#1DA1F2', '#FF0050', '#FFB000', '#7B61FF', '#00C2FF', '#E1306C'];
      for (let i = 0; i < NP; i++) icons.setColorAt(i, new THREE.Color(APPC[i % APPC.length]));
      for (const m of [pills, icons, badges]) { m.frustumCulled = false; scene.add(m); }
      // the four keys
      for (const m of MODES) {
        const k = KEYS[m.id], g = new THREE.Group();
        const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 646; const cx = cv.getContext('2d');
        cx.translate(512, 323); L.key(cx, k, 0, 0, 1000, {});
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        const bodyC = new THREE.Mesh(new X.RoundedBoxGeometry(1.3, 0.82, 0.03, 3, 0.012), new THREE.MeshPhysicalMaterial({ color: k.bg, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }));
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
      SH.cine = shapePopcorn(); SH.gym = shapeDumbbell(); SH.foco = shapeTarget(); SH.dormir = shapeMoon(); SH.logo = shapeLogo(L.IMG.logo);
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
        if (ab > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * ab; ctx.drawImage(glCanvas, -14 * ab, 0, W, H); ctx.drawImage(glCanvas, 14 * ab, 0, W, H); ctx.restore(); }
        // frozen time: a cold grade and a ripple when it stops
        if (t >= ev.freeze && t < MODES[0].tap) {
          const u = t - ev.freeze; ctx.fillStyle = `rgba(30,50,120,${0.22 * clamp(u / 0.2)})`; ctx.fillRect(0, 0, W, H);
          if (u < 0.6) { ctx.save(); ctx.strokeStyle = `rgba(200,220,255,${0.6 * (1 - u / 0.6)})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(W / 2, H / 2, 100 + u * 2400, 0, 7); ctx.stroke(); ctx.restore(); }
        }
        const fl = MODES.reduce((a, m) => a + 0.7 * Math.exp(-Math.max(0, t - m.tap) * 16) * (t >= m.tap ? 1 : 0), 0) + (t >= ev.logo ? 0.8 * Math.exp(-(t - ev.logo) * 12) : 0) + (t >= ev.cut3d ? 0.9 * Math.exp(-(t - ev.cut3d) * 10) : 0);
        if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; ctx.fillRect(0, 0, W, H); }
      }
      overlays(ctx, t);
    },
    post: { paper: 0, vignette: 0.28, grain: 0.035 },
    fadeOut: 0.6,
  });
})();
