# Librox website

Static GitHub Pages site for librox.app. The hero uses a recording of the app's native SceneKit/Metal book-opening study. The next section uses a continuous recording of the current Librox development build. Both recordings and the reader still are shown inside Apple's official static iPhone 17 Pro bezel. The iPhone Duo stage places Librox 2.0 design captures within Apple's official static iPhone Duo bezel. Only the screen content changes.

The [site motion direction](docs/site-motion-direction.md) records the product-led reference, scene sequence, interaction rules, and three-day review path.

## Local preview

```sh
python3 -m http.server 8767
```

## Build the Duo scene

```sh
npm ci
npm run build
```

Commit `duo-stage.bundle.js` with its source changes, since GitHub Pages serves the committed static files directly.

The hero clip `assets/librox-native-opening.mp4` comes from `docs/librox-2.0/reviews/book-opening/continuity-study/final-iphone-opening.mp4` in the separate `codex/book-opening` Libros worktree (implementation `195bf6cf`, handoff `4b2493fa`). The source is a 5.1-second trimmed simulator recording of the native opening, encoded at 720 px and 30 fps for the web. The scene is a development study; its integration into the current Librox 2.0 app and physical-device visual acceptance remain pending. The hero identifies the sequence as shortened.

The app clip `assets/librox-reader-capture.mp4` is a continuous 13.23-second segment from the Librox 1.5 (45) simulator build on iOS 26.5. A temporary UI-test runner tapped the Reading cover, waited for the reader, and turned two pages; the 1206 × 2622 native recording was encoded at 720 px and 30 fps for the web. The screenshot poster comes from the same recording. The clip documents an in-development build, not the currently released App Store version or a completed iPhone Duo app.

The bezel sources are Apple's **Bezel-iPhone-17.dmg** (PNG/iPhone 17 Pro/Deep Blue/Portrait) and **Bezel-iPhone-Duo.dmg** (PNG/Star White/Inner Open Landscape), both from [Apple Design Resources](https://developer.apple.com/design/resources/). Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) require official static device artwork for this usage; the site animates only recorded app content within it. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
