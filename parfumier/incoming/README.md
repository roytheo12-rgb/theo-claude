# Photos de parfums : dépose-les ici

Dossier : `parfumier/incoming/` sur la branche `claude/stoic-fermat-uz7cd8`.
Le dépôt est privé : seules les personnes que tu invites voient ces photos.

## Format des photos

| Point | Ce qu'il faut |
|---|---|
| Type de fichier | **JPG ou PNG** (WebP aussi). Pas de HEIC (iPhone) : voir plus bas. |
| Taille | au moins **800 px de haut**, 10 Mo maximum par photo |
| Contenu | **un seul flacon par photo**, entier (bouchon et pied visibles), de face |
| Fond | **uni et clair** (blanc, gris clair) : photo de site officiel ou de revendeur, ou flacon posé sur une feuille blanche. C'est ce qui permet un détourage propre. |
| Cadrage | pas de main, pas de reflet de fenêtre, pas de texte ou de filigrane par-dessus |
| Nom du fichier | `marque - nom.jpg`, par exemple `Maison Francis Kurkdjian - Baccarat Rouge 540.jpg`. Évite les caractères spéciaux (`/ \ : * ? " < > |`). Pas de dossier compressé : envoie les images directement. |

Pas de nom ? Ce n'est pas grave : je reconnais le flacon sur l'image, et je te demande de confirmer en cas de doute.

**Photo iPhone en HEIC :** Réglages → Appareil photo → Formats → « Le plus compatible », ou partage la photo par AirDrop vers un Mac (conversion en JPG automatique). Sinon, ouvre-la dans Photos et exporte-la en JPG.

## Comment les déposer (depuis un ordinateur)

1. Va sur https://github.com/roytheo12-rgb/theo-claude et choisis la branche `claude/stoic-fermat-uz7cd8` dans le menu des branches.
2. Ouvre `parfumier` puis `incoming`.
3. Clique « Add file » puis « Upload files ».
4. Glisse toutes les photos d'un coup (**100 fichiers maximum par envoi** : fais plusieurs envois au-delà).
5. En bas, laisse « Commit directly to the `claude/stoic-fermat-uz7cd8` branch », puis « Commit changes ».
6. Écris-moi « c'est dans incoming ». Je récupère tout.

## La liste (facultatif, mais ça évite tout oubli)

Copie `liste.csv` ou remplis-le directement sur GitHub (icône crayon) : une ligne par parfum.

| Colonne | Valeurs |
|---|---|
| `fichier` | nom exact du fichier photo |
| `marque`, `nom` | si tu les connais |
| `ou` | `collection` ou `wishlist` |
| `taille_ml` | 2, 5, 10, 30, 50, 75 ou 100 |
| `reste` | `plein`, `beaucoup`, `moitie`, `peu` ou `presque fini` |
| `usage` | `quotidien`, `occasions` ou `peu importe` |

Ce qui manque, je mets une valeur neutre (100 ml, plein, peu importe) et tu le règles dans l'app.
