# Sillage : tes prix sont-ils rentables, une fois les taxes, les impôts et Whop pris en compte ?

**Réponse courte : oui, mais la marge est plus mince qu'on ne le croit une fois les charges retirées. Il reste environ 3 € nets sur un Premium mensuel, 2,2 à 2,5 € par mois sur l'annuel, et 54 à 61 € une fois sur un fondateur à 99 €. Avec les quotas d'IA du code (40 conseils par mois), l'IA n'en mange au pire qu'une partie.**

Tout est une **estimation à faire valider par un comptable** : les taux officiels bougent chaque année, les sources que j'ai trouvées se contredisent sur certains chiffres (je le dis plus bas), et je ne connais pas ton statut. Les prix sont **TTC** (c'est ton choix).

## 1. Ce que tu gardes vraiment sur 100 € payés (cas Premium mensuel, 5,99 €)

| Étape | Montant | Remarque |
|---|---|---|
| Prix payé par le client (TTC) | 5,99 € | |
| − TVA 20 % | − 1,00 € | Whop se dit « marchand officiel » et reverse la TVA du pays du client sur les produits numériques (d'après sa documentation). **À confirmer dans ses conditions vendeur.** Si ce n'est pas le cas, c'est à toi de la reverser (ou d'être en franchise). |
| = Chiffre d'affaires hors taxe | 4,99 € | C'est ce que tu déclares |
| − Frais Whop | − 0,43 € à − 0,61 € | 2,7 % + 0,30 $ par paiement, plus 3 % si la vente passe par une automatisation (cas probable avec une clé de licence). Chiffres de comparateurs, pas de la page officielle de Whop. |
| − Cotisations sociales (URSSAF) | − 1,06 € à − 1,28 € | Micro-entreprise : 21,2 % du CA pour des prestations de services commerciales, 25,6 % si l'activité est classée BNC. Les sources diffèrent (certaines disent 26,1 % en 2026) : à vérifier sur urssaf.fr. |
| − Impôt sur le revenu | − 0,08 € à − 0,11 € | Avec le prélèvement libératoire (1,7 % ou 2,2 %), si tu y as droit. Sinon : impôt au barème sur 50 % ou 66 % du CA, de 0 € à ≈ 1 € ici selon ta tranche. |
| = **Reste dans ta poche, avant l'IA** | **≈ 3,0 à 3,4 €** | soit 50 à 57 % du prix payé |

### Les trois offres, même calcul

| Offre | HT | Frais Whop | URSSAF | Impôt (libératoire) | **Net avant IA** | Par mois |
|---|---|---|---|---|---|---|
| Premium mensuel 5,99 € | 4,99 € | 0,43 à 0,61 € | 1,06 à 1,28 € | 0,08 à 0,11 € | **3,0 à 3,4 €** | 3,0 à 3,4 € |
| Premium annuel 49 € | 40,83 € | 1,60 à 3,07 € | 8,66 à 10,45 € | 0,69 à 0,90 € | **26,4 à 29,9 €** | **2,2 à 2,5 €** |
| Fondateur 99 € (50 places, une fois) | 82,50 € | 2,95 à 5,92 € | 17,49 à 21,12 € | 1,40 à 1,81 € | **53,7 à 60,7 €** | une fois |

Si tu es imposé au barème dans une tranche à 30 % au lieu du prélèvement libératoire, retire encore ≈ 0,6 € au mensuel, ≈ 5 € à l'annuel et ≈ 10 € au fondateur.

## 2. Ce que coûte l'IA

Tarifs Anthropic au million de tokens : Claude Sonnet 5.5 = 2 $ en entrée, 10 $ en sortie. Claude Haiku 5.5 = 0,10 $ en entrée, 0,50 $ en sortie. 1 € = 1,10 $.

| Usage | Modèle | Coût par appel (estimé d'après la taille réelle des prompts) |
|---|---|---|
| Conseil du jour ou « je cherche… » | Sonnet 5.5 | **0,02 à 0,036 $** |
| Message au parfumier | Haiku 5.5 | ≈ 0,0005 $ |
| Identifier un parfum | Haiku 5.5 | ≈ 0,0003 $ |

Quotas du code : **Gratuit** 3 conseils / 20 messages / 12 parfums. **Premium et Fondateur** 40 conseils / 200 messages / collection illimitée (je les ai baissés de 60 à 40 : voir la section 3). Réglables dans `wrangler.toml` sans toucher au code.

Coût mensuel par personne : utilisateur moyen (5 conseils) ≈ 0,10 €, gros utilisateur (20 conseils) ≈ 0,45 €, **quota entièrement consommé ≈ 1,45 €**.

## 3. Marge finale par mois, après taxes, frais Whop et IA

| Offre | Utilisateur moyen | Gros utilisateur | Quota consommé à fond |
|---|---|---|---|
| Premium mensuel | **2,9 à 3,3 €** | 2,5 à 3,0 € | **1,5 à 1,9 €** |
| Premium annuel | **2,1 à 2,4 €** | 1,8 à 2,0 € | **0,75 à 1,05 €** |

Avec l'ancien quota de 60 conseils, l'annuel à plein régime tombait à ≈ 0 € : c'est pour ça que je l'ai baissé à 40. À 40 conseils, **tout reste positif**, même dans le pire cas. Si tu es au barème à 30 %, l'annuel à plein régime est à peu près à l'équilibre : surveille-le.

**Fondateur 99 €** : il rapporte 54 à 61 € une fois. À plein quota (1,45 €/mois), le coût IA dépasse l'encaissement au bout de **37 à 42 mois**. Pour un usage normal (0,45 €/mois), au bout de plus de 10 ans. Avec 50 places, ton exposition maximale est de ≈ 73 € par mois, tous au plafond, pour 2 700 à 3 000 € encaissés. C'est acceptable, et c'est plus sain que les 79 € à 100 places.

**Gratuit** : un compte actif à fond coûte ≈ 0,12 $ par mois (3 conseils). Mille comptes gratuits à plein régime = 120 $ par mois : c'est le vrai risque, pas les abonnés. Garde le plafond global `DAILY_CAP`, la vérification d'email (maintenant en place) et **fixe une limite de dépense mensuelle dans la console Anthropic**.

## 4. Coûts fixes

| Poste | Estimation | Remarque |
|---|---|---|
| Cloudflare Workers + KV + R2 | 0 € au départ, puis ≈ 5 $/mois | Les écritures du gratuit sont limitées (≈ 1 000 par jour) : dès quelques centaines d'utilisateurs actifs, prends l'offre à 5 $/mois. À vérifier sur la page de prix de Cloudflare. |
| Nom de domaine | ≈ 10 à 15 € par an | |
| Emails (Resend) | 0 € au départ | |
| CFE (cotisation foncière) | de l'ordre de quelques centaines d'euros par an dès la 2e année, selon la commune | à vérifier |
| Comptable | facultatif en micro | |

**Point mort : environ 2 abonnés Premium mensuels** couvrent l'hébergement.

## 5. Les points de droit qui changent le calcul (à valider avec un expert-comptable)

1. **Qui reverse la TVA ?** Whop dit s'en charger sur les produits numériques ; un site concurrent affirme que ses conditions vendeur disent le contraire. Si c'est toi : franchise en base possible jusqu'à environ 37 500 € de services par an (les sources se contredisent : 36 800 €, 37 500 €, voire 25 000 € si la réforme s'applique), mais pour des clients européens au-delà de 10 000 € de ventes à l'étranger par an, il faut la TVA du pays du client via le guichet unique (OSS).
2. **BIC ou BNC ?** Un abonnement à un service en ligne est plus souvent une prestation commerciale (21,2 %), mais c'est ton comptable ou l'URSSAF qui tranche.
3. **Plafond de micro-entreprise** : 77 700 € de CA par an pour les services (certaines sources parlent de 83 600 €). Au-delà, autre régime.
4. **Facturation électronique** : à partir de septembre 2026, tout le monde doit savoir recevoir des factures électroniques (d'après une source, à vérifier).

## 6. Verdict

- **Premium mensuel** : rentable, y compris dans le pire cas.
- **Premium annuel à 49 €** : rentable à 40 conseils par mois, mais c'est l'offre la plus fragile. Ne la brade pas plus.
- **Fondateur à 99 €, 50 places** : bon choix. Garde la limite de stock dans Whop.
- **À mesurer dès la première semaine** : coût réel d'un conseil (console Anthropic), frais réels (tableau de bord Whop), part des abonnés qui atteignent leur quota (écran « Voir les chiffres » de l'éditeur).
