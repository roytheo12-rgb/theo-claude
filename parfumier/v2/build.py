import pathlib
d = pathlib.Path(__file__).parent
up = d.parent
shell = f"""<title>Sillage</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:opsz,wght@9..40,400..700&family=DM+Mono:wght@400;500&display=swap">
<style>
{(d/'style.css').read_text()}
</style>
<div id="app">
  <header class="bar"><div class="mark">sillage</div><button class="iconbtn" id="profileBtn" aria-label="Profil et sauvegarde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.8-5.4 7.2-5.4s6.3 1.8 7.2 5.4"/></svg></button></header>
  <main id="view"></main>
</div>
<nav class="dock" id="dock" aria-label="Navigation">
  <i class="ind"></i>
  <button data-tab="today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>aujourd'hui</button>
  <button data-tab="shelf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="10" width="10" height="11" rx="2.5"/><path d="M10 10V7.5h4V10M9.5 3.5h5v4h-5z"/></svg>étagère</button>
  <button data-tab="discover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>découvrir</button>
</nav>
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
{(d/'app.js').read_text()}
</script>
"""
out = d/'sillage.html'
out.write_text(shell)
print(out, len(shell))
