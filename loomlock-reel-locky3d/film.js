// LOOMLOCK — "LOCKY TIENE UNA KEY": Locky as a 3D vinyl toy, a giant phone, keys that transform it.
// (built from film.tpl.js + the shared cube/shape code of loomlock-reel-3d by build.py)
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM;
  const { ev, MODES, PH: TM, T } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const NC = 4200, NP = 80;
  const SCR = { w: 600, h: 1300, pw: 1.33, ph: 2.88 };
  const KEYS = L.KEYS;
  const BG = { intro: ['#3A2A7A', '#07071A'], cine: ['#8A1426', '#120407'], gym: ['#4F7F12', '#060B02'], dormir: ['#2A2470', '#03031A'] };
  const STAGE = [-0.55, 1.6, 0];                // the phone's centre (it stands on the floor)
  const LP = [1.0, 0, 0.35];                    // Locky's spot
  const CONTACT = [STAGE[0] + 0.32, STAGE[1] + 0.92, 0.25];
  const SEAT = [STAGE[0] + 0.37, STAGE[1] - 0.66, 0.1]; // in the hollow of the moon

  let X, renderer, composer, scene, camera, glCanvas, wordmark, stage, locky, floor;
  let phone, screenCanvas, screenCtx, screenTex, cubes, pills, icons, badges, ring, flash, dust, backCtx, backTex;
  const cards = {}, SH = {};

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



  const ioc2 = ease.inOutCubic;
  // ---------- the phone screen ----------
  const te = (t) => (t < ev.slowmo ? t : ev.slowmo + (t - ev.slowmo) * 0.12); // time slows for the jump
  function screenState(t) {
    if (t < MODES[0].tap) { const tt = Math.min(te(t), ev.slowmo + 0.2); return { kind: 'chaos', n: 1 + tt * 1.6, t: tt, shake: clamp(tt / 6) }; }
    let m = MODES[0]; for (const mm of MODES) if (t >= mm.tap) m = mm;
    return { kind: 'mode', id: m.id, t0: m.backStart, t };
  }
  function drawScreen(ctx, st) {
    const k = SCR.w / UI.PHONE_W, ph = SCR.h / k;
    ctx.save(); ctx.clearRect(0, 0, SCR.w, SCR.h);
    ctx.beginPath(); ctx.roundRect(0, 0, SCR.w, SCR.h, 74); ctx.clip(); ctx.scale(k, k);
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


  function cubeJob(t) {
    for (const m of MODES) {
      const prev = m.i === 0 ? SH.phone_chaos : SH['phone_' + MODES[m.i - 1].id];
      if (m.id === 'dormir' && t >= m.tap) return { A: prev, B: SH.dormir, t0: m.tap, dur: TM.explode, burst: 1, theta: 0 }; // the moon stays
      const spin = 0.5 * Math.sin(2 * Math.PI * clamp((t - m.tap) / TM.holdEnd));
      if (t >= m.tap && t < m.backStart) return { A: prev, B: SH[m.id], t0: m.tap, dur: TM.explode, burst: 1, theta: spin };
      if (t >= m.backStart && t < m.phone) return { A: SH[m.id], B: SH['phone_' + m.id], t0: m.backStart, dur: TM.back, burst: 0.35, theta: 0 };
    }
    return null;
  }
  const out = { c: [0, 0, 0] };
  function updateCubes(t) {
    const job = cubeJob(t);
    cubes.visible = !!job; if (!job) return;
    const THREE = X.THREE, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), cc = new THREE.Color();
    for (let i = 0; i < NC; i++) {
      morph(job.A, job.B, t, job.t0, job.dur, job.burst, job.theta, i, out);
      const spin = out.s * 6; e3.set(spin * (h(i, 4) - 0.5), spin * (h(i, 5) - 0.5), spin * (h(i, 6) - 0.5)); q.setFromEuler(e3);
      const k = 1 - 0.25 * out.s; sc.set(k, k, k);
      let y = out.y; if (job.B === SH.dormir && t > job.t0 + 1) y += 0.06 * Math.sin((t - job.t0) * 1.6); // the moon floats
      m4.compose(v.set(out.x, y, out.z), q, sc); cubes.setMatrixAt(i, m4);
      cubes.setColorAt(i, cc.setRGB(out.c[0], out.c[1], out.c[2]));
    }
    cubes.instanceMatrix.needsUpdate = true; cubes.instanceColor.needsUpdate = true;
  }

  // ---------- notifications: they pour out of the phone; three of them bonk Locky ----------
  function updatePills(t) {
    const THREE = X.THREE, tap = MODES[0].tap, on = t < tap + 0.4;
    pills.visible = icons.visible = badges.visible = on; if (!on) return;
    const tt = te(t), shatter = clamp((t - tap) / 0.35);
    const m4 = new THREE.Matrix4(), off = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    const head = new THREE.Vector3(LP[0] - STAGE[0] - 0.1, 2.05 - STAGE[1], LP[2]);
    for (let i = 0; i < NP; i++) {
      let x, y, z, pop, rx = 0, ry = 0, rz = 0;
      if (i < 3) { // the bonkers: arc from the screen onto Locky's head, then bounce off
        const tb = ev.bonks[i], u = (tt - (tb - 0.5)) / 0.5;
        if (u < 0) { sc.set(0, 0, 0); m4.compose(v.set(0, 0, 0), q, sc); pills.setMatrixAt(i, m4); icons.setMatrixAt(i, m4); badges.setMatrixAt(i, m4); continue; }
        if (u < 1) { x = lerp(0.2, head.x, u); y = lerp(0.6, head.y, u) + Math.sin(Math.PI * u) * 0.9; z = lerp(0.3, head.z, u); }
        else { const k = u - 1; x = head.x + k * 1.4; y = head.y + k * 2.2 - k * k * 2.2; z = head.z + k * 1.2; }
        pop = clamp(u * 5); rz = u * 4; rx = u * 2;
      } else {
        const ts = 0.25 + 6.6 * Math.sqrt(h(i, 11)), age = tt - ts;
        if (age < 0) { sc.set(0, 0, 0); m4.compose(v.set(0, 0, 0), q, sc); pills.setMatrixAt(i, m4); icons.setMatrixAt(i, m4); badges.setMatrixAt(i, m4); continue; }
        const ox = (h(i, 12) - 0.5) * 1.1, oy = (h(i, 13) - 0.5) * 2.6;
        let dx = -0.6 + ox + (h(i, 14) - 0.5) * 1.8, dy = oy * 0.45 + (h(i, 15) - 0.2) * 1.4, dz = 1 + h(i, 16) * 0.8;
        const n = Math.hypot(dx, dy, dz); dx /= n; dy /= n; dz /= n;
        const dist = (2.4 + 2.2 * h(i, 17)) * (1 - Math.exp(-age * 1.1)) / 1.1 + age * 0.2;
        x = ox + dx * dist; y = oy + dy * dist; z = 0.1 + dz * dist;
        pop = ease.outBack(clamp(age / 0.18), 2);
        rx = (h(i, 19) - 0.5) * 1.2 + age * (h(i, 20) - 0.5) * 2; ry = (h(i, 21) - 0.5) * 1.4 + age * (h(i, 22) - 0.5) * 2; rz = (h(i, 23) - 0.5) * 0.8;
        if (shatter > 0) { x += dx * shatter * 3; y += dy * shatter * 3; z += dz * shatter * 3; }
      }
      pop *= 1 - shatter;
      e3.set(rx, ry, rz); q.setFromEuler(e3); sc.set(pop, pop, pop);
      m4.compose(v.set(x, y, z), q, sc); pills.setMatrixAt(i, m4);
      off.makeTranslation(-0.28, 0, 0.03); icons.setMatrixAt(i, m4.clone().multiply(off));
      off.makeTranslation(0.36, 0.09, 0.04); badges.setMatrixAt(i, m4.clone().multiply(off));
    }
    pills.instanceMatrix.needsUpdate = icons.instanceMatrix.needsUpdate = badges.instanceMatrix.needsUpdate = true;
  }

  // ---------- LOCKY, the vinyl toy ----------
  function makeLocky(THREE) {
    const vinyl = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
    const root = new THREE.Group(), body = new THREE.Group(); body.position.y = 0.98; root.add(body);
    body.add(new THREE.Mesh(new X.RoundedBoxGeometry(1.0, 1.05, 0.55, 6, 0.13), vinyl('#3F49CC')));
    const sky = vinyl('#9FD8FF');
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.085, 24, 48, Math.PI), sky); arch.position.y = 0.72; body.add(arch);
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.26, 24), sky); c.position.set(s * 0.27, 0.6, 0); body.add(c); }
    const white = vinyl('#FFFFFF', { roughness: 0.2 }), ink = vinyl('#0E0F1A');
    const eyesOpen = new THREE.Group(), eyesClosed = new THREE.Group(), eyesHappy = new THREE.Group();
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 20), white); e.scale.z = 0.38; e.position.set(s * 0.255, 0.05, 0.27); eyesOpen.add(e);
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.019, 10, 28, Math.PI), white); c.rotation.z = Math.PI; c.position.set(s * 0.255, 0.07, 0.28); eyesClosed.add(c);
      const hh = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.019, 10, 28, Math.PI), white); hh.position.set(s * 0.255, 0.02, 0.28); eyesHappy.add(hh);
    }
    body.add(eyesOpen, eyesClosed, eyesHappy);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.015, 10, 24, Math.PI), ink); smile.rotation.z = Math.PI; smile.position.set(0, -0.03, 0.28); body.add(smile);
    const arms = {};
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(s * 0.5, -0.08, 0); body.add(piv);
      const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.26, 6, 12), white); a.position.y = -0.18; piv.add(a);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 16), white); hand.position.y = -0.4; piv.add(hand);
      arms[s > 0 ? 'R' : 'L'] = { piv, hand };
    }
    const lil = vinyl('#878EE5');
    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 6, 12), lil); leg.position.set(s * 0.17, 0.27, 0); root.add(leg);
      const foot = new THREE.Mesh(new X.RoundedBoxGeometry(0.2, 0.1, 0.3, 3, 0.04), lil); foot.position.set(s * 0.17, 0.05, 0.05); root.add(foot);
    }
    return { root, body, eyesOpen, eyesClosed, eyesHappy, arms };
  }
  // where Locky is and what he does at t
  function lockyPose(t) {
    let p = [...LP], rotY = -0.45, sx = 1, sy = 1, eyes = 'open', armL = 0.15, armR = 0.15, tilt = 0;
    const beatHop = t > 2 && t < ev.musicEnd ? Math.abs(Math.sin(Math.PI * S.clock.phase(t))) * 0.05 : 0;
    p[1] += beatHop;
    for (const tb of ev.bonks) { const k = pulse(t, tb, 9); if (t >= tb) { sy -= 0.14 * k; sx += 0.08 * k; tilt += 0.18 * k; if (t - tb < 0.25) eyes = 'closed'; } }
    // a key in his hand: arm up
    for (const m of MODES) if (t >= m.cardPop && t < m.tap) { armR = lerp(0.15, 2.5, ease.outBack(clamp((t - m.cardPop) / 0.3), 2)); }
    for (const m of MODES) {
      const wind = m.jump - 0.35;
      if (t >= wind && t < m.jump) { const k = ioc2((t - wind) / 0.35); sy *= 1 - 0.18 * k; sx *= 1 + 0.08 * k; }
      if (t >= m.jump && t < m.tap) { // the jump (slow motion for the first one)
        const u = m.i === 0 ? ease.inOutQuad(clamp((t - m.jump) / (m.tap - m.jump))) : ease.outQuad(clamp((t - m.jump) / (m.tap - m.jump)));
        const J = [CONTACT[0] + 0.62, CONTACT[1] - 1.5, CONTACT[2] + 0.35];
        p = [lerp(LP[0], J[0], u), lerp(LP[1], J[1], u) + Math.sin(Math.PI * u) * 0.35, lerp(LP[2], J[2], u)];
        rotY = lerp(-0.45, -1.0, u); armR = lerp(2.5, 2.9, u); sy = 1.05; eyes = 'open';
      }
      if (t >= m.tap && t < m.tap + 0.55 && !(m.id === 'dormir')) { // fall back, land
        const u = clamp((t - m.tap) / 0.45), J = [CONTACT[0] + 0.62, CONTACT[1] - 1.5, CONTACT[2] + 0.35];
        p = [lerp(J[0], LP[0], ease.outCubic(u)), lerp(J[1], LP[1], ease.inQuad(u)) + Math.sin(Math.PI * u) * 0.3, lerp(J[2], LP[2], u)];
        armR = lerp(2.9, 0.4, u); const land = pulse(t, m.tap + 0.45, 10) * (t >= m.tap + 0.45 ? 1 : 0); sy *= 1 - 0.2 * land; sx *= 1 + 0.12 * land;
      }
    }
    const [c, g, d] = MODES;
    if (t >= c.obj - 0.2 && t < g.jump - 0.35) { eyes = 'happy'; armL = armR = 2.4 + 0.3 * Math.sin(t * 12); } // cheering at the popcorn
    if (t >= g.obj - 0.2 && t < d.jump - 0.35) { const f = Math.sin(t * 2 * Math.PI / S.BEAT); eyes = 'closed'; armL = armR = 1.6 + 0.9 * f; sy *= 1 - 0.06 * Math.abs(f); } // flexing
    if (t >= d.tap) { // up onto the moon, then sleep
      const J = [CONTACT[0] + 0.62, CONTACT[1] - 1.5, CONTACT[2] + 0.35];
      const u = ioc2(clamp((t - d.tap - 0.15) / 1.0));
      p = [lerp(J[0], SEAT[0], u), lerp(J[1], SEAT[1], u) + Math.sin(Math.PI * u) * 0.8, lerp(J[2], SEAT[2] + 0.35, u)];
      rotY = lerp(-1.0, -0.15, u); armR = lerp(2.9, 0.5, u); armL = 0.3;
      if (t > d.tap + 1.1) { eyes = 'closed'; tilt = 0.32 * ioc2(clamp((t - d.tap - 1.1) / 1.2)); sy = 1 + 0.025 * Math.sin(t * 2.2); }
      if (t > d.obj + 0.3) p[1] += 0.06 * Math.sin((t - d.tap) * 1.6); // floats with the moon
    }
    return { p, rotY, sx, sy, eyes, armL, armR, tilt };
  }
  function applyLocky(t) {
    const P = lockyPose(t);
    locky.root.position.set(...P.p); locky.root.rotation.set(0, P.rotY, P.tilt); locky.root.scale.set(P.sx, P.sy, P.sx);
    locky.eyesOpen.visible = P.eyes === 'open'; locky.eyesClosed.visible = P.eyes === 'closed'; locky.eyesHappy.visible = P.eyes === 'happy';
    locky.arms.R.piv.rotation.z = P.armR; locky.arms.L.piv.rotation.z = -P.armL;
    locky.root.updateMatrixWorld(true);
  }

  // ---------- the keys: they pop into Locky's hand, ride it, slap the phone ----------
  function updateCards(t) {
    const THREE = X.THREE, hp = new THREE.Vector3();
    locky.arms.R.hand.getWorldPosition(hp);
    for (const m of MODES) {
      const c = cards[m.id];
      c.visible = t >= m.cardPop && t < m.tap + 0.75; if (!c.visible) continue;
      const pop = ease.outBack(clamp((t - m.cardPop) / 0.3), 2.2);
      const held = [hp.x - 0.05, hp.y + 0.42, hp.z + 0.1];
      if (t < m.tap - 0.12) { c.position.set(...held); c.rotation.set(0, -0.3, 0.15 + 0.05 * Math.sin(t * 5)); c.scale.setScalar(pop * 0.85); }
      else if (t < m.tap) { const u = ease.inCubic((t - (m.tap - 0.12)) / 0.12); c.position.set(lerp(held[0], CONTACT[0], u), lerp(held[1], CONTACT[1], u), lerp(held[2], CONTACT[2], u)); c.rotation.set(0, lerp(-0.3, 0, u), lerp(0.15, -0.12, u)); c.scale.setScalar(0.85); }
      else { const k = ease.outCubic(clamp((t - m.tap) / 0.75)); c.position.set(CONTACT[0] - k * 1.8, CONTACT[1] + k * 2.0, CONTACT[2] + k * 3); c.rotation.set(k * 2.5, -k * 1.4, -0.12 - k * 1.8); }
    }
  }

  // ---------- backdrop + camera ----------
  function paintBackdrop(t) {
    let id = 'intro'; for (const m of MODES) if (t >= m.tap) id = m.id;
    const [c0, c1] = BG[id], g = backCtx.createRadialGradient(128, 200, 10, 128, 256, 300);
    g.addColorStop(0, c0); g.addColorStop(1, c1); backCtx.fillStyle = g; backCtx.fillRect(0, 0, 256, 512); backTex.needsUpdate = true;
  }
  const K = (t, ks) => U.keys(t, ks);
  function cameraAt(t) {
    const face = [LP[0] - 0.43 * 0.3, 1.0, LP[2] + 0.9 * 0.3];
    const d = MODES[2];
    const px = K(t, [[0, 0.15], [1.7, 0.3, ioc2], [2.5, 0.6, ioc2], [7.0, 0.9], [8.03, 0.5], [d.tap + 0.8, 0.6], [d.tap + 2.5, 0.1, ioc2], [19, -0.05]]);
    const py = K(t, [[0, 1.15], [1.7, 1.1], [2.5, 1.75, ioc2], [7.0, 1.8], [8.03, 1.6], [d.tap + 0.8, 1.6], [d.tap + 2.5, 1.35, ioc2], [19, 1.3]]);
    const pz = K(t, [[0, 2.6], [1.7, 2.2], [2.5, 8.6, ease.inOutQuart], [7.0, 7.9], [8.03, 8.9], [d.tap + 0.8, 8.4], [d.tap + 2.5, 8.2, ioc2], [19, 7.4]]);
    const lx = K(t, [[0, face[0]], [1.7, face[0]], [2.5, 0.15, ioc2], [d.tap + 0.8, 0.0], [d.tap + 2.5, -0.35, ioc2], [19, -0.35]]);
    const ly = K(t, [[0, face[1] + 0.1], [1.7, face[1] + 0.05], [2.5, 1.45, ioc2], [d.tap + 0.8, 1.5], [d.tap + 2.5, 2.1, ioc2], [19, 2.15]]);
    const lz = K(t, [[0, face[2]], [1.7, face[2]], [2.5, 0, ioc2]]);
    const punch = MODES.reduce((a, m) => a + pulse(t, m.tap, 6), 0);
    const shake = MODES.reduce((a, m) => a + 0.08 * pulse(t, m.tap, 9), 0) + ev.bonks.reduce((a, b) => a + 0.03 * pulse(t, b, 10), 0);
    const orbit = t > 8 && t < d.tap ? 0.18 * Math.sin((t - 8) * 0.8) : 0;
    const dz = pz - 1.2 * punch;
    camera.position.set(px + Math.sin(orbit) * dz + U.noise1(t * 9, 1) * shake, py + U.noise1(t * 9, 2) * shake, dz);
    camera.lookAt(lx, ly, lz);
  }

  function render3d(t) {
    drawScreen(screenCtx, screenState(t)); screenTex.needsUpdate = true;
    phone.visible = !cubeJob(t);
    const vib = t < MODES[0].tap ? clamp(te(t) / 6) : 0;
    phone.rotation.set(0, -0.08, 0.02 * vib * Math.sin(t * 95)); phone.position.set(0.01 * vib * Math.sin(t * 120), 0, 0);
    updateCubes(t); updatePills(t); applyLocky(t); updateCards(t);
    let rt = null, kc = '#FFFFFF';
    for (const m of MODES) if (t >= m.tap && t < m.tap + 0.5) { rt = (t - m.tap) / 0.5; kc = KEYS[m.id].bg; }
    ring.visible = rt !== null;
    if (ring.visible) { const s = 0.3 + 6 * ease.outCubic(rt); ring.scale.set(s, s, s); ring.material.opacity = 1 - rt; ring.material.color.set(kc); ring.lookAt(camera.position); }
    flash.intensity = MODES.reduce((a, m) => a + 22 * pulse(t, m.tap, 9), 0); flash.color.set(kc);
    const pa = dust.geometry.attributes.position, base = dust.userData.base;
    for (let i = 0; i < pa.count; i++) pa.setXYZ(i, base[3 * i] + Math.sin(t * 0.3 + i) * 0.2, ((base[3 * i + 1] + t * 0.12 * (0.5 + h(i, 9)) + 8) % 16) - 4, base[3 * i + 2]);
    pa.needsUpdate = true;
    paintBackdrop(t); cameraAt(t);
    { let id = 'intro'; for (const m of MODES) if (t >= m.tap) id = m.id; floor.material.color.set(BG[id][1]).lerp(new X.THREE.Color(BG[id][0]), 0.25).multiplyScalar(0.6); }
    composer.render();
  }

  // ---------- type ----------
  function slam(ctx, text, y, size, t, t0, { color = '#FFFFFF', end = Infinity, stroke = 'rgba(0,0,0,0.55)' } = {}) {
    if (t < t0 || t > end + 0.12) return;
    const a = clamp((t - t0) / 0.06) * (1 - clamp((t - end) / 0.12)), s = 1 + 0.55 * Math.exp(-(t - t0) * 22);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 - 30, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
    G.text(ctx, text, 0, 0, { size, fam: 'Inter', weight: 800, color, align: 'center', boil: 0, stroke, strokeW: size * 0.06 });
    ctx.restore();
  }
  function overlays(ctx, t) {
    const [w0, w1, w2] = ev.words, y0 = SAFE.y + 150, y1 = SAFE.y + 270;
    slam(ctx, 'ESTE ES LOCKY.', y0, 110, t, w0, { end: w1 - 0.05 });
    slam(ctx, 'SU TELÉFONO', y0, 100, t, w1, { end: w2 - 0.05 });
    slam(ctx, 'NO LO DEJA EN PAZ.', y1, 84, t, w1 + S.BEAT, { end: w2 - 0.05, color: '#FFE45C' });
    slam(ctx, 'PERO LOCKY', y0, 110, t, w2, { end: ev.slowmo - 0.05 });
    slam(ctx, 'TIENE KEYS.', y1, 110, t, w2 + S.BEAT, { end: ev.slowmo - 0.05, color: '#9FD8FF' });
    const SUB = { cine: 'SOLO LA PELI.', gym: 'SOLO TU RUTINA.', dormir: 'SOLO DORMIR.' };
    for (const m of MODES) {
      const end = m.i < 2 ? MODES[m.i + 1].tap - 0.1 : ev.musicEnd;
      slam(ctx, 'KEY ' + KEYS[m.id].name, y0 + 20, 150, t, m.tap, { end, color: KEYS[m.id].bg, stroke: 'rgba(255,255,255,0.9)' });
      slam(ctx, SUB[m.id], y1 + 20, 66, t, m.obj - 0.1, { end });
    }
    if (t >= ev.musicEnd) { // zzz above Locky's head (projected from 3D)
      const v = new X.THREE.Vector3(); locky.body.getWorldPosition(v); v.y += 0.9; v.project(camera);
      const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H;
      for (let i = 0; i < 3; i++) { const u = ((t - ev.musicEnd) * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u); G.text(ctx, 'z', sx + 170 + u * 120, sy + 60 - u * 200, { size: 60 + u * 50, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0 }); ctx.restore(); }
    }
    if (t >= ev.logo) {
      const a = UI.fadeIn(t, ev.logo, 0.6), ww = 700, hh = ww * (wordmark.height / wordmark.width);
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(wordmark, W / 2 - 30 - ww / 2, SAFE.y + 110, ww, hh); ctx.restore();
      const b = UI.fadeIn(t, ev.tagline, 0.5);
      ctx.save(); ctx.globalAlpha = b;
      G.text(ctx, 'UNA KEY PARA', W / 2 - 30, SAFE.y + 330, { size: 70, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0 });
      G.text(ctx, 'CADA MOMENTO.', W / 2 - 30, SAFE.y + 420, { size: 70, fam: 'Inter', weight: 800, color: '#9FD8FF', align: 'center', boil: 0 });
      ctx.restore();
    }
  }

  Studio.film({
    async init() {
      X = await window.THREE_READY; await L.load();
      const THREE = X.THREE;
      { const big = document.createElement('canvas'); big.width = 3168; big.height = 2448; big.getContext('2d').drawImage(L.IMG.logoW, 0, 0, 3168, 2448);
        wordmark = document.createElement('canvas'); wordmark.width = 1960; wordmark.height = 360; wordmark.getContext('2d').drawImage(big, 1060, 1060, 1960, 360, 0, 0, 1960, 360); }
      glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
      renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
      scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
      const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new X.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
      scene.add(new THREE.AmbientLight('#8890ff', 0.25));
      const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(3, 6, 6); scene.add(key);
      const rim = new THREE.DirectionalLight('#6A7BFF', 3.2); rim.position.set(-5, 3, -4); scene.add(rim);
      flash = new THREE.PointLight('#ffffff', 0, 12, 1.5); flash.position.set(CONTACT[0], CONTACT[1], 1.2); scene.add(flash);
      const bc = document.createElement('canvas'); bc.width = 256; bc.height = 512; backCtx = bc.getContext('2d');
      backTex = new THREE.CanvasTexture(bc); backTex.colorSpace = THREE.SRGBColorSpace;
      const back = new THREE.Mesh(new THREE.PlaneGeometry(46, 82), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false })); camera.add(back); back.position.set(0, 0, -30); scene.add(camera);
      // floor: glossy, fading into the backdrop
      const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fg = fc.getContext('2d'), gr = fg.createRadialGradient(128, 128, 10, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); fg.fillStyle = gr; fg.fillRect(0, 0, 256, 256);
      const fade = new THREE.CanvasTexture(fc);
      floor = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshPhysicalMaterial({ color: '#141633', roughness: 0.3, metalness: 0.1, clearcoat: 0.8, transparent: true, alphaMap: fade }));
      floor.rotation.x = -Math.PI / 2; scene.add(floor);
      const shadowMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.55, alphaMap: fade, depthWrite: false });
      const sh1 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), shadowMat); sh1.rotation.x = -Math.PI / 2; sh1.position.set(STAGE[0], 0.005, 0); scene.add(sh1);
      // stage: phone + cubes + pills + ring live in the phone's frame
      stage = new THREE.Group(); stage.position.set(...STAGE); scene.add(stage);
      phone = new THREE.Group();
      const body = new THREE.Mesh(new X.RoundedBoxGeometry(1.45, 3.0, 0.16, 6, 0.17), new THREE.MeshPhysicalMaterial({ color: '#15151C', metalness: 0.7, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }));
      const sc2 = document.createElement('canvas'); sc2.width = SCR.w; sc2.height = SCR.h; screenCanvas = sc2; screenCtx = sc2.getContext('2d');
      screenTex = new THREE.CanvasTexture(sc2); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCR.pw, SCR.ph), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false })); screen.position.z = 0.0815;
      phone.add(body, screen); stage.add(phone);
      cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.058, 0.058), new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0 }), NC);
      cubes.setColorAt(0, new THREE.Color('#fff')); cubes.frustumCulled = false; stage.add(cubes);
      pills = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.86, 0.22, 0.05, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: '#D9DCEA', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }), NP);
      icons = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.15, 0.15, 0.04, 2, 0.04), new THREE.MeshStandardMaterial({ roughness: 0.3 }), NP);
      badges = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: '#FF2D3B', emissive: '#FF1020', emissiveIntensity: 0.6, roughness: 0.3 }), NP);
      const APPC = ['#FF3B5C', '#25D366', '#1DA1F2', '#FF0050', '#FFB000', '#7B61FF', '#00C2FF', '#E1306C'];
      for (let i = 0; i < NP; i++) icons.setColorAt(i, new THREE.Color(APPC[i % APPC.length]));
      for (const m of [pills, icons, badges]) { m.frustumCulled = false; stage.add(m); }
      locky = makeLocky(THREE); scene.add(locky.root);
      for (const m of MODES) {
        const k = KEYS[m.id], g = new THREE.Group();
        const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 646; const cx = cv.getContext('2d'); cx.translate(512, 323); L.key(cx, k, 0, 0, 1000, {});
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        g.add(new THREE.Mesh(new X.RoundedBoxGeometry(1.3, 0.82, 0.03, 3, 0.012), new THREE.MeshPhysicalMaterial({ color: k.bg, roughness: 0.25, clearcoat: 1 })));
        const face = new THREE.Mesh(new THREE.PlaneGeometry(1.33, 0.86), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3 })); face.position.z = 0.0165; g.add(face);
        g.visible = false; scene.add(g); cards[m.id] = g;
      }
      ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 96), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      ring.position.set(...CONTACT); scene.add(ring);
      { const n = 360, pos = new Float32Array(n * 3), r = U.mulberry32(77); for (let i = 0; i < n * 3; i += 3) { pos[i] = (r() - 0.5) * 12; pos[i + 1] = (r() - 0.5) * 16; pos[i + 2] = -6 + r() * 9; }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
        dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#cfd6ff', size: 0.03, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); dust.userData.base = pos; scene.add(dust); }
      const snap = (st) => { drawScreen(screenCtx, st); return screenCtx.getImageData(0, 0, SCR.w, SCR.h); };
      SH.phone_chaos = shapePhone(snap(screenState(MODES[0].tap - 0.001)));
      for (const m of MODES) SH['phone_' + m.id] = shapePhone(snap({ kind: 'mode', id: m.id, t0: m.backStart, t: m.phone }));
      SH.cine = shapePopcorn(); SH.gym = shapeDumbbell(); SH.dormir = shapeMoon();
      composer = new X.EffectComposer(renderer); composer.addPass(new X.RenderPass(scene, camera));
      composer.addPass(new X.UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.3, 0.45, 0.92)); composer.addPass(new X.OutputPass());
    },
    draw(ctx, t) {
      render3d(t);
      ctx.drawImage(glCanvas, 0, 0, W, H);
      let ab = 0; for (const m of MODES) ab += pulse(t, m.tap, 14);
      if (ab > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * ab; ctx.drawImage(glCanvas, -14 * ab, 0, W, H); ctx.drawImage(glCanvas, 14 * ab, 0, W, H); ctx.restore(); }
      if (t >= ev.slowmo && t < MODES[0].tap) { ctx.fillStyle = `rgba(30,50,120,${0.2 * clamp((t - ev.slowmo) / 0.2)})`; ctx.fillRect(0, 0, W, H); }
      if (t >= MODES[2].tap + 1.2) { ctx.fillStyle = `rgba(5,5,30,${0.3 * clamp((t - MODES[2].tap - 1.2) / 2)})`; ctx.fillRect(0, 0, W, H); } // lights down for sleep
      const fl = MODES.reduce((a, m) => a + (t >= m.tap ? 0.7 * Math.exp(-(t - m.tap) * 16) : 0), 0);
      if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; ctx.fillRect(0, 0, W, H); }
      overlays(ctx, t);
    },
    post: { paper: 0, vignette: 0.3, grain: 0.035 },
    fadeOut: 0.8,
  });
})();
