// Browser regression for linked subtitles and inline explanations. Uses local audio only.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),extension=path.resolve(root,'../mandarin-extension');
const fixture=JSON.parse(fs.readFileSync(path.join(root,'data/lesson.json')));
fixture.sentences[0].meaningLinks=[{zh:[0],en:[4,5,6]},{zh:[1],en:[0]},{zh:[2],en:[1,2,3]},{zh:[0,1],en:[0,4,5,6],note:'Completion and duration jointly express finishing within forty minutes.'}];
const audio=fs.readFileSync(process.env.STUDY_AUDIO);
async function media(p){await p.route('https://study.test/source.m4a',r=>{const m=/bytes=(\d+)-(\d*)/.exec(r.request().headers().range||''),a=m?+m[1]:0,b=m&&m[2]?Math.min(+m[2],audio.length-1):audio.length-1;return r.fulfill({status:m?206:200,body:audio.subarray(a,b+1),contentType:'audio/mp4',headers:{'Accept-Ranges':'bytes',...(m?{'Content-Range':`bytes ${a}-${b}/${audio.length}`}:{})}})});}
async function common(p,scope,isExtension){
 const zh=scope.locator('#zh'),en=scope.locator('#en'),note=scope.locator('#vocab'),close=scope.locator(isExtension?'#closeWord':'#closeVocab');
 assert.equal(await en.innerText(),fixture.sentences[0].en,'tokenizing must preserve the translation exactly');
 await en.locator('[data-meaning-index="3"]').hover();assert.equal(await zh.locator('.meaning-hover ruby>span').allTextContents().then(x=>x.join('')),'一本书');
 await zh.locator('[data-meaning-index="0"]').hover();assert.equal(await en.locator('.meaning-hover').count(),4,'overlap may link one word to several English spans');
 await en.locator('[data-meaning-index="3"]').click();assert.equal(await note.isVisible(),true);assert.equal(await note.evaluate(e=>getComputedStyle(e).position),'static');
 assert.equal(await scope.locator(isExtension?'#vz':'#vocabZh').innerText(),'一本书');
 const bounds=await note.boundingBox(),enBox=await en.boundingBox();assert.ok(bounds.y>=enBox.y+enBox.height-1,'explanation belongs underneath the clicked bilingual sentence');
 assert.ok(await note.evaluate(e=>e.parentElement.contains(e.parentElement.querySelector('#zh'))),'caption note must be in the caption itself');
 assert.ok(await p.locator(isExtension?'video':'#audio').evaluate(v=>v.paused),'reading an explanation should pause the recording');
 await close.click();assert.equal(await note.isVisible(),false);
 await en.locator('[data-meaning-index="3"]').focus();assert.equal(await zh.locator('.meaning-hover ruby>span').allTextContents().then(x=>x.join('')),'一本书');await p.keyboard.press('Enter');await p.keyboard.press('Escape');assert.equal(await note.isVisible(),false);
}
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tingdong-meaning-'));
 const c=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH,headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 try{
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await media(p);
  await p.route('https://www.bilibili.com/**',r=>r.fulfill({contentType:'text/html',body:'<html><style>body{margin:0}main{max-width:1000px;margin:auto}#playerWrap{height:400px}.bpx-player-container{height:100%;position:relative}video{width:100%;height:100%;object-fit:contain}</style><body><main><div id="playerWrap"><div class="bpx-player-container"><video src="https://study.test/source.m4a" controls></video></div></div></main></body></html>'}));
  let worker=c.serviceWorkers()[0]||await c.waitForEvent('serviceworker');await worker.evaluate(data=>chrome.storage.local.set({'lesson:BV1MRJa6sEsk:1':data}),fixture);
  for(const viewport of [{width:1366,height:768},{width:1024,height:640},{width:390,height:844}]){
   await p.setViewportSize(viewport);await p.goto('https://www.bilibili.com/video/BV1MRJa6sEsk/');const h=p.locator('#tingdong-extension');await h.locator('article').nth(459).waitFor({state:'attached'});await p.waitForFunction(()=>document.querySelector('video').readyState>=1);await p.locator('video').evaluate(v=>v.currentTime=.5);await h.locator('#en .meaning-current').first().waitFor();await common(p,h,true);
   await h.locator('#zh .word').first().click();assert.equal(await h.locator('#characters dt').count(),4);await p.waitForTimeout(400);assert.ok(await h.locator('header').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1));const videoBox=await p.locator('video').boundingBox(),noteBox=await h.locator('#vocab').boundingBox();assert.ok(videoBox.y+videoBox.height<=noteBox.y,'note must not cover the video');await h.locator('#closeWord').click();
   await h.locator('#expand').click();await h.locator('#s-0 .meaning-word').nth(3).click();assert.equal(await h.locator('#vocab').evaluate(e=>e.parentElement.id),'s-0');await h.locator('#closeWord').click();await h.locator('#expand').click();
   await h.locator('#fullscreen').click();await p.waitForFunction(()=>!!document.fullscreenElement);await common(p,h,true);await h.locator('#fullscreen').click();
   if(process.env.LAYOUT_OUTPUT){await h.locator('#en .meaning-word').nth(3).click();await p.screenshot({path:path.join(process.env.LAYOUT_OUTPUT,`meaning-extension-${viewport.width}.png`)});}
  }
  assert.deepEqual(errors,[]);console.log('Extension: both directions, overlapping links, playback highlights, inline notes, keyboard and fullscreen pass at all three viewports.');
 }finally{await c.close();fs.rmSync(profile,{recursive:true,force:true});}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
 try{
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/data/lesson.json',r=>r.fulfill({json:fixture}));
  for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
   await p.setViewportSize(viewport);await p.goto(process.env.STUDY_TEST_URL||'http://localhost:8087/',{waitUntil:'domcontentloaded'});await p.locator('#sentence-459').waitFor({state:'attached'});await p.locator('.setup summary').click();await p.locator('#audioFile').setInputFiles(process.env.STUDY_AUDIO);await p.waitForFunction(()=>document.querySelector('#audio').readyState>=1);await p.locator('#audio').evaluate(v=>v.currentTime=.5);await p.locator('#en .meaning-current').first().waitFor();await common(p,p,false);
   await p.locator('#sentence-0 .meaning-word').nth(3).click();assert.equal(await p.locator('#vocab').evaluate(e=>e.parentElement.id),'sentence-0');await p.locator('#closeVocab').click();
   await p.locator('#fullscreen').click();await p.waitForFunction(()=>!!document.fullscreenElement);await common(p,p,false);await p.locator('#fullscreen').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('Website: desktop and phone meaning links, inline notes, keyboard, local playback and fullscreen pass.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
