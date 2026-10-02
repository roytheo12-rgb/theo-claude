"""Lit les fiches produits de Luckyscent (sitemap public, /products/ autorisé par robots.txt) à raison d'une page par seconde.
Sortie : data/web-raw/luckyscent.jsonl (une ligne par parfum : nom, maison, notes, image, prix, taille). Reprend là où il s'est arrêté.
Usage : python3 tools/crawl-luckyscent.py [limite]"""
import urllib.request, re, json, time, sys, html, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36 SillageBot/1.0 (contact roytheo12@gmail.com)'
SKIP = re.compile(r'candle|soap|lotion|shower|gel|body-|hair|sample|discovery|gift|set\b|-set|bundle|deodorant|cream|oil\b|diffuser|room-|incense-stick|cologne-wipes|travel-spray|refill|mist|bar-|wash|scrub|balm|serum|mask|bag|box|card|miniature|kit|trio|duo|coffret|-bundle', re.I)
out = root / 'data/web-raw/luckyscent.jsonl'
done = set()
if out.exists():
    for l in out.read_text(encoding='utf-8').splitlines():
        try: done.add(json.loads(l)['url'])
        except Exception: pass
urls = [u for u in json.load(open(root / 'data/web-raw/luckyscent-urls.json')) if '/products/' in u and '-by-' in u.rsplit('/', 1)[1] and not SKIP.search(u.rsplit('/', 1)[1])]
limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(urls)
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=40).read().decode('utf-8', 'ignore')
import threading
lock = threading.Lock()
todo = [u for u in urls if u not in done][:limit]
n = 0
f = out.open('a', encoding='utf-8')
def work(chunk):
    global n
    for u in chunk:
        n += 1
        try:
            h = get(u)
        except Exception as e:
            with lock: f.write(json.dumps({'url': u, 'err': str(e)[:80]}) + '\n'); f.flush()
            time.sleep(3); continue
        ld = re.findall(r'ld\+json[^>]*>(.*?)</script>', h, flags=re.S)
        d = {}
        for x in ld:
            try:
                j = json.loads(x)
                if isinstance(j, dict) and j.get('@type') in ('ProductGroup', 'Product'): d = j; break
            except Exception: pass
        t = re.sub(r'<script.*?</script>|<style.*?</style>', '', h, flags=re.S)
        t = html.unescape(re.sub(r'<[^>]+>', '\n', t)); t = re.sub(r'\n\s*\n+', '\n', t)
        notes, style = [], []
        m = re.search(r'Fragrance Notes\n(.*?)\nThe Scoop', t, flags=re.S)
        if m:
            raw = [x.strip() for x in re.split(r',|\n', m.group(1)) if x.strip()]
            if 'Fragrance Style' in raw: i = raw.index('Fragrance Style'); notes, style = raw[:i], raw[i + 1:]
            else: notes = raw
        offer = None
        for v in d.get('hasVariant', []) or []:
            offer = v.get('offers', {}); break
        rec = {'url': u, 'name': d.get('name'), 'house': (d.get('brand') or {}).get('name'), 'image': d.get('image'), 'notes': notes, 'price': (offer or {}).get('price'), 'cur': (offer or {}).get('priceCurrency'), 'size': (d.get('hasVariant') or [{}])[0].get('size') if d.get('hasVariant') else None, 'style': style}
        with lock: f.write(json.dumps(rec, ensure_ascii=False) + '\n'); f.flush()
        time.sleep(1.0)
ths = [threading.Thread(target=work, args=(todo[i::3],)) for i in range(3)]
[t.start() for t in ths]; [t.join() for t in ths]
print('fait', n)
