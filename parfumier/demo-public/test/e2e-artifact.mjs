// Version claude.ai : profil, communauté, inspirations privées, éditeur et sous-pages de notes, avec une base d'artefact simulée.
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');
const html = fs.readFileSync(path.join(here, '../../v2/sillage.html'), 'utf8');
const server = http.createServer((rq, rs) => { rs.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); rs.end(html); });
let PORT; await new Promise((r) => server.listen(0, () => { PORT = server.address().port; r(); }));
const ok = (c, m) => { if (!c) throw new Error('ÉCHEC : ' + m); console.log('ok', m); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const SHARED = {};   // la base de l'artefact, partagée entre les « personnes » du test
const dbop = (op, p, d) => {
  const sn = (k) => ({ id: k.split('/').pop(), exists: k in SHARED, data: k in SHARED ? JSON.parse(JSON.stringify(SHARED[k])) : null });
  if (op === 'get') return sn(p); if (op === 'set') { SHARED[p] = JSON.parse(JSON.stringify(d)); return null; } if (op === 'delete') { delete SHARED[p]; return null; }
  if (op === 'list') return Object.keys(SHARED).filter((k) => k.startsWith(p + '/') && k.split('/').length === 2).map(sn);
};
const mock = ([id, owner]) => {
  const wrap = (r) => ({ id: r.id, exists: r.exists, data: () => (r.data ? JSON.parse(JSON.stringify(r.data)) : undefined) });
  const db = { doc: (p) => ({ get: async () => wrap(await window.dbop('get', p)), set: async (d) => { await window.dbop('set', p, d); }, delete: async () => { await window.dbop('delete', p); } }), collection: (c) => ({ get: async () => ({ docs: (await window.dbop('list', c)).map(wrap) }) }) };
  window.claude = { use: async (n) => (n === 'db' ? db : n === 'user' ? { id: async () => id, isOwner: async () => owner, me: async () => ({ id }) } : null) };
};
const open = async (id, owner) => {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 860 } }); await ctx.exposeFunction('dbop', dbop); await ctx.addInitScript(mock, [id, owner]);
  await ctx.addInitScript(() => { try { localStorage.setItem('sillage.onb', '1'); } catch (e) { /* ok */ } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(x.message));
  await pg.goto('http://localhost:' + PORT + '/?seed=demo'); await pg.waitForTimeout(3500); await pg.evaluate(() => { const g = document.querySelector('#pSkip'); if (g) g.click(); }); await pg.waitForTimeout(500);
  return { pg, errs };
};
const closeSheet = (pg) => pg.evaluate(() => { const s = document.getElementById('sheet'); s.hidden = true; s.innerHTML = ''; document.body.style.overflow = ''; });
const t = await open('user-theo', true);
// profil
await t.pg.click('#profileBtn'); await t.pg.waitForSelector('#pf-save', { timeout: 6000 }); ok(await t.pg.locator('#pf-plans').count() === 0, 'artefact : pas d\'offre ni de Whop dans le profil');
ok(await t.pg.locator('#pnotes').count() === 1 && await t.pg.locator('#tedit [data-nt]').count() === 0, 'profil : les notes ne sont plus sur la page, un bouton ouvre « Mes notes »');
await t.pg.fill('#pf-ps', 'Théo'); await t.pg.fill('#pf-bio', 'Boisés et cuirs'); await t.pg.click('#pf-save'); await t.pg.waitForFunction(() => /Enregistré/.test(document.querySelector('#pf-msg').textContent));
ok(SHARED['community/user-theo'] && SHARED['community/user-theo'].pseudo === 'Théo', 'artefact : le pseudo est enregistré dans la base');
await t.pg.setInputFiles('#pf-file', { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
await t.pg.waitForSelector('#pf-av img', { timeout: 5000 }); ok(SHARED['community/user-theo'].avatar.startsWith('data:image/jpeg'), 'artefact : la photo est enregistrée');
ok(await t.pg.locator('.card:has-text("Mode éditeur")').count() === 1, 'artefact : mode éditeur pour le propriétaire');
// sous-pages de notes
await t.pg.click('#pnotes'); await t.pg.waitForSelector('[data-ng]'); ok(await t.pg.locator('[data-ng]').count() === 8, 'notes : 7 familles et « une autre note »');
await t.pg.click('[data-ng="2"]'); await t.pg.waitForSelector('#ntp [data-nt]'); const first = t.pg.locator('#ntp [data-nt]').first(); const nm = await first.getAttribute('data-nt'); await first.click();
ok(await t.pg.evaluate((n) => (window.SillageInternals.S().settings.liked || []).some((x) => x.toLowerCase() === n.toLowerCase()), nm), 'notes : toucher une note l\'ajoute aux notes aimées');
ok(!/Fleurs|Frais et agrumes/.test(await t.pg.locator('#ntp').innerText()), 'notes : la page ne montre que sa famille');
await t.pg.click('#nback'); await t.pg.waitForSelector('[data-ng]'); ok(/1 aimée/.test(await t.pg.locator('[data-ng="2"]').innerText()), 'notes : la liste compte la note choisie');
await closeSheet(t.pg);
// inspirations
await t.pg.click('#dock [data-tab="play"]'); await t.pg.waitForSelector('.plsubtabs'); ok(/Mes inspirations/.test(await t.pg.locator('.plsubtabs').innerText()) && /Communauté/.test(await t.pg.locator('.plsubtabs').innerText()), 'artefact : « Mes inspirations » et « Communauté » sont visibles');
await t.pg.click('[data-sub="mine"]'); await t.pg.click('#mi-new'); await t.pg.fill('#ei-t', 'Cuirs de minuit'); await t.pg.fill('#ei-d', 'Pour les soirs d\'hiver');
for (const q of ['tobacco', 'santal']) { await t.pg.fill('#ei-q', q); await t.pg.waitForSelector('[data-rh]'); await t.pg.click('[data-rh="0"]'); }
await t.pg.click('#ei-save'); await t.pg.waitForSelector('#si-pub'); ok(/Privée/i.test(await t.pg.locator('#sheet').innerText()), 'artefact : une inspiration est privée par défaut');
await t.pg.click('#si-pub'); await t.pg.click('#si-pub'); await t.pg.waitForFunction(() => /Publique/i.test(document.querySelector('#sheet').innerText), null, { timeout: 6000 });
ok(SHARED['community/user-theo'].pub.length === 1, 'artefact : la publication est dans la base');
await closeSheet(t.pg);
// un autre membre
const m = await open('user-marie', false);
await m.pg.click('#dock [data-tab="play"]'); await m.pg.waitForSelector('.plsubtabs'); await m.pg.click('[data-sub="comm"]'); await m.pg.waitForSelector('[data-ci]', { timeout: 6000 }); ok(/Cuirs de minuit/.test(await m.pg.locator('#subbody').innerText()), 'communauté : l\'autre membre voit l\'inspiration publiée');
await m.pg.click('[data-ci]'); await m.pg.waitForSelector('#sc-like'); await m.pg.click('#sc-like'); await m.pg.waitForFunction(() => /\(1\)/.test(document.querySelector('#sc-like').textContent));
ok(SHARED['likes/user-marie'].ids.length === 1, 'communauté : le like est enregistré');
ok(await m.pg.locator('.card:has-text("Mode éditeur")').count() === 0 && await m.pg.locator('#sc-del').count() === 0, 'communauté : pas d\'outil d\'éditeur pour un membre');
await closeSheet(m.pg);
// éditeur : prix d'un parfum, visible pour l'autre membre au rechargement
await t.pg.click('#dock [data-tab="search"]'); await t.pg.waitForTimeout(400);
const key = await t.pg.evaluate(() => { const e = window.SillageInternals.dbList().find((x) => !x.ed); window.SillageInternals.openEntry(e); return (e.house + '|' + e.name); });
await t.pg.waitForSelector('#ed-ps', { timeout: 5000 }); await t.pg.fill('#ed-p', '123'); await t.pg.click('#ed-ps'); await t.pg.waitForTimeout(1500); console.log('msg:', await t.pg.locator('#ed-msg').innerText(), JSON.stringify(Object.keys(SHARED)));
ok(Object.values(SHARED['content/main'].price).includes(123), 'artefact : le prix de l\'éditeur est enregistré dans la base');
ok(t.errs.length === 0 && m.errs.length === 0, 'aucune erreur JavaScript : ' + JSON.stringify([...t.errs, ...m.errs]));
await browser.close(); server.close(); console.log('\nTests artefact réussis.');
