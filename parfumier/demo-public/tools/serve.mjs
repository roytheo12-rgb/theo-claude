// Serveur local de démonstration : le vrai code du Worker + une IA simulée (pour les tests et pour fabriquer le GIF).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
import { makeWorker } from '../src/index.js';
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.join(here, '../public');
const npmRoot = execSync('npm root -g').toString().trim();
export const { chromium } = createRequire(npmRoot + '/')('playwright');
const types = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const store = new Map();
const kv = { async get(k) { return store.has(k) ? store.get(k) : null; }, async put(k, v) { store.set(k, v); }, async list({ prefix }) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; } };
let aiCalls = 0, lastPrompt = '';
const idOf = (p, n) => (p.match(new RegExp('^(\\S+) \\| ' + n.replace(/[()]/g, '\\$&') + ' \\|', 'm')) || [])[1];
const client = { messages: { async create(req) {
  aiCalls++; const p = req.messages[0].content.at(-1).text; lastPrompt = p; await new Promise((r) => setTimeout(r, 500));
  const AMARA = process.env.VARIANT === 'amara';
  const j = AMARA
    ? { cond: { temp: 29, ctx: 'amis', with: 'amis', moment: 'jour', mood: 'joyeux', style: 'casual', color: 'clair', fabric: 'lin', place: 'exterieur', dur: '' }, read: 'Brunch entre amis en terrasse, il fait chaud', pick: idOf(p, 'Néroli Amara'), vibe: ['frais', 'lumineux', 'solaire'], story: 'Il fait 29° et la terrasse sent le citron : Néroli Amara reste léger sur la peau chaude et ne gêne personne à table.', alts: [{ id: idOf(p, 'Buongiorno Dolce Far Niente'), line: 'Plus gourmand, très agrumes' }], layers: [{ id: idOf(p, 'The Musc'), effect: 'Le musc arrondit l’agrume et le fait durer sans l’alourdir.', how: '2 sprays de Néroli Amara sur le cou, puis 1 spray de The Musc sur les poignets.', score: 4 }], avoid: '' }
    : { cond: { temp: 18, ctx: 'amis', with: 'amis', moment: 'soir', mood: 'joyeux', style: 'smart', color: 'sombre', fabric: 'coton', place: 'exterieur', dur: '' }, read: 'Sortie entre amis en ville, 18°, chemise noire', pick: idOf(p, 'Jazz Club'), vibe: ['convivial', 'ambré', 'magnétique'], story: 'Il fait 18° et la ville s’allume : Jazz Club, rhum et tabac, donne à ta chemise noire l’allure d’un bar qu’on ne quitte pas.', alts: [{ id: idOf(p, 'Baccarat Rouge 540'), line: 'Plus lumineux, très sillage' }], layers: [{ id: idOf(p, 'Fève Nectar'), effect: 'La vanille chocolatée adoucit le rhum et allonge la tenue.', how: '2 sprays de Jazz Club sur la nuque, puis 1 spray de Fève Nectar sur les poignets.', score: 5 }], avoid: '' };
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
export let PORT; await new Promise((res) => server.listen(0, () => { PORT = server.address().port; res(); }));
export const close = () => server.close();
