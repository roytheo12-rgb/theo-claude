"""data/fiches-*.txt -> fiches.js : fiches détaillées (pyramide tête / cœur / fond, famille, genre, projection, tenue, prix indicatif).
Ligne : Maison|Parfum|famille|genre m/f/u|tête;..|cœur;..|fond;..|projection|tenue|poids|prix €
Les parfums déjà au catalogue gardent leur fiche et reçoivent la pyramide ; les autres sont ajoutés au catalogue (donc recommandables).
Usage : python3 tools/build-fiches.py"""
import json, re, glob, pathlib, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
FAM = set(re.findall(r"^\s{4}([a-zéèêû]+): \{ label", (root / 'engine.js').read_text(encoding='utf-8'), flags=re.M))
rows, bad = [], []
for f in sorted(glob.glob(str(root / 'data/fiches-*.txt'))):
    for ln, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.strip()
        if not line or line.startswith('#'): continue
        p = [x.strip() for x in line.split('|')]
        if len(p) != 11: bad.append((f, ln, 'colonnes', len(p))); continue
        h, n, fam, g, t, c, b, pr, lo, w, px = p
        if fam not in FAM: bad.append((f, ln, 'famille', fam)); continue
        if g not in 'mfu' or len(g) != 1: bad.append((f, ln, 'genre', g)); continue
        T, C, B = ([x.strip() for x in s.split(';') if x.strip()] for s in (t, c, b))
        if not (T or C or B): bad.append((f, ln, 'notes vides', n)); continue
        try: pr, lo, w, px = int(pr), int(lo), int(w), int(px)
        except ValueError: bad.append((f, ln, 'nombres', line[-20:])); continue
        rows.append({'house': h, 'name': n, 'family': fam, 'g': g, 't': T, 'h': C, 'b': B, 'proj': pr, 'long': lo, 'w': w, 'price': px})
for b in bad: print('ERREUR', b)
js = '''// Généré par tools/build-fiches.py : fiches détaillées (pyramide olfactive, famille, genre) pour les parfums les plus connus.
(function (root) {
  const F = %s;
  const nz = (s) => String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const HA = root.HOUSE_ALIAS || {}, canon = (h) => HA[nz(h)] || h;
  root.PYRAMID = root.PYRAMID || {}; root.FACTS = root.FACTS || {};
  const cat = root.CATALOG || [], by = new Map(cat.map((c) => [nz(canon(c.house)) + '|' + nz(c.name), c]));
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  F.forEach((f) => {
    const h = canon(f.house), k = nz(h) + '|' + nz(f.name);
    root.PYRAMID[k] = { t: f.t, h: f.h, b: f.b };
    root.FACTS[k] = Object.assign(root.FACTS[k] || {}, { g: f.g });
    if (!by.has(k)) { const c = { name: f.name, house: h, family: f.family, notes: uniq(f.t.concat(f.h, f.b)), projection: f.proj, longevity: f.long, weight: f.w, price: f.price }; cat.push(c); by.set(k, c); }
  });
})(typeof window !== 'undefined' ? window : globalThis);
''' % json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
(root / 'fiches.js').write_text(js, encoding='utf-8')
print(len(rows), 'fiches')
