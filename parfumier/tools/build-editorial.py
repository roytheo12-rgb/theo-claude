"""Fiches éditoriales structurées (data/editorial/*.txt) -> editorial.js (window.EDITORIAL).
Une ligne par parfum : Maison|Parfum|clé=valeur|clé=valeur… ; les listes se séparent par « ; ».
Clés : an, nez, desc, forts, faibles, pour (public idéal), eviter (public à éviter), sit (situations), tenue, mood, st (culte|sous|juste|sur|new),
prix (€), dispo (restreint|secondaire|discontinue), achat, tier (S|A|B).
Les parfums absents de la base sont ajoutés à data/keep-perfumes.txt (section « éditorial »).
Usage : python3 tools/build-editorial.py"""
import json, re, glob, pathlib, subprocess, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
js = "const vm=require('vm'),fs=require('fs');const w={};w.window=w;vm.createContext(w);for(const f of ['data','index'])vm.runInContext(fs.readFileSync(f+'.js','utf8'),w);const o={alias:w.HOUSE_ALIAS||{},names:[]};(w.CATALOG||[]).forEach(c=>c.name&&c.house&&o.names.push([c.house,c.name]));w.INDEX.forEach(([h,a])=>a.forEach(([n])=>o.names.push([h,n])));console.log(JSON.stringify(o))"
B = json.loads(subprocess.check_output(['node', '-e', js], cwd=root))
alias = B['alias']; canon = lambda h: alias.get(norm(h), h)
byhouse = {}
for h, n in B['names']: byhouse.setdefault(norm(canon(h)), {})[norm(n)] = (h, n)
out, missing = {}, []
for f in sorted(glob.glob(str(root / 'data/editorial/*.txt'))):
    for l in open(f, encoding='utf-8'):
        l = l.rstrip('\n')
        if not l.strip() or l.startswith('#'): continue
        p = l.split('|'); h, n = p[0].strip(), p[1].strip(); e = {}
        for kv in p[2:]:
            if '=' in kv: k, v = kv.split('=', 1); e[k.strip()] = v.strip()
        for k in ('forts', 'faibles', 'sit'):
            if k in e: e[k] = [x.strip() for x in e[k].split(';') if x.strip()]
        if 'prix' in e:
            try: e['prix'] = int(re.sub(r'\D', '', e['prix']))
            except ValueError: del e['prix']
        m = byhouse.get(norm(canon(h)), {})
        hit = m.get(norm(n))
        if not hit:
            c = [v for k, v in m.items() if k.replace(' ', '') == norm(n).replace(' ', '')]
            hit = c[0] if c else None
        if not hit: missing.append((h, n)); hit = (h, n)
        key = norm(canon(hit[0])) + '|' + norm(hit[1])
        out.setdefault(key, {}).update(e)
        out[key]['h'] = canon(hit[0]); out[key]['n'] = hit[1]
if missing:
    kp = root / 'data/keep-perfumes.txt'; cur = kp.read_text(encoding='utf-8'); have = {norm(a.split('|')[0]) + '|' + norm(a.split('|')[1]) for a in cur.splitlines() if a.count('|') >= 2}
    add = [f'{h}|{n}|EDP' for h, n in missing if norm(h) + '|' + norm(n) not in have]
    if add: kp.write_text(cur.rstrip('\n') + '\n' + '\n'.join(add) + '\n', encoding='utf-8')
    print(len(add), 'parfums ajoutés à keep-perfumes.txt :', ', '.join(f'{h} {n}' for h, n in missing[:6]), '…')
(root / 'editorial.js').write_text("// Généré par tools/build-editorial.py depuis data/editorial/*.txt : fiches éditoriales structurées (description, forces, faiblesses, public, situations, tenue, mood, statut, prix, achat).\nwindow.EDITORIAL = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n", encoding='utf-8')
print(len(out), 'fiches éditoriales -> editorial.js')
