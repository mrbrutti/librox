# Audio-only correction — October 22, 2026

The owner rejected the constant tone and artificial page effects, then specified
occasional pleasant nature sounds, realistic page turns and an imperceptible loop.
The owner explicitly excluded visual changes.

## Changed

- Replaced oscillators and synthesized noise with CC0 recorded birdsong and two
  real page recordings. Sources and treatment are in `film/audio/README.md`.
- The 144-second nature arrangement has irregular quiet spaces; 88.68% of its
  100 ms windows are below -70 dBFS. Its encoded peak is -36.43 dBFS.
- Removed invented hardware/fold/transition sounds. Paper lift, friction and
  settling are retained, softened and aligned to the visible page-turn crest.
- Nature decodes once, after opt-in, and uses a continuously looping Web Audio
  buffer. Film loops, seeks, responsive source swaps and pauses do not restart it.
- Shared sound controls silence both nature and paper. Tab hiding fades the
  nature track to silence. Nature continues through homepage scene changes.

## Evidence

- Build, JavaScript syntax and whitespace checks passed.
- The delivered MP3 decodes to exactly 144 seconds in both FFmpeg and WebKit.
- A browser OfflineAudioContext rendered through the actual loop boundary:
  repeat error 0, boundary sample jump 0, stereo output.
- The ordinary quiet interval across the join is comparable to internal gaps;
  there is no track-wide fade-out/fade-in marking a restart.
- Browser opt-in, scene navigation, chapter seek, pause and shared mute were
  exercised without console warnings/errors.
- Every H.264 video-stream hash matches main before this correction. The
  homepage inline style bytes also match. No image, font or CSS source changed.
- Review audio, the decoded-loop check and visual-preservation report are in
  ignored `.local/audio/natural/`.

This verifies the encoded join and browser behavior. It does not claim owner
approval of the listening experience or physical-device speaker validation.
