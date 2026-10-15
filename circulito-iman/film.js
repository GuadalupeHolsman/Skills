// THE FILM — "El imán". Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Circ = globalThis.Circ, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock, T } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, DY = Circ.DESK_Y;
  const CX = 520, R = 170;
  const PHONE = [180, DY - 40];
  const GRIP = [880, DY - 25];

  // how stretched he is (0 = round, 1 = maximum chicle)
  function pull(t) {
    if (t < ev.buzz || t >= ev.lock) return 0;
    if (t < ev.stretch1) return 0.08 * clamp((t - ev.buzz) / 0.3);
    if (t < ev.stretch2) return lerp(0.08, 0.45, ease.inOutQuad(clamp((t - ev.stretch1) / (ev.stretch2 - ev.stretch1))));
    if (t < ev.fly) return lerp(0.45, 0.8, ease.inOutQuad(clamp((t - ev.stretch2) / 1.2)));
    return lerp(0.8, 1.15, ease.inQuad(clamp((t - ev.fly) / (ev.lock - ev.fly))));
  }

  function circ(t) {
    const o = { x: CX, y: DY + 40, r: R, eyes: 'focus', brows: 'determined', mouth: 'smile', t };
    const hands = { L: [CX + 110, DY - 25], R: [720, DY - 25] };
    const p = pull(t);
    const key = [...S.keys].reverse().find((k) => k.t <= t);
    const down = (h) => (key && key.hand === h && t - key.t < 0.1 ? 14 : 0);
    if (t < ev.buzz) {
      hands.L[1] += down(0); hands.R[1] += down(1);
      for (const tp of [ev.peek1, ev.peek2]) { const u = (t - tp) / 0.3; if (u >= 0 && u < 1) { o.look = -Math.sin(Math.PI * u); o.lookY = 0.6 * Math.sin(Math.PI * u); o.eyes = 'normal'; o.brows = null; } }
    } else if (t < ev.lock) {
      const sx = 1 + p * 1.3, sy = 1 - p * 0.14;
      o.sx = sx; o.sy = sy;
      o.x = CX - (sx - 1) * R * 0.95; o.y -= 70 * clamp(p * 1.5);
      o.rot = -0.1 * p;
      o.eyes = 'wide'; o.look = -1; o.lookY = 0.4; o.eyeScale = 1 + p * 0.3; o.brows = 'worried'; o.mouth = p > 0.3 ? 'grin' : 'o'; o.sweat = p > 0.3;
      o.sweatY = Math.sin(t * 8) * 10;
      // left hand reaches for the phone (against his will), right hand grips the desk
      const reach = lerp(o.x - 60, PHONE[0] + 60, clamp(p * 1.2));
      hands.L = [reach, DY - 40 - Math.sin(t * 16) * 6 * p];
      // fingers slipping: the grip slides left on each slip, then lets go
      let gx = GRIP[0];
      ev.slips.forEach((ts, k) => { if (t >= ts) gx -= 40; });
      if (t >= ev.fly) gx = lerp(gx, o.x + o.r * o.sx * 0.9, clamp((t - ev.fly) / 0.15));
      hands.R = [gx + Math.sin(t * 40) * 3 * p, GRIP[1]];
    } else {
      // BOING: a decaying spring back to round, then calm typing
      const u = t - ev.lock;
      const spring = Math.exp(-u * 3.2) * Math.cos(u * 18);
      o.sx = 1 + 0.35 * spring; o.sy = 1 - 0.3 * spring;
      o.x = CX - 30 * spring;
      o.messy = 1;
      o.eyes = t < ev.calm ? 'spiral' : 'happy'; o.brows = null; o.mouth = t < ev.calm ? 'wavy' : 'grin'; o.blush = 0.6;
      if (t >= ev.calm) { hands.L[1] += down(0); hands.R[1] += down(1); }
      else { hands.L = [o.x - 230, 900 + 60 * spring]; hands.R = [o.x + 230, 900 - 60 * spring]; }
    }
    return { o, hands, p };
  }

  function magnet(ctx, t, p) {
    if (t < ev.buzz || t >= ev.lock) return;
    const ph = ((t - ev.buzz) / (BEAT / 2)) % 1;
    for (let k = 0; k < 3; k++) {
      const u = (ph + k / 3) % 1;
      const r = 80 + u * 520;
      ctx.save(); ctx.globalAlpha = (1 - u) * (0.5 + p * 0.5);
      ctx.strokeStyle = k % 2 ? '#E5484D' : '#5B4BDB'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(PHONE[0], PHONE[1], r, -0.9, 0.35); ctx.stroke();
      ctx.restore();
    }
  }

  function horseshoe(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.lineCap = 'butt'; ctx.lineWidth = 34;
    ctx.strokeStyle = '#2A2320'; ctx.beginPath(); ctx.arc(0, 0, 50, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = 24; ctx.strokeStyle = '#E5484D'; ctx.beginPath(); ctx.arc(0, 0, 50, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#D9DDE6'; ctx.fillRect(-62, 0, 24, 30); ctx.fillRect(38, 0, 24, 30);
    ctx.strokeStyle = '#2A2320'; ctx.lineWidth = 5; ctx.strokeRect(-62, 0, 24, 30); ctx.strokeRect(38, 0, 24, 30);
    ctx.restore();
  }

  Studio.film({
    draw(ctx, t) {
      const { o, hands, p } = circ(t);
      ctx.save();
      if (t >= ev.lock && t < ev.lock + 0.5) { const sh = 18 * Math.exp(-(t - ev.lock) * 9); ctx.translate(U.noise1(t * 40, 1) * sh, U.noise1(t * 40, 2) * sh); }
      Circ.room(ctx, { hour: 15 });
      G.rrect(ctx, 780, 895, 330, 26, 6, { fill: Circ.C.deskTop, seed: 402, lw: 5 });
      const staring = t >= ev.stretch2 - 0.2 && t < ev.calm;
      Circ.buddy(ctx, { x: 935, y: 900, s: 0.5, shape: 'square', color: '#7CC4A4', look: -1, eyes: t >= ev.calm ? 'happy' : staring ? 'wide' : 'normal', mouth: staring ? 'flat' : 'smile' });
      Circ.chair(ctx, CX);
      Circ.body(ctx, o);
      Circ.deskTop(ctx);
      Circ.mug(ctx, 990, DY - 10, { t });
      Circ.laptop(ctx, 760, {});
      magnet(ctx, t, p);
      const locked = t >= ev.lock;
      const buzzing = t >= ev.buzz && t < ev.lock;
      Circ.phone(ctx, PHONE[0], PHONE[1], { s: 0.62, rot: -0.12, faceDown: !locked, screen: locked ? 'on' : 'off', lock: locked ? clamp((t - ev.lock) / 0.2) : 0, buzz: buzzing ? 0.4 + 0.6 * p : 0, t });
      if (buzzing && p > 0.05 && p < 0.3) horseshoe(ctx, PHONE[0], PHONE[1] - 170 - Math.sin(t * 10) * 8, 0.9 * clamp(p * 4) * clamp((0.3 - p) * 8));
      Circ.arms(ctx, o, hands);
      Circ.deskFront(ctx);
      ctx.restore();

      // speech bubbles
      G.bubble(ctx, '¿…estás bien?', 760, 700, 920, 820, t, ev.huh, ev.huh + 1.4, { size: 54 });
      G.bubble(ctx, '¡re bien! ¡todo bien!', 520, 560, o.x, 860, t, ev.fine, ev.fly - 0.1, { size: 58 });
      if (t >= ev.lock - 0.01) G.bubble(ctx, '¡Loomlock!', 420, 520, PHONE[0] + 30, DY - 160, t, ev.lock, ev.lock + 1.0, { size: 72 });
      const f = t >= ev.lock ? 0.8 * Math.exp(-(t - ev.lock) * 10) : 0;
      if (f > 0.01) { ctx.fillStyle = `rgba(255,252,240,${f})`; ctx.fillRect(0, 0, W, H); }
      for (const c of S.captions) G.caption(ctx, c, t);
      Circ.endCard(ctx, t, ev.end, ev.click, { tagline: 'Cuando el celu tira, Loomlock frena.' });
    },
    post: { paper: 0.35, vignette: 0.25, grain: 0.04 },
    fadeOut: 0.6,
  });
})();
