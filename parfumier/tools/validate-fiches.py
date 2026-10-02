#!/usr/bin/env python3
"""Valide des fiches JSONL (schéma PROMPT-MANUS.md). Usage : python3 tools/validate-fiches.py data/fiches-ia/*.jsonl"""
import json, sys
FAM = {'agrumes','aquatique','aromatique','vert','floral','fruité','gourmand','ambré','boisé','épicé','cuir','musqué','oud'}
AX = ['fraicheur','douceur','floral','boise','epice','resine','fume','poudre','vert','fruite','musque','cremeux','densite','originalite','clivage','formalite','sensualite','evolution']
def err(i, m): print(f'  ligne {i}: {m}'); return 1
bad = 0; ids = set(); profs = {}; n = 0
for path in sys.argv[1:]:
    print(path)
    for i, l in enumerate(open(path, encoding='utf-8'), 1):
        if not l.strip(): continue
        try: f = json.loads(l)
        except Exception as e: bad += err(i, 'JSON invalide ' + str(e)); continue
        n += 1; k = f.get('id')
        if k in ids: bad += err(i, 'id en double ' + str(k))
        ids.add(k)
        if f.get('famille') not in FAM: bad += err(i, 'famille invalide ' + str(f.get('famille')))
        if f.get('genre') not in ('m', 'f', 'u'): bad += err(i, 'genre')
        p = f.get('profil') or {}
        if sorted(p) != sorted(AX) or not all(isinstance(v, int) and 0 <= v <= 5 for v in p.values()): bad += err(i, 'profil: 18 entiers 0-5 attendus'); continue
        if sum(1 for v in p.values() if v >= 4) < 1 or sum(1 for v in p.values() if v <= 1) < 3: bad += err(i, 'profil trop plat (utiliser toute l\'échelle)')
        pf = f.get('performance') or {}
        if not all(isinstance(pf.get(x), int) and 1 <= pf[x] <= 5 for x in ('projection', 'tenue', 'poids')): bad += err(i, 'performance')
        for g, ks in (('saisons', ['printemps', 'ete', 'automne', 'hiver']), ('moment', ['jour', 'soir'])):
            d = f.get(g) or {}
            if not all(isinstance(d.get(x), int) and 0 <= d[x] <= 5 for x in ks): bad += err(i, g)
        nt = f.get('notes') or {}; flat = [x.lower() for lv in ('tete', 'coeur', 'fond') for x in (nt.get(lv) or [])]
        if len(flat) < 2: bad += err(i, 'moins de 2 notes')
        txt = ' '.join(flat)
        if p.get('boise', 0) >= 4 and not any(w in txt for w in ('bois', 'santal', 'cèdre', 'vétiver', 'patchouli', 'gaïac', 'cyprès', 'sapin', 'oud', 'ébène')): bad += err(i, 'boise>=4 sans note boisée')
        if p.get('fraicheur', 0) >= 4 and (p.get('densite', 0) >= 4 or (f.get('saisons') or {}).get('hiver', 0) >= 4): bad += err(i, 'fraicheur>=4 incompatible avec densite/hiver>=4')
        if not 3 <= len(f.get('ressemble_a') or []) <= 5: bad += err(i, 'ressemble_a 3 à 5')
        if not 8 <= len(f.get('mots_cles') or []) <= 20: bad += err(i, 'mots_cles 8 à 20')
        if len((f.get('pitch') or '').split()) > 12: bad += err(i, 'pitch > 12 mots')
        if f.get('confiance') not in (1, 2, 3): bad += err(i, 'confiance')
        t = tuple(p[a] for a in AX)
        if t in profs: bad += err(i, 'profil identique à ' + profs[t])
        profs[t] = k
print(f'{n} fiches, {bad} erreur(s)'); sys.exit(1 if bad else 0)
