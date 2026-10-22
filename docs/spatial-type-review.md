# Spatial typography polish · October 22, 2026

Applied design-taste-frontend, Emil design engineering, and Impeccable's polish
workflow to the existing cinematic direction. The brief is a book-like,
physical composition with readable type moving through the device scene.
Newsreader, Manrope, forest green, paper tones, native footage and the current
navigation are retained. The visual priorities are depth, contrast, timing,
and restraint around the controls.

## Before / after / why

| Before | After | Why |
| --- | --- | --- |
| Flat lettering disappeared entirely behind a device silhouette. | Extruded Newsreader shares the original camera and depth-tested device geometry. | Parts of a phrase can cross in front while other parts pass behind. |
| Light type became weak over a white reading page. | Foreground type changes to deep green ink during the paper sequence. | The phrase remains recoverable across the film's changing light. |
| Giant outgoing and incoming phrases overlapped. | Each phrase finishes before the next occupies the composition. | Reading, listening and library chapters have distinct transitions. |
| Small headings competed with the large lettering. | Desktop headings sit near their captions; phone controls have dedicated space. | The app footage and giant phrase keep a clear hierarchy. |
| Focusing a control could internally scroll the scene and offset its geometry. | The scene uses overflow clipping without an internal scroll container. | Film pixels, shadows and depth stay aligned. |
| Resizing a paused film could retain poster lettering over a decoded chapter. | Depth listeners run after the player reveals that frame; the fallback clock preserves the last presented time. | A pause, seek or source change keeps words and footage synchronized. |

## Validation

- Production build, source JavaScript syntax, and whitespace checks pass.
- Static audit: six HTML pages, 125 local asset/fragment references, unique IDs.
- All 2,760 geometry frames contain valid camera matrices, mesh indices and poses.
- The projected spatial mesh bounds match the original silhouette export to
  within a pixel in the checked reading pose.
- Browser review: 1440×900 desktop, 820×1180 tablet, and 390×844 phone. Reading and listening
  chapter seeks, Mac composition, paused wide-to-portrait source changes,
  automatic playback/offscreen pause, menu/Escape, and image loading were checked.
- No horizontal overflow or current-build console errors/warnings in those checks.
- Existing MP4 files, legal pages, Plus claims, contact address and purchase links
  are unchanged. Native app files are outside this patch.
- Reduced motion and error/WebGL fallbacks were source-reviewed. This is browser
  validation, not physical-device, screen-reader or low-end GPU acceptance.

The deferred spatial module is approximately 150 KB gzip. Only the selected camera
manifest loads; the family manifest waits for its film to load. Pixel ratio is
capped at 1.5. Rendering follows decoded film frames, stops when playback stops,
and has no separate perpetual animation loop.

## Impeccable detector triage

One manual scan was run after implementation, as the context command requested.
It reported two padding warnings and sixteen design-system advisories.

The padding warnings identify the two intentionally full-bleed film sections.
Their interactive controls and captions have explicit 24px phone / 40px desktop
insets; the media itself deliberately reaches the viewport edge. The color and
font advisories compare the newer cinematic layout against the older DESIGN.md
ramp. Scene colors come from the retained film's forest/paper palette; neutral
subpages, existing focus treatment and appearance controls retain their colors.
Small caption headings are deliberately subordinate to the requested giant
scene lettering. These are narrow intentional exceptions, not scan failures
silently presented as a clean result. No unrelated design-system rewrite was made.

Local review captures are under `.local/review/spatial-type/`. A published
performance report is a separate acceptance boundary from these local checks.
