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
- Les photos de flacons sont celles de marques tierces : risque de droits en usage public. Alternative : activer le « Mode public » (flacons dessinés) dans Profil.

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

## 10. Parcourir la base et photos associées

- **Parcourir par marque** : dans « Ajoute sans taper », la liste des ~160 marques (avec le nombre de parfums), puis les parfums de la marque. Chaque parfum se sélectionne d'un clic et s'ajoute avec son stock. Les fiches inconnues sont complétées par l'IA légère, comme avant.
- **Photos de la base** : `python3 tools/build-imgdb.py` détoure les photos de `incoming/`, les rattache aux parfums d'après `data/imgmap.txt` (fichier | maison | nom) et écrit `v2/img/db/*.webp` + `imgdb.js`. Les photos au détourage raté sont listées dans `data/imgskip.txt` (flacon dessiné à la place).
- Ajouter de nouvelles photos : dépose-les dans `incoming/`, ajoute une ligne dans `data/imgmap.txt`, relance le script puis `v2/build.py`.
