"""Construit index.js (grand index des parfums, sans doublons) à partir de data/raw/*.txt.
Chaque ligne brute : « Maison — Nom — Concentration ». Usage : python3 tools/build-index.py"""
import re, json, unicodedata, pathlib, subprocess, collections
root = pathlib.Path(__file__).parent.parent
def norm(s):
    s = unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

# Maisons : variantes d'écriture et sous-collections ramenées à une seule maison
HOUSE = {
 'by kilian': 'Kilian', 'kilian paris': 'Kilian', 'kilian': 'Kilian',
 'frederic malle': 'Frédéric Malle', 'roja': 'Roja Parfums', 'roja parfums': 'Roja Parfums',
 'parfums de nicolai': 'Nicolaï', 'nicolai parfumeur createur': 'Nicolaï', 'tauer perfumes': 'Andy Tauer',
 'houbigant paris': 'Houbigant', 'initio parfums prives': 'Initio',
 'maison margiela replica': 'Maison Margiela', 'dior la collection privee': 'Dior', 'chanel les exclusifs': 'Chanel',
 'guerlain l art la matiere': 'Guerlain', 'bvlgari le gemme': 'Bvlgari', 'hermes hermessence': 'Hermès',
 'ysl le vestiaire des parfums': 'Yves Saint Laurent', 'van cleef arpels collection extraordinaire': 'Van Cleef & Arpels',
 'dolce gabbana velvet collection': 'Dolce & Gabbana', 'gucci the alchemist s garden': 'Gucci', 'tom ford private blend': 'Tom Ford',
 'cartier les heures de parfum': 'Cartier', 'cartier collection': 'Cartier', 'prada olfactories': 'Prada', 'fendi private': 'Fendi',
 'givenchy la collection particuliere': 'Givenchy', 'loewe paula s ibiza': 'Loewe', 'loewe botanical rainbow': 'Loewe',
}
PREFIX = re.compile(r'^(replica|les exclusifs|le gemme|olfactories|collection extraordinaire|eau triple)\s+', re.I)
CONC = {'eau de parfum': 'EDP', 'eau de toilette': 'EDT', 'extrait': 'EXT', 'extrait de parfum': 'EXT', 'extreme': 'EXT', 'esprit de parfum': 'EXT',
        'parfum': 'PAR', 'parfum cologne': 'COL', 'eau de cologne': 'COL', 'eau de cologne forte': 'COL', 'cologne': 'COL', 'cologne intense': 'COL',
        'cologne absolue': 'COL', 'eau triple': 'COL', 'hair mist': None}
SUFFIX = re.compile(r'\s+(extrait de parfum|extrait|parfum|eau de parfum|eau de toilette)$', re.I)

raw = []
for f in sorted((root / 'data/raw').glob('*.txt')):
    raw += [l.strip() for l in f.read_text(encoding='utf-8').splitlines() if l.strip()]

# catalogue existant : pas de doublon avec lui
cat = json.loads(subprocess.check_output(['node', '-e', "const d=require('./data.js');console.log(JSON.stringify(d.CATALOG.map(c=>[c.house,c.name])))"], cwd=root))
def canon_house(h):
    return HOUSE.get(norm(h), h.strip())
existing = {(norm(canon_house(h)), norm(PREFIX.sub('', n))) for h, n in cat}

seen = {}; dup = skipped_cat = skipped_other = 0
order = []
for line in raw:
    parts = [p.strip() for p in line.split(' — ')]
    if len(parts) < 3: skipped_other += 1; continue
    house, conc_raw, name = parts[0], parts[-1], ' — '.join(parts[1:-1]).replace(' — ', ' ')
    conc = CONC.get(norm(conc_raw), 'EDP')
    if conc is None: skipped_other += 1; continue          # brumes pour cheveux : pas des parfums
    house = canon_house(house)
    name = re.sub(r'\?$', '', name).strip()
    name = PREFIX.sub('', name)
    name = SUFFIX.sub('', name).strip() or name
    if not name: skipped_other += 1; continue
    key = (norm(house), norm(name))
    if key in existing: skipped_cat += 1; continue
    if key not in seen:
        seen[key] = {'house': house, 'name': name, 'conc': []}; order.append(key)
    else:
        dup += 1
    if conc not in seen[key]['conc']: seen[key]['conc'].append(conc)

by = collections.OrderedDict()
for k in order:
    e = seen[k]; by.setdefault(e['house'], []).append([e['name'], ','.join(sorted(e['conc'], key=['EDP', 'EDT', 'EXT', 'PAR', 'COL'].index))])
idx = sorted(by.items(), key=lambda kv: norm(kv[0]))
for h, arr in idx: arr.sort(key=lambda r: norm(r[0]))
out = '// Généré par tools/build-index.py : index des parfums (maison, [[nom, concentrations]]). Les fiches (notes, famille) sont complétées à l\'ajout.\nwindow.INDEX = ' + json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + ';\n'
(root / 'index.js').write_text(out, encoding='utf-8')
total = sum(len(a) for _, a in idx)
print(f'lignes lues : {len(raw)} | parfums uniques ajoutés : {total} | maisons : {len(idx)} | doublons retirés : {dup} | déjà au catalogue : {skipped_cat} | ignorées : {skipped_other} | taille : {len(out)//1024} Ko')
