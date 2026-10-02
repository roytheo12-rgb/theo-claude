// Exporte toute la base (maison, parfum, concentrations) avec l'état de documentation, pour un agent externe (Manus).
const fs = require('fs'), path = require('path');
const { E, ctx } = require('./eval-pool.cjs');
const fame = {}; (ctx.HOUSE_FAME || []).forEach((h, i) => { fame[E.norm(h)] = i + 1; });
const have = new Set(Object.keys(ctx.PYRAMID || {})), ED = new Set(ctx.EDITIONS || []);
const rows = [['rang_maison', 'maison', 'parfum', 'concentrations', 'reedition_ou_variante', 'fiche_detaillee_existante', 'notes_existantes']];
const seen = new Set();
(ctx.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, conc]) => {
  const k = E.norm(h) + '|' + E.norm(n), f = (ctx.FACTS || {})[k];
  seen.add(k);
  rows.push([fame[E.norm(h)] || '', h, n, String(conc || '').replace(/,/g, '/'), ED.has(k) ? 1 : 0, have.has(k) ? 1 : 0, f && f.n && f.n.length >= 3 ? 1 : 0]);
}));
(ctx.CATALOG || []).forEach((c) => { const k = E.norm(c.house) + '|' + E.norm(c.name); if (seen.has(k)) return; seen.add(k); rows.push([fame[E.norm(c.house)] || '', c.house, c.name, '', 0, have.has(k) ? 1 : 0, c.notes && c.notes.length >= 3 ? 1 : 0]); });
rows.sort((a, b) => (a[0] === '' ? 1e6 : a[0]) - (b[0] === '' ? 1e6 : b[0]) || 0);
const header = rows.shift(); rows.unshift(header);
const out = path.join(__dirname, '..', 'data', 'export-base-complete.tsv');
fs.writeFileSync(out, rows.map((r) => r.map((x) => String(x).replace(/[\t\n]/g, ' ')).join('\t')).join('\n') + '\n');
console.log(rows.length - 1, 'parfums,', new Set(rows.slice(1).map((r) => r[1])).size, 'maisons ->', out);
