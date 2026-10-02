#!/usr/bin/env python3
"""Convertit data/fiches-ia/f*.txt (format compact) en :
   - data/fiches-5.txt : format historique (11 champs) lu par build-fiches.py (catalogue, pyramide, genre)
   - data/profils-ia.json : profil 18 axes, saisons, moment, usages, textes, par clé « maison|parfum » normalisée
   Les noms sont rapprochés de la base (index.js) quand c'est possible."""
import glob, json, re, sys, unicodedata, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
def norm(s): return ' '.join(re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFD', str(s).lower()).encode('ascii', 'ignore').decode()).split())
FAM = {'agrumes','aquatique','aromatique','vert','floral','fruité','gourmand','ambré','boisé','épicé','cuir','musqué','oud'}
AX = ['fraicheur','douceur','floral','boise','epice','resine','fume','poudre','vert','fruite','musque','cremeux','densite','originalite','clivage','formalite','sensualite','evolution']
# base : index.js -> {maison: [noms]}
idx = json.loads(re.search(r'window\.INDEX\s*=\s*(\[.*?\]);\s*\n', open(os.path.join(ROOT, 'index.js'), encoding='utf-8').read(), re.S).group(1)) if False else None
src = open(os.path.join(ROOT, 'index.js'), encoding='utf-8').read()
m = re.search(r'window\.INDEX\s*=\s*', src); dec = json.JSONDecoder(); INDEX, _ = dec.raw_decode(src[m.end():])
base = {}
for h, arr in INDEX:
    base.setdefault(norm(h), {}).update({norm(n): n for n, *_ in arr})
import subprocess
cat = json.loads(subprocess.check_output(['node', '-e', "const {ctx}=require('./tools/eval-pool.cjs');console.log(JSON.stringify(ctx.CATALOG.map(c=>[c.house,c.name])))"], cwd=ROOT).decode().strip().splitlines()[-1])
for h, n in cat: base.setdefault(norm(h), {}).setdefault(norm(n), n)
STRIP = re.compile(r' (edt|edp|eau de parfum|eau de toilette|extrait|parfum|pour homme)$')
def canon(h, n):
    names = base.get(norm(h)); nn = norm(n)
    if not names: return h, n, False
    if nn in names: return h, names[nn], True
    for k, v in names.items():
        if STRIP.sub('', k) == re.sub(r'^replica ', '', nn) or STRIP.sub('', k) == 'replica ' + nn: return h, v, True
        if STRIP.sub('', k) == nn or STRIP.sub('', nn) == k: return h, v, True
    return h, n, False
old = set()
for f in glob.glob(os.path.join(ROOT, 'data', 'fiches-[1-4].txt')):
    for l in open(f, encoding='utf-8'):
        q = l.split('|')
        if len(q) == 11 and not l.startswith('#'): old.add(norm(q[0]) + '|' + norm(q[1]))
# Fiches Manus (JSONL, schéma PROMPT-MANUS.md) : converties au même format compact
def j2line(f):
    nt = f.get('notes') or {}; pr = f.get('profil') or {}; pf = f.get('performance') or {}; sa = f.get('saisons') or {}; mo = f.get('moment') or {}; px = f.get('prix') or {}
    J = lambda l: ';'.join(str(x) for x in (l or []))
    return '|'.join([f.get('maison',''), f.get('parfum',''), f.get('concentration','EDP'), f.get('genre','u'), f.get('famille',''), J(nt.get('tete')), J(nt.get('coeur')), J(nt.get('fond')), str(pf.get('projection',3)), str(pf.get('tenue',3)), str(pf.get('poids',3)), str(px.get('eur') or 0),
        ''.join(str(pr.get(a,0)) for a in AX), ';'.join(str(sa.get(k,0)) for k in ('printemps','ete','automne','hiver')), ';'.join(str(mo.get(k,0)) for k in ('jour','soir')), J(f.get('usages')), f.get('dominante') or '-', f.get('difference') or '-', f.get('pitch') or '-', J(f.get('ressemble_a')) or '-', J(f.get('alternatives_abordables')) or '-', f.get('pour_qui') or '-', f.get('pas_pour_qui') or '-', J(f.get('mots_cles')) or '-', J(f.get('public')), str(min(2, int(f.get('confiance') or 1)) if True else 1)]).replace('\n',' ')
EXTRA = []
for jp in glob.glob(os.path.join(ROOT, 'data', 'manus', '*.jsonl')):
    for ln in open(jp, encoding='utf-8'):
        if ln.strip():
            try: EXTRA.append(j2line(json.loads(ln)))
            except Exception as e: print('rejet JSONL', jp, e)
ok = bad = 0; out11 = []; prof = {}; unmatched = []; seen = set()
FILES = sorted(glob.glob(os.path.join(ROOT, 'data', 'fiches-ia', 'f*.txt')))
for p in FILES:
    for i, l in enumerate(list(open(p, encoding='utf-8')) + (EXTRA if p == FILES[-1] else []), 1):
        l = l.rstrip('\n')
        if not l.strip() or l.startswith('#'): continue
        f = l.split('|')
        if len(f) != 26 or len(f[12]) != 18 or not f[12].isdigit() or f[4] not in FAM or f[3] not in 'mfu': print('rejet', p, i, f[:2], len(f)); bad += 1; continue
        f[5:8] = [';'.join(y for y in x.split(';') if y.strip() not in ('', '-')) for x in f[5:8]]
        if not any(f[5:8]) or f[17].strip() in ('', '-') or f[18].strip() in ('', '-'): print('rejet fiche trop pauvre', f[:2]); bad += 1; continue
        if any('?' in x for x in f[5:8]): print('rejet notes douteuses', f[:2]); bad += 1; continue
        h, n, hit = canon(f[0], f[1])
        k = norm(h) + '|' + norm(n)
        if k in seen: continue
        seen.add(k)
        if not hit: unmatched.append(h + ' | ' + n)
        notes = [x.strip() for x in f[5:8]]
        if k not in old: out11.append('|'.join([h, n, f[4], f[3], notes[0], notes[1], notes[2], f[8], f[9], f[10], f[11]]))
        pr = [int(c) for c in f[12]]; sa = [int(x) for x in f[13].split(';')]; mo = [int(x) for x in f[14].split(';')]
        prof[k] = {'p': pr, 's': sa, 'm': mo, 'u': [x for x in f[15].split(';') if x], 'dom': f[16], 'diff': f[17], 'pitch': f[18], 'sim': [x for x in f[19].split(';') if x and x != '-'], 'alt': [x for x in f[20].split(';') if x and x != '-'], 'pour': f[21] if f[21] != '-' else '', 'pas': f[22] if f[22] != '-' else '', 'kw': [x for x in f[23].split(';') if x and x != '-'], 'pub': [x for x in f[24].split(';') if x], 'c': int(f[25]) if f[25].isdigit() else 1}
        ok += 1
open(os.path.join(ROOT, 'data', 'fiches-5.txt'), 'w', encoding='utf-8').write('# Généré par tools/import-fiches-ia.py depuis data/fiches-ia/ (fiches écrites par le modèle, non vérifiées en ligne)\n' + '\n'.join(out11) + '\n')
json.dump(prof, open(os.path.join(ROOT, 'data', 'profils-ia.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(ok, 'fiches importées,', bad, 'rejetées ;', len(unmatched), 'absentes de la base (ajoutées au catalogue) :', '; '.join(unmatched[:40]))
