const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path');
const [,,mode,a,b,W]=process.argv; // mode: stills "t1,t2,..." | frames start end worker
(async()=>{
 const br=await chromium.launch({args:['--allow-file-access-from-files','--disable-web-security']});
 const pg=await br.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 pg.on('console',m=>console.log('PAGE:',m.text()));pg.on('pageerror',e=>console.log('ERR:',e.message));
 await pg.goto('file://'+path.resolve(__dirname,'index.html'));
 await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
 if(mode==='sfx'){fs.writeFileSync('sfx.json',JSON.stringify(await pg.evaluate(()=>({sfx:window.SFX,dur:window.DURATION}))));await br.close();return}
 if(mode==='stills'){fs.mkdirSync('stills',{recursive:true});
  for(const t of a.split(',').map(Number)){for(let s=0;s<t;s+=.5)await pg.evaluate(x=>renderAt(x),s);await pg.evaluate(x=>renderAt(x),t);await pg.screenshot({path:`stills/t${t.toFixed(1)}.jpg`,type:'jpeg',quality:85})}
  await br.close();return}
 fs.mkdirSync('frames',{recursive:true});const fps=30,s=+a,e=+b;
 for(let x=0;x<s/fps;x+=.5)await pg.evaluate(v=>renderAt(v),x);
 for(let f=s;f<e;f++){await pg.evaluate(v=>renderAt(v),f/fps);await pg.screenshot({path:`frames/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:93});if(f%150==0)console.log('w'+W,f)}
 await br.close();
})();
