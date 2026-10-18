# Librox website

Static GitHub Pages site for librox.app. The opening scene is a WebGL rendering of a clothbound book built from the app's CoverOcean artwork. It is explicitly labeled a cinematic illustration. The next section uses a real recording of the released app; the iPhone Duo stage places Librox 2.0 design captures within Apple's official static iPhone Duo bezel. The bezel is used as provided by Apple; only the screen content changes.

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

The app clip `assets/librox-reader-capture.mp4` is a nine-second, muted web encode from `Libros/docs/appstore/review-demo.mp4` at 00:01:10. This is footage of the released UI, not the in-development 2.0 interaction. Replace it with a new capture from a verified 2.0 build before describing 2.0 book opening or page turning as live. The poster comes from the same clip. The 3D book uses `Libros/Libros/Resources/CoverArtwork.xcassets/CoverOcean.imageset/cover-ocean.png` as its artwork source.

The bezel source is Apple's **Bezel-iPhone-Duo.dmg** from [Apple Design Resources](https://developer.apple.com/design/resources/), PNG/Star White/Inner Open Landscape. Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) prohibit 3D simulations or animation of Apple hardware, which is why only the book is modeled and the Duo bezel remains static. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
