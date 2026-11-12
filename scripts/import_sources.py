from pathlib import Path
import subprocess,json,hashlib,zipfile,xml.etree.ElementTree as E,shutil
root=Path(__file__).resolve().parents[2]; out=root/'textbook'
rows=[]
for p in sorted(root.iterdir()):
 if p.suffix.lower() not in ['.pdf','.docx','.doc']: continue
 if not (p.name[0].isdigit() or any(x in p.name for x in ['МАТАН','ЛИНАЛ','матан','Билеты','Вопросы к экзамену','Методика','Литература_по_линейной'])): continue
 key=hashlib.sha256(p.read_bytes()).hexdigest()[:12]
 shutil.copy2(p,out/'sources'/p.name)
 text=''
 if p.suffix=='.pdf': text=subprocess.run(['pdftotext','-layout',str(p),'-'],capture_output=True,text=True).stdout
 if p.suffix=='.docx':
  with zipfile.ZipFile(p) as z:
   tree=E.fromstring(z.read('word/document.xml')); text='\n'.join(''.join(n.itertext()) for n in tree.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
 (out/'content'/f'{key}.txt').write_text(text)
 rows.append(dict(id=key,name=p.name,url='sources/'+p.name,text='content/'+key+'.txt',status='извлечён текст; формулы сверять с оригиналом' if text else 'нужна конвертация DOC'))
(out/'content'/'sources.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print(len(rows),'учебных источников')
