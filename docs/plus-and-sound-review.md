# Plus plans and ambient sound — October 22, 2026

## Product scope

The owner requested Free/Plus comparison and USD launch prices of $0.99 monthly,
$9.99 yearly and $49.99 Lifetime. Lifetime is a one-time purchase, with the same
Plus feature set. The page keeps Plus explicitly coming soon.

Feature copy was reconciled against the current native app worktree's
`LibrosKit/Sources/LibrosCore/PlusFeature.swift`, `Libros/Sources/LibroxPlusView.swift`,
`docs/plus/implementation.md` and `docs/plus/integration-130.md`:

- Free: 10 imported books, one custom OPDS catalog, Basic/System listening,
  reading essentials and two classic icons.
- Plus: unlimited books/catalogs, paced reading, Enhanced on-device narration,
  and the complete icon collection.
- Existing books and reading data remain available after expiry; limits apply
  when adding books and catalogs.

The annual app implementation and unsubmitted App Store Connect product exist.
Monthly and Lifetime still need app and store support. This website update does
not release or configure purchases, and no native source was changed.

## Craft pass

Applied design-taste-frontend, Emil design engineering and Impeccable guidance
to the Plus page. Kept the app icon, Source Serif 4, system controls, paper/night
surfaces and bookmark accent. Pricing is a single ledger, followed by a semantic
comparison table and native disclosure controls. No checkout or misleading
purchase button is shown.

The Impeccable detector reported small comparison text; the secondary mobile
text is now 12 px. Its details-padding warning was checked against the 19 px
summary padding and minimum 60 px target. Type/color/radius advisories were
reviewed against the existing shared identity instead of adding unrelated styles.

## Sound

The sound implementation described below was superseded by the owner's
audio-only correction. Current sources, sparse nature arrangement, paper foley
and continuous-loop behavior are documented in `film/audio/README.md`.

Replaced the previous soundtrack with original, seeded ambient synthesis and
small paper/fold gestures. No narration is included. Sound follows the film's
own clock and is enabled only through a sound-button gesture. Shared controls
mute both scenes; the nearest visible scene receives the mix through a short
gain fade. See [sound sources, levels and reproduction](../film/audio/README.md).

## Verification

- `npm run build`, `node --check experience.js` and `git diff --check` pass.
- Checked 138 local HTML asset/link references with no missing files.
- All four film H.264 stream hashes match the pre-change main branch. Only
  audio/container bytes changed. AAC tracks are stereo, 48 kHz, and match the
  22-second studio / 24-second family video durations.
- Desktop and 390 px mobile Plus views inspected in the browser. Checked 320 px
  and 820 px widths without horizontal overflow; all three prices and comparison
  content are present. Compare anchor and keyboard FAQ expansion were exercised.
- Homepage sound starts muted. Opt-in, shared mute state, offscreen pause,
  scene handover, chapter seek and pause/resume were exercised. Sound controls
  fit at 320 px. Browser console had no errors or warnings in the final run.
- Local evidence is under ignored `.local/review/plus-pricing/`.

These are desktop WebKit checks with responsive viewport sizes, plus source and
media analysis. They are not physical iPhone/iPad speaker checks, approval of the
sound by the owner, or App Store purchase acceptance.
