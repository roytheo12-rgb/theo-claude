// Sillage, démo publique : un seul Worker Cloudflare (gratuit) qui sert le site, garde le prompt côté serveur,
// limite chaque visiteur à MAX_TRIES essais et récolte les inscriptions.
import Anthropic from '@anthropic-ai/sdk';
import { dayPrompt, identifyPrompt } from './prompt.mjs';

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
      const identMax = int(env.IDENT_MAX, 6), ipIdentMax = int(env.IDENT_IP_MAX_PER_DAY, 20), identCap = int(env.IDENT_DAILY_CAP, 400);
      const kv = env.SILLAGE;
      const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
      const ipHash = await sha(ip + (env.SALT || 'sillage'));
      const ipKey = `ip:${ipHash}:${today()}`, ipIdentKey = `ipi:${ipHash}:${today()}`;

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
        const vid = request.headers.get('x-visitor') || '';
        if (!VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        if (typeof body.collection !== 'string' || body.collection.length < 20 || body.collection.length > 16000) return reply({ code: 'collection' }, 400);

        const used = int(await kv.get(`v:${vid}`), 0), ipUsed = int(await kv.get(ipKey), 0);
        if (used >= max || ipUsed >= ipMax) return reply({ code: 'quota', left: 0 }, 429);
        const capKey = `cap:${today()}`;
        if (int(await kv.get(capKey), 0) >= cap) return reply({ code: 'busy', left: Math.max(0, max - used) }, 429);

        const args = {
          collection: body.collection,
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
        await kv.put(`v:${vid}`, String(used + 1));
        await kv.put(ipKey, String(ipUsed + 1), { expirationTtl: 172800 });
        await kv.put(capKey, String(int(await kv.get(capKey), 0) + 1), { expirationTtl: 172800 });
        return reply({ data, left: Math.max(0, Math.min(max - used - 1, ipMax - ipUsed - 1)) });
      }

      // ---- Identifier un parfum (nom, image ou lien) avec un modèle léger : quasi gratuit
      if (url.pathname === '/api/identify' && request.method === 'POST') {
        const vid = request.headers.get('x-visitor') || '';
        if (!VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        let body; try { body = await request.json(); } catch (e) { return reply({ code: 'json' }, 400); }
        const text = clean(body.text, 600), imgUrl = typeof body.url === 'string' ? body.url.trim() : '', img = body.image;
        const hasImg = img && ['image/jpeg', 'image/png', 'image/webp'].includes(img.media_type) && typeof img.data === 'string' && img.data.length < 1_800_000;
        if (!text && !hasImg && !imgUrl) return reply({ code: 'empty' }, 400);
        if (imgUrl && !/^https:\/\/[^\s"'<>]{4,480}$/.test(imgUrl)) return reply({ code: 'url' }, 400);
        const used = int(await kv.get(`iv:${vid}`), 0), ipUsed = int(await kv.get(ipIdentKey), 0), capKey = `icap:${today()}`;
        if (used >= identMax || ipUsed >= ipIdentMax) return reply({ code: 'quota', identLeft: 0 }, 429);
        if (int(await kv.get(capKey), 0) >= identCap) return reply({ code: 'busy' }, 429);
        const content = [];
        if (hasImg) content.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } });
        else if (imgUrl) content.push({ type: 'image', source: { type: 'url', url: imgUrl } });
        content.push({ type: 'text', text: identifyPrompt({ text, families: FAMILIES }) });
        let items;
        try {
          const client = deps.client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
          const res = await client.messages.create({ model: env.HAIKU_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 900, messages: [{ role: 'user', content }] });
          const data = extractJson((res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''));
          if (!data || !Array.isArray(data.items)) return reply({ code: 'parse' }, 502);
          items = data.items.map(sanitizeItem).filter(Boolean).slice(0, 4);
        } catch (e) { return reply({ code: 'upstream' }, 502); }
        for (const it of items) { const k = `cand:${normName(it.name)}`; if (!(await kv.get(k))) await kv.put(k, JSON.stringify({ d: it, v: [], p: false })); }
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

export default makeWorker();
