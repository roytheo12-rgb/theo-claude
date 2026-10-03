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
# --- maisons écrites de deux façons (Penhaligon's / Penhaligons, Comme des Garçons / Garcons…) : une seule, avec ses parfums fusionnés
_base = lambda h: re.sub(r'\b(maison|parfums|parfum|paris|london|the|de|des|la|le|les|by|and)\b', ' ', norm(h)).replace(' ', '')
_groups = {}
for h, arr in INDEX: _groups.setdefault(_base(h), []).append((h, arr))
MERGE = {}      # norm(variante) -> nom retenu
_merged = []
for h, arr in INDEX:
    g = _groups[_base(h)]
    if len(g) == 1 or _base(h) == '': _merged.append([h, arr]); continue
    best = max(g, key=lambda x: (len(x[1]) + (100 if re.search(r"[^\x00-\x7f']|'", x[0]) else 0), x[0]))[0]
    if h != best: MERGE[norm(h)] = best; continue
    seen_n = {}; rows = []
    for hh, aa in g:
        for x in aa:
            k = norm(x[0]).replace(' ', '')
            if k not in seen_n: seen_n[k] = x; rows.append(x)
    _merged.append([best, sorted(rows, key=lambda x: norm(x[0]))])
INDEX = _merged
for k, v in MERGE.items(): ALIAS[k] = v
idx_src = put(idx_src, 'HOUSE_ALIAS', ALIAS)
canon = lambda h: norm(ALIAS.get(norm(h), h))
# Hermès : « Hermessence Agar Ébène » et « Agar Ébène » sont le même parfum, on garde le nom court
for _h, _arr in INDEX:
    if norm(_h) == 'hermes':
        _names = {norm(x[0]) for x in _arr}
        for x in _arr:
            if norm(x[0]).startswith('hermessence ') and norm(x[0])[len('hermessence '):] in _names: PERF.add('hermes|' + norm(x[0]))
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
def remap(d):
    out = {}
    for k, v in d.items():
        h, n = k.split('|', 1); h2 = norm(MERGE[h]) if h in MERGE else h
        kk = h2 + '|' + n
        if kk not in out or h2 == h: out[kk] = v
    return out
def key_gone(k):
    h, n = k.split('|', 1)
    return h in H or canon(h) in H or k in dead_keys or k in PERF or any(p.search(n) for p in PAT)
# --- cartes de clés (photos, faits, profils)
files_dead = set(); n_removed = {}
for fname, var in (('imgdb.js', 'IMGDB'), ('imgnew.js', 'IMGNEW'), ('imgweb.js', 'IMGWEB'), ('facts.js', 'FACTS'), ('profils.js', 'PROFILS')):
    src = rd(fname); _, _, d = grab(src, var); out = {}
    d = remap(d)
    for k, v in d.items():
        if key_gone(k):
            if isinstance(v, str) and v.startswith('img/'): files_dead.add(v)
        else: out[k] = v
    if var == 'FACTS':      # une version (extrait, absolu, esprit…) ne reprend pas les notes de la version de base : si elles sont identiques, on les retire de la déclinaison
        _vw = re.compile(r'\b(extrait de parfum|extrait|eau de parfum|eau de toilette|eau de cologne|edp|edt|parfum|esprit de parfum|esprit|absolu de parfum|absolu|absolue|intense|elixir|cologne)\b')
        grp = {}
        for k in out:
            h, n = k.split('|', 1); grp.setdefault(h + '|' + re.sub(r'\s+', ' ', _vw.sub(' ', n)).strip(), []).append(k)
        for ks in grp.values():
            if len(ks) < 2: continue
            ks.sort(key=len); b = out[ks[0]].get('n') or []
            for k in ks[1:]:
                if b and sorted(norm(x) for x in b) == sorted(norm(x) for x in (out[k].get('n') or [])): out[k] = {kk: vv for kk, vv in out[k].items() if kk != 'n'}
    n_removed[var] = len(d) - len(out); wr(fname, put(src, var, out))
# --- photos d'internet (IMGDB, IMGWEB) : une même image attribuée à des parfums différents est une erreur d'appariement (déclinaison, autre parfum de la maison) : on ne la garde pas
import hashlib
def _core(k):
    h, n = k.split('|', 1); n = n.replace('ch ur', 'choeur').replace('c ur', 'coeur')
    drop = set(h.split()) | {'hermessence', 'la', 'le', 'les', 'l', 'the', 'de', 'du', 'eau', 'parfum', 'edp', 'edt'}
    return ''.join(sorted(t for t in n.split() if t not in drop))
_g = {}
for _f, _v in (('imgdb.js', 'IMGDB'), ('imgweb.js', 'IMGWEB')):
    _src = rd(_f); _d = grab(_src, _v)[2]
    for k, v in _d.items():
        pth = root / 'v2' / v
        if pth.exists(): _g.setdefault(hashlib.md5(pth.read_bytes()).hexdigest(), []).append((_f, _v, k, v))
_bad = {}
for lst in _g.values():
    if len(lst) > 1 and len({_core(k) for _, _, k, _ in lst}) > 1:
        for f, v, k, fn in lst: _bad.setdefault((f, v), set()).add(k); files_dead.add(fn)
for (_f, _v), ks in _bad.items():
    _src = rd(_f); _d = grab(_src, _v)[2]; wr(_f, put(_src, _v, {k: x for k, x in _d.items() if k not in ks}))
n_removed['partagées'] = sum(len(v) for v in _bad.values())
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
