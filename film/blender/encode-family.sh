#!/bin/bash
# Encode only complete 24-second family-film sequences; publish assets atomically.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ "$#" -eq 0 ]; then set -- wide portrait; fi
for layout in "$@"; do
  case "$layout" in wide|portrait) ;; *) echo "Unknown layout: $layout" >&2; exit 1 ;; esac
  frames=".local/render/family-$layout"
  for number in $(seq 1 720); do
    printf -v frame '%04d' "$number"
    test -s "$frames/$frame.png" || { echo "Missing frame: $frames/$frame.png" >&2; exit 1; }
  done
  ffmpeg -y -framerate 30 -start_number 1 -i "$frames/%04d.png" -t 24 \
    -an -c:v libx264 -preset slow -crf 20 -g 60 -pix_fmt yuv420p \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -movflags +faststart ".local/render/librox-family-$layout.mp4" -loglevel error
  mv ".local/render/librox-family-$layout.mp4" "assets/librox-family-$layout.mp4"
  poster="assets/librox-family-poster.webp"
  if [ "$layout" = portrait ]; then poster="assets/librox-family-poster-portrait.webp"; fi
  cwebp -quiet -q 90 "$frames/0001.png" -o "$poster"
done
