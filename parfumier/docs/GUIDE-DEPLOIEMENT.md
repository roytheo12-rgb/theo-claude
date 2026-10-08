# Guide pas à pas : mettre Sillage en ligne, en sécurité

Fais les étapes dans l'ordre. Chaque étape dit ce que tu dois voir à la fin. Si quelque chose ne ressemble pas à ce qui est écrit, arrête-toi et demande.

Mots simples : **Cloudflare** héberge le site et le « cerveau » (le Worker). **KV** et **D1** sont ses deux petits coffres où sont rangés les comptes et le réseau. **Wrangler** est l'outil qui envoie tout ça chez Cloudflare. Un **secret** est un mot de passe que l'appli utilise : il ne doit jamais être écrit dans un fichier.

## Étape 0 : protège tes comptes (15 minutes, la plus importante)
Un pirate passe presque toujours par un compte mal protégé, pas par le code.
1. Active la **double authentification** (code sur ton téléphone) sur : Gmail (roytheo12@gmail.com et hello.sillage.app@gmail.com), Cloudflare, Whop, Anthropic, GitHub.
2. Un mot de passe **différent et long** pour chacun, dans un gestionnaire de mots de passe (celui de ton téléphone, ou Bitwarden).
3. GitHub : vérifie que le dépôt est **privé** (Settings, tout en bas : Danger Zone).
4. Ne colle jamais une clé (Anthropic, Whop, Cloudflare) dans une conversation, un fichier du projet ou une capture d'écran.

## Étape 1 : Anthropic, la clé de l'IA et sa limite de dépense
L'IA est payée à l'usage. La meilleure protection : **un petit crédit prépayé que personne ne peut dépasser**.
1. Va sur `console.anthropic.com`, crée ou ouvre ton compte.
2. Menu Billing (facturation) : ajoute **10 $** de crédit. **Désactive le rechargement automatique** (auto-reload) : quand les 10 $ sont finis, l'IA s'arrête, rien d'autre ne se débite.
3. Menu Settings, Limits : mets une **limite de dépense mensuelle basse** (par exemple 10 $), et une alerte par courriel à 50 %.
4. (Conseillé) Crée un « Workspace » nommé Sillage avec sa propre limite, et crée la clé API **dans ce workspace**. Le nom exact des menus peut changer un peu : cherche « Limits » et « Workspaces ».
5. Menu API Keys : crée une clé nommée `sillage-prod`. Copie-la **une seule fois** dans ton gestionnaire de mots de passe. Elle commence par `sk-ant-`.
Résultat : tu as une clé et un plafond. Si la clé fuit un jour, tu la supprimes ici en 10 secondes.

## Étape 2 : Cloudflare
### 2.1 Le compte et l'offre
1. `dash.cloudflare.com` : crée un compte avec hello.sillage.app@gmail.com (ou le tien), active la double authentification.
2. **Prends l'offre Workers Paid (5 $ par mois).** Pourquoi : l'offre gratuite n'autorise que 1 000 écritures par jour dans KV, et Sillage en fait beaucoup (sessions, compteurs, synchronisation). Quelques personnes suffiraient à la dépasser et l'appli planterait. Menu Workers & Pages, Plans.
### 2.2 Sur ton ordinateur
1. Installe **Node.js** (version LTS) depuis `nodejs.org`.
2. Ouvre un terminal dans le dossier du projet : `cd parfumier/demo-public` puis `npm install`.
3. `npx wrangler login` : une page s'ouvre dans le navigateur, tu cliques sur Autoriser.
### 2.3 Les deux coffres
1. `npx wrangler kv namespace create SILLAGE` : le terminal affiche un `id`. Ouvre `wrangler.toml` et remplace `COLLE_ICI_L_ID_DU_KV` par cet id.
2. `npx wrangler d1 create sillage` : le terminal affiche un `database_id`. Dans `wrangler.toml`, décommente le bloc `d1_databases` (retire les `#`) et remplace `COLLE_ICI_L_ID_DE_LA_BASE_D1`.
### 2.4 Les réglages de prudence (période de test)
Dans `wrangler.toml`, section `[vars]`, mets des valeurs basses pendant la phase famille et amis :
```
DAILY_CAP = "20"            # 20 conseils IA par jour au total, tous visiteurs confondus
IP_MAX_PER_DAY = "4"        # par adresse IP
IDENT_DAILY_CAP = "100"     # analyses de parfums par jour au total
```
C'est ton **plafond de dépense journalier** : même si quelqu'un abuse, l'IA s'arrête.
### 2.5 Les secrets
Un par un, le terminal te demande la valeur (elle ne s'affiche pas quand tu la colles, c'est normal) :
```
npx wrangler secret put ANTHROPIC_API_KEY     # la clé sk-ant- de l'étape 1
npx wrangler secret put SALT                  # une longue phrase au hasard, 40 caractères. NE LA CHANGE JAMAIS ensuite : tous les comptes deviendraient inutilisables.
npx wrangler secret put ADMIN_KEY             # un autre mot de passe long au hasard
npx wrangler secret put CONV_SECRET           # idem, pour les commissions (peut attendre)
```
(`WHOP_API_KEY` et `RESEND_API_KEY` : étapes 3 et 4.)
### 2.6 Construire le site, puis l'envoyer
1. Depuis le dossier `parfumier` : `SITE_URL=https://sillage-demo.TON-SOUS-DOMAINE.workers.dev SUPPORT_EMAIL=hello.sillage.app@gmail.com python3 v2/build.py public` (tu connaîtras l'adresse exacte après le premier envoi : tu pourras relancer cette ligne ensuite).
2. Retour dans `demo-public` : `npx wrangler deploy`. À la fin, le terminal affiche l'adresse de ton site, du genre `https://sillage-demo.xxxx.workers.dev`.
3. **Crée tout de suite ton compte éditeur** sur le site, avec **roytheo12@gmail.com**, avant de donner l'adresse à qui que ce soit. Sans confirmation par courriel, la première personne qui s'inscrit avec cette adresse devient éditeur : tu dois être le premier.
4. Vérifie : ton profil affiche « Éditeur », un conseil IA fonctionne, un second compte de test reçoit bien les limites du plan gratuit.

## Étape 3 : Whop
Tu as déjà créé les 3 produits. Reste à les relier à l'appli.
1. Dans Whop, ouvre chaque produit : l'identifiant (`prod_…`) est dans l'adresse de la page ou dans les réglages du produit. Note les trois.
2. Fondateur : mets le **stock à 50**. Mets les prix **TTC**.
3. Clés d'accès : l'appli demande au client de coller sa clé ou son identifiant d'adhésion après l'achat. Dans chaque produit, active le réglage de Whop qui donne un accès par **licence / clé logicielle** si il existe, sinon l'identifiant d'adhésion (`mem_…`) visible dans l'achat sert de clé. **C'est le point à vérifier avec un vrai achat (étape 5).**
4. Clé API : Whop, Developer (ou Settings), API keys : crée une clé avec **uniquement** le droit de lire les adhésions (`member:basic:read`). Puis :
   `npx wrangler secret put WHOP_API_KEY`
5. Dans `wrangler.toml`, décommente `WHOP_PRODUCTS` et mets tes trois identifiants :
   `WHOP_PRODUCTS = '{"prod_AAA":"premium","prod_BBB":"premium","prod_CCC":"founder"}'` (mensuel et annuel sont deux produits, ou deux plans du même, tous deux « premium »). Si tu utilises un `plan_…`, il fonctionne aussi à la place.
6. Les boutons d'achat du site : relance l'étape 2.6 en ajoutant devant la commande `WHOP_URL_PREMIUM=… WHOP_URL_FOUNDER=… WHOP_URL_HUB=https://whop.com/hub` (les adresses de tes pages d'achat Whop).
7. `npx wrangler deploy`.

## Étape 4 : courriels (peut attendre)
Les courriels servent à confirmer l'adresse (contre les faux comptes) et au mot de passe oublié. Pour un test entre proches, tu peux t'en passer : l'inscription reste libre, et c'est le plafond journalier qui te protège.
Pour l'activer : un nom de domaine à toi (environ 10 € par an), un compte `resend.com`, la vérification du domaine (Resend te donne 2 ou 3 lignes à copier dans le DNS), puis `npx wrangler secret put RESEND_API_KEY` et dans `wrangler.toml` : `MAIL_FROM = "Sillage <bonjour@ton-domaine.fr>"`. **Avant d'ouvrir au public, active-le.**

## Étape 5 : le vrai test d'achat
1. Dans Whop, crée un **code promo à 100 %** (ou achète toi-même Premium puis rembourse-toi).
2. Sur ton site, avec un compte de test : « Voir les offres », achète, récupère la clé, colle-la, vérifie que le profil passe en Premium.
3. Résilie dans Whop, attends 24 heures (ou ne fais rien : l'accès est revérifié chaque jour) : le profil redevient gratuit.
4. Si la clé collée est refusée alors que l'achat est valide : note le message d'erreur et envoie-le-moi, c'est exactement ce que ce test sert à trouver.

## Étape 6 : ce qui te protège, et ce qui ne te protège pas
**Déjà en place dans le code**
- Mots de passe stockés brouillés (PBKDF2), jamais en clair. 10 mots de passe faux sur un compte le bloquent une heure.
- La clé de l'IA reste sur le serveur, jamais dans la page. Plafond d'appels par jour, par adresse IP et par visiteur.
- Seule ton adresse confirmée peut être éditeur. Les actions d'éditeur sont refusées à tout autre compte.
- Tous les textes affichés sont neutralisés contre l'injection de code ; les liens et les images publiés sont contrôlés ; un lien redirigé doit être en https et publié par un abonné payant.
- Les statistiques n'enregistrent aucun identifiant de lecteur. L'effacement d'un compte supprime tout.
- En-têtes de sécurité du site (fichier `_headers`) : pas d'intégration dans d'autres sites, pas de scripts externes. **Je n'ai pas pu les tester dans un vrai navigateur sur Cloudflare** : si une partie du site s'affiche mal après l'envoi (météo, images), dis-le-moi.
**Reste à ta charge**
- La double authentification partout (étape 0) et le prépayé Anthropic (étape 1) : ce sont tes deux vraies protections financières.
- Le **SALT** : ne le change jamais ni ne le perds (garde-le dans ton gestionnaire).
- En cas de fuite d'une clé : supprime-la tout de suite chez Anthropic ou Whop, crée-en une autre, refais `npx wrangler secret put …`.
- Une sauvegarde : « Télécharger une sauvegarde » dans ton profil de temps en temps, et à garder ailleurs que sur le téléphone.
- Un lien publié par un abonné peut renvoyer vers un site douteux : les signalements masquent une liste après 3 alertes, et tu peux supprimer depuis ton profil.
