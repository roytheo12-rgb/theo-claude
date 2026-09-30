# Tuto : tout mettre en ligne, pas à pas

Objectif : avoir Sillage en ligne (gratuit), les vidéos prêtes, et un post LinkedIn qui envoie vers la démo.
Compte une petite heure la première fois. Tu copies-colles les commandes, une par une.

## Ce que tu as dans le dossier

| Fichier | À quoi il sert |
|---|---|
| `public/` | le site : c'est ce que Cloudflare met en ligne |
| `media/sillage-story-4k.mp4` | vidéo 4K verticale, résultat normal (Jazz Club + Fève Nectar) |
| `media/sillage-story-neroli-4k.mp4` | vidéo 4K verticale, résultat Néroli Amara + The Musc |
| `media/sillage-story.gif`, `sillage-story-neroli.gif` | mêmes stories en GIF (≈ 4,5 Mo) |
| `media/og.jpg` | image d'aperçu du lien |

Les vidéos sont en 2160×3840 (4K vertical), 30 images/s, ≈ 20 Mo chacune. Les textes et l'interface sont nets en 4K. Les photos de flacons sont en revanche des photos de départ de petite taille, agrandies : elles paraissent un peu moins nettes que le texte.

---

## Étape 1 : installer les outils (une seule fois)

1. **Node.js** : va sur nodejs.org, télécharge la version « LTS », installe.
2. **Python 3** : python.org (déjà présent sur Mac). Il ne sert que pour regénérer le site ou les GIF.
3. Ouvre un terminal (Mac : « Terminal ». Windows : « PowerShell ») et vérifie :
   ```bash
   node -v
   python3 --version
   ```
   Chaque commande doit afficher un numéro de version.

## Étape 2 : récupérer le code

Le code est sur GitHub, dépôt `roytheo12-rgb/theo-claude`, branche `claude/stoic-fermat-uz7cd8`.

```bash
git clone -b claude/stoic-fermat-uz7cd8 https://github.com/roytheo12-rgb/theo-claude.git
cd theo-claude/parfumier/demo-public
```

(Sans git : sur la page GitHub, bouton vert « Code » → « Download ZIP », sur la bonne branche, puis ouvre le dossier `parfumier/demo-public`.)

## Étape 3 : créer les comptes

1. **Cloudflare** (gratuit, sans carte bancaire) : dash.cloudflare.com → « Sign up ».
2. **Anthropic** (l'IA, payante à l'usage) : console.anthropic.com → crée un compte, ajoute quelques dollars de crédit (5 $ suffisent pour démarrer), puis « API keys » → « Create key ». Copie la clé (elle commence par `sk-ant-`) et garde-la de côté : elle ne s'affiche qu'une fois.
   Dans les réglages de la console, mets une **limite de dépense mensuelle** (par exemple 10 $).

## Étape 4 : mettre le site en ligne

Toujours dans `parfumier/demo-public` :

```bash
npm install
npx wrangler login
```
Un onglet s'ouvre : clique « Allow ».

**Créer la base qui compte les essais et garde les emails :**
```bash
npx wrangler kv namespace create SILLAGE
```
Le terminal affiche un bloc avec `id = "xxxxxxxx..."`. Ouvre `wrangler.toml`, trouve la ligne `id = "COLLE_ICI_L_ID_DU_KV"` et remplace par cet identifiant, entre guillemets.

**Enregistrer les 3 secrets** (chaque commande te demande de coller la valeur) :
```bash
npx wrangler secret put ANTHROPIC_API_KEY   # ta clé sk-ant-...
npx wrangler secret put ADMIN_KEY           # invente un mot de passe long : il protège l'export des emails
npx wrangler secret put SALT                # n'importe quelle longue suite de caractères au hasard
```

**Publier :**
```bash
npx wrangler deploy
```
À la fin, le terminal affiche l'adresse, du type `https://sillage-demo.TON-COMPTE.workers.dev`. C'est ton site.

## Étape 5 : régler l'adresse dans l'aperçu (important pour LinkedIn)

L'image d'aperçu du lien doit connaître ta vraie adresse. Depuis la racine `parfumier` :

```bash
cd ..
SITE_URL=https://sillage-demo.TON-COMPTE.workers.dev python3 v2/build.py public
cd demo-public
npx wrangler deploy
```
(Sur Windows PowerShell : `$env:SITE_URL="https://..."; python v2/build.py public`.)

## Étape 6 : tester comme un visiteur

1. Ouvre ton adresse sur ton téléphone. L'intro de 9 secondes doit se lancer.
2. Décris une journée, lance le conseil : c'est ton premier essai réel avec l'IA. Regarde le résultat, puis fais un deuxième essai.
3. Au 3e, la fenêtre d'inscription doit apparaître. Entre ton email pour tester.
4. Récupère les emails : ouvre `https://TON-SITE/api/admin/emails?key=TON_ADMIN_KEY` (ton mot de passe de l'étape 4). Un fichier CSV se télécharge, ouvrable dans Excel.
5. Contrôle ta consommation sur console.anthropic.com : c'est là que tu vois le coût réel par essai (mon chiffre de 0,02 $ est une estimation, pas une mesure).

Si quelque chose ne marche pas, va voir la section « Dépannage » plus bas.

## Étape 7 : le post LinkedIn

1. **Vidéo** : dans LinkedIn, « Commencer un post » → icône vidéo → choisis `sillage-story-4k.mp4` (ou la version Néroli Amara). Le format vertical est accepté. Si LinkedIn refuse ou met du temps, c'est souvent la taille : dans ce cas essaie le GIF, ou demande-moi une version 1080p plus légère.
2. **Le lien** : LinkedIn a tendance à moins montrer les posts dont le lien est dans le texte. Mets le lien de la démo dans **le premier commentaire** et écris dans le post « lien en commentaire ».
3. **L'aperçu** : quand tu colles ton lien, LinkedIn affiche `og.jpg`. S'il montre une ancienne image, ouvre `linkedin.com/post-inspector`, colle ton lien et clique « Inspect » pour le rafraîchir.
4. **Les emails** : dans le post, propose de commenter ou de laisser son email sur la démo pour recevoir le guide. La fenêtre d'inscription les enregistre, avec la case de consentement.
5. Deux vidéos, deux usages : garde celle de Néroli Amara pour un second post ou un commentaire, pour ne pas montrer deux fois le même résultat.

## Mettre à jour plus tard

À chaque modification du site :
```bash
cd parfumier
SITE_URL=https://TON-SITE python3 v2/build.py public
cd demo-public
npx wrangler deploy
```
Pour ajouter d'autres vidéos ou GIF : `VARIANT=amara node tools/make-video.mjs` (4K) ou `node tools/make-media.mjs` (GIF). Ils s'écrivent dans `media/`.

## Réglages du coût (dans `wrangler.toml`)

| Réglage | Effet |
|---|---|
| `MAX_TRIES = "2"` | essais par visiteur |
| `DAILY_CAP = "150"` | essais IA maximum par jour, tous visiteurs |
| `MODEL` | `claude-sonnet-5-5` (défaut) ou `claude-opus-5-5` (plus cher) |

Après un changement : `npx wrangler deploy`. Si tu es viral, la démo s'arrête d'elle-même au plafond du jour et propose l'inscription.

## Dépannage

- **`wrangler login` ne s'ouvre pas** : copie le lien affiché dans ton navigateur.
- **« KV namespace » erreur au déploiement** : tu as oublié de coller l'`id` dans `wrangler.toml` (étape 4).
- **Le conseil du jour affiche une erreur** : vérifie la clé (`npx wrangler secret put ANTHROPIC_API_KEY` pour la remplacer) et que ton compte Anthropic a du crédit.
- **Voir les erreurs en direct** : `npx wrangler tail`.
- **Recommencer les 2 essais pour tester** : ouvre le site en navigation privée avec une autre connexion (les essais sont liés à l'appareil et à l'adresse IP).

## À savoir avant de publier

- Le code qui tourne dans le navigateur (moteur, catalogue) reste lisible par n'importe qui. Le prompt du conseil du jour, lui, reste côté serveur.
- Les photos de flacons viennent des marques : risque de droits d'image si tu les montres publiquement. Le « Mode public » du profil les remplace par des dessins.
- Tu collectes des emails : garde la case de consentement, réponds aux demandes de suppression, et ne les utilise que pour ce que tu as annoncé.
