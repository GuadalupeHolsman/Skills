// THE FILM — "Solo un segundito". Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Circ = globalThis.Circ, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, DY = Circ.DESK_Y;
  const CX = 470; // Circulito
  const PHONE_DESK = [250, DY - 40];

  const lampsAt = (t, hour) => [t >= ev.lampL && hour >= 20.9 ? 0 : 1, t >= ev.lampR && hour >= 20.9 ? 0 : 1];

  function crew(ctx, t, hour) {
    // back desks
    G.rrect(ctx, -20, 895, 330, 26, 6, { fill: Circ.C.deskTop, seed: 401, lw: 5 });
    G.rrect(ctx, 780, 895, 330, 26, 6, { fill: Circ.C.deskTop, seed: 402, lw: 5 });
    for (const c of S.crew) {
      if (!(hour >= c.arrive && hour < c.leave)) continue;
      const tick = S.hourTicks.find((h) => h.hour === c.arrive).t;
      const pop = t >= tick && t < tick + 0.3 ? ease.outBack(clamp((t - tick) / 0.3), 3) : 1;
      ctx.save(); ctx.translate(c.x, 900); ctx.scale(pop, pop); ctx.translate(-c.x, -900);
      Circ.buddy(ctx, { x: c.x, y: 900, s: 0.5, shape: c.shape, color: c.color, eyes: hour >= 13 && hour < 14 ? 'happy' : 'normal', look: c.x < 500 ? 1 : -1 });
      ctx.restore();
    }
  }

  function wallClock(ctx, t, hour) {
    const late = t >= ev.late && t < ev.morning && hour > 23;
    Circ.clock(ctx, 200, 420, 95, hour);
    const label = Circ.hhmm(hour);
    G.rrect(ctx, 125, 535, 150, 62, 14, { fill: late ? '#E5484D' : '#2D3142', seed: 410, lw: 4 });
    G.text(ctx, label, 200, 580, { size: 44, fam: 'Inter', weight: 800, color: '#FFFFFF', align: 'center', boil: 0.2 });
    // cobweb when it's very late
    if (late) { ctx.save(); ctx.globalAlpha = 0.7; for (let i = 0; i < 4; i++) G.line(ctx, [[60, 300], [60 + 90 * Math.cos(i * 0.45), 300 + 90 * Math.sin(i * 0.45)]], { lw: 2, seed: 420 + i, color: '#FFFFFF' }); ctx.restore(); }
  }

  // Circulito's state for frame t
  function circState(t, hour) {
    const o = { x: CX, y: DY + 40, r: 170, eyes: 'normal', mouth: 'smile', blush: 0.35, t };
    const hands = {};
    let phone = null; // {x, y, s, faceDown, lock, screen}
    const typingKey = [...S.keys].reverse().find((k) => k.t <= t);
    const typing = (t < ev.buzz) || (t >= ev.morning && t < ev.end);
    if (typing) {
      o.eyes = t >= ev.morning ? 'happy' : 'focus'; o.mouth = 'smile';
      if (t < ev.morning) o.brows = 'determined';
      const down = (h) => typingKey && typingKey.hand === h && t - typingKey.t < 0.1 ? 14 : 0;
      hands.L = [CX + 110, DY - 30 + down(0)]; hands.R = [700, DY - 30 + down(1)];
      o.sy = 1 - 0.03 * Math.max(0, 1 - clock.phase(t) * 4);
      phone = t >= ev.morning ? { x: PHONE_DESK[0], y: PHONE_DESK[1], s: 0.62, rot: -0.12, screen: 'on', lock: 1 } : { x: PHONE_DESK[0], y: PHONE_DESK[1], s: 0.62, rot: -0.12, screen: 'off', faceDown: true };
    } else if (t < ev.grab) {
      // the buzz: eyes slide to the phone
      const u = clamp((t - ev.buzz) / 0.25);
      o.look = -u; o.lookY = 0.8 * u; o.eyes = 'normal'; o.mouth = 'flat';
      hands.L = [CX + 110, DY - 20]; hands.R = [700, DY - 20];
      phone = { x: PHONE_DESK[0], y: PHONE_DESK[1], s: 0.62, rot: -0.12, screen: 'on', buzz: t < ev.buzz2 + 0.38 ? 1 : 0 };
    } else if (t < ev.scratch) {
      const lapse = clamp((hour - 9) / 12);
      o.eyes = hour < 13 ? 'wide' : hour < 17 ? 'normal' : 'tired';
      o.lookY = 0.9; o.mouth = hour < 15 ? 'smile' : 'flat';
      o.glow = 1; o.messy = clamp((hour - 12) / 7);
      o.sy = 1 - 0.07 * lapse; o.sx = 1 + 0.04 * lapse;
      o.y += 4 * Math.sin(Math.PI * clock.phase(t));
      phone = { x: CX + 20, y: DY - 40, s: 0.78, faceDown: true, held: true };
    } else if (t < ev.lock) {
      // ¿23:47?
      o.eyes = 'wide'; o.mouth = 'o'; o.lookY = -0.6; o.look = -0.6; o.messy = 1; o.sweat = true; o.glow = 0.6; o.brows = 'up';
      o.sy = 1.04;
      phone = { x: CX + 20, y: DY + 10, s: 0.78, faceDown: true, held: true };
    } else {
      // Loomlock on, the day rewinds
      o.eyes = t < ev.rewind0 ? 'wide' : 'closed'; o.mouth = t < ev.rewind0 ? 'o' : 'wavy'; o.messy = clamp((hour - 12) / 7);
      phone = { x: CX + 20, y: DY - 60, s: 0.95, screen: 'on', lock: clamp((t - ev.lock) / 0.25), held: true };
    }
    if (phone && phone.held) { hands.L = [phone.x - 50 * phone.s - 6, phone.y + 30]; hands.R = [phone.x + 50 * phone.s + 6, phone.y + 30]; }
    return { o, hands, phone };
  }

  Studio.film({
    draw(ctx, t) {
      const hour = S.hourAt(t);
      const lamps = lampsAt(t, hour);
      const night = hour >= 20.9 ? 1 : 0;
      const dark = (2 - lamps[0] - lamps[1]) / 2 * night;
      const st = circState(t, hour);

      ctx.save();
      // punch-in on the realization
      if (t >= ev.scratch && t < ev.lock) {
        const z = 1.55 + 0.05 * U.springKick(t, ev.scratch, 5, 6);
        ctx.translate(CX, 1000); ctx.scale(z, z); ctx.translate(-CX, -1000);
      }
      if (t >= ev.lock && t < ev.lock + 0.4) { const sh = 16 * Math.exp(-(t - ev.lock) * 10); ctx.translate(U.noise1(t * 40, 1) * sh, U.noise1(t * 40, 2) * sh); }

      Circ.room(ctx, { hour, lamps });
      wallClock(ctx, t, hour);
      crew(ctx, t, hour);
      Circ.chair(ctx, CX);
      Circ.body(ctx, st.o);
      Circ.deskTop(ctx);
      Circ.plant(ctx, 1010, DY - 10, { wilt: t >= ev.morning ? 0 : clamp((hour - 13) / 7) });
      Circ.mug(ctx, 95, DY - 10, { t, steam: hour < 12 ? 1 : 0, frozen: hour > 23 ? 1 : 0 });
      Circ.laptop(ctx, 760, { glow: dark > 0 ? 0 : 0.4 });
      if (st.phone) Circ.phone(ctx, st.phone.x, st.phone.y, { s: st.phone.s, rot: st.phone.rot || 0, screen: st.phone.screen || 'off', faceDown: st.phone.faceDown, buzz: st.phone.buzz || 0, t, lock: st.phone.lock || 0 });
      Circ.arms(ctx, st.o, st.hands);
      Circ.deskFront(ctx);

      // lights out: darken everything, keep the phone glow on his face
      if (dark > 0) {
        ctx.fillStyle = `rgba(14,16,40,${0.62 * dark})`; ctx.fillRect(-200, -200, W + 400, H + 400);
        if (t < ev.lock) {
          const g = ctx.createRadialGradient(CX, 1060, 20, CX, 1060, 330);
          g.addColorStop(0, 'rgba(127,211,255,0.38)'); g.addColorStop(1, 'rgba(127,211,255,0)');
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(CX - 330, 730, 660, 660); ctx.restore();
        }
      }
      ctx.restore();

      // rewind: tape lines + ◀◀
      if (t >= ev.rewind0 && t < ev.morning) {
        ctx.save();
        for (let i = 0; i < 6; i++) { const y = ((U.hash(i, Math.floor(t * 30)) * H) | 0); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, y, W, 6 + i * 2); }
        ctx.fillStyle = 'rgba(91,75,219,0.12)'; ctx.fillRect(0, 0, W, H);
        G.text(ctx, '◀◀ REBOBINANDO', 80, 300, { size: 54, fam: 'Inter', weight: 800, color: '#FFFFFF', stroke: '#2A2320', strokeW: 8, boil: 0.2 });
        ctx.restore();
      }
      // flashes on the hits
      for (const [tf, a] of [[ev.lock, 0.7], [ev.morning, 0.85]]) { const f = t >= tf ? a * Math.exp(-(t - tf) * 10) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,252,240,${f})`; ctx.fillRect(0, 0, W, H); } }

      if (t >= ev.scratch && t < ev.lock) G.bubble(ctx, '¡¿23:47?!', 640, 520, 520, 820, t, ev.scratch, ev.lock - 0.1, { size: 76 });
      if (t >= ev.lock - 0.01 && t < ev.rewind0 + 0.6) G.bubble(ctx, '¡Loomlock!', 560, 470, 520, 760, t, ev.lock, ev.rewind0 + 0.4, { size: 64 });
      for (const c of S.captions) G.caption(ctx, c, t);
      Circ.endCard(ctx, t, ev.end, ev.click, { tagline: 'Bloqueá distracciones. Recuperá tu día.' });
    },
    post: { paper: 0.35, vignette: 0.25, grain: 0.04 },
    fadeOut: 0.6,
  });
})();
