import {validateLesson,videoIdentity} from './engine.js';
const HOST='com.tingdong.pipeline',subscribers=new Set();
let port=null,active=null,assembly=null,nativeQueue=Promise.resolve(),startupTimer=null;
const terminal=new Set(['complete','failed','cancelled']);
const jobKey=id=>`pipeline:${id.key}`;
async function publish(id,state){
  await chrome.storage.local.set({[jobKey(id)]:state});
  for(const tabId of subscribers)chrome.tabs.sendMessage(tabId,{type:'pipeline-update',key:id.key,...state}).catch(()=>subscribers.delete(tabId));
}
function connect(){
  if(port)return port;
  port=chrome.runtime.connectNative(HOST);
  const connection=port;nativeQueue=Promise.resolve();
  startupTimer=setTimeout(async()=>{if(port===connection&&active){await publish(active,{state:'failed',message:'The local helper did not start. Run its installer again and check any macOS app-access prompt.',percent:0});finish();}},30000);
  port.onMessage.addListener(message=>{clearTimeout(startupTimer);nativeQueue=nativeQueue.then(()=>handleNative(message)).catch(async()=>{if(active)await publish(active,{state:'failed',message:'The returned lesson could not be saved or validated. Existing lesson preserved.',percent:0});finish();});});
  port.onDisconnect.addListener(()=>{
    const why=chrome.runtime.lastError?.message;if(port!==connection)return;clearTimeout(startupTimer);port=null;assembly=null;
    if(active){const id=active;active=null;publish(id,{state:'failed',message:why?.includes('not found')?'Local helper not installed. Run Install helper.command, then press Prepare again.':'The local helper disconnected. Completed stages are saved; press Prepare to resume.',percent:0});}
  });
  return port;
}
function finish(){clearTimeout(startupTimer);active=null;assembly=null;if(port){const old=port;port=null;old.disconnect();}}
async function handleNative(message){
  const id=active;if(!id||message.key!==id.key)return;
  if(message.type==='progress'){
    // Completion is only reported after the complete lesson has been validated and saved.
    if(message.stage==='complete'&&message.state==='running')return;
    await publish(id,{state:message.state,stage:message.stage,message:String(message.message||''),percent:Number(message.percent)||0});
    if(terminal.has(message.state))finish();
  }else if(message.type==='lesson-begin'){
    if(!Number.isInteger(message.chunks)||message.chunks<1||message.chunks>500)throw Error('Invalid transfer');
    assembly={chunks:new Array(message.chunks),size:0};
  }else if(message.type==='lesson-chunk'){
    if(!assembly||typeof message.text!=='string'||!Number.isInteger(message.index)||message.index<0||message.index>=assembly.chunks.length||assembly.chunks[message.index]!==undefined)throw Error('Invalid transfer');
    assembly.size+=new TextEncoder().encode(message.text).length;if(assembly.size>5e6)throw Error('Lesson too large');assembly.chunks[message.index]=message.text;
  }else if(message.type==='lesson-end'){
    if(!assembly||assembly.chunks.filter(x=>typeof x==='string').length!==assembly.chunks.length)throw Error('Incomplete transfer');
    const next=validateLesson(JSON.parse(assembly.chunks.join('')),id.bvid,id.page);
    await chrome.storage.local.set({[`lesson:${id.key}`]:next});
    await publish(id,{state:'complete',message:`Ready · ${next.sentences.length} sentences. Saved for this video.`,percent:100,complete:next.transcription?.complete!==false});finish();
  }
}
chrome.action.onClicked.addListener(tab=>{if(tab.id)chrome.tabs.sendMessage(tab.id,{type:'toggle-learning-panel'}).catch(()=>{});});
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!message?.type?.startsWith('pipeline-'))return;
  const id=sender.url?videoIdentity(sender.url):null;
  if(!id||message.key!==id.key||!sender.tab?.id){respond({ok:false,error:'Open the matching Bilibili video first.'});return;}
  subscribers.add(sender.tab.id);
  (async()=>{
    if(message.type==='pipeline-status'){
      let state=(await chrome.storage.local.get(jobKey(id)))[jobKey(id)]||null;
      if(state&&['running','cancelling'].includes(state.state)&&active?.key!==id.key){state={state:'failed',message:'Preparation was interrupted. Press Prepare to resume saved stages.',percent:0};await publish(id,state);}
      return {ok:true,status:state};
    }
    if(message.type==='pipeline-cancel'){
      if(active?.key===id.key)port?.postMessage({command:'cancel',bvid:id.bvid,page:id.page});return {ok:true};
    }
    if(message.type==='pipeline-start'){
      if(active)return {ok:false,error:active.key===id.key?'This video is already being prepared.':'Another video is being prepared. Finish or cancel it first.'};
      active=id;await publish(id,{state:'running',stage:'connect',message:'Starting the local preparation helper…',percent:0});
      connect().postMessage({command:'prepare',bvid:id.bvid,page:id.page});return {ok:true};
    }
    return {ok:false,error:'Unknown preparation action.'};
  })().then(respond).catch(e=>{if(active?.key===id.key)finish();respond({ok:false,error:'Preparation could not start. Check the local helper installation.'});});
  return true;
});
