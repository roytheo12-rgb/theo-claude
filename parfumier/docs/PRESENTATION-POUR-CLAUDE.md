# Sillage : présentation complète pour Claude (assistant personnel de Théo)

À coller dans la mémoire ou le contexte de l'assistant. Dernière mise à jour : 9 octobre 2026.

## 1. En une phrase
Sillage est une application française de conseil en parfum : l'utilisateur décrit sa journée, une IA choisit le bon parfum dans sa collection et explique pourquoi. Autour, il y a une base de 4 747 parfums (215 maisons), 138 univers d'inspiration, un voyage olfactif qui apprend à connaître la personne, et un réseau social à la Letterboxd (suivis, avis, publications, playlists, créateurs, marques vérifiées).

## 2. Qui, et comment travailler avec Théo
- Théo, 23 ans, fondateur. Compte éditeur : roytheo12@gmail.com. Contact public : hello.sillage.app@gmail.com. Statut juridique pas encore créé (micro-entreprise envisagée).
- Toujours répondre en français, tutoiement. Mots simples : il n'est pas développeur.
- Après chaque changement : lancer la construction et les tests, committer (avec les lignes `Co-Authored-By` et `Claude-Session`), pousser sur la branche `claude/stoic-fermat-uz7cd8`, republier l'artefact. Pas de pull request sans demande explicite.
- Règles de contenu : ne jamais inventer de notes ni de parfums, prix toujours indicatifs, tutoiement et formulations neutres dans les questions, chaque bouton doit fonctionner, aucun identifiant de modèle d'IA dans ce qui est poussé.
- Style des textes de l'appli : ne doit pas faire « écrit par une IA » (pas de tirets cadratins, pas de deux-points dans la prose).
- Dépôt : `roytheo12-rgb/theo-claude`, dossier `parfumier/`.

## 3. Où est quoi
- Appli (claude.ai) : https://claude.ai/artifact/SYGyrV8U1RZLpqxnmopuBP (version 201). Elle utilise la base de l'artefact (collections `community`, `posts`, `follows`, `ratings`, `comments`, `notifs`, `feedback`…). Pas de Whop, de commissions ni de marques là-bas.
- Vitrine : https://claude.ai/artifact/4Lv3scfTcUC2vZc2bkDvty (fichier unique, images intégrées).
- Site public : `demo-public/` (Worker Cloudflare + KV + D1, pas encore déployé).
- Visuels de story (écrans simulés) : `demo-public/media/stories/` ; scripts `demo-public/tools/stories.mjs` (captures) et `stories-compose.mjs` (mise en page).
- Documents utiles : `docs/GUIDE-DEPLOIEMENT.md` (pas à pas), `docs/MISE-EN-LIGNE.md` (liste avant la première vente), `docs/WHOP.md`, `docs/RENTABILITE.md`, `docs/BACKLOG.md`.

## 4. Ce que fait l'appli
**Barre du bas : Accueil, Étagère, Recherche, Pour toi, Inspirations, Balade, Profil.**
- **Accueil** : on choisit ou on écrit la situation (travail, rendez-vous, sortie, météo, tenue, humeur). L'IA (Claude Sonnet 5.5) choisit un parfum de la collection, raconte pourquoi, donne ce qu'on va sentir (tête, cœur, fond), une alternative et un layering. Le résultat s'affiche en stories plein écran.
- **Étagère** : la collection (taille du flacon, ce qu'il reste, usage), le parfumier privé (chat, modèle léger Haiku 5.5) qui sait poser des questions, gérer un cadeau, proposer des alternatives « moins cher ».
- **Recherche** : trois volets. « Recherche » (parfum, maison, nez, note, envie, mode découverte), « Conseils » (manques de la collection, achats à son budget, voyage), « Membres » (recherche par pseudo).
- **Pour toi** : le fil d'activité des gens qu'on suit (publications, playlists partagées, avis commentés), avec commentaires sous les publications et un bouton « Découvrir ».
- **Inspirations** : « Univers Sillage » (138 listes : cinéma, destinations, archétypes, icônes…) et « Communauté » (playlists des membres rangées par catégorie, catégories réglables par l'éditeur).
- **Balade** : balade olfactive en boutique (une touche, un symbole, une impression, un bilan).
- **Profil** : photo, pseudo, bio, liens, compteurs (publications, abonnés, abonnements), onglets Playlists (privées ou publiques, avec photo de couverture et catégorie), Publications, Abonnés, Wishlist (privée ou publique). Aperçu public, partage par lien.
- **Voyage olfactif** : questions simples une par une (odeurs du quotidien, famille préférée, image, présence, vie, saisons, escapades, matières, style, caractère, ce qu'on fuit, parfum fétiche), classements par ordre d'importance, case « Je ne sais pas », portrait olfactif à la fin.
- **Fiche parfum** : notes, histoire dans les univers, prix officiel indicatif (barèmes des maisons), où l'acheter, avis des abonnés et moyenne.
- **Notifications** : cloche (nouvel abonné, commentaire, vente).
- **Retours** : formulaire d'aide dans le profil (problème, idée, question), lu par l'éditeur.
- **Mode éditeur** (Théo seul) : modifier prix, textes, masquage, ordre des playlists, catégories ; messages reçus ; publications et listes signalées ; marques à valider ; commissions ; chiffres ; sauvegarde. Dans l'artefact, il est réservé au propriétaire.
- **Réseau pour créateurs** : liste publique avec lien de vidéo ou de post, lien officiel ou d'affiliation par parfum, mention de partenariat toujours affichée.
- **Marques vérifiées** : profil avec badge (validé par Théo, abonnement marque actif), publications étiquetées « Contenu de marque », statistiques sans donnée personnelle (vues de fiches de leurs parfums, vues de publications, clics).
- **Indépendance de l'IA** : les conseils de l'IA ne lisent rien du réseau, des marques ou des commissions (un test automatique le vérifie). À préserver absolument : c'est la crédibilité du produit.

## 5. Offres et comptes (site public, via Whop)
- Gratuit : 3 conseils IA par mois, 20 échanges avec le parfumier, 12 parfums, 2 inspirations privées.
- Premium : 5,99 € TTC par mois ou 49 € TTC par an. 40 conseils IA, 200 échanges, collection illimitée, publication et partage.
- Membre fondateur : 99 € TTC une seule fois, 50 places, tout le Premium à vie.
- Marque : abonnement mensuel (prix non fixé), plan « brand » dans Whop.
- Validation d'accès par la clé de licence ou l'identifiant d'adhésion Whop, revérifiée chaque jour. Confirmation d'email (Resend) bloquant les conseils IA tant qu'elle n'est pas faite.

## 6. Technique en bref
- Pur JavaScript, sans framework. `v2/app.js` (appli), `engine.js` (moteur de recommandation sur 18 axes), `v2/product.js` + `v2/social-ui.js` (profil, réseau), `v2/demo.js` (client du serveur), `v2/artifact-backend.js` (même interface avec la base de l'artefact), `v2/build.py` (deux constructions : `python3 v2/build.py` pour l'artefact, `python3 v2/build.py public` pour le site, environ 100 secondes).
- Serveur : `demo-public/src/` (`index.js`, `account.js`, `social.js`, `prompt.mjs`, `pub.js`). Données : Cloudflare KV (comptes, sessions, listes) et D1 (réseau, statistiques, commissions). Sauvegarde nocturne R2 prévue.
- Tests : `demo-public/test/` (`worker`, `account`, `social`, `engine-eval`, puis `e2e`, `e2e-product`, `e2e-artifact` avec un vrai navigateur). Tout passe.
- Sécurité en place : mots de passe PBKDF2, blocage après 10 échecs, éditeur uniquement si l'email est confirmé, plafonds d'appels IA par jour, par IP et par visiteur, en-têtes de sécurité, liens https contrôlés, effacement complet d'un compte.

## 7. État honnête
- Fait et testé en simulation : tout ce qui est décrit plus haut.
- **Jamais essayé en vrai** : un achat Whop réel (le format exact de la clé de licence reste à confirmer), le déploiement Cloudflare (KV, D1, secrets), l'envoi de courriels, l'installation sur un vrai iPhone ou Android, les règles d'accès de l'artefact pour un deuxième vrai utilisateur, les en-têtes de sécurité dans un vrai navigateur.
- Le site public n'est pas en ligne : l'artefact claude.ai est la version que Théo teste.

## 8. Restes à faire (par priorité)
1. **Légal (bloquant avant de vendre)** : créer le statut, puis remplir nom, statut, SIRET, TVA, directeur de publication ; désigner un médiateur de la consommation (en France ou dans l'UE, pas aux États-Unis) ; vérifier avec un comptable qui reverse la TVA (Whop ou Théo). Photos de flacons : droits des marques à régler (photos à lui, accords, ou visuels génériques).
2. **Mise en ligne** : suivre `docs/GUIDE-DEPLOIEMENT.md` (Anthropic prépayé avec plafond, Cloudflare offre à 5 $/mois, KV, D1, secrets, `wrangler deploy`, compte éditeur créé en premier, Whop avec les trois produits).
3. **Vrai test d'achat** avec un code promo à 100 %, puis un vrai iPhone et un vrai Android.
4. **Courriels** : domaine à lui + Resend, à activer avant d'ouvrir au public (contre les faux comptes).
5. **Plus tard** : place de marché « trade » (échange et vente entre membres, volontairement repoussée : paiements, envoi, faux, litiges), messages privés, notifications push, versements automatiques aux créateurs, version anglaise, double authentification, import de listes depuis une vidéo.
6. Avant d'ouvrir aux marques : mentions légales complètes et une vingtaine de créateurs actifs à leur montrer.

## 9. Comment ça peut rapporter de l'argent
**A. Abonnements (le socle).** Net par client, après TVA, frais Whop, cotisations et impôt (micro-entreprise, estimation à valider par un comptable) : Premium mensuel environ 3,0 à 3,4 € par mois ; Premium annuel environ 2,2 à 2,5 € par mois ; fondateur 54 à 61 € une fois. Coût de l'IA : environ 0,10 € par mois pour un utilisateur moyen, 1,45 € au pire si tout le quota est consommé. L'hébergement est couvert dès environ 2 abonnés mensuels.
Ordres de grandeur (hypothèses, rien n'est mesuré) :
- 100 payants (60 mensuels, 40 annuels) : environ 270 à 290 € par mois, après IA.
- 50 fondateurs vendus : 2 700 à 3 000 € encaissés une fois.
- 1 000 payants : environ 2 700 € par mois. Avec une conversion de 2 à 5 % des inscrits gratuits (hypothèse courante, à mesurer), il faut 20 000 à 50 000 inscrits.
Le gratuit coûte (environ 0,12 $ par mois par compte actif à fond) : c'est le vrai risque, d'où les plafonds et la confirmation d'email.

**B. Commissions sur les liens de boutique (potentiel réel, mais lent).** Chaque lien publié passe par Sillage. Il peut être réécrit avec l'identifiant d'affilié de Théo (règles `AFFIL_RULES`) ; quand un réseau (Awin, Impact…) signale une vente, Théo garde 20 % de la commission et le créateur 80 %. Une commission de réseau est souvent de 3 à 10 % du panier : sur une vente de 100 € à 5 %, Sillage touche environ 1 €. Pour gagner 100 € par mois par ce canal, il faut environ 100 ventes par mois. Il faut d'abord obtenir les comptes d'affiliation. L'intérêt est surtout de pousser les créateurs à publier, ce qui fait grandir la communauté.

**C. Abonnement des marques (le plus prometteur par client).** Profil vérifié, publications étiquetées, statistiques. Prix à fixer : hypothèse, 10 marques à 49 € par mois feraient 490 € par mois bruts, soit environ 270 € après frais et charges. Condition : une audience de créateurs et de membres à leur montrer. Garde-fou : le contenu de marque n'influence jamais les conseils de l'IA, sinon la confiance disparaît.

**D. Pistes ensuite** : contenus sponsorisés bien étiquetés, offres pour grandes enseignes (parfumeries) avec statistiques d'intérêt, abonnement « créateur pro », marketplace entre membres avec commission.

**Ce qui conditionne tout** : atteindre du monde (stories, créateurs invités, bouche à oreille), mesurer (le bouton « Voir les chiffres » donne inscriptions, confirmations, activations, voyages terminés, coût IA estimé) et garder le coût de l'IA sous contrôle (plafond Anthropic prépayé).

## 10. Décisions qu'il reste à prendre à Théo
- Le statut juridique et la TVA.
- Le prix de l'abonnement marque.
- Le nom de domaine.
- Les photos de flacons (droits).
- La date d'ouverture aux proches, puis au public.
