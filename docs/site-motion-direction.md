# Librox studio direction · October 22, 2026

## Reference and mechanism

The [TypeDraw film](https://www.youtube.com/watch?v=jdVAIoRcYqM) demonstrates the
physical object: fold, open, move close to the page, then settle. The earlier
static-bezel slideshow did not satisfy the brief. The active implementation is
now an actual Cycles scene with a modeled hinge, rounded metal and glass,
ray-traced shadows and reflections, moving camera, and native app footage on
the screen. It is an original device study, not official Apple geometry.

## Current page

The newest direction follows [Poly](https://poly.app/),
[25 Residences](https://25residences.com/), and
[Unseen's Organimo project](https://unseen.co/projects/organimo/): imagery,
camera movement, and typography occupy one composition. The user rejected
films presented as separate rounded cards.

1. A full-screen, 22-second scene: unfold → native Metal book opening →
   native page turn → listening colors → close. Oversized Librox / One more
   page / Listen typography follows the footage and crosses its physical depth.
2. A second full-screen, automatic 24-second iPad/Mac scene. The devices remain
   fully framed; the studio edges blend into the surrounding background.
   Get lost / Drift away / Stay a while changes with reading and listening.
3. A compact download and feature-only Plus invitation, plus links to catalog
   search, privacy, support, and terms. No new public prices.

Both scenes have separate wide/portrait cameras. The hero uses its actual
stage aspect ratio; the family uses viewport width. Playback is muted by
default, pauses offscreen and in background tabs, and is off by default for
reduced-motion visitors. Visitors can pause, seek chapters, or enable audio.
There is no scroll locking, scroll-duration padding, or intro loader.

## Typography shares the scene

`film/blender/export_silhouettes.py` projects the original device geometry
through the original animated cameras. It does not change or rerender the
approved movies. Separate contours preserve the folding leaves, Mac base,
and moving lid. A subpixel simplification keeps the JSON compact.

`film/blender/export_spatial.py` adds the animated camera matrices and device
meshes to those manifests. `scene-type.js` renders extruded Newsreader geometry
against colorless device solids using the original camera. This permits real
front/back intersections rather than concealing the whole word behind the film.
Beveled edges, directional light and restrained green-tinted contact shadows
give the type physical depth. Reading close-ups shift the lettering toward
deep green ink so it remains legible over paper.

`scene-depth.js` loads only the needed camera geometry (family assets load
when that film starts loading). It synchronizes to decoded frames using
`requestVideoFrameCallback`, with a requestAnimationFrame fallback. Geometry
is reprojected for the browser's actual crop and placement. Typography fades
and counter-moves on the video clock, so pausing also pauses its choreography.
The player reveals a decoded frame before its depth listeners run, including
paused seeking and wide/portrait source changes. The SVG silhouette still
protects device opacity when feathering the family film's studio background.
If WebGL or geometry fails, readable HTML type, headings, film, posters, links
and controls remain. The 3D module is deferred, pixel ratio is capped at 1.5,
and there is no independent idle animation loop.

First-frame WebP posters match the fallback geometry. Existing MP4 film bytes
remain unchanged. Controls and navigation use 44px targets. Newsreader makes
the large lettering book-like; Manrope keeps the controls clear. Opening
copy sits clear of the giant lettering and controls. All decorative duplicate type is hidden from assistive
technology. Meaningful headings and media descriptions remain in the document.

The closing section and subpages use the native app's neutral paper/dark
surfaces and vermilion accents. Website appearance follows the system unless
the visitor chooses Paper, E-ink, or Dark; the preference stays in page memory.
The scene's photographic colors stay consistent across those appearances.

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

## Earlier October 22 validation (before integrated-motion revision)

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

## Integrated-motion revision validation

The production build, JavaScript syntax, and whitespace checks pass. Static
validation covers six pages and 125 local asset/fragment references, the contact
address, absence of public prices, and all 2,760 projected frames. No existing
MP4 changed. Browser review covers the 1440×900 desktop scene, 390×844 phone,
and an actual 320×568 viewport, including automatic playback, pause/seek,
mobile menu, poster loading, matching masks, and no horizontal overflow.
The geometry masks also protect the opaque device while feathering only its
surrounding studio background, avoiding a rectangular film edge on mobile.
Available browser logs contain no errors or warnings. Reduced-motion behavior
is source-verified; physical-device and preference-emulation checks were not run.
