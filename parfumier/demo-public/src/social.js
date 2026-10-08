// Réseau de Sillage : abonnements, avis par parfum, publications, fil, profils de marques vérifiées, liens suivis et statistiques.
// Données dans Cloudflare D1 (binding DB). Les statistiques ne contiennent que des compteurs par jour, jamais d'identifiant de lecteur.
// Les conseils de l'IA ne lisent RIEN de ce module : le contenu de marque ou sponsorisé n'entre jamais dans les recommandations.
import { outItems, outVideo, goU, cleanUrl, applyAffil } from './pub.js';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS follows (a TEXT NOT NULL, b TEXT NOT NULL, ts INTEGER, PRIMARY KEY (a, b))',
  'CREATE INDEX IF NOT EXISTS follows_b ON follows (b)',
  'CREATE TABLE IF NOT EXISTS ratings (u TEXT NOT NULL, k TEXT NOT NULL, n TEXT, h TEXT, stars INTEGER, txt TEXT, ts INTEGER, PRIMARY KEY (u, k))',
  'CREATE INDEX IF NOT EXISTS ratings_k ON ratings (k)',
  'CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, a TEXT, txt TEXT, img TEXT, video TEXT, vc TEXT, ad INTEGER DEFAULT 0, brand INTEGER DEFAULT 0, ph TEXT, pn TEXT, ts INTEGER, hidden INTEGER DEFAULT 0, reports INTEGER DEFAULT 0)',
  'CREATE INDEX IF NOT EXISTS posts_ts ON posts (ts)',
  'CREATE TABLE IF NOT EXISTS post_reports (id TEXT NOT NULL, u TEXT NOT NULL, PRIMARY KEY (id, u))',
  'CREATE TABLE IF NOT EXISTS brands (acct TEXT PRIMARY KEY, name TEXT, site TEXT, houses TEXT, logo TEXT, bio TEXT, status TEXT, ts INTEGER)',
  'CREATE TABLE IF NOT EXISTS links (code TEXT PRIMARY KEY, url TEXT, owner TEXT, ts INTEGER)',
  'CREATE TABLE IF NOT EXISTS ev (d TEXT NOT NULL, kind TEXT NOT NULL, target TEXT NOT NULL, owner TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (d, kind, target))',
  'CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, post TEXT NOT NULL, u TEXT NOT NULL, txt TEXT, ts INTEGER)',
  'CREATE INDEX IF NOT EXISTS comments_post ON comments (post)',
  'CREATE TABLE IF NOT EXISTS notifs (id TEXT PRIMARY KEY, u TEXT NOT NULL, kind TEXT, frm TEXT, ref TEXT, txt TEXT, ts INTEGER, seen INTEGER DEFAULT 0)',
  'CREATE INDEX IF NOT EXISTS notifs_u ON notifs (u, ts)',
  'CREATE TABLE IF NOT EXISTS sales (id TEXT PRIMARY KEY, code TEXT, owner TEXT, amount INTEGER, commission INTEGER, creator INTEGER, ref TEXT UNIQUE, ts INTEGER, paid INTEGER DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, nrm TEXT, ts INTEGER)',
  'CREATE INDEX IF NOT EXISTS members_nrm ON members (nrm)',
  'CREATE TABLE IF NOT EXISTS wishes (u TEXT PRIMARY KEY, pub INTEGER DEFAULT 0, items TEXT, ts INTEGER)',
];
const READY = new WeakSet();
export const nrm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const pkey = (h, n) => nrm(h) + '|' + nrm(n);
const BAD = /(https?:|www\.|@|\.(com|fr|net|org|io|ru)\b|connard|salope|\bpute\b|enculé|encule|nazi|\bfdp\b|\bntm\b|\bpd\b|nègre|negre)/i;
const IMG_RE = /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const jp = (t, d) => { try { return t ? JSON.parse(t) : d; } catch (e) { return d; } };
const day = (o = 0) => new Date(Date.now() - o * 864e5).toISOString().slice(0, 10);

export function makeSocial(h) {
  const { kv, env, reply, clean, randHex, fullSha, acc } = h, db = env.DB;
  const adminEmails = String(env.ADMIN_EMAILS || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const init = async () => { if (!READY.has(db)) { await db.batch(SCHEMA.map((q) => db.prepare(q))); READY.add(db); } };
  const q = (sql, ...a) => db.prepare(sql).bind(...a);
  const rate = async (who, name, n) => { const k = `rl:${name}:${who}:${new Date().toISOString().slice(0, 13)}`, c = parseInt(await kv.get(k), 10) || 0; if (c >= n) return false; await kv.put(k, String(c + 1), { expirationTtl: 7200 }); return true; };
  const count = async (id, d) => { const r = await q('INSERT INTO ev (d, kind, target, owner, n) VALUES (?, ?, ?, ?, 1) ON CONFLICT (d, kind, target) DO UPDATE SET n = n + 1', d, ...id).run(); return r; };

  const notify = async (u, kind, frm, ref, txt, id) => { if (!u || u === frm) return; await q('INSERT OR IGNORE INTO notifs (id, u, kind, frm, ref, txt, ts) VALUES (?, ?, ?, ?, ?, ?, ?)', id || randHex(8), u, kind, frm || '', ref || '', txt || '', Date.now()).run(); };
  const PLATFORM_CUT = Math.min(100, Math.max(0, parseInt(env.PLATFORM_CUT, 10) >= 0 ? parseInt(env.PLATFORM_CUT, 10) : 20));
  // ---- Outils partagés
  const acctOf = (id) => acc.acctOf(id);
  const prof = async (id) => jp(await kv.get(`prof:${id}`), {});
  const isAdmin = async (id) => { const a = await acctOf(id); return !!a && adminEmails.includes(a.email); };
  async function brandOf(id) {
    const b = await q('SELECT * FROM brands WHERE acct = ?', id).first(); if (!b) return null;
    let ok = false;
    if (b.status === 'verified') { const a = await acctOf(id), pl = await acc.planOf(id, a && a.email); ok = pl.plan === 'brand' || pl.plan === 'admin'; }
    return { name: b.name, site: b.site, houses: jp(b.houses, []), logo: b.logo || '', bio: b.bio || '', status: b.status, badge: ok };
  }
  async function author(id, cache) {
    if (cache[id]) return cache[id];
    const p = await prof(id), b = await brandOf(id), brand = b && b.badge ? b : null;
    return (cache[id] = { by: id.slice(0, 12), pseudo: brand ? brand.name : p.pseudo || '', avatar: brand ? brand.logo || p.avatar || '' : p.avatar || '', brand: !!brand });
  }
  const resolve = async (by) => (/^[a-f0-9]{12}$/.test(by || '') ? kv.get('by:' + by) : null);
  async function eachComm(fn) { let cursor, n = 0; do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jp(await kv.get(k.name), null); if (r && !r.hidden) { fn(r); n++; } } cursor = page.list_complete || n >= 300 ? undefined : page.cursor; } while (cursor); }
  const pubList = (r) => ({ id: r.id, title: r.title, desc: r.desc, cover: r.cover || '', cat: r.cat || '', items: outItems(r.items), video: outVideo(r), ad: !!r.ad, likes: r.likes || 0, ts: r.ts });
  const postView = async (p, cache) => ({ cc: (await q('SELECT COUNT(*) AS n FROM comments WHERE post = ?', p.id).first()).n, t: 'post', id: p.id, ts: p.ts, author: await author(p.a, cache), txt: p.txt, img: p.img || '', video: goU(p.vc, p.video), ad: !!p.ad, brand: !!p.brand, ph: p.ph || '', pn: p.pn || '' });

  async function handle(request, url) {
    const path = url.pathname, method = request.method;
    const mine = /^\/api\/(follow|following|followers|members|notifs|comment|conversion|feed|post|posts|rating|ratings|u|wishlist|brand|my|view|go|admin\/brands|admin\/posts|admin\/sales)(\/|$)/.test(path);
    if (!mine) return null;
    if (!db) return reply({ code: 'social_off' }, 503);
    await init();
    const a = await acc.auth(request), body = async () => { try { return await request.json(); } catch (e) { return null; } };
    const ipH = h.ipHash || 'x';
    const need = () => reply({ code: 'auth' }, 401);

    // ---- Lien suivi : on compte le clic puis on redirige. Aucun identifiant de lecteur n'est gardé.
    let m = path.match(/^\/api\/go\/([a-f0-9]{10})$/);
    if (m && method === 'GET') {
      const l = await q('SELECT * FROM links WHERE code = ?', m[1]).first(); if (!l) return reply({ code: 'not_found' }, 404);
      if (await rate(ipH, 'go', 120)) await count(['click', 'l:' + l.code, l.owner], day());
      const dest = applyAffil(env.AFFIL_RULES, l.url, l.code);
      return new Response(null, { status: 302, headers: { location: dest.url, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
    }
    // ---- Vues (sans compte) : un compteur par jour et par cible
    if (path === '/api/view' && method === 'POST') {
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      if (!(await rate(ipH, 'view', 200))) return reply({ ok: true });
      const d = day();
      for (const id of (Array.isArray(b.posts) ? b.posts : []).slice(0, 30)) { if (!/^[a-z0-9]{6,24}$/i.test(id)) continue; const p = await q('SELECT a FROM posts WHERE id = ? AND hidden = 0', id).first(); if (p) await count(['view', 'post:' + id, p.a], d); }
      if (b.h || b.n) { const k = pkey(b.h, b.n); if (k.length > 3 && k.length < 160) await count(['view', 'p:' + k, ''], d); }
      return reply({ ok: true });
    }
    // ---- Vente remontée par un réseau d'affiliation (Awin, Impact…) : la commission est partagée entre le créateur et Sillage
    if (path === '/api/conversion' && (method === 'POST' || method === 'GET')) {
      if (!env.CONV_SECRET || url.searchParams.get('key') !== env.CONV_SECRET) return reply({ code: 'forbidden' }, 403);
      const b = method === 'POST' ? (await body()) || {} : Object.fromEntries(url.searchParams);
      const code = String(b.code || b.sub || '').toLowerCase(), amount = Math.round(parseFloat(String(b.amount || '0').replace(',', '.')) * 100), com = Math.round(parseFloat(String(b.commission || '0').replace(',', '.')) * 100), ref = String(b.ref || b.order || '').slice(0, 80);
      const l = /^[a-f0-9]{10}$/.test(code) ? await q('SELECT owner FROM links WHERE code = ?', code).first() : null;
      if (!l || !(com > 0) || !ref) return reply({ code: 'bad_op' }, 400);
      const creator = Math.floor(com * (100 - PLATFORM_CUT) / 100);
      const r = await q('INSERT OR IGNORE INTO sales (id, code, owner, amount, commission, creator, ref, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', randHex(8), code, l.owner, amount, com, creator, ref, Date.now()).run();
      if (r.meta && r.meta.changes) await notify(l.owner, 'sale', '', code, (creator / 100).toFixed(2).replace('.', ',') + ' € de commission');
      return reply({ ok: true, creator, platform: com - creator });
    }
    // ---- Profil public d'un membre, d'une marque
    m = path.match(/^\/api\/u\/([a-f0-9]{12})$/);
    if (m && method === 'GET') {
      const id = await resolve(m[1]); if (!id) return reply({ code: 'not_found' }, 404);
      const cache = {}, au = await author(id, cache), p = await prof(id), b = await brandOf(id);
      const fl = await q('SELECT COUNT(*) AS n FROM follows WHERE b = ?', id).first(), fg = await q('SELECT COUNT(*) AS n FROM follows WHERE a = ?', id).first();
      const iF = a ? !!(await q('SELECT 1 AS x FROM follows WHERE a = ? AND b = ?', a.id, id).first()) : false;
      const lists = []; await eachComm((r) => { if (r.author === id) lists.push(pubList(r)); }); lists.sort((x, y) => y.ts - x.ts);
      const loves = (await q('SELECT n, h, stars, txt, ts FROM ratings WHERE u = ? ORDER BY stars DESC, ts DESC LIMIT 12', id).all()).results;
      const posts = []; for (const r of (await q('SELECT * FROM posts WHERE a = ? AND hidden = 0 ORDER BY ts DESC LIMIT 10', id).all()).results) posts.push(await postView(r, cache));
      const w = await q('SELECT pub, items FROM wishes WHERE u = ?', id).first();
      return reply({ profile: { by: m[1], pseudo: au.pseudo, avatar: au.avatar, bio: b && b.badge ? b.bio : p.bio || '', links: b && b.badge ? [b.site].filter(Boolean) : p.links || [], brand: au.brand }, followers: fl.n, following: fg.n, iFollow: iF, mine: !!a && a.id === id, lists, loves, posts, wishlist: w && w.pub ? jp(w.items, []) : null });
    }
    if (!a) return need();
    const acct = await acctOf(a.id); if (!acct) return need();
    const me = await prof(a.id); await kv.put('by:' + a.id.slice(0, 12), a.id);
    const admin = adminEmails.includes(acct.email), verified = acct.verified !== false;

    // ---- Abonnements
    if (path === '/api/follow' && method === 'POST') {
      const b = await body(); const id = await resolve(b && b.by); if (!id) return reply({ code: 'not_found' }, 404);
      if (id === a.id) return reply({ code: 'self' }, 400);
      if (!(await rate(a.id, 'fol', 60))) return reply({ code: 'rate' }, 429);
      if (b.on === false) await q('DELETE FROM follows WHERE a = ? AND b = ?', a.id, id).run();
      else { const n = await q('SELECT COUNT(*) AS n FROM follows WHERE a = ?', a.id).first(); if (n.n >= 1000) return reply({ code: 'limit' }, 409); const fr = await q('INSERT OR IGNORE INTO follows (a, b, ts) VALUES (?, ?, ?)', a.id, id, Date.now()).run(); if (fr.meta && fr.meta.changes) await notify(id, 'follow', a.id, '', '', 'f:' + a.id + ':' + id); }
      const f = await q('SELECT COUNT(*) AS n FROM follows WHERE b = ?', id).first();
      return reply({ ok: true, following: b.on !== false, followers: f.n });
    }
    if (path === '/api/following' && method === 'GET') {
      const cache = {}, out = []; for (const r of (await q('SELECT b FROM follows WHERE a = ? ORDER BY ts DESC LIMIT 200', a.id).all()).results) out.push(await author(r.b, cache));
      return reply({ items: out });
    }
    // ---- Recherche de membres : par pseudo (ou nom de marque vérifiée), les plus suivis d'abord
    if (path === '/api/members' && method === 'GET') {
      const t0 = nrm(url.searchParams.get('q') || '').slice(0, 40), cache = {}, ids = new Set(), out = [];
      const rows = t0 ? (await q('SELECT m.id AS id, (SELECT COUNT(*) FROM follows f WHERE f.b = m.id) AS n FROM members m WHERE m.nrm LIKE ? ORDER BY n DESC, m.ts DESC LIMIT 20', '%' + t0 + '%').all()).results
        : (await q('SELECT m.id AS id, (SELECT COUNT(*) FROM follows f WHERE f.b = m.id) AS n FROM members m ORDER BY n DESC, m.ts DESC LIMIT 20').all()).results;
      for (const r of rows) ids.add(r.id);
      if (t0) for (const r of (await q('SELECT acct FROM brands WHERE status = \'verified\' LIMIT 100').all()).results) { /* filtrage après calcul du nom affiché */ ids.add(r.acct); }
      for (const id of ids) { const au = await author(id, cache); if (!au.pseudo) continue; if (t0 && !nrm(au.pseudo).includes(t0) && !nrm((await prof(id)).pseudo || '').includes(t0)) continue; const n = (await q('SELECT COUNT(*) AS n FROM follows WHERE b = ?', id).first()).n; out.push(Object.assign({ followers: n, me: id === a.id }, au)); }
      out.sort((x, y) => y.followers - x.followers); return reply({ items: out.slice(0, 20) });
    }
    if (path === '/api/followers' && method === 'GET') {
      const cache = {}, out = []; for (const r of (await q('SELECT a FROM follows WHERE b = ? ORDER BY ts DESC LIMIT 200', a.id).all()).results) out.push(await author(r.a, cache));
      return reply({ items: out });
    }
    // ---- Notifications : nouveaux abonnés, commentaires, ventes
    if (path === '/api/notifs' && method === 'GET') {
      const un = (await q('SELECT COUNT(*) AS n FROM notifs WHERE u = ? AND seen = 0', a.id).first()).n;
      if (url.searchParams.get('count')) return reply({ unread: un });
      const cache = {}, items = []; for (const r of (await q('SELECT * FROM notifs WHERE u = ? ORDER BY ts DESC LIMIT 40', a.id).all()).results) items.push({ id: r.id, kind: r.kind, ref: r.ref, txt: r.txt, ts: r.ts, seen: !!r.seen, author: r.frm ? await author(r.frm, cache) : null });
      return reply({ items, unread: un });
    }
    if (path === '/api/notifs/read' && method === 'POST') { await q('UPDATE notifs SET seen = 1 WHERE u = ?', a.id).run(); return reply({ ok: true }); }
    // ---- Commentaires sous une publication
    m = path.match(/^\/api\/post\/([a-f0-9]{16})\/comments$/);
    if (m && method === 'GET') {
      const cache = {}, items = []; for (const r of (await q('SELECT * FROM comments WHERE post = ? ORDER BY ts ASC LIMIT 100', m[1]).all()).results) items.push({ id: r.id, txt: r.txt, ts: r.ts, author: await author(r.u, cache) });
      return reply({ items });
    }
    if (m && method === 'POST') {
      const p = await q('SELECT a FROM posts WHERE id = ? AND hidden = 0', m[1]).first(); if (!p) return reply({ code: 'not_found' }, 404);
      const b = await body(), txt = clean(b && b.txt, 300); if (txt.length < 2) return reply({ code: 'content' }, 400);
      if (!me.pseudo) return reply({ code: 'pseudo' }, 400); if (!verified) return reply({ code: 'verify' }, 403);
      if (BAD.test(txt)) return reply({ code: 'rules' }, 400); if (!(await rate(a.id, 'cmt', 30))) return reply({ code: 'rate' }, 429);
      const id = randHex(8); await q('INSERT INTO comments (id, post, u, txt, ts) VALUES (?, ?, ?, ?, ?)', id, m[1], a.id, txt, Date.now()).run();
      await notify(p.a, 'comment', a.id, m[1], txt.slice(0, 80)); return reply({ ok: true, id });
    }
    m = path.match(/^\/api\/comment\/([a-f0-9]{16})$/);
    if (m && method === 'DELETE') {
      const c = await q('SELECT c.u AS u, p.a AS pa FROM comments c LEFT JOIN posts p ON p.id = c.post WHERE c.id = ?', m[1]).first(); if (!c) return reply({ code: 'not_found' }, 404);
      if (c.u !== a.id && c.pa !== a.id && !admin) return reply({ code: 'forbidden' }, 403); await q('DELETE FROM comments WHERE id = ?', m[1]).run(); return reply({ ok: true });
    }
    // ---- Fil : publications, listes publiques et avis commentés, du plus récent au plus ancien
    if (path === '/api/feed' && method === 'GET') {
      const before = parseInt(url.searchParams.get('before'), 10) || Date.now() + 1, follow = url.searchParams.get('scope') === 'follow', cache = {};
      const fset = new Set((await q('SELECT b FROM follows WHERE a = ?', a.id).all()).results.map((r) => r.b)); fset.add(a.id);
      const items = [];
      const pr = follow ? await q('SELECT * FROM posts WHERE hidden = 0 AND ts < ? AND a IN (SELECT b FROM follows WHERE a = ?) UNION ALL SELECT * FROM posts WHERE hidden = 0 AND ts < ? AND a = ? ORDER BY ts DESC LIMIT 30', before, a.id, before, a.id).all() : await q('SELECT * FROM posts WHERE hidden = 0 AND ts < ? ORDER BY ts DESC LIMIT 30', before).all();
      for (const p of pr.results) items.push(await postView(p, cache));
      const lists = []; await eachComm((r) => { if (r.ts < before && (!follow || fset.has(r.author))) lists.push(r); });
      for (const r of lists) items.push(Object.assign({ t: 'list', author: await author(r.author, cache) }, pubList(r)));
      if (follow) { const rr = await q('SELECT * FROM ratings WHERE txt != \'\' AND ts < ? AND u IN (SELECT b FROM follows WHERE a = ?) ORDER BY ts DESC LIMIT 20', before, a.id).all(); for (const r of rr.results) items.push({ t: 'rating', id: r.u.slice(0, 8) + r.k, ts: r.ts, author: await author(r.u, cache), n: r.n, h: r.h, stars: r.stars, txt: r.txt }); }
      items.sort((x, y) => y.ts - x.ts); const page = items.slice(0, 30);
      return reply({ items: page, next: page.length === 30 ? page[29].ts : 0 });
    }
    // ---- Publications
    if (path === '/api/post' && method === 'POST') {
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      if (!verified) return reply({ code: 'verify' }, 403); if (!me.pseudo) return reply({ code: 'pseudo' }, 400);
      const br = await brandOf(a.id), pl = await acc.planOf(a.id, acct.email), isBrand = !!(br && br.badge);
      if (!isBrand && !pl.plan.match(/^(premium|founder|admin|brand)$/)) return reply({ code: 'plan' }, 403);
      const txt = clean(b.txt, 600), video = b.video ? cleanUrl(b.video) : '';
      if (txt.length < 3 && !b.img && !video) return reply({ code: 'content' }, 400);
      if (BAD.test(txt)) return reply({ code: 'rules' }, 400);
      if (b.img && !(typeof b.img === 'string' && b.img.length <= 60000 && IMG_RE.test(b.img))) return reply({ code: 'image' }, 400);
      if (!(await rate(a.id, 'post', 10))) return reply({ code: 'rate' }, 429);
      const id = randHex(8), vc = video ? await regLink(a.id, video) : '';
      await q('INSERT INTO posts (id, a, txt, img, video, vc, ad, brand, ph, pn, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', id, a.id, txt, b.img || '', video, vc, isBrand || b.ad ? 1 : 0, isBrand ? 1 : 0, clean(b.h, 60), clean(b.n, 80), Date.now()).run();
      return reply({ ok: true, id });
    }
    m = path.match(/^\/api\/post\/([a-f0-9]{16})(\/report)?$/);
    if (m) {
      const p = await q('SELECT * FROM posts WHERE id = ?', m[1]).first(); if (!p) return reply({ code: 'not_found' }, 404);
      if (method === 'DELETE' && !m[2]) { if (p.a !== a.id && !admin) return reply({ code: 'forbidden' }, 403); await q('DELETE FROM posts WHERE id = ?', m[1]).run(); await q('DELETE FROM comments WHERE post = ?', m[1]).run(); return reply({ ok: true }); }
      if (method === 'POST' && m[2]) {
        const r = await q('INSERT OR IGNORE INTO post_reports (id, u) VALUES (?, ?)', m[1], a.id).run();
        if (r.meta && r.meta.changes) await q('UPDATE posts SET reports = reports + 1, hidden = CASE WHEN reports + 1 >= 3 THEN 1 ELSE hidden END WHERE id = ?', m[1]).run();
        return reply({ ok: true });
      }
    }
    // ---- Avis par parfum : mon avis, ceux de mes abonnements, la moyenne
    if (path === '/api/rating' && method === 'PUT') {
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const n = clean(b.n, 80), hh = clean(b.h, 60), stars = Math.round(Number(b.stars)), txt = clean(b.txt, 400);
      if (n.length < 2 || !(stars >= 1 && stars <= 5)) return reply({ code: 'content' }, 400);
      if (!me.pseudo) return reply({ code: 'pseudo' }, 400); if (!verified) return reply({ code: 'verify' }, 403);
      if (txt && BAD.test(txt)) return reply({ code: 'rules' }, 400);
      if (!(await rate(a.id, 'rat', 60))) return reply({ code: 'rate' }, 429);
      await q('INSERT INTO ratings (u, k, n, h, stars, txt, ts) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (u, k) DO UPDATE SET stars = excluded.stars, txt = excluded.txt, ts = excluded.ts, n = excluded.n, h = excluded.h', a.id, pkey(hh, n), n, hh, stars, txt, Date.now()).run();
      return reply({ ok: true });
    }
    if (path === '/api/rating' && method === 'DELETE') { await q('DELETE FROM ratings WHERE u = ? AND k = ?', a.id, pkey(url.searchParams.get('h'), url.searchParams.get('n'))).run(); return reply({ ok: true }); }
    if (path === '/api/ratings' && method === 'GET') {
      const k = pkey(url.searchParams.get('h'), url.searchParams.get('n')), cache = {};
      const agg = await q('SELECT COUNT(*) AS c, AVG(stars) AS v FROM ratings WHERE k = ?', k).first();
      const my = await q('SELECT stars, txt FROM ratings WHERE u = ? AND k = ?', a.id, k).first();
      const fr = []; for (const r of (await q('SELECT u, stars, txt, ts FROM ratings WHERE k = ? AND u IN (SELECT b FROM follows WHERE a = ?) ORDER BY ts DESC LIMIT 20', k, a.id).all()).results) fr.push({ author: await author(r.u, cache), stars: r.stars, txt: r.txt, ts: r.ts });
      return reply({ mine: my || null, friends: fr, count: agg.c, avg: agg.v ? Math.round(agg.v * 10) / 10 : 0 });
    }
    // ---- Ma wishlist, privée ou publique
    if (path === '/api/wishlist' && method === 'PUT') {
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 200).map((x) => ({ n: clean(x && x.n, 80), h: clean(x && x.h, 60) })).filter((x) => x.n.length >= 2);
      await q('INSERT INTO wishes (u, pub, items, ts) VALUES (?, ?, ?, ?) ON CONFLICT (u) DO UPDATE SET pub = excluded.pub, items = excluded.items, ts = excluded.ts', a.id, b.pub ? 1 : 0, JSON.stringify(items), Date.now()).run();
      return reply({ ok: true, pub: !!b.pub });
    }
    if (path === '/api/wishlist' && method === 'GET') { const w = await q('SELECT pub FROM wishes WHERE u = ?', a.id).first(); return reply({ pub: !!(w && w.pub) }); }
    // ---- Marques : demande de profil, espace marque et statistiques
    if (path === '/api/brand/apply' && method === 'POST') {
      const b = await body(); if (!b) return reply({ code: 'json' }, 400); if (!verified) return reply({ code: 'verify' }, 403);
      const name = clean(b.name, 60), site = cleanUrl(b.site), houses = (Array.isArray(b.houses) ? b.houses : String(b.houses || '').split(',')).map((x) => clean(x, 60)).filter(Boolean).slice(0, 10);
      if (name.length < 2 || !site) return reply({ code: 'content' }, 400);
      const logo = typeof b.logo === 'string' && b.logo.length <= 60000 && IMG_RE.test(b.logo) ? b.logo : '';
      if (!(await rate(a.id, 'brand', 5))) return reply({ code: 'rate' }, 429);
      await q('INSERT INTO brands (acct, name, site, houses, logo, bio, status, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (acct) DO UPDATE SET name = excluded.name, site = excluded.site, houses = excluded.houses, logo = excluded.logo, bio = excluded.bio, ts = excluded.ts, status = CASE WHEN brands.status = \'verified\' THEN \'verified\' ELSE \'pending\' END', a.id, name, site, JSON.stringify(houses), logo, clean(b.bio, 240), 'pending', Date.now()).run();
      if (adminEmails.length && h.sendMail) await h.sendMail(adminEmails, 'Sillage : demande de profil marque', `<p><b>${name.replace(/</g, '&lt;')}</b> (${site})</p><p>À valider dans le profil, bloc Suivi de l'éditeur.</p>`);
      return reply({ ok: true });
    }
    if (path === '/api/brand/me' && method === 'GET') {
      const br = await brandOf(a.id); if (!br) return reply({ brand: null });
      const out = { brand: br };
      if (br.badge || admin) {
        const from = day(30), posts = (await q('SELECT id, txt, ts FROM posts WHERE a = ? ORDER BY ts DESC LIMIT 10', a.id).all()).results, ps = [];
        for (const p of posts) { const v = await q('SELECT COALESCE(SUM(n), 0) AS n FROM ev WHERE kind = \'view\' AND target = ? AND d >= ?', 'post:' + p.id, from).first(); ps.push({ id: p.id, txt: p.txt.slice(0, 80), ts: p.ts, views: v.n }); }
        const links = (await q('SELECT l.url AS url, COALESCE(SUM(e.n), 0) AS n FROM links l LEFT JOIN ev e ON e.target = \'l:\' || l.code AND e.d >= ? WHERE l.owner = ? GROUP BY l.code ORDER BY n DESC LIMIT 20', from, a.id).all()).results;
        let pv = 0; const top = []; for (const hs of br.houses.map(nrm).filter(Boolean)) { const rows = (await q('SELECT target, SUM(n) AS n FROM ev WHERE kind = \'view\' AND target LIKE ? AND d >= ? GROUP BY target ORDER BY n DESC LIMIT 5', 'p:' + hs + '|%', from).all()).results; rows.forEach((r) => { pv += r.n; top.push({ k: r.target.slice(2), n: r.n }); }); }
        out.stats = { days: 30, posts: ps, links, perfumeViews: pv, topPerfumes: top.sort((x, y) => y.n - x.n).slice(0, 8) };
      }
      return reply(out);
    }
    // ---- Créateurs : mes clics sur mes liens
    if (path === '/api/my/stats' && method === 'GET') {
      const from = day(30);
      const links = (await q('SELECT l.url AS url, COALESCE(SUM(e.n), 0) AS n FROM links l LEFT JOIN ev e ON e.target = \'l:\' || l.code AND e.d >= ? WHERE l.owner = ? GROUP BY l.code ORDER BY n DESC LIMIT 30', from, a.id).all()).results;
      const v = await q('SELECT COALESCE(SUM(n), 0) AS n FROM ev WHERE kind = \'view\' AND owner = ? AND d >= ?', a.id, from).first();
      const f = await q('SELECT COUNT(*) AS n FROM follows WHERE b = ?', a.id).first();
      const sl = await q('SELECT COUNT(*) AS n, COALESCE(SUM(creator), 0) AS c, COALESCE(SUM(CASE WHEN paid = 0 THEN creator ELSE 0 END), 0) AS due FROM sales WHERE owner = ?', a.id).first();
      return reply({ days: 30, links, postViews: v.n, followers: f.n, sales: { n: sl.n, earned: sl.c / 100, due: sl.due / 100, share: 100 - PLATFORM_CUT } });
    }
    // ---- Éditeur : valider les marques, rétablir ou supprimer les publications signalées
    if (path === '/api/admin/brands' && method === 'GET') {
      if (!admin) return reply({ code: 'forbidden' }, 403);
      const rows = (await q('SELECT * FROM brands ORDER BY ts DESC LIMIT 100').all()).results;
      return reply({ items: rows.map((r) => ({ by: r.acct.slice(0, 12), name: r.name, site: r.site, houses: jp(r.houses, []), bio: r.bio, status: r.status })) });
    }
    m = path.match(/^\/api\/admin\/brands\/([a-f0-9]{12})$/);
    if (m && method === 'POST') {
      if (!admin) return reply({ code: 'forbidden' }, 403);
      const b = await body(), id = await resolve(m[1]); if (!id || !b || !['verify', 'refuse', 'revoke'].includes(b.action)) return reply({ code: 'bad_op' }, 400);
      await q('UPDATE brands SET status = ? WHERE acct = ?', b.action === 'verify' ? 'verified' : 'refused', id).run(); if (b.action === 'verify') await notify(id, 'brand', '', '', 'Ton profil marque est vérifié.'); return reply({ ok: true });
    }
    if (path === '/api/admin/sales' && method === 'GET') {
      if (!admin) return reply({ code: 'forbidden' }, 403);
      const tot = await q('SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS amount, COALESCE(SUM(commission), 0) AS com, COALESCE(SUM(creator), 0) AS cr FROM sales').first();
      const due = (await q('SELECT owner, SUM(creator) AS d FROM sales WHERE paid = 0 GROUP BY owner HAVING d > 0 ORDER BY d DESC LIMIT 50').all()).results, cache = {}, items = [];
      for (const r of due) items.push({ author: await author(r.owner, cache), due: r.d / 100 });
      return reply({ sales: tot.n, amount: tot.amount / 100, commission: tot.com / 100, creators: tot.cr / 100, platform: (tot.com - tot.cr) / 100, cut: PLATFORM_CUT, due: items });
    }
    m = path.match(/^\/api\/admin\/sales\/pay\/([a-f0-9]{12})$/);
    if (m && method === 'POST') {
      if (!admin) return reply({ code: 'forbidden' }, 403); const id = await resolve(m[1]); if (!id) return reply({ code: 'not_found' }, 404);
      const d = await q('SELECT COALESCE(SUM(creator), 0) AS d FROM sales WHERE owner = ? AND paid = 0', id).first(); await q('UPDATE sales SET paid = 1 WHERE owner = ?', id).run(); return reply({ ok: true, paid: d.d / 100 });
    }
    if (path === '/api/admin/posts' && method === 'GET') {
      if (!admin) return reply({ code: 'forbidden' }, 403);
      const cache = {}, items = []; for (const p of (await q('SELECT * FROM posts WHERE reports > 0 OR hidden = 1 ORDER BY ts DESC LIMIT 50').all()).results) items.push(Object.assign(await postView(p, cache), { reports: p.reports, hidden: !!p.hidden }));
      return reply({ items });
    }
    m = path.match(/^\/api\/admin\/posts\/([a-f0-9]{16})$/);
    if (m && method === 'POST') {
      if (!admin) return reply({ code: 'forbidden' }, 403); const b = await body();
      if (b && b.action === 'delete') await q('DELETE FROM posts WHERE id = ?', m[1]).run(); else if (b && b.action === 'restore') await q('UPDATE posts SET hidden = 0, reports = 0 WHERE id = ?', m[1]).run(); else return reply({ code: 'bad_op' }, 400);
      return reply({ ok: true });
    }
    return null;
  }

  // Annuaire des membres : le pseudo (sans accents ni majuscules) pour la recherche.
  async function indexMember(id, pseudo) { if (!db) return; await init(); if (!pseudo) await q('DELETE FROM members WHERE id = ?', id).run(); else await q('INSERT INTO members (id, nrm, ts) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET nrm = excluded.nrm', id, nrm(pseudo), Date.now()).run(); }
  // Lien enregistré pour son auteur : le code est stable, le même lien donne toujours le même code.
  async function regLink(owner, u) {
    if (!db || !u) return ''; await init();
    const code = (await fullSha('go' + owner + u)).slice(0, 10);
    await q('INSERT OR IGNORE INTO links (code, url, owner, ts) VALUES (?, ?, ?, ?)', code, u, owner, Date.now()).run(); return code;
  }
  // Effacement du compte : tout ce qui le concerne part (les compteurs de clics restent, ils sont anonymes).
  async function erase(id) {
    if (!db) return; await init();
    await db.batch([q('DELETE FROM follows WHERE a = ? OR b = ?', id, id), q('DELETE FROM ratings WHERE u = ?', id), q('DELETE FROM posts WHERE a = ?', id), q('DELETE FROM post_reports WHERE u = ?', id), q('DELETE FROM wishes WHERE u = ?', id), q('DELETE FROM brands WHERE acct = ?', id), q('DELETE FROM links WHERE owner = ?', id), q('DELETE FROM members WHERE id = ?', id), q('DELETE FROM comments WHERE u = ?', id), q('DELETE FROM notifs WHERE u = ? OR frm = ?', id, id), q('DELETE FROM sales WHERE owner = ? AND paid = 1', id)]);
  }
  return { handle, regLink, erase, indexMember };
}

// Sauvegarde : toutes les tables, en JSON.
export async function dumpD1(db) {
  if (!db) return null; if (!READY.has(db)) { await db.batch(SCHEMA.map((q) => db.prepare(q))); READY.add(db); }
  const out = {}; for (const t of ['follows', 'ratings', 'posts', 'brands', 'links', 'ev', 'wishes', 'comments', 'notifs', 'sales']) out[t] = (await db.prepare(`SELECT * FROM ${t}`).all()).results;
  return out;
}
