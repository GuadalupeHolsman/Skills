const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const [,, html, out, fps, dur, only] = process.argv;
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const p = await b.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror', e=>console.error('PAGEERR', e.message));
  await p.goto('file://'+html); await p.evaluate(()=>window.ready||document.fonts.ready);
  await p.waitForTimeout(300);
  const N = Math.round(fps*dur);
  const list = only ? only.split(',').map(Number).map(s=>Math.round(s*fps)) : [...Array(N).keys()];
  for (const i of list){ await p.evaluate(t=>window.render(t), i/fps);
    await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.jpg`, type:'jpeg', quality:92}); }
  await b.close();
})();
