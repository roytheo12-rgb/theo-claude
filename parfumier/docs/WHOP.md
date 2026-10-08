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
1. Crée trois offres : Premium mensuel (5,99 €), Premium annuel (49 €), Fondateur (79 € une fois, **stock limité à 100**).
2. Pour chaque produit, ajoute l'expérience qui délivre une **clé de licence** (« software licensing » dans l'interface de Whop ; les noms exacts peuvent différer).
3. Note l'identifiant de chaque produit (`prod_…`) et crée une **clé API** avec le droit de lire les memberships (`member:basic:read`).
4. Dans la configuration de paiement, ajoute la case de renonciation au droit de rétractation (voir les conditions générales, article 6).

### Côté Cloudflare (dans `demo-public/`)
```bash
npx wrangler secret put WHOP_API_KEY      # la clé API Whop
npx wrangler secret put ADMIN_EMAILS      # ton email : ce compte devient « éditeur »
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
