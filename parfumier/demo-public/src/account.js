// Sillage : comptes, abonnements Whop, profil, inspirations de la communauté, éditeur public.
// Tout ce qui touche à l'argent et aux droits vit ici, côté serveur : le navigateur ne décide jamais de ce qu'on a le droit de faire.

// Ce que chaque offre permet. Les chiffres viennent de l'analyse de rentabilité (docs/RENTABILITE.md) ; ajuste-les ici, rien d'autre à changer.
export const PLANS = {
  free: { label: 'Gratuit', adv: 3, chat: 20, ident: 15, col: 12, insp: 2, publish: false },
  premium: { label: 'Premium', adv: 60, chat: 300, ident: 200, col: 100000, insp: 30, publish: true },
  founder: { label: 'Membre fondateur', adv: 60, chat: 300, ident: 200, col: 100000, insp: 30, publish: true },
  admin: { label: 'Éditeur', adv: 100000, chat: 100000, ident: 100000, col: 100000, insp: 100000, publish: true },
};
const GOOD_STATUS = ['active', 'trialing', 'past_due', 'completed'];   // Whop : past_due = période de grâce, completed = achat unique (fondateur)
const RECHECK_MS = 24 * 3600 * 1000;
const PSEUDO_RE = /^[\p{L}\p{N} ._'-]{2,24}$/u;
const AVATAR_RE = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;

const month = () => new Date().toISOString().slice(0, 7);
const jparse = (s, d) => { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };

export function makeAccount(h) {
  const { kv, env, reply, clean, hex, fullSha, randHex, int, deps } = h;
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
    const p = await planOf(a.id, acct.email), lim = plans[p.plan][kind], u = await usageOf(a.id);
    return { ok: u[kind] < lim, plan: p.plan, left: Math.max(0, lim - u[kind]), commit: async () => { u[kind] += 1; await kv.put(usageKey(a.id), JSON.stringify(u), { expirationTtl: 60 * 60 * 24 * 70 }); } };
  }

  async function me(a) {
    const acct = await acctOf(a.id); if (!acct) return null;
    const p = await planOf(a.id, acct.email), u = await usageOf(a.id), prof = jparse(await kv.get(`prof:${a.id}`), {});
    const L = plans[p.plan];
    return { email: acct.email, plan: p.plan, label: L.label, status: p.status, until: p.until || null, expired: !!p.expired, admin: p.plan === 'admin', limits: { adv: L.adv, chat: L.chat, ident: L.ident, col: L.col, insp: L.insp, publish: L.publish }, usage: u, profile: { pseudo: prof.pseudo || '', avatar: prof.avatar || '', bio: prof.bio || '' } };
  }

  const cleanItems = (items, max) => (Array.isArray(items) ? items : []).slice(0, max).map((x) => ({ n: clean(x && x.n, 80), h: clean(x && x.h, 60) })).filter((x) => x.n.length >= 2);

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
      default: return null;
    }
    c.v = (c.v || 0) + 1; c.ts = Date.now();
    const text = JSON.stringify(c); if (text.length > CONTENT_MAX) return 'too_big';
    await kv.put('content', text); return c;
  }

  // Retourne une Response si la route est la sienne, sinon null.
  async function handle(request, url) {
    const path = url.pathname, method = request.method;
    const body = async () => { try { return await request.json(); } catch (e) { return null; } };
    const rate = async (a, name, n, ttl) => { const k = `rl:${name}:${a}:${new Date().toISOString().slice(0, 13)}`, c = int(await kv.get(k), 0); if (c >= n) return false; await kv.put(k, String(c + 1), { expirationTtl: ttl || 7200 }); return true; };

    if (path === '/api/content' && method === 'GET') { const c = await content(); return new Response(JSON.stringify(c), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } }); }

    const a = await auth(request);
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
      return reply({ ok: true, me: await me(a) });
    }
    if (path === '/api/account/profile' && method === 'PUT') {
      if (!a) return reply({ code: 'auth' }, 401);
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const prev = jparse(await kv.get(`prof:${a.id}`), {}), pseudo = b.pseudo === undefined ? prev.pseudo || '' : clean(b.pseudo, 24);
      if (pseudo && !PSEUDO_RE.test(pseudo)) return reply({ code: 'pseudo' }, 400);
      let avatar = prev.avatar || '';
      if (b.avatar !== undefined) { if (b.avatar === '') avatar = ''; else if (typeof b.avatar === 'string' && b.avatar.length <= 70000 && AVATAR_RE.test(b.avatar)) avatar = b.avatar; else return reply({ code: 'avatar' }, 400); }
      await kv.put(`prof:${a.id}`, JSON.stringify({ pseudo, avatar, bio: b.bio === undefined ? prev.bio || '' : clean(b.bio, 140) }));
      return reply({ ok: true, me: await me(a) });
    }

    // ---- Inspirations de la communauté : publiques seulement quand leur auteur le décide
    if (path === '/api/community' && method === 'GET') {
      if (!a) return reply({ code: 'auth' }, 401);
      const list = []; let cursor;
      do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), null); if (r && !r.hidden) list.push(r); } cursor = page.list_complete || list.length >= 300 ? undefined : page.cursor; } while (cursor);
      list.sort((x, y) => y.ts - x.ts);
      return reply({ items: list.slice(0, 200).map((r) => ({ id: r.id, title: r.title, desc: r.desc, items: r.items, pseudo: r.pseudo, ts: r.ts, likes: r.likes || 0, mine: r.author === a.id })) });
    }
    if (path === '/api/community' && method === 'POST') {
      if (!a) return reply({ code: 'auth' }, 401);
      const acct = await acctOf(a.id), p = await planOf(a.id, acct && acct.email), L = plans[p.plan];
      if (!L.publish) return reply({ code: 'plan' }, 403);
      const prof = jparse(await kv.get(`prof:${a.id}`), {}); if (!prof.pseudo) return reply({ code: 'pseudo' }, 400);
      const b = await body(); if (!b) return reply({ code: 'json' }, 400);
      const title = clean(b.title, 60), items = cleanItems(b.items, 30); if (title.length < 3 || items.length < 2) return reply({ code: 'content' }, 400);
      if (!(await rate(a.id, 'pub', 12))) return reply({ code: 'rate' }, 429);
      const id = clean(b.id, 24).replace(/[^a-z0-9]/gi, '') || randHex(8), prev = jparse(await kv.get(`comm:${id}`), null);
      if (prev && prev.author !== a.id) return reply({ code: 'taken' }, 409);
      if (!prev) { let n = 0, cursor; do { const page = await kv.list({ prefix: 'comm:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), null); if (r && r.author === a.id) n++; } cursor = page.list_complete ? undefined : page.cursor; } while (cursor); if (n >= 10) return reply({ code: 'limit' }, 409); }
      const rec = { id, author: a.id, pseudo: prof.pseudo, title, desc: clean(b.desc, 240), items, ts: prev ? prev.ts : Date.now(), likes: prev ? prev.likes || 0 : 0, reports: prev ? prev.reports || 0 : 0 };
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
    if (path === '/api/admin/stats' && method === 'GET') {
      if (!a) return reply({ code: 'auth' }, 401);
      const acct = await acctOf(a.id); if (!acct || !adminEmails.includes(acct.email)) return reply({ code: 'forbidden' }, 403);
      const out = { accounts: 0, plans: {}, usage: { adv: 0, chat: 0, ident: 0 } }; let cursor;
      do { const page = await kv.list({ prefix: 'plan:', cursor }); for (const k of page.keys) { const r = jparse(await kv.get(k.name), {}); const p = r.valid === false ? 'expired' : r.plan; out.plans[p] = (out.plans[p] || 0) + 1; } cursor = page.list_complete ? undefined : page.cursor; } while (cursor);
      cursor = undefined; do { const page = await kv.list({ prefix: 'acct:', cursor }); out.accounts += page.keys.length; cursor = page.list_complete ? undefined : page.cursor; } while (cursor);
      cursor = undefined; do { const page = await kv.list({ prefix: `u:`, cursor }); for (const k of page.keys) { if (!k.name.endsWith(':' + month())) continue; const u = jparse(await kv.get(k.name), {}); out.usage.adv += u.adv || 0; out.usage.chat += u.chat || 0; out.usage.ident += u.ident || 0; } cursor = page.list_complete ? undefined : page.cursor; } while (cursor);
      return reply(out);
    }
    return null;
  }

  return { handle, meter, auth, planOf, me };
}
