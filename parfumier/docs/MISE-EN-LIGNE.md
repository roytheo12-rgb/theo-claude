# Mise en ligne : ce qui reste avant la première vente

Le pas à pas détaillé est dans `docs/GUIDE-DEPLOIEMENT.md`.

Le code est prêt et testé avec des simulations. Ce qui suit se fait chez toi, hors du code.

## Bloquant (légal)
1. Remplir les trous des pages légales : nom ou dénomination, statut, SIRET, TVA (ou « TVA non applicable »), courriel de contact, directeur de publication, entité Whop (reprise de ses conditions), médiateur de la consommation.
2. Photos de flacons : droits des marques. À régler avant de vendre (tes photos, accords, ou visuels génériques).

## Bloquant (technique, une seule fois)
3. Cloudflare : `npx wrangler kv namespace create SILLAGE` (id dans `wrangler.toml`), `npx wrangler d1 create sillage` (bloc `d1_databases`), puis `npx wrangler deploy`.
4. Secrets : `ANTHROPIC_API_KEY`, `ADMIN_KEY`, `SALT`, `WHOP_API_KEY`, `RESEND_API_KEY` (avec `MAIL_FROM`), `CONV_SECRET`.
5. Whop : créer Premium mensuel, Premium annuel, Fondateur (stock 50), puis `WHOP_PRODUCTS` (prod_… vers premium, founder, brand). Faire un **vrai achat test** de bout en bout : paiement, clé, activation dans l'appli, puis résiliation.
6. Console Anthropic : limite de dépense et alerte par courriel.
7. Un vrai iPhone et un vrai Android : installation sur l'écran d'accueil, inscription, un conseil IA, un abonnement.

## Peut attendre
8. Sauvegarde nocturne R2 (le bouton de téléchargement existe déjà).
9. Commissions : comptes réseau d'affiliation, `AFFIL_RULES`, notification de vente. Sans cela, les liens restent normaux.
10. Marques vérifiées : quand une vingtaine de créateurs sont actifs.

## Ce qui n'est vérifié que par simulation
La validation Whop (réponse réelle de l'API), D1, Resend, R2, les règles d'accès de l'artefact claude.ai pour un autre membre, le rendu sur un vrai téléphone.
