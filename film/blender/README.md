# Librox 3D studio film

This is the active landing-page film. It is an original parametric device
study rendered in Blender Cycles, with physical materials and a continuous
hinge, camera orbit, close-up and closing movement. It is not an Apple-supplied
3D model or a claim about finished hardware.

## Reproduce

Blender 5.2.1 LTS, Cycles Metal on Apple M3 Ultra. Full renders use 40 samples,
denoising, six bounces, persistent scene data and AgX. The scene uses no
downloaded 3D models or HDRIs.
The exact geometry, lights, camera and timing are in `studio.py`.
The cover-display/camera half mapping and dimensional references are recorded
in [the hardware reference](../../docs/duo-hardware-reference.md). Left/right
always refer to looking at the inner display: cover screen behind the left
leaf, rear cameras behind the right. The left leaf folds over the right.

From the site root:

```sh
blender -b --python film/blender/studio.py -- --animate --out .local/render/wide
blender -b --python film/blender/studio.py -- --portrait --animate --out .local/render/portrait
bash film/blender/encode.sh
npm run build
npm run dev
```

A single still can be rendered with `--frame 520 --out .local/render/fold`.
Add `--view rear` or `--view hinge` to inspect the model's exterior surfaces.
Use `--preview` for a smaller, lower-sample material check. A render can resume
using `--start 241 --end 660`; the encoder checks all 660 frames exist first.
Frame sequences stay in ignored `.local/`; web encodes and posters are versioned.
The film is 22 seconds at 30 fps: 1600 × 900 wide and 900 × 1200 portrait.

## Choreography

| Time | Scene |
| --- | --- |
| 0–4 s | Closed library unfolds into a wide display, slow camera orbit |
| 4–8 s | Native Metal book-opening development capture |
| 8–12 s | Native iPad page-turn footage, camera moves in |
| 12–15 s | Cover-colored Librox listening preview |
| 15–18 s | Fold closes to the outside library display |
| 18–22 s | Closed display settles; camera returns to the first pose |

The final pose approaches the opening pose for a continuous loop. Hinge motion
uses smooth acceleration/deceleration. The screen media uses real native
captures or labeled development design views; the iPad footage is composited
onto the folding device as an app demonstration, not evidence from a physical Duo.

## Media provenance

- `assets/duo-library.webp`, `duo-closed.webp`, `duo-listening.webp`: existing
  native Librox DesignLab captures with Moby-Dick, The Waves and Walden artwork.
  Library and listening are design previews, not captured production playback.
- `assets/librox-duo-native-opening.mp4`: native Metal development study from
  the book-opening worktree, `final-duo-landscape.mp4`. No excerpt book in the edit.
- `assets/librox-ipad-page-turns.mp4`: captured 2026-10-19 from the existing
  iOS 27 iPad simulator build, full Pride and Prejudice, pages 29–34. Trimmed
  to three native page turns, with idle pauses removed. The turns are slowed
  for legibility and use optical-flow frame interpolation; this is an edited
  demonstration, not a measurement of the app's interaction timing. The
  four-second `film/public/ipad-page-turns.mp4` edit is the reproducible 3D
  display texture. The website follows its separate clip's actual media duration.
  No app controls, text or page geometry were redrawn.
- `assets/librox-mac-reader.mp4`: captured 2026-10-19 from the running native
  Catalyst development build, full Moby-Dick, Chapter 1. Window padding cropped;
  app content is unchanged. This is not the public App Store Mac release.
- `film/public/score.mp3`: the project's existing original procedural score.
  Both web videos start muted; audio is opt-in.
- Listening still uses the already licensed, unmodified Apple iPhone 17 Pro
  bezel. Official Apple artwork is not used as the 3D geometry.

Raw captures remain local under `.local/capture/`. The demo EPUB was made from
the full Gutenberg Moby-Dick already in the simulator import staging area,
with the project's approved reference cover and title metadata. It was added
to the simulator and Mac libraries without deleting existing user books.

### Reproduce the page-turn edit

The retained local input `.local/capture/ipad-long-before-edit.mp4` contains
the original three turns and their idle pauses. The selected ranges below are
relative to its first decoded frame, after resetting timestamps. The edit
slows those ranges by three, then interpolates the resulting motion to 30 fps:

```sh
ffmpeg -i .local/capture/ipad-long-before-edit.mp4 \
  -filter_complex '[0:v]setpts=PTS-STARTPTS,split=3[a][b][c];[a]trim=start=0.05:end=0.65,setpts=3*(PTS-STARTPTS)[aa];[b]trim=start=5.08:end=5.8,setpts=3*(PTS-STARTPTS)[bb];[c]trim=start=10.15:end=11.1,setpts=3*(PTS-STARTPTS)[cc];[aa][bb][cc]concat=n=3:v=1:a=0,fps=30[v]' \
  -map '[v]' -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -movflags +faststart .local/capture/ipad-trimmed.mp4
ffmpeg -i .local/capture/ipad-trimmed.mp4 \
  -vf 'minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1' \
  -an -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
  -movflags +faststart assets/librox-ipad-page-turns.mp4
```

The committed website clip is sufficient to recreate the four-second Blender
screen texture, even without the local raw recording:

```sh
ffmpeg -i assets/librox-ipad-page-turns.mp4 -t 4 -an \
  -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p \
  -movflags +faststart film/public/ipad-page-turns.mp4
```

## Release boundary

The film is a local creative draft. Apple's App Store marketing guidelines
prohibit simulated Apple hardware and 3D marketing renders. This original
folding-device model has no Apple logo and is not official Apple product art;
it still needs a marketing review before a public Apple-device campaign.
Do not label the rendered device as approved Apple hardware or physical footage.

Website motion pauses when offscreen, in a background tab, or after the user
pauses it. Reduced-motion visitors get the poster and explicit playback.
The responsive source follows the viewport aspect ratio, not only its width.
