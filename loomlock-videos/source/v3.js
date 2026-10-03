// VIDEO 3 — "Phygitals" card spot. 9:16, 120 BPM (1 beat = 0.5s), 32s.
const T3 = {
  es: {
    a: ['NO ES', 'SOLO', 'UNA', 'TARJETA.'], kick: 'PHYGITALS · by loomlock',
    c: ['ARTE', 'QUE', 'COLECCIONAS.'], d: ['CADA KEY,', 'UNA OBRA.'], dc: ['Season 0', 'Artist Keys', 'Ediciones especiales'],
    e1: 'TOCA.', e2: 'Y SILENCIO.', e3: ['KEYS', 'QUE USAS.'], calm: 'Distracciones bloqueadas',
    f: ['COLECCIONA.', 'TOCA.', 'VIVE.'], end: 'Construye un mejor día.',
  },
  en: {
    a: ["IT'S NOT", 'JUST', 'A', 'CARD.'], kick: 'PHYGITALS · by loomlock',
    c: ['ART', 'YOU', 'COLLECT.'], d: ['EVERY KEY,', 'A ARTWORK.'], dc: ['Season 0', 'Artist Keys', 'Special editions'],
    e1: 'TAP.', e2: 'AND SILENCE.', e3: ['KEYS', 'YOU USE.'], calm: 'Distractions blocked',
    f: ['COLLECT.', 'TAP.', 'LIVE.'], end: 'Build a better day.',
  }
}[LANG];
T3.d[1] = LANG === 'en' ? 'AN ARTWORK.' : T3.d[1];

const VIDEO = (() => {
  const st = document.getElementById('stage');
  const cam = add(st, `<div class="layer"></div>`);           // camera layer (shake)
  const bgc = add(cam, `<div class="layer" style="background:#050505"></div>`);
  const scene = () => add(cam, `<div class="layer"></div>`);
  const world = (p, persp = 1400) => add(p, `<div class="world" style="perspective:${persp}px;perspective-origin:50% 50%"></div>`);
  const ARTS = ['card_yb_wall.jpg', 'card_p_boat.jpg', 'card_yb_faces.jpg', 'card_p_butterfly.jpg', 'card_yb_ufo.jpg', 'card_p_dragonfly.jpg', 'card_yb_devils.jpg', 'card_p_red.jpg'];
  const BG = ['#FF5A36', '#00C2B8', '#FFD400', '#F2F0EA', '#FF6FB5', '#7B2CFF', '#2F5BFF', '#00D1A0'];
  const INK = ['#2a0a03', '#00302e', '#2a2200', '#0E2440', '#3a0020', '#ffffff', '#ffffff', '#00382b'];
  const CAT = Array.from({ length: 24 }, (_, i) => `cat_f_${i}.jpg`);
  ARTS.concat(CAT).forEach(a => PRELOAD.push(A + a));
  const big = (txt, size, extra = '') => `<div style="font:900 ${size}px/0.9 Montserrat;letter-spacing:-.04em;text-transform:uppercase;${extra}">${txt}</div>`;
  // slam: snaps in big → settles; flies out at tout
  function slam(el, t, t0, tout = 99, from = 1.9) {
    const p = E.out5(prog(t, t0, t0 + .16)), q = E.in(prog(t, tout, tout + .25));
    el.style.opacity = t < t0 ? 0 : 1 - q;
    el.style.transform = `scale(${lerp(from, 1, p) + q * 1.5})`;
    el.style.filter = q > 0 ? `blur(${q * 14}px)` : 'none';
  }
  const flash = add(st, `<div class="flash"></div>`);
  const grain = add(st, `<div class="grain" style="opacity:.09"></div>`);

  // ---------- A: macro ----------
  const sA = scene(), wA = world(sA, 1100);
  const cA = makeCard(wA, 'card_yb_faces.jpg', '#111');
  const shineA = add(cA.root.querySelector('.face'), `<div class="abs" style="inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%);background-size:300% 100%;mix-blend-mode:overlay"></div>`);
  const wordsA = T3.a.map((w, i) => add(sA, `<div class="abs" style="left:0;right:0;top:${i % 2 ? 1380 : 260}px;text-align:center;color:${i === 3 ? 'var(--yellow)' : '#fff'};text-shadow:0 12px 50px rgba(0,0,0,.8)">${big(w, i === 3 ? 200 : 260)}</div>`));

  // ---------- B: flip rush ----------
  const sB = scene();
  const bgB = add(sB, `<div class="layer"></div>`);
  const rows = Array.from({ length: 7 }, (_, i) => add(bgB, `<div class="abs" style="left:-1200px;top:${-80 + i * 300}px;white-space:nowrap;transform-origin:1740px 50%">${big(('PHYGITALS ✦ ').repeat(8), 230, i % 2 ? 'color:transparent;-webkit-text-stroke:4px currentColor' : '')}</div>`));
  const wB = world(sB, 1600);
  const cB = makeCard(wB, ARTS[0], '#111');
  const imgB = cB.root.querySelector('.face img');
  const kB = add(sB, `<div class="abs" style="left:0;right:0;top:150px;text-align:center"><span class="chip" style="font-size:30px;background:rgba(0,0,0,.25)"><span class="dot"></span>${T3.kick}</span></div>`);
  const numB = add(sB, `<div class="abs" style="left:0;right:0;top:1440px;text-align:center">${big('01', 260)}</div>`);

  // ---------- C: portal tunnel ----------
  const sC = scene();
  const bgC = add(sC, `<div class="layer"><img src="${A}${ARTS[7]}" style="width:100%;height:100%;object-fit:cover;filter:blur(26px) saturate(1.4) brightness(.45);transform:scale(1.2)"></div>`);
  const wC = world(sC, 900);
  const TUN = 30;
  const tun = Array.from({ length: TUN }, (_, i) => add(wC, `<div class="obj" style="width:420px;height:265px;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5)"><img src="${A}${i % 4 === 0 ? ARTS[(i / 4) % 8] : CAT[i % 24]}" style="width:100%;height:100%;object-fit:cover"></div>`));
  const wordsC = T3.c.map((w, i) => add(sC, `<div class="abs" style="left:0;right:0;top:${640 + i * 230}px;text-align:center;${i === 2 ? 'color:var(--yellow)' : ''}">${big(w, i === 2 ? 128 : 230)}</div>`));

  // ---------- D: iso mosaic ----------
  const sD = scene();
  add(sD, `<div class="layer" style="background:radial-gradient(90% 60% at 50% 40%,#3F4ACD,#141C80 70%,#070A33)"></div>`);
  const wD = world(sD, 2400);
  const COLS = 7, ROWS = 12, CW = 330, CH = 208, G = 26;
  const plane = add(wD, `<div class="obj" style="width:${COLS * (CW + G)}px;height:${ROWS * (CH + G)}px"></div>`);
  const tiles = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c, src = (i * 7) % 5 === 0 ? ARTS[i % 8] : CAT[(i * 5) % 24];
    tiles.push(add(plane, `<div class="abs" style="left:${c * (CW + G)}px;top:${r * (CH + G)}px;width:${CW}px;height:${CH}px;border-radius:18px;overflow:hidden;box-shadow:0 8px 0 rgba(0,0,30,.35)"><img src="${A}${src}" style="width:100%;height:100%;object-fit:cover"></div>`));
  }
  const wordsD = T3.d.map((w, i) => add(sD, `<div class="abs" style="left:0;right:0;top:${1380 + i * 190}px;text-align:center;${i ? 'color:var(--yellow)' : ''};text-shadow:0 10px 40px rgba(0,0,40,.6)">${big(w, 170)}</div>`));
  const chipsD = T3.dc.map((c, i) => add(sD, `<div class="abs" style="left:0;right:0;top:${170 + i * 96}px;text-align:center"><span class="chip" style="font-size:32px;background:rgba(10,14,70,.6)"><span class="dot"></span>${c}</span></div>`));

  // ---------- E: the tap ----------
  const sE = scene();
  add(sE, `<div class="layer" style="background:radial-gradient(70% 45% at 50% 62%,#2b36c9 0%,#0c1160 55%,#03041a 100%)"></div>`);
  const wE = world(sE, 1600);
  const ph = makePhone(wE);
  const home = add(ph.screen, SCREENS.home());
  const icE = [...home.querySelectorAll('.hgrid > div')];
  const calm = add(ph.screen, `<div class="abs center" style="inset:0;flex-direction:column;gap:18px;opacity:0;background:radial-gradient(80% 60% at 50% 45%,#3f47cf,#141a6e)">${LOCK('#fff', 90)}<div style="font:700 22px Montserrat">${T3.calm}</div><img src="${A}logo_icon.png" style="height:40px;margin-top:30px;opacity:.8"></div>`);
  const cE = makeCard(wE, 'card_yb_ufo.jpg', '#2b2b2b');
  const ringsE = [0, 1, 2, 3].map(() => add(wE, `<div class="nfc" style="width:400px;height:400px;border-width:6px;border-color:rgba(245,230,0,.9)"></div>`));
  const e1 = add(sE, `<div class="abs" style="left:0;right:0;top:110px;text-align:center;color:var(--yellow)">${big(T3.e1, 260)}</div>`);
  const e2 = add(sE, `<div class="abs" style="left:0;right:0;top:350px;text-align:center">${big(T3.e2, 150)}</div>`);
  const e3 = T3.e3.map((w, i) => add(sE, `<div class="abs" style="left:0;right:0;top:${120 + i * 210}px;text-align:center;${i ? 'color:var(--yellow)' : ''}">${big(w, i ? 170 : 230)}</div>`));
  const ICV = icE.map((_, i) => { const a = i * 2.39996, s = 900 + (i * 137) % 700; return { x: Math.cos(a) * s, y: Math.sin(a) * s - 300, r: (i * 97) % 720 - 360 }; });

  // ---------- F: fan ----------
  const sF = scene();
  const bgF = add(sF, `<div class="layer"></div>`);
  const wF = world(sF, 1800);
  const fan = ARTS.map((a, i) => makeCard(wF, a, BG[i]));
  const wordsF = T3.f.map((w, i) => add(sF, `<div class="abs" style="left:0;right:0;top:250px;text-align:center">${big(w, w.length > 8 ? 160 : 230)}</div>`));

  // ---------- G: end ----------
  const sG = scene();
  add(sG, `<div class="bg"></div>`);
  const wG = world(sG, 1600);
  const orb = ARTS.map((a, i) => makeCard(wG, a, BG[i]));
  const endG = add(sG, `<div class="abs center" style="inset:0;flex-direction:column;text-align:center">
     <div class="r"><img src="${A}logo_full.png" style="height:170px"></div>
     <div class="r" style="margin-top:34px;color:var(--yellow);text-shadow:0 10px 40px rgba(0,0,40,.7)">${big('PHYGITALS', 150, 'letter-spacing:.02em')}</div>
     <div class="r" style="font:600 44px Montserrat;margin-top:30px">${T3.end}</div>
     <div class="r" style="font:600 34px Montserrat;margin-top:14px;opacity:.85">loomlock.com</div></div>`);

  const SC = [[sA, 0, 4.05], [sB, 4, 10.05], [sC, 10, 14.05], [sD, 14, 19.05], [sE, 19, 25.05], [sF, 25, 29.05], [sG, 29, 32]];
  const beat = (t) => Math.floor(t * 2), bph = (t) => (t * 2) % 1; // beat index & phase

  async function render(t) {
    SC.forEach(([s, a, b]) => { const on = t >= a && t < b; s.style.display = on ? '' : 'none'; });
    // camera shake on impacts
    const sh = Math.max(0, 1 - (t - 21) * 2.2) * (t >= 21 ? 1 : 0) + Math.max(0, 1 - (t - 10) * 4) * (t >= 10 ? .5 : 0) + Math.max(0, 1 - (t - 30) * 3) * (t >= 30 ? .4 : 0);
    cam.style.transform = sh > 0 ? `translate(${Math.sin(t * 91) * 26 * sh}px,${Math.cos(t * 77) * 26 * sh}px) rotate(${Math.sin(t * 53) * 1.2 * sh}deg)` : '';
    flash.style.opacity = Math.max(0, .9 - Math.abs(t - 21) * 9) + Math.max(0, .7 - Math.abs(t - 10) * 7) + Math.max(0, .6 - Math.abs(t - 14) * 6) + Math.max(0, .5 - Math.abs(t - 29) * 5);

    if (t < 4.05) { // A
      const z = E.io(prog(t, 0, 3.9));
      const spin = E.io(prog(t, 3.0, 3.85)) * 360;
      cA.set({ x: 540, y: 960, s: lerp(3.4, 1.35, z), rx: lerp(18, 0, z), ry: lerp(-38, 0, z) + spin, rz: lerp(-14, 0, z) });
      shineA.style.backgroundPosition = `${lerp(120, -40, prog(t, .2, 3))}% 0`;
      wordsA.forEach((w, i) => slam(w, t, 1 + i * .5, i < 2 ? 2.0 + i * .5 : 3.5));
    }
    if (t >= 4 && t < 10.05) { // B
      const k = beat(t - 4), ph = bph(t - 4), i = k % 8;
      bgB.style.background = BG[i]; bgB.style.color = INK[i];
      rows.forEach((r, j) => r.style.transform = `rotate(-12deg) translateX(${(j % 2 ? 1 : -1) * ((t - 4) * 260 % 1100)}px)`);
      if (imgB.dataset.k != i) { imgB.dataset.k = i; imgB.src = A + ARTS[i]; await imgB.decode().catch(() => { }); }
      const f = E.back(clamp(ph / .45));
      const zoom = E.in(prog(t, 9.5, 10.0));
      cB.set({ x: 540, y: 960, s: 1.4 * (1 + .1 * (1 - E.out(clamp(ph / .3)))) + zoom * 14, ry: (1 - f) * -95 * (k % 2 ? -1 : 1), rx: 8 * Math.sin(t * 2), rz: (k % 2 ? 5 : -5) * (1 - zoom) });
      numB.style.display = 'none';
      kB.style.opacity = 1 - zoom;
    }
    if (t >= 10 && t < 14.05) { // C
      const lt = t - 10;
      tun.forEach((e, i) => {
        const span = 5200, z = ((lt * 2300 + i * (span / TUN)) % span) - 4400;
        const a = i * 2.39996 + lt * .4, R = 520 + (i % 3) * 120;
        const op = clamp((z + 4400) / 900) * clamp((900 - z) / 300);
        e.style.transform = `translate3d(${540 - 210 + Math.cos(a) * R}px,${960 - 132 + Math.sin(a) * R * 1.3}px,${z}px) rotateZ(${a * 30}deg) rotateY(${Math.sin(a) * 30}deg)`;
        e.style.opacity = op;
      });
      bgC.style.transform = `scale(${1 + lt * .05}) rotate(${lt * 2}deg)`;
      wordsC.forEach((w, i) => slam(w, t, 10.5 + i * .5, 13.5));
    }
    if (t >= 14 && t < 19.05) { // D
      const lt = t - 14, rise = E.in(prog(t, 18.4, 19.0));
      const pw = COLS * (CW + G), phh = ROWS * (CH + G);
      plane.style.transform = `translate(${540 - pw / 2}px,${960 - phh / 2}px) rotateX(${58 - rise * 30}deg) rotateZ(${-38 + lt * 3}deg) translateY(${-((lt * 120) % (CH + G)) + 100}px) scale(${1 + rise * 1.2})`;
      const k = beat(lt), ph = bph(lt);
      tiles.forEach((tl, i) => {
        const hit = (i * 37 + k * 11) % tiles.length < 3;
        const lift = hit ? Math.sin(Math.PI * clamp(ph / .9)) : 0;
        tl.style.transform = `translateZ(${lift * 140}px) scale(${1 + lift * .08})`;
        tl.style.boxShadow = `0 ${8 + lift * 60}px ${lift * 40}px rgba(0,0,30,${.35 + lift * .2})`;
        tl.style.zIndex = hit ? 2 : 1;
      });
      wordsD.forEach((w, i) => slam(w, t, 14.5 + i * .5, 18.5));
      chipsD.forEach((c, i) => { const p = E.back(prog(t, 15.5 + i * .5, 16.0 + i * .5)); c.style.opacity = prog(t, 15.5 + i * .5, 15.7 + i * .5) * (1 - rise); c.style.transform = `translateX(${(1 - p) * (i % 2 ? 600 : -600)}px)`; });
    }
    if (t >= 19 && t < 25.05) { // E
      const pin = E.out(prog(t, 19, 19.9));
      const P = { x: 540, y: 1300, s: 1.0 };
      ph.set({ x: P.x, y: P.y + (1 - pin) * 900, s: P.s, rx: 10, ry: Math.sin(t * .8) * 6, shO: .6 });
      const topY = P.y - 436 * P.s;
      const hov = E.out(prog(t, 19.2, 20.0)), drop = E.in(prog(t, 20.55, 21.0)), rec = E.out(prog(t, 21.0, 21.9));
      const ky = lerp(lerp(-400, 560, hov), topY + 10, drop) - rec * 230;
      cE.set({ x: 540 + Math.sin(t * 3) * 20 * (1 - drop), y: ky, s: .9 - rec * .1, rx: lerp(12, 62, drop) - rec * 30, ry: Math.sin(t * 2) * 14 * (1 - drop), rz: lerp(-10, 0, drop) + rec * 4, z: 120 });
      ringsE.forEach((r, i) => { const a = 21 + i * .14, q = prog(t, a, a + .9); css(r, { left: (540 - 200) + 'px', top: (topY - 200) + 'px', opacity: q > 0 && q < 1 ? 1 - q : 0, transform: `translateZ(130px) scale(${.3 + q * 3.4}) rotateX(62deg)` }); });
      icE.forEach((ic, i) => { const q = E.out(prog(t, 21.0, 21.9)), v = ICV[i]; ic.style.transform = `translate(${v.x * q}px,${v.y * q}px) rotate(${v.r * q}deg) scale(${1 + q})`; ic.style.opacity = 1 - prog(t, 21.3, 21.8); });
      calm.style.opacity = prog(t, 21.2, 21.8);
      slam(e1, t, 21.0, 22.9); slam(e2, t, 22.0, 22.9);
      e3.forEach((w, i) => slam(w, t, 23.0 + i * .5, 24.75));
    }
    if (t >= 25 && t < 29.05) { // F
      const lt = t - 25, k = beat(lt), ph = bph(lt), i = k % 8;
      bgF.style.background = BG[(i + 3) % 8];
      const col = (i + 3) % 8 === 5 || (i + 3) % 8 === 6 ? '#fff' : INK[(i + 3) % 8];
      const close = E.in(prog(t, 28.4, 29.0));
      fan.forEach((c, j) => {
        const o = E.back(prog(t, 25 + j * .07, 25.7 + j * .07));
        const ang = (j - 3.5) * 12.5 * o * (1 - close);
        const wave = E.io(clamp((lt - 2 - j * .09) / .6)) * 360;
        const rad = ang * Math.PI / 180, R = 470 * (1 - close * .7), px = 540, py = 1440 - close * 200;
        c.set({ x: px + Math.sin(rad) * R, y: py - Math.cos(rad) * R + (1 - o) * 1100, s: .9 * (1 - close * .4), rz: ang, ry: wave, rx: 0, z: j * 6 });
        c.root.style.transformOrigin = '50% 50%';
      });
      wordsF.forEach((w, j) => { w.style.color = col; slam(w, t, 25.5 + j, 26.45 + j); if (j === 2) slam(w, t, 27.5, 28.8); });
    }
    if (t >= 29) { // G
      const lt = t - 29;
      orb.forEach((c, j) => { const a = j / 8 * Math.PI * 2 + lt * .8; c.set({ x: 540 + Math.cos(a) * 520, y: 960 + Math.sin(a) * 760, z: Math.sin(a) * 300 - 600, s: .5, ry: a * 57 + 90, rx: 10 }); });
      endG.querySelectorAll('.r').forEach((e, i) => { const q = E.out5(prog(t, 29.5 + i * .5, 29.7 + i * .5)); e.style.opacity = q; e.style.transform = `scale(${lerp(1.6, 1, q)})`; });
    }
  }
  return { duration: 32, render };
})();
