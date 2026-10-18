# Librox motion direction · October 18–21, 2026

Reference: [GPT-6 Can Now Build 3D Interactive Websites](https://www.youtube.com/watch?v=fwWGfWjwEl0), by Griffin Wooldridge. The useful pattern is a product-led sequence: the product fills the frame, visitors can affect its motion, typography stays sparse, and each scroll chapter changes the setting. Librox should use that structure with its own reading materials and green, paper, and coral palette.

## Film sequence

1. **The cover.** A large clothbound book floats in a dark studio. It opens and turns one paper leaf. Dragging the canvas scrubs the motion; tapping replays it. The hero is explicitly a cinematic illustration.
2. **The real app.** A continuous simulator recording shows a cover tap, the reader opening, and two page turns. This is labeled as development-build footage and expands into a spotlight as it enters the viewport.
3. **The Duo preview.** Scroll chapters change the Librox 2.0 library, page, and listening screens within Apple's official static iPhone Duo bezel. These are labeled design previews.
4. **The page and discovery.** Reading themes and catalog search remain live interactions; subsequent motion should illustrate actual app capabilities rather than invented screens.

## Visual and motion rules

- Preserve Librox's ocean cover artwork, warm paper, dark green cloth, and coral accent.
- Make the book's cover, hinge, leaf, and cast shadow move as one physical object. Do not model or animate Apple hardware.
- Keep real app recordings separate and visibly labeled. Generated imagery may establish an environment or light treatment; it must not be presented as app footage.
- Pause WebGL rendering and app video offscreen. Reduced-motion visitors get a stable still state on load; explicit play or drag still works. Every autoplay scene has a manual replay or pause control.
- Prefer one purposeful interaction per chapter over decorative motion everywhere.

## Three-day delivery path

- **October 18:** Match the reference's product scale and art direction; make the book directly draggable; enlarge and reveal the real app footage; verify desktop and phone layouts.
- **October 19–20:** Capture and edit additional authentic feature footage where the current build supports it. Develop the page-to-app transition and tune the Duo chapter pacing with real assets.
- **October 21:** Verify motion, accessibility, loading, and responsive layouts; audit every product claim and asset label; present the draft site for review. The live domain remains on `main` until the draft is approved and merged.

Higgsfield is an optional visual-production route. As of October 18, a studio image draft was prepared, but no generation was submitted or charged; the account was not authenticated. The current implementation uses the existing Librox artwork, Three.js scene, and app footage.
