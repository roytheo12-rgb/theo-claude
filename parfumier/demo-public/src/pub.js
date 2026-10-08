// Ce qui sort vers les lecteurs : les liens passent par /api/go/<code> (comptage des clics, sans donnée personnelle) quand ils sont enregistrés.
export const goU = (c, u) => (c ? '/api/go/' + c : u || '');
export const outItems = (items) => (items || []).map((x) => { const o = { n: x.n, h: x.h }; const u = goU(x.c, x.u); if (u) o.u = u; return o; });
export const outVideo = (r) => goU(r.vc, r.video);
// Lien https uniquement (vidéo, page de marque, lien d'affiliation) : sans identifiants dans l'adresse, sans espace.
export const cleanUrl = (u) => { u = String(u == null ? '' : u).trim(); return u.length <= 300 && /^https:\/\/[^\s<>"'\\@\/]+\.[^\s<>"'\\@\/]+(\/[^\s<>"'\\]*)?$/.test(u) ? u : ''; };
