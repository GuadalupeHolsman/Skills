// VIDEO 4 — "What is loomlock?" 9:16, EN, 120 BPM (beat = .5s), 45s. Built on the brand book.
const VIDEO = (() => {
  const st = document.getElementById('stage');
  const cam = add(st, `<div class="layer"></div>`);
  const scene = (bg = '') => add(cam, `<div class="layer" style="${bg}"></div>`);
  const world = (p, persp = 1600) => add(p, `<div class="world" style="perspective:${persp}px;perspective-origin:50% 50%"></div>`);
  const ctr = (p, top, html, extra = '') => add(p, `<div class="abs" style="left:50px;right:50px;top:${top}px;text-align:center;${extra}">${html}</div>`);
  const BALOO = 'Baloo Bhaina 2', ROB = 'Roboto';
  const words = (txt, size, extra = '') => `<div style="font:500 ${size}px/1.3 '${ROB}';${extra}">${txt.split(' ').map(w => `<span class="r" style="display:inline-block">${w}&nbsp;</span>`).join('')}</div>`;
  const flash = add(st, `<div class="flash"></div>`);
  add(st, `<div class="grain" style="opacity:.07"></div>`);

  // S1 hook
  const s1 = scene('background:radial-gradient(80% 60% at 50% 60%,#1D29C2 0%,#121B95 45%,#04062a 100%)');
  const lock1 = makeObj(s1, 'bb_lock.png', 760);
  const h1 = ['FOCUS', "CAN'T BE", 'FORCED.'].map((w, i) => ctr(s1, 170 + i * 175, BIG(w, 190)));
  const h1b = ctr(s1, 230, BIG("IT'S CHOSEN.", 200, 'color:var(--yellow)', BALOO, 800));

  // S2 logo + mission
  const s2 = scene(); add(s2, `<div class="bg"></div>`);
  const lock2 = makeObj(s2, 'bb_lock.png', 420);
  const logo2 = ctr(s2, 520, `<img src="${A}logo_full.png" style="height:170px">`);
  const mis2 = ctr(s2, 1420, words('An ecosystem to help you build habits, reduce distractions and reconnect with intention.', 50));

  // S3 core idea triad
  const TRI = [['CONTROL.', 'SUPPORT.', '#3F49CC'], ['PUNISH.', 'STRUCTURE.', '#7037CA'], ['FORCE.', 'INVITE.', '#0C77B7']];
  const s3 = scene();
  const bg3 = add(s3, `<div class="layer"></div>`);
  const kick3 = ctr(s3, 160, `<span class="chip" style="font-size:30px;background:rgba(0,0,0,.18)"><span class="dot"></span>Core idea</span>`);
  const tri = TRI.map(([a, b]) => {
    const g = add(s3, `<div class="layer"></div>`);
    const l1 = ctr(g, 470, BIG("WE DON'T", 150));
    const l2 = ctr(g, 630, `<span style="position:relative;display:inline-block">${BIG(a, 170, 'opacity:.9')}<i class="strike" style="position:absolute;left:-10px;right:-10px;top:46%;height:22px;background:var(--yellow);transform-origin:left;transform:scaleX(0);border-radius:11px"></i></span>`);
    const l3 = ctr(g, 980, BIG('WE ' + b, b.length > 8 ? 150 : 180, 'color:var(--yellow)', BALOO, 800));
    return { g, l1, l2, l3, strike: l2.querySelector('.strike') };
  });
  const locky3 = add(s3, `<img src="${A}mascot.png" class="abs" style="left:370px;top:1420px;width:340px;transform-origin:50% 90%">`);

  // S4 ecosystem
  const ECO = [
    ['LOCK', 'bb_lock.png', 600, 'A timed lock. It doesn’t mean restriction. <b>It means decision.</b>', '#3F49CC', '#fff'],
    ['JOURNAL', 'bb_journal.png', 560, 'A flexible journal. <b>A safe place for self-observation.</b>', '#7037CA', '#fff'],
    ['APP', 'bb_app.png', 760, 'Check-ins, challenges and your lock. <b>All connected.</b>', '#FFA332', '#121B95'],
  ];
  const s4 = scene();
  const eco = ECO.map(([name, src, w, line, bg, ink], i) => {
    const p = add(s4, `<div class="layer" style="background:${bg};color:${ink};overflow:hidden;transform-origin:50% 100%"></div>`);
    add(p, `<div class="abs" style="right:-60px;top:560px;color:transparent;-webkit-text-stroke:5px ${ink};opacity:.18">${BIG('0' + (i + 1), 720, '', BALOO, 800)}</div>`);
    const k = ctr(p, 150, `<span class="chip" style="font-size:30px;background:rgba(0,0,0,.16);color:${ink};border-color:${ink}44"><span class="dot" style="background:${ink === '#fff' ? 'var(--yellow)' : '#121B95'}"></span>Our ecosystem · ${i + 1}/3</span>`);
    const n = ctr(p, 250, BIG(name, name.length > 5 ? 175 : 230));
    const o = makeObj(p, src, w);
    const l = ctr(p, 1530, `<div style="font:400 50px/1.3 '${ROB}'">${line}</div>`, 'left:80px;right:80px');
    return { p, k, n, o, l, w };
  });

  // S5 keys flip rush
  const ARTS = ['card_yb_wall.jpg', 'card_p_boat.jpg', 'card_yb_faces.jpg', 'card_p_butterfly.jpg', 'card_yb_ufo.jpg', 'card_p_dragonfly.jpg', 'card_yb_devils.jpg', 'card_p_red.jpg'];
  const BGC = ['#FF5E48', '#50A0D0', '#FCCE21', '#C0C8FF', '#FF6CD2', '#8957D6', '#3B5CFF', '#68EE8F'];
  const INK = ['#2a0a03', '#06243a', '#2a2200', '#121B95', '#3a0020', '#ffffff', '#ffffff', '#063a1c'];
  ARTS.forEach(a => PRELOAD.push(A + a));
  const s5 = scene();
  const bg5 = add(s5, `<div class="layer"></div>`);
  const rows = Array.from({ length: 7 }, (_, i) => add(bg5, `<div class="abs" style="left:-1200px;top:${-80 + i * 300}px;white-space:nowrap;transform-origin:1740px 50%;opacity:.5">${BIG(('KEYS ✦ PHYGITALS ✦ ').repeat(6), 200, i % 2 ? 'color:transparent;-webkit-text-stroke:4px currentColor' : '')}</div>`));
  const w5 = world(s5);
  const card5 = makeCard(w5, ARTS[0], '#111'); const img5 = card5.root.querySelector('.face img');
  const h5a = [ctr(s5, 170, BIG('EVERY KEY', 150)), ctr(s5, 320, BIG('IS AN ARTWORK.', 118))];
  const h5b = [ctr(s5, 1440, BIG('TAP IT.', 190)), ctr(s5, 1620, BIG('BLOCK THE NOISE.', 112))];

  // S6 experiences
  const s6 = scene('background:radial-gradient(80% 55% at 50% 50%,#2a35c8,#0c1160 60%,#03041a)');
  const w6 = world(s6);
  const rings6 = [0, 1, 2, 3].map(() => add(s6, `<div class="nfc" style="width:300px;height:300px"></div>`));
  const totem6 = makeTotem(s6, 640); rings6.forEach(r => s6.appendChild(r));
  const card6 = makeCard(w6, 'card_yb_ufo.jpg', '#2b2b2b');
  const k6 = ctr(s6, 170, `<div class="kicker" style="font-size:32px">loomlock Experiences</div>`);
  const h6 = [ctr(s6, 250, BIG('PHONE-FREE', 128)), ctr(s6, 380, BIG('MOMENTS', 150)), ctr(s6, 530, BIG('AT PARTNER EVENTS.', 96, 'color:var(--yellow)'))];
  const c6 = ['Tap Locky at the entrance', 'Or tap your loomlock card', 'No account needed'].map((c, i) => ctr(s6, 1560 + i * 96, `<span class="chip ok" style="font-size:34px"><span class="dot"></span>${c}</span>`));

  // S7 Locky
  const s7 = scene('background:#9FD8FF;color:#121B95');
  const FIG = ['bb_p17_50.jpg', 'bb_p17_51.jpg', 'bb_p17_53.jpg', 'bb_p18_58.jpg'];
  FIG.forEach(f => PRELOAD.push(A + f));
  const frame7 = add(s7, `<div class="abs" style="left:150px;top:520px;width:780px;height:780px;border-radius:60px;overflow:hidden;box-shadow:0 40px 80px rgba(18,27,149,.35);border:10px solid #fff"><img style="width:100%;height:100%;object-fit:cover"></div>`);
  const img7 = frame7.querySelector('img');
  const h7 = ctr(s7, 180, BIG('MEET LOCKY.', 190, '', BALOO, 800));
  const l7 = ctr(s7, 1400, `<div style="font:500 52px/1.3 '${ROB}'">It doesn’t command.<br><b style="font-weight:900">It accompanies.</b></div>`);
  const m7 = add(s7, `<img src="${A}mascot.png" class="abs" style="left:700px;top:1150px;width:300px;transform-origin:50% 90%">`);

  // S8 end
  const s8 = scene(); add(s8, `<div class="bg"></div>`);
  const w8 = world(s8);
  const orb = ARTS.map((a, i) => makeCard(w8, a, BGC[i]));
  const end8 = add(s8, `<div class="abs center" style="inset:0;flex-direction:column;text-align:center">
    <div class="r">${BIG('Join the Loomlockers.', 70, 'color:var(--yellow)', BALOO, 700)}</div>
    <div class="r" style="margin-top:40px"><img src="${A}logo_full.png" style="height:170px"></div>
    <div class="r" style="font:700 52px Montserrat;margin-top:40px">Build a better day.</div>
    <div class="r" style="font:600 36px Montserrat;margin-top:16px;opacity:.85">loomlock.com</div></div>`);

  const SC = [[s1, 0, 4], [s2, 4, 8.5], [s3, 8.5, 14.5], [s4, 14.5, 26.5], [s5, 26.5, 32.5], [s6, 32.5, 36.5], [s7, 36.5, 40.5], [s8, 40.5, 45]];
  const beat = t => Math.floor(t * 2 + 1e-6), bph = t => (t * 2) % 1;

  async function render(t) {
    SC.forEach(([s, a, b]) => s.style.display = t >= a && t < b ? '' : 'none');
    const imp = [3.0, 8.5, 14.5, 26.5, 32.5, 40.5];
    let sh = 0; imp.forEach(x => { if (t >= x) sh = Math.max(sh, (1 - (t - x) * 3) * .6); });
    cam.style.transform = sh > 0 ? `translate(${Math.sin(t * 91) * 22 * sh}px,${Math.cos(t * 77) * 22 * sh}px)` : '';
    flash.style.opacity = imp.reduce((m, x) => Math.max(m, .5 - Math.abs(t - x) * 5), 0);

    if (t < 4) {
      const z = E.io(prog(t, 0, 4));
      lock1.set({ x: 540 + Math.sin(t) * 20, y: lerp(1500, 1250, z), s: lerp(2.2, 1, z), r: lerp(-18, -4, z), ry: Math.sin(t * .9) * 18 });
      h1.forEach((w, i) => SLAM(w, t, .75 + i * .5, 2.75));
      SLAM(h1b, t, 3.0, 3.85);
    }
    if (t >= 4 && t < 8.5) {
      const p = E.back(prog(t, 4, 4.7));
      lock2.set({ x: 540, y: lerp(-300, 1060, p) + Math.sin(t * 2) * 12, s: 1, r: Math.sin(t * 1.4) * 4, ry: Math.sin(t) * 20 });
      const q = E.io(prog(t, 4.4, 5.2)); logo2.style.clipPath = `inset(0 ${(1 - q) * 100}% 0 0)`;
      rise(mis2, t, 5.3, 8.4, { stagger: .07 });
    }
    if (t >= 8.5 && t < 14.5) {
      const k = clamp(Math.floor((t - 8.5) / 2), 0, 2), t0 = 8.5 + k * 2;
      bg3.style.background = TRI[k][2];
      kick3.style.opacity = 1;
      tri.forEach((g, i) => {
        g.g.style.display = i === k ? '' : 'none'; if (i !== k) return;
        SLAM(g.l1, t, t0, t0 + 1.8, 1.4); SLAM(g.l2, t, t0 + .1, t0 + 1.8, 1.4);
        g.strike.style.transform = `scaleX(${E.out(prog(t, t0 + .5, t0 + .75))})`;
        SLAM(g.l3, t, t0 + 1.0, t0 + 1.8);
      });
      const b = E.back(clamp(bph(t - 8.5) / .5));
      locky3.style.transform = `translateY(${(1 - b) * -40}px) rotate(${Math.sin(t * 4) * 8}deg) scale(${1 + .05 * (1 - b)})`;
    }
    if (t >= 14.5 && t < 26.5) {
      eco.forEach((e, i) => {
        const a = 14.5 + i * 4, inP = E.out(prog(t, a, a + .5));
        e.p.style.display = t >= a ? '' : 'none';
        if (t < a || t > a + 4.6) return;
        e.p.style.transform = i ? `translateY(${(1 - inP) * 110}%) rotate(${(1 - inP) * 8}deg)` : '';
        const lt = t - a, drop = E.back(prog(t, a + .25, a + .95));
        e.o.set({ x: 540 + Math.sin(lt * 1.5) * 18, y: lerp(-400, 1010, drop) + Math.sin(lt * 2.4) * 16, s: 1, r: Math.sin(lt * 1.7) * 5, ry: Math.sin(lt * 1.2) * 22 });
        SLAM(e.n, t, a + .5, 99, 1.6);
        rise(e.k, t, a + .3, 99); rise(e.l, t, a + 1.0, 99);
      });
    }
    if (t >= 26.5 && t < 32.5) {
      const k = beat(t - 26.5), ph = bph(t - 26.5), i = k % 8;
      bg5.style.background = BGC[i]; bg5.style.color = INK[i];
      rows.forEach((r, j) => r.style.transform = `rotate(-12deg) translateX(${(j % 2 ? 1 : -1) * ((t - 26.5) * 260 % 1100)}px)`);
      if (img5.dataset.k != i) { img5.dataset.k = i; img5.src = A + ARTS[i]; await img5.decode().catch(() => { }); }
      const f = E.back(clamp(ph / .45));
      card5.set({ x: 540, y: 960, s: 1.4 * (1 + .1 * (1 - E.out(clamp(ph / .3)))), ry: (1 - f) * -95 * (k % 2 ? -1 : 1), rx: 8 * Math.sin(t * 2), rz: k % 2 ? 5 : -5 });
      [...h5a, ...h5b].forEach(h => h.style.color = INK[i]);
      h5a.forEach((h, j) => SLAM(h, t, 26.6 + j * .5, 29.4)); h5b.forEach((h, j) => SLAM(h, t, 29.5 + j * .5, 32.3));
    }
    if (t >= 32.5 && t < 36.5) {
      const p = E.back(prog(t, 32.5, 33.3));
      const ts = .4 + .6 * p, ty = 1500;
      totem6.set({ x: 470, y: ty, s: ts, r: Math.sin(t * 2) * 1.5, glow: (Math.sin(t * 6) + 1) / 2 });
      const bp = totem6.badgeAt(470, ty, ts);
      rings6.forEach((r, i) => { const q = ((t - 33 + i * .5) % 1.5) / 1.5; css(r, { left: (bp.x - 150) + 'px', top: (bp.y - 150) + 'px', opacity: t > 33 ? (1 - q) * .9 : 0, transform: `scale(${.4 + q * 1.4})` }); });
      const cp = E.back(prog(t, 33.6, 34.3));
      card6.set({ x: lerp(1400, 860, cp), y: 1180 + Math.sin(t * 2) * 15, s: .42, rz: -14 + Math.sin(t * 1.5) * 4, ry: -24, rx: 8, z: 100 });
      rise(k6, t, 32.6, 99); h6.forEach((h, i) => SLAM(h, t, 32.7 + i * .5)); c6.forEach((c, i) => rise(c, t, 34.0 + i * .4, 99));
    }
    if (t >= 36.5 && t < 40.5) {
      const k = beat(t - 36.5), ph = bph(t - 36.5);
      const src = A + FIG[k % 4]; if (img7.dataset.s !== src) { img7.dataset.s = src; img7.src = src; await img7.decode().catch(() => { }); }
      frame7.style.transform = `rotate(${k % 2 ? 4 : -4}deg) scale(${1 + .06 * (1 - E.out(clamp(ph / .3)))})`;
      SLAM(h7, t, 36.6); rise(l7, t, 37.6, 99);
      const b = E.back(prog(t, 37.0, 37.6)); m7.style.transform = `translateY(${(1 - b) * 500}px) rotate(${Math.sin(t * 5) * 7}deg)`;
    }
    if (t >= 40.5) {
      const lt = t - 40.5;
      orb.forEach((c, j) => { const a = j / 8 * Math.PI * 2 + lt * .7; c.set({ x: 540 + Math.cos(a) * 560, y: 960 + Math.sin(a) * 800, z: Math.sin(a) * 300 - 700, s: .5, ry: a * 57 + 90, rx: 10 }); });
      end8.querySelectorAll('.r').forEach((e, i) => { const q = E.out5(prog(t, 40.8 + i * .5, 41.0 + i * .5)); e.style.opacity = q; e.style.transform = `scale(${lerp(1.6, 1, q)})`; });
    }
  }
  return { duration: 45, render };
})();
