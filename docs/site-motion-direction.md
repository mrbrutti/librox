# Librox cinematic landing direction · October 19, 2026

Alongside the earlier [Townhouse](https://townhouse.dev/), [Armor](https://www.armor-bd.com/), and [Orizon](https://orizon.one/) site references, the latest [TypeDraw iPhone Duo film](https://www.youtube.com/watch?v=jdVAIoRcYqM) is a 37-second product film. Its useful sequence is a close object study, a fold/open reveal, detailed interaction macros, then a quiet end card. The Librox landing now uses that editorial rhythm with its own app material: library → native book opening → page → cover-colored listening → Librox end card.

## Implemented first cut

- `film/src/Composition.tsx` is the editable 20-second Remotion timeline. Wide and portrait compositions render to `assets/librox-film-wide.mp4` and `assets/librox-film-portrait.mp4`. Posters are separate WebP frames.
- The first viewport plays the film silently and continuously. It selects a portrait encode under 701px, pauses when offscreen or the document is hidden, and exposes play/pause and sound controls. Reduced-motion visitors see the poster until they press Play.
- The native opening segment uses a Librox simulator recording. The surrounding official Apple Duo bezel remains static. Later reading and listening segments are accurately labeled as Librox 2.0 design previews.
- The site uses self-hosted Newsreader for reading-led display type and Manrope for navigation and controls. Both ship under OFL 1.1; licenses are in `assets/fonts/`.
- The next viewport retains the interactive library/page/listening Duo story. The landing film is an overview, while the interactive section allows visitors to inspect each mode.

## Figma review

[Librox cinematic landing — motion and type review](https://www.figma.com/design/aCzdbt0zp1SospUlwLLKDL?node-id=1-2) contains a captured layout reference. It mapped macOS system sans text to Inter and did not preserve some offscreen animated sections, so the browser remains the visual source of truth. An editable Figma type/motion board was attempted but the connected Starter plan reached its MCP call limit.

## Production boundaries

[Apple's App Store marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) prohibit spinning or simulating Apple hardware in app marketing. The site uses official static Apple bezels and animates the app content and surrounding film instead. The linked Sketchfab fan device models are visual references only; the ignored `.local/duo-motion.html` study is not published.

The native opening is a development simulator study, not a physical-device acceptance capture. Listening is a design preview with fixture controls. Before launch, capture real accepted listening interaction, turn pages in the current shipping app, replace outdated screenshots where needed, and reconcile copy with the reviewed build. Higgsfield generation was explored earlier but not submitted or charged.
