# Mettre Sillage en vente avec Whop : mode d'emploi

**État honnête : tout ce qui suit est codé et testé avec un Whop simulé. Rien n'a encore été essayé avec ton vrai compte Whop, ton vrai Cloudflare ni un vrai téléphone.** La première vente de test est l'étape qui dira si un détail diffère.

## Comment ça marche

1. La personne arrive sur le site, crée un compte (email + mot de passe) et choisit **Gratuit**, ou **Premium / Fondateur** sur Whop.
2. Whop encaisse et envoie une **clé de licence**. La personne la colle dans Sillage (écran « Ton offre » → « J'ai déjà acheté »).
3. Le serveur demande à Whop si cette clé est valide (`GET /memberships/{clé}`), vérifie le produit acheté, et active l'offre. **Une clé ne sert qu'à un seul compte.**
4. Une fois par jour, le serveur revérifie. Si l'abonnement est résilié ou impayé, l'accès Premium se retire tout seul. Si Whop est injoignable, l'accès est conservé et on réessaie une heure plus tard.

Statuts Whop qui donnent l'accès : `active`, `trialing`, `past_due` (période de grâce), `completed` (achat unique, le fondateur).

## À faire une fois

### Côté Whop
1. Crée trois offres : Premium mensuel (5,99 € TTC), Premium annuel (49 € TTC), Fondateur (99 € TTC une fois, **stock limité à 50**).
2. Pour chaque produit, ajoute l'expérience qui délivre une **clé de licence** (« software licensing » dans l'interface de Whop ; les noms exacts peuvent différer).
3. Note l'identifiant de chaque produit (`prod_…`) et crée une **clé API** avec le droit de lire les memberships (`member:basic:read`).
4. Dans la configuration de paiement, ajoute la case de renonciation au droit de rétractation (voir les conditions générales, article 6).

### Côté Cloudflare (dans `demo-public/`)
```bash
npx wrangler secret put WHOP_API_KEY      # la clé API Whop
# ADMIN_EMAILS est déjà dans wrangler.toml (roytheo12@gmail.com). Pour un autre courriel, change la valeur là-bas.
npx wrangler secret put RESEND_API_KEY    # pour les emails « mot de passe oublié » (resend.com, gratuit au départ)
npx wrangler secret put MAIL_FROM         # ex. Sillage <noreply@ton-domaine.fr> (domaine vérifié chez Resend)
```
Dans `wrangler.toml`, décommente et complète :
```toml
WHOP_PRODUCTS = '{"prod_AAAA":"premium","prod_BBBB":"premium","prod_CCCC":"founder"}'
```

### Au moment de générer le site
```bash
WHOP_URL_PREMIUM="https://whop.com/ton-lien-premium" \
WHOP_URL_FOUNDER="https://whop.com/ton-lien-fondateur" \
SITE_URL="https://ton-domaine.fr" \
python3 v2/build.py public
cd demo-public && npx wrangler deploy
```

## Réglages utiles (`wrangler.toml`)
`FREE_ADV`, `FREE_CHAT`, `FREE_COL`, `FREE_INSP`, `PREMIUM_ADV`, `PREMIUM_CHAT`… changent les limites de chaque offre sans toucher au code. Le détail des coûts est dans `RENTABILITE.md`.

## Ton compte « éditeur »
L'email mis dans `ADMIN_EMAILS` voit, après connexion, des outils d'édition (pour toi seul) :
- fiche d'un parfum : prix, texte de présentation, masquer partout ;
- inspiration de l'appli : ajouter, retirer, déplacer un parfum ;
- profil : les chiffres (comptes, offres, usage du mois).
Chaque modification est publique **tout de suite** pour tous les membres. Elle est stockée à part (clé `content`) : le code d'origine n'est jamais modifié, tu peux donc toujours revenir en arrière.

Limites actuelles : on ne déplace pas un parfum dans une inspiration découpée en groupes ; le texte modifié remplace l'ancien sans historique.

## Installer sur l'écran d'accueil
Le site est une appli installable : manifeste, icônes et service worker sont servis. Après connexion, une fiche explique l'installation (iPhone : Partager → Sur l'écran d'accueil ; Android : menu → Installer) une seule fois, quand la personne est sur l'accueil.

## Ce qui reste à vérifier sur de vrais appareils
Installation sur iPhone et Android, ouverture hors ligne, réception de l'email de réinitialisation, achat test Whop de bout en bout, résiliation test (l'accès doit tomber dans les 24 h).

## Confirmation d'email, support, modération et sauvegardes

- **Confirmation d'email** : à l'inscription, un lien valable 7 jours part par courriel (Resend). Tant qu'il n'est pas ouvert, le compte n'a droit à aucun conseil IA, ce qui coupe l'intérêt des faux comptes. Pour l'activer : `npx wrangler secret put RESEND_API_KEY` et `MAIL_FROM = "Sillage <bonjour@ton-domaine.fr>"` dans `[vars]`. Sans ces deux réglages, l'inscription reste libre (comme avant).
- **Support** : le formulaire du profil enregistre les messages (conservés 12 mois) et t'envoie un courriel. Tu les lis, et tu les supprimes une fois traités, dans le profil, bloc « Suivi de l'éditeur ».
- **Modération** : les inspirations publiques refusent liens, adresses et insultes. 3 signalements masquent une inspiration ; tu la rétablis ou la supprimes depuis « Inspirations signalées ».
- **Sauvegardes** : bouton « Télécharger une sauvegarde » (fichier JSON, à garder hors du téléphone). Pour une copie automatique chaque nuit : crée un dépôt R2 (`npx wrangler r2 bucket create sillage-backups`) puis décommente les lignes `r2_buckets` et `triggers` de `wrangler.toml`. Les 14 dernières copies sont gardées.
- **Chiffres** : « Voir les chiffres » donne les comptes, les offres, la consommation IA et son coût estimé, et 4 compteurs par jour sur 14 jours (inscrits, confirmés, activés, voyages terminés).
- **Version claude.ai** : le profil, « Mes inspirations », « Communauté » et le mode éditeur y fonctionnent aussi, avec la base de l'artefact. Pas d'offres ni de Whop là-bas. Le mode éditeur y est réservé au propriétaire de l'artefact.

## Créateurs, partage et retours

- **Créateurs** (Premium et fondateur) : une liste publique peut porter un lien de vidéo ou de post (https), une case « partenariat ou publicité », et un lien officiel ou d'affiliation par parfum. Les lecteurs voient la mention de partenariat, et les liens s'ouvrent avec `rel="sponsored nofollow noopener"`. Pas d'API vidéo : un simple lien suffit tant que l'audience est petite.
- **Profil public** : pseudo, photo, bio, jusqu'à 3 liens. Le bouton « Voir mon profil public » montre l'aperçu exact. « Partager » envoie `/?u=…` (profil) ou `/?c=…` (une liste publique), lisibles sans compte.
- **Retours** : le bloc « Aide et retours » du profil classe les messages en problème, idée ou question ; tu les lis dans « Suivi de l'éditeur ».

## Réseau, marques et statistiques (base D1)

1. Crée la base : `npx wrangler d1 create sillage`, colle l'identifiant dans `wrangler.toml` (bloc `d1_databases`, décommenté). Les tables se créent toutes seules. Sans D1, tout le reste de l'appli marche et le réseau répond « pas encore activé ».
2. **Offre marque** : crée dans Whop un produit mensuel « Marque » et ajoute-le dans `WHOP_PRODUCTS` (`"prod_XXX":"brand"`). Une marque fait sa demande dans son profil (« Espace marque »). Tu la valides depuis ton profil, bloc « Éditeur : marques et publications ». Le badge n'apparaît que si la demande est validée **et** l'abonnement marque est actif. Si l'abonnement s'arrête, le badge disparaît tout seul.
3. **Indépendance de l'IA** : aucun code du moteur ni des prompts ne lit le réseau. Un test automatique le vérifie. Garde cette règle quand tu ajoutes des fonctions.
4. **Statistiques** : compteurs par jour (vues de publication, vues de fiche parfum par maison, clics sur liens), sans identifiant de personne. Une marque voit ses maisons ; un créateur voit ses liens.
5. **Liens suivis** : tout lien publié (vidéo, offre) passe par `/api/go/<code>` qui compte puis redirige. Seuls les liens `https` enregistrés par un membre sont redirigés.
6. **Sauvegarde** : le fichier de sauvegarde contient aussi les tables D1.
7. **Version claude.ai** : abonnements, publications, avis et fil marchent avec la base de l'artefact. Pas de marques, de liens suivis ni de statistiques de clics là-bas.

## Commissions sur les liens

**Le principe** : chaque lien de boutique publié passe par `/api/go/<code>`. Au moment du clic, Sillage peut réécrire le lien avec **son** identifiant d'affilié (règles `AFFIL_RULES`). Si une vente est faite, le réseau (Awin, Impact, Effiliation…) te la signale ; tu en gardes `PLATFORM_CUT` % (30 % par défaut) et le reste est dû au créateur du lien.

1. Inscris-toi comme éditeur chez le réseau d'affiliation ou chez la marque, et récupère ton identifiant. Ce sont des démarches à faire de ton côté : je ne peux pas les faire pour toi.
2. Dans `wrangler.toml`, remplis `AFFIL_RULES` : une règle par boutique. `param` ajoute un paramètre (`?aff=sillage&sub=<code>`), `tpl` enveloppe le lien dans l'adresse de suivi du réseau (`{url}` et `{sub}` sont remplacés). Une boutique sans règle reste un lien normal, sans commission.
3. Dans le réseau, configure la notification de vente (postback) vers `https://TON-SITE/api/conversion?key=TON_SECRET&code={sub}&amount={montant}&commission={commission}&ref={commande}`. Définis `CONV_SECRET` avec `npx wrangler secret put CONV_SECRET`. Chaque commande n'est comptée qu'une fois.
4. Chaque créateur voit ses gains et ce qui lui est dû dans « Mes chiffres ». Toi, tu vois le total, ta part et ce qu'il reste à reverser dans « Commissions » (profil, bloc éditeur). « Payé » remet le compteur du créateur à zéro. **Les virements, eux, restent manuels.**
5. Côté légal : les conditions (article 7 sexies) et la confidentialité décrivent déjà ce fonctionnement. Il faudra un statut qui permet d'encaisser (micro-entreprise) et la déclaration des commissions. Pour reverser de l'argent à des tiers de façon régulière, vérifie avec un comptable : au-delà de petits montants, un prestataire de paiement (Stripe Connect, par exemple) est plus sûr.

## Notifications et commentaires

La cloche en haut montre le nombre de nouveautés : nouvel abonné, commentaire sous une publication, vente. Les commentaires sont limités à 300 caractères, sans lien ni adresse, et l'auteur de la publication peut les supprimer.
