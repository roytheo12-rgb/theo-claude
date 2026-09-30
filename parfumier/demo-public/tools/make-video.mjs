// Fabrique la vidéo MP4 4K verticale qui fait le tour de l'app en mode présentation (2160×3840, 30 im/s).
// Lance : node tools/make-video.mjs            (résultat normal : Jazz Club)
//         VARIANT=amara node tools/make-video.mjs   (résultat Néroli Amara)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { chromium, PORT, close } from './serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(here, '../media'); fs.mkdirSync(OUT, { recursive: true });
const AMARA = process.env.VARIANT === 'amara', NAME = AMARA ? 'sillage-story-neroli' : 'sillage-story';
const W = 405, H = 720, DPR = 2160 / W;               // 405×720 px CSS × 5,333 = 2160×3840 px réels
const dir = path.join(OUT, 'frames4k'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('ERREUR JS', e.message));
const cdp = await ctx.newCDPSession(pg); const ts = []; let pending = Promise.resolve();
cdp.on('Page.screencastFrame', (f) => {
  const i = ts.length; ts.push(f.metadata.timestamp);
  pending = pending.then(() => fs.promises.writeFile(path.join(dir, String(i).padStart(5, '0') + '.jpg'), Buffer.from(f.data, 'base64')));
  cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
const wait = (ms) => pg.waitForTimeout(ms);
const glide = (y, ms) => pg.evaluate(([y, ms]) => new Promise((res) => { const y0 = scrollY, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, y0 + (y - y0) * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), [y, ms]);
const bottom = () => pg.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const glidePanel = (y, ms) => pg.evaluate(([y, ms]) => new Promise((res) => { const el = document.querySelector('#sheet .panel'); if (!el) return res(); const y0 = el.scrollTop, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.scrollTop = y0 + (y - y0) * e; k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), [y, ms]);
const glideX = (sel, x, ms) => pg.evaluate(([sel, x, ms]) => new Promise((res) => { const el = document.querySelector(sel); if (!el) return res(); const x0 = el.scrollLeft, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.scrollLeft = x0 + (x - x0) * e; k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), [sel, x, ms]);
const tab = async (t) => { await pg.click(`[data-tab=${t}]`); await wait(900); await pg.evaluate(() => scrollTo(0, 0)); await wait(300); };
const closeSheet = async () => { await pg.evaluate(() => { const v = document.querySelector('#sheet .veil'); if (v) v.click(); }); await wait(700); };
const tap = () => pg.mouse.click(300, 360);

await pg.goto(`http://localhost:${PORT}/?present=1`);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 2160, maxHeight: 3840, everyNthFrame: 2 });

// 1. Intro : écran d'accueil animé puis les 4 scènes de l'onboarding
await pg.waitForSelector('#onbGo', { state: 'attached', timeout: 20000 }); await pg.waitForFunction(() => document.querySelector('#os4.on'), null, { timeout: 20000 }); await wait(900);
await pg.click('#onbGo'); await wait(900);

// 2. Accueil : la journée, puis le mood et la météo
await pg.click('[data-cat=sorties]'); await wait(500);
await pg.click(AMARA ? '[data-sc=brunch]' : '[data-sc=apero]'); await wait(700);
await pg.click('[data-refine]'); await wait(600);
await pg.click('[data-mood=joyeux]'); await wait(500);
await pg.click(AMARA ? '[data-wx=chaud]' : '[data-wx=doux]'); await wait(500);
await glide(await bottom() * 0.55, 1200); await wait(500);
await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .hero-bottle, #story:not([hidden]) .lead', { timeout: 30000 });

// 3. La story du parfum du jour
await wait(1500); await tap(); await wait(3300); await tap(); await wait(2500); await tap(); await wait(3300); await tap(); await wait(4200);
await pg.click('#stx'); await wait(1200);

// 4. Accueil après la story : parfum porté, journal, collection, semaine et voyage
await glide(await bottom() * 0.5, 2200); await wait(700);
await glide(await bottom(), 2000); await wait(500);
await pg.evaluate(() => scrollTo(0, 0)); await wait(200);
await pg.evaluate(() => document.querySelector('#weekBtn').scrollIntoView({ block: 'center' })); await wait(600);
await pg.click('#weekBtn'); await wait(1300); await glidePanel(700, 2600); await wait(600); await closeSheet();
await pg.click('#travelBtn'); await wait(1300); await glidePanel(500, 2000); await wait(600); await closeSheet();

// 5. Étagère
await tab('shelf'); await wait(700);
await glide(1500, 3600); await wait(600); await glide(0, 1800); await wait(300);
await pg.click('.pcard'); await wait(1800); await glidePanel(600, 2200); await wait(500); await closeSheet();

// 6. Découvrir
await tab('discover'); await wait(800); await glide(700, 2200); await wait(600);
await glideX('.snap', 900, 3200); await wait(500); await glide(0, 1600); await wait(300);

// 7. Balade olfactive : la balade rue Saint-Honoré, retrouver une touche, bilan
await tab('walk'); await wait(700);
await pg.click('.wcard'); await wait(1300); await glide(900, 2600); await wait(500);
await pg.evaluate(() => document.querySelector('#wSum') && document.querySelector('#wSum').scrollIntoView({ block: 'center', behavior: 'smooth' })); await wait(1000);
await pg.click('#wSum'); await wait(1500); await glide(await bottom(), 2200); await wait(1200);

// 8. Wishlist
await tab('wish'); await wait(700); await glide(1400, 3600); await wait(600); await glide(0, 1500); await wait(300);

// 9. Retour à l'accueil
await tab('today'); await wait(1800);
await cdp.send('Page.stopScreencast'); await pending; await pg.close(); await ctx.close(); await browser.close(); close();
const dur = ts.at(-1) - ts[0];
console.log('frames', ts.length, 'durée', dur.toFixed(1), 's', '→ ' + (ts.length / dur).toFixed(1) + ' im/s en moyenne');

// Assemblage : chaque image dure exactement le temps réel passé à l'écran, puis 30 im/s constants.
const lines = ts.map((t, i) => `file '${path.join(dir, String(i).padStart(5, '0') + '.jpg')}'\nduration ${((ts[i + 1] ?? t + 1.4) - t).toFixed(4)}`);
lines.push(`file '${path.join(dir, String(ts.length - 1).padStart(5, '0') + '.jpg')}'`);
const list = path.join(OUT, NAME + '.txt'); fs.writeFileSync(list, lines.join('\n'));
const ff = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const out = path.join(OUT, NAME + '-4k.mp4');
execFileSync(ff, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'fps=30,scale=2160:3840:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', '-an', out], { stdio: 'ignore' });
fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(list);
console.log(out, (fs.statSync(out).size / 1e6).toFixed(1), 'Mo');
