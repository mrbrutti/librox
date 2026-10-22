# Librox studio direction · October 22, 2026

## Reference and mechanism

The [TypeDraw film](https://www.youtube.com/watch?v=jdVAIoRcYqM) demonstrates the
physical object: fold, open, move close to the page, then settle. The earlier
static-bezel slideshow did not satisfy the brief. The active implementation is
now an actual Cycles scene with a modeled hinge, rounded metal and glass,
ray-traced shadows and reflections, moving camera, and native app footage on
the screen. It is an original device study, not official Apple geometry.

## Current page

1. A persistent product headline and App Store action beside a 22-second product film. Unfold → native Metal book opening →
   native page turn → listening colors → close. No scroll locking.
2. One compact, automatic 24-second family film: modeled iPad and Mac, native
   reading/page curls and live listening footage. Device handoffs use opaque
   lateral movement and the Mac's physical hinge; app screens dissolve softly.
3. A download and proposed Plus membership, then privacy/support/terms links.
   Catalog search has its own page, `books.html`.

The film has separate wide and portrait cameras. Source selection considers
the actual media-stage aspect ratio for the hero and viewport width for the
family film, keeping each composition appropriate to its available space. All motion can be paused, stops offscreen and in background tabs, and
is off by default for reduced-motion visitors. Audio is always opt-in.

## Visual system

Neutral paper and neutral dark surfaces follow the native Librox 2.0 design
contract. Green stays within the cover-driven studio films. Newsreader gives
the headings a book-like character; Manrope keeps controls clear. Vermilion
marks selection and playback progress. Headlines remain visible throughout
the films. All playback and navigation controls have at least 44px targets.

The site follows system appearance until the visitor selects Paper, E-ink,
or Dark. The choice stays in page memory only. Header, footer, reading measure,
and surface treatment are shared across all six pages. There is no scroll
locking, hidden-on-scroll copy, decorative chapter numbering, or artificial
CSS book spine. The original film media bytes remain unchanged in this pass.

## Sources and reproducibility

[Blender source and capture provenance](../film/blender/README.md).
The former Remotion edit is retained as an inactive static-bezel alternative.
Self-hosted Newsreader and Manrope ship with their OFL licenses in `assets/fonts/`.

[Figma layout reference](https://www.figma.com/design/aCzdbt0zp1SospUlwLLKDL?node-id=1-2)
contains the preceding layout. The connected Starter account reached its MCP
limit during the earlier design pass; it is not a synchronized version of this
Blender redesign. Browser captures and source are the current visual evidence.

## Publication and media identity

The user authorized shipping the original studio films on October 19, 2026.
They use no Apple logo or official artwork as geometry, and are not labeled as
approved Apple hardware. Publication is not Apple marketing approval. Retained
official static bezels remain unmodified and retain their separate usage rules.

The Duo hero's library/listening content remains a design preview with fixture
transport. Its native opening is a Metal simulator study. The family film uses
native iPad and Mac reading and live listening captures from development builds.
See [family provenance](../film/blender/FAMILY.md). No physical Duo was filmed.
No paid generation was submitted.
Plus remains an upcoming membership with features only and no live purchase.
Public pages show no price amounts. Existing catalog
access stays free. See the separate Plus page for the proposed listening benefits.

## Supporting material asset

`assets/librox-paper-detail.webp` is a decorative paper-and-bookmark image
generated with the built-in image-generation tool on October 22, 2026, then
encoded as WebP with cwebp at quality 85. It is not an app capture or hardware
claim. Direction: photorealistic ivory paper leaves curling upward, a narrow
vermilion cloth bookmark, soft studio light, visible paper fibers and precise
fore-edges, restrained contact shadows, no text, cover, logo, or device, 3:2
composition with negative space on the left.

Interface glyphs are Phosphor Icons 2.1.1 regular SVGs, vendored under
`assets/icons/` with their MIT license. The Librox wordmark and Apple App Store
badge remain separate brand assets.

## October 22 validation

The production build and JavaScript syntax checks pass. A static audit checked
all six pages, HTML nesting, unique IDs, 139 local references, fragment targets,
and CSS asset paths. Privacy, terms, and support paragraphs match the previous
published version. Browser checks cover 1440px desktop and 390px/320px phone layouts, appearance
controls, menu/Escape behavior, real video decoding, offscreen pause, and
paused scene seeking. Standard Ebooks returned a real Pride and Prejudice
result with its cover; Gutendex timed out, and the direct-catalog fallback
appeared. A subsequent all-source search returned four genuine results from
both catalogs after Gutendex recovered. Available results are appended without
waiting for the slower source, preserving already visible result links.

These are local browser checks, not physical-device acceptance or a
Lighthouse score. Reduced-motion handling is retained in the source; the
available browser interface does not expose media-preference emulation.
