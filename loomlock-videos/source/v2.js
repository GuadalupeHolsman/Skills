// VIDEO 2 — "How to use loomlock Experiences"
const T2 = {
  en: {
    introK: 'Quick guide', intro: 'How to join a<br><em>loomlock Experience</em>', introS: '6 simple steps',
    steps: [
      ['Download loomlock', 'Open the app and tap <b>Explore loomlock experiences</b>. No account or loomlock product needed.'],
      ['Allow Screen Time access', 'loomlock only sees the <b>name</b> of your app group. Never your apps, never your stats.'],
      ['Set up emergency contacts', 'Keep calls and must-have apps available: <b>Settings › Screen Time › Always Allowed</b>. Then confirm.'],
      ['Prepare your app group', "Follow the organizer's instructions to choose which apps stay open. <b>Do it before the event</b> and entry is faster."],
      ['Scan the experience key', 'At the event, tap <b>Scan experience key</b> and hold the top of your iPhone near the key.'],
      ['Enjoy the moment', 'Your allowed apps stay open, everything else is blocked. When it’s over, tap <b>End experience</b>.'],
    ],
    chip2a: 'Sees: your group name only', chip2b: "Can't see: your apps or stats", chip4: 'Tip: set it up the day before', chip5: 'Hold near the top of your iPhone', chip6: 'Emergency exit is always available',
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
  const scene = () => add(st, `<div class="layer"></div>`);

  // ---- intro
  const sI = scene();
  const intro = add(sI, `<div class="abs center" style="inset:0;flex-direction:column;text-align:center;padding:0 60px">
    <img class="m" src="${A}mascot.png" style="width:${H ? 300 : 460}px;transform-origin:50% 90%">
    <div class="kicker r" style="font-size:${H ? 26 : 32}px;margin-top:30px">${T2.introK}</div>
    <div class="h1 r" style="font-size:${H ? 92 : 100}px;margin-top:14px">${T2.intro}</div>
    <div class="r" style="margin-top:26px"><span class="chip" style="font-size:${H ? 30 : 34}px"><span class="dot"></span>${T2.introS}</span></div></div>`);
  const im = intro.querySelector('.m');

  // ---- steps: phone + text
  const sP = scene(), w = add(sP, `<div class="world"></div>`);
  const ph = makePhone(w);
  const scr = {}; for (const k of ['welcome', 'expIntro', 'screenTime', 'emergency', 'finished', 'dash', 'session']) scr[k] = add(ph.screen, SCREENS[k]());
  const tap = makeTap(ph.screen);
  const coin = makeCoin(w);
  const rings = [0, 1, 2].map(() => add(w, `<div class="nfc" style="width:300px;height:300px"></div>`));
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
  const steps = T2.steps.map((s, i) => add(sP, `<div class="abs" style="${textStyle}">
      <div class="r" style="display:flex;align-items:baseline;gap:18px;${H ? '' : 'justify-content:center'}"><span class="stepnum" style="font-size:${H ? 150 : 140}px">0${i + 1}</span><span class="kicker" style="font-size:${H ? 26 : 30}px">${T2.step} ${i + 1}/6</span></div>
      <div class="h1 r" style="font-size:${H ? 76 : 80}px;margin-top:${H ? 6 : 0}px">${s[0]}</div>
      <div class="sub r" style="font-size:${H ? 34 : 38}px;margin-top:24px">${s[1]}</div></div>`));
  const chipV = (txt, cls, i) => add(sP, `<div class="abs" style="${H ? `left:140px;top:${790 + i * 84}px` : `left:0;right:0;top:1800px;text-align:center`}"><span class="chip ${cls}" style="font-size:${H ? 26 : 30}px"><span class="dot"></span>${txt}</span></div>`);
  const c2a = chipV(T2.chip2a, 'ok', 0), c2b = chipV(T2.chip2b, 'no', H ? 1 : 0), c4 = chipV(T2.chip4, '', 0), c5 = chipV(T2.chip5, '', 0), c6 = chipV(T2.chip6, 'ok', 0);
  if (!H) c2b.style.top = '1800px', c2a.style.top = '1800px';
  const progress = add(sP, `<div class="progress" style="${H ? 'left:140px;top:150px' : 'left:0;right:0;top:80px;justify-content:center'}">${'<i><b></b></i>'.repeat(6)}</div>`);
  const bars = [...progress.querySelectorAll('b')];

  // ---- outro
  const sO = scene();
  const outro = add(sO, `<div class="abs center" style="inset:0;flex-direction:column;text-align:center">
    <img class="m" src="${A}mascot.png" style="width:${H ? 300 : 500}px;transform-origin:50% 90%">
    <div class="h1 r" style="font-size:${H ? 96 : 110}px;margin-top:26px">${T2.out}</div>
    <div class="r" style="margin-top:40px"><img src="${A}logo_full.png" style="height:${H ? 110 : 130}px"></div>
    <div class="r" style="font-size:${H ? 30 : 36}px;font-weight:600;margin-top:18px;opacity:.85">loomlock.com</div></div>`);
  const om = outro.querySelector('.m');

  const SW = [[4.0, 11.2], [11.0, 18.2], [18.0, 25.2], [25.0, 32.2], [32.0, 41.2], [41.0, 47.2]];
  const SCR = [['welcome', 3.8, 7.3], ['expIntro', 7.3, 11.3], ['screenTime', 11.3, 18.3], ['emergency', 18.3, 25.3], ['finished', 25.3, 28.0], ['dash', 28.0, 37.6], ['session', 37.6, 48]];
  let TAPS;
  const TAPS_ = () => [[6.6, B.explore], [10.2, B.start], [17.4, B.allow], [22.4, B.confirmSetup], [24.3, null], [33.0, B.scan]];
  const P = H ? { x: 1380, y: 555, s: .98 } : { x: 540, y: 1235, s: 1.08 };

  async function render(t) {
    if (!B) { init(); TAPS = TAPS_(); }
    bg.update(t);
    sI.style.opacity = win(t, 0, 4.2, .01, .4); sI.style.display = t < 4.2 ? '' : 'none';
    sP.style.opacity = win(t, 3.8, 47.6, .5, .5); sP.style.display = t > 3.8 && t < 47.6 ? '' : 'none';
    sO.style.opacity = win(t, 47.2, 54, .5, .01); sO.style.display = t > 47.2 ? '' : 'none';

    if (t < 4.2) {
      const p = E.back(prog(t, .1, .9));
      im.style.transform = `translateY(${(1 - p) * 260}px) scale(${.5 + .5 * p}) rotate(${Math.sin(t * 5) * 6 * prog(t, .8, 1.3)}deg)`; im.style.opacity = prog(t, .1, .4);
      rise(intro, t, .7, 4.2);
    }
    if (t > 3.8 && t < 47.6) {
      const pin = E.out(prog(t, 3.8, 4.8)), pout = E.in(prog(t, 46.8, 47.6));
      // 5: phone tilts back a little while scanning so the key can meet its top
      const scanTilt = win(t, 33.4, 37.4, .6, .6);
      ph.set({ x: P.x, y: P.y + (1 - pin) * 260 + pout * 200 + scanTilt * (H ? 40 : 60), s: P.s, rx: 4 + scanTilt * 14, ry: (H ? -14 : -8) + Math.sin(t * .5) * 4, o: 1 });
      SCR.forEach(([k, a, b]) => { const o = win(t, a, b, .3, .3); const e = scr[k]; e.style.opacity = o; e.style.display = o > 0 ? '' : 'none'; e.style.transform = `translateX(${(1 - E.out(prog(t, a, a + .4))) * 40}px)`; });
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
      // the experience key (Card 0) comes to the top of the phone
      const kin = E.io(prog(t, 33.8, 35.3)), kout = E.in(prog(t, 36.0, 36.9));
      const topY = P.y + scanTilt * (H ? 40 : 60) - 380 * P.s;
      coin.root.style.display = kin > 0 && kout < 1 ? '' : 'none';
      coin.set({ x: lerp(P.x + (H ? 520 : 600), P.x + 10, kin) + kout * (H ? 500 : 600), y: lerp(topY - 300, topY, kin) - kout * 200, s: H ? .42 : .46, rx: 40, ry: lerp(-50, -10, kin), rz: lerp(30, 0, kin), o: 1 });
      coin.root.style.transform += ' translateZ(160px)';
      rings.forEach((r, i) => { const a = 35.2 + i * .2, qq = prog(t, a, a + 1); css(r, { left: (P.x - 150) + 'px', top: (topY - 150) + 'px', opacity: qq > 0 && qq < 1 ? 1 - qq : 0, transform: `translateZ(170px) scale(${.3 + qq * 1.5}) rotateX(55deg)` }); });
      // text
      steps.forEach((s, i) => { const [a, b] = SW[i]; s.style.display = t > a - .1 && t < b + .1 ? '' : 'none'; if (t > a - .1 && t < b + .1) rise(s, t, a + .15, b, { stagger: .12 }); });
      [[c2a, 12.8, 18.0], [c2b, H ? 14.9 : 15.0, 18.0], [c4, 28.8, 32.0], [c5, 33.6, 41.0], [c6, 43.0, 47.2]].forEach(([c, a, b]) => {
        if (!H && c === c2a) b = 14.9;
        c.style.display = t > a && t < b ? '' : 'none'; if (t > a && t < b) rise(c, t, a, b);
      });
      bars.forEach((b, i) => { const [a, e] = SW[i]; b.style.transform = `scaleX(${prog(t, a, e - .2)})`; });
    }
    if (t > 47.2) {
      const p = E.back(prog(t, 47.5, 48.3));
      om.style.transform = `translateY(${(1 - p) * 260}px) scale(${.5 + .5 * p}) rotate(${Math.sin((t - 47.5) * 5) * 6 * prog(t, 48, 48.6)}deg)`; om.style.opacity = prog(t, 47.5, 47.8);
      outro.querySelectorAll('.r').forEach((e, i) => { const qq = E.out(prog(t, 48.1 + i * .3, 48.8 + i * .3)); e.style.opacity = qq; e.style.transform = `translateY(${(1 - qq) * 30}px)`; });
    }
  }
  return { duration: 54, render };
})();
