import io,json,pathlib,struct,sys,tempfile,unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import pipeline as p
class PipelineTests(unittest.TestCase):
 def tearDown(self):p.CANCEL.clear()
 def test_identity_rejects_commands_and_bad_parts(self):
  self.assertEqual(p.identity('BV1q9nx69ELG',1),'BV1q9nx69ELG:1')
  for b,n in [('https://evil.example',1),('BV1q9nx69ELG',0),('BV1q9nx69ELG',True),('BV1q9nx69ELG;touch',1)]:
   with self.assertRaises(p.PipelineError):p.identity(b,n)
 def test_spending_guard_counts_attempted_failures(self):
  with tempfile.TemporaryDirectory()as tmp:
   path=pathlib.Path(tmp)/'attempts.json';p.write_json(path,[{'status':'failure'}for _ in range(6)]+[{'status':'success'}for _ in range(5)])
   ledger=p.Attempts(path)
   with self.assertRaises(p.PipelineError):ledger.begin('must not submit')
   self.assertEqual(len(ledger.rows),11)
 def test_rejections_are_not_operational_failures(self):
  with tempfile.TemporaryDirectory()as tmp:
   path=pathlib.Path(tmp)/'attempts.json';p.write_json(path,[{'status':'rejected'}for _ in range(11)])
   self.assertEqual(p.Attempts(path).begin('allowed'),11)
 def test_interrupted_attempt_is_not_erased(self):
  with tempfile.TemporaryDirectory()as tmp:
   path=pathlib.Path(tmp)/'attempts.json';p.write_json(path,[{'status':'started'}]);self.assertEqual(p.Attempts(path).rows[0]['status'],'failure')
 def test_cancel_prevents_a_new_submission(self):
  with tempfile.TemporaryDirectory()as tmp:
   ledger=p.Attempts(pathlib.Path(tmp)/'attempts.json');p.CANCEL.set()
   with self.assertRaises(p.Cancelled):ledger.begin('must not submit')
   self.assertEqual(ledger.rows,[])
 def test_model_word_coverage_is_required(self):
  s={'zh':'你好','pinyin':'nǐ hǎo','en':'Hello','words':[{'zh':'你','pinyin':'nǐ','en':'you'}]}
  with self.assertRaises(p.PipelineError):p.validate_edited({'sentences':[s]})
 def test_interrupted_connection_is_counted_and_can_be_resumed(self):
  import http.client,os
  from unittest.mock import patch
  with tempfile.TemporaryDirectory()as tmp:
   ledger=p.Attempts(pathlib.Path(tmp)/'attempts.json')
   with patch.dict(os.environ,{'OPENAI_API_KEY':'unit-test'}),patch('urllib.request.urlopen',side_effect=http.client.RemoteDisconnected('closed')):
    with self.assertRaisesRegex(p.PipelineError,'Resume preparation'):p.api_request(b'{}','application/json',ledger,'test','chat/completions')
   self.assertEqual(len(ledger.rows),1);self.assertEqual(ledger.rows[0]['status'],'failure')
 def test_successful_inflight_result_is_not_discarded_on_cancel(self):
  import io,os
  from unittest.mock import patch
  with tempfile.TemporaryDirectory()as tmp:
   ledger=p.Attempts(pathlib.Path(tmp)/'attempts.json')
   def response(*args,**kwargs):p.CANCEL.set();return io.BytesIO(b'{"text":"finished"}')
   with patch.dict(os.environ,{'OPENAI_API_KEY':'unit-test'}),patch('urllib.request.urlopen',side_effect=response):
    data=p.api_request(b'{}','application/json',ledger,'test','chat/completions')
   self.assertEqual(data['text'],'finished');self.assertEqual(ledger.rows[0]['status'],'success')
   with self.assertRaises(p.Cancelled):ledger.begin('must not submit')
 def test_same_recording_cannot_run_in_two_helpers(self):
  import fcntl
  from unittest.mock import patch
  with tempfile.TemporaryDirectory()as tmp:
   folder=pathlib.Path(tmp)/'BV1q9nx69ELG-part-1';folder.mkdir()
   with (folder/'prepare.lock').open('a')as lock:
    fcntl.flock(lock.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
    with patch.object(p,'prepare_unlocked')as worker:
     with self.assertRaises(p.PipelineError):p.prepare({'bvid':'BV1q9nx69ELG','page':1},{'jobs':tmp},lambda x:None)
     worker.assert_not_called()
 def test_parallel_attempt_ledger_keeps_every_submission(self):
  import concurrent.futures
  with tempfile.TemporaryDirectory()as tmp:
   ledger=p.Attempts(pathlib.Path(tmp)/'attempts.json')
   def submit(i):
    index=ledger.begin(str(i));ledger.finish(index,'success')
   with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(submit,range(25)))
   self.assertEqual(len(ledger.rows),25);self.assertTrue(all(x['status']=='success'for x in ledger.rows))
 def test_group_repair_preserves_corrected_sentence_without_an_extra_api_call(self):
  sentence={'zh':'你好世界。','pinyin':'nǐ hǎo shì jiè','en':'Hello world.','words':[{'zh':'你好','pinyin':'nǐ hǎo','en':'hello'}]}
  dictionary={'characters':{},'words':{'世界':{'pinyin':'shì jiè','en':'world'}}}
  repaired=p.repair_groups({'sentences':[sentence]},dictionary)
  self.assertEqual(repaired['sentences'][0]['zh'],'你好世界。');p.validate_edited(repaired)
  self.assertEqual(repaired['sentences'][0]['words'][1]['zh'],'世界')
  self.assertEqual(repaired['sentences'][0]['words'][1]['segmentationStatus'],'dictionary-fallback')
 def test_alignment_zero_duration_is_explicitly_flagged(self):
  edited={'sentences':[{'zh':'你好','en':'Hello','pinyin':'nǐ hǎo','words':[{'zh':'你','pinyin':'nǐ','en':'you'},{'zh':'好','pinyin':'hǎo','en':'good'}]}]}
  raw={'words':[{'word':'你','start':0,'end':.4},{'word':'好','start':.4,'end':.8}]};forced={'segments':[{'words':[{'word':'你','start':0,'end':0},{'word':'好','start':.4,'end':.8}]}]}
  sentences,flags,end=p.assemble_chunk(edited,raw,forced,60,0)
  self.assertEqual(sentences[0]['words'][0]['timingStatus'],'asr-fallback');self.assertEqual(len(flags),1);self.assertEqual(end,60.8)
if __name__=='__main__':unittest.main()
