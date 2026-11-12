"""Create an offline, double-clickable HTML next to the original sources directory."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
files={str(p.relative_to(root)):p.read_text() for p in (root/'content').iterdir() if p.suffix in ['.json','.txt']}
data=json.dumps(files,ensure_ascii=False).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
html=html.replace('<script src="math.js"></script>','<script>window.OPORA_FILES='+data+';</script><script>'+(root/'math.js').read_text()+'</script>')
for name in ['core','app']:
 html=html.replace('<script src="'+name+'.js"></script>','<script>'+(root/(name+'.js')).read_text()+'</script>')
(root/'Учебник.html').write_text(html)
print('Created Учебник.html:',len(html.encode()),'bytes. Keep sources/ beside it for original PDFs.')
