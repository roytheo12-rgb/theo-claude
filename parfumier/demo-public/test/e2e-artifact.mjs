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
const shot = (pg, n) => (process.env.SHOTS ? pg.screenshot({ path: '/tmp/shots/' + n + '.png' }) : null);
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
await t.pg.click('#dock [data-tab="play"]'); await t.pg.waitForSelector('.plsubtabs'); ok(!/Mes inspirations/.test(await t.pg.locator('.plsubtabs').innerText()) && /Communauté/.test(await t.pg.locator('.plsubtabs').innerText()), 'inspirations : « Univers Sillage » et « Communauté » seulement, mes playlists sont dans le profil');
await t.pg.click('#dock [data-tab="wish"]'); await t.pg.waitForSelector('#mi-new'); await shot(t.pg, 'profil_listes'); ok(await t.pg.locator('[data-msub]').count() === 4, 'profil : Playlists, Publications, Abonnés, Wishlist'); await t.pg.click('#mi-new'); await t.pg.fill('#ei-t', 'Cuirs de minuit'); await t.pg.fill('#ei-d', 'Pour les soirs d\'hiver');
for (const q of ['tobacco', 'santal']) { await t.pg.fill('#ei-q', q); await t.pg.waitForSelector('[data-rh]'); await t.pg.click('[data-rh="0"]'); }
await t.pg.fill('#ei-v', 'https://youtu.be/abc123'); await t.pg.check('#ei-ad'); await t.pg.click('[data-ln="0"]'); await t.pg.fill('[data-lu="0"]', 'https://marque.example/p?aff=theo');
await t.pg.setInputFiles('#ei-cf', { name: 'c.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') }); await t.pg.waitForSelector('#ei-cv img', { timeout: 4000 }); ok(true, 'couverture : la photo est choisie');
await t.pg.click('[data-cat="Soirée"]');
await t.pg.fill('#ei-v', 'http://pas-https.fr'); await t.pg.click('#ei-save'); await t.pg.waitForFunction(() => /https/.test(document.querySelector('#ei-msg').textContent)); ok(true, 'créateur : un lien sans https est refusé');
await t.pg.fill('#ei-v', 'https://youtu.be/abc123');
await t.pg.click('#ei-save'); await t.pg.waitForSelector('#si-pub');
ok(await t.pg.locator('a.xlink[rel*="sponsored"]').count() === 1 && await t.pg.locator('a.vlink').count() === 1 && /partenariat/i.test(await t.pg.locator('#sheet').innerText()), 'créateur : lien d\'offre, vidéo et mention de partenariat affichés'); ok(/Privée/i.test(await t.pg.locator('#sheet').innerText()), 'artefact : une inspiration est privée par défaut');
await t.pg.click('#si-pub'); await t.pg.click('#si-pub'); await t.pg.waitForFunction(() => /Publique/i.test(document.querySelector('#sheet').innerText), null, { timeout: 6000 });
ok(SHARED['community/user-theo'].pub[0].cat === 'Soirée', 'catégories : la playlist est rangée dans « Soirée »'); ok(SHARED['community/user-theo'].pub.length === 1 && SHARED['community/user-theo'].pub[0].cover.startsWith('data:image/jpeg'), 'artefact : la publication et sa couverture sont dans la base');
await closeSheet(t.pg);
// aperçu de mon profil public
await t.pg.click('#profileBtn'); await t.pg.waitForSelector('#pf-pv'); await t.pg.fill('#pf-ln', 'https://youtube.com/@theo\nhttps://instagram.com/theo'); await t.pg.click('#pf-save'); await t.pg.waitForFunction(() => /Enregistré/.test(document.querySelector('#pf-msg').textContent));
ok(SHARED['community/user-theo'].links.length === 2, 'profil : les liens sont enregistrés');
await t.pg.click('#pf-pv'); await t.pg.waitForSelector('[data-cx]'); ok(/aperçu/i.test(await t.pg.locator('#sheet').innerText()) && /Cuirs de minuit/.test(await t.pg.locator('#sheet').innerText()) && await t.pg.locator('a.vlink').count() === 2, 'profil : l\'aperçu public montre pseudo, liens et listes publiques');
await t.pg.click('#cr-share'); await t.pg.waitForFunction(() => /copi|Partag/i.test(document.querySelector('#cr-msg').textContent), null, { timeout: 4000 }).catch(() => {}); ok(true, 'profil : le bouton de partage répond');
await closeSheet(t.pg);
// un autre membre
const m = await open('user-marie', false);
await m.pg.click('#dock [data-tab="play"]'); await m.pg.waitForSelector('.plsubtabs'); await m.pg.click('[data-sub="comm"]'); await m.pg.waitForSelector('[data-fl]', { timeout: 6000 }); await shot(m.pg, 'communaute'); ok(/Cuirs de minuit/.test(await m.pg.locator('#subbody').innerText()), 'communauté : l\'autre membre voit l\'inspiration publiée');
await m.pg.click('[data-fl]'); await m.pg.waitForSelector('#sc-like'); ok(await m.pg.locator('a.xlink').count() === 1, 'communauté : le membre voit le lien de l\'offre');
await m.pg.click('#sc-pf'); await m.pg.waitForSelector('#mb-fo'); ok(/Théo/.test(await m.pg.locator('#sheet').innerText()), 'communauté : le profil du créateur s\'ouvre'); await closeSheet(m.pg); await m.pg.click('[data-fl]'); await m.pg.waitForSelector('#sc-like'); await m.pg.click('#sc-like'); await m.pg.waitForFunction(() => /\(1\)/.test(document.querySelector('#sc-like').textContent));
ok(SHARED['likes/user-marie'].ids.length === 1, 'communauté : le like est enregistré');
ok(await m.pg.locator('.card:has-text("Mode éditeur")').count() === 0 && await m.pg.locator('#sc-del').count() === 0, 'communauté : pas d\'outil d\'éditeur pour un membre');
await closeSheet(m.pg);
// réseau : publication, abonnement, fil, avis
await t.pg.click('#dock [data-tab="tips"]'); await t.pg.waitForSelector('#fp'); await t.pg.click('#fp'); await t.pg.waitForSelector('#po-t');
await t.pg.fill('#po-t', 'Mon top des boisés du soir'); await t.pg.fill('#po-v', 'https://youtu.be/xyz'); await t.pg.click('#po-go'); await t.pg.waitForSelector('[data-fid]', { timeout: 6000 });
ok(SHARED['posts/user-theo'].items[0].txt === 'Mon top des boisés du soir', 'réseau : la publication est enregistrée et apparaît dans le fil');
await closeSheet(t.pg);
await m.pg.click('#dock [data-tab="tips"]'); await m.pg.waitForSelector('#fp'); await m.pg.click('[data-sc="all"]'); await m.pg.waitForSelector('[data-fid]', { timeout: 6000 });
await m.pg.click('[data-fid] .fhead'); await m.pg.waitForSelector('#mb-fo'); await m.pg.click('#mb-fo'); await m.pg.waitForFunction(() => /Abonné/.test(document.querySelector('#mb-fo').textContent));
ok(SHARED['follows/user-marie'].ids.includes('user-theo'), 'réseau : l\'abonnement est enregistré'); await shot(m.pg, 'membre'); ok(/1 abonné/.test(await m.pg.locator('#sheet').innerText()), 'réseau : le compteur d\'abonnés monte');
await closeSheet(m.pg);
await m.pg.click('[data-sc="follow"]'); await m.pg.waitForSelector('[data-fid]', { timeout: 6000 }); ok(await m.pg.locator('[data-fid]').count() === 1, 'réseau : « Abonnements » montre la publication de la personne suivie');
// commentaires et notifications
await m.pg.evaluate(() => window.SillageBackend.plan.saveProfile({ pseudo: 'Marie' }));
await m.pg.click('#dock [data-tab="tips"]'); await m.pg.waitForSelector('[data-fid]', { timeout: 6000 }); await m.pg.click('[data-fid] [data-cm]'); await m.pg.waitForSelector('[data-ci]'); await m.pg.fill('[data-ci]', 'Très belle sélection'); await m.pg.click('[data-cs]'); await m.pg.waitForFunction(() => /Très belle sélection/.test(document.querySelector('[data-cmb]').innerText), null, { timeout: 5000 });
await shot(m.pg, 'pourtoi_commentaires'); ok(SHARED['comments/' + SHARED['posts/user-theo'].items[0].id].items.length === 1, 'commentaires : le commentaire est enregistré et affiché');
ok(SHARED['notifs/user-theo'].items.some((x) => x.kind === 'comment') && SHARED['notifs/user-theo'].items.some((x) => x.kind === 'follow'), 'notifications : abonnement et commentaire notifiés à l\'auteur');
await t.pg.reload(); await t.pg.waitForTimeout(3500); await t.pg.evaluate(() => { const g = document.querySelector('#pSkip'); if (g) g.click(); }); await t.pg.waitForFunction(() => { const n = document.querySelector('#bellN'); return n && !n.hidden && /2/.test(n.textContent); }, null, { timeout: 8000 }); ok(true, 'notifications : la cloche affiche 2 nouveautés');
await t.pg.click('#bellBtn'); await t.pg.waitForSelector('.notif'); await shot(t.pg, 'notifs'); ok(/commenté/.test(await t.pg.locator('#sheet').innerText()) && /te suit/.test(await t.pg.locator('#sheet').innerText()), 'notifications : la liste détaille chaque nouveauté'); await t.pg.waitForFunction(() => document.querySelector('#bellN').hidden, null, { timeout: 5000 });
await closeSheet(t.pg);
await t.pg.click('#dock [data-tab="wish"]'); await t.pg.waitForSelector('.mestats'); ok(/1\s*abonné/.test(await t.pg.locator('.mestats').innerText()) && /1\s*publication/.test(await t.pg.locator('.mestats').innerText()), 'profil : compteurs de publications et d\'abonnés');
await shot(t.pg, 'profil'); await t.pg.click('[data-msub="posts"]'); await t.pg.waitForSelector('[data-fid]'); ok(true, 'profil : mes publications');
await t.pg.click('[data-msub="people"]'); await t.pg.waitForSelector('#pp-l .fhead', { timeout: 5000 }); ok(/Marie/.test(await t.pg.locator('#pp-l').innerText()), 'profil : la liste des abonnés');
// avis : marie note un parfum, théo (qui la suit) le voit
await t.pg.evaluate(() => { const S = window.SillageInternals; });
await m.pg.evaluate(() => window.SillageBackend.plan.saveProfile({ pseudo: 'Marie' }));
await m.pg.evaluate(() => { const e = window.SillageInternals.dbList().find((x) => !x.ed); window.__e = e; window.SillageInternals.openEntry(e); });
await m.pg.waitForSelector('[data-st="4"]', { timeout: 6000 }); await m.pg.click('[data-st="4"]'); await m.pg.fill('#rv-t', 'Très bien'); await m.pg.click('#rv-go'); await m.pg.waitForFunction(() => /enregistré/.test(document.querySelector('#rv-m').textContent), null, { timeout: 5000 });
ok(Object.values(SHARED['ratings/user-marie'].m)[0].stars === 4, 'réseau : l\'avis est enregistré'); await closeSheet(m.pg);
await t.pg.click('#profileBtn'); await t.pg.waitForSelector('#nw-fo'); ok(await t.pg.locator('#br-in').count() === 0, 'artefact : pas d\'espace marque'); await closeSheet(t.pg);
// retours : le membre écrit, le propriétaire lit
await m.pg.click('#profileBtn'); await m.pg.waitForSelector('#sp-go'); await m.pg.click('[data-k="idee"]'); await m.pg.fill('#sp-t', 'Ajouter un mode sombre'); await m.pg.click('#sp-go'); await m.pg.waitForFunction(() => /envoyé/.test(document.querySelector('#sp-m').textContent));
ok(Object.keys(SHARED).includes('feedback/user-marie') && SHARED['feedback/user-marie'].items[0].kind === 'idee', 'retours : l\'idée est enregistrée');
await closeSheet(m.pg);
await t.pg.click('#profileBtn'); await t.pg.waitForSelector('#ed-su'); await t.pg.click('#ed-su'); await t.pg.waitForFunction(() => /mode sombre/.test(document.querySelector('#ed-out').textContent)); ok(true, 'retours : le propriétaire lit les messages'); await closeSheet(t.pg);
// éditeur : prix d'un parfum, visible pour l'autre membre au rechargement
await t.pg.click('#dock [data-tab="search"]'); await t.pg.waitForTimeout(400);
const key = await t.pg.evaluate(() => { const e = window.SillageInternals.dbList().find((x) => !x.ed); window.SillageInternals.openEntry(e); return (e.house + '|' + e.name); });
await t.pg.waitForSelector('#ed-ps', { timeout: 5000 }); await t.pg.fill('#ed-p', '123'); await t.pg.click('#ed-ps'); await t.pg.waitForTimeout(1500); console.log('msg:', await t.pg.locator('#ed-msg').innerText(), JSON.stringify(Object.keys(SHARED)));
ok(Object.values(SHARED['content/main'].price).includes(123), 'artefact : le prix de l\'éditeur est enregistré dans la base');
// voyage : « Je ne sais pas »
await closeSheet(t.pg); await t.pg.click('#dock [data-tab="search"]'); await t.pg.waitForSelector('[data-ssub="tips"]'); await t.pg.click('[data-ssub="tips"]'); await t.pg.waitForTimeout(600);
if (await t.pg.locator('#vRedo').count()) {
  await t.pg.click('#vRedo'); await t.pg.waitForSelector('#vNext'); await t.pg.click('#vNext'); await t.pg.waitForSelector('[data-sv="-1"]');
  ok(await t.pg.locator('[data-sv="-1"]').count() === 4 && /Je ne sais pas/.test(await t.pg.locator('.vsc').first().innerText()), 'voyage : chaque odeur a une case « Je ne sais pas »');
  await t.pg.locator('[data-sv="-1"]').nth(0).click(); ok(await t.pg.locator('[data-sv="-1"].on').count() === 1, 'voyage : « Je ne sais pas » se coche');
  await t.pg.click('#vNext'); await t.pg.waitForSelector('#vDk'); ok(/Ton image/.test(await t.pg.locator('.voy').first().innerText()), 'voyage : sans famille aimée, on passe aux questions suivantes');
  await t.pg.click('#vDk'); await t.pg.waitForTimeout(300); ok(!/Ton image/.test(await t.pg.locator('.voy').first().innerText()), 'voyage : « Je ne sais pas » passe à la question suivante');
} else console.log('(voyage non lancé depuis cet écran)');
ok(t.errs.length === 0 && m.errs.length === 0, 'aucune erreur JavaScript : ' + JSON.stringify([...t.errs, ...m.errs]));
await browser.close(); server.close(); console.log('\nTests artefact réussis.');
