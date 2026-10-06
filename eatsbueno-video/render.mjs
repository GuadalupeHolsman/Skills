// Renders index.html frame-by-frame with Playwright and encodes with ffmpeg.
// Usage: node render.mjs [out.mp4] [fps]          (full film)
//        node render.mjs --stills 1,5,12 outdir    (PNG stills at given seconds)
//        node render.mjs --meta meta.json          (tap/key/cut times for music.py)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const page_url = url.pathToFileURL(path.join(here, 'index.html')).href + '?render=1';
const args = process.argv.slice(2);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(page_url);
await page.evaluate(() => window.__ready);

if (args[0] === '--meta') {
  const fs = await import('node:fs');
  fs.writeFileSync(args[1] || 'meta.json', JSON.stringify(await page.evaluate(() => window.META), null, 1));
} else if (args[0] === '--stills') {
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
  const dur = await page.evaluate(() => window.DURATION);
  const frames = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.__seek(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.error(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
}
await browser.close();
