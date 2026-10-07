// Renders index.html frame-by-frame with Playwright and encodes with ffmpeg.
// Usage: node render.mjs [out.mp4] [fps] [--sub N] [--workers N] [--page file.html]   (full film)
//          --sub N     render N sub-frames per output frame and blend them (motion blur, 180°-style shutter)
//          --workers N render N chunks in parallel browser pages
//        node render.mjs --stills 1,5,12 outdir    (PNG stills at given seconds)
//        node render.mjs --meta meta.json          (tap/key/cut times for music.py)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv.splice(i, 2)[1] : def; };
const PAGE = opt('--page', 'index.html');
const pageUrl = url.pathToFileURL(path.join(here, PAGE)).href + '?render=1';
const SUB = Number(opt('--sub', 1));
const WORKERS = Number(opt('--workers', 1));
const args = argv;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const openPage = async () => {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(pageUrl);
  await page.evaluate(() => window.__ready);
  return page;
};
const run = (cmd, a, stdio = ['pipe', 'inherit', 'inherit']) => spawn(cmd, a, { stdio });
const done = (p) => new Promise((r, j) => p.on('close', (c) => (c === 0 ? r() : j(new Error(`exit ${c}`)))));

if (args[0] === '--meta') {
  const page = await openPage();
  fs.writeFileSync(args[1] || 'meta.json', JSON.stringify(await page.evaluate(() => window.META), null, 1));
} else if (args[0] === '--stills') {
  const page = await openPage();
  const times = args[1].split(',').map(Number);
  const outDir = args[2] || '.';
  for (const t of times) {
    await page.evaluate((t) => window.__seek(t), t);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, `still_${String(t).replace('.', '_')}.png`) });
  }
} else {
  const out = args[0] || path.join(here, 'eatsbueno_video_silent.mp4');
  const fps = Number(args[1] || 30);
  const rate = fps * SUB;                       // sub-frame rate actually captured
  const probe = await openPage();
  const dur = await probe.evaluate(() => window.DURATION);
  await probe.close();
  const total = Math.round(dur * rate);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ebrender-'));
  const chunk = Math.ceil(total / WORKERS);

  // 1) capture sub-frames in parallel chunks, each encoded to a near-lossless segment
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const a = w * chunk, b = Math.min(total, a + chunk);
    if (a >= b) return;
    const page = await openPage();
    const ff = run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(rate), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '10', '-pix_fmt', 'yuv444p', path.join(tmp, `seg${String(w).padStart(2, '0')}.mkv`)]);
    for (let f = a; f < b; f++) {
      await page.evaluate((t) => window.__seek(t), f / rate);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - a) % 240 === 0) console.error(`worker ${w}: ${f - a}/${b - a}`);
    }
    ff.stdin.end();
    await done(ff);
    await page.close();
  }));

  // 2) join segments, blend each group of SUB sub-frames into one output frame, encode
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, fs.readdirSync(tmp).filter((f) => f.endsWith('.mkv')).sort().map((f) => `file '${path.join(tmp, f)}'`).join('\n'));
  const vf = SUB > 1 ? `tmix=frames=${SUB},framestep=${SUB},setpts=N/(${fps}*TB),format=yuv420p` : 'format=yuv420p';
  await done(run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', vf, '-r', String(fps),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', out], ['ignore', 'inherit', 'inherit']));
  fs.rmSync(tmp, { recursive: true, force: true });
}
await browser.close();
