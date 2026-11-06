import io,json,os,pathlib,struct,sys,tempfile,unittest,importlib.util
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
class NativeTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.tmp=tempfile.TemporaryDirectory();config=pathlib.Path(cls.tmp.name)/'config.json';config.write_text(json.dumps({'jobs':cls.tmp.name}));os.environ['TINGDONG_CONFIG']=str(config)
  spec=importlib.util.spec_from_file_location('test_native_module',pathlib.Path(__file__).resolve().parents[1]/'native_host.py');cls.native=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.native)
 @classmethod
 def tearDownClass(cls):cls.tmp.cleanup()
 def test_framing_handles_fragmented_input(self):
  class Fragmented(io.BytesIO):
   def read(self,n=-1):return super().read(min(n,2))
  payload=json.dumps({'command':'ping'}).encode();self.assertEqual(self.native.read_message(Fragmented(struct.pack('<I',len(payload))+payload)),{'command':'ping'})
 def test_oversized_request_is_rejected(self):
  with self.assertRaises(ValueError):self.native.read_message(io.BytesIO(struct.pack('<I',2_000_000)))
 def test_large_lessons_transfer_below_native_message_limit(self):
  file=pathlib.Path(self.tmp.name)/'lesson.json';file.write_text(json.dumps({'text':'中文'*600_000},ensure_ascii=False));messages=[];old=self.native.send;self.native.send=messages.append
  try:self.native.stream_lesson('BV1q9nx69ELG:1',file)
  finally:self.native.send=old
  self.assertEqual(messages[0]['type'],'lesson-begin');self.assertEqual(messages[-1]['type'],'lesson-end')
  for message in messages:self.assertLess(len(json.dumps(message,ensure_ascii=False).encode()),1_000_000)
  joined=''.join(x['text']for x in messages if x['type']=='lesson-chunk');self.assertEqual(json.loads(joined)['text'],'中文'*600_000)
if __name__=='__main__':unittest.main()
