import {rubyParts,wordBreakdown} from './engine.js';
// Shared by the website and the bundled extension. All imported strings use textContent.
export function appendRuby(button,word,lesson){
  button.setAttribute('aria-label',`${word.zh}, ${word.pinyin}: vocabulary explanation`);
  for(const part of rubyParts(word,lesson)){
    const ruby=document.createElement('ruby'),base=document.createElement('span'),rt=document.createElement('rt');
    base.textContent=part.zh;base.lang='zh';rt.textContent=part.pinyin;rt.lang='zh-Latn-pinyin';
    ruby.append(base,rt);button.append(ruby);
  }
}

export function renderCharacterBreakdown(container,word,lesson){
  container.replaceChildren();const breakdown=wordBreakdown(word,lesson);
  if(Array.from(word.zh).length<2){container.hidden=true;return;}
  container.hidden=false;
  const heading=document.createElement('h3');heading.textContent='Character meanings';container.append(heading);
  if(!breakdown){const p=document.createElement('p');p.textContent='A character breakdown has not been added to this lesson yet.';container.append(p);return;}
  const list=document.createElement('dl');list.className='character-list';
  for(const c of breakdown.characters){
    const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
    const ruby=document.createElement('ruby'),rt=document.createElement('rt');ruby.append(c.zh);rt.textContent=c.pinyin;ruby.append(rt);dt.append(ruby);dd.textContent=c.en;row.append(dt,dd);list.append(row);
  }
  container.append(list);
  if(breakdown.note){const p=document.createElement('p');p.className='composition-note';p.textContent=breakdown.note;container.append(p);}
  const note=document.createElement('p');note.className='dictionary-note';note.append('Common character senses; these may change in a compound. ');
  if(lesson.characterGlossSource?.name==='CC-CEDICT'){
    const link=document.createElement('a');link.href='https://cc-cedict.org/wiki/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='CC-CEDICT';
    const license=document.createElement('a');license.href='https://creativecommons.org/licenses/by-sa/4.0/';license.target='_blank';license.rel='noopener noreferrer';license.textContent='CC BY-SA 4.0';
    note.append(link,' · ',license,' · adapted.');
  }
  container.append(note);
}
