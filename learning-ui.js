import {rubyParts,wordBreakdown,displayPieces,englishPieces} from './engine.js';
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

// The same rendering and interaction work in page captions, transcripts and fullscreen.
export function renderLinkedSentence(chinese,english,s,lesson,onSelect){
  chinese.replaceChildren();english.replaceChildren();const zh=[],en=[];
  const linked=(side,index)=>s.meaningLinks?.filter(l=>l[side].includes(index))||[];
  const paint=(links,cls)=>{
    const z=new Set(links.flatMap(l=>l.zh)),e=new Set(links.flatMap(l=>l.en));
    zh.forEach((b,i)=>b.classList.toggle(cls,z.has(i)));en.forEach((b,i)=>b.classList.toggle(cls,e.has(i)));
  };
  function wire(b,side,i){
    const links=linked(side,i);
    b.onpointerenter=()=>paint(links,'meaning-hover');b.onpointerleave=()=>paint([],'meaning-hover');
    b.onfocus=()=>paint(links,'meaning-hover');b.onblur=()=>paint([],'meaning-hover');
    b.onclick=()=>{
      const indices=side==='zh'?[i]:[...new Set(links.flatMap(l=>l.zh))].sort((a,b)=>a-b);
      const selection={sentence:s,words:indices.map(j=>s.words[j]),links,trigger:b,anchor:chinese.parentElement,markSelected:()=>paint(links,'meaning-selected')};
      onSelect(selection);
    };
    // Up to three subtle underline styles reveal the connections of the focused word.
    b.dataset.meaningSide=side;b.dataset.meaningIndex=i;
    const own=linked(side,i);if(own.length){b.dataset.meaningPattern=String(s.meaningLinks.indexOf(own[0])%3);b.toggleAttribute('data-meaning-overlap',own.length>1);}if(own.some(l=>l.zh.length&&l.en.length))b.classList.add('has-meaning');
    if(own.some(l=>l.review))b.title='Automatic meaning link needs review';
  }
  displayPieces(s).forEach(({word:w,index:i,before,after})=>{
    chinese.append(before);const b=document.createElement('button');b.className='word';appendRuby(b,w,lesson);zh.push(b);wire(b,'zh',i);chinese.append(b,after);
  });
  if(!s.meaningLinks){english.textContent=s.en;return {setCurrent(){}};}
  englishPieces(s.en).forEach(piece=>{
    english.append(piece.before);const b=document.createElement('button');b.className='meaning-word';b.textContent=piece.text;b.lang='en';en.push(b);wire(b,'en',piece.index);
    b.setAttribute('aria-label',`${piece.text}: show Mandarin meaning links`);english.append(b,piece.after);
  });
  return {setCurrent(i){paint(i<0?[]:linked('zh',i),'meaning-current');}};
}

export function renderSelectionBreakdowns(container,words,lesson){
  container.replaceChildren();container.hidden=false;
  for(const word of words){
    const item=document.createElement('section');
    if(words.length>1){const h=document.createElement('h3');h.textContent=`${word.zh} · ${word.en}`;item.append(h);}
    const breakdown=document.createElement('div');renderCharacterBreakdown(breakdown,word,lesson);item.append(breakdown);container.append(item);
  }
}

export function clearMeaningSelection(scope){scope.querySelectorAll('.meaning-selected').forEach(e=>e.classList.remove('meaning-selected'));}
