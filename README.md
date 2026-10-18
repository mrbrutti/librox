# Librox website

Static GitHub Pages site for librox.app. The opening scene is a WebGL rendering of a clothbound book built from the app's CoverOcean artwork. It is explicitly labeled a cinematic illustration. The next section uses an uncut recording of the current Librox development build; the iPhone Duo stage places Librox 2.0 design captures within Apple's official static iPhone Duo bezel. The bezel is used as provided by Apple; only the screen content changes.

The [site motion direction](docs/site-motion-direction.md) records the product-led reference, scene sequence, interaction rules, and three-day review path.

## Local preview

```sh
python3 -m http.server 8767
```

## Build the animated scenes

```sh
npm ci
npm run build
```

Commit both `duo-stage.bundle.js` and `book-scene.bundle.js` with their source changes, since GitHub Pages serves the committed static files directly.

The app clip `assets/librox-reader-capture.mp4` is a continuous 13.23-second segment from the Librox 1.5 (45) simulator build on iOS 26.5. A temporary UI-test runner tapped the Reading cover, waited for the reader, and turned two pages; the 1206 × 2622 native recording was encoded at 720 px and 30 fps for the web. The screenshot poster comes from the same recording. The clip documents an in-development build, not the currently released App Store version or a completed iPhone Duo app. The 3D book uses `Libros/Libros/Resources/CoverArtwork.xcassets/CoverOcean.imageset/cover-ocean.png` as its artwork source.

The bezel source is Apple's **Bezel-iPhone-Duo.dmg** from [Apple Design Resources](https://developer.apple.com/design/resources/), PNG/Star White/Inner Open Landscape. Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) prohibit 3D simulations or animation of Apple hardware, which is why only the book is modeled and the Duo bezel remains static. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
