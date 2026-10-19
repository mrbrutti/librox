# Film sources

The active landing film is the [Blender studio film](blender/README.md).
The Remotion composition below is the earlier static-bezel study, retained as
a reproducible alternative. It is no longer loaded by the landing page.

# Librox landing film

A 20-second product-film study for the Librox website. It has a wide (1440 × 810) and portrait (810 × 1440) web encode. The edit moves through library, a native simulator book-opening capture, reading, and a labeled Librox 2.0 listening design preview. The official Apple Duo bezel is a static image throughout; the device does not spin, fold, or morph.

Source media is copied into `public/` so the edit is reproducible. `opening.mp4` is the native development capture from the website asset. `library.webp`, `reading.webp`, and `listening-duo.webp` are Librox 2.0 design previews. `duo-bezel.png` is Apple's official Star White Inner Open Landscape bezel. `score.mp3` is derived from the project's original procedural `docs/librox-2.0/adaptive-reading-film/public/score.wav`; website playback starts muted and has an optional sound control.

```sh
npm ci
npm run lint
npx remotion render src/index.ts LibroxFilm ../assets/librox-film-wide.mp4 --codec h264 --crf 22 --scale 0.75 --concurrency 4
npx remotion render src/index.ts LibroxFilmPortrait ../assets/librox-film-portrait.mp4 --codec h264 --crf 23 --scale 0.75 --concurrency 4
```

The opening capture is a shortened simulator study; the listening controls are a fixture, not a recorded playback session. Replace these with accepted device footage before marketing them as finished behavior.
