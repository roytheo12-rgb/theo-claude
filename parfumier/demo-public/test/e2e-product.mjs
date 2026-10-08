// Test de bout en bout : vrai navigateur + vrai code du Worker + IA simulée. Lance : node test/e2e.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
import { makeWorker } from '../src/index.js';
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.join(here, '../public');
const npmRoot = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(npmRoot + '/')('playwright');
const OUT = process.env.OUT || '/tmp';
const types = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const store = new Map();
const kv = { async get(k) { return store.has(k) ? store.get(k) : null; }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; } };
let aiCalls = 0, lastPrompt = '', identCalls = [];
const idOf = (p, n) => (p.match(new RegExp('^(\\S+) \\| ' + n.replace(/[()]/g, '\\$&') + ' \\|', 'm')) || [])[1];
const client = { messages: { async create(req) {
  if (req.model.includes('haiku')) { identCalls.push(req); const hz = /Moonlight in Heaven/.test(req.messages[0].content.at(-1).text); return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ items: [hz ? { name: 'Moonlight in Heaven', house: 'Kilian', family: 'floral', notes: ['jasmin', 'santal'], projection: 3, longevity: 3, weight: 3, price: 290, confidence: 0.8 } : { name: 'Santal 33', house: 'Le Labo', family: 'boisé', notes: ['cardamome', 'iris', 'santal', 'cuir'], projection: 4, longevity: 4, weight: 3, price: 220, confidence: 0.9 }] }) }] }; }
  if (/CANDIDATS vérifiés/.test(req.messages[0].content.at(-1).text)) return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ compris: 'Tu veux de la vanille sans patchouli.', picks: [{ role: 'choix', name: 'Un Bois Vanille', house: 'Serge Lutens', pct: 84, pourquoi: 'Vanille boisée sans patchouli.', tete: 'coco', peau: 'vanille boisée' }], eviter: { name: 'Black Opium', house: 'Yves Saint Laurent', raison: 'trop sucré' }, test: 'Teste sur la peau.' }) }] };
  aiCalls++; const p = req.messages[0].content.at(-1).text; lastPrompt = p; await new Promise((r) => setTimeout(r, 500));
  const j = { cond: { temp: 3, ctx: 'date', with: 'partenaire', moment: 'soir', mood: 'romantique', style: 'soiree', color: 'sombre', fabric: 'cuir', place: '', dur: '' }, read: 'Dîner à deux ce soir, perfecto noir, il fait froid', pick: idOf(p, 'Tobacco Vanille'), vibe: ['enveloppant', 'fumé', 'magnétique'], story: 'Il fait 3° et ton perfecto sent déjà la nuit : Tobacco Vanille s’y accroche comme une écharpe de fumée douce.', alts: [{ id: idOf(p, 'Baccarat Rouge 540'), line: 'Plus lumineux, très sillage' }], layers: [{ id: idOf(p, 'Thé Noir 29'), effect: 'Le thé noir assèche la douceur et allonge la tenue.', how: '2 sprays de Tobacco Vanille sur la nuque, puis 1 spray de Thé Noir 29 sur les poignets. Évite le cuir du perfecto.', score: 5 }], avoid: '' };
  return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(j) }] };
} } };
const whopFetch = async (u) => { const k = decodeURIComponent(String(u).split('/memberships/')[1]); return k === 'LIC_E2E_OK' ? new Response(JSON.stringify({ id: 'mem_e2e', status: 'active', product_id: 'prod_PREMIUM' }), { status: 200 }) : new Response('{}', { status: 404 }); };
const worker = makeWorker({ client, fetch: whopFetch });
const env = { WHOP_API_KEY: 'k', WHOP_PRODUCTS: JSON.stringify({ prod_PREMIUM: 'premium' }), ADMIN_EMAILS: 'admin@e2e.test', SILLAGE: kv, ADMIN_KEY: 'k', MAX_TRIES: '2', IP_MAX_PER_DAY: '6', DAILY_CAP: '50', ASSETS: { fetch: async (req) => { const u = new URL(req.url); let f = path.join(pub, u.pathname === '/' ? 'index.html' : u.pathname); if (!f.startsWith(pub) || !fs.existsSync(f)) return new Response('nf', { status: 404 }); return new Response(fs.readFileSync(f), { headers: { 'content-type': types[path.extname(f)] || 'application/octet-stream' } }); } } };
const server = http.createServer(async (rq, rs) => {
  const chunks = []; for await (const c of rq) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request('http://localhost:' + PORT + rq.url, { method: rq.method, headers: { ...rq.headers, 'cf-connecting-ip': '2.2.2.2' }, body: ['GET', 'HEAD'].includes(rq.method) ? undefined : body }), env);
  rs.writeHead(r.status, Object.fromEntries(r.headers)); rs.end(Buffer.from(await r.arrayBuffer()));
});
let PORT; await new Promise((res) => server.listen(0, () => { PORT = server.address().port; res(); }));

const ok = (c, m) => { if (!c) throw new Error('ÉCHEC : ' + m); console.log('ok', m); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const base = 'http://localhost:' + PORT;
const mkAccount = async (email) => { const r = await fetch(base + '/api/account/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'motdepasse1' }) }); return (await r.json()).token; };
const open = async (email, { install = true, plain = null } = {}) => {
  const tok = await mkAccount(email), ctx = await browser.newContext({ viewport: { width: 400, height: 860 } });
  await ctx.addInitScript(([t, e, inst, st]) => { try { if (st) localStorage.setItem('sillage.v3', st); localStorage.setItem('sillage.tok', t); localStorage.setItem('sillage.email', e); localStorage.setItem('sillage.acct', 'done'); localStorage.setItem('sillage.onb', '1'); if (inst) localStorage.setItem('sillage.install', '1'); } catch (x) { /* ok */ } }, [tok, email, install, plain ? JSON.stringify(plain) : '']);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(x.message));
  await pg.goto(base + (plain ? '/' : '/?seed=demo')); await pg.waitForTimeout(3500); await pg.evaluate(() => { const g = document.querySelector('#pSkip'); if (g) g.click(); }); await pg.waitForTimeout(400);
  return { pg, ctx, errs, tok };
};
// 1. profil et offre
const u = await open('lea@e2e.test');
await u.pg.click('#profileBtn'); await u.pg.waitForSelector('#pf-save'); await u.pg.screenshot({ path: OUT + '/p1_profile.png' });
ok(/Mon profil Sillage/.test(await u.pg.locator('.pcard2').innerText()) && /Gratuit/.test(await u.pg.locator('#pf-plans').locator('xpath=ancestor::div[contains(@class,"card")]').innerText()), 'profil : carte « Mon profil » et offre Gratuit affichées');
ok(/0 \/ 3/.test(await u.pg.locator('.use').first().innerText()), 'profil : 3 conseils IA par mois en gratuit');
await u.pg.fill('#pf-ps', 'Léa du 37'); await u.pg.fill('#pf-bio', 'Boisés et cuirs'); await u.pg.click('#pf-save'); await u.pg.waitForFunction(() => /Enregistré/.test(document.querySelector('#pf-msg').textContent));
ok((await (await fetch(base + '/api/account/me', { headers: { authorization: 'Bearer ' + u.tok } })).json()).profile.pseudo === 'Léa du 37', 'profil : le pseudo est enregistré côté serveur');
await u.pg.setInputFiles('#pf-file', { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
await u.pg.waitForSelector('#pf-av img', { timeout: 5000 }); ok((await (await fetch(base + '/api/account/me', { headers: { authorization: 'Bearer ' + u.tok } })).json()).profile.avatar.startsWith('data:image/jpeg'), 'profil : la photo est enregistrée et affichée');
ok(await u.pg.locator('#profileBtn img.hav').count() === 1, 'profil : la photo remplace l\'icône dans l\'en-tête');
await u.pg.keyboard.press('Escape'); await u.pg.evaluate(() => { document.getElementById('sheet').hidden = true; document.getElementById('sheet').innerHTML = ''; document.body.style.overflow = ''; });
// 2. offres : la clé Whop active Premium
await u.pg.evaluate(() => window.SillageDemo.plans('quota')); await u.pg.waitForSelector('#lic-k'); await u.pg.screenshot({ path: OUT + '/p2_offres.png' });
ok(/Gratuit/.test(await u.pg.locator('#sheet').innerText()) && /5,99/.test(await u.pg.locator('#sheet').innerText()) && /79 €/.test(await u.pg.locator('#sheet').innerText()), 'offres : Gratuit, Premium 5,99 € et fondateur 79 € affichés');
await u.pg.fill('#lic-k', 'LIC_FAUX_1234'); await u.pg.click('#lic-go'); await u.pg.waitForFunction(() => /n'existe pas/.test(document.querySelector('#lic-msg').textContent)); ok(true, 'offres : une fausse clé est refusée avec un message clair');
await u.pg.fill('#lic-k', 'LIC_E2E_OK'); await u.pg.click('#lic-go'); await u.pg.waitForFunction(() => /C'est activé/.test(document.querySelector('#lic-msg').textContent), null, { timeout: 8000 });
ok((await (await fetch(base + '/api/account/me', { headers: { authorization: 'Bearer ' + u.tok } })).json()).plan === 'premium', 'offres : la clé Whop active Premium');
await u.pg.waitForTimeout(1700); await u.pg.evaluate(() => { document.getElementById('sheet').hidden = true; document.getElementById('sheet').innerHTML = ''; document.body.style.overflow = ''; });
// 3. inspirations : privées, puis publiques, puis visibles dans la communauté
await u.pg.click('[data-tab=play]'); await u.pg.waitForSelector('.plsubtabs');
ok(await u.pg.locator('.plsubtabs button').count() === 3 && /Univers Sillage/.test(await u.pg.locator('.plsubtabs').innerText()) && /Communauté/.test(await u.pg.locator('.plsubtabs').innerText()), 'inspirations : trois sous-onglets, ceux de l\'appli en premier');
ok(await u.pg.locator('.plhero').count() === 1, 'inspirations : les univers de l\'appli restent la page par défaut');
await u.pg.click('[data-sub=mine]'); await u.pg.waitForSelector('#mi-new'); await u.pg.click('#mi-new'); await u.pg.waitForSelector('#ei-save'); await u.pg.screenshot({ path: OUT + '/p3_edit.png' });
await u.pg.fill('#ei-t', 'Mes boisés du dimanche'); await u.pg.fill('#ei-d', 'Pour les matins calmes');
for (const q of ['Sauvage', 'Santal 33']) { await u.pg.fill('#ei-q', q); await u.pg.waitForSelector('#ei-res .vrh'); await u.pg.locator('#ei-res .vrh').first().click(); }
await u.pg.click('#ei-save'); await u.pg.waitForSelector('#si-pub'); await u.pg.screenshot({ path: OUT + '/p4_insp.png' }); ok(/privée/i.test(await u.pg.locator('#sheet').innerText()), 'inspirations : une nouvelle inspiration est privée par défaut');
ok((await (await fetch(base + '/api/community', { headers: { authorization: 'Bearer ' + u.tok } })).json()).items.length === 0, 'inspirations : privée = absente de la communauté');
await u.pg.click('#si-pub'); await u.pg.waitForFunction(() => /publique/i.test(document.querySelector('#sheet').innerText), null, { timeout: 8000 });
const comm = (await (await fetch(base + '/api/community', { headers: { authorization: 'Bearer ' + u.tok } })).json()).items; ok(comm.length === 1 && comm[0].pseudo === 'Léa du 37' && comm[0].items.length === 2, 'inspirations : publique = visible dans la communauté, avec son pseudo');
await u.pg.evaluate(() => { document.getElementById('sheet').hidden = true; document.getElementById('sheet').innerHTML = ''; document.body.style.overflow = ''; });
const v = await open('visiteur@e2e.test'); await v.pg.click('[data-tab=play]'); await v.pg.waitForSelector('.plsubtabs'); await v.pg.click('[data-sub=comm]'); await v.pg.waitForSelector('.myc'); await v.pg.screenshot({ path: OUT + '/p5_comm.png' });
ok(/Mes boisés du dimanche/.test(await v.pg.locator('.mylist').innerText()) && /Léa du 37/.test(await v.pg.locator('.mylist').innerText()), 'communauté : un autre membre voit l\'inspiration publiée, signée de son pseudo');
await v.pg.click('.myc'); await v.pg.waitForSelector('#sc-like'); await v.pg.click('#sc-like'); await v.pg.waitForFunction(() => /\(1\)/.test(document.querySelector('#sc-like').textContent)); ok(true, 'communauté : « J\'aime » compté');
ok(await v.pg.locator('#eown, #si-pub, #ed-ps').count() === 0, 'communauté : pas d\'outil d\'éditeur pour un membre');
// 4. collection limitée en gratuit
await v.pg.evaluate(() => { const S = window.SillageInternals.S(); S.collection = []; for (let i = 0; i < 12; i++) S.collection.push({ id: 'x' + i, name: 'Test ' + i, house: 'Maison', family: 'boisé', notes: [], rating: 4 }); window.SillageInternals.save(); });
ok(await v.pg.evaluate(() => window.SillageProduct.limitAdd([{ name: 'Un autre', house: 'M' }]).length) === 0, 'offre gratuite : 13e parfum refusé');
await v.pg.waitForSelector('#lic-k', { timeout: 3000 }); ok(true, 'offre gratuite : on propose les offres au lieu d\'ajouter');
// 5. éditeur : réservé à l'email éditeur
const ad = await open('admin@e2e.test'); await ad.pg.click('#profileBtn'); await ad.pg.waitForSelector('#pf-stats'); ok(/Mode éditeur/.test(await ad.pg.locator('.pcard2').locator('xpath=following::div[contains(@class,"card")]').nth(1).innerText()), 'éditeur : la carte « Mode éditeur » n\'apparaît que pour l\'email éditeur');
await ad.pg.evaluate(() => { document.getElementById('sheet').hidden = true; document.getElementById('sheet').innerHTML = ''; document.body.style.overflow = ''; });
await ad.pg.evaluate(() => { const e = window.SillageInternals.dbList().find((x) => x.name === 'Sauvage' && /Dior/.test(x.house)) || window.SillageInternals.dbList()[0]; window.__ent = e; window.SillageInternals.openEntry(e); });
await ad.pg.waitForSelector('#ed-ps'); await ad.pg.screenshot({ path: OUT + '/p6_editeur.png' }); await ad.pg.fill('#ed-p', '187'); await ad.pg.click('#ed-ps'); await ad.pg.waitForFunction(() => /publié pour tout le monde/.test(document.querySelector('#ed-msg').textContent));
const ct = await (await fetch(base + '/api/content')).json(); ok(Object.values(ct.price).includes(187), 'éditeur : le nouveau prix est publié pour tout le monde');
await v.pg.reload(); await v.pg.waitForTimeout(3500); ok(await v.pg.evaluate(() => Object.values(window.ENRICH).some((o) => o.p === 187 && !o.pe)), 'éditeur : un autre membre voit le prix modifié après rechargement');
await ad.pg.evaluate(() => { document.getElementById('sheet').hidden = true; document.getElementById('sheet').innerHTML = ''; });
await ad.pg.evaluate(() => { const PL = window.SillageInternals.PL; PL.sub = ''; PL.id = (window.PLAYLISTS.find((p) => p.t === 'Aimant à compliments') || window.PLAYLISTS[0]).id; window.SillageInternals.goTab('play'); });
await ad.pg.waitForSelector('#pe-sel'); const nBefore = await ad.pg.locator('#pe-sel option').count(); await ad.pg.fill('#pe-q', 'Santal 33'); await ad.pg.waitForSelector('#pe-res .vrh'); await ad.pg.locator('#pe-res .vrh').first().click();
await ad.pg.waitForFunction((n) => document.querySelectorAll('#pe-sel option').length === n + 1, nBefore, { timeout: 8000 }); ok(true, 'éditeur : un parfum ajouté à une inspiration apparaît tout de suite');
const nonAdmin = await fetch(base + '/api/admin/content', { method: 'PUT', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + v.tok }, body: JSON.stringify({ op: 'price', key: 'a|b', p: 1 }) }); ok(nonAdmin.status === 403, 'éditeur : refusé côté serveur à tout autre compte');
// 6. installation sur l'écran d'accueil : un seul tuto, après les questions
const w = await open('install@e2e.test', { install: false }); await w.pg.waitForSelector('#inst-ok', { timeout: 12000 }); await w.pg.screenshot({ path: OUT + '/p7_install.png' }); ok(/écran d'accueil/.test(await w.pg.locator('.inst').locator('xpath=ancestor::*[@id="sheet"]').innerText()) , 'installation : un tuto d\'installation s\'affiche une fois connecté');
await w.pg.click('#inst-ok'); ok(await w.pg.evaluate(() => localStorage.getItem('sillage.install') === '1'), 'installation : le tuto ne revient plus après « J\'ai compris »');
const man = await (await fetch(base + '/manifest.webmanifest')).json(); ok(man.display === 'standalone' && man.icons.length >= 3 && (await fetch(base + '/sw.js')).ok && (await fetch(base + '/icon-512.png')).ok, 'installation : manifeste, service worker et icônes servis');
// 7. session expirée : on se reconnecte sans rien perdre
const x = await open('retour@e2e.test', { plain: { v: 3, collection: [], wishlist: [{ name: 'Gardé', house: 'Test', st: 'smell' }], walks: [], profile: { gender: 'f', age: 27, name: 'Léa' }, log: [], feedback: [], settings: { tier: 'luxe', budget: 220, liked: [], avoid: [], vibes: [], occ: [] } } });
for (const k of [...store.keys()]) if (k.startsWith('sess:')) store.delete(k);
await x.pg.evaluate(() => window.SillageDemo.plan.load().catch(() => {})); await x.pg.waitForSelector('#acct #aem', { timeout: 6000 }); ok(/Reconnecte-toi/.test(await x.pg.locator('#acct').innerText()), 'reconnexion : une session expirée propose de se reconnecter');
ok(await x.pg.evaluate(() => window.SillageInternals.S().wishlist.some((w) => w.name === 'Gardé')), 'reconnexion : les données de l\'appareil sont gardées');
await x.pg.fill('#aem', 'retour@e2e.test'); await x.pg.fill('#apw', 'motdepasse1'); await x.pg.click('#ago'); await x.pg.waitForFunction(() => !document.querySelector('#acct'), null, { timeout: 8000 }); ok(await x.pg.evaluate(() => window.SillageDemo.account.loggedIn() && window.SillageInternals.S().wishlist.some((w) => w.name === 'Gardé')), 'reconnexion : reconnecté, la wishlist est toujours là');
await x.pg.reload(); await x.pg.waitForTimeout(1500);
const f = await open('oubli@e2e.test'); ok(true, 'compte de test créé');
for (const c of [u, v, ad, w, x, f]) ok(c.errs.length === 0, 'aucune erreur JavaScript : ' + JSON.stringify(c.errs));
await browser.close(); server.close();
console.log('\nTous les tests produit ont réussi.');
