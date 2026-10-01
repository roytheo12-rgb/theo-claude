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
const kv = { async get(k) { return store.has(k) ? store.get(k) : null; }, async put(k, v) { store.set(k, v); }, async list({ prefix }) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; } };
let aiCalls = 0, lastPrompt = '', identCalls = [];
const idOf = (p, n) => (p.match(new RegExp('^(\\S+) \\| ' + n.replace(/[()]/g, '\\$&') + ' \\|', 'm')) || [])[1];
const client = { messages: { async create(req) {
  if (req.model.includes('haiku')) { identCalls.push(req); const hz = /Moonlight in Heaven/.test(req.messages[0].content.at(-1).text); return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ items: [hz ? { name: 'Moonlight in Heaven', house: 'Kilian', family: 'floral', notes: ['jasmin', 'santal'], projection: 3, longevity: 3, weight: 3, price: 290, confidence: 0.8 } : { name: 'Santal 33', house: 'Le Labo', family: 'boisé', notes: ['cardamome', 'iris', 'santal', 'cuir'], projection: 4, longevity: 4, weight: 3, price: 220, confidence: 0.9 }] }) }] }; }
  aiCalls++; const p = req.messages[0].content.at(-1).text; lastPrompt = p; await new Promise((r) => setTimeout(r, 500));
  const j = { cond: { temp: 3, ctx: 'date', with: 'partenaire', moment: 'soir', mood: 'romantique', style: 'soiree', color: 'sombre', fabric: 'cuir', place: '', dur: '' }, read: 'Dîner à deux ce soir, perfecto noir, il fait froid', pick: idOf(p, 'Tobacco Vanille'), vibe: ['enveloppant', 'fumé', 'magnétique'], story: 'Il fait 3° et ton perfecto sent déjà la nuit : Tobacco Vanille s’y accroche comme une écharpe de fumée douce.', alts: [{ id: idOf(p, 'Baccarat Rouge 540'), line: 'Plus lumineux, très sillage' }], layers: [{ id: idOf(p, 'Thé Noir 29'), effect: 'Le thé noir assèche la douceur et allonge la tenue.', how: '2 sprays de Tobacco Vanille sur la nuque, puis 1 spray de Thé Noir 29 sur les poignets. Évite le cuir du perfecto.', score: 5 }], avoid: '' };
  return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(j) }] };
} } };
const worker = makeWorker({ client });
const env = { SILLAGE: kv, ADMIN_KEY: 'k', MAX_TRIES: '2', IP_MAX_PER_DAY: '6', DAILY_CAP: '50', ASSETS: { fetch: async (req) => { const u = new URL(req.url); let f = path.join(pub, u.pathname === '/' ? 'index.html' : u.pathname); if (!f.startsWith(pub) || !fs.existsSync(f)) return new Response('nf', { status: 404 }); return new Response(fs.readFileSync(f), { headers: { 'content-type': types[path.extname(f)] || 'application/octet-stream' } }); } } };
const server = http.createServer(async (rq, rs) => {
  const chunks = []; for await (const c of rq) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request('http://localhost:' + PORT + rq.url, { method: rq.method, headers: { ...rq.headers, 'cf-connecting-ip': '2.2.2.2' }, body: ['GET', 'HEAD'].includes(rq.method) ? undefined : body }), env);
  rs.writeHead(r.status, Object.fromEntries(r.headers)); rs.end(Buffer.from(await r.arrayBuffer()));
});
let PORT; await new Promise((res) => server.listen(0, () => { PORT = server.address().port; res(); }));
const ok = (c, m) => { if (!c) throw new Error('ÉCHEC : ' + m); console.log('ok', m); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 1.3, geolocation: { latitude: 48.85, longitude: 2.35 }, permissions: ['geolocation'] });
await ctx.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: { current: { apparent_temperature: 3.4, relative_humidity_2m: 88, weather_code: 61, wind_speed_10m: 12 } } }));
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
await pg.goto('http://localhost:' + PORT + '/');
// 1. onboarding
await pg.waitForSelector('#onb', { timeout: 8000 }); await pg.waitForTimeout(600); await pg.screenshot({ path: OUT + '/e1_onb1.png' });
await pg.waitForTimeout(3000); await pg.screenshot({ path: OUT + '/e2_onb2.png' });
await pg.waitForTimeout(2800); await pg.screenshot({ path: OUT + '/e3_onb3.png' });
await pg.waitForTimeout(3000); ok(await pg.isVisible('#onbGo'), 'onboarding : bouton final visible en moins de 12 s');
await pg.click('#onbGo'); await pg.waitForSelector('#prof .gen', { timeout: 5000 }); ok(true, 'profil : l\'écran « Tu es… » s\'affiche après l\'intro');
await pg.screenshot({ path: OUT + '/e3b_profil1.png' });
await pg.click('[data-g=f]'); await pg.click('#pNext'); await pg.waitForSelector('#pAge'); await pg.screenshot({ path: OUT + '/e3c_profil2.png' });
await pg.fill('#pAge', '27'); await pg.click('#pDone'); await pg.waitForTimeout(600);
const prof = await pg.evaluate(() => JSON.parse(localStorage.getItem('sillage.v3')).profile);
ok(prof.gender === 'f' && prof.age === 27 && prof.dress === undefined, 'profil sauvegardé : fille, 27 ans (la tenue se demande plus tard)');
ok(await pg.locator('#dresses .dchip').count() === 6, 'au moment de choisir le parfum : 6 tenues proposées avec icônes'); await pg.click('[data-dress=smart]'); await pg.waitForTimeout(300);
// La collection est vide au départ (rien de fictif) : on ajoute ses parfums via le catalogue, sans IA
ok(await pg.locator('#emptyAdd').count() === 1 && await pg.locator('.vit button').count() === 0, 'collection vide : invitation à ajouter ses parfums, aucun parfum fictif');
await pg.click('#emptyAdd'); await pg.waitForSelector('#addtxt'); await pg.type('#addtxt', 'tobacco'); await pg.waitForSelector('[data-sug]');
ok(/Tobacco Vanille/.test(await pg.textContent('#addsug')), 'suggestion du catalogue pendant la frappe');
await pg.click('[data-sug]'); await pg.type('#addtxt', 'Baccarat Rouge 540\nThé Noir 29'); await pg.click('#addgo'); await pg.waitForSelector('#addok', { timeout: 8000 });
ok(identCalls.length === 0, 'parfums du catalogue : aucun appel à l\'IA'); await pg.click('#addok'); await pg.waitForTimeout(600);
ok(await pg.locator('.pcard').count() === 3, 'trois parfums ajoutés à la collection'); await pg.click('[data-tab=today]'); await pg.waitForTimeout(500);
ok(await pg.locator('[data-sc=apero].on').count() === 1, 'le clic sur le bouton présélectionne « Apéro entre amis »');
ok(/Démo · 2 essais/.test(await pg.textContent('.demo-pill')), 'bandeau démo : 2 essais restants');
// 2. météo automatique
await pg.click('[data-refine]'); await pg.waitForTimeout(400); await pg.click('#wxAuto'); await pg.waitForTimeout(1200);
ok(/3° · pluie/.test(await pg.textContent('.hero .mono')), 'météo automatique : 3° · pluie affichée');
await pg.screenshot({ path: OUT + '/e4_today.png', fullPage: true });
// 3. essai 1 et 2
for (let i = 1; i <= 2; i++) {
  await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .st-btn, #story:not([hidden]) .hero-bottle', { timeout: 20000 }); await pg.waitForTimeout(2600);
  if (i === 1) await pg.screenshot({ path: OUT + '/e5_story.png' });
  await pg.click('#stx'); await pg.waitForTimeout(500);
}
ok(aiCalls === 2, 'IA appelée 2 fois'); ok(/humide|humidité|3/.test(lastPrompt) && /pluie/.test(lastPrompt), 'la météo (3°, pluie) part dans le prompt côté serveur');
ok(/je suis une femme/.test(lastPrompt) && /j'ai 27 ans/.test(lastPrompt) && /tenue : smart casual/.test(lastPrompt) && /stock : /.test(lastPrompt), 'profil (fille, 27 ans), tenue choisie et stock des flacons partent dans le prompt du jour');
ok(/0 essai/.test(await pg.textContent('.demo-pill')), 'bandeau : 0 essai restant');
// 4. 3e essai bloqué -> inscription
await pg.click('#go'); await pg.waitForSelector('#sheet:not([hidden]) #su', { timeout: 5000 }); ok(aiCalls === 2, '3e essai : aucun appel IA');
await pg.screenshot({ path: OUT + '/e6_upsell.png' });
await pg.fill('#su-mail', 'test@exemple.fr'); await pg.click('#su-ok'); await pg.click('#su-go'); await pg.waitForTimeout(600);
ok(store.has('email:test@exemple.fr'), 'email enregistré');
// 5. fonction verrouillée
await pg.evaluate(() => document.getElementById('sheet').hidden = true);
await pg.click('[data-tab=discover]'); await pg.waitForTimeout(400); await pg.fill('#askq', 'un frais'); await pg.click('#askgo'); await pg.waitForSelector('#sheet:not([hidden]) #su', { timeout: 5000 }); ok(aiCalls === 2, 'fonction verrouillée : renvoie vers l\'inscription, sans coût');
// 5b. ajouter un parfum : connu = zéro IA, inconnu = IA légère (Haiku), lien d'image https
await pg.evaluate(() => { const sh = document.getElementById('sheet'); sh.hidden = true; sh.innerHTML = ''; }); await pg.click('[data-tab=shelf]'); await pg.waitForTimeout(500); await pg.click('#addBtn'); await pg.waitForSelector('#addtxt');
await pg.fill('#addtxt', 'Tam Dao Eau de Parfum, Parfum Inconnu 77'); await pg.fill('#addurl', 'http://pas-https.test/x.jpg'); await pg.click('#addgo'); await pg.waitForTimeout(400);
ok(identCalls.length === 0, 'un lien http (non sécurisé) est refusé sans appel IA');
await pg.fill('#addurl', 'https://exemple.test/flacon.jpg'); await pg.click('#addgo'); await pg.waitForSelector('#addok', { timeout: 15000 });
ok(identCalls.length === 1, 'identification : un seul appel au modèle léger');
const ic = identCalls[0]; ok(/haiku/.test(ic.model) && ic.messages[0].content[0].source.type === 'url' && /Parfum Inconnu 77/.test(ic.messages[0].content.at(-1).text) && !/Tam Dao/.test(ic.messages[0].content.at(-1).text), 'Haiku reçoit le lien et seulement le parfum inconnu (Tam Dao reconnu sans IA)');
ok(await pg.locator('.prew').count() === 2 && await pg.locator('.prew').first().locator('[data-sz]').count() === 7, 'ajout : taille, reste et usage proposés pour chaque parfum');
await pg.locator('.prew').nth(1).locator('[data-sz="2"]').click(); ok(await pg.locator('.prew').nth(1).locator('[data-us=special].on').count() === 1, 'un échantillon (2 ml) passe seul en « Grandes occasions »');
await pg.locator('.prew').nth(1).locator('[data-lf="25"]').click();
await pg.screenshot({ path: OUT + '/e6b_ajout.png' }); await pg.click('#addok'); await pg.waitForTimeout(700);
const names = await pg.evaluate(() => JSON.parse(localStorage.getItem('sillage.v3')).collection.map((p) => p.name));
ok(names.includes('Santal 33') && names.includes('Tam Dao Eau de Parfum'), 'les deux parfums sont dans la collection');
const st33 = await pg.evaluate(() => JSON.parse(localStorage.getItem('sillage.v3')).collection.find((p) => p.name === 'Santal 33'));
ok(st33.size === 2 && st33.left === 25 && st33.use === 'special', 'stock sauvegardé : 2 ml, il en reste peu, grandes occasions');
ok(store.has('cand:santal 33') && JSON.parse(store.get('cand:santal 33')).v.length === 1, 'catalogue partagé : le parfum attend la 2e confirmation');
// 5b2. le grand index : un parfum qui n'est pas au catalogue détaillé est proposé, puis complété par l'IA légère
await pg.click('#addBtn'); await pg.waitForSelector('#addtxt'); await pg.type('#addtxt', 'moonlight in'); await pg.waitForSelector('[data-sug]');
ok(/Moonlight in Heaven/.test(await pg.textContent('#addsug')) && /Kilian/.test(await pg.textContent('#addsug')), 'grand index : « Moonlight in Heaven · Kilian » proposé pendant la frappe');
await pg.click('[data-sug]'); ok((await pg.inputValue('#addtxt')).startsWith('Kilian — Moonlight in Heaven'), 'le parfum de l\'index s\'insère avec sa maison');
const nIdent = identCalls.length; await pg.click('#addgo'); await pg.waitForSelector('#addok', { timeout: 15000 });
ok(identCalls.length === nIdent + 1 && /Kilian — Moonlight in Heaven/.test(identCalls.at(-1).messages[0].content.at(-1).text), 'la fiche inconnue est complétée par Haiku (Maison — Nom envoyé)');
await pg.evaluate(() => { const sh = document.getElementById('sheet'); sh.hidden = true; sh.innerHTML = ''; });
// 5c. tout est sauvegardé d'un jour à l'autre : on recharge la page
await pg.reload(); await pg.waitForTimeout(3600);
const after = await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('sillage.v3')); return { prof: S.profile, has: S.collection.some((p) => p.name === 'Santal 33'), ov: !!document.querySelector('#prof') || !!document.querySelector('#onb') }; });
ok(after.prof.age === 27 && after.has && !after.ov, 'après rechargement : profil et collection sont là, aucun écran d\'accueil revient');
// 5d. chaque personne a son profil : un nouveau profil démarre vide, l'ancien reste intact
await pg.click('#profileBtn'); await pg.waitForSelector('#newprof'); await pg.click('#newprof'); await pg.waitForSelector('#prof .gen', { timeout: 8000 });
const act = await pg.evaluate(() => JSON.parse(localStorage.getItem('sillage.profiles')));
ok(act.list.length === 2 && act.active !== 'main', 'nouveau profil créé et actif');
await pg.click('#pSkip'); await pg.waitForTimeout(500);
ok(await pg.locator('#emptyAdd').count() === 1, 'le nouveau profil démarre avec une collection vide');
ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('sillage.v3')).collection.length) >= 3, 'le profil précédent est intact (sa collection est toujours là)');
await pg.click('#profileBtn'); await pg.waitForSelector('[data-sw=main]'); await pg.click('[data-sw=main]'); await pg.waitForTimeout(3600);
ok(await pg.evaluate(() => document.querySelectorAll('.vit button').length) >= 3, 'retour au profil principal : sa collection s\'affiche');
// 6. nouveau visiteur : 2 essais neufs; même IP : plafond
ok(errs.length === 0, 'aucune erreur JavaScript ' + JSON.stringify(errs));
// 7. page d'inscription
const p2 = await ctx.newPage(); await p2.goto('http://localhost:' + PORT + '/signup.html'); await p2.fill('#email', 'autre@exemple.fr'); await p2.selectOption('#interest', 'custom'); await p2.check('#consent'); await p2.click('#go'); await p2.waitForTimeout(500);
ok(JSON.parse(store.get('email:autre@exemple.fr')).interest === 'custom', 'page d\'inscription : email + intérêt enregistrés');
await p2.screenshot({ path: OUT + '/e7_signup.png', fullPage: true });
await browser.close(); server.close(); console.log('\nTous les tests de bout en bout ont réussi.');
