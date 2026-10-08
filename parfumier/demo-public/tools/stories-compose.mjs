// Compose les captures de l'appli (tools/stories.mjs) en visuels de story 1080 × 1920, avec titre et mention « exemple d'usage ».
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { createRequire } from 'node:module';
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');
const RAW = '/tmp/stories/raw', OUT = process.argv[2] || '/tmp/stories/out'; fs.mkdirSync(OUT, { recursive: true });
const FRAMES = [
  ['01-conseil', 'story1', 'Dis où tu vas.', 'Sillage choisit ton parfum.'],
  ['02-notes', 'story2', 'Tête, cœur, fond :', 'ce que tu vas sentir.'],
  ['03-pourquoi', 'story3', 'Et il t\'explique', 'pourquoi celui-ci.'],
  ['04-layering', 'story4', 'Ose le layering.', 'Il te dit quoi mélanger.'],
  ['05-voyage', 'voyage_q', 'Quelques questions simples,', 'pour qu\'il te connaisse.'],
  ['06-portrait', 'voyage_portrait', 'Ton portrait olfactif.', 'Ce qu\'il a compris de toi.'],
  ['07-univers', 'univers', '138 univers', 'à explorer.'],
  ['08-fil', 'feed', 'Suis tes amis', 'et leurs trouvailles.'],
  ['09-avis', 'fiche_avis', 'Sur chaque parfum,', 'l\'avis de ceux que tu suis.'],
  ['10-communaute', 'communaute', 'Les playlists de la communauté,', 'rangées par catégorie.'],
  ['11-profil', 'profil', 'Ton profil, tes playlists,', 'tes abonnés.'],
  [ '12-final', null, 'Sillage', 'Ton parfumier privé.' ],
];
const b64 = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(RAW, n + '.png')).toString('base64');
const page = (title, sub, img, last) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;background:radial-gradient(120% 60% at 50% 0%,#5a1224 0%,#200812 38%,#08080a 75%);color:#f2ebe0;font-family:Inter,"Helvetica Neue",Helvetica,Arial,"Liberation Sans",sans-serif;position:relative}
.mark{position:absolute;top:112px;left:0;right:0;text-align:center;font-size:26px;letter-spacing:.62em;text-indent:.62em;color:#d9b9a8;font-weight:500}
h1{position:absolute;top:${last ? 700 : 250}px;left:60px;right:60px;text-align:center;font-weight:300;font-size:${last ? 150 : 70}px;line-height:1.08;letter-spacing:-.025em}
h2{position:absolute;top:${last ? 900 : 350}px;left:60px;right:60px;text-align:center;font-weight:300;font-size:${last ? 56 : 44}px;line-height:1.2;color:#d9b9a8;letter-spacing:-.01em}
.tag{position:absolute;top:${last ? 1010 : 432}px;left:0;right:0;text-align:center;font-size:19px;letter-spacing:.28em;text-indent:.28em;color:#8b7f78;text-transform:uppercase}
.ph{position:absolute;left:219px;top:500px;width:642px;height:1390px;border-radius:60px;overflow:hidden;box-shadow:0 0 0 3px #2b2326,0 50px 120px rgba(0,0,0,.65),0 0 140px rgba(180,57,74,.25)}
.ph img{width:100%;display:block}
.cta{position:absolute;top:1180px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:.2em;text-indent:.2em;color:#08080a}
.cta span{display:inline-block;background:#f2ebe0;padding:26px 56px;border-radius:6px;font-weight:600}
</style>
${last ? '' : '<div class="mark">SILLAGE</div>'}
<h1>${title}</h1><h2>${sub}</h2>
<div class="tag">${last ? 'Exemples d\'usage : écrans simulés' : 'Exemple d\'usage · écran simulé'}</div>
${last ? '<div class="cta"><span>LIEN EN BIO</span></div>' : `<div class="ph"><img src="${img}"></div>`}`;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
for (const [id, raw, t, s] of FRAMES) {
  await pg.setContent(page(t, s, raw ? b64(raw) : '', !raw)); await pg.waitForTimeout(250);
  await pg.screenshot({ path: path.join(OUT, 'sillage-story-' + id + '.jpg'), type: 'jpeg', quality: 92 });
}
await browser.close(); console.log(FRAMES.length, 'visuels dans', OUT);
