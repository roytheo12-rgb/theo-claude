// Flacons SVG animés : forme, couleur et liquide dérivés du parfum.
(function (root) {
  const BASE = { agrumes: 48, aquatique: 194, aromatique: 92, vert: 122, floral: 338, fruité: 6, gourmand: 24, ambré: 30, boisé: 148, épicé: 10, cuir: 350, musqué: 16, oud: 272 };
  const SAT = { musqué: 58, cuir: 50, boisé: 46, oud: 52, ambré: 78, gourmand: 66, épicé: 80 };
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  let n = 0;

  function pal(p) {
    const f = p.family;
    const h = ((BASE[f] != null ? BASE[f] : 150) + (hash(p.name) % 44) - 22 + 360) % 360;
    const s = SAT[f] != null ? SAT[f] : 72;
    return { h, s, a: `hsl(${h} ${s}% 78%)`, b: `hsl(${h} ${Math.min(92, s + 6)}% 60%)`, c: `hsl(${h} ${Math.min(90, s + 8)}% 33%)`, d: `hsl(${h} ${Math.max(18, s - 22)}% 13%)` };
  }
  const famColor = (f) => `hsl(${BASE[f] != null ? BASE[f] : 150} ${SAT[f] != null ? SAT[f] : 72}% 60%)`;

  const SHAPES = [
    { body: 'M30 78a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v94a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z', neck: [50, 54, 20, 18], cap: [44, 34, 32, 22, 4], top: 70, bottom: 180, nz: [60, 34] },
    { body: 'M16 125a44 52 0 1 0 88 0a44 52 0 1 0-88 0z', neck: [50, 58, 20, 22], cap: [46, 38, 28, 22, 8], top: 73, bottom: 177, nz: [60, 38] },
    { body: 'M40 64a14 14 0 0 1 14-14h12a14 14 0 0 1 14 14v108a14 14 0 0 1-14 14H54a14 14 0 0 1-14-14z', neck: [52, 42, 16, 10], cap: [46, 24, 28, 22, 5], top: 50, bottom: 186, nz: [60, 24] },
    { body: 'M60 62L98 90L92 182H28L22 90z', neck: [50, 50, 20, 14], cap: [47, 30, 26, 24, 4], top: 62, bottom: 182, nz: [60, 30] },
  ];
  const WAVE = 'M0 6Q15 0 30 6T60 6T90 6T120 6T150 6T180 6T210 6T240 6V90H0Z';

  function bottle(p, o) {
    o = o || {};
    const P = pal(p), sh = SHAPES[hash(p.name) % 4], id = 'bt' + (++n);
    const level = o.level != null ? o.level : 0.7;
    const y = sh.top + (sh.bottom - sh.top) * (1 - level);
    const ini = String(p.house || p.name).split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const [nx, ny, nw, nh] = sh.neck, [cx, cy, cw, ch, cr] = sh.cap;
    const midY = (sh.top + sh.bottom) / 2;
    let mist = '';
    if (o.spray) {
      for (let i = 0; i < 11; i++) {
        const dx = 8 + (i * 7) % 46, dy = -18 - (i * 11) % 34, dl = (i * 0.19).toFixed(2), r = 1.6 + (i % 3);
        mist += `<circle class="mist" cx="${sh.nz[0] + 12}" cy="${sh.nz[1] + 6}" r="${r}" fill="${P.a}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${dl}s"/>`;
      }
    }
    return `<svg class="bt" viewBox="-6 -8 132 214" role="img" aria-label="Flacon ${String(p.name).replace(/"/g, '')}">
<defs>
<linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.a}"/><stop offset=".5" stop-color="${P.b}"/><stop offset="1" stop-color="${P.c}"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
<linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.c}"/><stop offset="1" stop-color="${P.d}"/></linearGradient>
<clipPath id="${id}k"><path d="${sh.body}"/></clipPath>
</defs>
<ellipse class="shadow" cx="60" cy="194" rx="36" ry="5" fill="rgba(20,30,20,.22)"/>
<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" fill="url(#${id}g)" stroke="rgba(255,255,255,.7)" stroke-width="1.4"/>
<path d="${sh.body}" fill="url(#${id}g)"/>
<g clip-path="url(#${id}k)">
<rect x="0" y="${y}" width="120" height="200" fill="url(#${id}l)"/>
<g transform="translate(0 ${y - 6})"><path class="wv w1" d="${WAVE}" fill="url(#${id}l)"/><path class="wv w2" d="${WAVE}" fill="${P.a}" opacity=".45"/></g>
<rect class="shine" x="32" y="${sh.top}" width="7" height="${sh.bottom - sh.top}" rx="3.5" fill="#fff" opacity=".4"/>
<rect x="42" y="${midY - 13}" width="36" height="26" rx="3" fill="rgba(255,255,255,.9)"/>
<text x="60" y="${midY + 4}" text-anchor="middle" font-family="DM Mono, ui-monospace, monospace" font-size="10" font-weight="500" fill="${P.d}">${ini}</text>
</g>
<path d="${sh.body}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6"/>
<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${cr}" fill="url(#${id}c)"/>
<rect x="${cx + 4}" y="${cy + 3}" width="4" height="${ch - 6}" rx="2" fill="#fff" opacity=".28"/>
${mist}
</svg>`;
  }

  root.Art = { bottle, pal, famColor, hash };
})(window);
