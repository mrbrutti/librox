# Librox ambient sound

Original procedural sound design for the active Blender films. The owner's
direction is a subtle reading/meditation atmosphere with synchronized page
sounds. The rejected narration is not shipped.

## Sound and provenance

- A quiet sustained open harmony, slowly varying filtered air and stereo width.
- No speech, piano, beat, tune, downloaded sample or third-party music.
- Soft paper gestures follow the visible native page turns. Small low movement
  sounds accompany folding and the scene transitions.
- This is designed website sound, not audio recorded from the app or hardware.
- NumPy seed `20261022` makes the procedural variation reproducible. Each film
  has its own continuous loop; sound is not regenerated on every page visit.

The masters are 48 kHz, stereo, 24-bit PCM. `studio-soundscape.wav` is 22 seconds;
`family-soundscape.wav` is 24 seconds. `soundscape-manifest.json` records exact
gesture starts/durations, peak/RMS values and the sample difference at the loop.
The ambient bed uses integer-cycle oscillators and periodic noise; transient
gestures end before the boundary.

Measured from the final AAC audio with FFmpeg's `loudnorm` analysis:

| Film | Integrated loudness | True peak |
| --- | --- | --- |
| Studio | -32.89 LUFS | -24.07 dBTP |
| iPad/Mac | -32.75 LUFS | -23.39 dBTP |

The intentionally low level follows the request for subtle background sound.
These measurements do not establish the listener's device volume or approval of
the sound. The four video streams are copied unchanged in this update.

## Reproduce

Use Python 3 with `numpy`, `scipy` and `soundfile`, plus FFmpeg:

```sh
python3 film/audio/render-soundscape.py
```

When rendering the films again, `film/blender/encode.sh` and
`film/blender/encode-family.sh` read these masters. To update sound without
re-rendering video, run from the site root:

```sh
mkdir -p .local/audio
for scene in studio family; do
  for layout in wide portrait; do
    ffmpeg -y -i "assets/librox-$scene-$layout.mp4" \
      -i "film/audio/$scene-soundscape.wav" \
      -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k \
      -shortest -movflags +faststart ".local/audio/librox-$scene-$layout.mp4"
    mv ".local/audio/librox-$scene-$layout.mp4" "assets/librox-$scene-$layout.mp4"
  done
done
npm run build
```

## Playback

Both films start muted. Either sound button opts into the shared sound setting;
both buttons report that setting. The nearest visible scene receives the ambient
mix, with a short gain fade on handover. Web Audio gain nodes handle fades on
mobile as well as desktop; media-volume ramps are a fallback without Web Audio.
Audio is embedded in each film, so chapter seeks, loops, pause/resume and source
changes use the same media clock. Hidden or offscreen films pause. Reduced-motion
behavior and explicit playback controls remain available.

The audio context and media unlock occur in the user's sound-button gesture,
following [WebKit's media playback policy](https://webkit.org/blog/6784/new-video-policies-for-ios/).
Browser permission or device restrictions can still require using the play control.
