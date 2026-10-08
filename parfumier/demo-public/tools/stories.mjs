// Test de bout en bout : vrai navigateur + vrai code du Worker + IA simulée. Lance : node test/e2e.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
import { makeWorker } from '../src/index.js'; import { makeD1 } from '../test/d1mock.mjs';
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
  const j = { cond: { temp: 24, ctx: 'ami', with: 'amis', moment: 'soir', mood: 'joyeux', style: 'decontracte', color: 'clair', fabric: 'lin', place: 'restaurant', dur: '' }, read: 'Dîner en terrasse entre amis, chemise en lin, 24° ce soir', pick: idOf(p, 'Thé Noir 29'), vibe: ['frais', 'élégant', 'solaire'], story: 'Il fait doux, ta chemise en lin respire : Thé Noir 29 reste frais et net, sans écraser la soirée. Il suit la chaleur de la terrasse.', alts: [{ id: idOf(p, 'Baccarat Rouge 540'), line: 'Plus lumineux, très sillage, pour une soirée qui finit tard' }], layers: [{ id: idOf(p, 'Tobacco Vanille'), effect: 'Une touche de vanille tabac arrondit la fraîcheur et allonge la tenue.', how: '2 sprays de Thé Noir 29 sur le torse, puis 1 spray de Tobacco Vanille sur les poignets, loin du col.', score: 5 }], avoid: '' };
  return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(j) }] };
} } };
const whopFetch = async (u) => { const k = decodeURIComponent(String(u).split('/memberships/')[1]); return k.startsWith('LIC_S') ? new Response(JSON.stringify({ id: 'mem_' + k, status: 'active', product_id: 'prod_PREMIUM' }), { status: 200 }) : k === 'LIC_E2E_BRAND' ? new Response(JSON.stringify({ id: 'mem_b', status: 'active', product_id: 'prod_BRAND' }), { status: 200 }) : k === 'LIC_E2E_OK' ? new Response(JSON.stringify({ id: 'mem_e2e', status: 'active', product_id: 'prod_PREMIUM' }), { status: 200 }) : new Response('{}', { status: 404 }); };
const worker = makeWorker({ client, fetch: whopFetch });
const env = { WHOP_API_KEY: 'k', WHOP_PRODUCTS: JSON.stringify({ prod_PREMIUM: 'premium', prod_BRAND: 'brand' }), DB: makeD1(), ADMIN_EMAILS: 'admin@e2e.test', SILLAGE: kv, ADMIN_KEY: 'k', MAX_TRIES: '2', IP_MAX_PER_DAY: '6', DAILY_CAP: '50', ASSETS: { fetch: async (req) => { const u = new URL(req.url); let f = path.join(pub, u.pathname === '/' ? 'index.html' : u.pathname); if (!f.startsWith(pub) || !fs.existsSync(f)) return new Response('nf', { status: 404 }); return new Response(fs.readFileSync(f), { headers: { 'content-type': types[path.extname(f)] || 'application/octet-stream' } }); } } };
const server = http.createServer(async (rq, rs) => {
  const chunks = []; for await (const c of rq) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request('http://localhost:' + PORT + rq.url, { method: rq.method, headers: { ...rq.headers, 'cf-connecting-ip': '2.2.2.2' }, body: ['GET', 'HEAD'].includes(rq.method) ? undefined : body }), env);
  rs.writeHead(r.status, Object.fromEntries(r.headers)); rs.end(Buffer.from(await r.arrayBuffer()));
});
let PORT; await new Promise((res) => server.listen(0, () => { PORT = server.address().port; res(); }));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const base = 'http://localhost:' + PORT, RAW = '/tmp/stories/raw';
const mk = async (email) => (await (await fetch(base + '/api/account/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'motdepasse1' }) })).json()).token;
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const tok = await mk('lea@sillage.test');
await ctx.addInitScript(([t]) => { try { localStorage.setItem('sillage.tok', t); localStorage.setItem('sillage.email', 'lea@sillage.test'); localStorage.setItem('sillage.acct', 'done'); localStorage.setItem('sillage.onb', '1'); localStorage.setItem('sillage.install', '1'); } catch (x) { /* ok */ } }, [tok]);
const pg = await ctx.newPage(); pg.on('pageerror', (x) => console.log('ERR', x.message));
await pg.goto(base + '/?seed=demo'); await pg.waitForTimeout(3800); await pg.evaluate(() => { const g = document.querySelector('#pSkip'); if (g) g.click(); }); await pg.waitForTimeout(500);
const shot = (n) => pg.screenshot({ path: RAW + '/' + n + '.png' });
// 1. le conseil du jour
await pg.click('[data-cat=sorties]'); await pg.waitForTimeout(300); await pg.click('[data-sc=apero]'); await pg.waitForTimeout(300);
await pg.evaluate(() => { const t = document.querySelector('#say'); if (t) { t.value = 'Dîner en terrasse entre amis, chemise en lin, 24° ce soir'; t.dispatchEvent(new Event('input', { bubbles: true })); } });
await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .hero-bottle', { timeout: 20000 });
for (let i = 1; i <= 7; i++) { await pg.waitForTimeout(2800); await shot('story' + i); await pg.mouse.click(300, 400); }

// ---- fermer le conseil, puis le reste de l'appli
await pg.evaluate(() => { const st = document.getElementById('story'); st.hidden = true; st.innerHTML = ''; document.body.style.overflow = ''; });
const A = JSON.parse(fs.readFileSync('/tmp/stories/assets/assets.json', 'utf8'));
const J = (t, m, p, b) => fetch(base + p, { method: m, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const member = async (email, pseudo, bio, av, n) => { const t = await mk(email); await J(t, 'POST', '/api/account/activate', { license: 'LIC_S' + n + '_OK_KEY' }); const me = (await J(t, 'PUT', '/api/account/profile', { pseudo, bio, avatar: av })).me; return { t, by: me.profile.by }; };
// Léa (toi) : profil, liste publique
const lea = { t: tok }; await J(tok, 'POST', '/api/account/activate', { license: 'LIC_S0_OK_KEY' });
lea.by = (await J(tok, 'PUT', '/api/account/profile', { pseudo: 'lea.nez', bio: 'Boisés, ambrés, et un faible pour les parfums qui tiennent la nuit.', avatar: A.lea })).me.profile.by;
const cam = await member('camille@sillage.test', 'camille.parfums', 'Je teste tout, je garde le meilleur.', A.camille, 1);
const hug = await member('hugo@sillage.test', 'hugo.nez', 'Parfums de bureau et de week-end.', A.hugo, 2);
const ine = await member('ines@sillage.test', 'ines.sillage', 'Gourmands et ambrés, jamais sans mon flacon.', A.ines, 3);
const items = (...a) => a.map(([n, h]) => ({ n, h }));
await J(cam.t, 'POST', '/api/community', { title: 'Mes soirées d\'été', desc: 'Frais, solaires, ils tiennent jusqu\'au bout de la nuit.', cover: A.cov_ete, cat: 'Été', items: items(['Thé Noir 29', 'Le Labo'], ['Baccarat Rouge 540', 'Maison Francis Kurkdjian'], ['Tam Dao', 'Diptyque'], ['Santal 33', 'Le Labo']) });
await J(hug.t, 'POST', '/api/community', { title: 'Bureau sans faute', desc: 'Discrets, propres, jamais trop.', cover: A.cov_bureau, cat: 'Bureau', items: items(['Santal 33', 'Le Labo'], ['Tam Dao', 'Diptyque'], ['Thé Noir 29', 'Le Labo']) });
await J(ine.t, 'POST', '/api/community', { title: 'Nuits ambrées', desc: 'Chauds, enveloppants, pour les soirs frais.', cover: A.cov_soir, cat: 'Soirée', items: items(['Tobacco Vanille', 'Tom Ford'], ['Baccarat Rouge 540', 'Maison Francis Kurkdjian'], ['Santal 33', 'Le Labo']) });
await J(cam.t, 'POST', '/api/community', { title: 'Soirées jazz', desc: 'Boisés et ambrés pour les clubs feutrés.', cover: A.cov_5, cat: 'Soirée', items: items(['Tobacco Vanille', 'Tom Ford'], ['Santal 33', 'Le Labo']) });
await J(hug.t, 'POST', '/api/community', { title: 'Week-end à Tokyo', desc: 'Propres, nets, faciles à porter.', cover: A.cov_6, cat: 'Bureau', items: items(['Thé Noir 29', 'Le Labo'], ['Tam Dao', 'Diptyque']) });
await J(ine.t, 'POST', '/api/community', { title: 'Soleil d\'Égypte', desc: 'Chauds, épicés, pour l\'été.', cover: A.cov_7, cat: 'Été', items: items(['Baccarat Rouge 540', 'Maison Francis Kurkdjian'], ['Tam Dao', 'Diptyque']) });
const leaPub = await J(tok, 'POST', '/api/community', { title: 'Dîners en terrasse', desc: 'Pour les soirs doux, entre amis.', cover: A.cov_lea, cat: 'Été', items: items(['Thé Noir 29', 'Le Labo'], ['Tam Dao', 'Diptyque'], ['Santal 33', 'Le Labo']) });
await J(cam.t, 'PUT', '/api/rating', { h: 'Maison Francis Kurkdjian', n: 'Baccarat Rouge 540', stars: 5, txt: 'Je me fais complimenter à chaque fois. Sillage énorme, même en été.' });
await J(ine.t, 'PUT', '/api/rating', { h: 'Maison Francis Kurkdjian', n: 'Baccarat Rouge 540', stars: 4, txt: 'Magnifique, mais deux sprays suffisent.' });
await J(ine.t, 'PUT', '/api/rating', { h: 'Tom Ford', n: 'Tobacco Vanille', stars: 5, txt: 'Mon parfum des soirs d\'hiver. Enveloppant, rassurant.' });
await J(tok, 'POST', '/api/post', { txt: 'Dîner en terrasse ce soir : Thé Noir 29, chemise en lin, et le conseil de Sillage m\'a donné raison.', h: 'Le Labo', n: 'Thé Noir 29' });
await J(cam.t, 'POST', '/api/post', { txt: 'Ma découverte de la semaine : Thé Noir 29 sur une chemise en lin, une vraie réussite pour les terrasses.', h: 'Le Labo', n: 'Thé Noir 29' });
await J(ine.t, 'POST', '/api/post', { txt: 'Quelqu\'un a une idée de parfum ambré pas trop sucré pour l\'automne ?' });
await J(hug.t, 'POST', '/api/post', { txt: 'Test de la semaine : Santal 33 au bureau. Verdict dans ma liste « Bureau sans faute ».', h: 'Le Labo', n: 'Santal 33' });
for (const m of [cam, hug, ine]) { await J(tok, 'POST', '/api/follow', { by: m.by, on: true }); await J(m.t, 'POST', '/api/follow', { by: lea.by, on: true }); }
await J(cam.t, 'POST', '/api/follow', { by: ine.by, on: true });
await pg.evaluate(([cid, cover]) => { const S = window.SillageInternals.S(); S.myInsp = [{ id: 'a1', cid, cat: 'Été', cover, title: 'Dîners en terrasse', desc: 'Pour les soirs doux, entre amis.', items: [{ n: 'Thé Noir 29', h: 'Le Labo' }, { n: 'Tam Dao', h: 'Diptyque' }, { n: 'Santal 33', h: 'Le Labo' }] }, { id: 'a2', cid: '', title: 'Mes valeurs sûres', desc: 'Ce que je remettrais les yeux fermés.', items: [{ n: 'Tobacco Vanille', h: 'Tom Ford' }, { n: 'Baccarat Rouge 540', h: 'Maison Francis Kurkdjian' }] }]; window.SillageInternals.save(); }, [leaPub.id, A.cov_lea]);
await pg.reload(); await pg.waitForTimeout(3500); await pg.addStyleTag({ content: '#pfab { display: none !important; }' });
const go = (tab) => pg.evaluate((t) => { const sh = document.getElementById('sheet'); sh.hidden = true; sh.innerHTML = ''; document.body.style.overflow = ''; window.SillageInternals.goTab(t); }, tab);
// 2. Pour toi : le fil de mes abonnements
await go('tips'); await pg.waitForSelector('[data-fid]', { timeout: 8000 }); await pg.waitForTimeout(700); await shot('feed');
// 3. une fiche avec les avis de mes abonnements
await pg.evaluate(() => { const e = window.SillageInternals.dbList().find((x) => !x.ed && /baccarat rouge 540/i.test(x.name)); window.SillageInternals.openEntry(e); });
await pg.waitForSelector('[data-st="5"]', { timeout: 8000 }); await pg.waitForTimeout(600); await shot('fiche_top');
await pg.evaluate(() => { const c = document.querySelector('.starpick'); c.closest('.card').scrollIntoView({ block: 'center' }); }); await pg.waitForTimeout(600); await shot('fiche_avis');
// 4. Inspirations : univers, puis la communauté par catégorie
await go('play'); await pg.waitForSelector('.plhero', { timeout: 8000 }); await pg.waitForTimeout(900); await shot('univers');
await pg.click('[data-sub="comm"]'); await pg.waitForSelector('.ccard', { timeout: 8000 }); await pg.waitForTimeout(700); await shot('communaute');
// 5. une playlist de l'appli
await pg.click('[data-sub=""]'); await pg.waitForSelector('.plhero'); await pg.click('.plhero'); await pg.waitForTimeout(1200); await shot('playlist');
// 6. profil
await go('wish'); await pg.waitForSelector('.mestats', { timeout: 8000 }); await pg.waitForTimeout(600); await shot('profil');
// 7. le voyage
await go('search'); await pg.waitForSelector('[data-ssub="tips"]'); await pg.click('[data-ssub="tips"]'); await pg.waitForSelector('#vRedo', { timeout: 8000 }); await pg.click('#vRedo'); await pg.waitForSelector('#vNext'); await pg.click('#vNext'); await pg.waitForSelector('[data-sv="3"]');
const rows = await pg.$$('.vsc'); const pick = [3, 2, 0, 3]; for (let i = 0; i < rows.length; i++) { const b = await rows[i].$('[data-sv="' + pick[i % 4] + '"]'); if (b) await b.click(); } await pg.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('#sheet, #sheet *').forEach((e) => { e.scrollTop = 0; }); }); await pg.waitForTimeout(500); await shot('voyage_q');
for (let i = 0; i < 40 && !(await pg.locator('#vGo').count()); i++) { const opt = pg.locator('.vopt, .sit, .mat').first(); if (await opt.count()) { try { await opt.click({ timeout: 800 }); } catch (e) { /* ok */ } } const nx = pg.locator('#vNext'); if (await nx.count()) { try { await nx.click({ timeout: 800 }); } catch (e) { /* ok */ } } await pg.waitForTimeout(250); }
await pg.waitForSelector('#vGo', { timeout: 8000 }); await pg.waitForTimeout(1200); await shot('voyage_portrait');
console.log('ok'); await browser.close(); server.close();
