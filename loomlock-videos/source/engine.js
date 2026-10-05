// Deterministic motion engine: everything is a pure function of time t (seconds).
const Q = new URLSearchParams(location.search);
const FMT = Q.get('fmt') || 'h';            // h = 1920x1080, v = 1080x1920
const LANG = Q.get('lang') || 'en';
const H = FMT === 'h';
const W = H ? 1920 : 1080, HT = H ? 1080 : 1920;
const A = 'assets/';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  out: p => 1 - Math.pow(1 - p, 3),
  out5: p => 1 - Math.pow(1 - p, 5),
  in: p => p * p * p,
  io: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  back: p => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
};
// 0→1 fade in over [a,a+fi], 1→0 fade out over [b-fo,b]
const win = (t, a, b, fi = .45, fo = .45) => Math.min(E.out(prog(t, a, a + fi)), 1 - E.in(prog(t, b - fo, b)));

const $ = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const add = (parent, html) => { const e = $(html); parent.appendChild(e); return e; };
const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };

// Text that rises in: opacity + translateY + blur, with stagger over children marked .r
function rise(el, t, a, b, { dy = 40, stagger = .08, fi = .55, fo = .4 } = {}) {
  const parts = el.querySelectorAll('.r');
  const list = parts.length ? parts : [el];
  list.forEach((p, i) => {
    const pin = E.out(prog(t, a + i * stagger, a + i * stagger + fi));
    const pout = E.in(prog(t, b - fo, b));
    const o = Math.min(pin, 1 - pout);
    p.style.opacity = o;
    p.style.transform = `translateY(${(1 - pin) * dy - pout * dy * .5}px)`;
    p.style.filter = o < 1 ? `blur(${(1 - o) * 8}px)` : 'none';
  });
  if (parts.length) el.style.opacity = 1;
}

// ---------- background ----------
function makeBG(stage, dark) {
  const bg = add(stage, `<div class="bg ${dark ? 'dark' : ''}"></div>`);
  const blobs = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const s = 260 + (i * 137) % 300;
    const b = add(bg, `<div class="blob" style="width:${s}px;height:${s * 1.25}px"></div>`);
    blobs.push({ b, x: (i * 0.37 % 1) * W, y: (i * 0.61 % 1) * HT, s, sp: 8 + (i % 4) * 5, r: (i * 23) % 40 - 20 });
  }
  add(stage, `<div class="vignette"></div>`);
  return {
    el: bg, update(t) {
      blobs.forEach((o, i) => {
        const y = o.y - t * o.sp;
        o.b.style.transform = `translate(${o.x + Math.sin(t * .2 + i) * 30}px,${((y % (HT + 600)) + HT + 600) % (HT + 600) - 400}px) rotate(${o.r}deg) skewY(-18deg)`;
      });
    }
  };
}

// ---------- 3D phone ----------
function makePhone(parent) {
  const root = add(parent, `<div class="obj"><div class="phone"></div></div>`);
  const ph = root.firstChild;
  for (let i = 12; i >= 1; i--) add(ph, `<div class="lyr" style="transform:translateZ(${-i * 1.3}px)"></div>`);
  const front = add(ph, `<div class="front"><div class="screen"><div class="island"></div><div class="glare"></div></div></div>`);
  const screen = front.firstChild;
  const sh = add(parent, `<div class="shadow" style="width:520px;height:90px"></div>`);
  return {
    root, screen, sh,
    // x,y = center position on stage; s = scale
    set({ x, y, s = 1, rx = 0, ry = 0, rz = 0, o = 1, shY = 470, shO = .8 }) {
      root.style.transform = `translate(${x - 209}px,${y - 436}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      root.style.opacity = o;
      sh.style.transform = `translate(${x - 260}px,${y + shY * s - 45}px) scale(${s})`;
      sh.style.opacity = o * shO;
    }
  };
}
function statusBar(dark) {
  return `<div class="sbar" style="color:${dark ? '#111' : '#fff'}"><span>9:41</span><i>▂▄▆ ◔ ▭</i></div>`;
}

// ---------- 3D card ----------
const KEY_GLYPH = (c = '#fff', s = 120) => `<svg width="${s}" height="${s * 1.25}" viewBox="0 0 100 125" fill="none">
  <path d="M20 30 Q50 6 80 30" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
  <path d="M30 42 Q50 26 70 42" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
  <path d="M41 54 Q50 46 59 54" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
  <rect x="24" y="64" width="52" height="56" rx="14" fill="${c}"/>
  <circle cx="40" cy="88" r="5" fill="#0003"/><circle cx="60" cy="88" r="5" fill="#0003"/>
  <path d="M44 99 Q50 104 56 99" stroke="#0003" stroke-width="3" stroke-linecap="round"/></svg>`;
function makeCard(parent, front, backColor = '#3F4ACD', backLabel = 'Season 0') {
  const root = add(parent, `<div class="obj"><div class="card"></div></div>`);
  const c = root.firstChild;
  for (let i = 1; i <= 6; i++) add(c, `<div class="edge" style="transform:translateZ(${-i * 1.1 + 3.3}px)"></div>`);
  add(c, `<div class="face" style="transform:translateZ(4px)"><img src="${A + front}"></div>`);
  add(c, `<div class="face back" style="transform:rotateY(180deg) translateZ(4px);background:${backColor}"><div class="keyback"><div class="t1">loomlock</div><div class="t2">${backLabel}</div>${KEY_GLYPH('#fff', 110)}<div class="t3">key</div></div></div>`);
  return {
    root, set({ x, y, s = 1, rx = 0, ry = 0, rz = 0, o = 1, z = 0 }) {
      root.style.transform = `translate3d(${x - 320}px,${y - 202}px,${z}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      root.style.opacity = o;
    }
  };
}

// ---------- Card 0 coin ----------
function makeCoin(parent) {
  const root = add(parent, `<div class="obj"><div class="coin"></div></div>`);
  const c = root.firstChild;
  for (let i = 1; i <= 14; i++) add(c, `<div class="cl" style="transform:translateZ(${-i * 1.2}px);background:${i % 2 ? '#2a33a8' : '#1f278c'}"></div>`);
  add(c, `<img src="${A}card0.png" style="transform:translateZ(1px)">`);
  return {
    root, set({ x, y, s = 1, rx = 0, ry = 0, rz = 0, o = 1 }) {
      root.style.transform = `translate(${x - 260}px,${y - 260}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      root.style.opacity = o;
    }
  };
}

// ---------- image sequence ----------
function makeSeq(parent, name, count, style = '') {
  const el = add(parent, `<div class="foot" style="${style}"><img></div>`);
  const img = el.firstChild;
  const srcs = Array.from({ length: count }, (_, i) => `${A}seq_${name}/${String(i + 1).padStart(3, '0')}.jpg`);
  srcs.forEach(s => PRELOAD.push(s));
  return {
    el, srcs, async frame(lt) {
      const i = clamp(Math.floor(lt * 30), 0, count - 1);
      if (img.dataset.i != i) { img.dataset.i = i; img.src = srcs[i]; await img.decode().catch(() => { }); }
    }
  };
}

// ---------- tap feedback inside phone screens ----------
function makeTap(screen) {
  const ring = add(screen, `<div class="tapring"></div>`), dot = add(screen, `<div class="tapdot"></div>`);
  return {
    at(t, t0, x, y) {
      const p = prog(t, t0, t0 + .55);
      const on = t >= t0 - .25 && t <= t0 + .6;
      css(dot, { left: x + 'px', top: y + 'px', opacity: on ? (t < t0 ? E.out(prog(t, t0 - .25, t0)) : 1 - p) : 0, transform: `scale(${t < t0 ? 1.2 : 1 - p * .3})` });
      css(ring, { left: x + 'px', top: y + 'px', opacity: on && t >= t0 ? 1 - p : 0, transform: `scale(${.4 + p * 1.4})` });
    }
  };
}
function hl(screen, x, y, w, h, r = 16) { return add(screen, `<div class="hl" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px"></div>`); }
function pulseHL(el, t, a, b) {
  const o = win(t, a, b, .3, .3);
  el.style.opacity = o;
  el.style.transform = `scale(${1 + Math.sin((t - a) * 6) * .02})`;
}

const PRELOAD = [];
async function ready() {
  document.querySelectorAll('img').forEach(i => i.src && PRELOAD.push(i.src));
  await Promise.all(PRELOAD.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s; })));
  await document.fonts.ready;
}

// ---------- kinetic type helpers (videos 4 & 5) ----------
const BIG = (txt, size, extra = '', font = 'Montserrat', w = 900) => `<div style="font:${w} ${size}px/0.92 '${font}';letter-spacing:${font === 'Montserrat' ? '-.035em' : '-.01em'};${extra}">${txt}</div>`;
function SLAM(el, t, t0, tout = 999, from = 1.9) {
  const p = E.out5(prog(t, t0, t0 + .16)), q = E.in(prog(t, tout, tout + .25));
  el.style.opacity = t < t0 ? 0 : 1 - q;
  el.style.transform = `scale(${lerp(from, 1, p) + q * 1.4})`;
  el.style.filter = q > 0 ? `blur(${q * 14}px)` : 'none';
}
// simple 2.5D "object" (cutout image) with float, tilt and drop shadow
function makeObj(parent, src, w) {
  const el = add(parent, `<div class="abs" style="left:0;top:0;width:${w}px"><img src="${A}${src}" style="width:100%;display:block;filter:drop-shadow(0 40px 50px rgba(0,0,40,.45))"></div>`);
  PRELOAD.push(A + src);
  return { el, set({ x, y, s = 1, r = 0, ry = 0, o = 1 }) { el.style.transform = `translate(${x - w / 2}px,${y - el.offsetHeight / 2}px) perspective(1200px) rotateY(${ry}deg) rotate(${r}deg) scale(${s})`; el.style.opacity = o; } };
}

// ---------- Locky totem (large 3D-printed Locky figure people tap at events) ----------
function makeTotem(parent, w = 620) {
  const mh = w * 1127 / 1194, ph = w * .36;
  const el = add(parent, `<div class="abs" style="left:0;top:0;width:${w}px;height:${mh + ph}px;transform-origin:50% 100%">
    <div class="abs" style="left:${w * .08}px;right:${w * .08}px;top:${mh - ph * .3}px;height:${ph * 1.3}px">
      <div class="abs" style="left:0;right:0;top:${ph * .2}px;bottom:0;border-radius:0 0 50% 50% / 0 0 30% 30%;background:linear-gradient(90deg,#0b1050,#1D29C2 45%,#0b1050)"></div>
      <div class="abs" style="left:0;right:0;top:0;height:${ph * .4}px;border-radius:50%;background:radial-gradient(closest-side,#5F68D7,#2a33a8);box-shadow:0 0 40px rgba(159,216,255,.5)"></div>
      <div class="abs" style="left:0;right:0;bottom:${ph * .1}px;text-align:center;font:800 ${w * .04}px Montserrat;letter-spacing:.2em;color:#9FD8FF">TAP HERE</div></div>
    <img src="${A}mascot.png" class="abs" style="left:0;top:0;width:${w}px;filter:drop-shadow(0 30px 40px rgba(0,0,30,.45))">
    <div class="badge abs center" style="left:${w * .5 - w * .085}px;top:${mh + ph * .36 - w * .085}px;width:${w * .17}px;height:${w * .17}px;border-radius:50%;background:#fff;box-shadow:0 0 0 ${w * .012}px #9FD8FF,0 0 ${w * .08}px rgba(159,216,255,.9)">${KEY_GLYPH('#3F49CC', w * .07)}</div></div>`);
  PRELOAD.push(A + 'mascot.png');
  const badge = el.querySelector('.badge');
  return {
    el, w, h: mh + ph, badge,
    // x,y = bottom-center of the pedestal
    set({ x, y, s = 1, r = 0, o = 1, glow = 0 }) {
      el.style.transform = `translate(${x - w / 2}px,${y - (mh + ph)}px) rotate(${r}deg) scale(${s})`; el.style.opacity = o;
      badge.style.transform = `scale(${1 + glow * .12})`;
    },
    // badge center in stage coords for given placement (no rotation)
    badgeAt(x, y, s = 1) { return { x, y: y - (ph * .64) * s }; }
  };
}
