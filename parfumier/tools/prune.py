"""Retire de l'appli les maisons de data/removed-houses.txt et les parfums de data/removed-perfumes.txt : index, catalogue, fiches, faits, profils, photos (fichiers compris).
Idempotent ; lancé au début de v2/build.py pour que rien ne revienne après une régénération. Usage : python3 tools/prune.py"""
import json, re, pathlib, unicodedata, os
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
H = {norm(l) for l in (root / 'data/removed-houses.txt').read_text(encoding='utf-8').splitlines() if l.strip()}
PERF, PAT = set(), []
for l in (root / 'data/removed-perfumes.txt').read_text(encoding='utf-8').splitlines():
    l = l.strip()
    if not l or l.startswith('#'): continue
    if l.startswith('~'): PAT.append(re.compile(l[1:])); continue
    h, n = l.split('|', 1); PERF.add(norm(h) + '|' + norm(n))
def rd(name): return (root / name).read_text(encoding='utf-8')
def wr(name, s): (root / name).write_text(s, encoding='utf-8')
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
def put(src, var, val):
    a, b, _ = grab(src, var)
    return src[:a] + 'window.' + var + ' = ' + json.dumps(val, ensure_ascii=False, separators=(',', ':')) + src[b:]
idx_src = rd('index.js')
_, _, INDEX = grab(idx_src, 'INDEX'); _, _, ALIAS = grab(idx_src, 'HOUSE_ALIAS')
canon = lambda h: norm(ALIAS.get(norm(h), h))
def house_gone(h): return norm(h) in H or canon(h) in H
def name_gone(h, n):
    k = norm(h) + '|' + norm(n)
    return k in PERF or canon(h) + '|' + norm(n) in PERF or any(p.search(norm(n)) for p in PAT)
def gone(h, n): return house_gone(h) or name_gone(h, n)
# --- index.js
newidx, dead_nose, dead_keys = [], set(), set()
for h, arr in INDEX:
    if house_gone(h):
        for x in arr: dead_nose.add(norm(h + ' ' + x[0])); dead_keys.add(norm(h) + '|' + norm(x[0]))
        continue
    keep = []
    for x in arr:
        if name_gone(h, x[0]): dead_nose.add(norm(h + ' ' + x[0])); dead_keys.add(norm(h) + '|' + norm(x[0])); dead_keys.add(canon(h) + '|' + norm(x[0]))
        else: keep.append(x)
    if keep: newidx.append([h, keep])
idx_src = put(idx_src, 'INDEX', newidx)
_, _, NB = grab(idx_src, 'NOSE_BY'); idx_src = put(idx_src, 'NOSE_BY', {k: v for k, v in NB.items() if k not in dead_nose and not any(k.startswith(h + ' ') for h in H)})
_, _, ED = grab(idx_src, 'EDITIONS'); idx_src = put(idx_src, 'EDITIONS', [k for k in ED if k not in dead_keys and k.split('|')[0] not in H])
wr('index.js', idx_src)
def key_gone(k):
    h, n = k.split('|', 1)
    return h in H or canon(h) in H or k in dead_keys or k in PERF or any(p.search(n) for p in PAT)
# --- cartes de clés (photos, faits, profils)
files_dead = set(); n_removed = {}
for fname, var in (('imgdb.js', 'IMGDB'), ('imgnew.js', 'IMGNEW'), ('imgweb.js', 'IMGWEB'), ('facts.js', 'FACTS'), ('profils.js', 'PROFILS')):
    src = rd(fname); _, _, d = grab(src, var); out = {}
    for k, v in d.items():
        if key_gone(k):
            if isinstance(v, str) and v.startswith('img/'): files_dead.add(v)
        else: out[k] = v
    n_removed[var] = len(d) - len(out); wr(fname, put(src, var, out))
# fichiers : on ne supprime que ceux que plus aucune clé ne référence
alive = set()
for fname, var in (('imgdb.js', 'IMGDB'), ('imgnew.js', 'IMGNEW'), ('imgweb.js', 'IMGWEB'), ('imgnew.js', 'NOSE_IMG')):
    _, _, d = grab(rd(fname), var); alive |= {v for v in d.values() if isinstance(v, str)}
sh = root / 'data/imgshots.json'
if sh.exists():
    d = json.loads(sh.read_text(encoding='utf-8')); d2 = {k: v for k, v in d.items() if not key_gone(k)}
    if len(d2) != len(d): sh.write_text(json.dumps(d2, ensure_ascii=False, indent=0), encoding='utf-8')
    alive |= set(d2.values())
nf = 0
for f in files_dead - alive:
    p = root / 'v2' / f
    if p.exists(): p.unlink(); nf += 1
# --- data.js : lignes du catalogue
src = rd('data.js'); lines = src.split('\n'); out = []; dead_names = set(); ncat = 0
for ln in lines:
    m = re.match(r"\s*\['((?:[^'\\]|\\.)+)', '((?:[^'\\]|\\.)+)', '", ln)
    if m and gone(m.group(2).replace("\\'", "'"), m.group(1).replace("\\'", "'")): dead_names.add(m.group(1).replace("\\'", "'")); ncat += 1; continue
    out.append(ln)
src = '\n'.join(out)
for nm in dead_names: src = re.sub(r"'" + re.escape(nm.replace("'", "\\'")) + r"', ", '', src) if re.search(r"const WISH = .*'" + re.escape(nm) + "'", src) else src
wr('data.js', src)
# --- fiches.js
src = rd('fiches.js'); m = re.search(r'const F = (\[.*?\]);\n', src, re.S)
if m:
    F = json.loads(m.group(1)); F2 = [f for f in F if not gone(f['house'], f['name'])]; wr('fiches.js', src[:m.start(1)] + json.dumps(F2, ensure_ascii=False, separators=(',', ':')) + src[m.end(1):])
print(f"retiré : {sum(len(a) for _, a in INDEX) - sum(len(a) for _, a in newidx)} parfums de l'index, {ncat} du catalogue, clés {n_removed}, {nf} photos supprimées")
