"""Import the known coursework set, retaining prior versions and skipping personal files."""
from pathlib import Path
import subprocess,json,hashlib,zipfile,xml.etree.ElementTree as E,io
root=Path(__file__).resolve().parents[2];out=root/'textbook'
manifest=out/'content/sources.json'
rows=json.loads(manifest.read_text()) if manifest.exists() else []
known={s['id'] for s in rows}
def ingest(name,data,archived=False):
 suffix=Path(name).suffix.lower()
 if suffix not in ['.pdf','.docx','.doc']:return
 key=hashlib.sha256(data).hexdigest()[:12]
 if key in known:return
 # Hash in name retains old originals when an updated version uses the same filename.
 display=('Архив — ' if archived else '')+Path(name).name
 p=out/'sources'/(key+' — '+display);p.write_bytes(data);text=''
 if suffix=='.pdf':
  r=subprocess.run(['pdftotext','-layout',str(p),'-'],capture_output=True,text=True)
  if r.returncode==0:text=r.stdout
 elif suffix=='.docx':
  with zipfile.ZipFile(io.BytesIO(data)) as z:
   tree=E.fromstring(z.read('word/document.xml'))
   ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
   text='\n'.join(''.join(t.text or '' for t in para.findall('.//w:t',ns)) for para in tree.findall('.//w:p',ns))
 (out/'content'/f'{key}.txt').write_text(text)
 rows.append(dict(id=key,name=display,url='sources/'+p.name,text='content/'+key+'.txt',status='Извлечён текст; формулы сверять с оригиналом' if text else 'Текст не извлечён; открыть оригинал'))
 known.add(key)
for p in sorted(root.iterdir()):
 if not p.is_file():continue
 if p.suffix.lower() not in ['.pdf','.docx','.doc']:continue
 if not (p.name[0].isdigit() or any(x in p.name for x in ['МАТАН','ЛИНАЛ','матан','Билеты','Вопросы к экзамену','Методика','Литература_по_линейной'])):continue
 ingest(p.name,p.read_bytes())
archive=root/'Матан.zip'
if archive.exists():
 with zipfile.ZipFile(archive) as z:
  for item in z.infolist():
   if not item.is_dir() and item.file_size<30_000_000:ingest(item.filename,z.read(item),True)
manifest.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(len(rows),'уникальных источников; предыдущие версии сохранены')
