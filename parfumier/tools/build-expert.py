"""Sélection d'experts (data/expert-picks.txt) -> expert.js (window.EXPERT) : tags de besoin par parfum, lus par engine.js pour le classement.
Format des picks : thème|Maison|Parfum. Usage : python3 tools/build-expert.py"""
import json, re, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
# saisons : [printemps, été, automne, hiver] (0-5) ; usages : bureau, quotidien, rdv, cadeau, ceremonie, soiree, detente, sport
THEMES = {
  'chaleur': {'lab': 'une grosse chaleur', 's': [2, 5, 0, 0], 'u': ['quotidien', 'detente'], 'kw': ['supporte la chaleur', 'parfum de canicule', 'frais et tenace']},
  'date': {'lab': 'un rendez-vous', 's': None, 'u': ['rdv', 'soiree'], 'kw': ['parfum de rendez-vous', 'séduisant', 'date']},
  'clean': {'lab': 'sentir propre', 's': None, 'u': ['quotidien', 'bureau'], 'kw': ['sent propre', 'linge propre', 'peau propre', 'clean']},
  'niche-petit-prix': {'lab': 'de la niche à petit prix', 's': None, 'u': [], 'kw': ['niche petit prix', 'bon rapport qualité prix', 'abordable']},
  'printemps': {'lab': 'le printemps', 's': [5, 3, 1, 0], 'u': [], 'kw': ['parfum de printemps', 'frais et floral', 'léger']},
  'compliments': {'lab': 'des compliments dans la rue', 's': None, 'u': ['soiree', 'rdv'], 'kw': ['parfum à compliments', 'se faire remarquer', 'sillage qui fait se retourner']},
  'automne-hiver': {'lab': "l'automne-hiver", 's': [1, 0, 5, 5], 'u': [], 'kw': ['automne hiver', 'chaud et enveloppant', 'cosy']},
  'opulent': {'lab': 'un parfum opulent', 's': None, 'u': ['soiree', 'ceremonie'], 'kw': ['opulent', 'luxueux', 'riche']},
  'occasion': {'lab': 'une grande occasion', 's': None, 'u': ['ceremonie', 'soiree'], 'kw': ["parfum d'occasion", 'grande occasion']},
  'daily': {'lab': 'tous les jours', 's': None, 'u': ['quotidien', 'bureau'], 'kw': ['parfum du quotidien', 'daily', 'facile à porter']},
  'signature': {'lab': 'un parfum signature', 's': None, 'u': [], 'kw': ['parfum signature', 'it boy', 'se faire remarquer']},
  'bateman': {'lab': 'le costume bien coupé', 's': None, 'u': ['bureau'], 'kw': ['costume', 'patrick bateman', 'classique']},
}
out = {}
for l in (root / 'data/expert-picks.txt').read_text(encoding='utf-8').splitlines():
    l = l.strip()
    if not l or l.startswith('#'): continue
    t, h, n = l.split('|'); th = THEMES[t]; k = norm(h) + '|' + norm(n)
    e = out.setdefault(k, {'t': [], 'u': [], 's': None, 'kw': []})
    if t not in e['t']: e['t'].append(t)
    for u in th['u']:
        if u not in e['u']: e['u'].append(u)
    for w in th['kw']:
        if w not in e['kw']: e['kw'].append(w)
    if th['s']: e['s'] = [max(a, b) for a, b in zip(e['s'] or [0, 0, 0, 0], th['s'])]
(root / 'expert.js').write_text('// Généré par tools/build-expert.py depuis data/expert-picks.txt : sélection d\'experts (elle prime sur les sélections faites par IA).\nwindow.EXPERT_THEMES = ' + json.dumps({k: v['lab'] for k, v in THEMES.items()}, ensure_ascii=False, separators=(',', ':')) + ';\nwindow.EXPERT = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(len(out), 'parfums, expert.js')
