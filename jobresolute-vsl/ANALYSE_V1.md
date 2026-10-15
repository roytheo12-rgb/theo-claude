# Analyse de l'export complet (version 1, 2:55, reçue le 15/10)

Méthode : détection des coupes, une image par seconde sur tout le film, transcription de la voix (Whisper) avec ses temps, mesure des niveaux (EBU R128). Les temps ci-dessous sont ceux **de ton export**.

## Ce qui marche
- **Toute la voix est là sauf V16**, dans l'ordre, et la quasi-totalité tombe sur le bon plan : V02 sur le téléphone, V03 sur l'hôtel et Julien, V04 pile sur le CV qui tombe (0:37,5), V05 sur P08, V08a → V15b chacune sur sa séquence, V17 sur la poignée de main (2:07), V18 sur la maison de poupée, V18b sur la vision, V19 sur le logo final.
- « JobResolute » est prononcé de la même façon partout.
- Les raccords iPhone → acte II et acte II → Mac de Julien fonctionnent.
- L'acte III (Julien de dos, Nadia devant l'hôtel, le lobby, le restaurant → cuisine → salle des employés) est cohérent et lisible.

## À corriger — par ordre d'importance

### P0 — obligatoire
| # | Où | Problème | Correction | Qui |
|---|---|---|---|---|
| 1 | 1:28,6 · 2:26,6 · 2:34,6 | **Voile gris** d'une demi-seconde à trois transitions (la transition « zoom » de ffmpeg passe par du gris sur fond noir) | Corrigé : fondus enchaînés à la place. **Remplace ACTE2.mp4 et ACTE4.mp4** par les nouvelles versions | moi ✅ |
| 2 | 2:46 → 2:55 | **9 s de noir à la fin** : l'appel à l'action disparaît avant la fin du film | ACTE4 dure maintenant **32 s** (les deux boutons restent 3 s de plus). Dans CapCut, **coupe tout ce qui suit la fin d'ACTE4** | moi ✅ + toi |
| 3 | 1:51 → 1:56 | **V16 manque** (« Pas un outil de plus. Tout le parcours. ») : le parcours complet passe en silence, alors que c'est le sommet du film | Génère V16 et pose-la au **début de la séquence du parcours** (la ligne qui dézoome) | toi |
| 4 | 1:33 → 1:38 | **La voix dit « en même temps », l'écran dit « au même instant »** | Regénère V13 avec le texte exact : « Le même résultat, des deux côtés, au même instant. » | toi |
| 5 | 2:33 → 2:40 | **La voix dit « On ne digitalise pas… On change… », l'écran dit « Nous ne digitalisons pas… Nous changeons… »** (texte validé avec Henry) | Regénère V18c : « Nous ne digitalisons pas le recrutement. Nous changeons ce que l'on mesure. » | toi |

### P1 — majeur
| # | Où | Problème | Correction |
|---|---|---|---|
| 6 | 0:07 → 0:17 puis 0:49 → 0:55 | **Nadia change de lumière** : son studio est **chaud et ambré** dans P02/P04, puis **vert froid** dans P09. Ça se voit, et ça casse l'arc du film (elle ne doit entrer dans l'ambre qu'à l'acte III) | Dans CapCut, sur P01b, P02 et P04 : Ajuster → **Température −35, Teinte −15** (vers le vert), **Saturation −20**, Hautes lumières −10. Compare avec P09 et ajuste jusqu'à ce que les deux se ressemblent. Ensuite, « Copier les attributs » / « Coller » sur les autres plans chez Nadia |
| 7 | 0:55 → 1:06 | **V06 et V07 arrivent ~2,5 s trop tôt** : « Voici JobResolute » est dit pendant que le téléphone flotte encore (le logo n'apparaît qu'à 0:58,5), et chaque promesse est dite ~2 s avant d'apparaître. V07 dure ~8,5 s pour une séquence de 6 s | Envoie-moi les fichiers V06 et V07 : je recale l'intro et j'allonge M02 sur la durée exacte de V07. En attendant : décale V06 pour qu'elle commence à **0:58,3** |
| 8 | 0:02,8 → 0:09 | **V01 est 7 dB plus faible** que les autres répliques (−34 LUFS contre −26) : la toute première phrase du film est la moins audible | Sur le clip V01 : **Volume +7 dB** (ou « Normaliser le volume » sur toutes les répliques) |
| 9 | tout le film | **Niveau global trop bas pour le web** : −23,4 LUFS (YouTube et LinkedIn visent −14), et crête à −0,3 dB (trop près de la saturation) | Dans CapCut : « Normaliser le volume » sur chaque piste, puis à l'export. Ou envoie-moi l'export final : je fais le mastering (−14 LUFS, crête −1 dB) sans toucher à l'image |
| 10 | 1:52 → 2:00 et autres silences | **Pas de musique** : les passages sans voix tombent à −48 LUFS, quasi silencieux | Ajoute la musique prévue (pizzicato et célesta pour l'acte I, piano pour l'acte II), **8 à 10 dB sous la voix**, avec atténuation automatique sous la voix |

### P2 — finition
| # | Où | Remarque |
|---|---|---|
| 11 | tout le film | Les formats prévus (**1.37** pour l'acte I, **2.39** pour l'acte III) ne sont pas appliqués : tout est en 16:9. C'est un choix possible, mais alors je dois retirer les bandes noires 2.39 qui apparaissent à la fin d'ACTE2 (sinon on voit les bandes disparaître d'un coup quand P10 commence). **À toi de trancher.** |
| 12 | 0:30 → 0:35 | P06 : la troisième image est une blanchisserie (prévu : un casier vide). Ça marche aussi, mais le sens « un poste vide » est moins clair |
| 13 | 0:36 → 0:42 | P07 : la photo de Nadia sur le CV n'est pas dans « son » vert : le lien avec elle est moins lisible |

## Ce que je ne peux pas juger
Je n'entends pas le son : je ne peux dire ni si la voix est belle, ni si l'émotion passe. C'est ton oreille.
