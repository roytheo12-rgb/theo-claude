// Réseau : abonnements, avis, publications, fil, liens suivis, marques vérifiées, stats sans données personnelles, effacement.
import assert from 'node:assert/strict'; import fs from 'node:fs';
import { makeWorker } from '../src/index.js'; import { makeD1 } from './d1mock.mjs';

const store = new Map();
const kv = { async get(k) { return store.has(k) ? store.get(k) : null; }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix || '')).map((name) => ({ name })), list_complete: true }; } };
const D = makeD1();
const memberships = { LIC_PREM_1: { id: 'm1', status: 'active', product_id: 'prod_PREMIUM' }, LIC_PREM_2: { id: 'm2', status: 'active', product_id: 'prod_PREMIUM' }, LIC_PREM_3: { id: 'm4', status: 'active', product_id: 'prod_PREMIUM' }, LIC_BRAND_1: { id: 'm3', status: 'active', product_id: 'prod_BRAND' } };
const fetchMock = async (url) => { const m = memberships[decodeURIComponent(String(url).split('/memberships/')[1])]; return m ? new Response(JSON.stringify(m)) : new Response('{}', { status: 404 }); };
const w = makeWorker({ client: { messages: { async create() { return { stop_reason: 'end_turn', content: [{ type: 'text', text: '{}' }] }; } } }, fetch: fetchMock });
const env = { SILLAGE: kv, DB: D, ASSETS: { fetch: async () => new Response('asset') }, SALT: 's', DAILY_CAP: '1000', WHOP_API_KEY: 'k', WHOP_PRODUCTS: JSON.stringify({ prod_PREMIUM: 'premium', prod_BRAND: 'brand' }), ADMIN_EMAILS: 'theo@example.com', CONV_SECRET: 'conv-secret', PLATFORM_CUT: '30', AFFIL_RULES: JSON.stringify([{ host: 'marque.example', param: 'aff', value: 'sillage', sub: 'sub' }, { host: 'shop.example', tpl: 'https://reseau.example/c?u={url}&s={sub}' }]) };
let n = 0;
const call = (path, { method = 'GET', body, token, ip = '3.3.3.' + (++n % 250) } = {}) => w.fetch(new Request('https://demo.test' + path, { method, body: body ? JSON.stringify(body) : undefined, headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip, ...(token ? { authorization: 'Bearer ' + token } : {}) } }), env);
const J = async (r) => r.json();
const member = async (email, pseudo, lic) => {
  const token = (await J(await call('/api/account/signup', { method: 'POST', body: { email, password: 'motdepasse1' } }))).token;
  if (lic) await call('/api/account/activate', { method: 'POST', body: { license: lic }, token });
  const me = (await J(await call('/api/account/profile', { method: 'PUT', body: { pseudo, bio: 'Bio de ' + pseudo }, token }))).me;
  return { token, by: me.profile.by };
};
let ok = 0; const t = async (name, fn) => { await fn(); ok++; console.log('ok', name); };

const alice = await member('alice@example.com', 'Alice', 'LIC_PREM_1'), bob = await member('bob@example.com', 'Bob'), carl = await member('carl@example.com', 'Carl'), theo = await member('theo@example.com', 'Theo');
await t('abonnements : suivre, ne pas se suivre soi-même, inconnu refusé, compteurs', async () => {
  assert.equal((await call('/api/follow', { method: 'POST', body: { by: bob.by }, token: bob.token })).status, 400);
  assert.equal((await call('/api/follow', { method: 'POST', body: { by: 'aaaaaaaaaaaa' }, token: bob.token })).status, 404);
  const r = await J(await call('/api/follow', { method: 'POST', body: { by: alice.by }, token: bob.token })); assert.equal(r.followers, 1);
  await call('/api/follow', { method: 'POST', body: { by: alice.by }, token: bob.token });   // idempotent
  const p = await J(await call('/api/u/' + alice.by, { token: bob.token })); assert.equal(p.followers, 1); assert.equal(p.iFollow, true); assert.equal(p.profile.pseudo, 'Alice');
  assert.equal((await J(await call('/api/following', { token: bob.token }))).items[0].pseudo, 'Alice');
  assert.equal((await J(await call('/api/u/' + alice.by))).iFollow, false);   // sans compte : profil lisible
  assert.equal((await call('/api/follow', { method: 'POST', body: { by: alice.by } })).status, 401);
});
await t('avis : ma note, ceux de mes abonnements seulement, moyenne pour tous', async () => {
  const rate = (u, stars, txt) => call('/api/rating', { method: 'PUT', body: { h: 'Le Labo', n: 'Santal 33', stars, txt }, token: u.token });
  assert.equal((await rate(alice, 9, '')).status, 400); assert.equal((await rate(alice, 5, 'Sur @insta')).status, 400);
  await rate(alice, 5, 'Mon préféré pour l\'hiver'); await rate(carl, 3, 'Correct'); await rate(alice, 4, 'Après réflexion, très bien');
  const b = await J(await call('/api/ratings?h=Le%20Labo&n=Santal%2033', { token: bob.token }));
  assert.equal(b.friends.length, 1); assert.equal(b.friends[0].author.pseudo, 'Alice'); assert.equal(b.friends[0].stars, 4); assert.equal(b.count, 2); assert.equal(b.avg, 3.5); assert.equal(b.mine, null);
  assert.equal((await J(await call('/api/ratings?h=LE%20LABO&n=santal%2033', { token: alice.token }))).mine.stars, 4);   // casse et accents sans importance
  assert.equal((await call('/api/rating?h=Le%20Labo&n=Santal%2033', { method: 'DELETE', token: carl.token })).status, 200);
  assert.equal((await J(await call('/api/ratings?h=Le%20Labo&n=Santal%2033', { token: bob.token }))).count, 1);
});
let postId;
await t('publications : offre payante requise, règles, image, fil tous / abonnements, signalements', async () => {
  const post = (u, b) => call('/api/post', { method: 'POST', body: b, token: u.token });
  assert.equal((await post(bob, { txt: 'Bonjour tout le monde' })).status, 403);
  { const r0 = await post(alice, { txt: 'Écris-moi à moi@mail.fr' }); assert.equal(r0.status, 400, JSON.stringify(await J(r0))); }
  assert.equal((await post(alice, { txt: 'Photo', img: 'http://x/y.png' })).status, 400);
  const r = await post(alice, { txt: 'Mon top des parfums du soir', video: 'https://youtu.be/abc123', img: 'data:image/jpeg;base64,/9j/4AAQ', h: 'Le Labo', n: 'Santal 33' }); assert.equal(r.status, 200); postId = (await J(r)).id;
  const all = await J(await call('/api/feed', { token: carl.token })); assert.equal(all.items.some((x) => x.t === 'post' && x.id === postId), true);
  const fol = await J(await call('/api/feed?scope=follow', { token: bob.token })); assert.equal(fol.items.some((x) => x.id === postId), true);
  assert.equal((await J(await call('/api/feed?scope=follow', { token: carl.token }))).items.some((x) => x.id === postId), false);
  const p = all.items.find((x) => x.id === postId); assert.match(p.video, /^\/api\/go\/[a-f0-9]{10}$/); assert.equal(p.author.pseudo, 'Alice');
  assert.equal((await call(`/api/post/${postId}`, { method: 'DELETE', token: carl.token })).status, 403);
  for (const u of [bob, carl, theo]) await call(`/api/post/${postId}/report`, { method: 'POST', token: u.token });
  assert.equal((await J(await call('/api/feed', { token: carl.token }))).items.some((x) => x.id === postId), false);
  const mod = await J(await call('/api/admin/posts', { token: theo.token })); assert.equal(mod.items[0].hidden, true);
  assert.equal((await call('/api/admin/posts/' + postId, { method: 'POST', body: { action: 'restore' }, token: alice.token })).status, 403);
  await call('/api/admin/posts/' + postId, { method: 'POST', body: { action: 'restore' }, token: theo.token });
  assert.equal((await J(await call('/api/feed', { token: carl.token }))).items.some((x) => x.id === postId), true);
});
await t('liens suivis : le clic est compté puis redirigé, le créateur voit ses chiffres, aucun identifiant de lecteur', async () => {
  const l = await call('/api/community', { method: 'POST', body: { title: 'Mes boisés du soir', desc: 'Cèdre', cover: 'data:image/jpeg;base64,/9j/4AAQ', items: [{ n: 'Santal 33', h: 'Le Labo', u: 'https://marque.example/santal?aff=alice' }, { n: 'Tam Dao', h: 'Diptyque' }] }, token: alice.token }); assert.equal(l.status, 200);
  const list = (await J(await call('/api/community', { token: carl.token }))).items[0]; assert.match(list.items[0].u, /^\/api\/go\/[a-f0-9]{10}$/); assert.ok(list.cover.startsWith('data:image/jpeg')); assert.equal(list.items[1].u, undefined);
  const go = await call(list.items[0].u); assert.equal(go.status, 302); assert.match(go.headers.get('location'), /^https:\/\/marque\.example\/santal\?aff=sillage&sub=[a-f0-9]{10}$/);   // règle de commission de Sillage
  await call(list.items[0].u); assert.equal((await call('/api/go/0000000000')).status, 404);
  const st = await J(await call('/api/my/stats', { token: alice.token })); assert.equal(st.links.find((x) => x.url.includes('santal')).n, 2); assert.equal(st.followers, 1);
  const cols = D._raw.prepare('PRAGMA table_info(ev)').all().map((c) => c.name); assert.deepEqual(cols.sort(), ['d', 'kind', 'n', 'owner', 'target']);
  const feedList = (await J(await call('/api/feed', { token: carl.token }))).items.find((x) => x.t === 'list'); assert.match(feedList.items[0].u, /go/);
});
await t('marques : demande, validation par l\'éditeur, abonnement marque requis pour le badge, contenu étiqueté', async () => {
  const brand = await member('maison@example.com', 'MaisonDuSoir');
  assert.equal((await call('/api/brand/apply', { method: 'POST', body: { name: 'X', site: 'http://pas-https' }, token: brand.token })).status, 400);
  assert.equal((await call('/api/brand/apply', { method: 'POST', body: { name: 'Maison Aurore', site: 'https://aurore.example', houses: 'Aurore, Aurore Paris', bio: 'Parfumeur depuis 1920' }, token: brand.token })).status, 200);
  assert.equal((await call('/api/admin/brands', { token: alice.token })).status, 403);
  const pend = await J(await call('/api/admin/brands', { token: theo.token })); assert.equal(pend.items[0].status, 'pending');
  assert.equal((await call('/api/post', { method: 'POST', body: { txt: 'Nouveauté' }, token: brand.token })).status, 403);   // ni badge ni offre
  await call('/api/admin/brands/' + brand.by, { method: 'POST', body: { action: 'verify' }, token: theo.token });
  assert.equal((await J(await call('/api/u/' + brand.by))).profile.brand, false);                                   // vérifiée mais sans abonnement : pas de badge
  await call('/api/account/activate', { method: 'POST', body: { license: 'LIC_BRAND_1' }, token: brand.token });
  const prof = await J(await call('/api/u/' + brand.by)); assert.equal(prof.profile.brand, true); assert.equal(prof.profile.pseudo, 'Maison Aurore');
  const pr = await call('/api/post', { method: 'POST', body: { txt: 'Notre nouvelle eau de parfum', video: 'https://aurore.example/film', h: 'Aurore', n: 'Nocturne' }, token: brand.token }); assert.equal(pr.status, 200);
  const item = (await J(await call('/api/feed', { token: carl.token }))).items.find((x) => x.author.brand); assert.equal(item.brand, true); assert.equal(item.ad, true);   // toujours étiqueté
  // vues anonymes et statistiques
  await call('/api/view', { method: 'POST', body: { posts: [item.id] } }); await call('/api/view', { method: 'POST', body: { posts: [item.id], h: 'Aurore Paris', n: 'Nocturne' } });
  await call(item.video); await call(item.video); await call(item.video);
  const s = await J(await call('/api/brand/me', { token: brand.token })); assert.equal(s.stats.posts[0].views, 2); assert.equal(s.stats.links[0].n, 3); assert.equal(s.stats.perfumeViews, 1);
  assert.equal((await J(await call('/api/brand/me', { token: carl.token }))).brand, null);
  await call('/api/admin/brands/' + brand.by, { method: 'POST', body: { action: 'revoke' }, token: theo.token });
  assert.equal((await J(await call('/api/u/' + brand.by))).profile.brand, false);
});
await t('commentaires : sous une publication, notification à l\'auteur, suppression par l\'auteur du commentaire ou de la publication', async () => {
  const pid = (await J(await call('/api/post', { method: 'POST', body: { txt: 'Un avis sur Tam Dao' }, token: alice.token }))).id;
  assert.equal((await call(`/api/post/${pid}/comments`, { method: 'POST', body: { txt: 'a' }, token: bob.token })).status, 400);
  assert.equal((await call(`/api/post/${pid}/comments`, { method: 'POST', body: { txt: 'Écris-moi à moi@mail.fr' }, token: bob.token })).status, 400);
  const c = await J(await call(`/api/post/${pid}/comments`, { method: 'POST', body: { txt: 'Je valide, très beau' }, token: bob.token })); assert.ok(c.id);
  await call(`/api/post/${pid}/comments`, { method: 'POST', body: { txt: 'Moi aussi' }, token: carl.token });
  const list = await J(await call(`/api/post/${pid}/comments`, { token: carl.token })); assert.equal(list.items.length, 2); assert.equal(list.items[0].author.pseudo, 'Bob');
  const feed = (await J(await call('/api/feed', { token: carl.token }))).items.find((x) => x.id === pid); assert.equal(feed.cc, 2);
  const n = await J(await call('/api/notifs', { token: alice.token })); assert.equal(n.unread >= 3, true); assert.ok(n.items.some((x) => x.kind === 'comment' && x.author.pseudo === 'Bob' && x.txt.includes('très beau'))); assert.ok(n.items.some((x) => x.kind === 'follow' && x.author.pseudo === 'Bob'));
  assert.equal((await J(await call('/api/notifs?count=1', { token: alice.token }))).unread, n.unread);
  await call('/api/notifs/read', { method: 'POST', token: alice.token }); assert.equal((await J(await call('/api/notifs?count=1', { token: alice.token }))).unread, 0);
  assert.equal((await call('/api/comment/' + c.id, { method: 'DELETE', token: carl.token })).status, 403);
  assert.equal((await call('/api/comment/' + c.id, { method: 'DELETE', token: alice.token })).status, 200);    // l'auteur de la publication modère
  assert.equal((await J(await call(`/api/post/${pid}/comments`, { token: carl.token }))).items.length, 1);
  const f = await J(await call('/api/followers', { token: alice.token })); assert.equal(f.items.some((x) => x.pseudo === 'Bob'), true);
  assert.equal((await call(`/api/post/${pid}`, { method: 'DELETE', token: alice.token })).status, 200); assert.equal(D._raw.prepare('SELECT COUNT(*) AS c FROM comments WHERE post = ?').get(pid).c, 0);
});
await t('commission : le lien est réécrit par les règles de Sillage, la vente est partagée, le créateur voit ses gains, l\'éditeur le total', async () => {
  const cr = await member('creat@example.com', 'Créa', 'LIC_PREM_2');
  const l = await J(await call('/api/community', { method: 'POST', body: { title: 'Mes boutiques', items: [{ n: 'Santal 33', h: 'Le Labo', u: 'https://www.marque.example/p/santal?x=1' }, { n: 'Tam Dao', h: 'Diptyque', u: 'https://shop.example/tam-dao' }, { n: 'Bois Farine', h: 'Lutens', u: 'https://autre.example/bf' }], cat: 'Soirée' }, token: cr.token }));
  const pub = (await J(await call('/api/community', { token: carl.token }))).items.find((x) => x.id === l.id); assert.equal(pub.cat, 'Soirée');
  const hop = async (u) => (await call(u)).headers.get('location');
  const a1 = await hop(pub.items[0].u); assert.match(a1, /^https:\/\/www\.marque\.example\/p\/santal\?x=1&aff=sillage&sub=[a-f0-9]{10}$/);
  const a2 = await hop(pub.items[1].u); assert.match(a2, /^https:\/\/reseau\.example\/c\?u=https%3A%2F%2Fshop\.example%2Ftam-dao&s=[a-f0-9]{10}$/);
  assert.equal(await hop(pub.items[2].u), 'https://autre.example/bf');   // pas de règle : lien tel quel
  const code = pub.items[0].u.split('/').pop();
  assert.equal((await call(`/api/conversion?key=mauvais&code=${code}&commission=2&ref=A1`)).status, 403);
  const v = await J(await call(`/api/conversion?key=conv-secret&code=${code}&amount=80&commission=4,00&ref=CMD1`)); assert.equal(v.creator, 280); assert.equal(v.platform, 120);
  await call(`/api/conversion?key=conv-secret&code=${code}&amount=80&commission=4&ref=CMD1`);    // même commande : une seule fois
  assert.equal((await call('/api/conversion?key=conv-secret&code=0000000000&commission=2&ref=B'  )).status, 400);
  const st = await J(await call('/api/my/stats', { token: cr.token })); assert.equal(st.sales.n, 1); assert.equal(st.sales.earned, 2.8); assert.equal(st.sales.share, 70);
  assert.ok((await J(await call('/api/notifs', { token: cr.token }))).items.some((x) => x.kind === 'sale' && x.txt.includes('2,80')));
  assert.equal((await call('/api/admin/sales', { token: cr.token })).status, 403);
  const ad = await J(await call('/api/admin/sales', { token: theo.token })); assert.equal(ad.commission, 4); assert.equal(ad.platform, 1.2); assert.equal(ad.due[0].due, 2.8);
  const pay = await J(await call('/api/admin/sales/pay/' + cr.by, { method: 'POST', token: theo.token })); assert.equal(pay.paid, 2.8);
  assert.equal((await J(await call('/api/my/stats', { token: cr.token }))).sales.due, 0);
});
await t('catégories de playlists : définies par l\'éditeur, une catégorie inconnue est ignorée', async () => {
  assert.equal((await call('/api/admin/content', { method: 'PUT', body: { op: 'cats', list: ['Soirée', 'Rentrée'] }, token: alice.token })).status, 403);
  assert.equal((await call('/api/admin/content', { method: 'PUT', body: { op: 'cats', list: ['Soirée', 'Rentrée'] }, token: theo.token })).status, 200);
  assert.deepEqual((await J(await call('/api/content'))).cats, ['Soirée', 'Rentrée']);
  const cr = await member('creat2@example.com', 'Créa2', 'LIC_PREM_3');
  const r = await J(await call('/api/community', { method: 'POST', body: { title: 'Rentrée chic', items: [{ n: 'Santal 33', h: 'Le Labo' }, { n: 'Tam Dao', h: 'Diptyque' }], cat: 'Rentrée' }, token: cr.token }));
  const r2 = await J(await call('/api/community', { method: 'POST', body: { title: 'Hors catégorie', items: [{ n: 'Santal 33', h: 'Le Labo' }, { n: 'Tam Dao', h: 'Diptyque' }], cat: 'Inconnue' }, token: cr.token }));
  const items = (await J(await call('/api/community', { token: carl.token }))).items; assert.equal(items.find((x) => x.id === r.id).cat, 'Rentrée'); assert.equal(items.find((x) => x.id === r2.id).cat, '');
});
await t('recherche de membres : par pseudo sans tenir compte des accents ni de la casse, les plus suivis d\'abord, compte requis', async () => {
  assert.equal((await call('/api/members?q=ali')).status, 401);
  const r = await J(await call('/api/members?q=ALI', { token: carl.token })); assert.equal(r.items[0].pseudo, 'Alice'); assert.equal(r.items[0].followers, 1); assert.equal(r.items.some((x) => x.pseudo === 'Bob'), false);
  assert.deepEqual((await J(await call('/api/members?q=cr%C3%A9a', { token: carl.token }))).items.map((x) => x.pseudo).sort(), ['Créa', 'Créa2']);
  const all = await J(await call('/api/members', { token: carl.token })); assert.equal(all.items[0].pseudo, 'Alice'); assert.ok(all.items.length >= 4);
  assert.equal((await J(await call('/api/members?q=' + encodeURIComponent('zzzzzz'), { token: carl.token }))).items.length, 0);
  assert.equal((await J(await call('/api/members?q=carl', { token: carl.token }))).items[0].me, true);
});
await t('wishlist : privée par défaut, publique au choix', async () => {
  await call('/api/wishlist', { method: 'PUT', body: { pub: false, items: [{ n: 'Bois Farine', h: 'Lutens' }] }, token: bob.token });
  assert.equal((await J(await call('/api/u/' + bob.by, { token: carl.token }))).wishlist, null);
  await call('/api/wishlist', { method: 'PUT', body: { pub: true, items: [{ n: 'Bois Farine', h: 'Lutens' }] }, token: bob.token });
  assert.equal((await J(await call('/api/u/' + bob.by, { token: carl.token }))).wishlist[0].n, 'Bois Farine');
});
await t('profil public : listes, coups de cœur, publications', async () => {
  const p = await J(await call('/api/u/' + alice.by, { token: carl.token })); assert.equal(p.lists.length, 1); assert.equal(p.loves[0].stars, 4); assert.equal(p.posts.length, 1); assert.equal(p.following, 0);
});
await t('effacement du compte : abonnements, avis, publications, marque et liens disparaissent', async () => {
  assert.equal((await call('/api/account/delete', { method: 'POST', body: {}, token: alice.token })).status, 200);
  const c = (sql) => D._raw.prepare(sql).get(alice.by + '%').c;
  assert.equal(c('SELECT COUNT(*) AS c FROM follows WHERE a LIKE ? OR b LIKE ?1'), 0); assert.equal(c('SELECT COUNT(*) AS c FROM posts WHERE a LIKE ?'), 0); assert.equal(c('SELECT COUNT(*) AS c FROM links WHERE owner LIKE ?'), 0); assert.equal(c('SELECT COUNT(*) AS c FROM ratings WHERE u LIKE ?'), 0);
  assert.equal(D._raw.prepare('SELECT COUNT(*) AS c FROM ratings').get().c, 0); assert.equal((await call('/api/u/' + alice.by)).status, 404);
});
await t('sans base D1, le réseau répond proprement', async () => {
  const w2 = makeWorker({ client: {}, fetch: fetchMock }); const r = await w2.fetch(new Request('https://demo.test/api/feed', { headers: { 'cf-connecting-ip': '9.9.9.9' } }), { ...env, DB: undefined }); assert.equal(r.status, 503);
});
await t('indépendance de l\'IA : le moteur et les prompts ne lisent rien du réseau, des marques ou du sponsoring', async () => {
  const txt = fs.readFileSync(new URL('../src/prompt.mjs', import.meta.url), 'utf8'); assert.doesNotMatch(txt, /social|brand|sponsor|affili|follows|posts/i);
  const idx = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8'); for (const route of ['/api/day', '/api/need', '/api/chat', '/api/identify']) { const i = idx.indexOf(`'${route}'`); const seg = idx.slice(i, i + 5000).split('\n      if (url.pathname')[0]; assert.doesNotMatch(seg, /social\.|brandOf|env\.DB/, route); }
});
console.log(ok, 'tests réussis');
