"""Build distributable extension and local helper. Explicit allowlists exclude secrets/caches."""
import json,pathlib,re,shutil,zipfile
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent;EXT=OUT/'mandarin-extension';EXT.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'extension/manifest.json').read_text())
(EXT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
shared='\n'.join(re.sub(r'^import .*?;\n','',(ROOT/f).read_text(),flags=re.M).replace('export ','')for f in ['engine.js','learning-ui.js'])
(EXT/'content.js').write_text('(()=>{\n'+shared+'\n'+(ROOT/'extension/panel.js').read_text()+'\n})();\n')
for src,dest in [('extension/appearance.js','appearance.js'),('extension/appearance.css','appearance.css'),('extension/background.js','background.js'),('engine.js','engine.js'),('extension/README.md','README.md'),('data/lesson.json','data/lesson.json'),('data/meaning-links.json','data/meaning-links.json')]:
 (EXT/dest).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/src,EXT/dest)
with zipfile.ZipFile(OUT/'mandarin-extension.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9)as z:
 for name in ['manifest.json','content.js','appearance.js','appearance.css','background.js','engine.js','README.md','data/lesson.json','data/meaning-links.json']:z.write(EXT/name,name)
shutil.copy2(OUT/'mandarin-extension.zip',ROOT/'mandarin-extension.zip')
with zipfile.ZipFile(OUT/'mandarin-pipeline-helper.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9)as z:
 for name in ['native_host.py','pipeline.py','timing.py','meaning.py','character-dictionary.json','install.py','Install helper.command','requirements.txt','extension-identity.json','README.md']:
  z.write(ROOT/'pipeline'/name,'mandarin-pipeline-helper/'+name)
shutil.copy2(OUT/'mandarin-pipeline-helper.zip',ROOT/'mandarin-pipeline-helper.zip')
print(f'Built extension {manifest["version"]} and local helper ZIP; no API keys or audio included.')
