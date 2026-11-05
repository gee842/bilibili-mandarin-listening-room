import test from 'node:test';
import assert from 'node:assert/strict';
import {activeIndex,validateLesson,embedURL,formatTime,videoIdentity,rubyParts,wordBreakdown} from '../engine.js';
const fixture=()=>({version:1,source:{bvid:'BV1MRJa6sEsk',duration:2171},sentences:[{start:1,end:3,zh:'你好',en:'Hello',pinyin:'Nǐ hǎo',words:[{start:1,end:2,zh:'你',pinyin:'nǐ',en:'you'},{start:2,end:3,zh:'好',pinyin:'hǎo',en:'good'}]}]});
test('clock boundaries and silent gaps do not retain a stale highlight',()=>{const s=[{start:1,end:2},{start:3,end:4}];for(const [t,i]of [[0,-1],[1,0],[1.999,0],[2,-1],[2.9,-1],[3,1],[4,-1]])assert.equal(activeIndex(s,t),i);});
test('source identity and every subtitle line are required',()=>{const f=fixture();assert.equal(validateLesson(f),f);f.source.bvid='other';assert.throws(()=>validateLesson(f));f.source.bvid='BV1MRJa6sEsk';delete f.sentences[0].en;assert.throws(()=>validateLesson(f));});
test('rejects overlapping alignment and mismatched Chinese',()=>{let f=fixture();f.sentences[0].words[1].start=1.5;assert.throws(()=>validateLesson(f));f=fixture();f.sentences[0].words[1].zh='坏';assert.throws(()=>validateLesson(f));});
test('rejects unauthorized hosted audio',()=>{const f=fixture();f.audio={url:'https://example.com/audio.mp3'};assert.throws(()=>validateLesson(f));f.audio.authorized=true;assert.doesNotThrow(()=>validateLesson(f));});
test('only the requested source is embedded, at a bounded timestamp',()=>{const u=new URL(embedURL(-5));assert.equal(u.hostname,'player.bilibili.com');assert.equal(u.searchParams.get('bvid'),'BV1MRJa6sEsk');assert.equal(u.searchParams.get('t'),'0');assert.equal(formatTime(2171),'36:11');});

test('punctuation is preserved between clickable vocabulary words',async()=>{const {displayPieces}=await import('../engine.js');const s={zh:'你，好。',words:[{zh:'你'},{zh:'好'}]};assert.equal(displayPieces(s).map(x=>x.before+x.word.zh+x.after).join(''),s.zh);});

test('other videos and parts require their own matching lesson',()=>{
  assert.deepEqual(videoIdentity('https://www.bilibili.com/en/video/BV1xx411c7mD/?p=2'),{bvid:'BV1xx411c7mD',page:2,key:'BV1xx411c7mD:2'});
  assert.equal(videoIdentity('https://example.com/video/BV1xx411c7mD'),null);
  assert.equal(videoIdentity('https://www.bilibili.com/'),null);
  const f=fixture();f.source.bvid='BV1xx411c7mD';f.source.page=2;
  assert.doesNotThrow(()=>validateLesson(f,'BV1xx411c7mD',2));
  assert.throws(()=>validateLesson(f,'BV1xx411c7mD',1));
  assert.throws(()=>validateLesson(f));
});

test('character breakdown preserves every character and rejects malformed imports',()=>{
  const f=fixture();f.characterBreakdowns={'你好':{characters:[{zh:'你',pinyin:'nǐ',en:'you'},{zh:'好',pinyin:'hǎo',en:'good'}],note:'A greeting.'}};
  assert.doesNotThrow(()=>validateLesson(f));
  assert.equal(wordBreakdown({zh:'你好'},f).note,'A greeting.');
  f.characterBreakdowns['你好'].characters.pop();
  assert.throws(()=>validateLesson(f),/breakdown/);
});

test('ruby uses per-character syllables when available and safe group ruby otherwise',()=>{
  assert.deepEqual(rubyParts({zh:'学习',pinyin:'xué xí'}),[{zh:'学',pinyin:'xué'},{zh:'习',pinyin:'xí'}]);
  assert.deepEqual(rubyParts({zh:'学习',pinyin:'xuéxí'}),[{zh:'学习',pinyin:'xuéxí'}]);
  const lesson={characterBreakdowns:{战国策:{characters:[{zh:'战',pinyin:'zhàn'},{zh:'国',pinyin:'guó'},{zh:'策',pinyin:'cè'}]}}};
  assert.deepEqual(rubyParts({zh:'战国策',pinyin:'Zhànguócè'},lesson).map(x=>x.pinyin),['zhàn','guó','cè']);
});
