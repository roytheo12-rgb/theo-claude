// Comptes, offres Whop, profil, communauté, éditeur : Whop est simulé (aucun appel réel).
import assert from 'node:assert/strict';
import { makeWorker } from '../src/index.js';

const store = new Map();
const kv = { async get(k) { return store.has(k) ? store.get(k) : null; }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix, cursor }) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix || '')).map((name) => ({ name })), list_complete: true }; } };
let aiCalls = 0;
const client = { messages: { async create(req) { aiCalls++; const t = JSON.stringify(req.messages); if (t.includes('CANDIDATS')) return { stop_reason: 'end_turn', content: [{ type: 'text', text: '{"compris":"ok","picks":[{"name":"A","house":"B"}]}' }] }; if (req.model.includes('haiku')) return { stop_reason: 'end_turn', content: [{ type: 'text', text: '{"reply":"Bonjour"}' }] }; return { stop_reason: 'end_turn', content: [{ type: 'text', text: '{"pick":"p1","reason":"x"}' }] }; } } };
const memberships = { LIC_PREMIUM_OK: { id: 'mem_1', status: 'active', product_id: 'prod_PREMIUM', current_period_end: '2099-01-01' }, LIC_FOUNDER_OK: { id: 'mem_2', status: 'completed', product_id: 'prod_FOUNDER' }, LIC_PREMIUM_2: { id: 'mem_5', status: 'active', product_id: 'prod_PREMIUM' }, LIC_CANCELED: { id: 'mem_3', status: 'canceled', product_id: 'prod_PREMIUM' }, LIC_UNKNOWN_PRODUCT: { id: 'mem_4', status: 'active', product_id: 'prod_OTHER' } };
let whopDown = false;
const fetchMock = async (url, init) => {
  assert.match(init.headers.authorization, /^Bearer WHOP_KEY$/);
  if (whopDown) throw new Error('down');
  const key = decodeURIComponent(String(url).split('/memberships/')[1]); const m = memberships[key];
  return m ? new Response(JSON.stringify(m), { status: 200 }) : new Response('{}', { status: 404 });
};
const w = makeWorker({ client, fetch: fetchMock });
const env = { SILLAGE: kv, ASSETS: { fetch: async () => new Response('asset') }, SALT: 's', DAILY_CAP: '1000', WHOP_API_KEY: 'WHOP_KEY', WHOP_PRODUCTS: JSON.stringify({ prod_PREMIUM: 'premium', prod_FOUNDER: 'founder' }), ADMIN_EMAILS: 'theo@example.com' };
let n = 0;
const call = (path, { method = 'GET', body, token, ip = '1.1.1.' + (++n % 200) } = {}) => w.fetch(new Request('https://demo.test' + path, { method, body: body ? JSON.stringify(body) : undefined, headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip, ...(token ? { authorization: 'Bearer ' + token } : {}) } }), env);
const signup = async (email) => (await (await call('/api/account/signup', { method: 'POST', body: { email, password: 'motdepasse1' } })).json()).token;
const day = { collection: 'p1 | Tobacco Vanille | Tom Ford | gourmand | tabac, vanille', text: 'Dîner' };
let ok = 0; const t = async (name, fn) => { await fn(); ok++; console.log('ok', name); };

const alice = await signup('alice@example.com');
await t('un nouveau compte est gratuit, avec ses limites', async () => { const m = await (await call('/api/account/me', { token: alice })).json(); assert.equal(m.plan, 'free'); assert.equal(m.limits.adv, 3); assert.equal(m.limits.publish, false); });
await t('me exige une session', async () => { assert.equal((await call('/api/account/me')).status, 401); });
await t('gratuit : 3 conseils IA par mois puis blocage, sans passer par les essais visiteur', async () => {
  for (let i = 0; i < 3; i++) { const r = await call('/api/day', { method: 'POST', body: day, token: alice }); assert.equal(r.status, 200); }
  const r = await call('/api/day', { method: 'POST', body: day, token: alice }); assert.equal(r.status, 429); assert.equal((await r.json()).plan, 'free');
});
await t('une clé inconnue, annulée ou d\'un autre produit ne donne aucun accès', async () => {
  for (const [lic, st] of [['LIC_NOPE_12345', 400], ['LIC_CANCELED', 400], ['LIC_UNKNOWN_PRODUCT', 400]]) { const r = await call('/api/account/activate', { method: 'POST', body: { license: lic }, token: alice }); assert.equal(r.status, st, lic); }
  assert.equal((await (await call('/api/account/me', { token: alice })).json()).plan, 'free');
});
await t('une clé valide active Premium, et la limite change', async () => {
  const r = await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_PREMIUM_OK' }, token: alice }); const j = await r.json(); assert.equal(r.status, 200); assert.equal(j.me.plan, 'premium'); assert.equal(j.me.limits.adv, 60); assert.equal(j.me.limits.publish, true);
  assert.equal((await call('/api/day', { method: 'POST', body: day, token: alice })).status, 200);
});
await t('une clé ne sert qu\'à un seul compte', async () => { const bob = await signup('bob@example.com'); const r = await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_PREMIUM_OK' }, token: bob }); assert.equal(r.status, 409); });
await t('un achat unique (fondateur) est reconnu', async () => { const c = await signup('carole@example.com'); const j = await (await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_FOUNDER_OK' }, token: c })).json(); assert.equal(j.me.plan, 'founder'); });
await t('Whop injoignable à l\'activation : message clair, pas d\'accès gratuit', async () => { whopDown = true; const d = await signup('dan@example.com'); const r = await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_PREMIUM_OK' }, token: d }); whopDown = false; assert.equal(r.status, 503); assert.equal((await (await call('/api/account/me', { token: d })).json()).plan, 'free'); });
await t('résiliation : l\'accès se retire à la revérification quotidienne', async () => {
  const k = [...store.keys()].find((x) => x.startsWith('plan:') && JSON.parse(store.get(x)).license === 'LIC_PREMIUM_OK'); const rec = JSON.parse(store.get(k)); rec.checkedAt = 0; store.set(k, JSON.stringify(rec));
  memberships.LIC_PREMIUM_OK.status = 'canceled';
  const m = await (await call('/api/account/me', { token: alice })).json(); assert.equal(m.plan, 'free'); assert.equal(m.expired, true);
  memberships.LIC_PREMIUM_OK.status = 'active';
});
await t('Whop injoignable à la revérification : l\'accès est conservé', async () => {
  const k = [...store.keys()].find((x) => x.startsWith('plan:') && JSON.parse(store.get(x)).license === 'LIC_FOUNDER_OK'); const rec = JSON.parse(store.get(k)); rec.checkedAt = 0; store.set(k, JSON.stringify(rec));
  whopDown = true; const c = await (await call('/api/account/login', { method: 'POST', body: { email: 'carole@example.com', password: 'motdepasse1' } })).json(); const m = await (await call('/api/account/me', { token: c.token })).json(); whopDown = false; assert.equal(m.plan, 'founder');
});
await t('profil : pseudo, avatar, validation', async () => {
  const bad = await call('/api/account/profile', { method: 'PUT', body: { pseudo: 'a' }, token: alice }); assert.equal(bad.status, 400);
  const badAv = await call('/api/account/profile', { method: 'PUT', body: { avatar: 'http://x/y.png' }, token: alice }); assert.equal(badAv.status, 400);
  const r = await call('/api/account/profile', { method: 'PUT', body: { pseudo: 'Alice du 37', avatar: 'data:image/jpeg;base64,/9j/4AAQ', bio: 'Boisés et cuirs' }, token: alice }); const j = await r.json();
  assert.equal(r.status, 200); assert.equal(j.me.profile.pseudo, 'Alice du 37'); assert.ok(j.me.profile.avatar.startsWith('data:image/jpeg'));
});
let pid, pro;
await t('communauté : publier exige l\'offre payante et un pseudo', async () => {
  const free = await signup('eve@example.com'); assert.equal((await call('/api/community', { method: 'POST', body: { title: 'Mon univers', items: [{ n: 'A1', h: 'B' }, { n: 'A2', h: 'B' }] }, token: free })).status, 403);
  pro = await signup('pro@example.com'); await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_PREMIUM_2' }, token: pro });
  assert.equal((await call('/api/community', { method: 'POST', body: { title: 'Cuirs de minuit', items: [{ n: 'A1', h: 'B' }, { n: 'A2', h: 'B' }] }, token: pro })).status, 400);   // pas de pseudo
  await call('/api/account/profile', { method: 'PUT', body: { pseudo: 'Alice du 37' }, token: pro });
  const r = await call('/api/community', { method: 'POST', body: { title: 'Cuirs de minuit', desc: 'Pour les soirs d\'hiver', items: [{ n: 'Tuscan Leather', h: 'Tom Ford' }, { n: 'Cuir de Russie', h: 'Chanel' }] }, token: pro }); const j = await r.json(); assert.equal(r.status, 200); pid = j.id;
});
await t('communauté : liste publique pour les comptes, avec auteur, jamais sans session', async () => {
  assert.equal((await call('/api/community')).status, 401);
  const j = await (await call('/api/community', { token: await signup('fred@example.com') })).json(); assert.equal(j.items.length, 1); assert.equal(j.items[0].pseudo, 'Alice du 37'); assert.equal(j.items[0].items.length, 2); assert.equal(j.items[0].mine, false);
});
await t('communauté : like unique, 3 signalements masquent, seul l\'auteur ou l\'éditeur supprime', async () => {
  const f = await signup('gina@example.com'); await call(`/api/community/${pid}/like`, { method: 'POST', token: f }); const l2 = await (await call(`/api/community/${pid}/like`, { method: 'POST', token: f })).json(); assert.equal(l2.likes, 1);
  assert.equal((await call(`/api/community/${pid}`, { method: 'DELETE', token: f })).status, 403);
  for (const e of ['h1@example.com', 'h2@example.com', 'h3@example.com']) await call(`/api/community/${pid}/report`, { method: 'POST', token: await signup(e) });
  assert.equal((await (await call('/api/community', { token: f })).json()).items.length, 0);
  assert.equal((await call(`/api/community/${pid}`, { method: 'DELETE', token: pro })).status, 200);
});
await t('éditeur : refusé aux autres, accepté pour ton email, visible de tous', async () => {
  assert.equal((await call('/api/admin/content', { method: 'PUT', body: { op: 'price', key: 'chanel|n 5', p: 180 }, token: alice })).status, 403);
  const theo = await signup('theo@example.com'); assert.equal((await (await call('/api/account/me', { token: theo })).json()).admin, true);
  assert.equal((await call('/api/admin/content', { method: 'PUT', body: { op: 'price', key: 'Chanel|N 5', p: 180 }, token: theo })).status, 200);
  await call('/api/admin/content', { method: 'PUT', body: { op: 'hide', key: 'x|y', hide: true }, token: theo });
  await call('/api/admin/content', { method: 'PUT', body: { op: 'plAdd', title: 'Aimant à compliments', n: 'Test', h: 'Maison' }, token: theo });
  await call('/api/admin/content', { method: 'PUT', body: { op: 'plPos', title: 'Aimant à compliments', n: 'Test', h: 'Maison', pos: 9 }, token: theo });
  const c = await (await call('/api/content')).json(); assert.equal(c.price['chanel|n 5'], 180); assert.deepEqual(c.hide, ['x|y']); assert.equal(c.plAdd['Aimant à compliments'][0].n, 'Test'); assert.equal(c.plPos['Aimant à compliments'][0].pos, 9); assert.ok(c.v >= 4);
  assert.equal((await call('/api/admin/content', { method: 'PUT', body: { op: 'drop' }, token: theo })).status, 400);
  const st = await (await call('/api/admin/stats', { token: theo })).json(); assert.ok(st.accounts >= 8 && st.plans.premium >= 0);
});
await t('chat : réservé aux comptes, modèle léger, compté par offre', async () => {
  const before = aiCalls; assert.equal((await call('/api/chat', { method: 'POST', body: { prompt: 'Une question de parfum assez longue' } })).status, 401);
  const u = await signup('ivan@example.com'); const r = await call('/api/chat', { method: 'POST', body: { prompt: 'Une question de parfum assez longue' }, token: u }); const j = await r.json(); assert.equal(r.status, 200); assert.equal(j.data.reply, 'Bonjour'); assert.equal(j.left, 19); assert.equal(aiCalls, before + 1);
  assert.equal((await call('/api/chat', { method: 'POST', body: { prompt: 'x' }, token: u })).status, 400);
});
await t('le conseil d\'un compte ne consomme pas les essais visiteurs', async () => { const q = await (await w.fetch(new Request('https://demo.test/api/quota', { headers: { 'x-visitor': 'visitor-000000000001', 'cf-connecting-ip': '8.8.8.8' } }), env)).json(); assert.equal(q.left, 2); });
console.log(ok, 'tests réussis');
