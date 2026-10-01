// Fabrique le GIF de la story, les GIF (les vidéos MP4 4K viennent de make-video.mjs) et l'image de partage (og.jpg). Lance : node tools/make-media.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { chromium, PORT, close } from './serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(here, '../media'); fs.mkdirSync(OUT, { recursive: true });
const AMARA = process.env.VARIANT === 'amara', SUF = AMARA ? '-neroli' : '';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// ---------- 1. Image de partage 1200x630 (scène d'accueil)
if (!AMARA) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } }); const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForSelector('#onb', { timeout: 9000 }); await pg.waitForTimeout(1900); await pg.addStyleTag({ content: '.onb-skip{display:none}' });
  await pg.screenshot({ path: path.join(OUT, 'og.jpg'), type: 'jpeg', quality: 88 }); await ctx.close();
}

// ---------- 2. Enregistrement de la story (frames réelles, avec leur horodatage)
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { localStorage.setItem('sillage.onb', '1'); localStorage.setItem('sillage.v3', JSON.stringify({ profile: { skipped: true } })); } catch (e) { /* ok */ } });
const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg); const frames = [];
cdp.on('Page.screencastFrame', async (f) => { frames.push({ t: f.metadata.timestamp, data: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) { /* fin */ } });
await pg.goto(`http://localhost:${PORT}/?seed=demo`); await pg.waitForTimeout(3300);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1 });
const t0 = Date.now(); const wait = (ms) => pg.waitForTimeout(ms);
await wait(500);
const steps = AMARA ? ['[data-cat=sorties]', '[data-sc=brunch]', '[data-refine]', '[data-mood=joyeux]', '[data-wx=chaud]'] : ['[data-cat=sorties]', '[data-sc=apero]', '[data-refine]', '[data-mood=joyeux]', '[data-wx=doux]'];
for (const sel of steps) { await pg.click(sel); await wait(400); }
await wait(300);
await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .hero-bottle, #story:not([hidden]) .lead', { timeout: 20000 });
await wait(1500);                                   // lecture de la journée
await pg.mouse.click(300, 400); await wait(3300);   // parfum du jour
await pg.mouse.click(300, 400); await wait(2500);   // notes
await pg.mouse.click(300, 400); await wait(3300);   // pourquoi
await pg.mouse.click(300, 400); await wait(4200);   // layering
await wait(600);
await cdp.send('Page.stopScreencast'); await pg.close(); await ctx.close();

// ---------- 3. Fichiers de frames pour Python (assemblage du GIF)
const dir = path.join(OUT, 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
frames.forEach((f, i) => fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.jpg'), Buffer.from(f.data, 'base64')));
fs.writeFileSync(path.join(OUT, 'frames.json'), JSON.stringify(frames.map((f) => f.t)));
console.log('frames', frames.length, 'durée', (frames.at(-1).t - frames[0].t).toFixed(1), 's');
