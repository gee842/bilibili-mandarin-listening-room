export const BVID = 'BV1MRJa6sEsk';
export const formatTime = t => `${Math.floor(Math.max(0,t)/60)}:${String(Math.floor(Math.max(0,t)%60)).padStart(2,'0')}`;
export function activeIndex(items, t) {
  let lo=0, hi=items.length-1;
  while(lo<=hi){const m=(lo+hi)>>1;if(t<items[m].start)hi=m-1;else if(t>=items[m].end)lo=m+1;else return m;}
  return -1;
}
export function validateLesson(data, expectedBvid=BVID, expectedPage=1) {
  if(data?.version!==1 || data?.source?.bvid!==expectedBvid || (data.source.page??1)!==expectedPage)throw Error(`This lesson must belong to ${expectedBvid}, part ${expectedPage} (version 1).`);
  if(!Number.isFinite(data.source.duration)||data.source.duration<=0)throw Error('Invalid source duration.');
  if(data.audio!=null && (typeof data.audio!=='object'||typeof data.audio.url!=='string'||!/^https:\/\//.test(data.audio.url)||data.audio.authorized!==true))throw Error('Hosted audio requires an HTTPS URL and an explicit authorized flag.');
  if(!Array.isArray(data.sentences))throw Error('Sentences must be an array.');
  let end=0;
  for(const s of data.sentences){
    if(!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.start<end||s.end<=s.start||s.end>data.source.duration+.5)throw Error('Sentence timestamps must be ordered, nonoverlapping, and within the recording.');
    if(!['zh','en','pinyin'].every(k=>typeof s[k]==='string'&&s[k].trim()))throw Error('Each sentence needs Chinese, English, and tone-marked pinyin.');
    if(!Array.isArray(s.words)||!s.words.length)throw Error('Each sentence needs aligned words.');
    let we=s.start;
    for(const w of s.words){if(!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<we-.001||w.start<s.start||w.end>s.end+.001||w.end<=w.start)throw Error('Word timestamps must be ordered within the sentence.');if(!['zh','pinyin','en'].every(k=>typeof w[k]==='string'&&w[k].trim()))throw Error('Each word needs Chinese, pinyin, and an explanation.');we=w.end;}
    if(s.words.map(w=>w.zh).join('').replace(/[\p{P}\p{Z}\s]/gu,'')!==s.zh.replace(/[\p{P}\p{Z}\s]/gu,''))throw Error('Aligned words must match the Chinese sentence.');
    end=s.end;
  }
  if(data.characterBreakdowns!=null){
    if(typeof data.characterBreakdowns!=='object'||Array.isArray(data.characterBreakdowns))throw Error('Invalid character breakdown dictionary.');
    for(const [zh,item]of Object.entries(data.characterBreakdowns)){
      if(!Array.isArray(item?.characters)||item.characters.map(c=>c.zh).join('')!==zh||item.characters.some(c=>Array.from(c.zh||'').length!==1||typeof c.pinyin!=='string'||typeof c.en!=='string'||!c.en.trim())||(item.note!=null&&typeof item.note!=='string'))throw Error('Each character breakdown must explain every character in order.');
    }
  }
  return data;
}
export function embedURL(t=0){const u=new URL('https://player.bilibili.com/player.html');u.search=new URLSearchParams({bvid:BVID,p:'1',autoplay:'0',danmaku:'0',t:String(Math.max(0,t))});return u.href;}

export function displayPieces(sentence){let cursor=0;return sentence.words.map((word,index)=>{const at=sentence.zh.indexOf(word.zh,cursor);const before=at<0?'':sentence.zh.slice(cursor,at);cursor=at<0?cursor:at+word.zh.length;return {word,index,before,after:index===sentence.words.length-1?sentence.zh.slice(cursor):''};});}

export function videoIdentity(url){
  const u=new URL(url);if(!['www.bilibili.com','m.bilibili.com'].includes(u.hostname))return null;
  const match=u.pathname.match(/^\/(?:en\/)?video\/(BV[0-9A-Za-z]{10})(?:\/|$)/);if(!match)return null;
  const page=Number(u.searchParams.get('p')||1);if(!Number.isSafeInteger(page)||page<1)return null;
  return {bvid:match[1],page,key:`${match[1]}:${page}`};
}
export function wordBreakdown(word,lesson){const map=lesson?.characterBreakdowns;return map&&Object.hasOwn(map,word.zh)?map[word.zh]:null;}
export function rubyParts(word,lesson){
  const chars=Array.from(word.zh),syllables=word.pinyin.trim().split(/\s+/);
  if(chars.length===syllables.length)return chars.map((zh,i)=>({zh,pinyin:syllables[i]}));
  const breakdown=wordBreakdown(word,lesson);
  if(breakdown?.characters.length===chars.length)return breakdown.characters.map(c=>({zh:c.zh,pinyin:c.pinyin}));
  return [{zh:word.zh,pinyin:word.pinyin}];
}
