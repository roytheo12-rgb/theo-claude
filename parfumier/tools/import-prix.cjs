// Lit un CSV de résultats (colonnes maison, parfum, prix_a_remplir_eur, et si présentes volume_ml_verifie, statut_recherche, url_officielle)
// et écrit les prix vérifiés dans data/prix-connus.txt (ils priment sur toute estimation). Un prix déjà présent est remplacé.
// Usage : node tools/import-prix.cjs fichier.csv
const fs = require('fs'), path = require('path');
const f = process.argv[2]; if (!f) { console.error('usage : node tools/import-prix.cjs fichier.csv'); process.exit(1); }
const lines = fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
const split = (l) => { const o = []; let c = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { c += '"'; i++; } else q = !q; } else if (ch === ';' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; };
const head = split(lines[0]), col = (n) => head.indexOf(n);
const ip = col('prix_a_remplir_eur'), ih = col('maison'), inn = col('parfum'), iv = col('volume_ml_verifie'), is = col('statut_recherche'), iu = col('url_officielle');
if (ip < 0 || ih < 0 || inn < 0) { console.error('colonnes maison, parfum et prix_a_remplir_eur requises'); process.exit(1); }
const dest = path.join(__dirname, '..', 'data', 'prix-connus.txt');
const cur = fs.readFileSync(dest, 'utf8').split('\n'), keep = [], have = new Map();
cur.forEach((l) => { if (l.includes('|') && !l.startsWith('#')) { const t = l.split('|').map((x) => x.trim()); have.set((t[0] + '|' + t[1]).toLowerCase(), l); } else keep.push(l); });
let n = 0, skipped = [];
lines.slice(1).forEach((l) => {
  const t = split(l), p = parseInt(String(t[ip] || '').replace(/[^0-9]/g, ''), 10), st = (is >= 0 ? t[is] || '' : 'trouvé').toLowerCase();
  if (!p || p < 5 || p > 20000 || /non (trouv|v[ée]rifi)/.test(st) || /introuvable/.test(st)) { skipped.push(t[ih] + ' ' + t[inn] + ' (' + (t[is] || 'sans prix') + ')'); return; }
  have.set((t[ih].trim() + '|' + t[inn].trim()).toLowerCase(), `${t[ih].trim()} | ${t[inn].trim()} | ${p}${iv >= 0 && t[iv] ? ' | ' + t[iv].trim() + ' ml' : ''}${iu >= 0 && t[iu] ? ' | ' + t[iu].trim() : ''}`); n++;
});
fs.writeFileSync(dest, keep.join('\n').replace(/\n*$/, '\n') + [...have.values()].join('\n') + '\n');
console.log(n + ' prix importés dans data/prix-connus.txt');
if (skipped.length) console.log('Non importés (prix à refaire) :\n - ' + skipped.join('\n - '));
console.log('Ensuite : node tools/build-enrich.js puis python3 v2/build.py');
