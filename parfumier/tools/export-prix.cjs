// Export CSV de tous les parfums de la base (ceux qu'on recommande d'abord) avec leur prix actuel, pour compléter les prix à la main ou par un agent.
// Retour : node tools/import-prix.cjs fichier-rempli.csv  -> ajoute les lignes dans data/prix-connus.txt
const fs = require('fs'), path = require('path'), vm = require('vm');
const { E, ctx, pool } = require('./eval-pool.cjs');
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'enrich.js'), 'utf8'), ctx);
const EN = ctx.ENRICH || {}, HA = ctx.HOUSE_ALIAS || {}, norm = E.norm;
const key = (h, n) => norm(HA[norm(h)] || h) + '|' + norm(n);
const rec = new Set(pool().map((c) => key(c.house, c.name)));
const nPl = {}; (ctx.PLAYLISTS || []).forEach((p) => p.ps.forEach((x) => { if (x.h) { const k = key(x.h, x.n); nPl[k] = (nPl[k] || 0) + 1; rec.add(k); } }));
const rows = [], seen = new Set();
const add = (h, n, conc) => { const k = key(h, n); if (seen.has(k)) return; seen.add(k); const x = EN[k] || {}; rows.push({ h: HA[norm(h)] || h, n, conc: conc || '', p: x.p || '', est: x.p ? (x.pe ? 'estimé' : 'relevé') : '', pl: nPl[k] || 0, rec: rec.has(k) ? 1 : 0 }); };
(ctx.CATALOG || []).forEach((c) => c.name && c.house && add(c.house, c.name, ''));
(ctx.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, conc]) => add(h, n, conc)));
// playlists : les parfums cités mais absents de l'index
(ctx.PLAYLISTS || []).forEach((p) => p.ps.forEach((x) => { if (x.h) add(x.h, x.n, ''); }));
rows.sort((a, b) => b.rec - a.rec || b.pl - a.pl || a.h.localeCompare(b.h, 'fr') || a.n.localeCompare(b.n, 'fr'));
const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
const out = ['maison;parfum;concentrations;prix_actuel_eur;nature_du_prix;nb_playlists;recommande;prix_a_remplir_eur;source_du_prix'].concat(rows.map((r) => [q(r.h), q(r.n), q(r.conc), r.p, r.est, r.pl, r.rec, '', ''].join(';')));
const dest = process.argv[2] || path.join(__dirname, '..', 'data', 'export-prix-base-complete.csv');
fs.writeFileSync(dest, '﻿' + out.join('\n') + '\n');
console.log(rows.length + ' parfums, dont ' + rows.filter((r) => r.rec).length + ' recommandés, écrits dans ' + dest);
