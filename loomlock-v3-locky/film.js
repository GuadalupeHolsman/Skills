// LOOMLOCK — "LOCKY" v3: the official Locky (Brandbook §4) as a 3D toy with a toon outline, fully rigged
// (squash & stretch, blinks, expressions, a walk cycle, a shackle that pops open and CLICKS shut), in the
// brand's blue studio. Built from film.tpl.js + the shared cube/shape code of ../loomlock-v3-hero by build.py.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.LOOM, BR = globalThis.BRAND, P = BR.P;
  const { ev, MODES, PH: TM, T } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const NC = 4200, NP = 70;
  const SCR = { w: 600, h: 1300, pw: 1.33, ph: 2.88 };
  const STAGE = [-0.6, 1.6, 0];                 // the phone's centre once it has landed
  const LP = [0.95, 0, 0.45];                   // Locky's mark
  const CONTACT = [STAGE[0] + 0.32, STAGE[1] + 0.92, 0.25];
  const SEAT = [STAGE[0] + 0.37, STAGE[1] - 0.62, 0.15]; // the hollow of the moon

  let X, renderer, composer, scene, camera, glCanvas, wordmark, stage, locky, floor, backMesh;
  let phone, screenCanvas, screenCtx, screenTex, cubes, pills, icons, badges, ring, flash, dust, dropRing;
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
  const te = (t) => (t < ev.slowmo ? t : ev.slowmo + (t - ev.slowmo) * 0.12);
  function screenState(t) {
    if (t < MODES[0].tap) { const tt = Math.min(te(t), ev.slowmo + 0.2); return { kind: 'chaos', n: 1 + Math.max(0, tt - ev.drop) * 2.4, t: tt, shake: clamp((tt - ev.drop) / 4) }; }
    let m = MODES[0]; for (const mm of MODES) if (t >= mm.tap) m = mm;
    return { kind: 'mode', id: m.id, t0: m.backStart, t };
  }
  function drawScreen(ctx, st) {
    const k = SCR.w / UI.PHONE_W, ph = SCR.h / k;
    ctx.save(); ctx.clearRect(0, 0, SCR.w, SCR.h);
    ctx.beginPath(); ctx.roundRect(0, 0, SCR.w, SCR.h, 74); ctx.clip(); ctx.scale(k, k);
    if (st.kind === 'chaos') L.chaosScreen(ctx, UI.PHONE_W, ph, st.t, st.n, { shake: st.shake });
    else BR.appScreen(ctx, UI.PHONE_W, ph, st.t, st.id, st.t0);
    UI.text(ctx, '9:41', 34, 40, { size: 17, weight: 700, color: st.kind === 'chaos' ? '#FFFFFF' : P.navy });
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
      if (m.id === 'dormir' && t >= m.tap) return { A: prev, B: SH.dormir, t0: m.tap, dur: TM.explode, burst: 1, theta: 0 };
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
      let y = out.y; if (job.B === SH.dormir && t > job.t0 + 1) y += 0.06 * Math.sin((t - job.t0) * 1.6);
      m4.compose(v.set(out.x, y, out.z), q, sc); cubes.setMatrixAt(i, m4);
      cubes.setColorAt(i, cc.setRGB(out.c[0], out.c[1], out.c[2]));
    }
    cubes.instanceMatrix.needsUpdate = true; cubes.instanceColor.needsUpdate = true;
  }

  // ---------- notifications (after the phone lands); three of them bonk Locky ----------
  function updatePills(t) {
    const THREE = X.THREE, tap = MODES[0].tap, on = t > ev.drop && t < tap + 0.4;
    pills.visible = icons.visible = badges.visible = on; if (!on) return;
    const tt = te(t), shatter = clamp((t - tap) / 0.35);
    const m4 = new THREE.Matrix4(), off = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    const head = new THREE.Vector3(LP[0] - STAGE[0] - 0.05, 2.0 - STAGE[1], LP[2]);
    const hide = (i) => { sc.set(0, 0, 0); m4.compose(v.set(0, 0, 0), q, sc); pills.setMatrixAt(i, m4); icons.setMatrixAt(i, m4); badges.setMatrixAt(i, m4); };
    for (let i = 0; i < NP; i++) {
      let x, y, z, pop, rx = 0, ry = 0, rz = 0;
      if (i < 3) {
        const tb = ev.bonks[i], u = (tt - (tb - 0.5)) / 0.5;
        if (u < 0) { hide(i); continue; }
        if (u < 1) { x = lerp(0.2, head.x, u); y = lerp(0.6, head.y, u) + Math.sin(Math.PI * u) * 0.9; z = lerp(0.3, head.z, u); }
        else { const k = u - 1; x = head.x + k * 1.4; y = head.y + k * 2.2 - k * k * 2.2; z = head.z + k * 1.2; }
        pop = clamp(u * 5); rz = u * 4; rx = u * 2;
      } else {
        const ts = ev.drop + 0.2 + 4.6 * Math.sqrt(h(i, 11)), age = tt - ts;
        if (age < 0) { hide(i); continue; }
        const ox = (h(i, 12) - 0.5) * 1.1, oy = (h(i, 13) - 0.5) * 2.6;
        let dx = -0.8 + ox + (h(i, 14) - 0.5) * 1.6, dy = oy * 0.45 + (h(i, 15) - 0.2) * 1.4, dz = 1 + h(i, 16) * 0.8;
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

  // ===================== LOCKY =====================
  // toon outline: an inverted hull, scaled per axis so the line keeps ~constant width
  function hull(THREE, mesh, o = 0.022) {
    mesh.geometry.computeBoundingBox(); const b = mesh.geometry.boundingBox, sz = new THREE.Vector3(); b.getSize(sz);
    const m = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: '#05061A', side: THREE.BackSide }));
    m.scale.set((sz.x + 2 * o) / Math.max(sz.x, 1e-3), (sz.y + 2 * o) / Math.max(sz.y, 1e-3), (sz.z + 2 * o) / Math.max(sz.z, 1e-3));
    mesh.add(m); return m;
  }
  function makeLocky(THREE) {
    const vinyl = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.25, ...o });
    const add = (parent, geo, mat, pos, outline = 0.022) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); parent.add(m); if (outline) hull(THREE, m, outline); return m; };
    const root = new THREE.Group();
    // legs: navy socks + lilac boots (pivots at the hips so they can walk)
    const legs = {};
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(s * 0.19, 0.44, 0); root.add(piv);
      add(piv, new THREE.CapsuleGeometry(0.075, 0.2, 6, 14), vinyl(P.ink), [0, -0.16, 0]);
      add(piv, new X.RoundedBoxGeometry(0.2, 0.15, 0.3, 3, 0.06), vinyl(P.lilac), [0, -0.36, 0.05]);
      legs[s > 0 ? 'R' : 'L'] = piv;
    }
    // body: navy box + a brighter front plate, like the 2D Locky (front 3B5CFF, side 141C62)
    const hips = new THREE.Group(); hips.position.y = 0.44; root.add(hips);
    const body = new THREE.Group(); hips.add(body);
    add(body, new X.RoundedBoxGeometry(1.0, 1.08, 0.62, 6, 0.1), vinyl(P.ink), [0, 0.54, 0], 0.028);
    add(body, new X.RoundedBoxGeometry(0.96, 1.04, 0.06, 6, 0.03), vinyl(P.locky, { roughness: 0.35 }), [0, 0.54, 0.29], 0);
    // shackle: a fat rounded light-blue arch; it opens around its left leg
    const shOuter = new THREE.Group(); shOuter.position.set(-0.24, 1.08, 0); body.add(shOuter);
    const shackle = new THREE.Group(); shackle.position.set(0.24, 0, 0); shOuter.add(shackle);
    const sky = vinyl(P.sky, { roughness: 0.3 });
    add(shackle, new THREE.TorusGeometry(0.24, 0.095, 24, 48, Math.PI), sky, [0, 0.2, 0], 0.024);
    for (const s of [-1, 1]) add(shackle, new THREE.CylinderGeometry(0.095, 0.095, 0.46, 24), sky, [s * 0.24, -0.02, 0], 0.024);
    // face
    const face = new THREE.Group(); face.position.set(0, 0.6, 0.33); body.add(face);
    const white = vinyl('#FFFFFF', { roughness: 0.25 }), ink = new THREE.MeshBasicMaterial({ color: '#05061A' });
    const eyes = new THREE.Group(); face.add(eyes);
    const eyeL = add(eyes, new THREE.SphereGeometry(0.115, 32, 20), white, [-0.25, 0.04, 0], 0.02); eyeL.scale.z = 0.32;
    const eyeR = add(eyes, new THREE.SphereGeometry(0.115, 32, 20), white, [0.25, 0.04, 0], 0.02); eyeR.scale.z = 0.32;
    const arcs = (up) => { const g = new THREE.Group(); for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 10, 28, Math.PI), ink); a.position.set(s * 0.25, up ? 0.0 : 0.07, 0.03); if (!up) a.rotation.z = Math.PI; g.add(a); } face.add(g); return g; };
    const eyesHappy = arcs(true), eyesClosed = arcs(false);
    // mouth: a pink open smile with an ink rim (or a small "o")
    const mShape = new THREE.Shape(); mShape.moveTo(-0.075, 0); mShape.absarc(0, 0, 0.075, Math.PI, 2 * Math.PI, false); mShape.lineTo(-0.075, 0);
    const smile = new THREE.Group(); smile.position.set(0, -0.08, 0.02); face.add(smile);
    const lip = new THREE.Mesh(new THREE.ShapeGeometry(mShape), ink); lip.scale.setScalar(1.3); lip.position.z = -0.004; smile.add(lip);
    smile.add(new THREE.Mesh(new THREE.ShapeGeometry(mShape), new THREE.MeshBasicMaterial({ color: P.pink })));
    const oMouth = new THREE.Group(); oMouth.position.set(0, -0.1, 0.02); face.add(oMouth);
    oMouth.add(new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), ink)); const oIn = new THREE.Mesh(new THREE.CircleGeometry(0.042, 24), new THREE.MeshBasicMaterial({ color: '#E86AB4' })); oIn.position.z = 0.002; oMouth.add(oIn);
    // arms: white noodles with round hands
    const arms = {};
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(s * 0.5, 0.48, 0.02); body.add(piv);
      const arm = add(piv, new THREE.CapsuleGeometry(0.045, 0.28, 6, 12), white, [0, -0.19, 0], 0.02);
      const hand = add(piv, new THREE.SphereGeometry(0.105, 24, 16), white, [0, -0.42, 0], 0.02);
      arms[s > 0 ? 'R' : 'L'] = { piv, hand };
    }
    return { root, hips, body, legs, shOuter, shackle, eyes, eyesHappy, eyesClosed, smile, oMouth, arms };
  }

  // ---------- Locky's acting: a pure function of t ----------
  function lockyPose(t) {
    const p = { x: LP[0], y: 0, z: LP[2], rotY: -0.45, lean: 0, sq: 0, legL: 0, legR: 0, armL: 0.15, armR: 0.15, armLx: 0, armRx: 0, eyes: 'open', eyeS: 1, mouth: 'smile', open: 0 };
    const [d0, d1] = [MODES[0], MODES[2]];
    // walk in (four steps on the beats), then wave
    if (t < ev.walk[1]) {
      const u = clamp((t - ev.walk[0]) / (ev.walk[1] - ev.walk[0])), ph = u * 4 * Math.PI;
      p.x = lerp(-2.9, LP[0], ease.outQuad(u)); p.rotY = 0.6; p.legL = 0.5 * Math.sin(ph); p.legR = -0.5 * Math.sin(ph);
      p.y = 0.05 * Math.abs(Math.sin(ph)); p.armL = 0.25 + 0.2 * Math.sin(ph); p.armR = 0.25 - 0.2 * Math.sin(ph); p.lean = -0.06; p.eyes = 'happy';
    } else if (t < ev.drop) {
      const u = (t - ev.wave); p.rotY = lerp(0.6, 0.05, ease.outBack(clamp(u / 0.4), 1.5)); p.eyes = 'happy';
      p.armR = 2.6 + 0.35 * Math.sin(u * 16); p.lean = 0.05 * Math.sin(u * 8); p.sq = -0.05 * pulse(t, ev.wave, 8);
    }
    // the phone lands: startle — hop, eyes wide, shackle pops open (and stays open while it buzzes)
    if (t >= ev.drop && t < ev.click) {
      const k = pulse(t, ev.startle, 6);
      p.y += 0.35 * Math.max(0, Math.sin(Math.PI * clamp((t - ev.startle) / 0.32)));
      p.rotY = lerp(0.05, -0.55, ease.outCubic(clamp((t - ev.startle) / 0.3))); p.eyes = 'open'; p.eyeS = 1.3 - 0.25 * clamp((t - ev.startle - 0.5) / 0.5);
      p.mouth = 'o'; p.armL = p.armR = 1.1 * k + 0.35; p.sq = 0.12 * k;
      p.open = ease.outBack(clamp((t - ev.startle) / 0.25), 2.5);
      for (const tb of ev.bonks) if (t >= tb) { const b = pulse(t, tb, 9); p.sq -= 0.2 * b; p.lean += 0.22 * b; if (t - tb < 0.22) p.eyes = 'closed'; }
      // the sigh: a big inhale (stretch, arms out) and a long exhale (shoulders drop)
      if (t >= ev.sighIn) {
        const inh = ioc2(clamp((t - ev.sighIn) / 0.55)), exh = ioc2(clamp((t - ev.sighOut) / 0.5));
        p.sq = 0.1 * inh - 0.16 * exh; p.armL = p.armR = 0.35 + 0.6 * inh - 0.5 * exh; p.eyes = t > ev.sighIn + 0.3 ? 'closed' : 'open'; p.mouth = exh > 0.1 ? 'o' : 'smile';
        p.rotY = lerp(-0.55, 0.0, inh); p.eyeS = 1;
      }
    }
    // the decision: CLICK. Then a key pops into his hand and he shows it to us.
    if (t >= ev.click && t < d0.jump) {
      p.rotY = 0.0; p.open = 1 - ease.inCubic(clamp((t - ev.click + 0.12) / 0.12));
      p.sq = 0.14 * pulse(t, ev.click, 10) * (t >= ev.click ? 1 : 0) - 0.03; p.eyes = t < ev.click + 0.15 ? 'closed' : 'happy'; p.mouth = 'smile';
      if (t >= ev.cardPop) { p.armR = lerp(0.2, 2.35, ease.outBack(clamp((t - ev.cardPop) / 0.3), 2)); p.eyes = 'open'; p.rotY = -0.2; }
    }
    // jumps + slaps (anticipation crouch, stretch on take-off, squash on landing)
    for (const m of MODES) {
      const wind = m.jump - 0.35, J = [CONTACT[0] + 0.62, CONTACT[1] - 1.52, CONTACT[2] + 0.35];
      if (t >= m.cardPop && t < m.jump && m.i > 0) { p.armR = lerp(0.2, 2.35, ease.outBack(clamp((t - m.cardPop) / 0.3), 2)); }
      if (t >= wind && t < m.jump) { const k = ioc2((t - wind) / 0.35); p.sq = -0.22 * k; p.rotY = lerp(p.rotY, -0.8, k); p.eyes = 'open'; p.eyeS = 0.75; p.mouth = 'smile'; }
      if (t >= m.jump && t < m.tap) {
        const u = m.i === 0 ? ease.inOutQuad(clamp((t - m.jump) / (m.tap - m.jump))) : ease.outQuad(clamp((t - m.jump) / (m.tap - m.jump)));
        p.x = lerp(LP[0], J[0], u); p.y = lerp(0, J[1], u) + Math.sin(Math.PI * u) * 0.35; p.z = lerp(LP[2], J[2], u);
        p.rotY = lerp(-0.8, -1.05, u); p.armR = 2.9; p.armL = 1.2; p.sq = 0.16 * Math.sin(Math.PI * clamp(u * 1.6)); p.legL = 0.5; p.legR = -0.3; p.eyes = 'open'; p.eyeS = 0.8; p.mouth = 'o';
      }
      if (t >= m.tap && t < m.tap + 0.55 && m.id !== 'dormir') {
        const u = clamp((t - m.tap) / 0.45);
        p.x = lerp(J[0], LP[0], ease.outCubic(u)); p.y = lerp(J[1], 0, ease.inQuad(u)) + Math.sin(Math.PI * u) * 0.3; p.z = lerp(J[2], LP[2], u);
        p.rotY = lerp(-1.05, -0.3, u); p.armR = lerp(2.9, 0.4, u);
        const land = t >= m.tap + 0.45 ? pulse(t, m.tap + 0.45, 10) : 0; p.sq = -0.25 * land; p.eyes = 'happy';
      }
    }
    const [c, g] = [MODES[0], MODES[1]];
    if (t >= c.tap + 0.55 && t < g.jump - 0.35) { // popcorn: a happy bounce, then a munch
      const b = Math.abs(Math.sin(Math.PI * S.clock.phase(t))); p.y = 0.09 * b; p.sq = 0.06 * b - 0.03; p.eyes = 'happy'; p.armL = p.armR = 2.2 + 0.3 * Math.sin(t * 12); p.rotY = -0.3;
      if (t > c.obj + 0.6 && t < c.obj + 1.0) { p.mouth = 'o'; p.armR = 1.4; p.eyes = 'closed'; }
    }
    if (t >= g.tap + 0.55 && t < MODES[2].jump - 0.35) { // gym: flexing on every beat
      const f = Math.sin(2 * Math.PI * S.clock.phase(t)); p.eyes = 'closed'; p.armL = p.armR = 1.7 + 0.8 * f; p.sq = -0.08 * Math.abs(f); p.mouth = 'smile'; p.rotY = -0.2;
    }
    if (t >= d1.tap) { // yawn, hop onto the moon, curl up and sleep
      const J = [CONTACT[0] + 0.62, CONTACT[1] - 1.52, CONTACT[2] + 0.35], u = ioc2(clamp((t - d1.tap - 0.15) / 1.0));
      p.x = lerp(J[0], SEAT[0], u); p.y = lerp(J[1], SEAT[1], u) + Math.sin(Math.PI * u) * 0.8; p.z = lerp(J[2], SEAT[2] + 0.35, u);
      p.rotY = lerp(-1.05, -0.12, u); p.armR = lerp(2.9, 0.5, u); p.armL = 0.3; p.eyes = 'open'; p.mouth = 'smile';
      const yw = clamp((t - ev.yawn) / 0.9);
      if (yw > 0 && yw < 1) { p.mouth = 'o'; p.eyes = 'closed'; p.sq = 0.12 * Math.sin(Math.PI * yw); p.armL = p.armR = 1.6 * Math.sin(Math.PI * yw) + 0.3; }
      if (t > ev.yawn + 0.9) { p.eyes = 'closed'; p.lean = 0.28 * ioc2(clamp((t - ev.yawn - 0.9) / 1.2)); p.sq = 0.025 * Math.sin(t * 2.2); p.mouth = 'smile'; }
      if (t > d1.obj + 0.3) p.y += 0.06 * Math.sin((t - d1.tap) * 1.6);
    }
    // blinks (only while the eyes are open)
    if (p.eyes === 'open') { const bt = (t + 0.7) % 2.6; if (bt < 0.12) p.eyeS *= Math.max(0.12, Math.abs(bt - 0.06) / 0.06); }
    return p;
  }
  function applyLocky(t) {
    const p = lockyPose(t), L2 = locky;
    L2.root.position.set(p.x, p.y, p.z); L2.root.rotation.set(0, p.rotY, 0);
    const sy = 1 + p.sq, sxz = 1 / Math.sqrt(Math.max(0.5, sy)); // volume-preserving squash & stretch
    L2.hips.scale.set(sxz, sy, sxz); L2.hips.rotation.z = p.lean;
    L2.legs.L.rotation.x = p.legL; L2.legs.R.rotation.x = p.legR;
    L2.arms.R.piv.rotation.z = p.armR; L2.arms.L.piv.rotation.z = -p.armL;
    L2.eyes.visible = p.eyes === 'open'; L2.eyes.scale.set(p.eyeS > 1 ? p.eyeS : 1, p.eyeS, 1);
    L2.eyesHappy.visible = p.eyes === 'happy'; L2.eyesClosed.visible = p.eyes === 'closed';
    L2.smile.visible = p.mouth === 'smile'; L2.oMouth.visible = p.mouth === 'o';
    // the shackle: lifts and swings open around its left leg; a little lag-bounce on every squash
    L2.shackle.position.y = 0.19 * p.open; L2.shOuter.rotation.y = -1.25 * p.open; L2.shOuter.position.y = 1.08 - 0.03 * p.sq;
    L2.root.updateMatrixWorld(true);
  }

  // ---------- keys: pop into Locky's hand, ride it, slap the phone ----------
  function updateCards(t) {
    const THREE = X.THREE, hp = new THREE.Vector3();
    locky.arms.R.hand.getWorldPosition(hp);
    for (const m of MODES) {
      const c = cards[m.id];
      c.visible = t >= m.cardPop && t < m.tap + 0.75; if (!c.visible) continue;
      const pop = ease.outBack(clamp((t - m.cardPop) / 0.3), 2.2), held = [hp.x - 0.05, hp.y + 0.42, hp.z + 0.12];
      if (t < m.tap - 0.12) { c.position.set(...held); c.rotation.set(0, -0.3, 0.15 + 0.05 * Math.sin(t * 5)); c.scale.setScalar(pop * 0.85); }
      else if (t < m.tap) { const u = ease.inCubic((t - (m.tap - 0.12)) / 0.12); c.position.set(lerp(held[0], CONTACT[0], u), lerp(held[1], CONTACT[1], u), lerp(held[2], CONTACT[2], u)); c.rotation.set(0, lerp(-0.3, 0, u), lerp(0.15, -0.12, u)); c.scale.setScalar(0.85); }
      else { const k = ease.outCubic(clamp((t - m.tap) / 0.75)); c.position.set(CONTACT[0] - k * 1.8, CONTACT[1] + k * 2.0, CONTACT[2] + k * 3); c.rotation.set(k * 2.5, -k * 1.4, -0.12 - k * 1.8); }
    }
  }

  // ---------- the phone: drops from the sky onto its spot ----------
  function phoneDrop(t) {
    const u = clamp((t - (ev.drop - 0.42)) / 0.42), land = pulse(t, ev.drop, 9) * (t >= ev.drop ? 1 : 0);
    stage.position.set(STAGE[0], STAGE[1] + (1 - ease.inQuad(u)) * 7, STAGE[2]);
    stage.scale.set(1 + 0.06 * land, 1 - 0.08 * land, 1);
    stage.visible = t > ev.drop - 0.42;
    const r = clamp((t - ev.drop) / 0.6); dropRing.visible = t >= ev.drop && r < 1;
    if (dropRing.visible) { const s = 0.5 + 3.2 * ease.outCubic(r); dropRing.scale.set(s, s, s); dropRing.material.opacity = 0.7 * (1 - r); }
  }

  // ---------- camera ----------
  const K = (t, ks) => U.keys(t, ks);
  function cameraAt(t) {
    const d = MODES[2];
    const px = K(t, [[0, -0.6], [ev.walk[1], 0.55, ioc2], [ev.drop, 0.4], [ev.drop + 0.8, 0.4], [7.0, 0.8], [8.03, 0.4], [d.tap + 0.8, 0.5], [d.tap + 2.5, 0.05, ioc2], [19, -0.05]]);
    const py = K(t, [[0, 1.2], [ev.walk[1], 1.15], [ev.drop - 0.3, 1.2, ioc2], [ev.drop + 0.6, 1.75, ioc2], [7.0, 1.8], [8.03, 1.6], [d.tap + 0.8, 1.6], [d.tap + 2.5, 1.5, ioc2], [19, 1.5]]);
    const pz = K(t, [[0, 6.2], [ev.walk[1], 4.9, ioc2], [ev.drop - 0.3, 4.2], [ev.drop + 0.6, 8.4, ease.inOutQuart], [ev.click, 7.4, ioc2], [ev.cardPop + 0.4, 6.6, ioc2], [7.0, 7.6], [8.03, 8.9], [d.tap + 0.8, 8.4], [d.tap + 2.5, 9.2, ioc2], [19, 8.7]]);
    const lx = K(t, [[0, -0.4], [ev.walk[1], LP[0], ioc2], [ev.drop + 0.6, 0.15, ioc2], [ev.click, 0.45, ioc2], [ev.cardPop + 0.4, 0.6, ioc2], [7.0, 0.2], [d.tap + 0.8, 0.0], [d.tap + 2.5, -0.3, ioc2], [19, -0.3]]);
    const ly = K(t, [[0, 1.25], [ev.walk[1], 1.3], [ev.drop + 0.6, 1.45, ioc2], [ev.click, 1.1, ioc2], [ev.cardPop + 0.4, 1.15], [7.0, 1.45], [d.tap + 0.8, 1.5], [d.tap + 2.5, 2.45, ioc2], [19, 2.55]]);
    const punch = MODES.reduce((a, m) => a + pulse(t, m.tap, 6), 0) * 0.9;
    const shake = MODES.reduce((a, m) => a + 0.05 * pulse(t, m.tap, 9), 0) + 0.12 * (t >= ev.drop ? pulse(t, ev.drop, 8) : 0) + ev.bonks.reduce((a, b) => a + 0.025 * pulse(t, b, 10), 0);
    camera.position.set(px + U.noise1(t * 9, 1) * shake, py + U.noise1(t * 9, 2) * shake, pz - punch);
    camera.lookAt(lx, ly, 0);
  }

  const backTexs = {};
  function render3d(t) {
    drawScreen(screenCtx, screenState(t)); screenTex.needsUpdate = true;
    phone.visible = !cubeJob(t);
    const vib = t < MODES[0].tap && t > ev.drop ? clamp(te(t - ev.drop) / 4) : 0;
    phone.rotation.set(0, -0.08, 0.02 * vib * Math.sin(t * 95)); phone.position.set(0.01 * vib * Math.sin(t * 120), 0, 0);
    phoneDrop(t); updateCubes(t); updatePills(t); applyLocky(t); updateCards(t);
    let rt = null, kc = '#FFFFFF';
    for (const m of MODES) if (t >= m.tap && t < m.tap + 0.5) { rt = (t - m.tap) / 0.5; kc = BR.KEY[m.id].accent; }
    ring.visible = rt !== null;
    if (ring.visible) { const s = 0.3 + 6 * ease.outCubic(rt); ring.scale.set(s, s, s); ring.material.opacity = 1 - rt; ring.material.color.set(kc); ring.lookAt(camera.position); }
    flash.intensity = MODES.reduce((a, m) => a + 18 * pulse(t, m.tap, 9), 0); flash.color.set(kc);
    const pa = dust.geometry.attributes.position, base = dust.userData.base;
    for (let i = 0; i < pa.count; i++) pa.setXYZ(i, base[3 * i] + Math.sin(t * 0.3 + i) * 0.2, ((base[3 * i + 1] + t * 0.12 * (0.5 + h(i, 9)) + 8) % 16) - 4, base[3 * i + 2]);
    pa.needsUpdate = true;
    let id = 'studio'; if (t >= ev.drop) id = 'chaos'; for (const m of MODES) if (t >= m.tap) id = m.id;
    if (!backTexs[id]) { backTexs[id] = new X.THREE.CanvasTexture(BR.backdrop(id)); backTexs[id].colorSpace = X.THREE.SRGBColorSpace; }
    backMesh.material.map = backTexs[id];
    floor.material.color.set(id === 'dormir' || id === 'chaos' ? '#0D1450' : P.navy);
    cameraAt(t);
    composer.render();
  }

  // ---------- brand type ----------
  function say(ctx, str, y, size, t, t0, { color = P.white, end = Infinity } = {}) {
    if (t < t0 || t > end + 0.2) return;
    const a = clamp((t - t0) / 0.16) * (1 - clamp((t - end) / 0.2)), u = ease.outBack(clamp((t - t0) / 0.35), 1.4);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 - 30, y + (1 - u) * 26); ctx.shadowColor = 'rgba(10,14,60,0.7)'; ctx.shadowBlur = 30;
    BR.text(ctx, str, 0, 0, { size, weight: 800, color, align: 'center', maxW: SAFE.w - 40 }); ctx.restore();
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
    { const g = ctx.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(18,28,102,0.62)'); g.addColorStop(0.55, 'rgba(18,28,102,0.3)'); g.addColorStop(1, 'rgba(18,28,102,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 820); }
    const y0 = SAFE.y + 140, y1 = SAFE.y + 260;
    say(ctx, 'Él es Locky.', y0, 104, t, ev.hello, { end: ev.drop - 0.08 });
    say(ctx, 'Su teléfono', y0, 100, t, ev.drop + 0.15, { end: ev.sighIn - 0.1 });
    say(ctx, 'no le da respiro.', y1, 92, t, ev.bonks[0], { end: ev.sighIn - 0.1, color: P.yellow });
    tag(ctx, 'Locky no lo apaga.', SAFE.y + 100, t, ev.sighIn + 0.2, { end: ev.slowmo - 0.1 });
    say(ctx, 'Le da un', SAFE.y + 235, 96, t, ev.click, { end: ev.slowmo - 0.1 });
    say(ctx, 'solo trabajo.', SAFE.y + 345, 96, t, ev.click + 0.25, { end: ev.slowmo - 0.1, color: P.lav });
    for (const m of MODES) {
      const end = m.i < 2 ? MODES[m.i + 1].tap - 0.12 : ev.musicEnd - 0.1, k = BR.KEY[m.id];
      tag(ctx, 'KEY ' + k.name, SAFE.y + 100, t, m.tap, { end, italic: false, size: 42, dot: k.accent });
      say(ctx, k.line, SAFE.y + 250, 108, t, m.obj - 0.15, { end });
    }
    if (t >= ev.musicEnd) { // zzz above Locky's head (projected from 3D), in Baloo
      const v = new X.THREE.Vector3(); locky.body.getWorldPosition(v); v.y += 1.0; v.project(camera);
      const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H;
      for (let i = 0; i < 3; i++) { const u = ((t - ev.musicEnd) * 0.6 + i / 3) % 1; BR.text(ctx, 'z', sx + 150 + u * 110, sy + 40 - u * 190, { size: 56 + u * 40, weight: 800, fam: 'Baloo Bhaina 2', color: P.white, align: 'center', alpha: Math.sin(Math.PI * u) }); }
    }
    if (t >= ev.logo) {
      const a = UI.fadeIn(t, ev.logo, 0.6), ww = 560, hh = ww * (wordmark.height / wordmark.width);
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(wordmark, W / 2 - 30 - ww / 2, SAFE.y + 100, ww, hh); ctx.restore();
      say(ctx, 'Una key para', SAFE.y + 320, 84, t, ev.tagline);
      say(ctx, 'cada momento.', SAFE.y + 420, 84, t, ev.tagline + 0.3, { color: P.lav });
      tag(ctx, 'Tomate una pausa.', SAFE.y + 540, t, ev.tagline + 0.9, { bg: P.yellow, fg: P.navy });
    }
    ctx.save(); BR.sparkles(ctx, W, H, t, { n: 12, seed: 4, alpha: 0.7, top: 0.3, bottom: 0.8 }); ctx.restore();
  }

  Studio.film({
    async init() {
      X = await window.THREE_READY; await L.load(); await BR.loadFonts();
      const THREE = X.THREE;
      { const big = document.createElement('canvas'); big.width = 3168; big.height = 2448; big.getContext('2d').drawImage(L.IMG.logoW, 0, 0, 3168, 2448);
        wordmark = document.createElement('canvas'); wordmark.width = 1960; wordmark.height = 360; wordmark.getContext('2d').drawImage(big, 1060, 1060, 1960, 360, 0, 0, 1960, 360); }
      glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
      renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
      scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
      const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new X.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
      scene.add(new THREE.HemisphereLight('#C0C8FF', '#121B95', 0.6));
      const key = new THREE.DirectionalLight('#ffffff', 1.7); key.position.set(3, 6, 6); scene.add(key);
      const rim = new THREE.DirectionalLight('#9FD8FF', 2.2); rim.position.set(-5, 3, -4); scene.add(rim);
      flash = new THREE.PointLight('#ffffff', 0, 12, 1.5); flash.position.set(CONTACT[0], CONTACT[1], 1.2); scene.add(flash);
      backMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.9, 19.3), new THREE.MeshBasicMaterial({ toneMapped: false })); camera.add(backMesh); backMesh.position.set(0, 0, -30); scene.add(camera);
      // floor: a glossy brand-blue stage fading into the backdrop
      const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fg = fc.getContext('2d'), gr = fg.createRadialGradient(128, 128, 10, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); fg.fillStyle = gr; fg.fillRect(0, 0, 256, 256);
      const fade = new THREE.CanvasTexture(fc);
      floor = new THREE.Mesh(new THREE.CircleGeometry(6.5, 64), new THREE.MeshPhysicalMaterial({ color: P.royal, roughness: 0.55, clearcoat: 0.3, envMapIntensity: 0.25, transparent: true, alphaMap: fade }));
      floor.rotation.x = -Math.PI / 2; scene.add(floor);
      const shadowMat = new THREE.MeshBasicMaterial({ color: '#05061A', transparent: true, opacity: 0.45, alphaMap: fade, depthWrite: false });
      const sh1 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.9), shadowMat); sh1.rotation.x = -Math.PI / 2; sh1.position.set(STAGE[0], 0.006, 0); scene.add(sh1);
      dropRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 64), new THREE.MeshBasicMaterial({ color: P.lav, transparent: true, depthWrite: false })); dropRing.rotation.x = -Math.PI / 2; dropRing.position.set(STAGE[0], 0.01, 0); scene.add(dropRing);
      stage = new THREE.Group(); stage.position.set(...STAGE); scene.add(stage);
      phone = new THREE.Group();
      const body = new THREE.Mesh(new X.RoundedBoxGeometry(1.45, 3.0, 0.16, 6, 0.17), new THREE.MeshPhysicalMaterial({ color: '#15151C', metalness: 0.7, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }));
      const sc2 = document.createElement('canvas'); sc2.width = SCR.w; sc2.height = SCR.h; screenCanvas = sc2; screenCtx = sc2.getContext('2d');
      screenTex = new THREE.CanvasTexture(sc2); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCR.pw, SCR.ph), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false })); screen.position.z = 0.0815;
      phone.add(body, screen); stage.add(phone);
      cubes = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.062, 0.062, 0.062, 2, 0.018), new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0 }), NC);
      cubes.setColorAt(0, new THREE.Color('#fff')); cubes.frustumCulled = false; stage.add(cubes);
      pills = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.86, 0.22, 0.05, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: '#E8EAFF', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }), NP);
      icons = new THREE.InstancedMesh(new X.RoundedBoxGeometry(0.15, 0.15, 0.04, 2, 0.04), new THREE.MeshStandardMaterial({ roughness: 0.3 }), NP);
      badges = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: '#FF2D3B', emissive: '#FF1020', emissiveIntensity: 0.6, roughness: 0.3 }), NP);
      const APPC = [P.red, P.green, P.locky, P.yellow, P.magenta, P.sky, P.coral, P.violet];
      for (let i = 0; i < NP; i++) icons.setColorAt(i, new THREE.Color(APPC[i % APPC.length]));
      for (const m of [pills, icons, badges]) { m.frustumCulled = false; stage.add(m); }
      locky = makeLocky(THREE); scene.add(locky.root);
      for (const m of MODES) {
        const g = new THREE.Group();
        const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 646; const cx = cv.getContext('2d'); cx.translate(512, 323); BR.keyCard(cx, m.id, 1000);
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        g.add(new THREE.Mesh(new X.RoundedBoxGeometry(1.3, 0.82, 0.03, 3, 0.012), new THREE.MeshPhysicalMaterial({ color: P.royal, roughness: 0.25, clearcoat: 1 })));
        const face = new THREE.Mesh(new THREE.PlaneGeometry(1.33, 0.86), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3 })); face.position.z = 0.0165; g.add(face);
        g.visible = false; scene.add(g); cards[m.id] = g;
      }
      ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 96), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      ring.position.set(...CONTACT); scene.add(ring);
      { const n = 300, pos = new Float32Array(n * 3), r = U.mulberry32(77); for (let i = 0; i < n * 3; i += 3) { pos[i] = (r() - 0.5) * 12; pos[i + 1] = (r() - 0.5) * 16; pos[i + 2] = -6 + r() * 9; }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
        dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#cfd6ff', size: 0.03, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); dust.userData.base = pos; scene.add(dust); }
      const snap = (st) => { drawScreen(screenCtx, st); return screenCtx.getImageData(0, 0, SCR.w, SCR.h); };
      SH.phone_chaos = shapePhone(snap(screenState(MODES[0].tap - 0.001)));
      for (const m of MODES) SH['phone_' + m.id] = shapePhone(snap({ kind: 'mode', id: m.id, t0: m.backStart, t: m.phone }));
      SH.cine = shapePopcorn(); SH.gym = shapeDumbbell(); SH.dormir = shapeMoon();
      composer = new X.EffectComposer(renderer); composer.addPass(new X.RenderPass(scene, camera));
      composer.addPass(new X.UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.28, 0.45, 0.93)); composer.addPass(new X.OutputPass());
    },
    draw(ctx, t) {
      render3d(t);
      ctx.drawImage(glCanvas, 0, 0, W, H);
      if (t >= ev.slowmo && t < MODES[0].tap) { ctx.fillStyle = `rgba(18,28,102,${0.25 * clamp((t - ev.slowmo) / 0.2)})`; ctx.fillRect(0, 0, W, H); }
      if (t >= MODES[2].tap + 1.2) { ctx.fillStyle = `rgba(5,8,40,${0.28 * clamp((t - MODES[2].tap - 1.2) / 2)})`; ctx.fillRect(0, 0, W, H); }
      const fl = MODES.reduce((a, m) => a + (t >= m.tap ? 0.3 * Math.exp(-(t - m.tap) * 16) : 0), 0);
      if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; ctx.fillRect(0, 0, W, H); }
      overlays(ctx, t);
    },
    post: { paper: 0, vignette: 0.24, grain: 0.03 },
    fadeOut: 0.8,
  });
})();
