# Studio draft verification — 2026-10-19

## Implemented

- Original Blender Cycles folding-device film, 22 seconds, 30 fps. Separate
  1600 × 900 and 900 × 1200 camera compositions; committed H.264/AAC encodes.
- Native Metal opening, newly captured iPad curls and native Catalyst reader.
  Idle recording pauses removed; retimed curls use optical-flow interpolation.
- Automatic reading/listening/Mac stage with manual selection and pause.
- Existing Plus, Privacy, Terms and Support pages retained; catalog search
  moved to Books. Proposed Plus stays US $9.99/year.
- Local media hashes in HTML prevent reuse of stale posters, films and CSS.
- Cover display and camera halves corrected against Apple's multi-angle images
  and technical dimensions; see `duo-hardware-reference.md`.

## Checked locally

- Production esbuild bundle and JavaScript syntax checks pass.
- HTML local media and linked page paths resolve.
- Desktop 1440 × 900 and mobile 390 × 844 have no horizontal overflow.
- Hero poster/video, native video and listening artwork load without media errors.
- Hero pause, opt-in sound, chapter selection, five-second keyboard seeking
  and offscreen pause work.
- Local preview server supports byte ranges. Both start and suffix requests
  return HTTP 206; an invalid range returns 416. Portrait playback now exposes
  the full 0–22 second seekable interval and seeks to 9.45 seconds while paused.
  Raw `.local/` recordings return 404 and are not exposed by the preview server.
- Automatic native sequence advances; inactive videos pause. Native clip
  duration drives progress and switching, with video timestamps starting at zero.
- Native captions sit outside the app footage. The mobile hero cannot scroll
  internally when its controls receive focus.
- Gutenberg and Standard Ebooks searches returned results in the local browser.
  Failed requests offer direct links to the catalogs.
- A separate finish reviewer inspected the source, desktop/mobile captures,
  TypeDraw reference and shot-scale changes.
- Corrected encodes each contain 660 frames at 30 fps and run 22 seconds.
  The browser loads `ab6ec14ff5` (wide) and `38d1faacb8` (portrait), with no
  media errors. Updated hero, listening, macro and full-page captures are saved.
- Wide listening scenes fade the subtitle before the tilted hardware can
  overlap it. The headline and film controls remain visible.

## Validation boundaries

The local in-app browser is the runtime evidence. Physical iPhone/iPad Safari,
VoiceOver and the OS reduced-motion setting were not exercised in this pass;
the reduced-motion and background visibility paths were reviewed in source.
The original rendered device and development listening views are explicitly
labeled. This draft is not public Apple-device marketing approval, a native
Mac release, a StoreKit implementation, or synchronized Figma output.

Raw recordings, render frames and review screenshots are local under `.local/`.
Only the selected app footage and web encodes are versioned. No app source was
changed for this website work.
