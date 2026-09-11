"""Build the portable demo and client handoff archive using Python's standard library."""
from pathlib import Path
import base64
import json
import zipfile

root = Path(__file__).resolve().parent
js = (root / 'mission-guide.js').read_text(encoding='utf-8')
css = (root / 'mission-guide.css').read_text(encoding='utf-8')
image = 'data:image/png;base64,' + base64.b64encode((root / 'mission-guide.png').read_bytes()).decode()
js = js.replace('<link rel="stylesheet" href="${new URL(\'./mission-guide.css\', import.meta.url)}">', '${embeddedStyle}')
js = 'const embeddedStyle = ' + json.dumps('<style>' + css + '</style>') + ';\n' + js
js = js.replace("new URL('./mission-guide.png', import.meta.url).href", json.dumps(image))
html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace('<script type="module" src="./mission-guide.js"></script>', '')
html = html.replace('<script type="module">', '<script>\n' + js + '\n')
html = html.replace("await customElements.whenDefined('satquery-guide');", '')
assert 'import.meta' not in html and 'type="module"' not in html
(root / 'SATQUERY-DEMO.html').write_text(html, encoding='utf-8')
files = ['SATQUERY-DEMO.html', 'START-HERE.txt', 'index.html', 'mission-guide.js', 'mission-guide.css', 'mission-guide.png', 'README.md', 'package-demo.py']
with zipfile.ZipFile(root / 'SATQUERY-Mission-Guide.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, 'SATQUERY-Mission-Guide/' + name)
with zipfile.ZipFile(root / 'SATQUERY-Mission-Guide.zip') as archive:
    assert archive.testzip() is None
print('Built standalone demo and verified ZIP integrity.')
