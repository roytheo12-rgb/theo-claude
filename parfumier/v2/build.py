import pathlib
d = pathlib.Path(__file__).parent
up = d.parent
import sys, re

def js(path):
    return f"<script>\n{path.read_text()}\n</script>\n"

def imgweb_artifact():
    # L'artifact ne peut héberger qu'un nombre limité de fichiers : on n'y déclare que les photos publiées (liste dans data/artifact-imgweb.json).
    import json
    src = (up/'imgweb.js').read_text(); m = re.search(r'IMGWEB = (\{.*\});', src, re.S)
    allowed = set(json.loads((up/'data/artifact-imgweb.json').read_text())) if (up/'data/artifact-imgweb.json').exists() else set()
    d0 = json.loads(m.group(1)) if m else {}
    return "<script>\nwindow.IMGWEB = " + json.dumps({k: v for k, v in d0.items() if k in allowed}, ensure_ascii=False, separators=(',', ':')) + ";\n</script>\n"

def prompt_script():
    src = (d / 'prompt.mjs').read_text().replace('export function', 'function')
    return f"<script>\n{src}\nwindow.SillagePrompts = {{ day: dayPrompt, need: needPrompt }};\n</script>\n"

def page(scripts, head_extra=""):
    return f"""<title>Sillage</title>{head_extra}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap">
<style>
{(d/'style.css').read_text()}
</style>
<div id="app">
  <header class="bar"><div class="mark">sillage</div><button class="iconbtn" id="profileBtn" aria-label="Profil et sauvegarde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.8-5.4 7.2-5.4s6.3 1.8 7.2 5.4"/></svg></button></header>
  <main id="view"></main>
</div>
<nav class="dock" id="dock" aria-label="Navigation">
  <i class="ind"></i>
  <button data-tab="today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>accueil</button>
  <button data-tab="shelf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="7" y="10" width="10" height="11" rx="2"/><path d="M10 10V7.5h4V10M9.5 3.5h5v4h-5z"/></svg>étagère</button>
  <button data-tab="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>recherche</button>
  <button data-tab="tips"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>conseils</button>
  <button data-tab="walk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>balade</button>
  <button data-tab="wish"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 4h10v17l-5-3.6L7 21z"/></svg>wishlist</button>
</nav>
<div id="splash" role="presentation"><div><div class="lg">{"".join(f'<span style="--i:{i}">{c}</span>' for i,c in enumerate("sillage"))}</div><svg viewBox="0 0 200 14" fill="none" stroke="#b4394a" stroke-width="2.2" stroke-linecap="round"><path d="M0 7Q12 0 25 7T50 7T75 7T100 7T125 7T150 7T175 7T200 7"/></svg><div class="tg">Cabinet de parfumerie</div></div></div>
<div id="story" hidden></div>
<div id="sheet" hidden></div>
{scripts}"""

mode = sys.argv[1] if len(sys.argv) > 1 else "artifact"
if mode == "artifact":
    scripts = js(up/'data.js') + js(up/'desc.js') + js(up/'index.js') + js(up/'imgdb.js') + js(up/'imgnew.js') + imgweb_artifact() + js(up/'facts.js') + js(up/'fiches.js') + js(up/'profils.js') + js(up/'engine.js') + js(d/'art.js') + js(d/'fx.js') + prompt_script() + js(d/'app.js')
    out = d/'sillage.html'
    out.write_text(page(scripts))
    print(out, out.stat().st_size)

if mode == "public":
    import os, shutil
    site = os.environ.get("SITE_URL", "https://sillage-demo.example.workers.dev").rstrip("/")
    scripts = js(up/'data.js') + js(up/'desc.js') + js(up/'index.js') + js(up/'imgdb.js') + js(up/'imgnew.js') + js(up/'imgweb.js') + js(up/'facts.js') + js(up/'fiches.js') + js(up/'profils.js') + js(up/'engine.js') + js(d/'art.js') + js(d/'fx.js') + js(d/'demo.js') + js(d/'app.js')
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
<link rel="icon" href="{icon}">
{head_inner}</head><body>
{body_inner}</body></html>"""
    out_dir = d.parent / 'demo-public' / 'public'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir/'index.html').write_text(doc)
    if (out_dir/'img').exists(): shutil.rmtree(out_dir/'img')
    shutil.copytree(d/'img', out_dir/'img')
    shutil.copy(d/'prompt.mjs', d.parent/'demo-public'/'src'/'prompt.mjs')
    print(out_dir/'index.html', (out_dir/'index.html').stat().st_size)
