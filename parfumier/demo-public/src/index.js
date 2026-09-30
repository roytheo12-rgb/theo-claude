// Sillage, démo publique : un seul Worker Cloudflare (gratuit) qui sert le site, garde le prompt côté serveur,
// limite chaque visiteur à MAX_TRIES essais et récolte les inscriptions.
import Anthropic from '@anthropic-ai/sdk';
import { dayPrompt } from './prompt.mjs';

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
      const kv = env.SILLAGE;
      const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
      const ipKey = `ip:${await sha(ip + (env.SALT || 'sillage'))}:${today()}`;

      // ---- Essais restants
      if (url.pathname === '/api/quota' && request.method === 'GET') {
        const vid = request.headers.get('x-visitor') || '';
        if (!VISITOR_RE.test(vid)) return reply({ code: 'visitor' }, 400);
        const used = int(await kv.get(`v:${vid}`), 0), ipUsed = int(await kv.get(ipKey), 0);
        return reply({ left: Math.max(0, Math.min(max - used, ipMax - ipUsed)), max });
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
