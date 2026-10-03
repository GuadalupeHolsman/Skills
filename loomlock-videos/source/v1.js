// VIDEO 1 — "What is loomlock?"
const T1 = {
  en: {
    s1: 'Your phone wants<br><em>all of you.</em>',
    n: [['Social', '23 new notifications'], ['Video', "You won't believe this trending clip"], ['Chat', '(12) Group: are you there??'], ['Screen Time', 'Daily average: 6h 42m'], ['Shop', 'Flash sale ends in 10 minutes']],
    s3k: 'How it works', s3: 'Tap a key.<br><em>Block the noise.</em>', s3s: 'Tap your loomlock key on your iPhone and distracting apps are blocked. <b>You choose which apps stay open.</b>',
    s3c: 'Private by design · Apple Screen Time',
    s4k: 'Phygitals', s4: 'Art you collect.<br><em>Keys you use.</em>', s4a: 'Season 0', s4b: 'Artist Keys',
    s5k: 'loomlock devices', s5: 'Lock it.<br><em>Free your time.</em>', s5a: 'Timed locks for your phone, snacks, games…', s5b: 'Set the timer. Be done.',
    s6k: 'loomlock Experiences', s6: 'Phone-free moments<br><em>at partner events.</em>', c: ['No account needed', 'No device needed', 'Just scan the experience key'],
    end: 'Build a better day.',
  },
  es: {
    s1: 'Tu móvil lo quiere<br><em>todo de ti.</em>',
    n: [['Social', '23 notificaciones nuevas'], ['Vídeo', 'No te creerás este clip viral'], ['Chat', '(12) Grupo: ¿¿estás??'], ['Tiempo de uso', 'Media diaria: 6 h 42 min'], ['Tienda', 'La oferta acaba en 10 minutos']],
    s3k: 'Cómo funciona', s3: 'Toca una key.<br><em>Silencia el ruido.</em>', s3s: 'Acerca tu key loomlock a tu iPhone y las apps que distraen se bloquean. <b>Tú eliges qué apps siguen abiertas.</b>',
    s3c: 'Privado por diseño · Tiempo de uso de Apple',
    s4k: 'Phygitals', s4: 'Arte que coleccionas.<br><em>Keys que usas.</em>', s4a: 'Season 0', s4b: 'Artist Keys',
    s5k: 'Dispositivos loomlock', s5: 'Bloquéalo.<br><em>Libera tu tiempo.</em>', s5a: 'Candados con temporizador para tu móvil, dulces, juegos…', s5b: 'Pon el tiempo. Y listo.',
    s6k: 'Experiencias loomlock', s6: 'Momentos sin móvil<br><em>en eventos asociados.</em>', c: ['Sin cuenta', 'Sin dispositivo', 'Solo escanea la key de la experiencia'],
    end: 'Construye un mejor día.',
  }
}[LANG];

const VIDEO = (() => {
  const st = document.getElementById('stage');
  const bg = makeBG(st);
  const scene = () => add(st, `<div class="layer"></div>`);
  const world = (p) => add(p, `<div class="world"></div>`);
  const HS = H ? 92 : 100; // headline size

  // text block helper
  const textBlock = (p, html, style) => add(p, `<div class="abs" style="${style}">${html}</div>`);
  const leftCol = H ? `left:140px;top:300px;width:820px;text-align:left` : `left:70px;right:70px;top:170px;text-align:center`;

  // ---- S1 hook
  const s1 = scene(), w1 = world(s1);
  const ph = makePhone(w1);
  const home = add(ph.screen, SCREENS.home());
  const notifs = home.querySelector('.notifs');
  const ncol = ['#ff4d6d', '#ff2e2e', '#25d366', '#5a5cff', '#ffb02e'];
  const N = T1.n.map((n, i) => add(notifs, `<div class="notif" style="top:0"><div class="ni" style="background:${ncol[i]}"></div><div><b>${n[0]}</b><span>${n[1]}</span></div></div>`));
  const t1 = textBlock(s1, `<div class="h1" style="font-size:${HS + 10}px"><span class="r" style="display:inline-block">${T1.s1}</span></div>`, leftCol + (H ? ';top:400px' : ''));

  // ---- S2 logo
  const s2 = scene();
  const logo = add(s2, `<div class="abs center" style="inset:0;flex-direction:${H ? 'row' : 'column'};gap:${H ? 60 : 50}px;perspective:1200px">
     <img class="li" src="${A}logo_icon.png" style="height:${H ? 300 : 340}px">
     <div style="text-align:${H ? 'left' : 'center'}"><div class="lw" style="overflow:hidden"><img src="${A}logo_word.png" style="height:${H ? 120 : 118}px;display:block"></div>
     <div class="lt" style="font-size:${H ? 44 : 46}px;font-weight:600;margin-top:26px">${T1.end.replace(/^(\S+)/, '<span style="color:var(--yellow)">$1</span>')}</div></div></div>`);
  const li = logo.querySelector('.li'), lw = logo.querySelector('.lw'), lt = logo.querySelector('.lt');

  // ---- S3 tap a key
  const s3 = scene(), w3 = world(s3);
  const ph3 = makePhone(w3);
  const home3 = add(ph3.screen, SCREENS.home());
  const icons = [...home3.querySelectorAll('.lk')], focus = home3.querySelector('.focus');
  const key3 = makeCard(w3, 'card_yb_ufo.jpg');
  const rings3 = [0, 1, 2].map(() => add(w3, `<div class="nfc" style="width:300px;height:300px"></div>`));
  const t3 = textBlock(s3, `<div class="kicker r" style="font-size:${H ? 26 : 30}px">${T1.s3k}</div>
     <div class="h1 r" style="font-size:${HS}px;margin-top:18px">${T1.s3}</div>
     <div class="sub r" style="font-size:${H ? 34 : 38}px;margin-top:28px">${T1.s3s}</div>`, leftCol);
  const c3 = textBlock(s3, `<div class="chip ok" style="font-size:${H ? 24 : 28}px"><span class="dot"></span>${T1.s3c}</div>`, H ? 'left:140px;top:860px' : 'left:0;right:0;top:1780px;text-align:center');

  // ---- S4 phygitals
  const s4 = scene(), w4 = world(s4);
  const arts = ['card_yb_wall.jpg', 'card_p_boat.jpg', 'card_yb_faces.jpg', 'card_p_butterfly.jpg', 'card_yb_ufo.jpg', 'card_p_dragonfly.jpg', 'card_yb_devils.jpg', 'card_p_red.jpg'];
  const backs = ['#d6452f', '#0f5a66', '#3b6fc4', '#0e2440', '#2b2b2b', '#1c1236', '#e05038', '#a51f1f'];
  const ring = arts.map((a, i) => makeCard(w4, a, backs[i], i % 2 ? 'Artist Keys' : 'Season 0'));
  const t4 = textBlock(s4, `<div class="kicker r" style="font-size:${H ? 28 : 32}px">${T1.s4k}</div>
     <div class="h1 r" style="font-size:${HS}px;margin-top:14px">${T1.s4}</div>`, H ? 'left:0;right:0;top:90px;text-align:center' : 'left:60px;right:60px;top:200px;text-align:center');
  const fA = makeSeq(s4, 'yb', 96, H ? 'left:120px;top:400px;width:820px;height:500px' : 'left:60px;top:640px;width:960px;height:560px');
  const fB = makeSeq(s4, 'p1', 96, H ? 'left:980px;top:400px;width:820px;height:500px' : 'left:60px;top:1240px;width:960px;height:560px');
  const lA = add(fA.el, `<div class="label" style="left:24px;bottom:24px;font-size:${H ? 26 : 30}px">${T1.s4a}</div>`);
  const lB = add(fB.el, `<div class="label" style="left:24px;bottom:24px;font-size:${H ? 26 : 30}px">${T1.s4b}</div>`);

  // ---- S5 devices
  const s5 = scene();
  const fBox = makeSeq(s5, 'boxlock', 96, H ? 'left:820px;top:150px;width:1000px;height:780px' : 'left:60px;top:760px;width:960px;height:960px');
  const fCase = makeSeq(s5, 'casetimer', 96, H ? 'left:820px;top:150px;width:1000px;height:780px' : 'left:60px;top:760px;width:960px;height:960px');
  const t5 = textBlock(s5, `<div class="kicker r" style="font-size:${H ? 26 : 30}px">${T1.s5k}</div>
     <div class="h1 r" style="font-size:${HS}px;margin-top:18px">${T1.s5}</div>`, H ? 'left:120px;top:330px;width:660px' : leftCol);
  const l5a = add(s5, `<div class="label" style="font-size:${H ? 26 : 30}px;${H ? 'left:850px;top:860px' : 'left:90px;top:1640px'}">${T1.s5a}</div>`);
  const l5b = add(s5, `<div class="label" style="font-size:${H ? 26 : 30}px;${H ? 'left:850px;top:860px' : 'left:90px;top:1640px'}">${T1.s5b}</div>`);

  // ---- S6 experiences
  const s6 = scene(), w6 = world(s6);
  const cx6 = H ? 1320 : 540, cy6 = H ? 540 : 1130;
  const rings6 = [0, 1, 2, 3].map(() => add(w6, `<div class="nfc" style="width:520px;height:520px"></div>`));
  const coin = makeCoin(w6);
  const t6 = textBlock(s6, `<div class="kicker r" style="font-size:${H ? 26 : 30}px">${T1.s6k}</div>
     <div class="h1 r" style="font-size:${H ? 84 : 92}px;margin-top:18px">${T1.s6}</div>`, H ? 'left:120px;top:260px;width:820px' : leftCol);
  const chips6 = T1.c.map((c, i) => textBlock(s6, `<div class="chip ok" style="font-size:${H ? 28 : 32}px"><span class="dot"></span>${c}</div>`,
    H ? `left:120px;top:${600 + i * 92}px` : `left:0;right:0;top:${1520 + i * 104}px;text-align:center`));

  // ---- S7 end
  const s7 = scene();
  const end = add(s7, `<div class="abs center" style="inset:0;flex-direction:column">
     <img class="m" src="${A}mascot.png" style="width:${H ? 340 : 560}px;transform-origin:50% 90%">
     <div class="r" style="margin-top:20px"><img src="${A}logo_full.png" style="height:${H ? 150 : 170}px"></div>
     <div class="r" style="font-size:${H ? 44 : 50}px;font-weight:700;margin-top:28px">${T1.end.replace(/^(\S+)/, '<span style="color:var(--yellow)">$1</span>')}</div>
     <div class="r" style="font-size:${H ? 30 : 34}px;font-weight:600;margin-top:16px;opacity:.85">loomlock.com</div></div>`);
  const mascot = end.querySelector('.m');

  const flash = add(st, `<div class="flash"></div>`);
  const S = [s1, s2, s3, s4, s5, s6, s7];
  const range = [[0, 4.7], [4.6, 9.3], [9.2, 16.7], [16.6, 24.3], [24.2, 30.5], [30.4, 37.3], [37.2, 42]];

  async function render(t) {
    bg.update(t);
    S.forEach((s, i) => { const [a, b] = range[i]; const o = win(t, a, b, i ? .35 : .01, i === 6 ? .01 : .35); s.style.opacity = o; s.style.display = o > 0 ? '' : 'none'; });

    // S1
    if (t < 4.8) {
      const p = E.out(prog(t, 0, 1.2));
      ph.set(H ? { x: 1320, y: 560 + (1 - p) * 300, s: .98, ry: -20 + Math.sin(t * .8) * 4, rx: 6, o: 1 }
        : { x: 540, y: 1230 + (1 - p) * 300, s: 1.0, ry: -14 + Math.sin(t * .8) * 4, rx: 6, o: 1 });
      N.forEach((n, i) => {
        const a = .5 + i * .55, q = E.back(prog(t, a, a + .45));
        const after = N.length - 1 - i; // newer banners push older ones down
        let y = 70; for (let j = i + 1; j < N.length; j++) y += 84 * E.out(prog(t, .5 + j * .55, .5 + j * .55 + .4));
        n.style.top = (y - (1 - q) * 120) + 'px'; n.style.opacity = prog(t, a, a + .2);
        n.style.transform = `scale(${.9 + .1 * q})`;
      });
      rise(t1, t, .5, 4.6, { dy: 50 });
    }
    // S2
    if (t > 4.5 && t < 9.4) {
      const p = E.back(prog(t, 4.75, 5.6));
      li.style.transform = `rotateY(${(1 - p) * -110}deg) scale(${.6 + .4 * p})`; li.style.opacity = prog(t, 4.75, 5);
      const q = E.io(prog(t, 5.3, 6.1));
      lw.style.clipPath = `inset(0 ${(1 - q) * 100}% 0 0)`;
      lt.style.opacity = E.out(prog(t, 6.1, 6.7)); lt.style.transform = `translateY(${(1 - E.out(prog(t, 6.1, 6.7))) * 30}px)`;
      logo.style.transform = `scale(${1 + prog(t, 5, 9.3) * .06})`;
    }
    // S3
    if (t > 9.1 && t < 16.8) {
      const lt3 = t - 9.2;
      const pin = E.out(prog(t, 9.2, 10.2));
      const P = H ? { x: 1330, y: 650, s: .88 } : { x: 540, y: 1250, s: .9 };
      ph3.set({ ...P, y: P.y + (1 - pin) * 200, ry: -16 + Math.sin(lt3 * .6) * 3, rx: 8 });
      // key flies to top of phone, touches at 11.4
      const k = E.io(prog(t, 10.0, 11.4)), back = E.io(prog(t, 12.2, 13.4));
      const topY = P.y - 436 * P.s;
      const kx = lerp(P.x + (H ? 520 : 420), P.x + 30, k) + back * (H ? 150 : 120);
      const ky = lerp(topY - 420, topY + 6, k) - back * 90;
      key3.set({ x: kx, y: ky, s: H ? .52 : .55, rx: lerp(30, 52, k), ry: lerp(-40, -14, k), rz: lerp(25, -8, k), z: 80, o: 1 });
      rings3.forEach((r, i) => {
        const a = 11.35 + i * .22, q = prog(t, a, a + 1.0);
        css(r, { left: (P.x - 150) + 'px', top: (topY - 150) + 'px', opacity: q > 0 && q < 1 ? (1 - q) : 0, transform: `scale(${.3 + q * 1.6}) rotateX(60deg)` });
      });
      icons.forEach((ic, i) => { const a = 11.5 + i * .06; ic.style.opacity = E.out(prog(t, a, a + .3)); });
      const f = E.back(prog(t, 12.9, 13.5)); focus.style.opacity = prog(t, 12.9, 13.1); focus.style.transform = `translateY(${(1 - f) * 40}px)`;
      rise(t3, t, 9.4, 16.7);
      rise(c3, t, 13.4, 16.7);
    }
    // S4
    if (t > 16.5 && t < 24.4) {
      const cx = W / 2, cy = H ? 720 : 1150, R = H ? 760 : 470;
      const out = E.in(prog(t, 20.2, 20.9));
      ring.forEach((c, i) => {
        const a = 16.8 + i * .09, pin = E.out(prog(t, a, a + .9));
        const th = (i / ring.length) * Math.PI * 2 + (t - 16.6) * .45;
        const x = cx + Math.sin(th) * R * pin, z = (Math.cos(th) - 1) * R * pin - out * 1200;
        c.set({ x, y: cy + Math.sin(th * 2 + t) * 14, z, s: H ? .78 : .6, ry: th * 180 / Math.PI, rx: -6, o: 1 });
        c.root.style.display = pin <= 0 || out >= 1 ? 'none' : '';
      });
      rise(t4, t, 16.8, 24.3);
      for (const [f, l, a] of [[fA, lA, 20.7], [fB, lB, 20.95]]) {
        const p = E.out(prog(t, a, a + .6));
        f.el.style.opacity = p; f.el.style.transform = `translateY(${(1 - p) * 80}px) scale(${.92 + .08 * p})`;
        f.el.style.display = p > 0 ? '' : 'none';
        if (p > 0) await f.frame(t - a);
        l.style.opacity = prog(t, a + .5, a + .9);
      }
    }
    // S5
    if (t > 24.1 && t < 30.6) {
      rise(t5, t, 24.4, 30.5);
      const pb = E.out(prog(t, 24.3, 24.9)), pc = prog(t, 27.4, 27.8);
      fBox.el.style.opacity = pb; fBox.el.style.transform = `scale(${.94 + .06 * pb})`; await fBox.frame(t - 24.3);
      fCase.el.style.opacity = pc; fCase.el.style.display = pc > 0 ? '' : 'none'; if (pc > 0) await fCase.frame(t - 27.3);
      l5a.style.opacity = win(t, 25.0, 27.5, .4, .3); l5b.style.opacity = win(t, 27.9, 30.5, .4, .3);
    }
    // S6
    if (t > 30.3 && t < 37.4) {
      const p = E.back(prog(t, 30.5, 31.5));
      coin.set({ x: cx6, y: cy6 + Math.sin(t * 1.4) * 12, s: (H ? .95 : .95) * (.4 + .6 * p), ry: Math.sin((t - 30.4) * .9) * 28, rx: 8 + Math.cos(t) * 4, o: 1 });
      rings6.forEach((r, i) => {
        const q = ((t - 31.2 + i * .5) % 2) / 2; const on = t > 31.2;
        css(r, { left: (cx6 - 260) + 'px', top: (cy6 - 260) + 'px', opacity: on ? (1 - q) * .8 : 0, transform: `scale(${1 + q * .9})` });
      });
      rise(t6, t, 30.6, 37.3);
      chips6.forEach((c, i) => rise(c, t, 32.2 + i * .45, 37.3));
    }
    // S7
    if (t > 37.1) {
      const p = E.back(prog(t, 37.3, 38.1));
      mascot.style.transform = `translateY(${(1 - p) * 300}px) scale(${.5 + .5 * p}) rotate(${Math.sin((t - 37.3) * 5) * 6 * prog(t, 37.8, 38.4)}deg)`;
      mascot.style.opacity = prog(t, 37.3, 37.6);
      end.querySelectorAll('.r').forEach((e, i) => { const q = E.out(prog(t, 38.0 + i * .25, 38.6 + i * .25)); e.style.opacity = q; e.style.transform = `translateY(${(1 - q) * 30}px)`; });
    }
    flash.style.opacity = Math.max(0, .22 - Math.abs(t - 4.65) * 1.2);
  }
  return { duration: 42, render };
})();
