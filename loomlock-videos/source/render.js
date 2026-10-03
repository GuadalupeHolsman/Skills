// usage: node render.js <v> <fmt> <lang> stills <out.png> t1,t2,...   |   node render.js <v> <fmt> <lang> video <out.mp4> [workers]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const [v, fmt, lang, mode, out, extra] = process.argv.slice(2);
const ROOT = __dirname, FPS = 30;
const W = fmt === 'h' ? 1920 : 1080, H = fmt === 'h' ? 1080 : 1920;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  page.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?v=${v}&fmt=${fmt}&lang=${lang}`);
  await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
  return page;
}
const shot = async (page, t) => { await page.evaluate(t => window.renderAt(t), t); return page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: W, height: H } }); };

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--disable-web-security', '--font-render-hinting=none'] });
  if (mode === 'stills') {
    const page = await openPage(browser);
    const times = extra.split(',').map(Number), tmp = [];
    for (const t of times) { const f = `${out}.${t}.jpg`; fs.writeFileSync(f, await shot(page, t)); tmp.push(f); }
    const cols = fmt === 'h' ? 3 : 5;
    execFileSync('montage', [...tmp.flatMap(f => ['-label', path.basename(f).replace(/^.*\.jpg\./, '').replace(/\.jpg$/, 's'), f]), '-tile', `${cols}x`, '-geometry', fmt === 'h' ? '640x360+6+6' : '300x533+6+6', '-pointsize', '22', '-background', '#222', '-fill', 'white', out]);
    tmp.forEach(f => fs.unlinkSync(f));
  } else {
    const page0 = await openPage(browser);
    const dur = await page0.evaluate('window.DURATION'); await page0.close();
    const total = Math.round(dur * FPS), K = Number(extra || 3), per = Math.ceil(total / K);
    const t0 = Date.now(), segs = [];
    await Promise.all(Array.from({ length: K }, async (_, k) => {
      const a = k * per, b = Math.min(total, a + per); if (a >= b) return;
      const seg = `${out}.seg${k}.mp4`; segs[k] = seg;
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
      const page = await openPage(browser);
      for (let i = a; i < b; i++) {
        const buf = await shot(page, i / FPS);
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (k === 0 && i % 90 === 0) console.log(`frame ${i}/${b} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
    }));
    const list = `${out}.txt`; fs.writeFileSync(list, segs.filter(Boolean).map(s => `file '${path.resolve(s)}'`).join('\n'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
    segs.forEach(s => s && fs.unlinkSync(s)); fs.unlinkSync(list);
    console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
