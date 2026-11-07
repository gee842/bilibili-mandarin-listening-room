"""Register the helper for this user. No API key is placed in an extension."""
import argparse,base64,getpass,hashlib,json,os,pathlib,shlex,shutil,subprocess,sys
HOST='com.tingdong.pipeline'
HERE=pathlib.Path(__file__).resolve().parent

def extension_id(key):return ''.join(chr(ord('a')+int(c,16))for c in hashlib.sha256(base64.b64decode(key)).hexdigest()[:32])
def main():
    p=argparse.ArgumentParser();p.add_argument('--python');p.add_argument('--app-dir');p.add_argument('--native-dir');p.add_argument('--jobs');p.add_argument('--models');p.add_argument('--noninteractive',action='store_true');args=p.parse_args()
    app=pathlib.Path(args.app_dir)if args.app_dir else pathlib.Path.home()/'Library/Application Support/Tingdong Pipeline'
    app.mkdir(parents=True,exist_ok=True);app.chmod(0o700)
    python=args.python
    if not python:
        venv=app/'runtime';uv=shutil.which('uv')or'/opt/homebrew/bin/uv'
        if not pathlib.Path(uv).exists():raise SystemExit('Install uv and FFmpeg first, then run this installer again. See README.md.')
        if not (venv/'bin/python').exists():subprocess.run([uv,'venv','--python','3.12',str(venv)],check=True)
        python=str(venv/'bin/python');subprocess.run([uv,'pip','install','--python',python,'-r',str(HERE/'requirements.txt')],check=True)
    subprocess.run([python,'-c','import stable_whisper,pypinyin,torch'],check=True,stdout=subprocess.DEVNULL)
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise SystemExit('FFmpeg is required. Install it, then run this installer again.')
    local_ytdlp=pathlib.Path(python).parent/'yt-dlp'
    ytdlp=str(local_ytdlp)if local_ytdlp.is_file()else shutil.which('yt-dlp')
    if not ytdlp or not pathlib.Path(ytdlp).is_file():raise SystemExit('yt-dlp is required. Install it, then run this installer again.')
    runtime=app/'runner';runtime.mkdir(exist_ok=True)
    for name in ['native_host.py','pipeline.py','timing.py','meaning.py','character-dictionary.json']:
        dest=runtime/name
        if (HERE/name).resolve()!=dest.resolve():shutil.copy2(HERE/name,dest)
    envfile=app/'.env';key=os.environ.get('OPENAI_API_KEY')
    if not key and not envfile.exists()and not args.noninteractive:key=getpass.getpass('OpenAI API key (saved only on this Mac): ').strip()
    if key:
        fd=os.open(envfile,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
        with os.fdopen(fd,'w')as f:f.write('OPENAI_API_KEY='+key+'\n')
        envfile.chmod(0o600)
    if not envfile.exists()and not key:raise SystemExit('No API key configured; installation is incomplete.')
    public=json.loads((HERE/'extension-identity.json').read_text());origin=f'chrome-extension://{extension_id(public["key"])}/'
    config={'jobs':str(pathlib.Path(args.jobs)if args.jobs else app/'jobs'),'models':str(pathlib.Path(args.models)if args.models else app/'models'),'ffmpeg':ffmpeg,'ytdlp':ytdlp,'envFile':str(envfile),'origin':origin}
    for directory in [config['jobs'],config['models']]:pathlib.Path(directory).mkdir(parents=True,exist_ok=True)
    configfile=app/'config.json';configfile.write_text(json.dumps(config,indent=2)+'\n');configfile.chmod(0o600)
    launcher=app/'launch-host';launcher.write_text('#!/bin/sh\nexport TINGDONG_CONFIG='+shlex.quote(str(configfile))+'\nexport PATH='+shlex.quote('/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin')+'\nexec '+shlex.quote(str(python))+' -u '+shlex.quote(str(runtime/'native_host.py'))+' "$@"\n');launcher.chmod(0o700)
    native=pathlib.Path(args.native_dir)if args.native_dir else pathlib.Path.home()/'Library/Application Support/Google/Chrome/NativeMessagingHosts';native.mkdir(parents=True,exist_ok=True)
    manifest={'name':HOST,'description':'Mandarin lesson preparation on this Mac','path':str(launcher),'type':'stdio','allowed_origins':[origin]}
    (native/(HOST+'.json')).write_text(json.dumps(manifest,indent=2)+'\n')
    print('Helper installed. Reload extension 0.4, refresh Bilibili, and press Prepare this video.')
    print('Extension ID: '+extension_id(public['key']))
if __name__=='__main__':main()
