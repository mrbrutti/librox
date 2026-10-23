# Librox website

Static site for librox.app. The homepage opens with a 22-second
Blender Cycles product film: a folding-device study opens, shows Librox's native
Metal book opening and iPad page turns, moves into the listening preview, then
closes. Oversized 3D typography crosses behind and in front of the device in a full-screen scene. Wide
and portrait camera compositions adapt to the media stage. Playback
starts muted, has pause and sound controls, and respects reduced motion.

A second full-screen scene automatically plays the 24-second 3D iPad/Mac film
with native page turns, reading and live narration captures. Typography changes
with the film and shares the devices' depth, lighting and perspective. A compact
download and Plus section follows. Book search is on `books.html`; Privacy, Terms and Support
remain separate pages. The user authorized publication of these original
studio studies on October 19, 2026. Capture and model provenance is recorded in the film documentation. Public
pages use customer-facing copy, as requested for publication.

The dedicated `plus.html` page introduces the upcoming offline voice library, listening queue, and per-book listening profiles. It does not display a price or offer a live purchase; options and pricing belong in the app before subscribing. Core owned-book reading, existing listening, notes, sync, and arbitrary OPDS catalog access stay free. Reconcile every paid benefit, device requirement, localized price, and renewal statement with the actual StoreKit product and reviewed app build before launch.

## App Store information pages

- `plus.html` introduces upcoming Plus features and explains which features remain free. Public pages omit price amounts; the app will present purchase details.
- `privacy.html` is the public Privacy Policy URL; its claims must match the App Store Connect privacy questionnaire and the shipped app's network behavior.
- `support.html` provides direct contact information for the required Support URL.
- `terms.html` links to Apple's Standard EULA and explains the status of the proposed Plus plan. Apple requires Privacy Policy and Terms links in the app and App Store metadata when subscriptions are offered; the website links alone do not complete that work.
- The Marketing URL can point to the homepage. A custom domain is useful for Librox's identity but is not itself an App Store requirement.

Before Plus can be sold, implement and verify StoreKit purchase, restore, cancellation/expiry handling, entitlement across supported Apple devices, a clear in-app annual renewal disclosure, and final terms/privacy links. Configure the product and price in App Store Connect. See [Apple's subscription guidance](https://developer.apple.com/app-store/subscriptions/), [privacy metadata](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy), and [platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information).

The [site motion direction](docs/site-motion-direction.md) records the film sequence, asset provenance, Apple device-artwork boundaries, and Figma review. See [film/README.md](film/README.md) for the active Blender render and the retained earlier Remotion study.

## Visual system

The October 22 integrated-motion pass uses self-hosted Newsreader/Manrope
typography across full-screen, book-driven studio scenes. The closing download
section and subpages retain the app's neutral paper/dark surfaces and vermilion
accents. Responsive controls, shared subpage layouts,
and the decorative privacy material asset are documented in
[site motion direction](docs/site-motion-direction.md). The original approved
3D films and real app captures are retained byte-for-byte. Frame-exact projected
geometry in `assets/motion/` supplies camera poses and colorless device meshes for
the lazy-loaded Three.js lettering in `scene-type.js`. `scene-depth.js` synchronizes
it to decoded video frames. HTML lettering remains available if WebGL cannot load.
There is no scroll locking or mandatory intro loader.

## Local preview

```sh
npm run dev
```

The preview server supports byte ranges for reliable film seeking and binds
only to localhost. Raw captures and other dotfiles are not served.

## Build the website playback controls

```sh
npm ci
npm run build
```

Commit `experience.bundle.js`, `scene-type.bundle.js` and `scene-type-worker.bundle.js` with their sources,
since GitHub Pages serves committed static files directly. The build hashes
the deferred 3D module and local assets to prevent mixed deployment versions.
The tiny scene client transfers its canvas to a worker, keeping Three.js setup,
triangulation and rendering off the page's main thread. Browsers without worker
WebGL retain readable HTML lettering and the native app films.
The build also synchronizes the homepage's inline styles from `librox.css`
and `experience.css`; edit those sources, not the generated style block.

The Books page loads `books.css` and `books.bundle.js` separately. Commit the
bundle with `books.js` and `book-cover.mjs`. The same build fills the marked
suggested-books block in `books.html` from `suggestedMarkup()`; edit its source
in `book-cover.mjs`, not the generated cover markup. The original catalog artwork and
material provenance are recorded in `assets/covers/README.md`. See
[the catalog craft review](docs/catalog-craft-review.md) for the earlier pass, and [the identity correction](docs/brand-language-correction.md)
for the current shared visual language. `node scripts/check-covers.mjs` verifies the untrusted-metadata
escaping and URL boundaries used by the cover renderer.

See [the Blender film README](film/blender/README.md) for exact media provenance,
render settings, camera timing and capture limitations. Native footage comes
from development simulators and a Catalyst build, not physical-device acceptance.
See [the family-film guide](film/blender/FAMILY.md) for iPad/Mac source, native
listening captures, device proportions and playback timing.
The old Remotion compositions and official static Duo-bezel source remain
available but are no longer loaded by the homepage.

The iPhone Reading image `assets/iphone-reading-home.webp` comes from `docs/librox-2.0/reviews/edge-navigation/iphone-reading-compact.png` in Libros. It is a real iPhone 17 Pro simulator capture of the Librox Design Lab with the illustrated Moby-Dick cover in the app's Reading view. The capture uses sample books and is a design study, not a claim that the navigation has shipped.

The reading-theme iPhone image `assets/iphone-reader.webp` comes from `docs/appstore/screenshots/iphone-6.9/03-page-settings.png` in Libros. It shows the page controls over the full Moby-Dick book instead of the old excerpt fixture.

The Duo listening image `assets/duo-listening.webp` comes from `docs/librox-2.0/reviews/native/listening-landscape.png` in Libros. That 951 × 669 point SwiftUI content render uses the illustrated Moby-Dick cover beside a reading page. Its transport is a fixture with no audio engine attached. The green iPhone listening image `assets/iphone-listening-concept.webp` comes from `docs/librox-2.0/cover-atmosphere-study/listening-concept.png` in Libros. Both are design studies rather than recordings or shipped app views, and their provenance remains recorded here.

The bezel sources are Apple's **Bezel-iPhone-17.dmg** (PNG/iPhone 17 Pro/Deep Blue/Portrait) and **Bezel-iPhone-Duo.dmg** (PNG/Star White/Inner Open Landscape), both from [Apple Design Resources](https://developer.apple.com/design/resources/). Preserve the original PNG bytes. The App Store badge is Apple's unmodified English black SVG. [Apple's marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/) require official static device artwork for this usage and prohibit simulated 3D or spinning Apple devices. The provided Sketchfab Duo models are visual references only; the local 3D film uses original parametric geometry, not Apple-supplied artwork. The user authorized publication of the original studio studies; this is not Apple marketing approval. The download link uses one country-neutral product ID; the public Mac listing is an iPad app compatible with Apple silicon, not a verified native Mac release.
