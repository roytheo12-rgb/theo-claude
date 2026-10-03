"""Ajoute à index.js les parfums de data/keep-perfumes.txt (maisons retirées comprises). Idempotent ; lancé par v2/build.py après prune.py."""
import json, re, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
root = pathlib.Path(__file__).resolve().parent.parent
import importlib.util
src = (root / 'index.js').read_text(encoding='utf-8')
def grab(src, var):
    m = re.search(r'window\.' + var + r' = ', src); i = m.end(); depth = 0; j = i; ins = False; esc = False
    while True:
        c = src[j]
        if ins:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': ins = False
        elif c == '"': ins = True
        elif c in '[{': depth += 1
        elif c in ']}':
            depth -= 1
            if depth == 0: break
        j += 1
    return m.start(), j + 1, json.loads(src[i:j + 1])
a, b, INDEX = grab(src, 'INDEX')
import unicodedata
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
by = {norm(h): arr for h, arr in INDEX}
n = 0
for l in (root / 'data/keep-perfumes.txt').read_text(encoding='utf-8').splitlines():
    l = l.strip()
    if not l or l.startswith('#'): continue
    h, name, conc = l.split('|')
    arr = by.get(norm(h))
    if arr is None: arr = []; INDEX.append([h, arr]); by[norm(h)] = arr
    if not any(norm(x[0]) == norm(name) for x in arr): arr.append([name, conc]); n += 1
if n:
    for _, arr in INDEX: arr.sort(key=lambda x: norm(x[0]))
    (root / 'index.js').write_text(src[:a] + 'window.INDEX = ' + json.dumps(INDEX, ensure_ascii=False, separators=(',', ':')) + src[b:], encoding='utf-8')
print('ajoutés :', n)
