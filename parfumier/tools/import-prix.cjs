// Lit un CSV rempli (colonne prix_a_remplir_eur) et ajoute les prix dans data/prix-connus.txt, qui priment sur toute estimation.
const fs = require('fs'), path = require('path');
const f = process.argv[2]; if (!f) { console.error('usage : node tools/import-prix.cjs fichier.csv'); process.exit(1); }
const lines = fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
const split = (l) => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ';' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; };
const head = split(lines[0]), ip = head.indexOf('prix_a_remplir_eur'), ih = head.indexOf('maison'), inn = head.indexOf('parfum');
if (ip < 0) { console.error('colonne prix_a_remplir_eur introuvable'); process.exit(1); }
const dest = path.join(__dirname, '..', 'data', 'prix-connus.txt'), cur = fs.readFileSync(dest, 'utf8'), have = new Set(cur.split('\n').filter((l) => l.includes('|') && !l.startsWith('#')).map((l) => l.split('|').slice(0, 2).map((x) => x.trim().toLowerCase()).join('|')));
let n = 0, add = '';
lines.slice(1).forEach((l) => { const t = split(l), p = parseInt(String(t[ip] || '').replace(/[^0-9]/g, ''), 10); if (!p || p < 5 || p > 20000) return; const k = [t[ih], t[inn]].map((x) => x.trim().toLowerCase()).join('|'); if (have.has(k)) return; have.add(k); add += `${t[ih].trim()} | ${t[inn].trim()} | ${p}\n`; n++; });
fs.writeFileSync(dest, cur.replace(/\n*$/, '\n') + add);
console.log(n + ' prix ajoutés à data/prix-connus.txt. Lance ensuite : node tools/build-enrich.js puis python3 v2/build.py');
