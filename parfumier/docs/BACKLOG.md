# Backlog : ce qu'il reste à faire, et ce qu'il ne faut pas oublier

*Le « backend » est le serveur : la partie cachée qui garde les comptes, vérifie les achats, protège la clé de l'IA et partage le contenu entre tous. Le « backlog » est une simple liste de choses à faire, classée par priorité : c'est ce document.*

## Avant la première vente (bloquant)
1. **Essai réel de bout en bout** : un achat Whop test, l'activation, la résiliation, un vrai iPhone et un vrai Android. Rien de tout cela n'a été essayé en vrai.
2. **Photos de flacons** : ce sont des photos de marques tierces. En usage commercial il y a un risque de droits. À régler (photos à toi, accords, ou visuels génériques) avant de vendre.
3. **Mentions légales, CGV, confidentialité** : date (8 octobre 2026) et adresse (11 rue de Magdebourg, 75116 Paris) sont remplies, et la mention de l'IA est ajoutée. Il reste tes nom, statut, SIRET, numéro de TVA (ou mention de franchise), courriel de contact, directeur de publication, entité Whop et médiateur. Ancien texte : trous `[date]`, `[adresse]`, `[statut]`. Il faut ton statut (micro-entreprise ?), ton adresse, ton email de contact. Dire aussi que les conseils sont donnés par une IA (obligation de transparence pour les assistants IA : à faire vérifier).
4. **TVA** : les prix sont indiqués TTC (fondateur 99 € TTC, 50 places).  sois clair sur « TTC » ou « franchise en base ». Whop n'est pas forcément le vendeur officiel : vérifie qui reverse la TVA.
5. **Limite de dépense dans la console Anthropic** et alerte par email.
6. ~~**Vérification de l'email**~~ FAIT (lien par courriel, conseils IA bloqués tant qu'il n'est pas ouvert ; demande RESEND_API_KEY et MAIL_FROM) à l'inscription : aujourd'hui n'importe qui peut créer 10 faux comptes pour avoir 10 × 3 conseils gratuits. Le plafond journalier global limite la casse, mais ce n'est pas propre.

## Juste après
7. ~~**Sauvegarde**~~ FAIT (bouton de téléchargement + copie R2 nocturne à activer, voir docs/WHOP.md) des données (Cloudflare KV n'est pas sauvegardé) : export automatique nocturne.
8. ~~**Support**~~ FAIT (formulaire dans le profil, messages lus par l'éditeur ; reste à écrire une FAQ) : une adresse, une FAQ, un moyen de te prévenir d'une panne.
9. ~~**Mesure**~~ FAIT (compteurs par jour dans « Voir les chiffres ») (respectueuse de la vie privée) : combien finissent le voyage, créent un compte, activent une offre. Sans ça tu navigues à l'aveugle.
10. ~~**Modération**~~ FAIT (règles avant publication, filtre, écran des signalements) de la communauté : règles affichées, écran pour toi qui liste les signalements (aujourd'hui 3 signalements masquent une liste, et tu peux supprimer depuis l'appli).
11. **Webhook Whop** pour retirer l'accès à la minute près (aujourd'hui : revérification toutes les 24 h, c'est suffisant au départ).
12. **Liste de la communauté** : chaque affichage relit chaque inspiration (plafonné à 300). Au-delà de quelques centaines, il faudra un index.
13. **Performance au premier chargement** : la page fait ≈ 4 Mo brut mais ≈ 1 Mo compressée (mesuré en gzip ; Cloudflare envoie en gzip ou brotli), puis le service worker la garde. Le service worker la garde ensuite, mais le premier chargement sur 4G est lourd.

## Plus tard
14. Version anglaise (États-Unis) et prix en dollars.
15. Notifications (conseil du matin) : sur iPhone, seulement une fois l'appli installée.
16. Synchronisation sur plusieurs appareils sans écrasement (aujourd'hui la dernière sauvegarde gagne).
17. Double authentification, connexion par lien magique.
18. Historique et annulation des modifications de l'éditeur.
19. Parrainage, essai de 7 jours de Premium, code promo.

## Fait dans cette version
Comptes, mot de passe oublié par email, reconnexion après expiration sans rien perdre, offres Gratuit / Premium / Fondateur reliées à Whop par clé de licence, quotas par offre côté serveur, profil avec photo et pseudo, inspirations privées et publiques avec communauté, compte éditeur, installation sur l'écran d'accueil.
