# Librox natural background and paper sound

The owner's correction is audio-only: small pleasant nature sounds, real paper
turns, no continuous hum, and no detectable restart as the animations loop.
No visual composition, typography, colors, frames or animation timing changes.

## Sources and treatment

All sound comes from CC0 field/foley recordings, listed in
[sources/README.md](sources/README.md) and [public credits](../../assets/licenses/nature-and-paper.txt).

- Seven complete blackbird phrases, at their original pitch and speed, sit at
  irregular intervals across 144 seconds. There are quiet spaces between calls.
- No oscillators, synthesized noise, rain bed, drone or musical score.
- Wind/traffic frequencies below the bird's voice are filtered out; the upper
  edge is softened, and each excerpt has a short cut-edge fade.
- Two real page recordings retain their lift, friction, flex and settle. Gentle
  filtering and transient control reduce close-mic ticks without replacing the
  texture. Their strongest 10 ms meets the visible page-turn crest.
- No invented hinge, fold or scene-transition whooshes. Paper is editorial
  website foley, not a claim that the native app makes these sounds.

## Loop and playback

The background is assets/librox-nature.mp3, decoded once after the user opts in.
A single Web Audio AudioBufferSourceNode loops the decoded PCM on its audio clock.
It does not reload, reset or seek when either film repeats, changes chapter,
changes responsive source or pauses. The nature background continues through
the homepage; page foley follows only the visible film. Muting silences both.

The beginning and end sit inside an ordinary quiet interval, comparable to the
intervals inside the arrangement. No track-wide fade-out or fade-in marks the
join. The delivered MP3 decodes to exactly 144 seconds at 32 kHz stereo, with
zero-valued first/last seconds and a zero sample discontinuity at the join.
88.68% of 100 ms windows are below -70 dBFS. This is intentionally sparse.

This verification rules out a codec gap, click and short-film restart. Whether
a listener notices the longer repeated sequence is a listening judgment, not
something a numerical check can prove. The source has seven distinct phrases.

Both controls start off. The audio context starts only in the sound-button
gesture. Tab hiding fades the background out; returning restores it. Sound
loading failure turns the setting off and permits a fresh attempt. The same
decoded source is reused across repeated sound toggles.

## Reproduce

Python 3 requires numpy, scipy and soundfile; FFmpeg must be installed.

```sh
python3 film/audio/render-soundscape.py
mkdir -p .local/audio/natural
for scene in studio family; do
  for layout in wide portrait; do
    ffmpeg -y -i "assets/librox-$scene-$layout.mp4" \
      -i "film/audio/$scene-soundscape.wav" \
      -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k \
      -shortest -movflags +faststart ".local/audio/natural/librox-$scene-$layout.mp4"
    mv ".local/audio/natural/librox-$scene-$layout.mp4" "assets/librox-$scene-$layout.mp4"
  done
done
npm run build
```

The film encoders also use these paper-only masters. The nature master and
review excerpts are written under ignored .local/audio/natural/. The source
recordings, render script, delivery MP3, paper masters and timing manifest are
versioned. All four H.264 visual streams remain unchanged.
