import re,difflib

def chars(s):return ''.join(c for c in s if c.isalnum() or c in '%％+＋=＝').lower()
def raw_chars(words,offset=0):
 text='';times=[]
 for w in words:
  t=chars(w.get('word',w.get('zh','')))
  if not t:continue
  a,b=w['start']-offset,w['end']-offset
  for j,c in enumerate(t):text+=c;times.append((a+(b-a)*j/len(t),a+(b-a)*(j+1)/len(t)))
 return text,times

def map_times(target,source,times):
 mapping={}
 sm=difflib.SequenceMatcher(None,source,target,autojunk=False)
 for tag,a,b,c,d in sm.get_opcodes():
  if tag=='equal':
   for k in range(d-c):mapping[c+k]=times[a+k]
  elif tag in ['replace','insert']:
   t0=times[a][0] if a<len(times) else times[-1][1];t1=times[b-1][1] if b>a else t0
   for k in range(d-c):mapping[c+k]=(t0+(t1-t0)*k/(d-c),t0+(t1-t0)*(k+1)/(d-c))
 return [mapping[i] for i in range(len(target))]
