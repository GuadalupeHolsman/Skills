(function () {
  const G = globalThis.G, L = globalThis.LOOM, Studio = globalThis.Studio, W = G.W, H = G.H;
  const ids = ['cine', 'gym', 'foco', 'dormir', 'fiesta'];
  Studio.film({
    async init() { await L.load(); },
    draw(ctx, t) {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
      const i = Math.floor(t);
      if (i === 0) L.locky(ctx, W / 2, H * 0.93, H * 1.05, {});
      else if (i <= 5) L.key(ctx, L.KEYS[ids[i - 1]], W / 2, H / 2, W * 0.86, {});
      else L.logo(ctx, W / 2, H / 2, W * 0.9, {});
    },
    post: {}, fadeOut: 0,
  });
})();
