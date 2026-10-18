# Librox website

Static GitHub Pages site for librox.app. The Duo stage uses real Librox 2.0 design captures mapped onto a locally rendered 3D device. The page labels those visuals as a design preview; the App Store link points to the currently available app.

## Local preview

```sh
python3 -m http.server 8767
```

## Build the Duo stage

```sh
npm ci
npm run build
```

Commit `duo-stage.bundle.js` with any changes to `duo-stage.js`, since GitHub Pages serves the committed static files directly. Three.js is bundled locally, so the published page does not fetch it from a CDN. Its license is in `third-party/three-LICENSE.txt`.
