import pathlib,sys,unittest,tempfile,json
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
from meaning import english_tokens,validate_links,parse_response,resolve_quotes,enrich_meanings
class MeaningTests(unittest.TestCase):
 def test_tokens_keep_contractions_hyphens_and_unicode(self):
  self.assertEqual(english_tokens("Don't re-enter Xi’an’s 15-year story."),["Don't","re-enter","Xi’an’s","15-year","story"])
 def test_many_to_many_and_untranslated_grammar(self):
  s={'en':'He has already left.','words':[{'zh':'他'},{'zh':'已经'},{'zh':'走'},{'zh':'了'}]}
  links=[{'zh':[0],'en':[0]},{'zh':[1],'en':[2]},{'zh':[2],'en':[1,3]},{'zh':[3],'en':[],'note':'Completed action; expressed in the English verb.'}]
  self.assertEqual(validate_links(s,links),links)
 def test_missing_duplicate_and_invalid_indices_are_rejected(self):
  s={'en':'Hello there','words':[{},{}]}
  for links in [[{'zh':[0],'en':[0]}],[{'zh':[0,0,1],'en':[0,1]}],[{'zh':[0,1],'en':[0,2]}],[{'zh':[True,1],'en':[0,1]}],[{'zh':[0,1],'en':[]}]]:
   with self.assertRaises(ValueError):validate_links(s,links)
 def test_response_ids_cannot_be_swapped_or_omitted(self):
  batch=[{'id':4,'en':'Hello','words':[{}]}]
  good={'sentences':[{'id':4,'links':[{'zh':[0],'en':[0]}]}]}
  self.assertEqual(parse_response(batch,good),[good['sentences'][0]['links']])
  good['sentences'][0]['id']=5
  with self.assertRaises(ValueError):parse_response(batch,good)
 def test_quotes_preserve_token_boundaries_and_overlap(self):
  batch=[{'id':1,'en':"He's already left.",'words':[{},{}]}]
  raw={'sentences':[{'id':1,'links':[{'zh':[0],'en':[{'text':"he’s",'occurrence':1}]},{'zh':[1],'en':[{'text':'already left.','occurrence':1}]},{'zh':[0,1],'en':[{'text':"He's already left",'occurrence':1}]}]}]}
  result=resolve_quotes(batch,raw);self.assertEqual(result['sentences'][0]['links'][1]['en'],[1,2]);parse_response(batch,result)
 def test_unsupported_quote_does_not_create_a_false_match(self):
  batch=[{'id':1,'en':'The book','words':[{}]}]
  raw={'sentences':[{'id':1,'links':[{'zh':[0],'en':[{'text':'he'}]}]}]}
  result=resolve_quotes(batch,raw);self.assertEqual(result['sentences'][0]['links'][0]['en'],[])
  self.assertTrue(result['sentences'][0]['links'][-1]['review'])
 def test_upgrade_is_checkpointed_and_does_not_change_audio_alignment(self):
  lesson={'sentences':[{'zh':'你好','en':'Hello','start':1,'end':2,'words':[{'zh':'你好','en':'hello','start':1,'end':2}]}]}
  calls=[]
  def request(body,*args):
   calls.append(json.loads(body));return args[-1]({'choices':[{'finish_reason':'stop','message':{'content':json.dumps({'sentences':[{'id':0,'links':[{'zh':[0],'en':[{'text':'Hello','occurrence':1}]}]}]})}}]})
  def write(path,data):path.write_text(json.dumps(data))
  with tempfile.TemporaryDirectory()as tmp:
   enrich_meanings(lesson,pathlib.Path(tmp),None,request,write,lambda:None)
   self.assertEqual(lesson['sentences'][0]['words'][0]['start'],1)
   self.assertEqual(len(calls),1);del lesson['sentences'][0]['meaningLinks']
   enrich_meanings(lesson,pathlib.Path(tmp),None,lambda *args:self.fail('cached link must not submit'),write,lambda:None)
   self.assertEqual(lesson['sentences'][0]['meaningLinks'],[{'zh':[0],'en':[0]}])
 def test_discontinuous_quote_links_exact_tokens_without_intervening_words(self):
  batch=[{'id':1,'en':'He enjoyed high status for nothing.','words':[{},{}]}]
  raw={'sentences':[{'id':1,'links':[{'zh':[0],'en':[{'text':'He'}]},{'zh':[1],'en':[{'text':'enjoyed for nothing'}]}]}]}
  links=resolve_quotes(batch,raw)['sentences'][0]['links'];self.assertEqual(links[1]['en'],[1,4,5])
 def test_cached_preparation_adds_meanings_without_media_or_asr(self):
  import pipeline as p
  from unittest.mock import patch
  lesson={'version':1,'source':{'bvid':'BV1q9nx69ELG','duration':2},'sentences':[{'zh':'你好','en':'Hello','pinyin':'nǐ hǎo','start':0,'end':1,'words':[{'zh':'你好','en':'hello','pinyin':'nǐ hǎo','start':0,'end':1}]}]}
  with tempfile.TemporaryDirectory()as tmp:
   job=pathlib.Path(tmp)/'BV1q9nx69ELG-part-1';job.mkdir();p.write_json(job/'lesson.json',lesson)
   def enrich(data,*args):data['sentences'][0]['meaningLinks']=[{'zh':[0],'en':[0]}];return data
   with patch.object(p,'enrich_meanings',side_effect=enrich)as linker,patch.object(p,'run_command')as media:
    result=p.prepare_unlocked({'bvid':'BV1q9nx69ELG','page':1},{'jobs':tmp},lambda *_:None)
    linker.assert_called_once();media.assert_not_called();self.assertEqual(result['sentences'][0]['start'],0)
    self.assertEqual(p.read_json(job/'lesson.json')['sentences'][0]['meaningLinks'],[{'zh':[0],'en':[0]}])
if __name__=='__main__':unittest.main()
