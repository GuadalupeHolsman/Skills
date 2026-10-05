// Renders video.html frame by frame and pipes it to ffmpeg.
// Usage: node render.mjs [stills t1,t2,...]
import { createRequire } from 'node:module';
import path from 'node:path';
const { chromium } = createRequire(path.join(process.env.NODE_PATH || '', 'x.js'))('playwright');
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const FPS = 30, DURATION = 60;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.addInitScript(() => { window.__RENDER__ = true; });
await page.goto(pathToFileURL(path.resolve('video.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'body{display:block!important}' });
const stage = await page.$('#stage');

if (process.argv[2] === 'stills') {
  for (const t of process.argv[3].split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await stage.screenshot({ path: `stills/t${String(t).padStart(5, '0')}.png` });
  }
} else {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', 'music.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    'loomlock-phone-free-event.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * DURATION; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await stage.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${FPS * DURATION}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
