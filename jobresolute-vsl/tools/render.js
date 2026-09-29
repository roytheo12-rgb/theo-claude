// Rend une composition HTML (qui expose window.seek(t) et window.DURATION) en MP4.
// Usage : node tools/render.js motion/M06.html rendus/M06.mp4 [--fps 25]
// Variables : CHROME_PATH (Chromium), FFMPEG_PATH (ffmpeg).
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const [input, output] = process.argv.slice(2);
const argv = process.argv.join(' ');
const fps = Number((argv.match(/--fps (\d+)/) || [])[1] || 25);
const tail = Number((argv.match(/--tail ([\d.]+)/) || [])[1] || 0);
const chrome = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file://' + path.resolve(input), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round((duration + tail) * fps);
  const enc = spawn(ffmpeg, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', output], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
  }
  enc.stdin.end();
  await new Promise(r => enc.on('close', r));
  await browser.close();
  console.log(`${output} : ${frames} images, ${duration} s`);
})();
