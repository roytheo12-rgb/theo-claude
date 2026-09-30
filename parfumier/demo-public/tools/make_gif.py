"""Assemble le GIF à partir des frames enregistrées. Usage : python3 tools/make_gif.py [largeur] [images/s] [couleurs]"""
import json, sys, pathlib
from PIL import Image
here = pathlib.Path(__file__).parent.parent / 'media'
W = int(sys.argv[1]) if len(sys.argv) > 1 else 320
FPS = int(sys.argv[2]) if len(sys.argv) > 2 else 12
COLORS = int(sys.argv[3]) if len(sys.argv) > 3 else 96
ts = json.load(open(here / 'frames.json'))
t0, t1 = ts[0], ts[-1]
steps = int((t1 - t0) * FPS)
picks, j = [], 0
for i in range(steps):
    t = t0 + i / FPS
    while j + 1 < len(ts) and ts[j + 1] <= t: j += 1
    picks.append(j)
imgs, durs = [], []
last = None
for idx in picks:
    if idx == last and durs:
        durs[-1] += int(1000 / FPS); continue
    im = Image.open(here / 'frames' / f'{idx:04d}.jpg').convert('RGB')
    h = round(im.height * W / im.width); im = im.resize((W, h), Image.LANCZOS)
    imgs.append(im.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)); durs.append(int(1000 / FPS)); last = idx
durs[-1] += 1400  # respiration finale avant la boucle
out = here / 'sillage-story.gif'
imgs[0].save(out, save_all=True, append_images=imgs[1:], duration=durs, loop=0, optimize=True, disposal=1)
print(out, round(out.stat().st_size / 1e6, 2), 'Mo', len(imgs), 'images')
