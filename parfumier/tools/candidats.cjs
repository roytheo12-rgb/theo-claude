// Usage : node tools/candidats.cjs <rangMin> <rangMax>  -> parfums « de base » (1 par famille, hors rééditions) des maisons de ce rang
const { E, ctx } = require('./eval-pool.cjs');
const [a, b] = [+process.argv[2], +process.argv[3]];
const ED = new Set(ctx.EDITIONS || []), idx = Object.fromEntries(ctx.INDEX);
const done = new Set(require('fs').existsSync(__dirname + '/../data/fiches-ia/done.txt') ? require('fs').readFileSync(__dirname + '/../data/fiches-ia/done.txt', 'utf8').split('\n') : []);
(ctx.HOUSE_FAME || []).forEach((h, i) => {
  const r = i + 1; if (r < a || r > b) return;
  const seen = new Set(), out = [];
  (idx[h] || []).forEach(([n, c]) => { const k = E.norm(h) + '|' + E.norm(n); if (ED.has(k) || done.has(k)) return; const w = E.norm(n).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x))[0] || E.norm(n); if (seen.has(w)) return; seen.add(w); out.push(n + (c ? ' [' + c.replace(/,/g, '/') + ']' : '')); });
  console.log(`## ${r} ${h} (${out.length})\n` + out.join(' ; '));
});
