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
