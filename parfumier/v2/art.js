// Flacons SVG animés. Chaque maison a sa silhouette (bouchon, étiquette, verre) dessinée à la main,
// la couleur du jus vient de la famille olfactive. Aucun vert : les teintes vertes sont déportées.
(function (root) {
  const BASE = { agrumes: 40, aquatique: 206, aromatique: 226, vert: 194, floral: 326, fruité: 352, gourmand: 18, ambré: 38, boisé: 24, épicé: 6, cuir: 8, musqué: 340, oud: 272 };
  const SAT = { musqué: 60, cuir: 48, boisé: 44, oud: 50, ambré: 80, gourmand: 66, épicé: 82 };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const noGreen = (h) => { h = ((h % 360) + 360) % 360; return h > 44 && h < 178 ? (h < 111 ? 38 : 190) : h; };
  let n = 0;

  function pal(p) {
    const f = p.family;
    const h = noGreen((BASE[f] != null ? BASE[f] : 300) + (hash(p.name) % 44) - 22);
    const s = SAT[f] != null ? SAT[f] : 72;
    return { h, s, a: `hsl(${h} ${s}% 78%)`, b: `hsl(${h} ${Math.min(92, s + 6)}% 60%)`, c: `hsl(${h} ${Math.min(92, s + 8)}% 34%)`, d: `hsl(${h} ${Math.max(18, s - 22)}% 13%)` };
  }
  const famColor = (f) => `hsl(${noGreen(BASE[f] != null ? BASE[f] : 300)} ${SAT[f] != null ? SAT[f] : 72}% 62%)`;

  // Corps de flacon (viewBox 120 x 200) : chemin, col, capuchon [x,y,l,h,r], haut/bas du liquide, largeur utile
  const SHAPES = [
    { body: 'M30 78a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v94a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z', neck: [50, 54, 20, 18], cap: [44, 32, 32, 24, 4], top: 70, bottom: 180, x: [30, 90], nz: [60, 32] },
    { body: 'M16 125a44 52 0 1 0 88 0a44 52 0 1 0-88 0z', neck: [50, 58, 20, 22], cap: [46, 36, 28, 24, 8], top: 73, bottom: 177, x: [16, 104], nz: [60, 36] },
    { body: 'M40 64a14 14 0 0 1 14-14h12a14 14 0 0 1 14 14v108a14 14 0 0 1-14 14H54a14 14 0 0 1-14-14z', neck: [52, 42, 16, 10], cap: [45, 22, 30, 24, 5], top: 50, bottom: 186, x: [40, 80], nz: [60, 22] },
    { body: 'M60 62L98 90L92 182H28L22 90z', neck: [50, 50, 20, 14], cap: [46, 28, 28, 26, 4], top: 62, bottom: 182, x: [24, 96], nz: [60, 28] },
    { body: 'M34 62a6 6 0 0 1 6-6h40a6 6 0 0 1 6 6v118a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6z', neck: [52, 48, 16, 8], cap: [38, 16, 44, 40, 5], top: 56, bottom: 186, x: [34, 86], nz: [60, 16] },
    { body: 'M22 96a10 10 0 0 1 10-10h56a10 10 0 0 1 10 10v76a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10z', neck: [50, 74, 20, 12], cap: [42, 50, 36, 26, 6], top: 86, bottom: 182, x: [22, 98], nz: [60, 50] },
  ];
  const WAVE = 'M0 6Q15 0 30 6T60 6T90 6T120 6T150 6T180 6T210 6T240 6V90H0Z';

  // Maison -> silhouette réelle (forme, bouchon, étiquette, verre teinté)
  function arche(p) {
    const H = norm(p.house), N = norm(p.name);
    if (/le labo/.test(H)) return { shape: 0, cap: 'black', label: 'lab' };
    if (/byredo/.test(H)) return { shape: 4, cap: 'black', label: 'frost' };
    if (/diptyque/.test(H)) return { shape: 5, cap: 'black', label: 'oval' };
    if (/kurkdjian/.test(H)) return { shape: 2, cap: 'gold', label: 'mini' };
    if (/tom ford/.test(H)) return { shape: 5, cap: /tobacco|oud|tuscan|ombre/.test(N) ? 'wood' : 'black', label: 'cream' };
    if (/margiela/.test(H)) return { shape: 0, cap: 'black', label: 'type' };
    if (/malle/.test(H)) return { shape: 4, cap: 'black', label: 'plain' };
    if (/nasomatto/.test(H)) return { shape: 4, cap: 'silver', label: 'gold', dark: true };
    if (/escentric/.test(H)) return { shape: 2, cap: 'silver', label: 'lab' };
    if (/marly|creed|xerjoff|initio|amouage/.test(H)) return { shape: hash(H) % 2 ? 2 : 3, cap: 'gold', label: 'cream' };
    if (/lutens/.test(H)) return { shape: 3, cap: 'black', label: 'cream' };
    if (/chanel|dior|hermes|guerlain|lancome|saint laurent|armani|givenchy|prada/.test(H)) return { shape: hash(N) % 2 ? 5 : 2, cap: /dior|chanel|saint laurent/.test(H) ? 'black' : 'silver', label: 'plain' };
    return { shape: hash(p.name) % 4, cap: ['dark', 'black', 'silver', 'gold'][hash(H) % 4], label: 'plain' };
  }

  const CAPS = { black: ['#4a4a52', '#141418', '#050507'], gold: ['#fbeab0', '#c99a35', '#7c5714'], silver: ['#ffffff', '#b4b8c2', '#6c7079'], wood: ['#b98650', '#7a4d26', '#3d240f'] };

  function capDefs(id, type, P) {
    const st = CAPS[type] || [P.b, P.c, P.d];
    return `<linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${st[1]}"/><stop offset=".28" stop-color="${st[0]}"/><stop offset=".62" stop-color="${st[1]}"/><stop offset="1" stop-color="${st[2]}"/></linearGradient>`;
  }
  const fit = (t, w, max) => Math.min(max, w / (Math.max(t.length, 1) * 0.62));

  function label(kind, p, sh, midY, P, dark) {
    const [x0, x1] = sh.x, w = Math.min(x1 - x0 - 10, 50), cx = 60, name = String(p.name).toUpperCase().replace(/ EDP| EDT/g, ''), house = String(p.house || '').toUpperCase();
    const ink = dark ? '#f3efe6' : '#141418';
    if (kind === 'lab') return `<rect x="${cx - w / 2}" y="${midY - 20}" width="${w}" height="40" rx="1.5" fill="#fbfbf8"/><text x="${cx}" y="${midY - 8}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fit(name, w - 4, 7)}" fill="#141418">${esc(name)}</text><text x="${cx}" y="${midY + 2}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="3.4" letter-spacing=".4" fill="#141418">EAU DE PARFUM</text><line x1="${cx - w / 2 + 4}" x2="${cx + w / 2 - 4}" y1="${midY + 8}" y2="${midY + 8}" stroke="#141418" stroke-width=".4"/><text x="${cx}" y="${midY + 16}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fit(house, w - 4, 5)}" letter-spacing=".8" fill="#141418">${esc(house)}</text>`;
    if (kind === 'oval') return `<ellipse cx="${cx}" cy="${midY}" rx="${w / 2 + 3}" ry="17" fill="#fbfbf8" stroke="#141418" stroke-width="1"/><ellipse cx="${cx}" cy="${midY}" rx="${w / 2 - 1}" ry="14" fill="none" stroke="#141418" stroke-width=".4"/><text x="${cx}" y="${midY - 2}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="6.4" fill="#141418">${esc(String(p.house).toLowerCase())}</text><text x="${cx}" y="${midY + 7}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fit(name, w, 4.4)}" letter-spacing=".5" fill="#141418">${esc(name)}</text>`;
    if (kind === 'cream') return `<rect x="${cx - w / 2}" y="${midY - 16}" width="${w}" height="32" fill="#f1e7cf" stroke="#b58e3c" stroke-width=".8"/><text x="${cx}" y="${midY - 4}" text-anchor="middle" font-family="Georgia, serif" font-size="${fit(house, w - 4, 4.8)}" letter-spacing="1" fill="#2a1c0a">${esc(house)}</text><line x1="${cx - 10}" x2="${cx + 10}" y1="${midY + 1}" y2="${midY + 1}" stroke="#b58e3c" stroke-width=".6"/><text x="${cx}" y="${midY + 10}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${fit(name, w - 4, 5.6)}" fill="#2a1c0a">${esc(p.name)}</text>`;
    if (kind === 'type') return `<rect x="${cx - w / 2}" y="${midY - 18}" width="${w}" height="36" fill="#efe6d2" stroke="#141418" stroke-width=".6"/><text x="${cx}" y="${midY - 8}" text-anchor="middle" font-family="Courier New, monospace" font-size="3.6" fill="#141418">REPLICA</text><text x="${cx}" y="${midY + 2}" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="${fit(name, w - 4, 5.4)}" fill="#141418">${esc(name)}</text><text x="${cx}" y="${midY + 12}" text-anchor="middle" font-family="Courier New, monospace" font-size="3.2" fill="#141418">EAU DE TOILETTE</text>`;
    if (kind === 'frost') return `<rect x="${cx - w / 2}" y="${midY - 18}" width="${w}" height="36" fill="rgba(255,255,255,.72)"/><text x="${cx}" y="${midY - 6}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fit(house, w - 4, 6)}" letter-spacing="1.2" fill="#141418">${esc(house)}</text><text x="${cx}" y="${midY + 6}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fit(name, w - 4, 4.2)}" letter-spacing=".4" fill="#141418">${esc(name)}</text>`;
    if (kind === 'gold') return `<rect x="${cx - w / 2}" y="${midY - 14}" width="${w}" height="28" fill="none" stroke="#d9b45a" stroke-width=".8"/><text x="${cx}" y="${midY - 2}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fit(name, w - 4, 5.6)}" letter-spacing=".8" fill="#d9b45a">${esc(name)}</text><text x="${cx}" y="${midY + 8}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="3.2" fill="#d9b45a">${esc(house)}</text>`;
    if (kind === 'mini') return `<rect x="${cx - 10}" y="${midY - 16}" width="20" height="32" fill="rgba(255,255,255,.85)"/><text transform="translate(${cx + 2.4} ${midY + 13}) rotate(-90)" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fit(name, 26, 5)}" letter-spacing=".6" fill="#141418">${esc(name)}</text>`;
    const ini = String(p.house || p.name).split(/[\s&]+/).filter(Boolean).map((x) => x[0]).join('').slice(0, 3).toUpperCase();
    return `<rect x="${cx - 18}" y="${midY - 13}" width="36" height="26" rx="3" fill="rgba(255,255,255,.9)"/><text x="${cx}" y="${midY + 4}" text-anchor="middle" font-family="DM Mono, ui-monospace, monospace" font-size="10" font-weight="500" fill="${ink}">${ini}</text>`;
  }
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function bottle(p, o) {
    o = o || {};
    const P = pal(p), A = arche(p), sh = SHAPES[A.shape], id = 'bt' + (++n);
    const level = o.level != null ? o.level : 0.7;
    const y = sh.top + (sh.bottom - sh.top) * (1 - level);
    const [nx, ny, nw, nh] = sh.neck, [cx, cy, cw, ch, cr] = sh.cap;
    const midY = (sh.top + sh.bottom) / 2 + 2;
    const liquidA = A.dark ? '#3a3a44' : P.a, liquidB = A.dark ? '#16161c' : P.b, liquidC = A.dark ? '#050507' : P.c;
    let mist = '';
    if (o.spray) {
      for (let i = 0; i < 11; i++) {
        const dx = 8 + (i * 7) % 46, dy = -18 - (i * 11) % 34, dl = (i * 0.19).toFixed(2), r = 1.6 + (i % 3);
        mist += `<circle class="mist" cx="${sh.nz[0] + 12}" cy="${sh.nz[1] + 6}" r="${r}" fill="${P.a}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${dl}s"/>`;
      }
    }
    const bub = [0, 1, 2].map((i) => `<circle class="lb" cx="${sh.x[0] + 12 + i * 15}" cy="${sh.bottom - 8}" r="${1.2 + i * 0.5}" fill="#fff" style="animation-delay:${i * 1.4}s;--rise:${-(sh.bottom - y - 14)}px"/>`).join('');
    return `<svg class="bt" viewBox="-6 -8 132 214" role="img" aria-label="Flacon ${String(p.name).replace(/"/g, '')}">
<defs>
<linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquidA}"/><stop offset=".5" stop-color="${liquidB}"/><stop offset="1" stop-color="${liquidC}"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".22" stop-color="#fff" stop-opacity=".08"/><stop offset=".78" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".38"/></linearGradient>
${capDefs(id, A.cap, P)}
<clipPath id="${id}k"><path d="${sh.body}"/></clipPath>
</defs>
<ellipse class="shadow" cx="60" cy="195" rx="38" ry="5" fill="rgba(20,16,40,.24)"/>
<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" fill="url(#${id}g)" stroke="rgba(255,255,255,.75)" stroke-width="1.3"/>
<path d="${sh.body}" fill="url(#${id}g)"/>
<g clip-path="url(#${id}k)">
<rect x="0" y="${y}" width="120" height="200" fill="url(#${id}l)"/>
<g transform="translate(0 ${y - 6})"><path class="wv w1" d="${WAVE}" fill="url(#${id}l)"/><path class="wv w2" d="${WAVE}" fill="${liquidA}" opacity=".4"/></g>
<ellipse cx="60" cy="${y}" rx="${(sh.x[1] - sh.x[0]) / 2}" ry="2.2" fill="#fff" opacity=".35"/>
${bub}
<rect class="shine" x="${sh.x[0] + 4}" y="${sh.top}" width="6" height="${sh.bottom - sh.top}" rx="3" fill="#fff" opacity=".42"/>
<rect x="${sh.x[0]}" y="${sh.bottom - 10}" width="${sh.x[1] - sh.x[0]}" height="10" fill="#fff" opacity=".2"/>
${label(A.label, p, sh, midY, P, A.dark)}
</g>
<path d="${sh.body}" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.5"/>
<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${cr}" fill="url(#${id}c)"/>
<rect x="${cx}" y="${cy + ch - 3}" width="${cw}" height="3" fill="rgba(255,255,255,.28)"/>
<rect x="${cx + 3.5}" y="${cy + 3}" width="3.5" height="${ch - 6}" rx="1.75" fill="#fff" opacity=".3"/>
${mist}
</svg>`;
  }

  root.Art = { bottle, pal, famColor, hash, noGreen };
})(window);
