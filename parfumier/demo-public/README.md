# Sillage : démo publique (hébergement gratuit)

Nouveau : lis **TUTO.md** pour tout mettre en ligne pas à pas.

Un seul Worker Cloudflare sert le site, garde le prompt du conseil du jour côté serveur, limite chaque visiteur à **2 essais** et récolte les emails.

- Cloudflare Workers + KV : **gratuit** (100 000 requêtes/jour, pas de carte bancaire).
- L'IA (API Anthropic) : **payante à l'usage**, c'est la seule dépense. Le plafond `DAILY_CAP` la borne.

## 1. Déployer (une seule fois, ≈ 15 min)

Prérequis : Node 20+, Python 3, un compte Cloudflare gratuit, une clé API Anthropic (console.anthropic.com).

```bash
cd parfumier/demo-public
npm install
npx wrangler login                          # ouvre le navigateur
npx wrangler kv namespace create SILLAGE    # affiche un id : colle-le dans wrangler.toml (champ id du KV)
npx wrangler secret put ANTHROPIC_API_KEY   # ta clé API
npx wrangler secret put ADMIN_KEY           # un mot de passe long pour exporter les emails
npx wrangler secret put SALT                # une chaîne aléatoire (anonymise les IP)
```

Puis génère le site et déploie :

```bash
cd ..
SITE_URL=https://sillage-demo.<ton-compte>.workers.dev python3 v2/build.py public
cd demo-public
npx wrangler deploy
```

L'URL finale s'affiche. Mets-la dans `SITE_URL` et relance les deux dernières commandes pour que l'aperçu LinkedIn (image `og.jpg`) pointe au bon endroit.

## 2. Récupérer les emails

`https://TON-SITE/api/admin/emails?key=TON_ADMIN_KEY` télécharge un CSV (email, intérêt, source, date). Ne partage jamais ce lien.

## 3. Régler les coûts

Dans `wrangler.toml` :

| Variable | Rôle | Défaut |
|---|---|---|
| `MAX_TRIES` | essais par visiteur | 2 |
| `IP_MAX_PER_DAY` | essais par adresse IP et par jour | 6 |
| `DAILY_CAP` | essais IA au total par jour, tous visiteurs confondus | 150 |
| `MODEL` | `claude-sonnet-5-5` (défaut) ou `claude-opus-5-5` (≈ 2× plus cher) | sonnet |
| `EFFORT` | `low`, `medium`, `high` | low |

Ordre de grandeur **estimé, non mesuré** : ≈ 0,02 $ par essai avec Sonnet 5.5 (≈ 0,04 $ avec Opus), donc 150 essais/jour ≈ 3 $ maximum. Vérifie ta consommation réelle dans la console Anthropic après les premiers essais, et fixe une limite de dépense mensuelle là-bas.

## 4. Ce que ça protège, et ce que ça ne protège pas

- Protégé : la clé API (jamais dans le navigateur), le prompt du conseil du jour (construit côté serveur), le nombre d'essais.
- Non protégé : tout code exécuté dans le navigateur (moteur de recommandation, catalogue) est lisible par quiconque ouvre les outils de développement. Les autres prompts IA sont verrouillés dans la démo mais visibles dans le code.
- Les photos de flacons sont celles de marques tierces : risque de droits en usage public.

## 5. RGPD

Le formulaire demande un consentement explicite avant d'enregistrer un email. Dis pourquoi tu les collectes (guide, version sur mesure), permets la suppression sur demande, et ne les utilise pas pour autre chose.

## 6. Pour le post LinkedIn

Dans `public/` et `media/` :

- `sillage-story.gif` (4,5 Mo) : story « sortie entre amis » qui tombe sur Jazz Club + Fève Nectar. `sillage-story-neroli.gif` : brunch chaud qui tombe volontairement sur Néroli Amara + The Musc. Les deux sont des réponses IA scriptées (tools/serve.mjs), pas un appel réel. Régénérer : `VARIANT=amara node tools/make-media.mjs` puis `python3 tools/make_gif.py 272 10 56 sillage-story-neroli.gif`.
- `sillage-story-4k.mp4` et `sillage-story-neroli-4k.mp4` : teasers motion 54 s, 4K verticaux (2160×3840, 30 im/s, ≈ 20 Mo). Régénérer : `node tools/make-teaser.mjs` et `VARIANT=amara node tools/make-teaser.mjs`.
- `og.jpg` : image d'aperçu quand tu colles le lien.
- `/signup.html` : page d'inscription seule, pour « Repostez et envoyez-moi un message ».

## 7. Tester en local

```bash
npm test          # 12 tests unitaires du Worker
npx wrangler dev  # site local sur http://localhost:8787 (IA réelle si tu mets la clé dans .dev.vars)
```

Non testé à ce jour : appel réel à l'API Anthropic, déploiement Cloudflare réel, rendu sur téléphone.

## 8. Profil, identification légère et catalogue partagé

- **Profil** : à la création, l'app demande « Tu es… » (garçon, fille, ou ne pas préciser) puis l'âge. Sauvegardé dans le navigateur (et dans la base de claude.ai pour l'artifact), modifiable dans Profil, envoyé à l'IA chaque jour.
- **Tenue** : demandée au moment de choisir le parfum (6 styles avec icônes dessinées). Le choix est retenu d'un jour à l'autre.
- **Stock** : pour chaque parfum, taille du flacon, ce qu'il en reste et usage (au quotidien, grandes occasions, peu importe). Un échantillon passe seul en « grandes occasions ». Le moteur et l'IA ménagent les échantillons, les flacons presque finis et ceux réservés : ils ne gagnent pas une journée ordinaire.
- **Ajouter un parfum depuis une image** : photo, ou adresse d'une image trouvée sur internet (https). Les parfums déjà connus sont reconnus sans IA ; les autres passent par Claude Haiku 4.5 (`HAIKU_MODEL`), limité par `IDENT_MAX` (6 par visiteur), `IDENT_IP_MAX_PER_DAY` (20) et `IDENT_DAILY_CAP` (400 par jour). Coût non mesuré : de l'ordre d'un centime ou moins par analyse.
- **Catalogue partagé** : un parfum identifié par l'IA n'entre dans le catalogue de tous qu'après confirmation par 2 personnes d'adresses IP différentes. Les images ne sont jamais stockées côté serveur.

## 9. Profils distincts et grand index de parfums

- **Profils distincts** : chaque personne a son profil (collection, wishlist, journal, tenue, stock). Sur un même appareil, Profil → « Nouveau profil » en crée un autre, et on bascule de l'un à l'autre sans rien mélanger. Les données restent dans le navigateur de chaque personne : la démo n'enregistre aucun profil côté serveur.
- **Grand index** (`parfumier/index.js`, ≈ 2 500 parfums, 150 maisons) : généré par `python3 tools/build-index.py` depuis `data/raw/*.txt` (ta liste, sans doublons). Il sert aux suggestions pendant la frappe. Les fiches (famille, notes, puissance) des parfums de l'index sont complétées par Haiku quand quelqu'un les ajoute, puis gardées en cache pour tous (coût zéro les fois suivantes).

## 10. Inscription, explorateur de la base, conditions

- **Inscription en 5 temps** (après l'intro) : prénom, genre, âge, goûts, puis la collection choisie dans la base. L'accueil dit ensuite « Bonjour / Bon après-midi / Bonsoir, Prénom ». Tout reste dans le navigateur de chaque personne : chacun installe l'appli sur son téléphone, il n'y a donc aucun accès aux autres profils (le sélecteur de profils a été retiré).
- **Explorer la base** (ajout de parfums, wishlist, inscription) : ~2 800 parfums, 160 marques, parcourus par **marque, style, notes, prix ou parfumeur**, avec photos. Les « incontournables » sont en tête. Pour les parfums sans fiche détaillée, le style et les notes sont **déduits du nom** (marqués ≈) ; l'IA peut compléter la fiche plus tard. Les parfumeurs ne sont renseignés que quand ils sont sûrs (`desc.js`).
- **Une seule écriture par maison** : « Jo Malone London » = « Jo Malone », « MFK » = « Maison Francis Kurkdjian », etc. (`tools/build-index.py`, table `HOUSE`). Les collections existantes sont corrigées au chargement.
- **Wishlist** : deux listes, « À sentir » et « Senti » (avec verdict : j'adore, bien, bof).
- **Conditions du jour** : en plus de la météo, du mood et de la tenue, on choisit le **moment** (journée, soirée, nuit) et l'**endroit** (restaurant, bar, boîte, musée, concert, théâtre, bureau, chez moi, dehors). Le moteur et l'IA en tiennent compte : discret au théâtre ou à table, affirmé en boîte.
- **Descriptions** des best-sellers (`desc.js`) avec leur moment idéal, utilisées pour affiner les conseils. Une carte « un mot, une astuce, un peu d'histoire » par jour dans Découvrir et la wishlist.
- **Photos de la base** : `python3 tools/build-imgdb.py` détoure les photos de `incoming/` et les rattache d'après `data/imgmap.txt` (fichier | maison | nom). Les photos au détourage raté sont dans `data/imgskip.txt`. Pour en ajouter : dépose-les dans `incoming/`, ajoute une ligne dans `imgmap.txt`, relance le script puis `v2/build.py`.
- **Tags** (abordable, niche, designer, luxe, collection privée, arabe / oriental, maison historique, iconique) : définis par maison, par prix et par ligne d'origine dans `desc.js` et `tools/build-index.py` (étiquette P pour les collections privées).
- **Onglets** : accueil, étagère, **recherche** (texte + filtres : tags, style, prix, concentration, marque, note, parfumeur, avec photo), **conseils** (ce qui manque pour compléter ta collection, ce qui t'irait, par envie niche / luxe / abordable, astuces), balade, wishlist.
- **Balade olfactive** : conservée. La fausse balade d'exemple (« Rue Saint-Honoré ») qui s'affichait chez tout le monde est retirée de tous les comptes au chargement.
- `incoming/PHOTOS-MANQUANTES.md` liste les parfums du catalogue qui n'ont pas encore de photo.

## 11. Comptes

- **Créer un compte** (email + mot de passe) est proposé juste après l'intro ; il enregistre tout le profil (prénom, genre, âge, goûts, collection, wishlist, journal) côté serveur, automatiquement après chaque modification. Ensuite viennent les questions d'inscription. **Se connecter** sur un autre appareil rapporte le profil complet, sans refaire les questions. **Le compte est obligatoire** : sans connexion, l'appli ne s'ouvre pas (seuls `?seed=demo`, `?test=1` et `?present=1` passent, pour les tests). Se déconnecter ou supprimer son compte efface les données de l'appareil et redemande un compte. Profil permet aussi de se déconnecter et de **supprimer** le compte (tout est effacé).
- Côté Worker : `/api/account/signup|login|data|logout|delete`. Mot de passe haché avec PBKDF2-SHA256 (100 000 itérations, le maximum de Cloudflare Workers) et sel propre à chaque compte, jamais stocké en clair ; session par jeton aléatoire valable 180 jours ; profil limité à 900 Ko ; limites d'essais par adresse IP.
- **Pas de « mot de passe oublié »** pour l'instant (l'email est stocké, on pourra l'ajouter). Le compte n'existe que dans la version publique (Worker) : l'artifact claude.ai garde son propre enregistrement.
- Dis aux utilisateurs que l'email ne sert qu'à se reconnecter : c'est ce que dit l'écran. Si tu veux t'en servir pour autre chose (offre sur mesure), il faut un consentement séparé.

## 12. Les nez (parfumeurs) et les photos

- `data/noses.txt` : la liste « Parfumeur | Maison | Parfums » (≈ 920 parfums, 60 nez). `tools/build-index.py` rattache chaque parfum à son nez (clé « maison nom »), ajoute à l'index les parfums qui manquent, et écrit `window.NOSE_BY` dans `index.js`.
- Dans l'appli : onglet **Recherche** → bandeau « Les nez » (les plus connus) ; fiche d'un nez avec sa présentation (`desc.js`, `NOSE_BIO`) et tous ses parfums ; filtre « Parfumeur » ; fiche d'un parfum → « Créé par » cliquable ; explorateur → onglet Parfumeurs.
- **Un seul nez par parfum.** Quand la liste en cite plusieurs, `data/noses-choix.txt` (`Maison|Parfum|Nez`) donne le bon (ex. Santal 33 : Frank Voelkl, Acqua di Giò : Alberto Morillas). Sans choix explicite, `build-index.py` garde le nez le plus souvent cité pour cette maison (213 cas, signalés à l'exécution). Corrige `data/noses-choix.txt` puis relance `python3 tools/build-index.py`.
- **Genre** : `desc.js` (`genderOf`) repère les parfums clairement féminins ou masculins ; le moteur et le prompt IA n'en proposent pas à l'autre genre (les mixtes, et tout ce qui est inconnu, passent).
- **Maisons** : « Toutes les maisons » suit l'ordre de `HOUSE_FAME` dans `desc.js` (les plus connues d'abord), puis le nombre de parfums.
- **Photos** : toutes celles de `incoming/` sont associées d'après `data/imgmap.txt` (fichier | maison | nom) ; `python3 tools/build-imgdb.py` (≈ 10 min) détoure et écrit `v2/img/db/` + `imgdb.js`. Les détourages ratés (fond gris, ombres) sont listés dans `data/imgskip.txt` : le flacon dessiné les remplace.

## Photos « PNG » (incoming/*.png), variantes et portraits de nez

- `incoming/N.png` : photos déjà détourées, avec la légende écrite sous le flacon (« maison - parfum », parfois EDP / EDT / extrait…). La légende ne s'affiche pas : `tools/build-png.py` ne garde que le flacon.
- `data/imgmap2.txt` (`N|Maison|Parfum|Concentration`) : la lecture de chaque légende. Les lignes `NEZ` sont des portraits (360 et suivants), affichés dans la fiche d'un nez.
- `tools/build-index.py` rattache chaque photo à UNE fiche : il retrouve la fiche existante (pas de doublon), ou la crée dans la bonne maison. Un extrait, un absolu, un esprit de parfum, un parfum ou un EDT a sa propre fiche (« Baccarat Rouge 540 Extrait », « Do Son EDT ») seulement quand la version de base existe aussi ; sinon la photo va sur la fiche existante. Il écrit `data/imgmap2.resolved.json`.
- `python3 tools/build-png.py` (≈ 10 min la première fois, ensuite quelques secondes : seules les photos modifiées sont refaites ; `FORCE=1` pour tout refaire) écrit `v2/img/p/*.webp`, `v2/img/nose/*.webp` et `imgnew.js`.
- Quand un parfum a plusieurs photos, la plus récente (numéro le plus élevé) gagne ; ces photos passent avant les anciennes. Photos écartées : voir `incoming/PHOTOS-A-REFAIRE.md`.
- Pour ajouter une photo : l'ajouter dans `incoming/`, ajouter sa ligne dans `data/imgmap2.txt`, puis `python3 tools/build-index.py && python3 tools/build-png.py`.

## Listes complètes des nez en vedette, rééditions, filtre féminin / masculin / mixte

- `data/noses-full.txt` (`Parfumeur|Maison|Parfum|Concentration`, ≈ 2 000 lignes) : tous les parfums des nez en vedette, ajoutés à la base (≈ 4 500 parfums, ≈ 390 maisons) et rattachés à leur nez. Le nombre affiché pour un nez est « N+ » : c'est ce que contient la base aujourd'hui.
- Les rééditions (collector, limited, millésime, année, anniversaire…) sont repérées dans `index.js` (`window.EDITIONS`). Elles restent dans la fiche d'un nez et dans une recherche, mais disparaissent des listes par défaut. Les brumes cheveux / corps et huiles sont ignorées.
- Recommandations, conseils et achats : une seule version par famille de parfum (maison + premier mot du nom), pas de flankers ni de concentrations multiples.
- « Ajouter mes parfums » et Recherche ont un filtre Féminin / Masculin / Mixte (`genderOf` dans `desc.js` : listes de parfums, règles par maison et mots du nom ; ce qui n'est pas reconnu est « Mixte »).

## Faits tirés des sites des marques (genre, notes)

- Fragrantica est protégé par Cloudflare (403) : rien n'en est collecté. Les sites de plusieurs marques exposent un flux produits public (`/products.json`, autorisé par leur robots.txt) : Parfums de Marly, Creed, Diptyque, Tom Ford, Nasomatto, Matière Première, Amouage, Xerjoff, BDK, Memo, Initio, Serge Lutens.
- Copier ces flux dans `data/brand-raw/<marque>.json` (non versionné : ce sont des textes de marque), puis `python3 tools/build-facts.py` écrit `facts.js` : uniquement des champs structurés (genre, notes données en étiquettes), jamais de texte marketing. `genderOf` utilise ces faits avant ses règles ; les notes remplacent les notes devinées.

## Fiches détaillées, notes et photos supplémentaires

- `data/fiches-*.txt` : fiches détaillées écrites à la main pour les parfums les plus connus (pyramide tête / cœur / fond, famille, genre, projection, tenue, poids, prix indicatif). `python3 tools/build-fiches.py` écrit `fiches.js` : un parfum déjà au catalogue reçoit sa pyramide, les autres sont ajoutés au catalogue (donc proposés dans les recommandations). La fiche d'un parfum affiche la pyramide quand elle existe.
- `python3 tools/crawl-luckyscent.py` lit les fiches produit de Luckyscent (sitemap public, `/products/` autorisé par robots.txt, ≈ 3 pages par seconde) dans `data/web-raw/` (non versionné) : nom, maison, notes, image. `build-index.py` ajoute les parfums manquants (maisons de niche comprises), `build-facts.py` traduit les notes en français (une note inconnue est ignorée, pas devinée), `python3 tools/build-web.py 80` détoure les photos des 80 maisons les mieux classées (`v2/img/w/`, `imgweb.js`) pour les parfums qui n'en ont pas : elles ne passent qu'en dernier recours, après les photos fournies.
- L'artifact Claude ne peut héberger qu'environ 510 fichiers : il n'embarque qu'une partie de ces photos (`data/artifact-imgweb.json`). Le site public les a toutes.

## Moteur de correspondance (v45)

- **Profil olfactif calculé sur les vraies notes** (`engine.js`, `olfactive` / `derive`) : chaque note pèse dans un ou plusieurs accords (agrumes, aromatique, floral, gourmand, ambré, boisé, épicé, cuir, musqué, oud…) ; le fond pèse plus que la tête. Famille, poids et projection d'un parfum de la base sont déduits de ses notes, jamais du nom.
- **« Je cherche… »** (onglet Recherche) : `parseNeed` comprend une phrase libre (occasion, saison, mood, notes voulues ou fuies — « sans vanille », « pas trop sucré » —, famille, genre, budget, sillage) et `searchNeed` classe **toute la base à notes réelles** (≈ 2 600 parfums) avec un pourcentage de correspondance et les raisons. Une seule fiche par famille de parfum (pas de flankers en cascade). Notes fuies, mauvais genre, hors budget : exclus.
- Les conseils (« pour compléter la collection », « par envie ») puisent dans le même pool.
- **Aucune note devinée** : un parfum ajouté sans notes réelles reste « fiche à compléter » ; l'IA (`aiFill`) remplit les vraies notes dès l'ajout, et répond « inconnu » plutôt que d'inventer. Tant que la fiche est vide, le moteur ne l'utilise pas.
- **Évaluation** : `node test/engine-eval.test.mjs` (lancé par `npm test`) vérifie sur la base réelle 14 besoins (frais bureau été, vanille sans patchouli, cuir fumé homme, oud, tubéreuse sans rose…) avec des critères lus dans les notes, indépendants du calcul du moteur. `tools/eval-pool.cjs` charge la base dans Node.
- `data/fiches-4.txt` : 48 fiches de plus (classiques dont les notes sont sûres). Les fiches de maisons niche dont je n'étais pas certain ont été écartées plutôt qu'inventées.

## Profils comparables (v46)
- `data/fiches-ia/f*.txt` : fiches écrites par le modèle (format compact, 26 champs, voir `000-format.txt`) : pyramide, famille, 18 axes de profil, saisons, moments, usages, ce qui distingue le parfum, parfums proches. **Non vérifiées en ligne** (confiance max 2). `tools/import-fiches-ia.py` rejette les fiches trop pauvres, rapproche les noms de la base, écrit `data/fiches-5.txt` (catalogue, pyramide) et `data/profils-ia.json` ; `tools/build-profils.py` écrit `profils.js` (`window.PROFILS`).
- Les fiches du prompt Manus (`data/manus/*.jsonl`, schéma de `data/PROMPT-MANUS.md`) sont lues par le même import : déposer les fichiers, relancer `python3 tools/import-fiches-ia.py && python3 tools/build-profils.py && python3 tools/build-fiches.py`.
- Moteur : `axisPref` (ce que la personne aime, déduit des profils de sa collection pondérés par ses notes), `axisFit` (cosinus), `rankByFit` (classer des parfums proches et dire ce qui les départage), profils utilisés dans « Je cherche… » (saisons, moments, usages, mots-clés) et dans les conseils.
- `tools/validate-fiches.py` valide un lot JSONL ; `tools/candidats.cjs` liste les candidats d'une tranche de maisons.

## Notes réelles par recherche web et Jovoy (v47)
- `tools/crawl-jovoy.py` : lit les fiches produit publiques de Jovoy (pyramides en français, 1 requête / 1,5 s, robots.txt respecté) pour les maisons de niche listées ; `tools/import-jovoy.cjs` écrit `data/fiches-6.txt` et `data/profils-jovoy.json`. Les pages de marque affichent aussi des produits d'autres marques : un produit vu sous plusieurs marques n'est gardé que pour la maison qui le connaît déjà.
- `data/web-notes/*.txt` : pyramides lues sur les pages officielles et revendeurs (Louis Vuitton, Gucci, Cartier, Bvlgari, Tom Ford, Guerlain, Dior et YSL privées, Byredo, Le Labo, MFK, Diptyque, Creed, Parfums de Marly, Nishane, Initio, Montale, Frédéric Malle…). Format `Maison|Parfum|genre|tête|cœur|fond` ; `tools/import-web-notes.cjs` calcule la famille, la projection et le poids à partir des notes et écrit `data/fiches-7.txt` + `data/profils-web.json`.
- `tools/build-profils.py` fusionne les profils : pages officielles > Jovoy > fiches écrites de mémoire. Un parfum sans entrée reçoit un profil calculé à la volée sur ses notes réelles.
- Quand les pages officielles ne publient pas de pyramide (« notes clés » seulement), les notes sont rangées au cœur. Les parfums dont les sources ne donnent pas 3 notes sont ignorés plutôt que devinés.

- Lot suivant (recherche web) : Zadig & Voltaire, Contes de Parfums, D'Orsay, Dries Van Noten, Histoires de Parfums, Giardini di Toscana, Santa Maria Novella, Horace, Houbigant, Van Cleef & Arpels, Xerjoff/Sospiro, Dior / Guerlain / Jean Paul Gaultier (privées), Bon Parfumeur (3 notes clés du site officiel, traduites). `data/web-notes/maisons-*.txt`, `bon-parfumeur.txt`.

## Conseil IA sur mesure et photos (v49)
- **« Affiner avec l'IA »** (Recherche → « Je cherche… ») : le moteur présélectionne 25 candidats vérifiés (notes réelles, rejets exclus) et l'IA tranche : le choix, le sûr, la petite audace, un parfum à éviter, avec ce qu'on sent au début et après 3 h. Route `/api/need` (prompt `needPrompt` côté serveur, même quota que le conseil du jour). Pour laisser l'IA chercher sur le web en plus : variable `WEB_SEARCH=1` (outil `web_search` côté API Anthropic ; non testé ici, pas de clé).
- **Photos** : `tools/crawl-maxaroma.py` (MaxAroma, pages produit autorisées, rapprochement d'abord sur l'URL), `tools/images-from-feeds.py` (flux produits publics des maisons), `tools/images-from-jovoy.py` (og:image) écrivent `data/web-raw/images-extra-*.jsonl` ; `tools/build-web.py` détoure et écrit `v2/img/w` + `imgweb.js`. Les photos d'ambiance (Amouage) et les flacons-échantillons (Bon Parfumeur) sont écartées. Le site public a toutes les photos ; l'artifact claude.ai, limité à ~510 fichiers, n'en embarque qu'une partie.
