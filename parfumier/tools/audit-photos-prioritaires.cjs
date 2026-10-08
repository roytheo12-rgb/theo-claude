// Photos manquantes parmi les parfums importants : incontournables, premiers de chaque maison (data/house-order.txt), membres des playlists.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { E, ctx } = require('./eval-pool.cjs');
for (const f of ['imgnew.js', 'imgdb.js', 'imgweb.js', 'houseorder.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
const HA = ctx.HOUSE_ALIAS || {}, N = (s) => E.norm(s);
const maps = [ctx.IMGNEW || {}, ctx.IMGDB || {}, ctx.IMGWEB || {}];
const has = (h, n) => { const ks = [N(h) + '|' + N(n), N(HA[N(h)] || h) + '|' + N(n)]; return maps.some((m) => ks.some((k) => m[k])); };
const rows = new Map(); const add = (h, n, why, w) => { const k = N(HA[N(h)] || h) + '|' + N(n); const r = rows.get(k) || { h, n, why: [], w: 0 }; r.why.push(why); r.w += w; rows.set(k, r); };
(ctx.INC_TOP || []).forEach(([h, n], i) => add(h, n, 'incontournable n°' + (i + 1), 100 - i));
Object.entries(ctx.HOUSE_ORDER || {}).forEach(([hk, L]) => L.slice(0, 10).forEach((n, i) => { const h = (ctx.INDEX.find(([x]) => N(x) === hk) || [hk])[0]; add(h, n, 'n°' + (i + 1) + ' chez ' + h, 60 - 4 * i); }));
(ctx.PLAYLISTS || []).forEach((p) => p.ps.forEach((x, i) => { if (x.h) add(x.h, x.n, 'playlist « ' + p.t + ' »', 3); }));
let MISSING = null;   // liste fournie par l'application elle-même (python3 tools/audit-photos-app.mjs), plus fiable que les seules cartes d'images
try { MISSING = new Set(JSON.parse(fs.readFileSync('/tmp/missing_keys.json', 'utf8'))); } catch (e) { /* repli sur les cartes */ }
const miss = [...rows.entries()].filter(([k, r]) => (MISSING ? MISSING.has(k) : !has(r.h, r.n))).map(([, r]) => r).sort((a, b) => b.w - a.w);
if (process.argv[2] === 'keys') { fs.writeFileSync('/tmp/priority_keys.json', JSON.stringify([...rows.entries()].map(([k, r]) => [k, r.h, r.n]))); console.log(rows.size + ' clés écrites'); process.exit(0); }
const tot = rows.size, pr = miss.filter((r) => r.w >= 40);
const md = ['# Photos manquantes importantes', '', `${miss.length} parfums sans photo sur ${tot} parfums importants (incontournables, dix premiers de chaque maison, membres des playlists).`, `Dont ${pr.length} prioritaires (incontournables ou dans les dix premiers de leur maison).`, '', '## Prioritaires', '', ...pr.map((r) => `- ${r.h} — ${r.n} (${[...new Set(r.why)].filter((x) => !/^playlist/.test(x)).join(', ')})`), '', '## Les autres, les plus présents dans les playlists', '', ...miss.filter((r) => r.w < 40).slice(0, 120).map((r) => `- ${r.h} — ${r.n} (${r.why.filter((x) => /^playlist/.test(x)).length} playlist${r.why.filter((x) => /^playlist/.test(x)).length > 1 ? 's' : ''})`)].join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'photos-manquantes-prioritaires.md'), md + '\n');
console.log(miss.length + ' / ' + tot + ' ; prioritaires ' + pr.length);
