// VIDEO 5 — "How to use loomlock Experiences" 9:16 EN, bold restyle with the Locky totem
const T2 = {
  en: {
    introK: 'Quick guide', intro: 'How to join a<br><em>loomlock Experience</em>', introS: '6 simple steps',
    steps: [
      ['Download loomlock', 'Open the app and tap <b>Explore loomlock experiences</b>. No account or loomlock product needed.'],
      ['Allow Screen Time access', 'loomlock only sees the <b>name</b> of your app group. Never your apps, never your stats.'],
      ['Set up emergency contacts', 'Keep calls and must-have apps available: <b>Settings › Screen Time › Always Allowed</b>. Then confirm.'],
      ['Prepare your app group', "Follow the organizer's instructions to choose which apps stay open. <b>Do it before the event</b> and entry is faster."],
      ['Tap Locky at the entrance', 'Tap <b>Scan experience key</b> and hold the top of your iPhone to Locky’s <b>TAP HERE</b> zone.'],
      ['Enjoy the moment', 'Your allowed apps stay open, everything else is blocked. When it’s over, tap <b>End experience</b>.'],
    ],
    chip2a: 'Sees: your group name only', chip2b: "Can't see: your apps or stats", chip4: 'Tip: set it up the day before', chip5: 'No totem? Tap your loomlock card key', chip6: 'Emergency exit is always available',
    out: 'Be there.<br><em>Really there.</em>', step: 'Step',
  },
  es: {
    introK: 'Guía rápida', intro: 'Cómo unirte a una<br><em>Experiencia loomlock</em>', introS: '6 pasos sencillos',
    steps: [
      ['Descarga loomlock', 'Abre la app y toca <b>Explora experiencias loomlock</b>. Sin cuenta ni producto loomlock.'],
      ['Permite Tiempo de uso', 'loomlock solo ve el <b>nombre</b> de tu app group. Nunca tus apps ni tus estadísticas.'],
      ['Contactos de emergencia', 'Mantén llamadas y apps imprescindibles: <b>Ajustes › Tiempo de uso › Siempre permitido</b>. Luego confirma.'],
      ['Prepara tu app group', 'Sigue las instrucciones del organizador para elegir qué apps siguen abiertas. <b>Hazlo antes del evento</b> y entrarás más rápido.'],
      ['Escanea la key', 'En el evento, toca <b>Escanear key de experiencia</b> y acerca la parte superior de tu iPhone a la key.'],
      ['Disfruta el momento', 'Tus apps permitidas siguen abiertas, el resto se bloquea. Al terminar, toca <b>Finalizar experiencia</b>.'],
    ],
    chip2a: 'Ve: solo el nombre del grupo', chip2b: 'No ve: tus apps ni estadísticas', chip4: 'Consejo: prepáralo el día antes', chip5: 'Acerca la parte superior del iPhone', chip6: 'La salida de emergencia siempre está disponible',
    out: 'Estar ahí.<br><em>De verdad.</em>', step: 'Paso',
  }
}[LANG];

const VIDEO = (() => {
  const st = document.getElementById('stage');
  const bg = makeBG(st);
  const STEPC = ['#3F49CC', '#7037CA', '#0C77B7', '#5713C0', '#1D29C2', '#2F8CC3'];
  const tint = add(st, `<div class="layer" style="mix-blend-mode:normal"></div>`);
  const ROB = 'Roboto';
  const scene = () => add(st, `<div class="layer"></div>`);

  // ---- intro
  const sI = scene();
  add(sI, `<div class="layer" style="background:radial-gradient(80% 55% at 50% 70%,#2a35c8,#0c1160 60%,#03041a)"></div>`);
  const totI = makeTotem(sI, 600);
  const ringsI = [0, 1, 2].map(() => add(sI, `<div class="nfc" style="width:300px;height:300px"></div>`));
  const ctrI = (top, html) => add(sI, `<div class="abs" style="left:40px;right:40px;top:${top}px;text-align:center">${html}</div>`);
  const hI = [ctrI(150, BIG('PHONE-FREE', 150)), ctrI(300, BIG('EVENT', 190)), ctrI(480, BIG('TONIGHT?', 190, 'color:var(--yellow)'))];
  const hI2 = ctrI(280, BIG("HERE'S HOW.", 170, 'color:var(--yellow)', 'Baloo Bhaina 2', 800));
  const hI3 = ctrI(470, `<span class="chip" style="font-size:36px"><span class="dot"></span>6 simple steps</span>`);
  // ---- steps: phone + text
  const sP = scene(), w = add(sP, `<div class="world"></div>`);
  const ph = makePhone(w);
  const scr = {}; for (const k of ['welcome', 'expIntro', 'screenTime', 'emergency', 'finished', 'dash', 'session']) scr[k] = add(ph.screen, SCREENS[k]());
  const tap = makeTap(ph.screen);
  const tot = makeTotem(sP, 520); sP.insertBefore(tot.el, w);
  const rings = [0, 1, 2, 3].map(() => add(sP, `<div class="nfc" style="width:300px;height:300px;border-color:rgba(245,230,0,.95);border-width:6px"></div>`));
  // element centers inside the 390x844 screen (layout coordinates)
  const rel = (el) => { let x = 0, y = 0, e = el; while (e && e !== ph.screen) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 }; };
  const box = (el, pad = 6, r = 18) => { const b = rel(el); return hl(ph.screen, b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2, r); };
  const q = (k, sel) => scr[k].querySelector(sel);
  let B, hlCan, hlCant, hlPath, hlGroup, hlDetails, hlEnd;
  const init = () => {
  B = {
    explore: rel(scr.welcome.querySelectorAll('.btn')[1]), start: rel(q('expIntro', '.btn')), allow: rel(q('screenTime', '.btn')),
    confirmSetup: rel(q('emergency', '.btn.solid')), scan: rel(q('dash', '.scanbtn')),
  };
  hlCan = box(scr.screenTime.children[2], 4), hlCant = box(scr.screenTime.children[3], 4);
  hlPath = box(q('emergency', '.ecpath'), 10, 10), hlGroup = box(q('dash', '.groupcard'), 5);
  hlDetails = box(scr.session.children[2], 5), hlEnd = box(q('session', '.endbtn'), 6, 28);
  };
  const sheet = q('emergency', '.sheet'), dim = q('dash', '.dim'), nfcSheet = q('dash', '.nfcsheet'), nfcPhone = q('dash', '.nfcphone'), nfcCheck = q('dash', '.nfccheck');
  // confirm button inside the sheet: sheet is translated, so compute from its resting position
  const cfm = q('emergency', '.cfm');

  const textStyle = H ? 'left:140px;top:250px;width:760px;text-align:left' : 'left:70px;right:70px;top:150px;text-align:center';
  const steps = T2.steps.map((s, i) => add(sP, `<div class="abs" style="left:60px;right:60px;top:125px;text-align:center">
      <div class="num" style="display:flex;align-items:baseline;justify-content:center;gap:16px">${BIG('0' + (i + 1), 210, 'color:var(--yellow)', 'Baloo Bhaina 2', 800)}<span class="kicker" style="font-size:30px">Step ${i + 1}/6</span></div>
      <div class="r">${BIG(s[0], s[0].length > 20 ? 76 : 88)}</div>
      <div class="r" style="font:400 40px/1.32 '${ROB}';margin-top:22px;color:rgba(255,255,255,.92)">${s[1]}</div></div>`));
  const wipe = add(st, `<div class="abs" style="left:0;top:0;width:1500px;height:946px;border-radius:70px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.5);display:none"><img style="width:100%;height:100%;object-fit:cover"></div>`);
  const wipeImg = wipe.firstChild;
  const WA = ['card_yb_ufo.jpg', 'card_p_boat.jpg', 'card_yb_wall.jpg', 'card_p_dragonfly.jpg', 'card_yb_faces.jpg', 'card_p_butterfly.jpg', 'card_yb_devils.jpg'];
  WA.forEach(x => PRELOAD.push(A + x));
  const chipV = (txt, cls, i) => add(sP, `<div class="abs" style="${H ? `left:140px;top:${790 + i * 84}px` : `left:0;right:0;top:1800px;text-align:center`}"><span class="chip ${cls}" style="font-size:${H ? 26 : 30}px"><span class="dot"></span>${txt}</span></div>`);
  const c2a = chipV(T2.chip2a, 'ok', 0), c2b = chipV(T2.chip2b, 'no', H ? 1 : 0), c4 = chipV(T2.chip4, '', 0), c5 = chipV(T2.chip5, '', 0), c6 = chipV(T2.chip6, 'ok', 0);
  if (!H) c2b.style.top = '1800px', c2a.style.top = '1800px';
  const progress = add(sP, `<div class="progress" style="${H ? 'left:140px;top:150px' : 'left:0;right:0;top:46px;justify-content:center'}">${'<i><b></b></i>'.repeat(6)}</div>`);
  const bars = [...progress.querySelectorAll('b')];

  // ---- outro
  const sO = scene();
  add(sO, `<div class="bg"></div>`);
  const wO = add(sO, `<div class="world" style="perspective:1800px;perspective-origin:50% 50%"></div>`);
  const FAN = ['card_yb_wall.jpg', 'card_p_boat.jpg', 'card_yb_faces.jpg', 'card_p_butterfly.jpg', 'card_yb_ufo.jpg', 'card_p_dragonfly.jpg', 'card_yb_devils.jpg', 'card_p_red.jpg'];
  const fan = FAN.map(f => makeCard(wO, f, '#3F49CC'));
  const totO = makeTotem(sO, 360);
  const outro = add(sO, `<div class="abs" style="left:40px;right:40px;top:170px;text-align:center">
    <div class="r">${BIG('BE THERE.', 190)}</div><div class="r">${BIG('REALLY THERE.', 140, 'color:var(--yellow)')}</div>
    <div class="r" style="margin-top:46px"><img src="${A}logo_full.png" style="height:130px"></div>
    <div class="r" style="font:600 36px Montserrat;margin-top:16px;opacity:.85">loomlock.com</div></div>`);
  const SW = [[4.0, 11.2], [11.0, 18.2], [18.0, 25.2], [25.0, 32.2], [32.0, 41.2], [41.0, 47.2]];
  const SCR = [['welcome', 3.8, 7.3], ['expIntro', 7.3, 11.3], ['screenTime', 11.3, 18.3], ['emergency', 18.3, 25.3], ['finished', 25.3, 28.0], ['dash', 28.0, 37.6], ['session', 37.6, 48]];
  let TAPS;
  const TAPS_ = () => [[6.6, B.explore], [10.2, B.start], [17.4, B.allow], [22.4, B.confirmSetup], [24.3, null], [33.0, B.scan]];
  const P = H ? { x: 1380, y: 555, s: .98 } : { x: 540, y: 1235, s: 1.08 };

  async function render(t) {
    if (!B) { init(); TAPS = TAPS_(); }
    bg.update(t);
    sI.style.opacity = win(t, 0, 4.2, .01, .4); sI.style.display = t < 4.2 ? '' : 'none';
    tint.style.display = t > 3.8 && t < 47.6 ? '' : 'none'; tint.style.opacity = win(t, 3.8, 47.6, .5, .5);
    sP.style.opacity = win(t, 3.8, 47.6, .5, .5); sP.style.display = t > 3.8 && t < 47.6 ? '' : 'none';
    sO.style.opacity = win(t, 47.2, 54, .5, .01); sO.style.display = t > 47.2 ? '' : 'none';

    if (t < 4.2) {
      const p = E.back(prog(t, .1, .9));
      totI.set({ x: 540, y: lerp(2400, 1700, p), s: 1, r: Math.sin(t * 2) * 1.5, glow: (Math.sin(t * 6) + 1) / 2 });
      const bp = totI.badgeAt(540, lerp(2400, 1700, p), 1);
      ringsI.forEach((r, i) => { const q = ((t + i * .5) % 1.5) / 1.5; css(r, { left: (bp.x - 150) + 'px', top: (bp.y - 150) + 'px', opacity: t > .9 ? (1 - q) * .9 : 0, transform: `scale(${.4 + q * 1.4})` }); });
      hI.forEach((h, i) => SLAM(h, t, .75 + i * .5, 2.75)); SLAM(hI2, t, 3.0); hI3.style.opacity = E.out(prog(t, 3.3, 3.6));
    }
    if (t > 3.8 && t < 47.6) {
      const pin = E.out(prog(t, 3.8, 4.8)), pout = E.in(prog(t, 46.8, 47.6));
      let si = 0; SW.forEach(([a], i) => { if (t >= a + .25) si = i; });
      tint.style.background = `radial-gradient(90% 60% at 50% 65%, ${STEPC[si]}ee, ${STEPC[si]}88 55%, #05072add)`;
      tint.style.display = '';
      let wi = -1; SW.forEach(([a], i) => { if (i && t >= a - .35 && t < a + .45) wi = i; });
      wipe.style.display = wi > 0 ? '' : 'none';
      if (wi > 0) {
        if (wipeImg.dataset.i != wi) { wipeImg.dataset.i = wi; wipeImg.src = A + WA[wi]; await wipeImg.decode().catch(() => { }); }
        const q = E.io(prog(t, SW[wi][0] - .35, SW[wi][0] + .45));
        wipe.style.transform = `translate(${lerp(1300, -1900, q)}px,${lerp(2300, -900, q)}px) rotate(-28deg)`;
      }
      // 5: phone tilts back a little while scanning so the key can meet its top
      const scanUp = Math.min(E.io(prog(t, 33.9, 34.9)), 1 - E.io(prog(t, 36.2, 37.0)));
      ph.set({ x: P.x, y: P.y + (1 - pin) * 260 + pout * 200 + scanUp * 120, s: P.s, rx: 4 - scanUp * 10, ry: -8 * (1 - scanUp) + Math.sin(t * .5) * 4 * (1 - scanUp), o: 1 });
      SCR.forEach(([k, a, b]) => { const o = win(t, a, b + .35, .3, .3); const e = scr[k]; e.style.opacity = o; e.style.display = o > 0 ? '' : 'none'; e.style.transform = `translateX(${(1 - E.out(prog(t, a, a + .4))) * 40}px)`; });
      // taps
      let tp = null; for (const [t0, b] of TAPS) if (t > t0 - .3 && t < t0 + .7) tp = [t0, b];
      if (tp) { const b = tp[1] || { cx: cfm.offsetLeft + sheet.offsetLeft + cfm.offsetWidth / 2, cy: 844 - 8 - 330 + cfm.offsetTop + cfm.offsetHeight / 2 }; tap.at(t, tp[0], b.cx, b.cy); } else tap.at(t, -9, 0, 0);
      // highlights
      pulseHL(hlCan, t, 12.6, 14.9); pulseHL(hlCant, t, 14.9, 17.1);
      pulseHL(hlPath, t, 19.6, 22.0); pulseHL(hlGroup, t, 28.6, 31.9);
      pulseHL(hlDetails, t, 38.2, 40.9); pulseHL(hlEnd, t, 42.2, 46.6);
      // emergency confirm sheet
      const sp = E.out(prog(t, 22.6, 23.1)) - E.in(prog(t, 24.6, 25.0));
      sheet.style.transform = `translateY(${(1 - sp) * 110}%)`;
      // NFC scan
      const np = E.out(prog(t, 33.25, 33.7)) - E.in(prog(t, 36.6, 37.1));
      nfcSheet.style.transform = `translateY(${(1 - np) * 110}%)`; dim.style.opacity = np * .45;
      const ok = prog(t, 35.5, 35.8); nfcCheck.style.opacity = ok; nfcPhone.style.opacity = 1 - ok;
      // the Locky totem comes down; the phone's top meets its TAP HERE zone at 35.3
      const tin = E.out(prog(t, 33.7, 34.6)), tout2 = E.in(prog(t, 36.2, 36.9));
      tot.el.style.display = tin > 0 && tout2 < 1 ? '' : 'none';
      const phoneTop = P.y + scanUp * 120 - 436 * P.s + 30;
      const tb = lerp(-200, phoneTop + 520 * .36 * .64 - 45, tin) - tout2 * 900;   // pedestal bottom so badge sits at phone top
      tot.set({ x: 540, y: tb, s: 1, glow: prog(t, 35.2, 35.5) * (1 - prog(t, 35.9, 36.2)) });
      const bp = tot.badgeAt(540, tb, 1);
      rings.forEach((r, i) => { const a2 = 35.25 + i * .15, qq = prog(t, a2, a2 + .9); css(r, { left: (bp.x - 150) + 'px', top: (bp.y - 150) + 'px', opacity: qq > 0 && qq < 1 ? 1 - qq : 0, transform: `scale(${.3 + qq * 2.2})` }); });
      // text
      steps.forEach((s, i) => { const [a, b] = SW[i]; const on = t > a - .1 && t < b + .1; s.style.display = on ? '' : 'none'; if (!on) return;
        rise(s, t, a + .45, b, { stagger: .14 }); SLAM(s.querySelector('.num'), t, a + .25, b - .3);
        if (i === 4) s.style.opacity = 1 - Math.min(prog(t, 33.6, 33.9), 1 - prog(t, 36.8, 37.1)); else s.style.opacity = 1; });
      [[c2a, 12.8, 18.0], [c2b, H ? 14.9 : 15.0, 18.0], [c4, 28.8, 32.0], [c5, 37.2, 41.0], [c6, 43.0, 47.2]].forEach(([c, a, b]) => {
        if (!H && c === c2a) b = 14.9;
        c.style.display = t > a && t < b ? '' : 'none'; if (t > a && t < b) rise(c, t, a, b);
      });
      bars.forEach((b, i) => { const [a, e] = SW[i]; b.style.transform = `scaleX(${prog(t, a, e - .2)})`; });
    }
    if (t > 47.2) {
      const lt = t - 47.2;
      fan.forEach((c, j) => {
        const o = E.back(prog(t, 47.4 + j * .07, 48.1 + j * .07)), ang = (j - 3.5) * 12.5 * o, rad = ang * Math.PI / 180, R = 470;
        const wave = E.io(clamp((lt - 2.2 - j * .09) / .6)) * 360;
        c.set({ x: 540 + Math.sin(rad) * R, y: 1700 - Math.cos(rad) * R + (1 - o) * 1100, s: .8, rz: ang, ry: wave, z: j * 6 });
      });
      totO.set({ x: 540, y: 1960 - E.back(prog(t, 48.2, 48.9)) * 160, s: 1, glow: (Math.sin(t * 6) + 1) / 2 });
      outro.querySelectorAll('.r').forEach((e, i) => { const qq = E.out5(prog(t, 47.6 + i * .5, 47.8 + i * .5)); e.style.opacity = qq; e.style.transform = `scale(${lerp(1.6, 1, qq)})`; });
    }
  }
  return { duration: 54, render };
})();
