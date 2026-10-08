// Ce qui sort vers les lecteurs : les liens passent par /api/go/<code> (comptage des clics, sans donnée personnelle) quand ils sont enregistrés.
export const goU = (c, u) => (c ? '/api/go/' + c : u || '');
export const outItems = (items) => (items || []).map((x) => { const o = { n: x.n, h: x.h }; const u = goU(x.c, x.u); if (u) o.u = u; return o; });
export const outVideo = (r) => goU(r.vc, r.video);
// Lien https uniquement (vidéo, page de marque, lien d'affiliation) : sans identifiants dans l'adresse, sans espace.
export const cleanUrl = (u) => { u = String(u == null ? '' : u).trim(); return u.length <= 300 && /^https:\/\/[^\s<>"'\\@\/]+\.[^\s<>"'\\@\/]+(\/[^\s<>"'\\]*)?$/.test(u) ? u : ''; };
// Catégories de playlists de la communauté : l'éditeur peut les changer (contenu « cats »).
export const DEFAULT_CATS = ['Soirée', 'Bureau', 'Été', 'Hiver', 'Cadeau', 'Petit budget', 'Découverte'];
// Règles de commission : { host, tpl: 'https://…{url}…{sub}' } ou { host, param, value, sub }. Renvoie le lien final et si une règle a joué.
export function applyAffil(rulesText, url, code) {
  let rules = []; try { rules = JSON.parse(rulesText || '[]'); } catch (e) { rules = []; }
  let host = ''; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return { url, ruled: false }; }
  for (const r of Array.isArray(rules) ? rules : []) {
    if (!r || !r.host || !(host === r.host || host.endsWith('.' + r.host))) continue;
    if (typeof r.tpl === 'string' && r.tpl.startsWith('https://')) return { url: r.tpl.replace('{url}', encodeURIComponent(url)).replace('{sub}', code), ruled: true };
    if (r.param) { const u = new URL(url); u.searchParams.set(r.param, String(r.value || '')); if (r.sub) u.searchParams.set(r.sub, code); return { url: u.toString(), ruled: true }; }
  }
  return { url, ruled: false };
}
