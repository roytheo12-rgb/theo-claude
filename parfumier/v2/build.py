import pathlib
d = pathlib.Path(__file__).parent
up = d.parent
import sys, re, subprocess
subprocess.run([sys.executable, str(up/'tools/build-editorial.py')], check=True, stdout=subprocess.DEVNULL)      # fiches éditoriales structurées -> editorial.js (+ parfums manquants dans keep-perfumes)
subprocess.run([sys.executable, str(up/'tools/prune.py')], check=True)
subprocess.run([sys.executable, str(up/'tools/build-expert.py')], check=True)      # sélection d'experts -> expert.js      # retire les maisons et parfums écartés (data/removed-*.txt) avant tout assemblage
subprocess.run([sys.executable, str(up/'tools/add-kept.py')], check=True)      # parfums gardés malgré une maison retirée
subprocess.run(['node', str(up/'tools/build-playlists.js')], check=True, stdout=subprocess.DEVNULL)
subprocess.run([sys.executable, str(up/'tools/build-covers.py')], check=True)
subprocess.run([sys.executable, str(up/'tools/build-intel.py')], check=True, stdout=subprocess.DEVNULL)      # descriptions + playlists -> descintel.js (moteur)
subprocess.run(['node', str(up/'tools/build-bios.js')], check=True, stdout=subprocess.DEVNULL)      # bio de chaque parfum = fusion de ses phrases de playlists
subprocess.run(['node', str(up/'tools/build-enrich.js')], check=True, stdout=subprocess.DEVNULL)      # nez, famille, année, prix (estimé si inconnu) -> enrich.js
subprocess.run(['node', str(up/'tools/build-playlists.js')], check=True, stdout=subprocess.DEVNULL)      # 2e passage : repère les couvertures disponibles      # relie les playlists à la base nettoyée

def js(path):
    return f"<script>\n{path.read_text()}\n</script>\n"

def _obj(name):
    import json
    src = (up/(name + '.js')).read_text(); m = re.search(r'window\.' + name.upper() + r' = (\{.*?\});', src, re.S)
    return json.loads(m.group(1)) if m else {}

def imgpack_artifact(pack_mb=5):
    # L'artifact ne peut héberger qu'environ 510 fichiers : les photos fournies (img/*.webp, img/p, img/nose) restent des fichiers ;
    # TOUTES les photos de base (IMGDB) et web (IMGWEB) sont regroupées en paquets pk/N.wasm (maisons les plus connues d'abord) lus par v2/imgpack.js.
    import json, unicodedata, hashlib
    fame = {}
    for i, h in enumerate(re.findall(r"'((?:[^'\\]|\\.)+)'", re.search(r'HOUSE_FAME\s*=\s*\[(.*?)\]', (up/'desc.js').read_text(), re.S).group(1))):
        fame.setdefault(re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFD', h.lower()).encode('ascii', 'ignore').decode()).strip(), i)
    new = _obj('imgnew'); db, web = _obj('imgdb'), _obj('imgweb')
    items = {}
    for k, v in new.items():      # les photos fournies passent en tête des paquets (chargées les premières)
        if v.startswith('img/p/') and (d/v).exists(): items.setdefault(v, -1)
    for k, v in list(db.items()) + list(web.items()):
        if (d/v).exists(): items.setdefault(v, fame.get(k.split('|')[0], 999))
    order = sorted(items, key=lambda v: (items[v], v))
    out = d/'pk'; out.mkdir(exist_ok=True)
    for f in out.glob('*.wasm'): f.unlink()
    idx, n, cur, size, names = {}, 0, bytearray(), 0, []
    def flush():
        nonlocal n, cur
        if cur:
            nm = hashlib.sha1(bytes(cur)).hexdigest()[:10]; (out/f'{nm}.wasm').write_bytes(bytes(cur)); names.append(nm); n += 1; cur = bytearray()
    for v in order:
        data = (d/v).read_bytes()
        if len(cur) + len(data) > pack_mb * 1024 * 1024: flush()
        idx[v] = [n, len(cur), len(data)]; cur += data
    flush()
    fixed = set(v for v in new.values() if not v.startswith('img/p/')) | set(re.findall(r'img/nose/[a-z0-9\-]+\.webp', (up/'imgnew.js').read_text())) | set('img/' + f.name for f in (d/'img').glob('*.webp')) | set('img/pl/' + f.name for f in (d/'img'/'pl').glob('*.webp')) | set('img/matieres/' + f.name for f in (d/'img'/'matieres').glob('*.webp'))
    files = sorted(fixed | {f'pk/{nm}.wasm' for nm in names})
    idx = {v: [names[a], b, c] for v, (a, b, c) in idx.items()}
    (d/'artifact-files.json').write_text(json.dumps(files), encoding='utf-8')
    return "<script>\nwindow.IMGPACK = " + json.dumps(idx, separators=(',', ':')) + ";\n</script>\n" + js(d/'imgpack.js')

def prompt_script():
    src = (d / 'prompt.mjs').read_text().replace('export function', 'function')
    return f"<script>\n{src}\nwindow.SillagePrompts = {{ day: dayPrompt, need: needPrompt }};\n</script>\n"

def cfg_script():
    import os, json
    cfg = {"whopPremium": os.environ.get("WHOP_URL_PREMIUM", ""), "whopFounder": os.environ.get("WHOP_URL_FOUNDER", ""), "whopHub": os.environ.get("WHOP_URL_HUB", "https://whop.com/hub"), "support": os.environ.get("SUPPORT_EMAIL", "")}
    return "<script>window.SILLAGE_CFG = " + json.dumps(cfg) + ";</script>\n"

def page(scripts, head_extra=""):
    return f"""<title>Sillage</title>{head_extra}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap">
<style>
{(d/'style.css').read_text()}
</style>
<div id="app">
  <header class="bar"><div class="mark">sillage</div><div class="barr"><button class="iconbtn" id="bellBtn" aria-label="Notifications" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg><b id="bellN" hidden></b></button><button class="iconbtn" id="profileBtn" aria-label="Profil et sauvegarde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.8-5.4 7.2-5.4s6.3 1.8 7.2 5.4"/></svg></button></div></header>
  <main id="view"></main>
</div>
<nav class="dock" id="dock" aria-label="Navigation">
  <i class="ind"></i>
  <button data-tab="today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>accueil</button>
  <button data-tab="shelf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="7" y="10" width="10" height="11" rx="2"/><path d="M10 10V7.5h4V10M9.5 3.5h5v4h-5z"/></svg>étagère</button>
  <button data-tab="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>recherche</button>
  <button data-tab="tips"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>pour toi</button>
  <button data-tab="play"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/></svg>inspirations</button>
  <button data-tab="walk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>balade</button>
  <button data-tab="wish"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20.5c.8-3.8 3.8-5.8 7-5.8s6.2 2 7 5.8"/></svg>profil</button>
</nav>
<div id="splash" role="presentation"><div><div class="lg">{"".join(f'<span style="--i:{i}">{c}</span>' for i,c in enumerate("sillage"))}</div><svg viewBox="0 0 200 14" fill="none" stroke="#b4394a" stroke-width="2.2" stroke-linecap="round"><path d="M0 7Q12 0 25 7T50 7T75 7T100 7T125 7T150 7T175 7T200 7"/></svg><div class="tg">Cabinet de parfumerie</div></div></div>
<div id="story" hidden></div>
<div id="sheet" hidden></div>
{scripts}"""

mode = sys.argv[1] if len(sys.argv) > 1 else "artifact"
if mode == "artifact":
    scripts = js(up/'data.js') + js(up/'desc.js') + js(up/'tips.js') + js(up/'playlists.js') + js(up/'houseorder.js') + js(up/'bios.js') + js(up/'index.js') + js(up/'imgdb.js') + js(up/'imgnew.js') + js(up/'imgweb.js') + imgpack_artifact() + js(up/'facts.js') + js(up/'fiches.js') + js(up/'profils.js') + js(up/'descintel.js') + js(up/'editorial.js') + js(up/'enrich.js') + js(up/'shops.js') + js(up/'expert.js') + js(up/'engine.js') + js(d/'art.js') + js(d/'fx.js') + prompt_script() + js(d/'app.js') + js(d/'artifact-backend.js') + js(d/'product.js') + js(d/'social-ui.js')
    out = d/'sillage.html'
    out.write_text(page(scripts))
    print(out, out.stat().st_size)

if mode == "public":
    import os, shutil
    site = os.environ.get("SITE_URL", "https://sillage-demo.example.workers.dev").rstrip("/")
    scripts = js(up/'data.js') + js(up/'desc.js') + js(up/'tips.js') + js(up/'playlists.js') + js(up/'houseorder.js') + js(up/'bios.js') + js(up/'index.js') + js(up/'imgdb.js') + js(up/'imgnew.js') + js(up/'imgweb.js') + js(up/'facts.js') + js(up/'fiches.js') + js(up/'profils.js') + js(up/'descintel.js') + js(up/'editorial.js') + js(up/'enrich.js') + js(up/'shops.js') + js(up/'expert.js') + js(up/'engine.js') + js(d/'art.js') + js(d/'fx.js') + cfg_script() + js(d/'demo.js') + js(d/'app.js') + js(d/'product.js') + js(d/'social-ui.js')
    html = page(scripts)
    cut = html.index('<div id="app">')
    head_inner, body_inner = html[:cut], html[cut:]
    head_inner = head_inner.replace("<title>Sillage</title>", "")
    icon = "data:image/svg+xml," + (up/'icon.svg').read_text().replace("#", "%23").replace("\n", "").replace('"', "'").replace("<", "%3C").replace(">", "%3E")
    doc = f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#08080a">
<title>Sillage — ton parfum du jour</title>
<meta name="description" content="Décris ta journée : Sillage choisit le bon parfum dans ta collection et te montre comment le layerer. 2 essais gratuits.">
<meta property="og:type" content="website"><meta property="og:title" content="Sillage — ton parfum du jour"><meta property="og:description" content="Météo, mood, tenue, journée : l'IA choisit dans ta collection. 2 essais gratuits.">
<meta property="og:image" content="{site}/og.jpg"><meta property="og:url" content="{site}/"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{icon}"><link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Sillage"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
{head_inner}</head><body>
{body_inner}</body></html>"""
    out_dir = d.parent / 'demo-public' / 'public'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir/'index.html').write_text(doc)
    for f in (d/'pwa').iterdir(): shutil.copy(f, out_dir/f.name)          # manifeste, service worker, icônes : l'appli s'installe sur l'écran d'accueil
    if (out_dir/'img').exists(): shutil.rmtree(out_dir/'img')
    shutil.copytree(d/'img', out_dir/'img')
    shutil.copy(d/'prompt.mjs', d.parent/'demo-public'/'src'/'prompt.mjs')
    print(out_dir/'index.html', (out_dir/'index.html').stat().st_size)
