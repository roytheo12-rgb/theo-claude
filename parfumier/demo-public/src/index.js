// Sillage, démo publique : un seul Worker Cloudflare (gratuit) qui sert le site, garde le prompt côté serveur,
// limite chaque visiteur à MAX_TRIES essais et récolte les inscriptions.
import Anthropic from '@anthropic-ai/sdk';
import { dayPrompt, identifyPrompt, needPrompt } from './prompt.mjs';
import { makeAccount, runBackup } from './account.js';

const JSON_H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_H });
const int = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const today = () => new Date().toISOString().slice(0, 10);
const VISITOR_RE = /^[A-Za-z0-9-]{16,64}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}


// ---- Comptes : email + mot de passe (PBKDF2), session par jeton, profil complet sauvegardé côté serveur
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fullSha = async (text) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
async function pbkdf2(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256)); // 100 000 : le maximum accepté par Cloudflare Workers
}
const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
const SESSION_TTL = 60 * 60 * 24 * 180, DATA_MAX = 900000;

const FAMILIES = ['agrumes', 'aquatique', 'aromatique', 'vert', 'floral', 'fruité', 'gourmand', 'ambré', 'boisé', 'épicé', 'cuir', 'musqué', 'oud'];
const GENDERS = ['m', 'f', 'x'];
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const normName = (v) => clean(v, 90).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
const rate5 = (v) => Math.min(5, Math.max(1, Math.round(Number(v)) || 3));
// Tout ce qui sort du modèle est nettoyé avant de toucher l'appli ou le catalogue partagé.
function sanitizeItem(it) {
  if (!it || typeof it !== 'object') return null;
  const name = clean(it.name, 80), house = clean(it.house, 60);
  if (name.length < 2 || /https?:|www\./i.test(name + house)) return null;
  return { name, house, family: FAMILIES.includes(it.family) ? it.family : 'boisé', notes: (Array.isArray(it.notes) ? it.notes : []).map((n) => clean(n, 30)).filter(Boolean).slice(0, 8),
    projection: rate5(it.projection), longevity: rate5(it.longevity), weight: rate5(it.weight), price: Math.min(2000, Math.max(0, Math.round(Number(it.price)) || 0)), confidence: Math.min(1, Math.max(0, Number(it.confidence) || 0.5)) };
}

function extractJson(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { return null; }
}

export function makeWorker(deps = {}) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

      // Seul le site lui-même (ou ALLOWED_ORIGIN) peut appeler l'API : personne ne peut brancher sa page sur ta clé.
      const origin = request.headers.get('origin');
      if (origin && origin !== url.origin && origin !== env.ALLOWED_ORIGIN) return reply({ code: 'origin' }, 403);

      const max = int(env.MAX_TRIES, 2), ipMax = int(env.IP_MAX_PER_DAY, 6), cap = int(env.DAILY_CAP, 150);
      const identMax = int(env.IDENT_MAX, 15), ipIdentMax = int(env.IDENT_IP_MAX_PER_DAY, 40), identCap = int(env.IDENT_DAILY_CAP, 600);
      const kv = env.SILLAGE;
      const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
      const ipHash = await sha(ip + (env.SALT || 'sillage'));
      const ipKey = `ip:${ipHash}:${today()}`, ipIdentKey = `ipi:${ipHash}:${today()}`;

      // ---- Comptes, offres Whop, profil, communauté, éditeur
      const doFetch = deps.fetch || ((...x) => fetch(...x));
      // Courriel via Resend (si RESEND_API_KEY et MAIL_FROM sont définis) ; renvoie false si rien n'est configuré ou si l'envoi échoue.
      const sendMail = async (to, subject, html) => { if (!env.RESEND_API_KEY || !env.MAIL_FROM) return false; try { const r = await doFetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: env.MAIL_FROM, to: [].concat(to), subject, html }) }); return !!(r && r.ok !== false); } catch (e) { return false; } };
      // Compteurs du jour (inscriptions, confirmations, activations, parcours terminés) : sans donnée personnelle.
      const track = async (name) => { try { const k = `m:${today()}`, c = JSON.parse((await kv.get(k)) || '{}'); c[name] = (c[name] || 0) + 1; await kv.put(k, JSON.stringify(c), { expirationTtl: 60 * 60 * 24 * 400 }); } catch (e) { /* mesure facultative */ } };
      const mailVerify = async (id, email) => { const tk = randHex(32); await kv.put(`ver:${await fullSha(tk)}`, id, { expirationTtl: 60 * 60 * 24 * 7 }); return sendMail(email, 'Confirme ton adresse Sillage', `<p>Bonjour,</p><p>Pour activer tes conseils IA, confirme ton adresse en ouvrant ce lien : <a href="${url.origin}/?verify=${tk}">${url.origin}/?verify=${tk}</a></p><p>Il est valable 7 jours. Si tu n'as pas créé de compte, ignore ce message.</p>`); };
      const acc = makeAccount({ kv, env, reply, clean, hex, fullSha, randHex, int, deps, sendMail, track, mailVerify, ipHash });
      { const r = await acc.handle(request, url); if (r) return r; }

      // ---- Parfumier en conversation (modèle léger) : réservé aux comptes, compté par offre
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        const M = await acc.meter(request, 'chat'); if (!M) return reply({ code: 'auth' }, 401);
        if (!M.ok) return reply({ code: M.verify ? 'verify' : 'quota', plan: M.plan, left: 0 }, 429);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        const prompt = typeof body.prompt === 'string' ? body.prompt : ''; if (prompt.length < 10 || prompt.length > 12000) return reply({ code: 'prompt' }, 400);
        let text;
        try {
          const client = deps.client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
          const res = await client.messages.create({ model: env.CHAT_MODEL || 'claude-haiku-5-5', max_tokens: 900, system: 'Tu es le parfumier privé de l\'application Sillage. Tu ne réponds qu\'à des questions de parfumerie, de goût et de style, en français, par un JSON comme demandé. Tu n\'inventes ni parfum, ni note, ni prix.', messages: [{ role: 'user', content: prompt }] });
          if (res.stop_reason === 'refusal') return reply({ code: 'refusal' }, 502);
          text = (res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
        } catch (e) { return reply({ code: 'upstream' }, 502); }
        const data = extractJson(text); if (!data) return reply({ code: 'parse' }, 502);
        await M.commit();
        return reply({ data, left: M.left - 1 });
      }

      // ---- Essais restants
      if (url.pathname === '/api/quota' && request.method === 'GET') {
        const vid = request.headers.get('x-visitor') || '';
        if (!VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        const used = int(await kv.get(`v:${vid}`), 0), ipUsed = int(await kv.get(ipKey), 0);
        const iUsed = int(await kv.get(`iv:${vid}`), 0), iIp = int(await kv.get(ipIdentKey), 0);
        return reply({ left: Math.max(0, Math.min(max - used, ipMax - ipUsed)), max, identLeft: Math.max(0, Math.min(identMax - iUsed, ipIdentMax - iIp)) });
      }

      // ---- Conseil du jour (le seul appel IA de la démo)
      if (url.pathname === '/api/day' && request.method === 'POST') {
        const M = await acc.meter(request, 'adv');
        const vid = request.headers.get('x-visitor') || '';
        if (!M && !VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        if (typeof body.collection !== 'string' || body.collection.length < 20 || body.collection.length > 26000) return reply({ code: 'collection' }, 400);

        const used = int(await kv.get(`v:${vid}`), 0), ipUsed = int(await kv.get(ipKey), 0);
        if (M ? !M.ok : (used >= max || ipUsed >= ipMax)) return reply({ code: M && M.verify ? 'verify' : 'quota', left: 0, plan: M && M.plan }, 429);
        const capKey = `cap:${today()}`;
        if (int(await kv.get(capKey), 0) >= cap) return reply({ code: 'busy', left: Math.max(0, max - used) }, 429);

        const args = {
          collection: body.collection,
          taste: String(body.taste || '').slice(0, 1800),
          text: String(body.text || '').slice(0, 600),
          explicit: String(body.explicit || '').slice(0, 500),
          wx: body.wx && typeof body.wx === 'object' ? { l: String(body.wx.l || '').slice(0, 30), t: Number(body.wx.t) || 0, rain: !!body.wx.rain } : null,
          date: String(body.date || '').slice(0, 60),
          profile: body.profile && typeof body.profile === 'object' ? { gender: GENDERS.includes(body.profile.gender) ? body.profile.gender : '', age: Math.round(Number(body.profile.age)) >= 10 && Math.round(Number(body.profile.age)) <= 99 ? Math.round(Number(body.profile.age)) : null } : null,
          hasPhoto: false,
        };
        const content = [];
        const img = body.image;
        if (img && ['image/jpeg', 'image/png', 'image/webp'].includes(img.media_type) && typeof img.data === 'string' && img.data.length < 1_800_000) {
          content.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } });
          args.hasPhoto = true;
        }
        content.push({ type: 'text', text: dayPrompt(args) });

        let data;
        try {
          const client = deps.client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
          const res = await client.messages.create({
            model: env.MODEL || 'claude-sonnet-5-5',
            max_tokens: 3000,
            output_config: { effort: env.EFFORT || 'low' },
            messages: [{ role: 'user', content }],
          });
          if (res.stop_reason === 'refusal') return reply({ code: 'refusal' }, 502);
          const text = (res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
          data = extractJson(text);
        } catch (e) {
          return reply({ code: 'upstream' }, 502);
        }
        if (!data) return reply({ code: 'parse' }, 502);

        // Le compteur n'avance qu'après une réponse réussie.
        if (M) { await M.commit(); await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 }); return reply({ data, left: M.left - 1, plan: M.plan }); }
        await kv.put(`v:${vid}`, String(used + 1));
        await kv.put(ipKey, String(ipUsed + 1), { expirationTtl: 172800 });
        await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 });
        return reply({ data, left: Math.max(0, Math.min(max - used - 1, ipMax - ipUsed - 1)) });
      }

      // ---- Conseil sur mesure (« Je cherche… ») : l'IA tranche parmi les candidats vérifiés par le moteur ; recherche web si WEB_SEARCH=1
      if (url.pathname === '/api/need' && request.method === 'POST') {
        const M = await acc.meter(request, 'adv');
        const vid = request.headers.get('x-visitor') || '';
        if (!M && !VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        const need = clean(body.need, 500); if (need.length < 3) return reply({ code: 'need' }, 400);
        const used = int(await kv.get(`v:${vid}`), 0), ipUsed = int(await kv.get(ipKey), 0);
        if (M ? !M.ok : (used >= max || ipUsed >= ipMax)) return reply({ code: M && M.verify ? 'verify' : 'quota', left: 0, plan: M && M.plan }, 429);
        const capKey = `cap:${today()}`;
        if (int(await kv.get(capKey), 0) >= cap) return reply({ code: 'busy', left: Math.max(0, max - used) }, 429);
        const g = body.profile && typeof body.profile === 'object' ? body.profile : {}, age = Math.round(Number(g.age));
        const args = { need, shortlist: String(body.shortlist || '').slice(0, 14000), collection: String(body.collection || '').slice(0, 4500), taste: String(body.taste || '').slice(0, 1800), profile: { gender: GENDERS.includes(g.gender) ? g.gender : '', age: age >= 10 && age <= 99 ? age : null } };
        let data;
        try {
          const client = deps.client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
          const req = { model: env.MODEL || 'claude-sonnet-5-5', max_tokens: 3000, output_config: { effort: env.EFFORT || 'low' }, messages: [{ role: 'user', content: [{ type: 'text', text: needPrompt(args) }] }] };
          if (env.WEB_SEARCH === '1') req.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];
          const res = await client.messages.create(req);
          if (res.stop_reason === 'refusal') return reply({ code: 'refusal' }, 502);
          data = extractJson((res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''));
        } catch (e) { return reply({ code: 'upstream' }, 502); }
        if (!data || !Array.isArray(data.picks)) return reply({ code: 'parse' }, 502);
        if (M) { await M.commit(); await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 }); return reply({ data, left: M.left - 1, plan: M.plan }); }
        await kv.put(`v:${vid}`, String(used + 1));
        await kv.put(ipKey, String(ipUsed + 1), { expirationTtl: 172800 });
        await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 });
        return reply({ data, left: Math.max(0, Math.min(max - used - 1, ipMax - ipUsed - 1)) });
      }

      // ---- Identifier un parfum (nom, image ou lien) avec un modèle léger : quasi gratuit
      if (url.pathname === '/api/identify' && request.method === 'POST') {
        const M = await acc.meter(request, 'ident');
        const vid = request.headers.get('x-visitor') || '';
        if (!M && !VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        const text = clean(body.text, 600), imgUrl = typeof body.url === 'string' ? body.url.trim() : '', img = body.image;
        const hasImg = img && ['image/jpeg', 'image/png', 'image/webp'].includes(img.media_type) && typeof img.data === 'string' && img.data.length < 1_800_000;
        if (!text && !hasImg && !imgUrl) return reply({ code: 'empty' }, 400);
        if (imgUrl && !/^https:\/\/[^\s"'<>]{4,480}$/.test(imgUrl)) return reply({ code: 'url' }, 400);
        // Cache : un parfum déjà identifié (par n'importe qui) ne rappelle pas le modèle et ne consomme aucun essai.
        const lines = hasImg || imgUrl ? [] : text.split(/\n/).map((l) => clean(l, 120)).filter(Boolean).slice(0, 4);
        const hits = [], misses = [];
        for (const l of lines) { const raw = await kv.get(`ent:${normName(l)}`); if (raw) hits.push(JSON.parse(raw)); else misses.push(l); }
        if (lines.length && !misses.length) return reply({ data: { items: hits }, cached: hits.length, identLeft: undefined });
        const used = int(await kv.get(`iv:${vid}`), 0), ipUsed = int(await kv.get(ipIdentKey), 0), capKey = `icap:${today()}`;
        if (M ? !M.ok : (used >= identMax || ipUsed >= ipIdentMax)) return reply({ code: M && M.verify ? 'verify' : 'quota', identLeft: 0, plan: M && M.plan }, 429);
        if (int(await kv.get(capKey), 0) >= identCap) return reply({ code: 'busy' }, 429);
        const content = [];
        if (hasImg) content.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } });
        else if (imgUrl) content.push({ type: 'image', source: { type: 'url', url: imgUrl } });
        content.push({ type: 'text', text: identifyPrompt({ text: lines.length ? misses.join('\n') : text, families: FAMILIES }) });
        let items;
        try {
          const client = deps.client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
          const res = await client.messages.create({ model: env.HAIKU_MODEL || 'claude-haiku-5-5', max_tokens: 900, messages: [{ role: 'user', content }] });
          const data = extractJson((res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''));
          if (!data || !Array.isArray(data.items)) return reply({ code: 'parse' }, 502);
          items = data.items.map(sanitizeItem).filter(Boolean).slice(0, 4);
        } catch (e) { return reply({ code: 'upstream' }, 502); }
        if (misses.length === 1 && items.length === 1) await kv.put(`ent:${normName(misses[0])}`, JSON.stringify(items[0]));
        items = hits.concat(items);
        for (const it of items) { const k = `cand:${normName(it.name)}`; if (!(await kv.get(k))) await kv.put(k, JSON.stringify({ d: it, v: [], p: false })); }
        if (M) { await M.commit(); await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 }); return reply({ data: { items }, identLeft: M.left - 1 }); }
        await kv.put(`iv:${vid}`, String(used + 1)); await kv.put(ipIdentKey, String(ipUsed + 1), { expirationTtl: 172800 }); await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 });
        return reply({ data: { items }, identLeft: Math.max(0, Math.min(identMax - used - 1, ipIdentMax - ipUsed - 1)) });
      }

      // ---- Catalogue partagé : un parfum identifié n'y entre qu'après confirmation de 2 personnes différentes
      if (url.pathname === '/api/catalog' && request.method === 'GET') {
        const all = JSON.parse((await kv.get('catalog:all')) || '[]');
        return new Response(JSON.stringify({ items: all }), { headers: { ...JSON_H, 'cache-control': 'public, max-age=300' } });
      }
      if (url.pathname === '/api/catalog/confirm' && request.method === 'POST') {
        const vid = request.headers.get('x-visitor') || '';
        if (!VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        const cfKey = `cf:${ipHash}:${today()}`, n = int(await kv.get(cfKey), 0); if (n >= 40) return reply({ code: 'rate' }, 429);
        await kv.put(cfKey, String(n + 1), { expirationTtl: 172800 });
        let promoted = 0;
        for (const name of (Array.isArray(body.names) ? body.names : []).slice(0, 4)) {
          const key = normName(name); if (!key) continue; const raw = await kv.get(`cand:${key}`); if (!raw) continue;
          const c = JSON.parse(raw); if (!c.v.includes(ipHash)) c.v.push(ipHash);
          if (c.v.length >= 2 && !c.p) {
            const all = JSON.parse((await kv.get('catalog:all')) || '[]');
            if (!all.some((x) => normName(x.name) === key) && all.length < 500) { const { confidence, ...d } = c.d; all.push(d); await kv.put('catalog:all', JSON.stringify(all)); promoted++; }
            c.p = true;
          }
          await kv.put(`cand:${key}`, JSON.stringify(c));
        }
        return reply({ ok: true, promoted });
      }

      // ---- Comptes
      if (url.pathname.startsWith('/api/account/')) {
        const salt = env.SALT || 'sillage';
        const auth = async () => { const t = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''); if (!/^[a-f0-9]{64}$/.test(t)) return null; const id = await kv.get(`sess:${await fullSha(t)}`); return id ? { id, token: t } : null; };
        const session = async (id) => { const t = randHex(32); await kv.put(`sess:${await fullSha(t)}`, id, { expirationTtl: SESSION_TTL }); return t; };
        const sub = url.pathname.slice('/api/account/'.length);
        let b = {}; if (request.method === 'POST' || request.method === 'PUT') { try { b = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); } }
        if ((sub === 'signup' || sub === 'login') && request.method === 'POST') {
          const email = String(b.email || '').trim().toLowerCase(), password = String(b.password || '');
          if (!EMAIL_RE.test(email)) return reply({ code: 'email' }, 400);
          if (sub === 'signup' && (password.length < 8 || password.length > 100)) return reply({ code: 'password' }, 400);
          const id = await fullSha(email + salt), rlKey = `ac:${sub}:${await sha(ip + 'ac')}:${new Date().toISOString().slice(0, 13)}`, n = int(await kv.get(rlKey), 0);
          if (n >= (sub === 'signup' ? 10 : 20)) return reply({ code: 'rate' }, 429);
          await kv.put(rlKey, String(n + 1), { expirationTtl: 7200 });
          const rec = JSON.parse((await kv.get(`acct:${id}`)) || 'null');
          if (sub === 'signup') {
            if (rec) return reply({ code: 'exists' }, 409);
            const sl = randHex(16);
            const needVerify = !!(env.RESEND_API_KEY && env.MAIL_FROM);
            await kv.put(`acct:${id}`, JSON.stringify({ email, salt: sl, hash: await pbkdf2(password, sl), created: new Date().toISOString(), ...(needVerify ? { verified: false } : {}) }));
            await track('signup'); if (needVerify) await mailVerify(id, email);
            return reply({ ok: true, token: await session(id), verified: !needVerify });
          }
          if (!rec || !same(rec.hash, await pbkdf2(password, rec.salt))) return reply({ code: 'credentials' }, 401);
          const d = JSON.parse((await kv.get(`data:${id}`)) || 'null');
          return reply({ ok: true, token: await session(id), data: d ? d.data : null, ts: d ? d.ts : 0 });
        }
        // Mot de passe oublié : un lien à usage unique (1 h) est envoyé par email (Resend). On répond toujours « ok » pour ne pas révéler quels emails ont un compte.
        if (sub === 'forgot' && request.method === 'POST') {
          const email = String(b.email || '').trim().toLowerCase(); if (!EMAIL_RE.test(email)) return reply({ code: 'email' }, 400);
          const rl = `ac:forgot:${await sha(ip + 'fg')}:${new Date().toISOString().slice(0, 13)}`, nf = int(await kv.get(rl), 0); if (nf >= 5) return reply({ code: 'rate' }, 429); await kv.put(rl, String(nf + 1), { expirationTtl: 7200 });
          const id = await fullSha(email + salt), rec = JSON.parse((await kv.get(`acct:${id}`)) || 'null');
          if (rec) { const tk = randHex(32); await kv.put(`rst:${await fullSha(tk)}`, id, { expirationTtl: 3600 }); const link = `${url.origin}/?reset=${tk}`; await sendMail(email, 'Ton nouveau mot de passe Sillage', `<p>Bonjour,</p><p>Pour choisir un nouveau mot de passe, ouvre ce lien dans l'heure : <a href="${link}">${link}</a></p><p>Si tu n'as rien demandé, ignore ce message.</p>`); }
          return reply({ ok: true });
        }
        if (sub === 'reset' && request.method === 'POST') {
          const tk = String(b.token || ''), password = String(b.password || ''); if (!/^[a-f0-9]{64}$/.test(tk) || password.length < 8 || password.length > 100) return reply({ code: 'password' }, 400);
          const rk = `rst:${await fullSha(tk)}`, id = await kv.get(rk); if (!id) return reply({ code: 'token' }, 400);
          const rec = JSON.parse((await kv.get(`acct:${id}`)) || 'null'); if (!rec) return reply({ code: 'token' }, 400);
          const sl = randHex(16); rec.salt = sl; rec.hash = await pbkdf2(password, sl); if (rec.verified === false) rec.verified = true; await kv.put(`acct:${id}`, JSON.stringify(rec)); await kv.delete(rk);
          return reply({ ok: true, token: await session(id), email: rec.email });
        }
        const a = await auth(); if (!a) return reply({ code: 'auth' }, 401);
        if (sub === 'data' && request.method === 'GET') { const d = JSON.parse((await kv.get(`data:${a.id}`)) || 'null'); return reply({ data: d ? d.data : null, ts: d ? d.ts : 0 }); }
        if (sub === 'data' && request.method === 'PUT') {
          if (!b.data || typeof b.data !== 'object') return reply({ code: 'data' }, 400);
          const text = JSON.stringify(b.data); if (text.length > DATA_MAX) return reply({ code: 'too_big' }, 413);
          const ts = Date.now(); await kv.put(`data:${a.id}`, JSON.stringify({ ts, data: b.data })); return reply({ ok: true, ts });
        }
        if (sub === 'logout' && request.method === 'POST') { await kv.delete(`sess:${await fullSha(a.token)}`); return reply({ ok: true }); }
        if (sub === 'delete' && request.method === 'POST') { await acc.erase(a.id); await kv.delete(`sess:${await fullSha(a.token)}`); return reply({ ok: true }); }
        return reply({ code: 'not_found' }, 404);
      }

      // ---- Inscription
      if (url.pathname === '/api/signup' && request.method === 'POST') {
        let b; try { b = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        if (b.website) return reply({ ok: true }); // piège à robots : on fait semblant
        const email = String(b.email || '').trim().toLowerCase();
        if (!EMAIL_RE.test(email)) return reply({ code: 'email' }, 400);
        if (b.consent !== true) return reply({ code: 'consent' }, 400);
        const rlKey = `su:${await sha(ip + 'su')}:${new Date().toISOString().slice(0, 13)}`;
        const n = int(await kv.get(rlKey), 0);
        if (n >= 5) return reply({ code: 'rate' }, 429);
        await kv.put(rlKey, String(n + 1), { expirationTtl: 7200 });
        const interest = ['test', 'custom', 'guide'].includes(b.interest) ? b.interest : 'test';
        await kv.put(`email:${email}`, JSON.stringify({ email, interest, source: String(b.source || '').slice(0, 40), ts: new Date().toISOString() }));
        return reply({ ok: true });
      }

      // ---- Export des emails (toi seul, avec ta clé ADMIN_KEY) : /api/admin/emails?key=...
      if (url.pathname === '/api/admin/emails' && request.method === 'GET') {
        if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return reply({ code: 'auth' }, 401);
        const rows = [['email', 'interet', 'source', 'date']];
        let cursor;
        do {
          const page = await kv.list({ prefix: 'email:', cursor });
          for (const k of page.keys) { const v = JSON.parse((await kv.get(k.name)) || '{}'); rows.push([v.email, v.interest, v.source, v.ts]); }
          cursor = page.list_complete ? undefined : page.cursor;
        } while (cursor);
        const csv = rows.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="sillage-emails.csv"', 'cache-control': 'no-store' } });
      }

      return reply({ code: 'not_found' }, 404);
    },
  };
}

const worker = makeWorker();
export default {
  fetch: (req, env, ctx) => worker.fetch(req, env, ctx),
  // Sauvegarde quotidienne (Cron Trigger) dans R2 si le dépôt BACKUPS est relié.
  scheduled: (event, env, ctx) => ctx.waitUntil(runBackup(env)),
};
