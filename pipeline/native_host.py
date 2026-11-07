"""Chrome native messaging bridge. Stdout is reserved for framed JSON."""
import json,os,pathlib,struct,subprocess,sys,threading,time
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from pipeline import identity,write_json,read_json
MAX_MESSAGE=1_000_000
LOCK=threading.Lock();ACTIVE_LOCK=threading.Lock();ACTIVE=None
CONFIG=read_json(os.environ['TINGDONG_CONFIG'])
def read_exact(stream,size):
    out=bytearray()
    while len(out)<size:
        part=stream.read(size-len(out))
        if not part:return None if not out else (_ for _ in ()).throw(ValueError('Incomplete message'))
        out.extend(part)
    return bytes(out)
def read_message(stream):
    header=read_exact(stream,4)
    if header is None:return None
    size=struct.unpack('<I',header)[0]
    if size>MAX_MESSAGE:raise ValueError('Message too large')
    body=read_exact(stream,size)
    if body is None:raise ValueError('Incomplete message')
    return json.loads(body)
def send(event):
    body=json.dumps(event,ensure_ascii=False,separators=(',',':')).encode()
    if len(body)>MAX_MESSAGE:raise ValueError('Native response too large')
    with LOCK:sys.stdout.buffer.write(struct.pack('<I',len(body))+body);sys.stdout.buffer.flush()
def stream_lesson(key,path):
    text=pathlib.Path(path).read_text();compact=json.dumps(json.loads(text),ensure_ascii=False,separators=(',',':'))
    if len(compact.encode())>5_000_000:raise ValueError('Lesson exceeds 5 MB')
    chunks=[compact[i:i+48000]for i in range(0,len(compact),48000)]
    send({'type':'lesson-begin','key':key,'chunks':len(chunks)})
    for i,text in enumerate(chunks):send({'type':'lesson-chunk','key':key,'index':i,'text':text})
    send({'type':'lesson-end','key':key})
def process(request):
    global ACTIVE
    key=identity(request['bvid'],request['page']);folder=pathlib.Path(CONFIG['jobs']);folder.mkdir(parents=True,exist_ok=True)
    requestfile=folder/(request['bvid']+f'-part-{request["page"]}-request.json');write_json(requestfile,request)
    log=folder/(request['bvid']+f'-part-{request["page"]}-worker.log')
    try:
        with log.open('ab')as err:
            p=subprocess.Popen([sys.executable,'-u',str(HERE/'pipeline.py'),'--request',str(requestfile)],stdout=subprocess.PIPE,stderr=err,env=os.environ.copy())
            with ACTIVE_LOCK:
                if ACTIVE is not None:
                    ACTIVE['process']=p
                    if ACTIVE.get('cancel'):p.terminate()
            for line in p.stdout:
                try:event=json.loads(line)
                except ValueError:continue
                if event.get('key')!=key:continue
                if event['type']=='result':stream_lesson(key,event['path'])
                else:send(event)
            code=p.wait()
            if code:send({'type':'progress','key':key,'state':'failed','message':'The local worker stopped unexpectedly. Completed stages are saved; press Prepare to resume.','percent':0})
    except (BrokenPipeError,EOFError):pass
    except Exception:send({'type':'progress','key':key,'state':'failed','message':'The local helper could not finish this job. Check the local worker log.','percent':0})
    finally:
        with ACTIVE_LOCK:ACTIVE=None

def main():
    global ACTIVE
    # Chrome validates allowed_origins; additionally reject another calling extension.
    origins=[x for x in sys.argv[1:]if x.startswith('chrome-extension://')]
    if origins and origins[0]!=CONFIG['origin']:return
    while True:
        try:message=read_message(sys.stdin.buffer)
        except (ValueError,UnicodeError):break
        if message is None:break
        command=message.get('command')
        with (pathlib.Path(CONFIG['jobs'])/'host-status.log').open('a')as log:log.write(json.dumps({'command':command,'bvid':message.get('bvid'),'page':message.get('page')})+'\n')
        if command=='ping':send({'type':'ready','version':'0.4.0','configured':pathlib.Path(CONFIG['envFile']).exists()or bool(os.environ.get('OPENAI_API_KEY'))});continue
        try:key=identity(message.get('bvid'),message.get('page'))
        except Exception:send({'type':'error','message':'Invalid Bilibili video or part.'});continue
        if command=='cancel':
            with ACTIVE_LOCK:
                if ACTIVE and ACTIVE['key']==key:
                    ACTIVE['cancel']=True
                    if ACTIVE.get('process'):ACTIVE['process'].terminate()
                    send({'type':'progress','key':key,'state':'cancelling','message':'Stopping after the current operation; completed stages are kept.','percent':0})
            continue
        if command!='prepare':continue
        with ACTIVE_LOCK:
            if ACTIVE:
                send({'type':'progress','key':key,'state':'failed','message':'Another video is already being prepared. Wait for it or cancel it first.','percent':0});continue
            ACTIVE={'key':key,'cancel':False};thread=threading.Thread(target=process,args=({'bvid':message['bvid'],'page':message['page']},));ACTIVE['thread']=thread;thread.start()
    with ACTIVE_LOCK:
        active=ACTIVE
        if active and active.get('process'):active['process'].terminate()
    if active:active['thread'].join(timeout=150)
if __name__=='__main__':main()
