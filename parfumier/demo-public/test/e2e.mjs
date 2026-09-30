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
let aiCalls = 0, lastPrompt = '';
const idOf = (p, n) => (p.match(new RegExp('^(\\S+) \\| ' + n.replace(/[()]/g, '\\$&') + ' \\|', 'm')) || [])[1];
const client = { messages: { async create(req) {
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
await pg.click('#onbGo'); await pg.waitForTimeout(700);
ok(await pg.locator('[data-sc=apero].on').count() === 1, 'le clic sur le bouton présélectionne « Apéro entre amis »');
ok(/Démo publique · 2 essais restants/.test(await pg.textContent('.demo-pill')), 'bandeau démo : 2 essais restants');
// 2. météo automatique
await pg.click('#wxAuto'); await pg.waitForTimeout(1200);
ok(/3° · pluie/.test(await pg.textContent('.hero .mono')), 'météo automatique : 3° · pluie affichée');
await pg.screenshot({ path: OUT + '/e4_today.png', fullPage: true });
// 3. essai 1 et 2
for (let i = 1; i <= 2; i++) {
  await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .st-btn, #story:not([hidden]) .hero-bottle', { timeout: 20000 }); await pg.waitForTimeout(2600);
  if (i === 1) await pg.screenshot({ path: OUT + '/e5_story.png' });
  await pg.click('#stx'); await pg.waitForTimeout(500);
}
ok(aiCalls === 2, 'IA appelée 2 fois'); ok(/humide|humidité|3/.test(lastPrompt) && /pluie/.test(lastPrompt), 'la météo (3°, pluie) part dans le prompt côté serveur');
ok(/0 essai/.test(await pg.textContent('.demo-pill')), 'bandeau : 0 essai restant');
// 4. 3e essai bloqué -> inscription
await pg.click('#go'); await pg.waitForSelector('#sheet:not([hidden]) #su', { timeout: 5000 }); ok(aiCalls === 2, '3e essai : aucun appel IA');
await pg.screenshot({ path: OUT + '/e6_upsell.png' });
await pg.fill('#su-mail', 'test@exemple.fr'); await pg.click('#su-ok'); await pg.click('#su-go'); await pg.waitForTimeout(600);
ok(store.has('email:test@exemple.fr'), 'email enregistré');
// 5. fonction verrouillée
await pg.evaluate(() => document.getElementById('sheet').hidden = true);
await pg.click('[data-tab=discover]'); await pg.waitForTimeout(400); await pg.fill('#askq', 'un frais'); await pg.click('#askgo'); await pg.waitForSelector('#sheet:not([hidden]) #su', { timeout: 5000 }); ok(aiCalls === 2, 'fonction verrouillée : renvoie vers l\'inscription, sans coût');
// 6. nouveau visiteur : 2 essais neufs; même IP : plafond
ok(errs.length === 0, 'aucune erreur JavaScript ' + JSON.stringify(errs));
// 7. page d'inscription
const p2 = await ctx.newPage(); await p2.goto('http://localhost:' + PORT + '/signup.html'); await p2.fill('#email', 'autre@exemple.fr'); await p2.selectOption('#interest', 'custom'); await p2.check('#consent'); await p2.click('#go'); await p2.waitForTimeout(500);
ok(JSON.parse(store.get('email:autre@exemple.fr')).interest === 'custom', 'page d\'inscription : email + intérêt enregistrés');
await p2.screenshot({ path: OUT + '/e7_signup.png', fullPage: true });
await browser.close(); server.close(); console.log('\nTous les tests de bout en bout ont réussi.');
