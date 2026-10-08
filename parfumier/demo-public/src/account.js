// Sillage : comptes, abonnements Whop, profil, inspirations de la communauté, éditeur public.
// Tout ce qui touche à l'argent et aux droits vit ici, côté serveur : le navigateur ne décide jamais de ce qu'on a le droit de faire.

// Ce que chaque offre permet. Les chiffres viennent de l'analyse de rentabilité (docs/RENTABILITE.md) ; ajuste-les ici, rien d'autre à changer.
export const PLANS = {
  free: { label: 'Gratuit', adv: 3, chat: 20, ident: 15, col: 12, insp: 2, publish: false },
  premium: { label: 'Premium', adv: 40, chat: 200, ident: 150, col: 100000, insp: 30, publish: true },
  founder: { label: 'Membre fondateur', adv: 40, chat: 200, ident: 150, col: 100000, insp: 30, publish: true },
  brand: { label: 'Marque', adv: 40, chat: 200, ident: 150, col: 100000, insp: 30, publish: true },
  admin: { label: 'Éditeur', adv: 100000, chat: 100000, ident: 100000, col: 100000, insp: 100000, publish: true },
};
const GOOD_STATUS = ['active', 'trialing', 'past_due', 'completed'];   // Whop : past_due = période de grâce, completed = achat unique (fondateur)
const RECHECK_MS = 24 * 3600 * 1000;
const PSEUDO_RE = /^[\p{L}\p{N} ._'-]{2,24}$/u;
const AVATAR_RE = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;

const month = () => new Date().toISOString().slice(0, 7);
const jparse = (s, d) => { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };

import { outItems, outVideo, cleanUrl, DEFAULT_CATS } from './pub.js';
import { dumpD1 } from './social.js';
const COVER_RE = /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
export function makeAccount(h) {
  const { kv, env, reply, clean, hex, fullSha, randHex, int, deps, sendMail, track, mailVerify } = h;
  const regLink = h.regLink || (async () => '');
  // Les limites de chaque offre se règlent par variable d'environnement (FREE_ADV, PREMIUM_ADV…), sans toucher au code.
  const plans = Object.fromEntries(Object.entries(PLANS).map(([k, v]) => [k, Object.assign({}, v, ['adv', 'chat', 'ident', 'col', 'insp'].reduce((o, f) => { const e = env[(k === 'founder' ? 'PREMIUM' : k.toUpperCase()) + '_' + f.toUpperCase()]; if (e !== undefined && k !== 'admin') o[f] = int(e, v[f]); return o; }, {}))]));
  const adminEmails = String(env.ADMIN_EMAILS || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const doFetch = deps.fetch || ((...a) => fetch(...a));

  const auth = async (request) => {
    const t = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!/^[a-f0-9]{64}$/.test(t)) return null;
    const id = await kv.get(`sess:${await fullSha(t)}`);
    return id ? { id, token: t } : null;
  };
  const acctOf = async (id) => jparse(await kv.get(`acct:${id}`), null);

  // Whop : on interroge l'API avec la clé de licence (jamais depuis le navigateur). Tout statut hors GOOD_STATUS = pas d'accès.
  async function whopValidate(license) {
    if (!env.WHOP_API_KEY) return { ok: false, code: 'whop_off' };
    let r;
    try { r = await doFetch(`${env.WHOP_API || 'https://api.whop.com/api/v1'}/memberships/${encodeURIComponent(license)}`, { headers: { authorization: `Bearer ${env.WHOP_API_KEY}` } }); } catch (e) { return { ok: false, code: 'whop_net' }; }
    if (r.status === 404) return { ok: false, code: 'license' };
    if (!r.ok) return { ok: false, code: 'whop_net' };
    const m = await r.json().catch(() => null);
    if (!m || typeof m !== 'object') return { ok: false, code: 'whop_net' };
    const map = jparse(env.WHOP_PRODUCTS, {}), plan = map[m.product_id] || map[m.plan_id] || null;
    if (!plan || !plans[plan] || plan === 'free' || plan === 'admin') return { ok: false, code: 'product' };
    return { ok: GOOD_STATUS.includes(m.status), status: m.status, plan, until: m.current_period_end || null, membership: m.id || '' };
  }

  // L'offre réelle d'un compte, revérifiée auprès de Whop au plus une fois par jour : une résiliation retire l'accès sans que personne n'ait à intervenir.
  async function planOf(id, email) {
    if (email && adminEmails.includes(email)) return { plan: 'admin', status: 'admin' };
    const rec = jparse(await kv.get(`plan:${id}`), null);
    if (!rec) return { plan: 'free', status: 'free' };
    if (rec.license && Date.now() - (rec.checkedAt || 0) > RECHECK_MS) {
      const v = await whopValidate(rec.license);
      if (v.code === 'whop_net' || v.code === 'whop_off') { rec.checkedAt = Date.now() - RECHECK_MS + 3600 * 1000; }   // Whop injoignable : on garde l'accès, on réessaie dans une heure
      else { rec.checkedAt = Date.now(); rec.status = v.status || v.code; rec.valid = !!v.ok; if (v.ok) { rec.plan = v.plan; rec.until = v.until; } }
      await kv.put(`plan:${id}`, JSON.stringify(rec));
    }
    if (rec.valid === false) return { plan: 'free', status: rec.status || 'expired', expired: true };
    return { plan: rec.plan in plans ? rec.plan : 'free', status: rec.status || 'active', until: rec.until || null };
  }

  const usageKey = (id) => `u:${id}:${month()}`;
  const usageOf = async (id) => jparse(await kv.get(usageKey(id)), { adv: 0, chat: 0, ident: 0 });

  // Compteur mensuel par compte. null = visiteur sans compte (la démo garde ses essais).
  async function meter(request, kind) {
    const a = await auth(request); if (!a) return null;
    const acct = await acctOf(a.id); if (!acct) return null;
    const p = await planOf(a.id, acct.email), lim = plans[p.plan][kind], u = await usageOf(a.id), unverified = acct.verified === false;
    return { ok: !unverified && u[kind] < lim, verify: unverified, plan: p.plan, left: unverified ? 0 : Math.max(0, lim - u[kind]), commit: async () => { u[kind] += 1; await kv.put(usageKey(a.id), JSON.stringify(u), { expirationTtl: 60 * 60 * 24 * 70 }); } };
  }

  async function me(a) {
    const acct = await acctOf(a.id); if (!acct) return null;
    const p = await planOf(a.id, acct.email), u = await usageOf(a.id), prof = jparse(await kv.get(`prof:${a.id}`), {});
    const L = plans[p.plan];
    return { email: acct.email, verified: acct.verified !== false, plan: p.plan, label: L.label, status: p.status, until: p.until || null, expired: !!p.expired, admin: p.plan === 'admin', limits: { adv: L.adv, chat: L.chat, ident: L.ident, col: L.col, insp: L.insp, publish: L.publish }, usage: u, profile: { pseudo: prof.pseudo || '', avatar: prof.avatar || '', bio: prof.bio || '', links: prof.links || [], by: String(a.id).slice(0, 12) } };
  }

  const cleanItems = (items, max, urls) => (Array.isArray(items) ? items : []).slice(0, max).map((x) => { const o = { n: clean(x && x.n, 80), h: clean(x && x.h, 60) }; if (urls) { const u = cleanUrl(x && x.u); if (u) o.u = u; } return o; }).filter((x) => x.n.length >= 2);

  // Contenu public modifié par l'éditeur (toi seul) : prix, parfums masqués, textes, parfums ajoutés ou retirés d'une playlist.
  const CONTENT_MAX = 400000;
  async function content() { return jparse(await kv.get('content'), { v: 0, price: {}, hide: [], desc: {}, plAdd: {}, plDel: {} }); }
  async function editContent(b) {
    const c = await content(); c.price = c.price || {}; c.hide = c.hide || []; c.desc = c.desc || {}; c.plAdd = c.plAdd || {}; c.plDel = c.plDel || {};
    const key = clean(b.key, 160).toLowerCase(), title = clean(b.title, 80);
    switch (b.op) {
      case 'price': { const p = Math.round(Number(b.p)); if (!key || !(p >= 0 && p <= 20000)) return null; if (p === 0) delete c.price[key]; else c.price[key] = p; break; }
      case 'hide': { if (!key) return null; c.hide = c.hide.filter((x) => x !== key); if (b.hide) c.hide.push(key); break; }
      case 'desc': { if (!key) return null; const t = clean(b.text, 700); if (t) c.desc[key] = t; else delete c.desc[key]; break; }
      case 'plAdd': { const it = cleanItems([{ n: b.n, h: b.h }], 1)[0]; if (!title || !it) return null; const l = (c.plAdd[title] = (c.plAdd[title] || []).filter((x) => !(x.n === it.n && x.h === it.h))); l.push(it); c.plDel[title] = (c.plDel[title] || []).filter((x) => !(x.n === it.n && x.h === it.h)); break; }
      case 'plDel': { const it = cleanItems([{ n: b.n, h: b.h }], 1)[0]; if (!title || !it) return null; c.plAdd[title] = (c.plAdd[title] || []).filter((x) => !(x.n === it.n && x.h === it.h)); const l = (c.plDel[title] = (c.plDel[title] || []).filter((x) => !(x.n === it.n && x.h === it.h))); l.push(it); break; }
      case 'plPos': { const it = cleanItems([{ n: b.n, h: b.h }], 1)[0]; const pos = Math.round(Number(b.pos)); if (!title || !it || !(pos >= 1 && pos <= 500)) return null; c.plPos = c.plPos || {}; c.plPos[title] = (c.plPos[title] || []).filter((x) => !(x.n === it.n && x.h === it.h)); c.plPos[title].push({ n: it.n, h: it.h, pos }); break; }
      case 'cats': { const list = (Array.isArray(b.list) ? b.list : []).map((x) => clean(x, 24)).filter(Boolean).slice(0, 12); if (!list.length) return null; c.cats = [...new Set(list)]; break; }
      default: return null;
    }
    c.v = (c.v || 0) + 1; c.ts = Date.now();
    const text = JSON.stringify(c); if (text.length > CONTENT_MAX) return 'too_big';
    await kv.put('content', text); return c;
  }

  // Règles de la communauté : ni lien, ni adresse, ni insulte. Le reste se règle par signalement.
  const BAD = /(https?:|www\.|@|\.(com|fr|net|org|io|ru)\b|connard|salope|\bpute\b|enculé|encule|nazi|\bfdp\b|\bntm\b|\bpd\b|nègre|negre)/i;
  const breaksRules = (...t) => t.some((x) => BAD.test(String(x || '')));
  const eachKey = async (prefix, fn) => { let cursor; do { const page = await kv.list({ prefix, cursor }); for (const k of page.keys) await fn(k.name); cursor = page.list_complete ? undefined : page.cursor; } while (cursor); };
  // Suppression complète d'un compte : tout ce qui le concerne disparaît (les sauvegardes sont détruites au plus tard 14 jours plus tard).
  async function erase(id) {
    const plan = jparse(await kv.get(`plan:${id}`), null);
    if (plan && plan.license) await kv.delete(`lic:${await fullSha(plan.license)}`);
    for (const k of [`acct:${id}`, `data:${id}`, `prof:${id}`, `plan:${id}`, `by:${id.slice(0, 12)}`]) await kv.delete(k);
    if (h.eraseSocial) await h.eraseSocial(id);
    await eachKey(`u:${id}:`, (k) => kv.delete(k));
    await eachKey('comm:', async (k) => { const r = jparse(await kv.get(k), null); if (r && r.author === id) await kv.delete(k); });
  }

  // Retourne une Response si la route est la sienne, sinon null.
  async function handle(request, url) {
    const path = url.pathname, method = request.method;
    const body = async () => { try { return await request.json(); } catch (e) { return null; } };
    const rate = async (a, name, n, ttl) => { const k = `rl:${name}:${a}:${new Date().toISOString().slice(0, 13)}`, c = int(await kv.get(k), 0); if (c >= n) return false; await kv.put(k, String(c + 1), { expirationTtl: ttl || 7200 }); return true; };

    if (path === '/api/content' && method === 'GET') { const c = await content(); return new Response(JSON.stringify(c), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } }); }

    // ---- Confirmation de l'adresse courriel (lien reçu à l'inscription)
    if (path === '/api/account/verify' && method === 'POST') {
      const b = await body(); const tk = String(b && b.token || ''); if (!/^[a-f0-9]{64}$/.test(tk)) return reply({ code: 'token' }, 400);
      const k = `ver:${await fullSha(tk)}`, id = await kv.get(k); if (!id) return reply({ code: 'token' }, 400);
      const rec = await acctOf(id); if (!rec) return reply({ code: 'token' }, 400);
      if (rec.verified === false) { rec.verified = true; await kv.put(`acct:${id}`, JSON.stringify(rec)); await track('verify'); }
      await kv.delete(k); return reply({ ok: true });
    }
    // ---- Messages au support (connecté ou non)
    if (path === '/api/support' && method === 'POST') {
      const b = await body(); const msg = clean(b && b.message, 1200); if (msg.length < 5) return reply({ code: 'message' }, 400);
      const au = await auth(request), acct0 = au ? await acctOf(au.id) : null, email = acct0 ? acct0.email : clean(b.email, 120).toLowerCase();
      if (!acct0 && !/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return reply({ code: 'email' }, 400);
      const who = au ? au.id : 'anon';
      if (!(await rate(who + h.ipHash, 'sup', 5))) return reply({ code: 'rate' }, 429);
      const id = Date.now().toString(36) + randHex(3);
      await kv.put(`sup:${id}`, JSON.stringify({ id, email, message: msg, kind: clean(b.kind, 20) || 'question', ts: Date.now() }), { expirationTtl: 60 * 60 * 24 * 365 });
      if (adminEmails.length) await sendMail(adminEmails, 'Sillage : nouveau message de ' + email, `<p><b>${email}</b></p><p>${msg.replace(/</g, '&lt;')}</p>`);
      return reply({ ok: true });
    }

    // ---- Liens à partager : une inspiration publique ou le profil public d'un membre, lisibles sans compte
    const shc = path.match(/^\/api\/share\/c\/([a-z0-9]{4,24})$/i), shu = path.match(/^\/api\/share\/u\/([a-f0-9]{12})$/i);
    const pubView = (r, pr) => ({ id: r.id, title: r.title, desc: r.desc, items: outItems(r.items), video: outVideo(r), ad: !!r.ad, cover: r.cover || '', cat: r.cat || '', pseudo: r.pseudo, avatar: (pr || {}).avatar || '', links: (pr || {}).links || [], by: r.author.slice(0, 12), likes: r.likes || 0 });
    if (shc && method === 'GET') { const r = jparse(await kv.get(`comm:${shc[1]}`), null); if (!r || r.hidden) return reply({ code: 'not_found' }, 404); return reply({ item: pubView(r, jparse(await kv.get(`prof:${r.author}`), {})) }); }
    if (shu && method === 'GET') {
      const out = []; let author = '', cursor;
      do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), null); if (r && !r.hidden && r.author.startsWith(shu[1])) { out.push(r); author = r.author; } } cursor = page.list_complete ? undefined : page.cursor; } while (cursor);
      if (!out.length) return reply({ code: 'not_found' }, 404);
      const pr = jparse(await kv.get(`prof:${author}`), {}); out.sort((x, y) => y.ts - x.ts);
      return reply({ profile: { pseudo: pr.pseudo || out[0].pseudo, avatar: pr.avatar || '', bio: pr.bio || '', links: pr.links || [], by: shu[1] }, items: out.map((r) => pubView(r, pr)) });
    }

    const a = await auth(request);
    if (path === '/api/track' && method === 'POST') { if (!a) return reply({ code: 'auth' }, 401); const b = await body(); if (b && ['voyage'].includes(b.e)) await track(b.e); return reply({ ok: true }); }
    if (path === '/api/account/resend' && method === 'POST') {
      if (!a) return reply({ code: 'auth' }, 401); const acct = await acctOf(a.id); if (!acct) return reply({ code: 'auth' }, 401);
      if (acct.verified !== false) return reply({ ok: true, verified: true });
      if (!(await rate(a.id, 'rsd', 3))) return reply({ code: 'rate' }, 429);
      const sent = await mailVerify(a.id, acct.email); return reply({ ok: true, sent });
    }
    // ---- Compte : profil, offre, licence
    if (path === '/api/account/me' && method === 'GET') { if (!a) return reply({ code: 'auth' }, 401); const m = await me(a); return m ? reply(m) : reply({ code: 'auth' }, 401); }
    if (path === '/api/account/activate' && method === 'POST') {
      if (!a) return reply({ code: 'auth' }, 401);
      const b = await body(); const lic = clean(b && b.license, 120);
      if (lic.length < 8) return reply({ code: 'license' }, 400);
      if (!(await rate(a.id, 'act', 8))) return reply({ code: 'rate' }, 429);
      const v = await whopValidate(lic);
      if (!v.ok) return reply({ code: v.code || 'inactive', status: v.status || '' }, v.code === 'whop_off' || v.code === 'whop_net' ? 503 : 400);
      const lk = `lic:${await fullSha(lic)}`, owner = await kv.get(lk);
      if (owner && owner !== a.id) return reply({ code: 'taken' }, 409);
      await kv.put(lk, a.id);
      await kv.put(`plan:${a.id}`, JSON.stringify({ plan: v.plan, license: lic, status: v.status, valid: true, until: v.until, checkedAt: Date.now(), since: Date.now() }));
      await track('activate');
      return reply({ ok: true, me: await me(a) });
    }
    if (path === '/api/account/profile' && method === 'PUT') {
      if (!a) return reply({ code: 'auth' }, 401);
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const prev = jparse(await kv.get(`prof:${a.id}`), {}), pseudo = b.pseudo === undefined ? prev.pseudo || '' : clean(b.pseudo, 24);
      if (pseudo && !PSEUDO_RE.test(pseudo)) return reply({ code: 'pseudo' }, 400);
      let avatar = prev.avatar || '';
      if (b.avatar !== undefined) { if (b.avatar === '') avatar = ''; else if (typeof b.avatar === 'string' && b.avatar.length <= 70000 && AVATAR_RE.test(b.avatar)) avatar = b.avatar; else return reply({ code: 'avatar' }, 400); }
      const links = b.links === undefined ? prev.links || [] : (Array.isArray(b.links) ? b.links : []).slice(0, 3).map(cleanUrl).filter(Boolean);
      if (pseudo) await kv.put(`by:${a.id.slice(0, 12)}`, a.id);
      if (h.indexMember) await h.indexMember(a.id, pseudo);
      await kv.put(`prof:${a.id}`, JSON.stringify({ pseudo, avatar, bio: b.bio === undefined ? prev.bio || '' : clean(b.bio, 140), links }));
      return reply({ ok: true, me: await me(a) });
    }

    // ---- Inspirations de la communauté : publiques seulement quand leur auteur le décide
    if (path === '/api/community' && method === 'GET') {
      if (!a) return reply({ code: 'auth' }, 401);
      const list = []; let cursor;
      do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), null); if (r && !r.hidden) list.push(r); } cursor = page.list_complete || list.length >= 300 ? undefined : page.cursor; } while (cursor);
      list.sort((x, y) => y.ts - x.ts);
      const pc = {}; for (const r of list) if (!pc[r.author]) pc[r.author] = jparse(await kv.get(`prof:${r.author}`), {});
      return reply({ items: list.slice(0, 200).map((r) => ({ id: r.id, title: r.title, desc: r.desc, items: outItems(r.items), video: outVideo(r), ad: !!r.ad, cover: r.cover || '', cat: r.cat || '', pseudo: r.pseudo, avatar: (pc[r.author] || {}).avatar || '', links: (pc[r.author] || {}).links || [], by: r.author.slice(0, 12), ts: r.ts, likes: r.likes || 0, mine: r.author === a.id })) });
    }
    if (path === '/api/community' && method === 'POST') {
      if (!a) return reply({ code: 'auth' }, 401);
      const acct = await acctOf(a.id), p = await planOf(a.id, acct && acct.email), L = plans[p.plan];
      if (!L.publish) return reply({ code: 'plan' }, 403);
      const prof = jparse(await kv.get(`prof:${a.id}`), {}); if (!prof.pseudo) return reply({ code: 'pseudo' }, 400);
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const title = clean(b.title, 60), items = cleanItems(b.items, 30, true); if (title.length < 3 || items.length < 2) return reply({ code: 'content' }, 400);
      if (breaksRules(title, b.desc)) return reply({ code: 'rules' }, 400);
      if (!(await rate(a.id, 'pub', 12))) return reply({ code: 'rate' }, 429);
      const id = clean(b.id, 24).replace(/[^a-z0-9]/gi, '') || randHex(8), prev = jparse(await kv.get(`comm:${id}`), null);
      if (prev && prev.author !== a.id) return reply({ code: 'taken' }, 409);
      if (!prev) { let n = 0, cursor; do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), null); if (r && r.author === a.id) n++; } cursor = page.list_complete ? undefined : page.cursor; } while (cursor); if (n >= 10) return reply({ code: 'limit' }, 409); }
      const cover = b.cover === undefined ? (prev && prev.cover) || '' : (typeof b.cover === 'string' && b.cover.length <= 45000 && COVER_RE.test(b.cover) ? b.cover : '');
      const cats = (await content()).cats || DEFAULT_CATS, cc0 = clean(b.cat, 24), cat = b.cat === undefined ? (prev && prev.cat) || '' : (cats.includes(cc0) ? cc0 : '');
      for (const x of items) if (x.u) x.c = await regLink(a.id, x.u);
      const video = cleanUrl(b.video), vc = video ? await regLink(a.id, video) : '';
      await kv.put(`by:${a.id.slice(0, 12)}`, a.id);
      const rec = { id, author: a.id, pseudo: prof.pseudo, title, desc: clean(b.desc, 240), items, video, vc, cover, cat, ad: !!b.ad, ts: prev ? prev.ts : Date.now(), likes: prev ? prev.likes || 0 : 0, reports: prev ? prev.reports || 0 : 0 };
      await kv.put(`comm:${id}`, JSON.stringify(rec));
      return reply({ ok: true, id });
    }
    const cm = path.match(/^\/api\/community\/([a-z0-9]{4,24})(\/(like|report))?$/i);
    if (cm) {
      if (!a) return reply({ code: 'auth' }, 401);
      const id = cm[1], rec = jparse(await kv.get(`comm:${id}`), null); if (!rec) return reply({ code: 'not_found' }, 404);
      const acct = await acctOf(a.id), isAdmin = !!acct && adminEmails.includes(acct.email);
      if (method === 'DELETE' && !cm[2]) { if (rec.author !== a.id && !isAdmin) return reply({ code: 'forbidden' }, 403); await kv.delete(`comm:${id}`); return reply({ ok: true }); }
      if (method === 'POST' && cm[3] === 'like') { const lk = `cl:${id}:${a.id}`; if (!(await kv.get(lk))) { await kv.put(lk, '1'); rec.likes = (rec.likes || 0) + 1; await kv.put(`comm:${id}`, JSON.stringify(rec)); } return reply({ ok: true, likes: rec.likes }); }
      if (method === 'POST' && cm[3] === 'report') { const rk = `cr:${id}:${a.id}`; if (!(await kv.get(rk))) { await kv.put(rk, '1'); rec.reports = (rec.reports || 0) + 1; if (rec.reports >= 3) rec.hidden = true; await kv.put(`comm:${id}`, JSON.stringify(rec)); } return reply({ ok: true }); }
    }

    // ---- Éditeur (toi seul) : tout ce qui est modifié ici change l'appli pour tout le monde
    if (path === '/api/admin/content' && method === 'PUT') {
      if (!a) return reply({ code: 'auth' }, 401);
      const acct = await acctOf(a.id); if (!acct || !adminEmails.includes(acct.email)) return reply({ code: 'forbidden' }, 403);
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const r = await editContent(b); if (!r) return reply({ code: 'bad_op' }, 400); if (r === 'too_big') return reply({ code: 'too_big' }, 413);
      return reply({ ok: true, v: r.v });
    }
    const adminOnly = async () => { if (!a) return null; const acct = await acctOf(a.id); return acct && adminEmails.includes(acct.email) ? acct : null; };
    if (path === '/api/admin/stats' && method === 'GET') {
      if (!(await adminOnly())) return reply({ code: a ? 'forbidden' : 'auth' }, a ? 403 : 401);
      const out = { accounts: 0, verified: 0, plans: {}, usage: { adv: 0, chat: 0, ident: 0 }, days: [], aiCostUsd: 0 };
      await eachKey('plan:', async (k) => { const r = jparse(await kv.get(k), {}); const p = r.valid === false ? 'expired' : r.plan; out.plans[p] = (out.plans[p] || 0) + 1; });
      await eachKey('acct:', async (k) => { const r = jparse(await kv.get(k), {}); out.accounts++; if (r.verified !== false) out.verified++; });
      await eachKey('u:', async (k) => { if (!k.endsWith(':' + month())) return; const u = jparse(await kv.get(k), {}); out.usage.adv += u.adv || 0; out.usage.chat += u.chat || 0; out.usage.ident += u.ident || 0; });
      for (let i = 0; i < 14; i++) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), c = jparse(await kv.get(`m:${d}`), {}); out.days.push({ d, signup: c.signup || 0, verify: c.verify || 0, activate: c.activate || 0, voyage: c.voyage || 0 }); }
      out.aiCostUsd = Math.round((out.usage.adv * 0.03 + out.usage.chat * 0.0005 + out.usage.ident * 0.0003) * 100) / 100;   // estimation
      return reply(out);
    }
    if (path === '/api/admin/support' && method === 'GET') { if (!(await adminOnly())) return reply({ code: 'forbidden' }, 403); const items = []; await eachKey('sup:', async (k) => { const r = jparse(await kv.get(k), null); if (r) items.push(r); }); items.sort((x, y) => y.ts - x.ts); return reply({ items: items.slice(0, 60) }); }
    const sm = path.match(/^\/api\/admin\/support\/([a-z0-9]{4,24})$/i);
    if (sm && method === 'DELETE') { if (!(await adminOnly())) return reply({ code: 'forbidden' }, 403); await kv.delete(`sup:${sm[1]}`); return reply({ ok: true }); }
    // Modération : les inspirations signalées ou masquées, à rétablir ou supprimer
    if (path === '/api/admin/moderation' && method === 'GET') { if (!(await adminOnly())) return reply({ code: 'forbidden' }, 403); const items = []; await eachKey('comm:', async (k) => { const r = jparse(await kv.get(k), null); if (r && (r.reports || r.hidden)) items.push({ id: r.id, title: r.title, desc: r.desc, pseudo: r.pseudo, reports: r.reports || 0, hidden: !!r.hidden }); }); return reply({ items }); }
    const mm = path.match(/^\/api\/admin\/moderation\/([a-z0-9]{4,24})$/i);
    if (mm && method === 'POST') { if (!(await adminOnly())) return reply({ code: 'forbidden' }, 403); const b = await body(); const r = jparse(await kv.get(`comm:${mm[1]}`), null); if (!r) return reply({ code: 'not_found' }, 404); if (b && b.action === 'delete') await kv.delete(`comm:${mm[1]}`); else if (b && b.action === 'restore') { r.hidden = false; r.reports = 0; await kv.put(`comm:${mm[1]}`, JSON.stringify(r)); } else return reply({ code: 'bad_op' }, 400); return reply({ ok: true }); }
    // Sauvegarde à la demande (téléchargement depuis l'appli, réservé à l'éditeur)
    if (path === '/api/admin/backup' && method === 'GET') { if (!(await adminOnly())) return reply({ code: 'forbidden' }, 403); const dump = await dumpAll(kv); dump.d1 = await dumpD1(env.DB); return new Response(JSON.stringify(dump), { headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="sillage-sauvegarde-${new Date().toISOString().slice(0, 10)}.json"`, 'cache-control': 'no-store' } }); }
    return null;
  }

  return { handle, meter, auth, planOf, me, erase, acctOf };
}

// ---- Sauvegarde : tout ce qui ne se reconstruit pas (sessions et compteurs de limites exclus)
const BACKUP_PREFIXES = ['acct:', 'plan:', 'prof:', 'data:', 'comm:', 'lic:', 'sup:', 'm:', 'u:', 'email:', 'ent:', 'cand:'];
export async function dumpAll(kv) {
  const out = { v: 1, at: new Date().toISOString(), keys: {} };
  for (const prefix of BACKUP_PREFIXES) { let cursor; do { const page = await kv.list({ prefix, cursor }); for (const k of page.keys) { const v = await kv.get(k.name); if (v !== null) out.keys[k.name] = v; } cursor = page.list_complete ? undefined : page.cursor; } while (cursor); }
  const c = await kv.get('content'); if (c !== null) out.keys.content = c;
  return out;
}
// Écrit la sauvegarde du jour dans R2 (dépôt BACKUPS) et détruit celles de plus de 14 jours. Sans R2, ne fait rien.
export async function runBackup(env) {
  if (!env.BACKUPS || !env.SILLAGE) return { ok: false, reason: 'no_r2' };
  const day = new Date().toISOString().slice(0, 10);
  const dump = await dumpAll(env.SILLAGE); dump.d1 = await dumpD1(env.DB); await env.BACKUPS.put(`sillage-${day}.json`, JSON.stringify(dump));
  const keep = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10), list = await env.BACKUPS.list({ prefix: 'sillage-' });
  for (const o of list.objects || []) { const d = o.key.slice(8, 18); if (d < keep) await env.BACKUPS.delete(o.key); }
  return { ok: true, day };
}
