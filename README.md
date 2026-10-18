# Librox website

Static GitHub Pages site for librox.app. The first viewport presents real Librox development captures inside Apple's official static iPhone Duo and iPhone 17 Pro bezels. The visitor can switch devices, replay, and pause. The next viewport switches among Librox 2.0 library, page, and listening design previews in the same official Duo bezel. The remaining page explains reading and discovery and links to the App Store.

The [site motion direction](docs/site-motion-direction.md) records the reference sites, asset decisions, interaction rules, and review path.

## Local preview

```sh
python3 -m http.server 8767
```

## Build the Duo screen transitions

```sh
npm ci
npm run build
```

Commit `duo-stage.bundle.js` with its source, since GitHub Pages serves committed static files directly.

The Duo hero clip `assets/librox-duo-native-opening.mp4` comes from `docs/librox-2.0/reviews/book-opening/continuity-study/final-duo-landscape.mp4` in the separate `codex/book-opening` Libros worktree. The source is a 7.6-second Duo simulator recording of the native book-opening study, encoded at 1800 × 1266 and 30 fps for the web. Its poster is a frame from the same video. This is development-study footage, not evidence that the opening is integrated into the current Librox 2.0 release or accepted on physical hardware. The site labels the sequence as shortened.

The iPhone clip `assets/librox-reader-capture.mp4` is a continuous 13.23-second segment from a Librox 1.5 (45) simulator build on iOS 26.5. A temporary UI-test runner tapped the Reading cover, waited for the reader, and turned two pages; the 1206 × 2622 native recording was encoded at 720 px and 30 fps for the web. Its poster comes from the same recording. The clip documents an in-development build, not the currently released App Store version.

The bezel sources are Apple's **Bezel-iPhone-17.dmg** (PNG/iPhone 17 Pro/Deep Blue/Portrait) and **Bezel-iPhone-Duo.dmg** (PNG/Star White/Inner Open Landscape), both from [Apple Design Resources](https://developer.apple.com/design/resources/). Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) require official static device artwork for this usage and prohibit simulated 3D or spinning Apple devices. The provided Sketchfab Duo models are visual references only. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
