// Liste des parfums à faire documenter en priorité (sans fiche détaillée), triés par notoriété de la maison, par lots de 1000.
const fs = require('fs'), path = require('path');
const { E, ctx } = require('./eval-pool.cjs');
const CL = { EDT: 'Eau de toilette', EDP: 'Eau de parfum', EXT: 'Extrait de parfum', PAR: 'Parfum', COL: 'Cologne' };
const have = new Set(Object.keys(ctx.PYRAMID || {})), ED = new Set(ctx.EDITIONS || []);
const fame = {}; (ctx.HOUSE_FAME || []).forEach((h, i) => { fame[E.norm(h)] = i; });
const famKey = (h, n) => { const w = E.norm(n).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return E.norm(h) + '|' + (w[0] || E.norm(n)); };
const rows = [];
(ctx.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, conc]) => {
  const k = E.norm(h) + '|' + E.norm(n);
  if (have.has(k) || ED.has(k)) return;
  const f = (ctx.FACTS || {})[k], hasNotes = !!(f && f.n && f.n.length >= 3);
  const r = fame[E.norm(h)]; rows.push({ h, n, conc, hasNotes, rank: r == null ? 9999 : r, fk: famKey(h, n) });
}));
// Une fiche par famille de parfum d'abord (le parfum « de base »), les déclinaisons ensuite.
const seen = new Set(); rows.forEach((x) => { x.first = !seen.has(x.fk); seen.add(x.fk); });
rows.sort((a, b) => (b.first - a.first) || (a.rank - b.rank) || ((a.hasNotes ? 1 : 0) - (b.hasNotes ? 1 : 0)) || a.h.localeCompare(b.h) || a.n.localeCompare(b.n));
const outDir = path.join(__dirname, '..', 'data', 'a-documenter'); fs.mkdirSync(outDir, { recursive: true });
const concLabel = (c) => { const l = String(c || '').split(',').filter(Boolean).map((x) => CL[x] || x); return l.length ? l.join(' / ') : 'version courante'; };
let n = 0;
for (let i = 0; i < rows.length; i += 1000) {
  const part = rows.slice(i, i + 1000), name = `lot-${String(++n).padStart(2, '0')}.txt`;
  fs.writeFileSync(path.join(outDir, name), part.map((x) => `${x.h} | ${x.n} | ${concLabel(x.conc)}`).join('\n') + '\n');
  console.log(name, part.length, 'lignes ; maisons du', part[0].h, 'au', part[part.length - 1].h, '; sans aucune note :', part.filter((x) => !x.hasNotes).length);
}
console.log('total', rows.length);
