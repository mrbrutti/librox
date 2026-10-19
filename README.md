# Librox website

Static GitHub Pages site for librox.app. The first viewport presents a Librox Duo development capture inside Apple's official static bezel, Moby-Dick book artwork, and a clearly labeled 2.0 listening design study. Visitors can switch views and control the Duo recording. The next viewport cycles among Librox 2.0 library, page, and listening views in the same official Duo bezel. The remaining page explains reading and discovery and links to the App Store.

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

The featured Moby-Dick artwork `assets/moby-dick-cover-art.webp` was supplied for this site and replaces an older capture that showed a placeholder excerpt book. It is presented as book artwork rather than a simulated app screen.

The reading-theme iPhone image `assets/iphone-reader.webp` comes from `docs/appstore/screenshots/iphone-6.9/03-page-settings.png` in Libros. It shows the page controls over the full Moby-Dick book instead of the old excerpt fixture.

The Duo listening image `assets/duo-listening.webp` comes from `docs/librox-2.0/reviews/native/listening-landscape.png` in Libros. That 951 × 669 point SwiftUI content render uses the illustrated Moby-Dick cover beside a reading page. Its transport is a fixture with no audio engine attached. The green iPhone listening image `assets/iphone-listening-concept.webp` comes from `docs/librox-2.0/cover-atmosphere-study/listening-concept.png` in Libros. Both are design studies rather than recordings or shipped app views, and the page labels them accordingly.

The bezel sources are Apple's **Bezel-iPhone-17.dmg** (PNG/iPhone 17 Pro/Deep Blue/Portrait) and **Bezel-iPhone-Duo.dmg** (PNG/Star White/Inner Open Landscape), both from [Apple Design Resources](https://developer.apple.com/design/resources/). Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) require official static device artwork for this usage and prohibit simulated 3D or spinning Apple devices. The provided Sketchfab Duo models are visual references only. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
