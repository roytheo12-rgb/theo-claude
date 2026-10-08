// Prix officiels (hors promotion) par maison, concentration et format de référence.
// Source : liste donnée par Théo (octobre 2026) + relevés sur les sites officiels et captures (data/prix-photos/).
// Un prix relevé pour un parfum précis (data/prix-connus.txt) passe toujours avant ce barème.
// Les lignes privées d'une maison mixte (Les Exclusifs, La Collection Privée, Privé, Hermessence…) ne suivent pas le barème de la maison.
const re = (s) => new RegExp(s);
const cls = (n) => {
  if (/\bextrait|\bextract|\bl extrait|\bessence de parfum|\besprit de parfum/.test(n)) return 'extrait';
  if (/\belixir|\bintensely|\babsolu/.test(n)) return 'elixir';
  if (/\bcologne|\beau fraiche|\bcolognise|\bcologne forte|\beau de cologne/.test(n)) return 'cologne';
  if (/\bedt\b|\beau de toilette/.test(n)) return 'edt';
  if (/\ble parfum$|\bparfum$|\bparfum\b(?! d)/.test(n)) return 'parfum';
  return 'edp';
};
const T = {
  'chanel': { edp: [176, 100], edt: [150, 75], extrait: [415, 30], cologne: [260, 75], parfum: [176, 100], elixir: [176, 100] },
  'dior': { edp: [172, 100], edt: [128, 100], parfum: [155, 75], extrait: [260, 15], cologne: [128, 100], elixir: [155, 75] },
  'yves saint laurent': { edp: [142, 100], edt: [125, 100], parfum: [170, 100], extrait: [495, 50], cologne: [125, 100], elixir: [170, 100] },
  'guerlain': { edp: [153, 90], edt: [137, 90], extrait: [355, 30], parfum: [155, 100], cologne: [118, 100], elixir: [153, 90] },
  'hermes': { edt: [128, 100], edp: [146, 100], parfum: [158, 75], extrait: [158, 75], cologne: [128, 100], elixir: [146, 100] },
  'tom ford': { edp: [346.95, 100], parfum: [219, 100], extrait: [219, 100], edt: [147.45, 100], cologne: [147.45, 100], elixir: [346.95, 100] },
  'armani': { edt: [110, 75], edp: [130, 75], parfum: [152, 75], extrait: [152, 75], elixir: [127, 50], cologne: [110, 75] },
  'louis vuitton': { edp: [300, 100], extrait: [575, 100], parfum: [300, 100], elixir: [300, 100], edt: [300, 100], cologne: [300, 100] },
  'jean paul gaultier': { edt: [123, 125], edp: [154, 100], parfum: [146, 125], elixir: [146, 125], extrait: [146, 125], cologne: [123, 125] },
  'byredo': { edp: [245, 100], elixir: [295, 100], extrait: [340, 70], parfum: [245, 100], edt: [245, 100], cologne: [245, 100] },
  'le labo': { edp: [305, 100] },
  'maison francis kurkdjian': { edp: [265, 70], extrait: [375, 70], edt: [195, 70], cologne: [195, 70], parfum: [265, 70], elixir: [375, 70] },
  'diptyque': { edt: [155, 100], edp: [180, 75], cologne: [155, 100] },
  'maison margiela': { edt: [153, 100], edp: [165, 100], cologne: [153, 100] },
  'jo malone': { cologne: [152, 100], intense: [205, 100] },
  'creed': { edp: [330, 100] },
  'parfums de marly': { edp: [285, 75], extrait: [450, 100], parfum: [450, 100] },
  'kilian': { edp: [370, 100], extrait: [215, 30], cologne: [250, 50] },
  'contes de parfums': { edp: [230, 100] },
  'les eaux primordiales': { edp: [190, 100], extrait: [315, 100] },
  'd orsay': { edp: [180, 90], edt: [180, 90], extrait: [250, 90] },
  'place de la reverie': { extrait: [220, 50], edp: [220, 50] },
  'giardini di toscana': { edp: [140, 100] },
  'ella k': { edp: [265, 100] },
  'dries van noten': { edp: [330, 100] },
  'clive christian': { parfum: [565, 100], edp: [565, 100] },
  'oman luxury': { edp: [189, 100] },
  'initio': { edp: [320, 90], extrait: [290, 90] },
  'nishane': { extrait: [345, 100], edp: [345, 100], cologne: [175, 100] },
  'amouage': { edp: [365, 100], extrait: [510, 100] },
  'frederic malle': { edp: [350, 100], cologne: [320, 100], edt: [320, 100], extrait: [350, 100], parfum: [350, 100], elixir: [350, 100] },
  'xerjoff': { edp: [245, 100], parfum: [545, 100], extrait: [545, 100], elixir: [545, 100], cologne: [245, 100], edt: [245, 100] },
  'acqua di parma': { cologne: [165, 100], edp: [235, 100], edt: [165, 100], extrait: [275, 50], parfum: [275, 50] },
  'penhaligon s': { cologne: [160, 100], edp: [245, 100], edt: [160, 100] },
  'serge lutens': { edp: [252, 100], parfum: [395, 100], extrait: [395, 100] },
  'l artisan parfumeur': { edp: [195, 100], edt: [170, 100], cologne: [170, 100] },
  'maison crivelli': { edp: [190, 100], extrait: [350, 100] },
  'ex nihilo': { edp: [280, 100], extrait: [390, 100] },
  'bdk parfums': { edp: [225, 100], extrait: [280, 100] },
  'marc antoine barrois': { edp: [200, 100], extrait: [275, 50] },
  'matiere premiere': { edp: [250, 100], extrait: [360, 100] },
  'memo paris': { edp: [255, 100] },
  'houbigant': { edp: [200, 100], edt: [140, 120], extrait: [460, 100] },
  'essential parfums': { edp: [94, 100], extrait: [98, 30] },
  'parfum d empire': { edp: [190, 100], extrait: [190, 100] },
  'horace': { edp: [98, 100], extrait: [118, 50] },
  'une nuit nomade': { edp: [160, 100], extrait: [260, 100] },
  'floraiku': { edp: [295, 100] },
  'les indemodables': { cologne: [155, 100], edp: [320, 100], extrait: [320, 100] },
};
// Lignes privées : on ne leur applique pas le barème de la maison (elles gardent leur prix relevé ou estimé)
const PRIV = {
  'chanel': re('^(coromandel|sycomore|bois des iles|le lion de chanel|cuir de russie|31 rue cambon|boy chanel|jersey|bel respiro|gardenia|comete|beige|n 22|1932|misia|la pausa|1957|n 18|eau de cologne|28 la pausa|paris |le lion$)'),
  'dior': re('^(bois d argent|ambre nuit|eau noire|cologne blanche|mitzah|leather oud|new look|patchouli imperial|granville|vetiver|la colle noire|cuir cannage|oud ispahan|grand bal|gris montaigne|gris dior|feve delicieuse|balade sauvage|belle de jour|dioramour|diorissima|dioriviera|eden roc|happy hour|holy peony|jasmin des anges|lucky|oud rosewood|purple oud|rose gipsy|rose kabuki|rouge trafalgar|sakura|santal noir|souffle de soie|spice blend|terra bella|the cachemire|tobacolor|vanilla diorama|bois talisman|cuir saddle|dior paradise|escale a portofino|fleurs de rocaille|le muguet|rose star|vetiver extraordinaire|diorama|diorella|dioressence|diorling|midnight charm|or poudre)|esprit de parfum'),
  'guerlain': re('^(eau de coton|eau de cashmere|eau de lingerie|eau de popeline|eau de tulle|angelique noire|cherry oud|cuir beluga|feve gourmande|musc outreblanc|peche mirage|spiritueuse double vanille|tobacco honey|bergamote fantastico|iris pallida|jasmin grandiflorum|rose centifolia|tonka sarrapia|vanille planifolia|les absolus|oud essentiel|ambre eternel|encens mythique|encens d orient|musc noble|patchouli ardent|santal royal|cuir intense|epices exquises|oud yuzu|oriental brulant|bois d armenie|cruel gardenia|embruns d ylang|epices volees|frenchy lavande|herbes troublantes|iris ganache|iris torrefie|jasmin bonheur|joyeuse tubereuse|myrrhe delires|neroli outrenoir|neroli plein sud|oeillet pourpre|oud khol|oud nude|patchouli paris|rose barbare|rose cherie|santal pao rosa|tonka imperiale|vetiver fauve|nerolia vetiver$|bee garden|bouquet de paris|champs de fleurs|coque d or|cour des senteurs|derby|baiser de russie|fol arome|eau de lit|carmen|l heure blanche|l heure de nuit|elixir charnel|cherry blossom|le parfum du 68|guerlain le parfum)'),
  'hermes': re('^(barenia|24 faubourg|caleche|kelly caleche|concentre|eau de pamplemousse|eau de gentiane|eau de mandarine|eau de narcisse|eau de neroli|ambre narguile|vetiver tonka|cuir d ange|poivre samarcande|rose ikebana|osmanthe yunnan|iris ukiyoe|muguet porcelaine|vanille galante|santal massoia|brin de reglisse|paprika brasil|epice marine|myrrhe eglantine|cardamusc|cedre sambac|agar ebene|violette volynka|oud alezan|ginseng biloba|musc pallida|un jardin|le jardin de monsieur li|oud esma|hiris|rocabar|rouge hermes|equipage|paddock|amazone|galop|cabriole|bois d armenie|rose amazone)'),
  'tom ford': re('^(noir|ombre leather|black orchid|grey vetiver|velvet orchid|metallique|ombre de hyacinth|bois pacifique)'),
  'armani': re('^(ambre eccentrico|ambre soie|bois d encens|cuir |eau de jade|eclat de jasmin|encens satin|iris celadon|new york|pierre de lune|sable |cedre olympe|cypres|figuier eden|gardenia antigua|iris bleu|jasmin kusamono|orange mediterranee|oranger alhambra|orangerie venise|pivoine suzhou|rose alexandrie|rose milano|santal dan sha|the yulong|vetiver d hiver|oud royal|rose d arabie|musc shamal|myrrhe imperiale|bleu |rouge malachite|vert malachite|oud nacre|blanc kogane|noir kogane|indigo tanzanite|magenta tanzanite|la femme bleue|rose d artiste|armani prive|la femme nacre)'),
  'louis vuitton': re('^(pur ambre|pur oud|pur santal|ambre levant)'),
  'parfums de marly': re('exclusif|^(valero|carios|eragon)'),
  'jean paul gaultier': re('^(ambre tatouage|cuir 1976|french oud|rose palace|santal de paname|musc terrible)'),
};
const YSLV = re('^(babycat|blouse|caban|caftan|capeline|coeur fetish|cuir sublime|gold supreme|grain de poudre|jumpsuit|lavalliere|muse|rouge velours|saharienne|trench|tuxedo|velours|24 rue|37 rue|6 place|vinyle|atlas garden|exquisite embroidery|magnificent gold|sleek suede|splendid wood|supreme bouquet|wild leather|cuir$|manifesto)');
const PRICEOF = (T0, k) => T0[k] || null;
module.exports = function official(house, name, coll) {
  const t = T[house]; if (!t) return null;
  // Le Vestiaire des Parfums d'Yves Saint Laurent : toute la collection au prix du Vestiaire
  if (house === 'yves saint laurent' && YSLV.test(name)) return /extrait/.test(name) ? { p: 495, v: 50 } : /^(24 rue|37 rue|6 place)/.test(name) ? { p: 370, v: 125 } : { p: 320, v: 125 };
  // Armani Privé, Les Terres Précieuses
  if (house === 'armani' && /^(bleu lazuli|bleu turquoise|rouge malachite|vert malachite|indigo tanzanite|magenta tanzanite|blanc kogane|noir kogane|armani prive)/.test(name)) return { p: 265, v: 50 };
  if (PRIV[house] && PRIV[house].test(name)) return null;
  if (house === 'louis vuitton' && (coll === 'Les Extraits' || /^(ink mark|fantasmagory|symphony|stellar times|dancing blossom|cosmic cloud|myriad)/.test(name))) return { p: 575, v: 100 };
  if (house === 'jo malone') { const r = /intense|absolu/.test(name) ? t.intense : t.cologne; return { p: r[0], v: r[1] }; }
  let c = cls(name);
  if (house === 'maison margiela') c = /whispers|letter never sent|ch\d|silent fury|tender defiance|anguish|delight in despair|lipstick|mutiny|untitled|across sands|promenade|fit of folly|blaze of stillness/.test(name) ? 'edp' : 'edt';
  if (house === 'diptyque') c = /\bedp\b|eau de parfum|fleur de peau|orpheon|tam dao eau|tempo|rihla|oud palao|eau capitale/.test(name) ? 'edp' : 'edt';
  if (house === 'jean paul gaultier') c = /elixir|essence|le parfum|extrait|absolu|intense|ultra|supreme/.test(name) ? 'elixir' : /^(le male|le beau|classique|ultra male|gaultier 2|fragile|monsieur)/.test(name) ? 'edt' : 'edp';
  if (house === 'maison francis kurkdjian') c = /extrait/.test(name) ? 'extrait' : /aqua|cologne|l eau|eau |petit matin|kurky/.test(name) ? 'edt' : 'edp';
  if (house === 'hermes') c = /parfum|intense/.test(name) ? 'parfum' : /twilly|jour d hermes|galop|elixir/.test(name) ? 'edp' : 'edt';
  if (house === 'yves saint laurent' && c === 'edp' && /^(l homme|kouros|la nuit de l homme|y$|pour homme|opium pour homme)/.test(name)) c = 'edt';
  if (house === 'chanel' && c === 'edp' && /^(allure homme|pour monsieur|antaeus|egoiste|platinum egoiste|bleu de chanel$|chance$|chance eau|cristalle|coco mademoiselle l eau|gabrielle l eau|n 5 l eau|n 5 eau|chanel n 5 eau)/.test(name)) c = 'edt';
  if (house === 'dior' && c === 'edp' && /^(eau sauvage|fahrenheit|dior homme$|diorissimo|dune pour homme|dolce vita|sauvage$|sauvage very cool|sauvage edt|addict eau fraiche|eau fraiche)/.test(name)) c = 'edt';
  if (house === 'guerlain' && c === 'edp' && /aqua allegoria|^vetiver|habit rouge|l homme ideal|guerlain homme/.test(name)) c = 'edt';
  if (house === 'nishane' && c !== 'cologne') c = 'extrait';
  if (house === 'armani' && /^(acqua|code|emporio|armani code|stronger|mania|sun di gioia)/.test(name) && !/parfum|elixir|absolu|profumo/.test(name) && c === 'edp') c = /^(acqua di gio|code)\b/.test(name) && !/profondo|absolu|parfum/.test(name) ? 'edt' : 'edp';
  const r = t[c] || t.edp || Object.values(t)[0];
  return { p: r[0], v: r[1] };
};
