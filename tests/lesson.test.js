import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLesson} from '../engine.js';
const lesson=JSON.parse(readFileSync(new URL('../data/lesson.json',import.meta.url),'utf8'));
test('bundled lesson keeps all recording segments with complete multi-character explanations',()=>{
  validateLesson(lesson);assert.equal(lesson.sentences.length,460);
  const words=lesson.sentences.flatMap(s=>s.words);assert.equal(words.length,5714);
  for(const word of words.filter(w=>Array.from(w.zh).length>1)){
    const b=lesson.characterBreakdowns[word.zh];assert.ok(b,`Missing ${word.zh}`);
    assert.equal(b.characters.map(c=>c.zh).join(''),word.zh);
    assert.ok(b.characters.every(c=>c.en.trim()&&!c.en.includes('No standalone dictionary gloss')));
  }
  assert.match(lesson.characterBreakdowns['狐假虎威'].note,/borrows a tiger/);
  assert.match(lesson.characterBreakdowns['苏秦'].note,/personal name/);
  assert.equal(lesson.characterGlossSource.license,'CC BY-SA 4.0');
});

test('bundled lesson has complete English links and a verified reordered opening example',()=>{
  assert.ok(lesson.sentences.every(s=>s.meaningLinks?.length));
  assert.equal(lesson.meaningAlignment.reviewed,false);
  const first=lesson.sentences[0];
  assert.equal(first.en,'Finish a whole book in forty minutes.');
  assert.deepEqual(first.meaningLinks.find(l=>l.zh.includes(0)).en,[4,5,6]);
  assert.deepEqual(first.meaningLinks.find(l=>l.zh.includes(2)).en,[1,2,3]);
});
