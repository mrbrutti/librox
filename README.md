# Librox website

Static GitHub Pages site for librox.app. The iPhone Duo stage places Librox 2.0 design captures within Apple's official static iPhone Duo bezel. The bezel is used as provided by Apple; only the screen content changes. The page labels the visuals as a design preview, and the App Store link points to the currently available app.

## Local preview

```sh
python3 -m http.server 8767
```

## Build the Duo stage

```sh
npm ci
npm run build
```

Commit `duo-stage.bundle.js` with any changes to `duo-stage.js`, since GitHub Pages serves the committed static files directly. The bezel source is Apple's **Bezel-iPhone-Duo.dmg** from [Apple Design Resources](https://developer.apple.com/design/resources/), PNG/Star White/Inner Open Landscape. Preserve the original PNG bytes and review [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) before changing device imagery.
