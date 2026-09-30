import pathlib
d = pathlib.Path(__file__).parent
up = d.parent
shell = f"""<title>Sillage</title>
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
  <button data-tab="discover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>découvrir</button>
  <button data-tab="walk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>balade</button>
  <button data-tab="wish"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 4h10v17l-5-3.6L7 21z"/></svg>wishlist</button>
</nav>
<div id="splash" role="presentation"><div><div class="lg">{"".join(f'<span style="--i:{i}">{c}</span>' for i,c in enumerate("sillage"))}</div><svg viewBox="0 0 200 14" fill="none" stroke="#cfae72" stroke-width="2.2" stroke-linecap="round"><path d="M0 7Q12 0 25 7T50 7T75 7T100 7T125 7T150 7T175 7T200 7"/></svg><div class="tg">Cabinet de parfumerie</div></div></div>
<div id="story" hidden></div>
<div id="sheet" hidden></div>
<script>
{(up/'data.js').read_text()}
</script>
<script>
{(up/'engine.js').read_text()}
</script>
<script>
{(d/'art.js').read_text()}
</script>
<script>
{(d/'fx.js').read_text()}
</script>
<script>
{(d/'app.js').read_text()}
</script>
"""
out = d/'sillage.html'
out.write_text(shell)
print(out, len(shell))
