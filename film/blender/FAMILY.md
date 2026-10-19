# iPad and Mac studio film

`family.py` builds a separate 24-second film for the lower app demonstration
stage. The approved 22-second Duo hero and its playback schedule are unchanged.
The user requested this extension and publication on October 19, 2026.

## Render

Blender 5.2.1, Cycles Metal, 40 samples, denoising, six bounces, persistent data,
AgX. Wide is 1600 × 1200; mobile is 900 × 1000. Both contain 720 frames at 30 fps.
No external models, Apple CAD, logos or HDRIs are used.

```sh
blender -b --python film/blender/family.py -- --animate --out .local/render/family-wide
blender -b --python film/blender/family.py -- --portrait --animate --out .local/render/family-portrait
bash film/blender/encode-family.sh
npm run build
```

For an inspection still, use `--preview --frame 331 --out .local/review/handoff`.
Use `--start` and `--end` to resume a sequence. The encoder refuses incomplete
sequences and replaces the web files only after a successful encode. Pass
`wide` or `portrait` to the encoder to export a completed layout separately.

## Physical references

- [Apple iPad Pro specifications](https://www.apple.com/ipad-pro/specs/):
  the 11-inch body is 249.7 × 177.5 × 5.3 mm; active display is 2420:1668.
  Landscape camera, speakers, side controls, USB-C and rear camera placement
  follow its reference diagrams. The committed capture has this display ratio.
- [Apple MacBook Pro specifications](https://www.apple.com/macbook-pro/specs/):
  the 14-inch body is 312.6 × 221.2 × 15.5 mm closed; display is 3024:1964.
  The lid closes to the base footprint. Base and lid thickness are separate,
  with a rear hinge pivot, trackpad, keyboard, speaker perforations and notch.

These are original parametric studies based on public references, not official
Apple models or physical-device footage. Native window content is padded to
the display ratio, never stretched. Top padding keeps the notch clear of app UI.

## Choreography

| Time | Action |
| --- | --- |
| 0–5.7 s | iPad reading and native Pride and Prejudice page curls |
| 5.7–10 s | A 600 ms screen dissolve reveals live iPad narration |
| 10–12 s | Opaque iPad exits while Mac enters and opens its lid |
| 12–17.7 s | Native Mac Moby-Dick reading and page movement |
| 17.7–22 s | A 600 ms screen dissolve reveals live Mac narration |
| 22–24 s | Mac exits; iPad returns to its opening pose and reading frame |

Bodies never crossfade. Material depth, reflections and shadows are rendered
in the same studio as the Duo. Camera/assembly motion uses smoothstep easing;
the app recordings keep their own motion. No optical flow is applied to the
new listening clips. The earlier iPad curl edit remains retimed as documented
in the [main README](README.md).

## Native footage

- `assets/librox-ipad-page-turns.mp4`: existing verified simulator capture.
- `assets/librox-ipad-listening.mp4`: newly recorded running iPad simulator,
  Pride and Prejudice, installed Samantha voice, live sentence progress.
  Raw input is `.local/capture/ipad-listening-raw.mp4`; rotate counterclockwise,
  select seconds 9–19, reset timestamps and scale to 1600 × 1102 at 30 fps.
  The selected encode contains 285 frames (9.5 seconds); the visible listening
  passage uses less than seven seconds of it.
- `assets/librox-mac-reader.mp4`: existing verified Catalyst capture of the
  full Moby-Dick. The screen texture `film/public/mac-reading-screen.mp4`
  crops 28 pixels of recorded window chrome, scales proportionally to height
  988 and pads to 1600 × 1040 with 52 pixels above the app.
- `assets/librox-mac-listening.mp4`: newly recorded running Catalyst app,
  full Moby-Dick with live narration and sentence progress. Raw source is
  `.local/capture/mac-listening-raw.mov`, 2024 × 1614. Select seconds 1–11;
  remove 64 pixels of window chrome, scale proportionally to height 988,
  then pad to 1600 × 1040 with 52 pixels above the app.

Captures contain only the demonstrated books and app interface. Raw recordings
remain ignored; only selected, inspected clips and final web encodes ship.
Audio is omitted from the family film. The iPad and Mac apps were left paused
after capture. No app source, library contents or voice downloads were changed.

The lower film now shows live listening captures. The **Duo hero's** existing
library and listening imagery remains a labeled Librox 2.0 design preview.
Neither footage nor rendering constitutes physical-device acceptance or a
claim that the Mac development build is the public App Store release.
