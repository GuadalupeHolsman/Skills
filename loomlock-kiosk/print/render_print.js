// Renders print/gracias.html to PNG (high-res) and PDF, one file per piece.
const { chromium } = require('playwright');
const path = require('path');
const P = __dirname, OUT = path.join(P, 'out');
require('fs').mkdirSync(OUT, {recursive: true});
const pieces = [
  {id: 'square', w: 1200, h: 1500, scale: 2.5, name: 'loomlock-thanks-panel-4x5'},
  {id: 'banner', w: 2400, h: 800, scale: 2, name: 'loomlock-thanks-banner'},
  {id: 'storyLink', w: 1080, h: 1920, scale: 2, name: 'loomlock-thanks-historia-link', file: 'historia.html'},
  {id: 'storyQR', w: 1080, h: 1920, scale: 2, name: 'loomlock-thanks-historia-qr', file: 'historia.html'},
];
(async () => {
  const b = await chromium.launch();
  for (const pc of pieces) {
    const p = await b.newPage({viewport: {width: pc.w, height: pc.h}, deviceScaleFactor: pc.scale});
    await p.goto('file://' + path.join(P, pc.file || 'gracias.html'));
    await p.evaluate(id => { document.querySelectorAll('.art').forEach(a => a.style.display = a.id === id ? '' : 'none') }, pc.id);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
    await p.locator('#' + pc.id).screenshot({path: path.join(OUT, pc.name + '.png')});
    await p.pdf({path: path.join(OUT, pc.name + '.pdf'), width: pc.w + 'px', height: pc.h + 'px', printBackground: true, pageRanges: '1'});
    await p.close();
  }
  await b.close(); console.log('rendered');
})();
