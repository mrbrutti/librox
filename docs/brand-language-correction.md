# Cover and brand correction - October 22, 2026

## Corrected brief

The user asked for the app's **3D cover design**, preserving the original
catalog artwork. The earlier illustrative shelf misread that request. The
subsequent direction also called out unrelated floating type, the wrong logo,
and the absence of a consistent visual language.

Reading this as a consumer reading-app website for readers, with the native
app's tactile, literary language: paper, ink, bookmark and bound books.
Taste dials: variance 7, motion 6, density 3. Routes, product facts, legal content,
store URLs, original app footage and catalog functionality stay intact.

## Shared visual decisions

- Actual primary app icon in every header/footer, favicon and touch icon.
  Source: `Libros/Resources/Assets.xcassets/AppIcon.appiconset/icon-librox-bookmark-1024.png`.
  The web copies are resizes, with no redrawing or recoloring.
- Source Serif 4 at 600 for headings, wordmark, book names and 3D lettering.
  Native UI uses Apple's system serif; this is the web counterpart, not that
  proprietary font. Body and controls use the platform sans, as the app does.
- Native paper, ink, night, ivory and vermilion values. Display tracking follows
  `LibrosStyle.serifTracking`: -0.014em. Shared controls use the native 12px role.
- Continuous film atmosphere through the homepage footer. No paper-colored
  section interrupts its dark scene. Subpages keep native reading appearances.
- Original jackets remain complete. No generated plates cover them or replace
  them. Missing artwork gets a plain cloth title board.

## Emil review

| Before | After | Why |
| --- | --- | --- |
| Suggested books carried substitute engraving plates | Locally served, unchanged Standard Ebooks jackets | Preserve the edition's artwork as requested |
| Nearly planar cover with an offset paper strip | Independent front/back/spine and three paper surfaces in CSS 3D | Make physical thickness visible at rest and during hover |
| Generic website L monogram | Actual native bookmark icon | Establish the same product identity everywhere |
| Thin display face, tight tracking, geometric interface text | One sturdy serif, native tracking, system-sans controls | Match the app's hierarchy and type roles |
| Metallic text edges and independent sinusoidal drift | Shallow matte paper lettering, steady baseline, scene-driven depth | Tie the letters to the same physical/material language |
| Homepage changed to a separate paper surface below the film | One continuous atmosphere through download and footer | Maintain visual continuity |
| Browser chrome kept an old hardcoded background | Theme color reads the active surface token | Keep surrounding browser UI consistent |
| Thumbnail-sized OPDS art on large books | Full original OPDS image where supplied | Preserve jacket detail on high-density displays |

Cover hover is interruptible, 280ms and fine-pointer-only. Reduced motion
retains the static 3D angle without moving on hover or press. The CSS fallback
for cinematic type also has no independent oscillation.

## Impeccable review

Applied the polish playbook and craft floor; reviewed the previous context
and actual native references. One manual detector scan returned 78 advisories
and one font warning against the previous DESIGN.md. The warning identified
Source Serif 4 as undeclared. The explicit new identity is now documented in
DESIGN.md, including this face and its native-web distinction. Material colors,
book proportions and shape-specific surfaces are scoped to actual books.
No global ignores or suppressions were added. No second detector scan is claimed.

## Verification

- `npm run build`, metadata escaping checks, syntax checks and `git diff --check`.
- Six pages, 136 local asset/fragment references: no missing files or anchors,
  duplicate IDs, or missing app marks. Inline homepage CSS matches its sources.
- Desktop 1280x800, tablet 820x1180 and phone 390x844 rendered checks.
- Three original arrival jackets loaded at their source resolution. Verified
  3D transform/preserve-3d state and separate 23px page depth at 200px width.
- Real Standard Ebooks Pride and Prejudice search returned the original 1400px
  cover; full-image loading completed with no broken image and no phone overflow.
- Paper and Dark appearances checked. Phone Plus uses the same icon and type.
- Homepage source-serif dimensional type compiled in its worker and rendered
  during the reading scene. Observed browser console had no warnings or errors.
- Original films, device geometry and native screen recordings are unchanged.

These checks use the desktop browser with responsive viewport dimensions.
They do not claim physical iPhone/iPad acceptance, exhaustive Safari rendering,
a native import run, or a new app release. A live publication check follows
merging. Public prices, Plus's coming-soon status and established contact details
are unchanged.
