# Ma Parfumerie

App web (PWA) : ta collection de parfums, un conseil du jour selon météo / journée / mood / tenue, des idées de layering, et des recommandations d'achat selon ton budget, tes goûts et les trous de ta collection.

Lancer : `cd parfumier && python3 -m http.server 8000` puis ouvrir http://localhost:8000 (sur téléphone : « Ajouter à l'écran d'accueil »).

- Données stockées sur l'appareil (localStorage), export/import JSON dans Réglages.
- Météo : Open-Meteo (sans clé), position ou ville.
- Catalogue (`data.js`) : notes et prix indicatifs, à enrichir librement.
- Moteur (`engine.js`) : scoring par étiquettes olfactives, accords de layering par famille, profil de goûts, détection de manques via 8 scénarios types.
