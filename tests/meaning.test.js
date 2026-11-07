import test from 'node:test';
import assert from 'node:assert/strict';
import {englishPieces,validateMeaningLinks,meaningForWord,meaningForEnglish,meaningPhrase,applyMeaningPack} from '../engine.js';
const sentence=()=>({zh:'他已经走了',en:'He has already left.',words:[{zh:'他'},{zh:'已经'},{zh:'走'},{zh:'了'}],meaningLinks:[{zh:[0],en:[0]},{zh:[1],en:[2]},{zh:[2],en:[1,3]},{zh:[3],en:[],note:'Completed action.'}]});
test('English tokens preserve punctuation, contractions and original whitespace',()=>{
 const text="Don't re-enter Xi’an’s 15-year story. 你好!";
 const pieces=englishPieces(text);assert.deepEqual(pieces.map(p=>p.text),["Don't","re-enter","Xi’an’s","15-year","story","你好"]);
 assert.equal(pieces.map(p=>p.before+p.text+p.after).join(''),text);
});
test('meaning links support changed word order, noncontiguous phrases and particles',()=>{
 const s=sentence();assert.doesNotThrow(()=>validateMeaningLinks(s));
 assert.deepEqual(meaningForWord(s,2).en,[1,3]);assert.deepEqual(meaningForEnglish(s,3).zh,[2]);
 assert.equal(meaningPhrase(s,meaningForWord(s,2)),'has … left');
 assert.equal(meaningForWord(s,3).note,'Completed action.');
});
test('legacy lessons stay usable; malformed links cannot create false matches',()=>{
 const s=sentence();delete s.meaningLinks;assert.doesNotThrow(()=>validateMeaningLinks(s));assert.equal(meaningForWord(s,0),null);
 for(const links of [[{zh:[0,1,2,3],en:[0,1]}],[{zh:[0,1,2,3],en:[0,1,2,4]}],[{zh:[0,0,1,2,3],en:[0,1,2,3]}],[{zh:[0,1,2,3],en:[]}],[]]){
  s.meaningLinks=links;assert.throws(()=>validateMeaningLinks(s));
 }
});
test('saved lesson upgrades require matching text fingerprint and preserve timings',async()=>{
 const s=sentence(),lesson={source:{bvid:'BV1MRJa6sEsk',page:1},sentences:[{...s,start:1,end:4}]};delete lesson.sentences[0].meaningLinks;
 const {lessonFingerprint}=await import('../engine.js');
 const pack={'BV1MRJa6sEsk:1':{fingerprint:await lessonFingerprint(lesson),links:[s.meaningLinks]}};
 assert.equal(await applyMeaningPack(lesson,pack),true);assert.equal(lesson.sentences[0].start,1);assert.deepEqual(lesson.sentences[0].meaningLinks,s.meaningLinks);
 delete lesson.sentences[0].meaningLinks;lesson.sentences[0].en='Different translation';assert.equal(await applyMeaningPack(lesson,pack),false);assert.equal(lesson.sentences[0].meaningLinks,undefined);
});
test('overlapping meaning connections can reuse both Mandarin and English tokens',()=>{
 const s=sentence();s.meaningLinks.push({zh:[1,2,3],en:[1,2,3],note:'The aspect construction jointly contributes completion.'});
 assert.doesNotThrow(()=>validateMeaningLinks(s));
});

test('existing meaning edits survive an automatic pack upgrade',async()=>{
 const s=sentence(),lesson={source:{bvid:'BV1MRJa6sEsk'},sentences:[s]},edited=s.meaningLinks;s.meaningLinks[0].note='A reviewed learner note.';
 const {lessonFingerprint}=await import('../engine.js');const pack={'BV1MRJa6sEsk:1':{fingerprint:await lessonFingerprint(lesson),links:[[{zh:[0,1,2,3],en:[0,1,2,3]}]]}};
 await applyMeaningPack(lesson,pack);assert.equal(s.meaningLinks,edited);assert.equal(s.meaningLinks[0].note,'A reviewed learner note.');
});
