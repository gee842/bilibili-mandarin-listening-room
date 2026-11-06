(()=>{
if(document.getElementById('tingdong-extension'))return;
const host=document.createElement('div');host.id='tingdong-extension';host.hidden=true;
const root=host.attachShadow({mode:'open'});
root.innerHTML=`<style>
:host{all:initial;display:block;position:relative;clear:both;width:100%;margin:12px 0 20px;z-index:20;color:#233e35;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}:host([hidden]){display:none!important}[hidden]{display:none!important}button,input,select{font:inherit;color:inherit}button,summary{cursor:pointer}button{background:#f5f2e9;border:1px solid #d9ddd1;border-radius:6px;min-height:36px;padding:6px 10px}button:disabled{opacity:.4;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #658b36;outline-offset:2px}#panel{position:relative;background:#f5f2e9;border:1px solid #d9ddd1;border-radius:12px;overflow:visible}header{padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid #d9ddd1}header strong{font:24px serif}#source{font-size:10px;flex:1}header button{font-size:11px}#status{font-size:11px;line-height:1.6;padding:7px 16px;background:#e9eddf;margin:0}.controls{display:flex;gap:9px;align-items:center;padding:8px 16px;flex-wrap:wrap}.controls button,.controls select{min-height:36px}.controls select{background:transparent;border:0}#seek{flex:1;min-width:80px;accent-color:#233e35}#time{font-size:11px;font-variant-numeric:tabular-nums}.caption{padding:14px 20px 16px;background:#fffef9;border-block:1px solid #d9ddd1}.meta{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:10px;color:#6b746a}.meta button{border:0;font-size:11px}#zh{font:25px/2.1 "Songti SC",serif;margin:5px 0 3px}#en{font:17px/1.55 Georgia,serif;margin:3px 0}.word{display:inline-block;white-space:nowrap;min-height:0;padding:0 2px;margin-inline:1px;border:0;border-radius:3px;background:transparent;font:inherit;line-height:2.1}.word.current{background:#d9ef6d;color:#233e35}.word:hover{background:#e2e9cf}ruby{ruby-position:over;ruby-align:center}rt{font:400 .46em/1.1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6b7d40;letter-spacing:0}.word ruby+ruby{margin-left:1px}.toolbar{display:flex;gap:12px;align-items:center;padding:8px 16px}.toolbar input[type=search]{flex:1;min-width:0;background:transparent;border:0;padding:10px 0}.toolbar label{white-space:nowrap;font-size:12px}#transcript{max-height:330px;overflow:auto;overscroll-behavior:contain}article{padding:12px 18px;border-top:1px solid #d9ddd1;border-left:3px solid transparent}article.active{border-left-color:#809f3d;background:#fffef9}article>button{border:0;min-height:32px;font-size:10px;color:#6b746a}article p{font:13px/1.7 Georgia,serif;margin:3px 0}article .zh{font:20px/2.2 serif}.empty,.note{font-size:12px;line-height:1.7;color:#6b746a}.empty{padding:16px}details{border-top:1px solid #d9ddd1;padding:12px 16px;font-size:12px}summary{padding:6px 0}details label{display:block;margin:10px 0}details input{max-width:100%;display:block;margin:8px 0}#importStatus{font-size:12px;line-height:1.6}#vocab{margin:12px 16px;padding:16px 20px;background:#fffef9;border:1px solid #d9ddd1;border-radius:8px;max-height:60vh;overflow:auto}#vocab h2{font:28px serif;margin:4px 0}#vocab h3{font-size:10px;letter-spacing:1px;text-transform:uppercase;margin:18px 0 8px}#vp{color:#6b7d40}#ve{line-height:1.6}#closeWord{float:right;border:0}.character-list{margin:12px 0}.character-list>div{display:grid;grid-template-columns:50px minmax(0,1fr);gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid #d9ddd1}.character-list dt{font:26px/1.9 serif;text-align:center}.character-list dd{margin:0;font-size:13px;line-height:1.6}.character-list rt{font-size:12px}.composition-note{font-size:13px;line-height:1.65;background:#e9eddf;padding:12px;border-radius:6px}.dictionary-note{font-size:10px;line-height:1.65;color:#6b746a}a{color:inherit}#toggle{background:#233e35;color:#f5f2e9;border:0;border-radius:20px;padding:10px 20px}#py{display:none}
#pipeline{padding:10px 16px;background:#e9eddf;border-bottom:1px solid #d9ddd1;font-size:12px;line-height:1.6}#pipeline>div{display:flex;align-items:center;gap:12px;justify-content:space-between}#pipeline progress{width:100%;height:6px;accent-color:#668632}#pipelineHelp{margin:8px 0}#prepare{background:#233e35;color:#fffef9}:host([data-overlay]){position:absolute!important;inset:auto 5% 65px!important;width:90%!important;margin:0!important;z-index:2147483647!important;pointer-events:none}:host([data-overlay]) #panel,:host([data-overlay]) #toggle{pointer-events:auto}:host([data-overlay]) #panel{max-height:75vh;overflow:auto;box-shadow:0 8px 30px #0005;background:#f5f2e9f5}:host([data-overlay]) header{padding:4px 14px}:host([data-overlay]) #status{display:none}:host([data-overlay]) .controls{padding:3px 14px}:host([data-overlay]) .caption{background:#fffef9eb;padding:8px 18px}:host([data-overlay]) #zh{font-size:clamp(22px,2.3vw,34px);margin:2px 0}:host([data-overlay]) #en{font-size:clamp(15px,1.4vw,21px)}:host([data-overlay]) #extras{max-height:35vh;overflow:auto}:host([data-overlay]) #vocab{max-height:40vh}:host([data-overlay]) #toggle{float:right}@media(max-width:600px){header{padding:8px 10px}#zh{font-size:23px}.caption{padding:10px 12px}.controls{gap:5px;padding:6px 8px}#source{flex-basis:50%}:host([data-overlay]){inset:auto 2% 50px!important;width:96%!important}}
</style>
<section id="panel" role="region" aria-label="Mandarin listening room">
<header><strong lang="zh">听懂</strong><span id="source"></span><button id="prepare">Prepare this video</button><button id="expand" aria-expanded="false">Transcript & lessons</button><button id="fullscreen">Fullscreen</button><button id="close" aria-label="Minimize learning panel">−</button></header>
<p id="status" role="status">Connecting to Bilibili…</p><section id="pipeline" hidden><div><span id="pipelineText" role="status"></span><button id="cancelPrepare">Cancel</button></div><progress id="pipelineProgress" max="100" value="0" aria-label="Lesson preparation progress"></progress><p id="pipelineHelp" hidden>Install the <a href="https://gee842.github.io/bilibili-mandarin-listening-room/mandarin-pipeline-helper.zip" target="_blank" rel="noopener noreferrer">local preparation helper</a>, then try again.</p></section>
<div class="controls"><button id="back" aria-label="Back 10 seconds">−10s</button><button id="play" aria-label="Play recording">▶</button><button id="forward" aria-label="Forward 10 seconds">+10s</button><input id="seek" type="range" min="0" max="2171" step="0.01" value="0" aria-label="Recording position"><span id="time">0:00</span><select id="speed" aria-label="Playback speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></div>
<div class="caption"><div class="meta"><span id="count">NO LESSON YET</span><button id="replay" disabled>↻ Replay sentence</button></div><p id="zh" lang="zh">选择课程</p><p id="en">Import a lesson for this video to see synchronized subtitles.</p><p id="py" aria-hidden="true"></p></div>
<section id="vocab" role="dialog" aria-label="Vocabulary explanation" hidden><button id="closeWord" aria-label="Close word note">✕</button><h2 id="vz" lang="zh"></h2><p id="vp" lang="zh-Latn-pinyin"></p><h3>Together in this sentence</h3><p id="ve"></p><div id="characters"></div><p id="vn" class="note"></p><button id="wordReplay">Listen to word ↻</button></section>
<div id="extras" hidden><div class="toolbar"><input id="search" type="search" placeholder="Find a word or phrase…" aria-label="Search transcript"><label><input id="follow" type="checkbox" checked> Follow</label></div><div id="transcript"></div>
<details open><summary>Lesson for this video</summary><p id="lessonInfo" class="note"></p><label>Import Chinese, English, pinyin and aligned word timings<input id="jsonFile" type="file" accept=".json,application/json"></label><button id="export">Export JSON / template ↓</button><button id="clear">Remove saved lesson</button><p id="importStatus" role="status"></p><p class="note">Lessons are saved only in this browser, separately for each video and part. Audio playback stays on Bilibili. Prepare this video uses the local helper and your API account to transcribe, translate, add pinyin and align words. Audio chunks and transcript text are sent to OpenAI for processing. No audio or lessons are publicly uploaded. Your API key stays on this Mac.</p></details></div></section><button id="toggle" aria-expanded="true" hidden>听懂 · Learn</button>`;
const $=id=>root.getElementById(id);
let pipelineState=null;let lesson=null,video=null,identity=null,current=-1,word=-1,stopAt=null,chosen=null,lastStatus='',loadId=0,bundled=null,normalAnchor=null;
function status(s){if(s!==lastStatus){$('status').textContent=s;lastStatus=s;}}
function storageKey(id){return `lesson:${id.key}`;}
function reset(){stopAt=null;current=-1;word=-1;chosen=null;$('vocab').hidden=true;$('search').value='';}
function playerBox(){return video?.closest('#bilibili-player,.bpx-player-container,.player-container')||video?.parentElement;}
function place(){
  const box=playerBox();if(!box){if(!host.isConnected)document.body.append(host);return;}
  const fs=document.fullscreenElement;
  const web=box.matches('.bpx-state-web')?box:box.querySelector('.bpx-state-web');
  const overlay=fs&&fs.tagName!=='VIDEO'?fs:web;
  host.toggleAttribute('data-overlay',Boolean(overlay));
  if(overlay){if(host.parentElement!==overlay)overlay.append(host);return;}
  const anchor=box.closest('#playerWrap,.player-wrap')||box;
  normalAnchor=anchor;
  if(host.previousElementSibling!==anchor)anchor.after(host);
}
function caption(){
  const s=lesson?.sentences[current];$('replay').disabled=!s||!video;
  if(!s){$('count').textContent=lesson?.sentences.length?'BETWEEN SENTENCES':'NO LESSON YET';$('zh').textContent=lesson?.sentences.length?'…':'选择课程';$('en').textContent=lesson?.sentences.length?'Listening…':'Open Transcript & lessons to import a lesson for this video.';$('py').textContent='';return;}
  $('count').textContent=`SENTENCE ${current+1} / ${lesson.sentences.length}`;
  const f=document.createDocumentFragment();displayPieces(s).forEach(({word:w,index:i,before,after})=>{f.append(before);const b=document.createElement('button');b.className='word';b.dataset.cw=i;appendRuby(b,w,lesson);b.onclick=()=>show(w);f.append(b,after);});
  $('zh').replaceChildren(f);$('en').textContent=s.en;$('py').textContent=s.pinyin;
}
function render(){
  const box=$('transcript');box.replaceChildren();$('clear').disabled=!lesson;
  if(!lesson?.sentences.length){const p=document.createElement('p');p.className='empty';p.textContent='No lesson for this video yet. Playback and speed controls still work. Import a matching lesson below.';box.append(p);return;}
  lesson.sentences.forEach((s,i)=>{
    const a=document.createElement('article');a.id=`s-${i}`;const stamp=document.createElement('button');stamp.textContent=`↻ ${formatTime(s.start)}`;stamp.setAttribute('aria-label',`Replay sentence ${i+1}`);stamp.onclick=()=>replay(i);a.append(stamp);
    const zh=document.createElement('p');zh.className='zh';zh.lang='zh';displayPieces(s).forEach(({word:w,index:j,before,after})=>{zh.append(before);const b=document.createElement('button');b.className='word';b.dataset.w=j;appendRuby(b,w,lesson);b.onclick=()=>show(w);zh.append(b,after);});
    const en=document.createElement('p');en.textContent=s.en;a.append(zh,en);box.append(a);
  });
}
async function loadLesson(id){
  const request=++loadId;lesson=null;reset();render();caption();$('importStatus').textContent='';pipelineState=null;pipelineView();
  $('source').textContent=`${id.bvid}${id.page>1?' · part '+id.page:''}`;
  $('lessonInfo').textContent=`Import a version 1 lesson with source.bvid “${id.bvid}” and source.page ${id.page}. Export a template to get started.`;
  try{
    const key=storageKey(id),saved=(await chrome.storage.local.get(key))[key];
    if(request!==loadId)return;
    let next=saved;
    if(!next&&id.bvid===BVID&&id.page===1){if(!bundled)bundled=fetch(chrome.runtime.getURL('data/lesson.json')).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();});next=await bundled;}
    if(request!==loadId)return;
    if(next)lesson=validateLesson(next,id.bvid,id.page);
    render();caption();connect();await syncPipeline();
  }catch(e){if(request===loadId)status(`Lesson could not load: ${e.message}`);}
}
function connect(){
  const next=videoIdentity(location.href);host.hidden=!next;if(!next){if(identity){identity=null;loadId++;lesson=null;reset();}video=null;return;}
  const changed=identity?.key!==next.key;identity=next;
  const v=document.querySelector('#bilibili-player video,.bpx-player-container video,video');
  if(video!==v){video=v;reset();caption();}
  place();
  if(changed)loadLesson(next);
  if(!video){status('Waiting for Bilibili’s video player. Start the original video to connect.');return;}
  if(Number.isFinite(video.duration)&&video.duration>0)$('seek').max=video.duration;
  status(lesson?.sentences.length?`Connected to original audio · ${lesson.alignment?.reviewed?'reviewed lesson':'automated lesson draft'}`:'Connected to original audio · import a lesson for subtitles');
}
function toggle(){const hide=!$('panel').hidden;$('panel').hidden=hide;$('toggle').hidden=!hide;$('toggle').setAttribute('aria-expanded',String(!hide));if(hide)$('vocab').hidden=true;}
$('toggle').onclick=toggle;$('close').onclick=toggle;
$('expand').onclick=()=>{$('extras').hidden=!$('extras').hidden;$('expand').setAttribute('aria-expanded',String(!$('extras').hidden));};
async function play(){if(!video)return;try{await video.play();}catch(e){if(e.name!=='AbortError')status('Press play in Bilibili’s original video, then retry.');}}
function seek(t){if(video)video.currentTime=Math.max(0,Math.min(Number.isFinite(video.duration)?video.duration:lesson?.source.duration||Infinity,t));}
$('play').onclick=()=>{if(!video)return;stopAt=null;video.paused?play():video.pause();};$('back').onclick=()=>{if(video){stopAt=null;seek(video.currentTime-10);}};$('forward').onclick=()=>{if(video){stopAt=null;seek(video.currentTime+10);}};$('seek').oninput=()=>{stopAt=null;seek(Number($('seek').value));};$('speed').onchange=()=>{if(video)video.playbackRate=Number($('speed').value);};
function replay(i){const s=lesson?.sentences[i];if(!s||!video)return;stopAt=s.end;seek(s.start);play();}$('replay').onclick=()=>replay(current);
function show(w){chosen=w;$('vz').textContent=w.zh;$('vp').textContent=w.pinyin;$('ve').textContent=w.en;$('vn').textContent=w.note||'';renderCharacterBreakdown($('characters'),w,lesson);$('vocab').hidden=false;$('closeWord').focus({preventScroll:true});if(!host.hasAttribute('data-overlay'))$('vocab').scrollIntoView({block:'nearest',behavior:'smooth'});}
$('closeWord').onclick=()=>{$('vocab').hidden=true;};root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('vocab').hidden){$('vocab').hidden=true;e.stopPropagation();}});$('wordReplay').onclick=()=>{if(video&&chosen){stopAt=chosen.end;seek(chosen.start);play();}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await playerBox()?.requestFullscreen();}catch(e){status('Use Bilibili’s fullscreen button.');}};
document.addEventListener('fullscreenchange',()=>{place();$('fullscreen').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';});
$('search').oninput=()=>{const q=$('search').value.toLocaleLowerCase();lesson?.sentences.forEach((s,i)=>{$(`s-${i}`).hidden=![s.zh,s.en,s.pinyin].some(t=>t.toLocaleLowerCase().includes(q));});};
$('jsonFile').onchange=async e=>{
  const id=identity,request=loadId;
  try{const f=e.target.files[0];if(!f||!id)return;if(f.size>5e6)throw Error('Lesson JSON must be smaller than 5 MB.');const next=validateLesson(JSON.parse(await f.text()),id.bvid,id.page);
    if(request!==loadId)throw Error('The video changed. Import again for the current video.');
    await chrome.storage.local.set({[storageKey(id)]:next});
    if(request!==loadId)return;
    lesson=next;reset();render();caption();$('importStatus').textContent=`Loaded ${next.sentences.length} sentences. Saved for this video and part in this browser.`;connect();
  }catch(e){$('importStatus').textContent=`Import rejected: ${e.message}`;}finally{$('jsonFile').value='';}
};
$('clear').onclick=async()=>{if(!identity)return;await chrome.storage.local.remove(storageKey(identity));loadLesson(identity);};
$('export').onclick=()=>{
  if(!identity)return;const data=lesson||{version:1,source:{bvid:identity.bvid,page:identity.page,url:location.href,title:document.title,duration:Number.isFinite(video?.duration)?video.duration:1},audio:null,status:'draft',alignment:{reviewed:false},sentences:[],characterBreakdowns:{}};
  const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`${identity.bvid}-part-${identity.page}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
};
function pipelineView(){
  const busy=['running','cancelling'].includes(pipelineState?.state),ready=pipelineState?.state==='complete';
  $('prepare').disabled=busy||ready;$('prepare').textContent=busy?'Preparing…':ready?'Lesson ready':pipelineState?.state==='failed'||pipelineState?.state==='cancelled'?'Resume preparation':'Prepare this video';
  $('pipeline').hidden=!pipelineState;$('pipelineText').textContent=pipelineState?.message||'';$('pipelineProgress').value=pipelineState?.percent||0;$('cancelPrepare').hidden=!busy;$('cancelPrepare').disabled=pipelineState?.state==='cancelling';$('pipelineHelp').hidden=!pipelineState?.message?.includes('not installed');
}
async function syncPipeline(){
  const id=identity;if(!id)return;
  try{const result=await chrome.runtime.sendMessage({type:'pipeline-status',key:id.key});if(identity?.key===id.key&&result?.ok){pipelineState=result.status;pipelineView();}}catch(e){/* Existing lessons remain usable when the helper is unavailable. */}
}
$('prepare').title='Uses your local helper and API account. Audio transcription and translation incur API usage charges.';
$('prepare').onclick=async()=>{
  const id=identity;if(!id)return;pipelineState={state:'running',message:'Starting preparation…',percent:0};pipelineView();
  try{const result=await chrome.runtime.sendMessage({type:'pipeline-start',key:id.key});if(!result?.ok)throw Error(result?.error||'The preparation helper did not respond. Reload extension 0.3 and try again.');}
  catch(e){if(identity?.key===id.key){pipelineState={state:'failed',message:e.message,percent:0};pipelineView();}}
};
$('cancelPrepare').onclick=async()=>{if(identity)await chrome.runtime.sendMessage({type:'pipeline-cancel',key:identity.key});};
chrome.runtime.onMessage.addListener(message=>{
  if(message?.type==='toggle-learning-panel'){if(identity)toggle();}
  if(message?.type==='pipeline-update'&&message.key===identity?.key){
    pipelineState=message;pipelineView();
    if(message.state==='complete')loadLesson(identity);
  }
});
function tick(){
  const id=videoIdentity(location.href);
  if(id?.key!==identity?.key)connect();
  if(video&&id?.key===identity?.key){
    let t=video.currentTime;if(stopAt!==null&&t>=stopAt){video.pause();seek(stopAt-.001);stopAt=null;t=video.currentTime;}
    $('time').textContent=formatTime(t);$('seek').value=t;$('play').textContent=video.paused?'▶':'Ⅱ';$('speed').value=String(video.playbackRate);
    const i=activeIndex(lesson?.sentences||[],t);
    if(i!==current){root.querySelector('article.active')?.classList.remove('active');current=i;word=-1;caption();const row=$(`s-${i}`);row?.classList.add('active');if(row&&!row.hidden&&$('follow').checked)$('transcript').scrollTop=row.offsetTop-$('transcript').offsetTop;}
    const wi=i<0?-1:activeIndex(lesson.sentences[i].words,t);
    if(wi!==word){root.querySelectorAll('.word.current').forEach(e=>e.classList.remove('current'));word=wi;if(wi>=0){root.querySelectorAll(`[data-cw="${wi}"]`).forEach(e=>e.classList.add('current'));$(`s-${i}`)?.querySelector(`[data-w="${wi}"]`)?.classList.add('current');}}
  }
  requestAnimationFrame(tick);
}
connect();setInterval(connect,750);requestAnimationFrame(tick);
})();
