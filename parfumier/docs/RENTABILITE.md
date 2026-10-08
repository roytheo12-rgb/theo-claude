# Sillage : tes prix sont-ils rentables ?

Réponse courte : **oui pour Premium (mensuel et annuel), avec des quotas d'IA fixés comme ci-dessous. Le seul point fragile est l'offre « Membre fondateur à 79 € à vie » si on la laisse utiliser l'IA sans plafond.**

Tout ce qui suit est une **estimation**, pas une mesure. Les tokens sont calculés d'après la taille réelle des prompts du projet ; les frais Whop viennent de comparateurs tiers, pas de la page officielle de Whop. Les vraies valeurs se lisent après quelques semaines : console Anthropic (dépense réelle), tableau de bord Whop (frais réels), et l'écran « Voir les chiffres » de l'éditeur.

## 1. Ce que coûte l'IA

Tarifs Anthropic au million de tokens : Claude Sonnet 5.5 = 2 $ en entrée, 10 $ en sortie. Claude Haiku 5.5 = 0,10 $ en entrée, 0,50 $ en sortie.

| Usage | Modèle | Tokens (estimés) | Coût par appel |
|---|---|---|---|
| Conseil du jour ou « je cherche… » (le gros appel) | Sonnet 5.5 | 4 000 à 8 000 en entrée, 1 200 à 2 000 en sortie | **0,02 à 0,036 $** |
| Message au parfumier (reformulation, questions) | Haiku 5.5 | ~3 000 en entrée, ~400 en sortie | **≈ 0,0005 $** |
| Identifier un parfum (nom ou photo) | Haiku 5.5 | ~1 500 en entrée, ~300 en sortie | **≈ 0,0003 $** (un peu plus avec photo) |

Le conseil du jour coûte donc environ **40 à 70 fois plus** qu'un message au parfumier. C'est pourquoi les quotas portent surtout sur les conseils.

## 2. Ce que rapporte un abonnement (par mois)

Hypothèses : 1 € = 1,10 $. Frais Whop affichés par les comparateurs : 2,7 % + 0,30 $ par paiement, et 3 % de plus si la vente passe par une automatisation (cas probable avec une clé de licence : je compte le pire cas). Frais de retrait (de 2,50 à 23 $ par virement) à lisser sur tes ventes.

| Offre | Prix payé | Net si tu n'es pas assujetti à la TVA | Net si tu reverses 20 % de TVA |
|---|---|---|---|
| Premium mensuel | 5,99 € | ≈ 5,4 € | ≈ 4,4 € |
| Premium annuel | 49 € | ≈ 3,9 € par mois (≈ 47 € d'un coup) | ≈ 3,2 € par mois |
| Fondateur | 79 € une fois | ≈ 74 € | ≈ 61 € |

## 3. Marge par offre avec les quotas du code

Quotas : Gratuit 3 conseils / 20 messages / 12 parfums. Premium et Fondateur 60 conseils / 300 messages / collection illimitée. Réglables sans toucher au code (variables `FREE_ADV`, `PREMIUM_ADV`, etc. dans `wrangler.toml`).

| Cas | Coût IA par mois | Marge Premium mensuel | Marge Premium annuel |
|---|---|---|---|
| Quota entièrement consommé (cas extrême) | ≈ 2,5 $ ≈ 2,3 € | +2,1 à +3,1 € (≈ 50 à 57 %) | +0,9 à +1,6 € |
| Gros utilisateur (20 conseils, 100 messages) | ≈ 0,5 $ ≈ 0,45 € | +4,0 à +4,9 € | +2,8 à +3,4 € |
| Utilisateur moyen (5 conseils, 30 messages) | ≈ 0,12 $ | ≈ +4,3 à +5,3 € (> 90 %) | ≈ +3,1 à +3,8 € |

Un compte **gratuit** qui épuise tout son quota coûte ≈ 0,12 $ par mois. Mille comptes gratuits actifs à fond = 120 $ par mois : c'est le vrai risque, pas les abonnés. Le plafond global `DAILY_CAP` (150 conseils par jour = 5,40 $ par jour au maximum) borne ce risque. **Règle d'or : fixe aussi une limite de dépense mensuelle dans la console Anthropic.**

## 4. Le point fragile : fondateur à 79 € à vie

Il encaisse 61 à 74 € une seule fois, mais le coût d'IA continue chaque mois. À plein quota (2,3 €/mois), il faut **26 à 32 mois** pour que le coût dépasse l'encaissement. Pour un usage normal (0,45 €/mois) le point d'équilibre est à plus de 10 ans.

Trois protections, de la plus simple à la plus stricte :
1. **Garde 100 places** (limite de stock à régler dans Whop) : l'exposition maximale est de 230 € par mois, tous au plafond, pour 6 100 à 7 400 € encaissés.
2. **Plafonne les fondateurs plus bas** que Premium (ex. `PREMIUM_ADV` identique mais un code fondateur à 40) : à faire si tu veux de la marge de sécurité.
3. **Passe le fondateur à 99 €** : +20 € de marge, et ça reste très attractif face à 5,99 €/mois.

## 5. Coûts fixes

| Poste | Estimation | Remarque |
|---|---|---|
| Cloudflare Workers + KV | 0 € au départ, puis ≈ 5 $/mois | Le gratuit limite les écritures (≈ 1 000 par jour) : à partir de quelques centaines d'utilisateurs actifs il faut l'offre à 5 $/mois. À vérifier sur la page tarifs de Cloudflare. |
| Nom de domaine | ≈ 10 à 15 € par an | |
| Emails de réinitialisation (Resend) | 0 € au départ | Offre gratuite suffisante au début |
| Comptable / statut | à voir | |

**Point mort : environ 2 abonnés Premium** couvrent l'hébergement.

## 6. Verdict

- Premium 5,99 € / 49 € : rentable, y compris dans le pire cas. Garde les quotas du code.
- Fondateur 79 € : acceptable avec 100 places maximum ; passe à 99 € ou baisse son plafond si tu veux dormir tranquille.
- Gratuit : garde-le petit (3 conseils) et surveille la dépense réelle.
- À mesurer dès la première semaine : coût moyen réel d'un conseil (console Anthropic) et part des abonnés qui atteignent leur quota.
