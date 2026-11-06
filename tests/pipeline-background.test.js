import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validateLesson,videoIdentity} from '../engine.js';
const source=readFileSync(new URL('../extension/background.js',import.meta.url),'utf8').replace(/^import .*;\n/,'');
const lesson=()=>({version:1,source:{bvid:'BV1q9nx69ELG',page:1,duration:10},sentences:[{zh:'你好',pinyin:'nǐ hǎo',en:'Hello',start:0,end:1,words:[{zh:'你好',pinyin:'nǐ hǎo',en:'hello',start:0,end:1}]}]});
function harness(){
 const store={},updates=[],nativeMessages=[],nativeListeners=[],disconnects=[];let receive,ports=0;
 const port={postMessage:x=>nativeMessages.push(x),onMessage:{addListener:x=>nativeListeners.push(x)},onDisconnect:{addListener:x=>disconnects.push(x)},disconnect:()=>{}};
 const chrome={storage:{local:{get:async key=>({[key]:store[key]}),set:async value=>Object.assign(store,value)}},tabs:{sendMessage:async(id,msg)=>updates.push(msg)},action:{onClicked:{addListener(){}}},runtime:{lastError:null,connectNative:()=>{ports++;return port;},onMessage:{addListener:x=>receive=x}}};
 vm.runInNewContext(source,{chrome,validateLesson,videoIdentity,TextEncoder,setTimeout,clearTimeout});
 const request=(type,id='BV1q9nx69ELG',key=id+':1')=>new Promise(resolve=>receive({type,key},{url:`https://www.bilibili.com/video/${id}/`,tab:{id:4}},resolve));
 return {store,updates,nativeMessages,request,emit:x=>nativeListeners.forEach(f=>f(x)),drop:()=>{chrome.runtime.lastError={message:'Specified native messaging host not found.'};disconnects.forEach(f=>f());chrome.runtime.lastError=null;},get ports(){return ports;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function until(predicate){for(let i=0;i<100;i++){if(predicate())return;await flush();}throw Error('Expected asynchronous state was not reached');}
test('pipeline validates the sender recording before invoking any local process',async()=>{const h=harness();const result=await h.request('pipeline-start','BV1q9nx69ELG','BV1MRJa6sEsk:1');assert.equal(result.ok,false);assert.equal(h.ports,0);});
test('native chunks become a matching saved lesson only after validation',async()=>{
 const h=harness();assert.equal((await h.request('pipeline-start')).ok,true);assert.equal(h.nativeMessages[0].bvid,'BV1q9nx69ELG');
 const text=JSON.stringify(lesson()),key='BV1q9nx69ELG:1';h.emit({type:'lesson-begin',key,chunks:2});h.emit({type:'lesson-chunk',key,index:0,text:text.slice(0,70)});h.emit({type:'lesson-chunk',key,index:1,text:text.slice(70)});h.emit({type:'lesson-end',key});
 await until(()=>h.store['pipeline:'+key]?.state==='complete');assert.equal(h.store['lesson:'+key].sentences[0].en,'Hello');
});
test('a mismatched generated lesson preserves the previous lesson',async()=>{
 const h=harness(),key='BV1q9nx69ELG:1';h.store['lesson:'+key]=lesson();await h.request('pipeline-start');const bad=lesson();bad.source.bvid='BV1MRJa6sEsk';h.emit({type:'lesson-begin',key,chunks:1});h.emit({type:'lesson-chunk',key,index:0,text:JSON.stringify(bad)});h.emit({type:'lesson-end',key});await until(()=>h.store['pipeline:'+key]?.state==='failed');assert.equal(h.store['lesson:'+key].source.bvid,'BV1q9nx69ELG');
});
test('missing helper reports a recoverable error and no lesson is overwritten',async()=>{
 const h=harness();await h.request('pipeline-start');h.drop();await until(()=>h.store['pipeline:BV1q9nx69ELG:1']?.state==='failed');assert.match(h.store['pipeline:BV1q9nx69ELG:1'].message,/not installed/);assert.equal(h.store['lesson:BV1q9nx69ELG:1'],undefined);
});
test('only one video prepares at a time and cancel targets the active recording',async()=>{
 const h=harness();await h.request('pipeline-start');assert.equal((await h.request('pipeline-start','BV1MRJa6sEsk')).ok,false);await h.request('pipeline-cancel');assert.equal(h.nativeMessages.at(-1).command,'cancel');assert.equal(h.nativeMessages.at(-1).bvid,'BV1q9nx69ELG');h.drop();
});
