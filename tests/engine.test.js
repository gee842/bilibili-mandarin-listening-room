import test from 'node:test';
import assert from 'node:assert/strict';
import {activeIndex,validateLesson,embedURL,formatTime} from '../engine.js';
const fixture=()=>({version:1,source:{bvid:'BV1MRJa6sEsk',duration:2171},sentences:[{start:1,end:3,zh:'你好',en:'Hello',pinyin:'Nǐ hǎo',words:[{start:1,end:2,zh:'你',pinyin:'nǐ',en:'you'},{start:2,end:3,zh:'好',pinyin:'hǎo',en:'good'}]}]});
test('clock boundaries and silent gaps do not retain a stale highlight',()=>{const s=[{start:1,end:2},{start:3,end:4}];for(const [t,i]of [[0,-1],[1,0],[1.999,0],[2,-1],[2.9,-1],[3,1],[4,-1]])assert.equal(activeIndex(s,t),i);});
test('source identity and every subtitle line are required',()=>{const f=fixture();assert.equal(validateLesson(f),f);f.source.bvid='other';assert.throws(()=>validateLesson(f));f.source.bvid='BV1MRJa6sEsk';delete f.sentences[0].en;assert.throws(()=>validateLesson(f));});
test('rejects overlapping alignment and mismatched Chinese',()=>{let f=fixture();f.sentences[0].words[1].start=1.5;assert.throws(()=>validateLesson(f));f=fixture();f.sentences[0].words[1].zh='坏';assert.throws(()=>validateLesson(f));});
test('rejects unauthorized hosted audio',()=>{const f=fixture();f.audio={url:'https://example.com/audio.mp3'};assert.throws(()=>validateLesson(f));f.audio.authorized=true;assert.doesNotThrow(()=>validateLesson(f));});
test('only the requested source is embedded, at a bounded timestamp',()=>{const u=new URL(embedURL(-5));assert.equal(u.hostname,'player.bilibili.com');assert.equal(u.searchParams.get('bvid'),'BV1MRJa6sEsk');assert.equal(u.searchParams.get('t'),'0');assert.equal(formatTime(2171),'36:11');});

test('punctuation is preserved between clickable vocabulary words',async()=>{const {displayPieces}=await import('../engine.js');const s={zh:'你，好。',words:[{zh:'你'},{zh:'好'}]};assert.equal(displayPieces(s).map(x=>x.before+x.word.zh+x.after).join(''),s.zh);});
