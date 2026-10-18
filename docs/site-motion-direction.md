# Librox motion direction · October 18–21, 2026

The user shared [Townhouse](https://townhouse.dev/), [Armor](https://www.armor-bd.com/), [Mapa do Astro](https://www.mapadoastro.com.br/), [Orizon](https://orizon.one/), [Reel Motion](https://reelmotion.fit/), [Morpho](https://morphowater.com/), a [3D website video](https://www.youtube.com/watch?v=fwWGfWjwEl0), and three Sketchfab iPhone Duo models, including the [animated Star White fold](https://sketchfab.com/3d-models/apple-iphone-duo-fold-star-white-2026-animated-240492141edd4594ae13082a7fcbbb29). The site should feel cinematic and physical, but the brand and real app must lead. The hero therefore uses authentic Librox footage inside official static device artwork, with a short section sequence and direct device controls.

## Scene sequence

1. **Librox on Duo.** The first frame is a Librox app capture, not a book render. A native simulator recording opens and closes the book inside Apple's official open Duo bezel. The device artwork stays static. The interface identifies the capture as a shortened development study.
2. **Librox on iPhone and listening.** A direct selector swaps to an iPhone 17 Pro frame with a continuous real app recording: open the reader and turn two pages. A third selector shows the green cover-atmosphere listening design study. Replay and pause apply to recordings; the study is labeled as a design study. Still posters remain visible if video cannot play.
3. **The Duo design preview.** One viewport switches among Librox 2.0 library, page, and a native development listening capture inside the official static Duo bezel. Only screen content and copy change. The listening scene changes the surrounding color to the app's dark green atmosphere.
4. **Reading and discovery.** Reading themes and catalog search remain functional. The download link detects platform availability without claiming a native Mac app.

## Rules and verification

- Keep the Apple bezels unmodified and static. Their image, pose, shape, and scale do not animate. The Sketchfab models are not used in the public page because [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) prohibit 3D simulations of its devices in app marketing.
- A separate local study at `.local/duo-motion.html` uses the linked fan-made animated Sketchfab model and swaps Librox library, reading, and listening textures into its display. The local study is ignored by Git and is not part of the public site or draft PR.
- Animate the actual Librox content within the screen area. Pause offscreen. Reduced-motion visitors see still posters until they explicitly play.
- Maintain posters for both videos. Check first frame, ended state, error state, device switching, and both desktop and phone framing.
- Label development footage and design previews accurately; do not imply a released Duo app or verified physical-device behavior.

This remains a draft PR. The live domain stays on `main` until reviewed and merged. Higgsfield was explored but no generation was submitted or charged there.
