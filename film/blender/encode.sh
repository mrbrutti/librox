#!/bin/bash
# Encode the full Cycles frame sequences atomically. Requires ffmpeg and cwebp.
set -euo pipefail
cd "$(dirname "$0")/../.."
for layout in wide portrait; do
  frames=".local/render/$layout"
  for number in $(seq 1 660); do
    printf -v frame '%04d' "$number"
    test -s "$frames/$frame.png" || { echo "Missing frame: $frames/$frame.png" >&2; exit 1; }
  done
  ffmpeg -y -framerate 30 -start_number 1 -i "$frames/%04d.png" \
    -stream_loop -1 -i film/public/score.mp3 -t 22 \
    -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 20 -g 60 \
    -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 96k -af 'volume=0.5,afade=t=in:d=0.8,afade=t=out:st=21:d=1' \
    -movflags +faststart ".local/render/librox-studio-$layout.mp4" -loglevel error
  mv ".local/render/librox-studio-$layout.mp4" "assets/librox-studio-$layout.mp4"
done
cwebp -quiet -q 90 .local/render/wide/0001.png -o assets/librox-studio-poster.webp
cwebp -quiet -q 90 .local/render/portrait/0001.png -o assets/librox-studio-poster-portrait.webp
