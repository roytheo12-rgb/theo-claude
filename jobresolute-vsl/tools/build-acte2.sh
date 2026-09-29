#!/usr/bin/env bash
# Rend toutes les séquences de l'acte II puis les assemble dans l'ordre du film.
set -e
cd "$(dirname "$0")/.."
ORDRE="M01 M02 C1 M03 M04 M05 C2 M06 M07 C3 M08 M09 M10 M11 M12"
FF="${FFMPEG_PATH:-ffmpeg}"
mkdir -p rendus
: > rendus/acte2_liste.txt
for s in $ORDRE; do
  [ -f "rendus/$s.mp4" ] && [ "rendus/$s.mp4" -nt "motion/$s.html" ] || NODE_PATH=tools/node_modules node tools/render.js "motion/$s.html" "rendus/$s.mp4"
  echo "file '$s.mp4'" >> rendus/acte2_liste.txt
done
"$FF" -y -v error -f concat -safe 0 -i rendus/acte2_liste.txt -c copy rendus/ACTE2.mp4
echo "rendus/ACTE2.mp4 prêt"
