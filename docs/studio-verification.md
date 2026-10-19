# Studio website verification — 2026-10-19

## Implemented

- The corrected 22-second Duo hero retains its wide and portrait compositions,
  native Metal opening, page turns, chapter controls and opt-in sound.
- A separate 24-second Blender Cycles family film adds iPad and Mac reading,
  page turns and live narration. Opaque devices move through the same forest
  studio; the Mac lid opens around its rear hinge. Screen footage dissolves
  over 600 ms while the hardware and lighting continue moving.
- Wide family composition: 1600 × 1200. Mobile: 900 × 1000. Both use 30 fps.
  See [family source and capture provenance](../film/blender/FAMILY.md).
- One continuous player replaces the former three flat panels. It has chapter
  selection, pause, five-second keyboard seeking, responsive source selection,
  offscreen/background suspension, reduced-motion posters and media retry.
- Public pages omit internal design-preview and production notes at the user's
  request. Plus is clearly Coming soon at the intended US $9.99 annual price;
  Privacy, Terms and Support use matching availability language.
- Local media hashes in HTML prevent reuse of stale posters, films and CSS.
  App Store navigation retains the existing country-neutral product ID.

## Capture and render checks

- Newly captured iPad narration shows Pride and Prejudice, the peacock cover,
  Samantha voice and live sentence progress. Its selected H.264 encode has
  285 frames at 30 fps, 1600 × 1102, 9.5 seconds. The movie uses less than seven
  seconds of that passage. The native app was left paused after recording.
- Newly captured Mac narration shows the full Moby-Dick with its whale cover
  and live sentence progress. Its selected H.264 encode is 1600 × 1040,
  300 frames, 10 seconds. Window chrome was cropped and the app padded without
  stretching. The native app was left paused after recording.
- An independent finish reviewer checked proportions, display ratios, hinge
  placement, arrow keys and the two mobile compositions. The Mac lid was
  corrected to close to the base footprint; the notch stays above app content.
- The completed mobile web encode is 900 × 1000, 720 frames, 24 seconds,
  3,549,697 bytes. Browser playback and seeking showed reading and live Mac
  narration with no media error. Its first/last rendered-frame SSIM is 0.97568;
  the return uses the first reading frame and matching device pose.
- The film's outer floor and lighting fade into the page background. The iPad
  remains crisp, with its contact shadow visible in the desktop composition.
- Source review fixed paused chapter loading, caption handoff timing and error
  fallback state. A CSS rule explicitly hides the poster once video is ready.

## Final release checks

- Both Blender jobs completed successfully. The wide H.264 web encode contains
  720 frames at 30 fps, 24 seconds, 1600 × 1200, 8,022,651 bytes. Content hashes
  are `5f5cd48a6b` (wide) and `6e4643e34e` (mobile).
- `npm run build`, JavaScript syntax and `git diff --check` pass. All 99 local
  HTML references resolve to existing files.
- The production page was inspected at 1440 × 900 and 390 × 844. Both have no
  horizontal overflow, media error or console warning/error. Decoded video
  replaces its poster, which computes to `display:none`.
- Automatic chapter changes, manual pause, paused chapter selection and
  five-second keyboard seeking work. At 21.2 seconds the Mac listening scene,
  caption and selected listening control agree.
- Changing from desktop to mobile while paused preserved 21.2 seconds, loaded
  the portrait source and displayed the requested frame without starting motion.
- The native iPad page curl is visible at five seconds. Leaving the family
  section pauses its film while the visible Duo hero resumes.
- The mobile Plus page shows Coming soon and $9.99/year without overflow.
  The public-page copy contains no design-preview or development labels.
- Final screenshots: `.local/review/family-desktop-listening.png`,
  `family-mobile-listening.png` and `family-mobile-reading.png`. A separate
  finish reviewer inspected these captures and the targeted source fixes and
  found no remaining release blocker.
- The user authorized publication. GitHub Pages serves the main branch at
  `https://librox.app/`; deployment and public playback are verified after merge.

## Retained Duo checks

- Existing hero encodes have 660 frames, 30 fps, 22 seconds. Their hashes are
  `ab6ec14ff5` (wide) and `38d1faacb8` (portrait).
- The previous local pass checked hero pause, opt-in sound, chapter selection,
  keyboard seeking and offscreen pause. Wide listening subtitles clear the
  hardware; the headline and controls remain visible.
- The local preview server supports byte ranges: start and suffix requests
  return HTTP 206 and an invalid range returns 416. Raw `.local/` recordings
  return 404. Gutenberg and Standard Ebooks searches returned results, with
  direct catalog links available after request failures.

## Validation boundaries

Runtime evidence is from the Codex in-app browser. Physical iPhone/iPad Safari,
VoiceOver and the OS reduced-motion setting were not exercised; reduced-motion
and background visibility behavior was reviewed in source. Original model and
capture provenance remains in the source documentation. Website publication
is not Apple marketing approval, a native Mac release or StoreKit activation.

Raw recordings, render frames and review screenshots remain local under
`.local/`. Only selected app footage and web encodes are versioned. No native
app source was changed for this website work.
